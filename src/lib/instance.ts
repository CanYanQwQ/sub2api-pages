/**
 * Everything that talks to a Sub2API 0.2.17 instance.
 *
 * Two hard constraints come from the official implementation and shape this file:
 *
 * 1. The homepage is rendered by Sub2API inside
 *    <iframe src={home_content} className="h-screen w-full border-0" />.
 *    That iframe is same-page but *cross-origin* relative to this deployment,
 *    so the parent origin can only be learned from `document.referrer`
 *    (Sub2API sends `Referrer-Policy: strict-origin-when-cross-origin`, which
 *    gives us the origin without the path — exactly what we need).
 *
 * 2. Sub2API's CORS middleware rejects unknown origins by default
 *    (`cors.allowed_origins` defaults to empty). Public settings therefore load
 *    best-effort and every failure degrades to the static page instead of
 *    breaking it.
 */

export interface PublicSettings {
  site_name?: string
  site_logo?: string
  site_subtitle?: string
  api_base_url?: string
  contact_info?: string
  doc_url?: string
  version?: string
  registration_enabled?: boolean
  model_plaza_enabled?: boolean
  model_plaza_require_auth?: boolean
  subscription_enabled?: boolean
  payment_enabled?: boolean
  /** Returned by 0.2.17 but read by no frontend module — see purchaseVisibility. */
  purchase_subscription_enabled?: boolean
  /** Absolute external URL used instead of the built-in /purchase page. */
  purchase_subscription_url?: string
  /** The URL this page is embedded from — echoed back by 0.2.17. */
  home_content?: string
  compact_home_enabled?: boolean
  custom_menu_items?: Array<{
    id?: string
    label?: string
    url?: string
    visibility?: 'user' | 'admin' | string
    sort_order?: number
  }>
  custom_endpoints?: Array<{ name?: string; endpoint?: string; description?: string }>
}

/** The origin of the page that embedded us, or '' when not embedded. */
export function detectEmbedderOrigin(): string {
  if (typeof window === 'undefined') return ''
  if (window.top === window.self) return ''
  try {
    const referrer = document.referrer
    if (!referrer) return ''
    const origin = new URL(referrer).origin
    return origin === window.location.origin ? '' : origin
  } catch {
    return ''
  }
}

export function isEmbedded(): boolean {
  try {
    return window.top !== window.self
  } catch {
    return true
  }
}

/**
 * GET /api/v1/settings/public — unauthenticated in 0.2.17 and used by Sub2API's
 * own frontend to bootstrap branding before login.
 */
export async function loadPublicSettings(
  base: string,
  timeoutMs = 4000,
): Promise<PublicSettings | null> {
  if (!base) return null
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(`${base}/api/v1/settings/public`, {
      method: 'GET',
      mode: 'cors',
      credentials: 'omit',
      cache: 'no-store',
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    })
    if (!response.ok) return null
    const payload: unknown = await response.json()
    if (!payload || typeof payload !== 'object') return null
    // Sub2API answers either the object directly or wrapped in { code, data }.
    const record = payload as Record<string, unknown>
    const body = (record.data ?? record) as Record<string, unknown>
    return body as PublicSettings
  } catch {
    return null
  } finally {
    window.clearTimeout(timer)
  }
}

export interface InstanceLinks {
  login: string
  register: string
  dashboard: string
  modelPlaza: string
  docs: string
  topup: string
  /** True when the docs link leaves the instance (settings.doc_url or the repo). */
  docsExternal: boolean
}

/**
 * Route table verified against tag v0.2.17
 * (frontend/src/router/index.ts). Notably there is **no** `/docs` route:
 * `doc_url` is an external-link setting only, so the fallback is the project
 * repository rather than a page that would 404 inside the instance.
 */
export function buildLinks(
  base: string,
  settings: PublicSettings | null,
  docsFallback: string,
): InstanceLinks {
  const root = base || ''
  const docUrl = settings?.doc_url?.trim()
  const purchaseUrl = settings?.purchase_subscription_url?.trim()

  return {
    login: `${root}/login`,
    register: `${root}/register`,
    dashboard: `${root}/dashboard`,
    modelPlaza: `${root}/model-plaza`,
    docs: docUrl || docsFallback,
    docsExternal: /^https?:/i.test(docUrl || docsFallback),
    topup: purchaseUrl || `${root}/purchase`,
  }
}

