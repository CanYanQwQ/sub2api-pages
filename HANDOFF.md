# 交接文档 · Sub2API 首页 + 模型价格页

> 写于 2026-10-21。目标读者：接手这个项目的人（或下一个对话里的 AI）。
> 读完这一份就该能直接改代码、部署、排查。设计细节的完整版在 `README.md`（505 行）。

---

## 0. 一句话

给 Sub2API 0.2.17 实例做一个**自定义首页**（通过后台 `home_content` 的 iframe 嵌入），
外加一个**独立的模型价格页**（通过后台「自定义菜单」嵌进实例）。

---

## 1. 两个项目，两个仓库

它们是**两个独立的 Vite 项目、两个独立的 Vercel 项目、两个独立的 GitHub 仓库**。
没有共享代码，没有 workspace，没有 monorepo。

| | 首页 | 价格页 |
| --- | --- | --- |
| 本地目录 | `E:\nas目录\项目\sub2api前端` | `E:\nas目录\项目\模型价格` |
| 仓库 | `github.com/CanYanQwQ/sub2api-pages` | `github.com/CanYanQwQ/models` |
| 线上 | https://pages.zhouwanx.top | https://model.zhouwanx.top |
| 技术栈 | React 19 + TS + Vite 8 + Tailwind 4 | 同上 |
| 数据 | **运行时**从实例 `/api/v1/settings/public` 读 | **硬编码**在 `src/data/catalog.ts` |
| 当前 HEAD | `f547b47` | `ffb1063`（tag `v1.0.0`） |
| 交接文档 | 本文件 | `模型价格/HANDOFF.md` |

```
                  ┌─────────────────────────────────────────┐
   访客 ──────────▶│ ai.zhouwanx.top  (Sub2API 0.2.17)        │
                  │                                         │
                  │  /                 → HomeView           │
                  │      └─ iframe ────▶ pages.zhouwanx.top  │  ← 首页（本仓库）
                  │                                         │
                  │  自定义菜单「模型价格」                   │
                  │      └─ iframe ────▶ model.zhouwanx.top  │  ← 价格页（models 仓库）
                  │                                         │
                  │  /model-plaza      → 官方模型广场（未使用）│
                  └─────────────────────────────────────────┘
```

> 价格页曾经想做成「首页里的一个浮层」（iframe 套 iframe），做了、验了、也上线过，
> 后来**整体回退**（提交 `da7d815`）。现在是普通外链，新标签打开。原因见第 8 节。

---

## 2. 三十秒上手

```bash
# 首页
cd "E:/nas目录/项目/sub2api前端"
npm ci
npm run dev          # http://127.0.0.1:5173
npm run build        # tsc --noEmit && vite build → dist/
npm run preview      # http://127.0.0.1:4173（验产物）

# 价格页
cd "E:/nas目录/项目/模型价格"
npm ci
npm run dev          # 5173（两个别同时开）
npm run build
npm run preview      # http://127.0.0.1:4190
npm run fonts        # 改了中文文案后必须重跑，见第 7 节
```

**预览时怎么模拟「被 iframe 嵌住」**：直接开页面会走「预览模式」（无实例数据）。
想看成真实形态，加查询参数指一个实例：

```
http://127.0.0.1:5173/?api=https://ai.zhouwanx.top&theme=light&lang=zh
```

`?api=` 会让页面去拉那个实例的公开设置（跨域，实例默认允许），于是站名、logo、版本、
导航、网关地址全部变成真实值。**这是本地调试最常用的手法。**

---

## 3. 部署

两个 Vercel 项目，都是从各自仓库导入，**根目录就是仓库根目录**。

