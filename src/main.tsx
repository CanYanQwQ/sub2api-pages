import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/archivo'
import '@fontsource/ibm-plex-mono/400.css'
import '@fontsource/ibm-plex-mono/500.css'
import './index.css'
import App from './App'
import { resolveConfig } from './lib/config'
import { detectEmbedderOrigin, prefetchPublicSettings } from './lib/instance'

/**
 * Start the public-settings request before React mounts.
 *
 * Starting it from an effect inside `App` means the request only leaves the
 * browser after the first paint, so a cold visit paints the shipped defaults
 * and then swaps to the instance's own branding. Firing it here overlaps the
 * round trip with the initial render instead.
 */
const boot = resolveConfig()
if (boot.live) {
  prefetchPublicSettings(boot.apiBase || detectEmbedderOrigin())
}

const container = document.getElementById('root')
if (!container) throw new Error('#root is missing from index.html')

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
