import { ArrowUpRight, BookOpen } from 'lucide-react'
import { ButtonLink, Container, CopyField } from '../ui'
import { StatusDot } from '../ui'
import { useInstance } from '../InstanceContext'
import { useI18n } from '../../i18n'
import { UPSTREAM_PLATFORMS } from '../../data/content'
import { cn } from '../../lib/cn'
import RoutingSchematic from './RoutingSchematic'

/**
 * The hero.
 *
 * Left column is a specification sheet: instance status, the claim, the two
 * actions and the endpoint you copy. Right column is the routing schematic,
 * which carries every bit of visual interest so the type can stay quiet.
 */
export default function Hero() {
  const { t } = useI18n()
  const { base, status, settings, links } = useInstance()

  const registrationOpen = settings?.registration_enabled !== false
  const primaryHref = registrationOpen ? links.register : links.login
  const primaryLabel = registrationOpen ? t.hero.ctaPrimary : t.nav.login

  const statusLabel =
    status === 'live'
      ? t.hero.statusLive
      : status === 'detected'
        ? t.hero.statusDetected
        : status === 'connecting'
          ? t.hero.statusConnecting
          : t.hero.statusPreview

  const statusTone =
    status === 'live' || status === 'detected'
      ? 'brand'
      : status === 'connecting'
        ? 'signal'
        : 'muted'
  const host = base ? base.replace(/^https?:\/\//, '') : ''

  return (
    <div className="relative">
      <Container>
        <div className="grid grid-cols-1 items-center gap-16 pt-14 pb-16 sm:pt-16 lg:grid-cols-12 lg:gap-12 lg:pt-20 lg:pb-24">
          {/* ---------------------------------------------------------- */}
          {/* Specification column                                        */}
          {/* ---------------------------------------------------------- */}
          <div className="lg:col-span-7">
            <div
              className="rise flex flex-wrap items-center gap-x-3 gap-y-2"
              style={{ animationDelay: '0ms' }}
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-2.5 py-1">
                <StatusDot tone={statusTone} pulse={status !== 'preview'} />
                <span className="font-mono text-[11px] leading-none text-ink-2">
                  {statusLabel}
                </span>
              </span>
              {host ? (
                <span className="font-mono text-[11px] leading-none text-ink-3">{host}</span>
              ) : null}
              {settings?.version ? (
                <span className="font-mono text-[11px] leading-none text-ink-3">
                  v{settings.version}
                </span>
              ) : null}
            </div>

            <h1
              className="rise mt-7 text-display text-ink"
              style={{ animationDelay: '60ms' }}
            >
              {t.hero.titleLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h1>

            <p
              className="rise mt-6 max-w-[54ch] text-[15.5px] leading-[1.75] text-ink-2"
              style={{ animationDelay: '120ms' }}
            >
              {t.hero.lead}
            </p>

            <div
              className="rise mt-9 flex flex-wrap items-center gap-3"
              style={{ animationDelay: '180ms' }}
            >
              <ButtonLink
                href={primaryHref}
                size="lg"
                iconRight={<ArrowUpRight size={16} strokeWidth={2} aria-hidden="true" />}
              >
                {primaryLabel}
              </ButtonLink>
              <ButtonLink
                href={links.docs}
                size="lg"
                variant="secondary"
                icon={<BookOpen size={15} strokeWidth={2} aria-hidden="true" />}
              >
                {t.hero.ctaSecondary}
              </ButtonLink>
            </div>

            <div className="rise mt-10" style={{ animationDelay: '240ms' }}>
              {base ? (
                <div className="max-w-[420px]">
                  <div className="mb-2 text-mono-label">{t.hero.endpointLabel}</div>
                  <CopyField
                    value={`${base}/v1`}
                    label={t.hero.endpointCopy}
                    copiedLabel={t.hero.endpointCopied}
                  />
                </div>
              ) : (
                <p className="max-w-[46ch] border-l border-line pl-3 text-[13px] leading-relaxed text-ink-3">
                  {t.hero.statusPreviewHint}
                </p>
              )}
            </div>
          </div>

          {/* ---------------------------------------------------------- */}
          {/* Schematic column                                            */}
          {/* ---------------------------------------------------------- */}
          <div className="lg:col-span-5">
            <div className="rise relative" style={{ animationDelay: '140ms' }}>
              <div className="relative overflow-hidden rounded-md border border-line bg-surface p-6 sm:p-8">
                <div className="paper-grid pointer-events-none absolute inset-0 opacity-[0.55]" />
                <div className="relative">
                  <RoutingSchematic />
                </div>
              </div>
              {/* A single hairline offset behind the panel — the drafting-sheet
                  trick of showing the same rectangle twice. */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-2 -right-2 -z-10 hidden h-full w-full rounded-md border border-line lg:block"
              />
            </div>
          </div>
        </div>

        {/* The spec strip: the four numbers a reader wants before anything
            else, set as a footer rule under both columns so the hero reads as a
            finished sheet rather than a headline with a diagram beside it. */}
        <dl
          className="rise mt-14 grid grid-cols-2 gap-y-7 border-t border-line pt-7 sm:grid-cols-4"
          style={{ animationDelay: '300ms' }}
        >
          {[
            { label: t.spec.protocols, value: '3' },
            { label: t.spec.upstreams, value: String(UPSTREAM_PLATFORMS.length) },
            { label: t.spec.clients, value: '3' },
            {
              label: t.spec.version,
              value: settings?.version ? `v${settings.version}` : '0.2.17',
            },
          ].map((spec, index) => (
            <div
              key={spec.label}
              className={cn(
                'flex flex-col gap-2 pr-4',
                index > 0 && 'sm:border-l sm:border-line sm:pl-7',
              )}
            >
              <dt className="text-mono-label">{spec.label}</dt>
              <dd className="font-mono text-[15px] leading-none text-ink tabular-nums">
                {spec.value}
              </dd>
            </div>
          ))}
        </dl>
      </Container>
    </div>
  )
}
