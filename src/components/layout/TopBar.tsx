import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown, Globe, Menu, Moon, Sun, X } from 'lucide-react'
import { ButtonLink, Container, SiteMark, buttonClass } from '../ui'
import { useInstance } from '../InstanceContext'
import { useTheme } from '../ThemeContext'
import { LANG_LABELS, useI18n } from '../../i18n'
import type { LangCode } from '../../i18n'
import { plazaVisibility, purchaseVisibility, visibleMenuItems } from '../../lib/instance'
import { cn } from '../../lib/cn'

interface NavItem {
  key: string
  label: string
  href: string
  /** Slot reserved while the settings payload is still in flight. */
  pending?: boolean
}

/**
 * Site chrome.
 *
 * Every link leaves the iframe with `target="_top"` — a plain href navigation
 * from a cross-origin frame is only honoured with user activation, which an
 * anchor click always carries.
 */
export default function TopBar() {
  const { t, lang, setLang, lockLang } = useI18n()
  const { mode, isDark, toggle } = useTheme()
  const { config, status, settings, links, base, logo } = useInstance()

  const [open, setOpen] = useState(false)
  const [elevated, setElevated] = useState(false)

  useEffect(() => {
    const onScroll = () => setElevated(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close the mobile sheet when the viewport grows past the breakpoint.
  useEffect(() => {
    const query = window.matchMedia('(min-width: 1024px)')
    const onChange = () => setOpen(false)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  const siteName = settings?.site_name?.trim() || config.siteName || t.fallback.brand

  // `connecting` is the only state where we are about to learn something that
  // can change the nav, so conditional entries are held back visually instead
  // of appearing and then vanishing.
  const resolving = status === 'connecting'
  const plaza = plazaVisibility(settings, resolving)
  const pricing = purchaseVisibility(settings, resolving, config.showPricing)

  const nav: NavItem[] = [{ key: 'docs', label: t.nav.docs, href: links.docs }]
  if (plaza !== 'hide') {
    nav.push({ key: 'plaza', label: t.nav.plaza, href: links.modelPlaza, pending: plaza === 'pending' })
  }
  if (pricing !== 'hide') {
    nav.push({ key: 'topup', label: t.nav.topup, href: links.topup, pending: pricing === 'pending' })
  }
  for (const item of visibleMenuItems(settings)) {
    nav.push({ key: `custom-${item.id ?? item.label}`, label: item.label ?? '', href: item.url ?? '' })
  }

  const registrationOpen = settings?.registration_enabled !== false
  const loginHref = base ? links.login : ''
  const registerHref = base ? links.register : ''

  return (
    <header
      className={cn(
        'sticky top-0 z-50 border-b transition-colors duration-200',
        elevated
          ? 'border-line bg-canvas/85 backdrop-blur-md supports-[backdrop-filter]:bg-canvas/70'
          : 'border-transparent bg-canvas',
      )}
    >
      <Container>
        <div className="flex h-16 items-center justify-between gap-6">
          {/* Brand ------------------------------------------------- */}
          <a
            href={base || '/'}
            target={base ? '_top' : undefined}
            className="group flex min-w-0 items-center gap-2.5"
            aria-label={siteName}
          >
            <span className="text-brand transition-colors duration-150 group-hover:text-brand-ink">
              <SiteMark logoUrl={logo} size={28} />
            </span>
            <span className="truncate text-[15px] font-semibold tracking-tight text-ink">
              {siteName}
            </span>
            <span className="hidden shrink-0 font-mono text-[10.5px] leading-none text-ink-3 sm:inline">
              {settings?.version ? `v${settings.version}` : status === 'preview' ? 'preview' : ''}
            </span>
          </a>

          {/* Desktop nav ------------------------------------------- */}
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
            {nav.map((item) => (
              <a
                key={item.key}
                href={item.href}
                target="_top"
                aria-hidden={item.pending || undefined}
                className={cn(
                  'rounded-sm px-2.5 py-1.5 text-[13.5px] text-ink-2 transition-colors duration-150 hover:bg-surface hover:text-ink',
                  item.pending && 'invisible',
                )}
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Actions ----------------------------------------------- */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={toggle}
              aria-label={t.nav.theme}
              title={`${t.nav.theme} · ${mode}`}
              className="inline-flex h-9 w-9 items-center justify-center rounded-sm text-ink-3 transition-colors duration-150 hover:bg-surface hover:text-ink"
            >
              {isDark ? (
                <Sun size={16} strokeWidth={1.9} aria-hidden="true" />
              ) : (
                <Moon size={16} strokeWidth={1.9} aria-hidden="true" />
              )}
            </button>

            {lockLang ? null : (
              <LangMenu lang={lang} onSelect={setLang} label={t.nav.lang} />
            )}

            {base ? (
              <div className="ml-1 hidden items-center gap-1.5 sm:flex">
                <a
                  href={loginHref}
                  target="_top"
                  className={buttonClass('ghost', 'sm')}
                >
                  {t.nav.login}
                </a>
                {registrationOpen ? (
                  <ButtonLink href={registerHref} size="sm">
                    {t.nav.register}
                  </ButtonLink>
                ) : null}
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? t.nav.close : t.nav.menu}
              className="ml-0.5 inline-flex h-9 w-9 items-center justify-center rounded-sm text-ink-2 transition-colors duration-150 hover:bg-surface hover:text-ink lg:hidden"
            >
              {open ? (
                <X size={17} strokeWidth={2} aria-hidden="true" />
              ) : (
                <Menu size={17} strokeWidth={2} aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </Container>

      {/* Mobile sheet ---------------------------------------------- */}
      <div
        id="mobile-nav"
        hidden={!open}
        className="border-t border-line bg-canvas lg:hidden"
      >
        <Container className="py-4">
          <nav className="flex flex-col" aria-label="Primary mobile">
            {/* A reserved-but-empty row would read as a broken list here, so
                pending entries are left out of the sheet instead. */}
            {nav
              .filter((item) => !item.pending)
              .map((item) => (
                <a
                  key={item.key}
                  href={item.href}
                  target="_top"
                  className="border-b border-line py-3 text-[15px] text-ink-2 transition-colors duration-150 hover:text-ink"
                >
                  {item.label}
                </a>
              ))}
          </nav>
          {base ? (
            <div className="mt-4 flex items-center gap-2">
              <a href={loginHref} target="_top" className={buttonClass('secondary', 'md', 'flex-1')}>
                {t.nav.login}
              </a>
              {registrationOpen ? (
                <ButtonLink href={registerHref} size="md" className="flex-1">
                  {t.nav.register}
                </ButtonLink>
              ) : null}
            </div>
          ) : null}
        </Container>
      </div>
    </header>
  )
}

/* ---------------------------------------------------------------------- */

function LangMenu({
  lang,
  onSelect,
  label,
}: {
  lang: LangCode
  onSelect: (next: LangCode) => void
  label: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const options = Object.keys(LANG_LABELS) as LangCode[]

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        className="inline-flex h-9 items-center gap-1 rounded-sm px-2 text-ink-3 transition-colors duration-150 hover:bg-surface hover:text-ink"
      >
        <Globe size={15} strokeWidth={1.9} aria-hidden="true" />
        <span className="font-mono text-[11px] leading-none">{lang.toUpperCase()}</span>
        <ChevronDown
          size={12}
          strokeWidth={2}
          aria-hidden="true"
          className={cn('transition-transform duration-150', open && 'rotate-180')}
        />
      </button>

      {open ? (
        <ul
          role="listbox"
          aria-label={label}
          className="shadow-lift absolute right-0 top-full z-50 mt-1.5 w-36 overflow-hidden rounded-sm border border-line bg-surface py-1"
        >
          {options.map((code) => (
            <li key={code} role="option" aria-selected={code === lang}>
              <button
                type="button"
                onClick={() => {
                  onSelect(code)
                  setOpen(false)
                }}
                className="flex w-full items-center justify-between px-3 py-1.5 text-left text-[13px] text-ink-2 transition-colors duration-150 hover:bg-surface-2 hover:text-ink"
              >
                {LANG_LABELS[code]}
                {code === lang ? (
                  <Check size={13} strokeWidth={2.2} className="text-brand" aria-hidden="true" />
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
