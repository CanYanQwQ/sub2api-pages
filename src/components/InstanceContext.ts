import { createContext, useContext } from 'react'
import type { InstanceLinks, PublicSettings } from '../lib/instance'
import type { HomeConfig } from '../lib/config'

export interface InstanceState {
  config: HomeConfig
  /** Resolved origin of the Sub2API instance, '' when running standalone. */
  base: string
  /** True when `base` came from document.referrer (i.e. really embedded). */
  embedded: boolean
  /**
   * connecting — probing the origin.
   * detected   — origin known (referrer or ?api=), but /settings/public was not
   *              readable, which is the normal case unless the admin added this
   *              page's origin to cors.allowed_origins. Links and the endpoint
   *              are still correct.
   * live       — public settings loaded.
   * preview    — no origin at all; static demo copy.
   */
  status: 'connecting' | 'detected' | 'live' | 'preview'
  settings: PublicSettings | null
  links: InstanceLinks
  /** Sanitized `site_logo`, or '' when the instance has none we can render. */
  logo: string
}

export const InstanceContext = createContext<InstanceState | null>(null)

export function useInstance(): InstanceState {
  const value = useContext(InstanceContext)
  if (!value) throw new Error('useInstance must be used inside <InstanceContext.Provider>')
  return value
}
