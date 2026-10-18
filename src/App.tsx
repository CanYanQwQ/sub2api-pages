import { useEffect, useMemo, useRef, useState } from 'react'
import { InstanceContext } from './components/InstanceContext'
import type { InstanceState } from './components/InstanceContext'
import { ThemeProvider } from './components/ThemeContext'
import { I18nProvider } from './i18n'
import TopBar from './components/layout/TopBar'
import Footer from './components/layout/Footer'
import Hero from './components/sections/Hero'
import Protocols from './components/sections/Protocols'
import Capabilities from './components/sections/Capabilities'
import Flow from './components/sections/Flow'
import QuickStart from './components/sections/QuickStart'
import Upstreams from './components/sections/Upstreams'
import ModelCatalog from './components/sections/ModelCatalog'
import Faq from './components/sections/Faq'
import CallToAction from './components/sections/CallToAction'
import { detectLang, resolveConfig } from './lib/config'
import {
  buildLinks,
  detectEmbedderOrigin,
  isEmbedded,
  prefetchPublicSettings,
  readSettingsCache,
  resolveSiteLogo,
  writeSettingsCache,
} from './lib/instance'
import type { PublicSettings } from './lib/instance'

/**
 * Page shell.
 *
 * Resolution order for the instance origin matters:
 *   1. ?api= — the admin can pin it in the home_content URL.
 *   2. document.referrer — Sub2API's own origin, sent by the browser because
 *      the frame is cross-origin.
 * When neither yields an origin the page renders in preview mode: identical
 * layout, no network calls, no dead links.
 */
export default function App() {
  const config = useMemo(() => resolveConfig(), [])

  const [base, setBase] = useState(() => config.apiBase || detectEmbedderOrigin())
  const [embedded] = useState(() => isEmbedded())
  // Hydrate synchronously from the previous payload. Without this the first
  // frame renders the shipped defaults and then swaps to the instance's own
  // branding a second later — the classic async-hydration flash.
  const hydrated = useRef(false)
  const [settings, setSettings] = useState<PublicSettings | null>(() => {
    if (!config.live) return null
    const cached = readSettingsCache(config.apiBase || detectEmbedderOrigin())
    hydrated.current = cached !== null
    return cached
  })
  const [status, setStatus] = useState<InstanceState['status']>(() => {
    if (!base) return 'preview'
    // `?live=0` never fetches, so 'connecting' would strand the conditional
    // nav entries in their pending state forever.
    if (!config.live) return 'detected'
    return hydrated.current ? 'live' : 'connecting'
  })

  useEffect(() => {
    // Sub2API may finish loading the frame before document.referrer settles in
    // some embedding modes; re-check once on the next tick.
    if (base || !config.live) return
    const timer = window.setTimeout(() => {
      const referrer = detectEmbedderOrigin()
      if (referrer) {
        setBase(referrer)
        setStatus(hydrated.current ? 'live' : 'connecting')
      }
    }, 300)
    return () => window.clearTimeout(timer)
  }, [base, config.live])

  useEffect(() => {
    if (!base || !config.live) {
      if (!base) setStatus('preview')
      return
    }
    let cancelled = false
    // Revalidate silently when a cached payload is already on screen: going
    // back to "connecting" would make a correct page look like it is reloading.
    if (!hydrated.current) setStatus('connecting')
    prefetchPublicSettings(base).then((loaded) => {
      if (cancelled) return
      if (loaded) {
        setSettings(loaded)
        writeSettingsCache(base, loaded)
        hydrated.current = true
        setStatus('live')
        return
      }
      if (!hydrated.current) {
        // CORS blocked or instance unreachable — keep the origin (links still
        // work) but fall back to the shipped copy.
        setStatus('detected')
      }
      // With a cached payload the last known truth is still the best we have,
      // so the page stays exactly as it is instead of degrading.
    })
    return () => {
      cancelled = true
    }
  }, [base, config.live])

  const links = useMemo(() => buildLinks(base, settings, config.docsUrl), [base, settings, config.docsUrl])
  const logo = useMemo(() => resolveSiteLogo(settings, base), [settings, base])

  const instance = useMemo<InstanceState>(
    () => ({ config, base, embedded, status, settings, links, logo }),
    [config, base, embedded, status, settings, links, logo],
  )

  const initialLang = useMemo(() => detectLang(config), [config])
  const lockLang = config.lang !== 'auto'

  // Reflect the instance's own branding in the document title when we have it.
  useEffect(() => {
    const name = settings?.site_name?.trim() || config.siteName
    document.title = name
    const description = document.querySelector('meta[name="description"]')
    const text = settings?.site_subtitle?.trim()
    if (description && text) description.setAttribute('content', text)
  }, [settings, config.siteName])

  return (
    <InstanceContext.Provider value={instance}>
      <ThemeProvider initialMode={config.theme}>
        <I18nProvider initialLang={initialLang} lockLang={lockLang}>
          <div className="flex min-h-screen flex-col bg-canvas">
            <TopBar />
            <main className="flex-1">
              <Hero />
              <Protocols />
              <Capabilities />
              <Flow />
              <QuickStart />
              <Upstreams />
              <ModelCatalog />
              <Faq />
              <CallToAction />
            </main>
            <Footer />
          </div>
        </I18nProvider>
      </ThemeProvider>
    </InstanceContext.Provider>
  )
}
