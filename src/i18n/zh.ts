export const zh = {
  meta: {
    title: 'Sub2API',
    description: '把订阅账号变成统一 AI 接口的自建网关',
  },
  nav: {
    docs: '文档',
    plaza: '模型广场',
    topup: '充值',
    login: '登录',
    register: '注册',
    console: '控制台',
    theme: '切换外观',
    lang: '切换语言',
    menu: '菜单',
    close: '关闭',
  },
  hero: {
    // Split on purpose: a single string lets the browser break inside 变成.
    titleLines: ['把订阅额度', '变成一把 API Key'],
    lead: '把 Claude Code、Codex、Gemini CLI 这类订阅账号接入同一个网关，对外提供 OpenAI、Anthropic 与 Gemini 兼容接口。客户端只需要改一个 Base URL。',
    ctaPrimary: '获取 API Key',
    ctaSecondary: '查看接入文档',
    statusConnecting: '正在识别实例',
    statusLive: '已连接',
    statusDetected: '已识别实例',
    statusPreview: '预览模式',
    statusPreviewHint: '未检测到 Sub2API 实例，当前为静态展示。',
    endpointLabel: '网关地址',
    endpointCopy: '复制',
    endpointCopied: '已复制',
    altCopy: '复制该接入地址',
  },
  protocol: {
    title: '一个端口，三种协议',
    lead: '按客户端的习惯选择协议，网关会自动路由到对应的上游账号池。',
    items: [
      {
        name: 'OpenAI 兼容',
        path: '/v1/chat/completions',
        note: 'Chat Completions、Responses、Embeddings，以及图片、语音与视频接口。',
      },
      {
        name: 'Anthropic 兼容',
        path: '/v1/messages',
        note: 'Messages 与 count_tokens，Claude Code 可以直接接入。',
      },
      {
        name: 'Gemini 兼容',
        path: '/v1beta/models',
        note: 'generateContent 与缓存内容接口，保持原生请求结构。',
      },
    ],
  },
  capabilities: {
    title: '网关之外，它还是一套运营后台',
    lead: '账号、密钥、额度、账单和监控在同一个控制台里闭环。',
    items: [
      {
        title: '账号池与调度',
        body: '上游账号分组管理，加权轮询、粘性会话与故障自动切换。',
      },
      {
        title: '密钥与分组',
        body: '每个 Key 绑定分组、额度与并发上限，按 Key 独立计量和限流。',
      },
      {
        title: '用量与账单',
        body: 'Token 用量、余额、订阅套餐与在线支付集中结算。',
      },
      {
        title: '渠道监控',
        body: '实时探活上游渠道，延迟与成功率异常会立刻暴露。',
      },
      {
        title: '模型广场',
        body: '对外公开模型目录，随分组与渠道配置自动同步。',
      },
      {
        title: '多种登录方式',
        body: 'LinuxDo、GitHub、Google、微信、OIDC 与 Passkey 均可接入。',
      },
    ],
    mechanisms: [
      { term: '加权轮询', value: '按权重分配并发' },
      { term: '粘性会话', value: '同一会话固定上游' },
      { term: '故障切换', value: '异常账号自动摘除' },
    ],
  },
  flow: {
    title: '三步接入',
    lead: '整个过程不需要改动任何业务代码。',
    steps: [
      {
        title: '绑定上游账号',
        body: '在后台添加 Claude Code、Codex 或 Gemini 账号，或者直接填入上游 API Key。',
      },
      {
        title: '创建 API Key',
        body: '选择分组与额度上限，生成一个以 sk- 开头的密钥。',
      },
      {
        title: '替换 Base URL',
        body: '把客户端指向本实例，模型名和其余配置保持原样。',
      },
    ],
  },
  quickstart: {
    title: '复制即可运行',
    lead: '示例中的主机名会自动替换为当前实例地址。',
    tabs: ['cURL', 'Claude Code', 'Codex CLI', 'Gemini CLI'],
    note: '把 sk-your-key 换成你自己的密钥。',
  },
  upstreams: {
    title: '支持的上游平台',
    lead: '同一套网关对接多家订阅账号与官方 API。',
  },
  spec: {
    protocols: '协议族',
    upstreams: '上游平台',
    clients: '接入客户端',
    version: '适配版本',
  },
  cta: {
    title: '现在就把订阅接进来',
    body: '注册后创建第一个密钥，几分钟内完成第一次调用。',
    primary: '创建账号',
    secondary: '阅读文档',
  },
  footer: {
    builtOn: '基于 Sub2API 构建',
    status: '服务状态',
    contact: '联系我们',
    rights: '保留所有权利',
    langNote: '切换语言',
  },
  fallback: {
    brand: 'Sub2API',
    tagline: '统一 AI 接口网关',
  },
}

/** Every locale must satisfy exactly this shape. */
export type Dict = typeof zh
