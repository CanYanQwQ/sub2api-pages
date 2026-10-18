import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { ArrowUpRight, Tag, X } from 'lucide-react'
import { useTheme } from './ThemeContext'
import { useI18n } from '../i18n'
import { cn } from '../lib/cn'

/**
 * The price sheet is a separate deployment, so it cannot be a route of this
 * page — and it cannot be a plain `target="_top"` navigation either: 0.2.17
 * sets `frame-src` from the origins in `home_content`, so this iframe may only
 * ever frame *this* origin. A self-navigation to the sheet is refused by the
 * parent CSP ("Framing ... violates ... frame-src").
 *
 * What does work is a frame *this* document creates: CSP is per-document, so
 * the parent's `frame-src` does not constrain a nested frame. The sheet
 * therefore opens as a full-viewport surface inside this page, one level
 * deeper, and never leaves the instance or opens a tab.
 */
interface PriceOverlayValue {
  open: () => void
}

const PriceOverlayContext = createContext<PriceOverlayValue | null>(null)

/** `embed=1` tells the sheet to drop its own header — this overlay is the header. */
function embedUrl(base: string, dark: boolean): string {
  try {
    const url = new URL(base)
    url.searchParams.set('embed', '1')
    url.searchParams.set('theme', dark ? 'dark' : 'light')
    return url.toString()
  } catch {
    return base
  }
}

export function PriceOverlayProvider({ url, children }: { url: string; children: ReactNode }) {
  const { t } = useI18n()
  const { isDark } = useTheme()
  const [open, setOpen] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)
  const restoreFocus = useRef<HTMLElement | null>(null)

  const show = useCallback(() => {
    restoreFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    setLoaded(false)
    setOpen(true)
  }, [])

  const hide = useCallback(() => {
    setOpen(false)
    restoreFocus.current?.focus()
    restoreFocus.current = null
  }, [])

  // Scroll lock has to move the body, not the overlay: the overlay is inside the
  // instance's iframe, so `overflow: hidden` here also freezes the frame's
  // scrollbar instead of letting the sheet scroll underneath.
  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        hide()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, hide])

  const value = useMemo<PriceOverlayValue>(() => ({ open: show }), [show])

  return (
    <PriceOverlayContext.Provider value={value}>
      {children}

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t.price.title}
          className="overlay-in fixed inset-0 z-50 flex flex-col bg-canvas"
        >
          <div className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-line px-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-2">
              <Tag size={15} strokeWidth={2} aria-hidden="true" className="shrink-0 text-brand" />
              <span className="truncate text-[14px] font-semibold tracking-tight text-ink">
                {t.price.title}
              </span>
              <span className="hidden font-mono text-[11px] text-ink-3 sm:inline">/ pricing</span>
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
              <a
                href={url}
                target="_blank"
                rel="noreferrer noopener"
                className="hidden items-center gap-1.5 rounded-sm px-2 py-1.5 text-[12.5px] text-ink-2 transition-colors duration-150 hover:bg-surface hover:text-ink sm:inline-flex"
              >
                {t.price.newTab}
                <ArrowUpRight size={12} strokeWidth={2} aria-hidden="true" className="text-ink-3" />
              </a>
              <button
                ref={closeRef}
                type="button"
                onClick={hide}
                aria-label={t.price.close}
                className={cn(
                  'grid h-8 w-8 place-items-center rounded-sm border border-line text-ink-2 transition-colors duration-150',
                  'hover:border-ink-3 hover:text-ink',
                )}
              >
                <X size={15} strokeWidth={2} aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="relative min-h-0 flex-1">
            {loaded ? null : (
              <div className="absolute inset-0 grid place-items-center">
                <span className="font-mono text-[11.5px] tracking-wide text-ink-3">{t.price.loading}</span>
              </div>
            )}
            <iframe
              title={t.price.title}
              src={embedUrl(url, isDark)}
              onLoad={() => setLoaded(true)}
              className="relative h-full w-full border-0"
            />
          </div>
        </div>
      ) : null}
    </PriceOverlayContext.Provider>
  )
}

export function usePriceOverlay(): PriceOverlayValue {
  const value = useContext(PriceOverlayContext)
  if (!value) throw new Error('usePriceOverlay must be used inside <PriceOverlayProvider>')
  return value
}

/**
 * Click handling for links that open the overlay. Modified clicks and the
 * middle button keep their native meaning (open in a new tab / window), so the
 * real URL stays on the anchor instead of becoming dead markup.
 */
export function overlayClick(open: () => void) {
  return (event: React.MouseEvent<HTMLElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    open()
  }
}
