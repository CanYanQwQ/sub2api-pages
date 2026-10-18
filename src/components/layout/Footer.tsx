import { ArrowUpRight } from 'lucide-react'
import { Container, SiteMark } from '../ui'
import { useInstance } from '../InstanceContext'
import { useI18n } from '../../i18n'
import { visibleMenuItems } from '../../lib/instance'

/**
 * Footer.
 *
 * Deliberately not a link farm: the brand line, the four destinations that
 * actually exist on the instance, and the legal line. The instance version is
 * printed because this page is version-coupled to it.
 */
export default function Footer() {
  const { t } = useI18n()
  const { config, settings, links, base, logo } = useInstance()

  const siteName = settings?.site_name?.trim() || config.siteName || t.fallback.brand

  const destinations = [
    { key: 'docs', label: t.nav.docs, href: links.docs },
    ...(settings?.model_plaza_enabled !== false
      ? [{ key: 'plaza', label: t.nav.plaza, href: links.modelPlaza }]
      : []),
    ...(base ? [{ key: 'dashboard', label: t.nav.console, href: links.dashboard }] : []),
    ...(settings?.contact_info
      ? [{ key: 'contact', label: t.footer.contact, href: settings.contact_info }]
      : []),
    ...visibleMenuItems(settings).map((item) => ({
      key: `custom-${item.id ?? item.label}`,
      label: item.label ?? '',
      href: item.url ?? '',
    })),
  ]

  return (
    <footer className="border-t border-line">
      <Container>
        <div className="flex flex-col gap-10 py-12 md:flex-row md:items-start md:justify-between md:gap-16">
          <div className="max-w-[34ch]">
            <div className="flex items-center gap-2.5">
              <span className="text-brand">
                <SiteMark logoUrl={logo} size={26} />
              </span>
              <span className="text-[15px] font-semibold tracking-tight text-ink">{siteName}</span>
            </div>
            <p className="mt-3 text-[13px] leading-relaxed text-ink-3">
              {settings?.site_subtitle?.trim() || t.fallback.tagline}
            </p>
          </div>

          <div className="md:text-right">
            <div className="text-mono-label">Links</div>
            {/* One horizontal row rather than a stacked column: with the build
                block gone, three links stacked left a tall empty column and the
                band read as unfinished. */}
            <ul className="mt-3 flex flex-wrap gap-x-7 gap-y-2 md:justify-end">
              {destinations.map((item) => {
                // Links that point at the instance stay in the parent frame;
                // anything genuinely off-site opens in its own tab.
                const external = /^https?:/i.test(item.href) && !item.href.startsWith(base || '//')
                  return (
                    <li key={item.key}>
                      <a
                        href={item.href}
                        target={external ? '_blank' : '_top'}
                        rel={external ? 'noreferrer noopener' : undefined}
                        className="inline-flex items-center gap-1 text-[13.5px] text-ink-2 transition-colors duration-150 hover:text-ink"
                      >
                        {item.label}
                        {external ? (
                          <ArrowUpRight
                            size={12}
                            strokeWidth={2}
                            aria-hidden="true"
                            className="text-ink-3"
                          />
                        ) : null}
                      </a>
                    </li>
                  )
                })}
              </ul>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-line py-6 text-[12px] text-ink-3 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {siteName}. {t.footer.rights}
          </p>
          <p className="font-mono text-[11px]">
            {base ? base.replace(/^https?:\/\//, '') : 'standalone preview'}
          </p>
        </div>
      </Container>
    </footer>
  )
}
