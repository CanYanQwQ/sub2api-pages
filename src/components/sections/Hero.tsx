import { ArrowUpRight } from 'lucide-react'
import { ButtonLink, Container, CopyChip, CopyField } from '../ui'
import { StatusDot } from '../ui'
import { useInstance } from '../InstanceContext'
import { useI18n } from '../../i18n'
import { CLIENT_CLIS, PROTOCOLS, UPSTREAM_PLATFORMS } from '../../data/content'
import { useCountUp } from '../../lib/motion'
import RoutingSchematic from './RoutingSchematic'

/**
 * The hero.
 *
 * Left column is a specification sheet: instance status, the claim, the two
 * actions and the endpoint you copy. Right column is the routing schematic,
 * which carries every bit of visual interest so the type can stay quiet.
 *
 * The spec band underneath is the page's summary table: four figures, each with
 * the unit that gives the number a meaning and a line naming what is counted.
 * A bare "3" tells a reader nothing; "3 种 · 同一端口，三种请求结构" does.
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

  // Real alternates published by the instance (admin → 自定义接入地址). Only
  // ones that resolve to an http(s) origin survive, and the primary is filtered
  // out so the list never repeats the field directly above it.
  const alternates = (settings?.custom_endpoints ?? [])
    .map((entry) => ({
      name: entry?.name?.trim() || '',
      endpoint: (entry?.endpoint ?? '').trim().replace(/\/+$/, ''),
    }))
    .filter((entry) => /^https?:\/\//i.test(entry.endpoint) && entry.endpoint !== base)
    .slice(0, 3)

  // The three counts animate once; the version string is not a number and is
  // rendered as-is.
  const protocolCount = useCountUp(PROTOCOLS.length)
  const upstreamCount = useCountUp(UPSTREAM_PLATFORMS.length)
  const clientCount = useCountUp(CLIENT_CLIS.length)

  const specs = [
    {
      label: t.spec.protocols,
      value: String(protocolCount),
      unit: t.spec.protocolsUnit,
      note: t.spec.protocolsNote,
    },
    {
      label: t.spec.upstreams,
      value: String(upstreamCount),
      unit: t.spec.upstreamsUnit,
      note: t.spec.upstreamsNote,
    },
    {
      label: t.spec.clients,
      value: String(clientCount),
      unit: t.spec.clientsUnit,
      note: t.spec.clientsNote,
    },
    {
      label: t.spec.version,
      value: settings?.version ? `v${settings.version}` : 'v0.2.17',
      unit: '',
      note: t.spec.versionNote,
    },
  ]

  return (
    <div className="relative">
      <Container>
        <div className="grid grid-cols-1 items-center gap-16 pt-14 pb-16 sm:pt-16 lg:grid-cols-12 lg:gap-12 lg:pt-20 lg:pb-14">
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

            <h1 className="mt-7 text-display text-ink">
              {t.hero.titleLines.map((line, index) => (
                <span
                  key={line}
                  className="rise block"
                  style={{ animationDelay: `${60 + index * 90}ms` }}
                >
                  {line}
                </span>
              ))}
            </h1>

            <p
              className="rise mt-6 max-w-[54ch] text-[15.5px] leading-[1.75] text-ink-2"
              style={{ animationDelay: '240ms' }}
            >
              {t.hero.lead}
            </p>

            <div
              className="rise mt-9 flex flex-wrap items-center gap-3"
              style={{ animationDelay: '300ms' }}
            >
              <ButtonLink
                href={primaryHref}
                size="lg"
                iconRight={<ArrowUpRight size={16} strokeWidth={2} aria-hidden="true" />}
              >
                {primaryLabel}
              </ButtonLink>
            </div>

            <div className="rise mt-8" style={{ animationDelay: '360ms' }}>
              {base ? (
                <div className="max-w-[420px]">
                  <div className="mb-2 text-mono-label">{t.hero.endpointLabel}</div>
                  <CopyField
                    value={`${base}/v1`}
                    label={t.hero.endpointCopy}
                    copiedLabel={t.hero.endpointCopied}
                  />
                  {alternates.length > 0 ? (
                    // Chips rather than ruled rows: each alternate copies on
                    // click exactly like the primary field above it, but two of
                    // them only cost one line instead of a stacked table.
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {alternates.map((entry) => (
                        <CopyChip
                          key={entry.endpoint}
                          value={entry.endpoint}
                          name={entry.name || entry.endpoint.replace(/^https?:\/\//, '')}
                          label={t.hero.altCopy}
                          copiedLabel={t.hero.endpointCopied}
                        />
                      ))}
                    </div>
                  ) : null}
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
                <div className="paper-grid lattice-drift pointer-events-none absolute inset-0 opacity-[0.55]" />

                {/* Crop marks: the four corners of a technical plate. */}
                <span
                  aria-hidden="true"
                  className="bracket-in pointer-events-none absolute left-2 top-2 h-2.5 w-2.5 border-l border-t border-brand/45"
                  style={{ animationDelay: '200ms' }}
                />
                <span
                  aria-hidden="true"
                  className="bracket-in pointer-events-none absolute right-2 top-2 h-2.5 w-2.5 border-r border-t border-brand/45"
                  style={{ animationDelay: '260ms' }}
                />
                <span
                  aria-hidden="true"
                  className="bracket-in pointer-events-none absolute bottom-2 left-2 h-2.5 w-2.5 border-b border-l border-brand/45"
                  style={{ animationDelay: '320ms' }}
                />
                <span
                  aria-hidden="true"
                  className="bracket-in pointer-events-none absolute bottom-2 right-2 h-2.5 w-2.5 border-b border-r border-brand/45"
                  style={{ animationDelay: '380ms' }}
                />

                {/* One instrument sweep, then it is gone. */}
                <div
                  aria-hidden="true"
                  className="scan-sweep pointer-events-none absolute inset-x-0 top-0 h-px bg-brand/60"
                />

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

        {/* Spec band: four figures set as one ruled table. The dividers come
            from a 1px grid gap over a line-coloured backdrop, so there are no
            doubled edges to compensate for. */}
        <dl className="rise mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-4" style={{ animationDelay: '420ms' }}>
          {specs.map((spec) => (
            <div key={spec.label} className="flex flex-col gap-3 bg-canvas px-5 py-5 sm:px-6">
              <dt className="text-mono-label">{spec.label}</dt>
              <dd className="flex items-baseline gap-1.5 font-mono text-[27px] leading-none tracking-[-0.02em] text-ink tabular-nums">
                {spec.value}
                {spec.unit ? (
                  <span className="text-[11.5px] leading-none tracking-normal text-ink-3">
                    {spec.unit}
                  </span>
                ) : null}
              </dd>
              <p className="text-[11.5px] leading-relaxed text-ink-3">{spec.note}</p>
            </div>
          ))}
        </dl>
      </Container>
    </div>
  )
}
