import { useEffect, useMemo, useState } from 'react'
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
import CallToAction from './components/sections/CallToAction'
import { detectLang, resolveConfig } from './lib/config'
import { buildLinks, detectEmbedderOrigin, isEmbedded, loadPublicSettings } from './lib/instance'
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
  const [settings, setSettings] = useState<PublicSettings | null>(null)
  const [status, setStatus] = useState<InstanceState['status']>(() =>
    config.apiBase || detectEmbedderOrigin() ? 'connecting' : 'preview',
  )

  useEffect(() => {
    // Sub2API may finish loading the frame before document.referrer settles in
    // some embedding modes; re-check once on the next tick.
    if (base || !config.live) return
    const timer = window.setTimeout(() => {
      const referrer = detectEmbedderOrigin()
      if (referrer) {
        setBase(referrer)
        setStatus('connecting')
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
    setStatus('connecting')
    loadPublicSettings(base).then((loaded) => {
      if (cancelled) return
      if (loaded) {
        setSettings(loaded)
        setStatus('live')
      } else {
        // CORS blocked or instance unreachable — keep the origin (links still
        // work) but fall back to the shipped copy.
        setStatus('detected')
      }
    })
    return () => {
      cancelled = true
    }
  }, [base, config.live])

  const links = useMemo(() => buildLinks(base, settings, config.docsUrl), [base, settings, config.docsUrl])

  const instance = useMemo<InstanceState>(
    () => ({ config, base, embedded, status, settings, links }),
    [config, base, embedded, status, settings, links],
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
              <CallToAction />
            </main>
            <Footer />
          </div>
        </I18nProvider>
      </ThemeProvider>
    </InstanceContext.Provider>
  )
}