| 项 | 值 |
| --- | --- |
| Framework Preset | Vite（自动识别） |
| Root Directory | `./` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm ci` |
| 环境变量 | 首页可选（见 `.env.example`），价格页无 |

首页仓库里 `vercel.json` 已固定这些值，还带了三条安全头（`X-Content-Type-Options`、
`Referrer-Policy`、`/assets/*` 长缓存）。**不要删 `Referrer-Policy`**——首页靠
`document.referrer` 反推实例 origin，设成 `no-referrer` 会让它退化成常量。

推 `main` 即自动部署，约 40–60 秒。验证：

```bash
curl -s https://pages.zhouwanx.top/ | head -c 200
```

---

## 4. 与 Sub2API 0.2.17 的对接契约（**改坏这里整个页面就废了**）

以下每条都在 0.2.17 源码或线上实测里核对过，不是推测。

### 4.1 首页是怎么被嵌进来的

- 后台「系统设置 → 站点设置 → 首页内容」(`home_content`) 填 `https://pages.zhouwanx.top`。
- `frontend/src/views/HomeView.vue` 判断 `home_content` 是 http(s) URL 时，**整页替换成一个
  `<iframe>`**，高度撑满视口。不是把内容抓下来渲染，是真的 iframe。
- 所以首页的**视口高度 = 实例给 iframe 的高度**，不要做 `position: fixed` 的整页布局。

### 4.2 父站不能被嵌，只能嵌别人

实例响应头带 `X-Frame-Options: DENY` 和 CSP `frame-ancestors 'self'`。
**反向不成立**：首页可以随便嵌别人，因为 CSP 逐文档生效。

### 4.3 CSP 白名单由 `home_content` 推导

0.2.17 的 `GetFrameSrcOrigins()` 从 `home_content`（以及自定义菜单项 URL）里提取 origin，
拼成 `Content-Security-Policy: frame-src 'self' <那些 origin>`。
所以：

- 换首页域名 → 后台 `home_content` **必须同步改**，否则 iframe 被 CSP 拦。
- 想在首页里再嵌第三个域名 → 那个域名得先出现在 `home_content` 或某个自定义菜单项里。

### 4.4 读的是哪个接口

`GET <实例>/api/v1/settings/public`，匿名可读，响应头 `Access-Control-Allow-Origin: *`。
`src/lib/instance.ts` 里 `PublicSettings` 列出了全部消费字段，实际用到的是：

| 字段 | 用途 |
| --- | --- |
| `site_name` | 站名（覆盖 `VITE_SITE_NAME`） |
| `site_logo` | 左上角 logo，可以是 data URI 或相对路径，见 `resolveSiteLogo()` |
| `site_subtitle` | 写进 `<meta name="description">` |
| `api_base_url` | 网关地址（显示 + 一键复制），空则用 `document.referrer` 的 origin |
| `version` | 状态胶囊里的 `v0.2.17` |
| `registration_enabled` | 决定右上角显示「登录」还是「登录 + 注册」 |
| `model_plaza_enabled` | 决定导航里「模型广场」显不显示 |
| `payment_enabled` / `subscription_enabled` | 决定导航里「充值」显不显示 |
| `custom_menu_items` | 后台自定义菜单，会被追加进导航 |
| `custom_endpoints` | Hero 里网关地址下面那些小 chip |
| `home_content` | 回显，未使用（但可以用来判断是否被正确嵌入） |

### 4.5 三个「显不显示」的判定，都写在一处

`src/lib/instance.ts`：

- `plazaVisibility(settings, resolving)` —— 只看 `model_plaza_enabled`。`false` 才隐藏。
- `purchaseVisibility(settings, resolving, mode)` —— **只看 `payment_enabled` 和
  `subscription_enabled` 是否都为 `false`**。`purchase_subscription_enabled` 这个字段
  0.2.17 会返回，但**前端没有任何模块读它**，别拿它做判断（踩过）。
- `resolveSiteLogo()` —— 依次试 `site_logo` → 空。

三者都返回 `'show' | 'hide' | 'pending'`，`pending` 时导航项渲染成 `invisible` 占位，
避免设置到货时布局跳动。

### 4.6 iframe 里的三条硬约束

1. **站内链接必须 `target="_top"`**，否则会跳在 iframe 里，用户看到「页面套页面」。
   `TopBar.tsx` 的 `NavItem` 有个 `external` 标志：同源走 `_top`，异源（比如价格页）走 `_blank`。
2. **主题/语言从 URL 来**，读不到父站的 localStorage。实例的
   `frontend/src/utils/embedded-url.ts` 会自动追加 `theme` / `lang` / user id / auth token；
   首页也支持自己用 `?theme=` `?lang=` 覆盖。
3. **没有路由**。刷新永远回首页，浏览器后退会退出 iframe（回到实例的上一页）。
   这是「一个文档里嵌了另一个网站」的固有限制，不是 bug。

---

## 5. 文件地图（首页）

```
├─ index.html              首屏前内联脚本定主题（防闪白），preload 中文字体
├─ vercel.json             部署参数 + 三条安全头
├─ .env.example            所有可选构建期变量，每条都有注释
├─ src/
│  ├─ main.tsx             挂载 + 首屏前预取 settings（避免闪烁，见第 10 节）
│  ├─ App.tsx              装配：TopBar → 6 个 section → Footer
│  ├─ index.css            ★ 设计令牌 + @font-face + 动效 keyframes
│  ├─ lib/
│  │  ├─ config.ts         构建期变量 + URL 参数解析（?api / ?theme / ?lang / ?price …）
│  │  ├─ instance.ts       ★ 拉 settings、缓存、推导 links / logo / 可见性
│  │  ├─ motion.ts         useReveal()：IntersectionObserver + MutationObserver 的入场
│  │  ├─ theme.ts          明暗切换，写 localStorage
│  │  ├─ clipboard.ts      复制（含降级）
│  │  └─ cn.ts             类名拼接
│  ├─ i18n/{zh,en,ja}.ts   三语字典，形状必须完全一致（Dict 类型约束）
│  ├─ i18n/index.tsx       Provider + t() + 语言切换
│  ├─ data/content.ts      ★ 静态内容：协议族、上游平台 15 家、能力清单、接入步骤
│  └─ components/
│     ├─ InstanceContext.ts  把 settings 派生值广播下去
│     ├─ ThemeContext.tsx
│     ├─ layout/TopBar.tsx   ★ 导航的可见性逻辑都在这
│     ├─ layout/Footer.tsx
│     ├─ sections/
│     │  ├─ Hero.tsx               ★ 首屏：标题 + 网关地址 + 规格条 + 右侧示意图
│     │  ├─ RoutingSchematic.tsx   ★ 手画的内联 SVG，连线有逐段绘制动画
│     │  ├─ Protocols.tsx          三列：OpenAI / Anthropic / Gemini 兼容
│     │  ├─ Capabilities.tsx       账号池 + 5 条能力
│     │  ├─ Flow.tsx               三步接入
│     │  ├─ QuickStart.tsx         代码示例（curl / Claude Code / Codex CLI / Gemini CLI）
│     │  └─ Upstreams.tsx          15 家上游平台 3×5 网格
│     └─ ui/{Bits,Button,Copy,Layout,index}
└─ docs/*.jpg              README 用的 4 张截图
```

---

## 6. 设计系统

### 定位

**技术制图 / 工程图纸**：纸白底、墨黑字、单一 teal 强调、1px 发丝线、mono 小注。
刻意避开 AI 设计那五个套路（紫蓝渐变、圆角玻璃卡、居中大标题 + 三列图标卡、
emoji 当图标、满屏阴影）。

### 令牌（`src/index.css`，浅色）

| 令牌 | 值 | 用途 |
| --- | --- | --- |
| `--c-canvas` | `#f1f3f2` | 页面底色（不是纯白） |
| `--c-surface` | `#ffffff` | 卡片/输入框 |
| `--c-ink` | `#0b1213` | 正文 |
| `--c-ink-2` | `#45565a` | 次级正文 |
| `--c-ink-3` | `#5f7174` | 注脚（**已按 4.5:1 调深过，别再调浅**） |
| `--c-line` | `#dce2e0` | 发丝线 |
| `--c-brand` | `#0e8c7f` | 强调色（图标可用，**小字别用**，对比度 3.71 不达标） |
| `--c-brand-ink` | `#0a6f65` | 强调色的小字版本（5.42:1） |
| `--c-signal` | `#a96a12` | 状态点（琥珀） |

深色是 `[data-theme='dark']` 覆盖同一组变量。**全站没有渐变**；阴影只有一个 `shadow-lift`
工具类，只用在手机端下拉菜单那一处，别扩散。

### 字体（三套，各有分工）

| 用途 | 字体 | 来源 |
| --- | --- | --- |
| 标题 + 正文（拉丁） | **Archivo Variable** | `@fontsource-variable/archivo`，随构建打包 |
| 数字 / slug / 代码 | **IBM Plex Mono** | `@fontsource/ibm-plex-mono` |
| **中文标题** | **Sheet Display SC**（Noto Sans SC 子集，600，444 字） | `public/fonts/noto-sans-sc-display-600.woff2` |
| 中文正文 | 系统字体栈 | 不打包 |

**中文正文为什么不做子集**：正文遍布全站、字数不可控，一个子集包不住；标题只有十几个字，
值得为它单独打 88 kB 的包换掉「系统黑体 + 西文字体」的混排感。

### 三条硬规则（README 里有完整版）

1. 数字与标签共用一条网格线，跨卡片对齐。
2. 不用 emoji，图标一律 `lucide-react`，示意图用手写内联 SVG。
3. 中文段落用 `break-keep`（`word-break: keep-all`），否则「每百万」会被拆成「每百 / 万」。

---

## 7. 内容与文案

### 三语字典

`src/i18n/{zh,en,ja}.ts` 三份，形状由 `Dict` 类型强制一致——**改一处必须改三处**，
否则 `tsc` 直接报错（这是故意的）。

### 现在的首屏文案（2026-10-21 改过）

```
一个接口地址
调用所有大模型
```

原文是「把订阅额度 / 变成一把 API Key」——那是 Sub2API 自己的卖点，说给「手里有订阅席位、
想转成 API」的人听。这个实例是**按 token 卖模型**的，访客没有订阅要转，所以换了。
同一轮把 lead 里的「订阅账号接入网关」也换成了真实在卖的模型族（GPT / Claude / DeepSeek / GLM）。

**改文案的连锁反应**：改了中文标题/新增汉字 → 必须重跑字体重建，见第 7.1 节。

### 7.1 中文标题子集（改中文标题后必做）

```bash
python -m pip install fonttools brotli     # 一次性
python scripts/subset-font.py              # 在首页仓库根目录跑
```

- 脚本扫描 `src/` + `index.html` 里的所有 CJK 字符，从 Noto Sans SC 变量字体实例化 600 字重再子集化。
- 当前：**444 字 → 88 kB**。
- 输出 `public/fonts/noto-sans-sc-display-600.woff2`。
- **不重跑的后果**：新字掉回系统字体，同一行里出现两种黑体，粗细和字面都对不上。

验证（可选但推荐）：Playwright 抓 `document.body.innerText`，用 fontTools 读 cmap 比对，
缺字应为空串。

---

## 8. 价格页的关系（另一个仓库）

### 为什么分开

首页是「运行时读实例」，价格页是「硬编码快照」——两者更新节奏完全不同。
分开还让价格页可以独立部署、独立回滚。

### 为什么不用官方模型广场

实例后台有 `model_plaza_enabled` 开关，但**关掉它接口会直接 404**
（`model_plaza_handler.go` 里 `if !rt.Enabled { NotFound }`），
所以「关掉官方广场 + 自己写」等于拿不到实时目录，只能硬编码。
而且官方广场的 UI 无法改（`home_content` 只作用于 `/`）。

### 为什么放弃了「首页里的浮层」

做过一版：首页里点「价格」，用 iframe 浮层盖住整个视口，不新开标签。
技术上可行（CSP 逐文档生效，父站只限制自己创建的 frame），也上线验证过。
放弃原因：**URL 不变、刷新回首页、分享链接无效、后退键要额外劫持**，
本质仍是「一个文档里嵌了另一个网站」。与其维护一套假路由，不如老实开新标签。
（提交 `8b41076` 加，`da7d815` 撤。）

### 怎么更新价格

1. 拉 `https://ai.zhouwanx.top/api/v1/model-plaza`（匿名可读，前提是后台开着模型广场）。
2. 改 `模型价格/src/data/catalog.ts` 里的 `GROUPS`：填**渠道单价**（`5e-6` 这种），
   不要填乘过倍率的结果，渲染时统一乘 `rateMultiplier`。
3. 改 `UPDATED_AT`（页脚会显示）。
4. `npm run fonts`（新模型名里可能有新汉字）→ `npm run build` → 提交推送。

计价口径、倍率可信判定（`rateVerified`）、分档规则，全在 `模型价格/HANDOFF.md` 第 5 节。

---

## 9. 常见任务

| 想做什么 | 改哪里 |
| --- | --- |
| 换站名 / logo | 后台设置，首页自动读；冷启动兜底改 `.env.example` 里的 `VITE_SITE_NAME` |
| 换网关地址显示 | 后台 `api_base_url`，或 URL `?api=` 临时覆盖 |
| 改首屏文案 | `src/i18n/{zh,en,ja}.ts` 的 `hero` 段，然后重跑字体子集 |
| 换价格页地址 | `.env.example` 的 `VITE_PRICING_URL`，或 URL `?price=` |
| 隐藏「充值」入口 | 后台把 `payment_enabled` 和 `subscription_enabled` 都关掉 |
| 加一个导航项 | 后台「自定义菜单」，首页会自动追加（`custom_menu_items`） |
| 改上游平台清单 | `src/data/content.ts` 的 `UPSTREAM_PLATFORMS`（Hero 的计数和 Upstreams 的网格都按数组长度算，不用改文案） |
| 换部署域名 | Vercel 域名 + **后台 `home_content` 必须同步改**（CSP 白名单） |

---

## 10. 已知坑（都是真踩过的）

### 浏览器 / 集成

- **父站 `X-Frame-Options: DENY`**：不能把实例嵌进首页，只能反过来。做双向嵌入是死路。
- **换域名不同步 `home_content`** → iframe 被 CSP 静默拦掉，页面全白，控制台报
  `Framed ... violates ... frame-src`。
- **跨域读 settings 失败时不要报错**：CORS 默认允许，但用户可能改过；失败要优雅降级成
  「预览模式」文案，不能白屏。
- **闪烁**：`settings` 为 `null` 时先渲染兜底值会闪一下。解法是
  `main.tsx` 里 `createRoot` 之前先 `prefetchPublicSettings()`，配合 `localStorage` 缓存
  （key `sub2api-home:public-settings`，7 天），冷启动也能同步拿到上一次的值。

### 构建 / 工具链

- **`tsc --noEmit` 是硬门禁**：`noUnusedLocals` / `noUncheckedIndexedAccess` /
  `verbatimModuleSyntax` 全开，删组件后残留 import 会让 `npm run build` 直接失败。
- **`@font-face` 只写一个 weight 是陷阱**：中文正文会全部按 600 渲染，比旁边的西文 400 粗。
  首页只给标题用子集，所以只有一个 weight，是**有意的**；价格页有两个 weight。
- **Vite root 默认是 cwd 不是 config 所在目录**：在错误的目录跑 `npx vite build --config xxx`
  会把别的项目构建进当前 `dist/`。
- **`vite preview` 会锁住项目目录**：占着 `dist/` 时对父目录 `mv` 报
  `Device or resource busy`。移动/删除目录前先 `taskkill` 掉监听端口的 node 进程。
- **Windows 上 bash 与原生 python 的 `/tmp` 不互通** → 临时文件写 `E:/tmp/...`。
- **控制台是 GBK**，python `print` 中文会乱码 → 要精确文本就写 JSON 文件再读。

### 截图 / 验证

- `page.screenshot({ clip })` 对首屏外元素会报
  `Clipped area is either empty or outside the resulting image` → 用 `el.screenshot()`。
- **动效会被截到一半**：hero 示意图的连线约 1.6 秒画完。截图前
  `waitForTimeout(2400)` + `screenshot({ animations: 'disabled' })`。
- iframe 里动画未稳定时截出来会像「两层半透明叠加」——先等，别怀疑 CSS。

### 编辑工具

- `write` / `edit` 报 `file changed since it was read — re-read the file, then retry`：
  先 `read` 该文件 2–5 行再写。同一文件连续改多轮时，**每轮都要先短读一次**。
- `ops_replace` 的 `pattern` 不解析 `\n` 转义（跨行正则匹配 0 次）→ 多行替换整文件 `write`。

---

## 11. 当前进度

### 已完成

- 首页 6 个 section 全部完成，三语，明暗双主题，390 / 820 / 1440 三档验证通过。
- 与 0.2.17 的对接跑通并线上验证：站名、logo、版本、网关地址、导航、自定义菜单全部跟随实例。
- 首屏闪烁已修（预取 + 缓存 + `pending` 占位）。
- 价格页：5 分组 25 模型，四行分面筛选（平台/分组/倍率/模型名）、按价格排序、
  三列卡片、分组头吸顶、中文子集字体、黑白标记 + favicon。
- 两个仓库都推到 GitHub，CI（首页）跑 typecheck + build。

### 明确放弃 / 已回退

- 官方模型广场 UI 定制（改不了，见第 8 节）。
- 首页里的价格浮层（见第 8 节）。
- 首页的模型目录区块（数据要硬编码，和「跟随后台」冲突，删了）。

### 待定（问过用户，还没答）

1. **「三步接入」第一步仍是运营者视角**——写的是「在后台添加 Claude Code / Codex 账号」，
   普通访客读到这里会以为自己要绑账号。建议改成访客视角（注册 → 充值 → 创建 Key → 换 Base URL）。
2. **页面标题仍叫「模型广场」**（`h1` 和价格页 `<title>`），用户提过是否改成「模型价格」。

### 可以但没做

- 价格页没有 LICENSE、没有 CI。
- 价格页数据是快照，后台改价不会自动同步（唯一可行路子是构建时用服务端 token 拉接口，
  但那需要带密钥的构建环境，与「纯静态」冲突）。
- 首页没有自动化测试，验证靠 Playwright 手动跑（脚本在 `E:/tmp/shooter/`，是临时的，
  换机器就没了；需要时按第 10 节的注意事项重写即可）。

---

## 12. Git

### 首页 `sub2api-pages`

```bash
git remote -v
# origin  https://CanYanQwQ@github.com/CanYanQwQ/sub2api-pages.git
# models  https://CanYanQwQ@github.com/CanYanQwQ/models.git   ← 只用于 subtree 推价格页

git status -sb      # ## main...origin/main
```

最近 12 个提交（倒序）：

```
f547b47 feat(copy): lead with the endpoint, not with a subscription
54a3685 feat(home): keep the top nav to instance-owned pages
1d87217 feat(home): drop the docs entry from the top nav
da7d815 revert(home): open the price sheet in its own tab again
33f818e feat(home): drop the pinned price entry from the top bar
ebb4ba1 fix(home): stop painting a focus box on the price trigger and close button
cf91497 fix(home): forward Escape from the sheet and apply the theme on first click
ca4437c fix(home): let Back close the price overlay instead of leaving the site
8b41076 feat(home): open the price sheet in place instead of a new tab
4576854 feat(home): point the hero and nav at the standalone price sheet
baaa9a0 feat(hero): choreograph the boot, and drop the closing card
cb71eb1 refactor(home): drop the model catalogue band
```

### 价格页 `models`

```bash
git status -sb      # ## main...origin/main
git tag -l          # v1.0.0
```

当前 HEAD `ffb1063`，18 个提交，完整列表见 `模型价格/HANDOFF.md` 第 13 节。

> 价格页曾经是首页仓库里的 `plaza/` 子目录，用 `git subtree split` 拆成独立仓库，
> 历史完整保留。**首页仓库里已经没有任何 `plaza/` 代码**，别再去那里找。

### 推送注意

```bash
GCM_INTERACTIVE=never GIT_TERMINAL_PROMPT=0 git push origin main
```

不带这两个环境变量时，Windows 凭据管理器可能静默挂起，命令卡到超时。
远端 URL 必须带用户名（`https://CanYanQwQ@github.com/...`），否则会要求交互式输入用户名。
