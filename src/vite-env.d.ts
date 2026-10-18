/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUB2API_BASE_URL?: string
  readonly VITE_SITE_NAME?: string
  readonly VITE_DOCS_URL?: string
  readonly VITE_REPO_URL?: string
  readonly VITE_CONTACT_URL?: string
  readonly VITE_PRICING_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface Window {
  /** Optional runtime overrides injected by a hosting page or by /config.js. */
  __SUB2API_HOME__?: Partial<{
    apiBase: string
    theme: 'light' | 'dark' | 'auto'
    lang: 'zh' | 'en' | 'ja' | 'auto'
    siteName: string
    docsUrl: string
    repoUrl: string
    contactUrl: string
    pricingUrl: string
    live: boolean
  }>
}