/* ---------------------------------------------------------------------- */
/* Settings cache                                                          */
/* ---------------------------------------------------------------------- */

/**
 * The public settings payload is what turns this page from the shipped
 * defaults into the operator's own site: name, logo, version, nav entries.
 *
 * Reading it costs one network round trip, so painting before it arrives
 * means painting the wrong page and then visibly swapping to the right one —
 * and, worse, dropping nav entries the instance has switched off. Persisting
 * the last good payload lets a reload paint the correct page on the very
 * first frame while the request revalidates in the background.
 */
const CACHE_KEY = 'sub2api-home:public-settings'
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000

interface SettingsCache {
  origin: string
  savedAt: number
  data: PublicSettings
}

/** Last payload seen for this origin, or null when absent/expired/unreadable. */
export function readSettingsCache(base: string): PublicSettings | null {
  if (!base || typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as SettingsCache
    if (parsed?.origin !== base) return null
    if (typeof parsed.savedAt !== 'number' || Date.now() - parsed.savedAt > CACHE_TTL_MS) return null
    if (!parsed.data || typeof parsed.data !== 'object') return null
    return parsed.data
  } catch {
    return null
  }
}

export function writeSettingsCache(base: string, data: PublicSettings): void {
  if (!base || typeof window === 'undefined') return
  try {
    const payload: SettingsCache = { origin: base, savedAt: Date.now(), data }
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(payload))
  } catch {
    // Private mode or a full quota — the cache is an optimisation, never a dependency.
  }
}

/* ---------------------------------------------------------------------- */
/* Single-flight request                                                   */
/* ---------------------------------------------------------------------- */

const inflight = new Map<string, Promise<PublicSettings | null>>()

/**
 * One request per origin per page load. `main.tsx` calls this before React
 * mounts so the fetch overlaps the first render instead of starting after it;
 * `App` then awaits the same promise rather than issuing a duplicate.
 */
export function prefetchPublicSettings(base: string): Promise<PublicSettings | null> {
  if (!base) return Promise.resolve(null)
  const existing = inflight.get(base)
  if (existing) return existing
  const request = loadPublicSettings(base)
  inflight.set(base, request)
  return request
}

/* ---------------------------------------------------------------------- */
/* Conditional nav entries                                                 */
/* ---------------------------------------------------------------------- */

/** `pending` means "not known yet" — the slot is reserved but not painted. */
export type Visibility = 'show' | 'hide' | 'pending'

/**
 * Whether the billing entry (`/purchase`) should appear.
 *
 * Mirrors 0.2.17 exactly. The sidebar entry is declared with
 * `featureFlag: flagPayment` (AppSidebar.vue), and `FeatureFlags.payment` is
 * `{ key: 'payment_enabled', mode: 'opt-out' }` (utils/featureFlags.ts), so only
 * an explicit `payment_enabled === false` removes it. The `/purchase` route
 * guard (`meta.requiresPayment`) applies the same single test and otherwise
 * bounces the visitor back to /dashboard — so hiding it is also what keeps us
 * from linking into a redirect.
 *
 * `purchase_subscription_enabled` deliberately plays no part: the backend
 * documents it as "是否展示购买订阅页面入口" (domain_constants.go:385) but no
 * 0.2.17 frontend module reads it — it only survives as a fixture in
 * stores/__tests__/app.spec.ts. Honouring it here previously hid the entry on
 * instances that had checkout fully enabled.
 */
export function purchaseVisibility(
  settings: PublicSettings | null,
  resolving: boolean,
  mode: 'auto' | 'always' = 'auto',
): Visibility {
  if (mode === 'always') return 'show'
  if (!settings) return resolving ? 'pending' : 'show'
  return settings.payment_enabled === false ? 'hide' : 'show'
}

/** `model_plaza_enabled` is opt-out: only an explicit `false` hides the entry. */
export function plazaVisibility(settings: PublicSettings | null, resolving: boolean): Visibility {
  if (!settings) return resolving ? 'pending' : 'show'
  return settings.model_plaza_enabled === false ? 'hide' : 'show'
}

/** Only user-visible custom menu entries are shown; admin ones need a JWT we never have. */
export function visibleMenuItems(settings: PublicSettings | null) {
  const items = settings?.custom_menu_items
  if (!Array.isArray(items)) return []
  return items
    .filter((item) => item && item.label && item.url && item.visibility !== 'admin')
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
}
