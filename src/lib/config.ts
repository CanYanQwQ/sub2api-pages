/**
 * Runtime configuration.
 *
 * Precedence (highest first):
 *   1. URL query parameters   ?api= &theme= &lang= &site= &docs=
 *   2. window.__SUB2API_HOME__ (optional runtime injection)
 *   3. Build-time VITE_* environment variables
 *   4. Built-in defaults
 *
 * The query-parameter layer is what makes a single Vercel deployment reusable:
 * the Sub2API admin can point `home_content` at
 *   https://your-home.vercel.app/?api=https://api.example.com&theme=auto
 * without rebuilding.
 */

export type ThemeMode = 'light' | 'dark' | 'auto'
export type LangCode = 'zh' | 'en' | 'ja'
/** `auto` follows the instance's own purchase switches; `always` pins the link on. */
export type PricingMode = 'auto' | 'always'

export interface HomeConfig {
  /** Absolute origin of the Sub2API instance, e.g. https://api.example.com. '' when unknown. */
  apiBase: string
  theme: ThemeMode
  lang: LangCode | 'auto'
  /** Fallback brand name, overridden by the instance's site_name setting. */
  siteName: string
  docsUrl: string
  repoUrl: string
  contactUrl: string
  /** When false, no network request is attempted (fully static page). */
  live: boolean
  /**
   * Whether the "pricing" nav entry is gated on the instance's purchase
   * switches. 0.2.17 hides the buy-subscription flow by default
   * (`purchase_subscription_enabled` is a plain bool, so an unconfigured
   * instance reports `false`), which would otherwise hide the entry.
   */
  showPricing: PricingMode
}

export const DEFAULT_REPO_URL = 'https://github.com/Wei-Shaw/sub2api'

function readQuery(): URLSearchParams {
  try {
    return new URLSearchParams(window.location.search)
  } catch {
    return new URLSearchParams()
  }
}

function first(...values: (string | null | undefined)[]): string {
  for (const value of values) {
    if (typeof value === 'string') {
      const trimmed = value.trim()
      if (trimmed) return trimmed
    }
  }
  return ''
}

export function normalizeOrigin(raw: string): string {
  const value = raw.trim()
  if (!value) return ''
  try {
    const url = new URL(value.includes('://') ? value : `https://${value}`)
    return url.origin
  } catch {
    return ''
  }
}

function asTheme(value: string | null | undefined): ThemeMode | '' {
  return value === 'light' || value === 'dark' || value === 'auto' ? value : ''
}

function asLang(value: string | null | undefined): LangCode | 'auto' | '' {
  if (!value) return ''
  const normalized = value.toLowerCase().split(/[-_]/)[0]
  if (normalized === 'zh' || normalized === 'cn') return 'zh'
  if (normalized === 'en') return 'en'
  if (normalized === 'ja' || normalized === 'jp') return 'ja'
  if (normalized === 'auto') return 'auto'
  return ''
}

export function resolveConfig(): HomeConfig {
  const query = readQuery()
  const injected = typeof window !== 'undefined' ? window.__SUB2API_HOME__ : undefined
  const env = import.meta.env

  const apiBase = normalizeOrigin(
    first(
      query.get('api'),
      query.get('base'),
      query.get('sub2api'),
      injected?.apiBase,
      env.VITE_SUB2API_BASE_URL,
    ),
  )

  const docsUrl = first(query.get('docs'), injected?.docsUrl, env.VITE_DOCS_URL)

  return {
    apiBase,
    theme: (asTheme(query.get('theme')) || asTheme(injected?.theme) || 'auto') as ThemeMode,
    lang: (asLang(query.get('lang')) || asLang(injected?.lang) || 'auto') as LangCode | 'auto',
    siteName: first(query.get('site'), injected?.siteName, env.VITE_SITE_NAME, 'Sub2API'),
    // 0.2.17 has no /docs route — doc_url is an external link only. Falling
    // back to the repository is honest; falling back to /docs would 404.
    docsUrl: docsUrl || DEFAULT_REPO_URL,
    repoUrl: first(query.get('repo'), injected?.repoUrl, env.VITE_REPO_URL, DEFAULT_REPO_URL),
    contactUrl: first(query.get('contact'), injected?.contactUrl, env.VITE_CONTACT_URL),
    live: query.get('live') === '0' ? false : (injected?.live ?? true),
    showPricing:
      first(query.get('pricing'), env.VITE_SHOW_PRICING).toLowerCase() === 'always'
        ? 'always'
        : 'auto',
  }
}

/** Detect the UI language: explicit config first, then the browser, then English. */
export function detectLang(config: HomeConfig): LangCode {
  if (config.lang !== 'auto') return config.lang
  const candidates = [
    ...(navigator.languages ?? []),
    navigator.language,
  ].filter(Boolean) as string[]
  for (const candidate of candidates) {
    const matched = asLang(candidate)
    if (matched && matched !== 'auto') return matched
  }
  return 'en'
}
