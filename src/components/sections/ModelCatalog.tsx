import { useEffect, useMemo, useState } from 'react'
import { useI18n } from '../../i18n'
import { useInstance } from '../InstanceContext'
import { Container, Section, SectionHeader } from '../ui'
import { loadModelPlazaOnce, type ModelPlaza, type PlazaGroup } from '../../lib/instance'
import { priceTag } from '../../lib/pricing'

/**
 * The catalogue band.
 *
 * This is the only section that leaves the page's light palette: it re-maps the
 * design tokens through `.sheet-invert`, so it reads as a dark plate dropped
 * into the sheet without needing a second colour system. Content is the
 * instance's own `/api/v1/model-plaza` payload — real groups, real model names
 * and the real charged prices the billing engine uses — and the whole section
 * removes itself when that endpoint is private or disabled, rather than showing
 * an empty frame.
 *
 * Rows rather than chips: a chip wall can only carry names, and names are the
 * one thing a visitor can already guess. The right-hand column is the number
 * that cannot be guessed, so each model gets a line and the price sits where a
 * price belongs. The rule between rows is the same 1px hairline used
 * everywhere else, so a dense block still reads as one drawing.
 */

/** Groups routinely hold 30+ models; a landing page only needs a sample. */
const MODELS_PER_GROUP = 8

/** 0.17 → "0.17", 1 → "1", 0.085 → "0.085". */
function trimMultiplier(value: number): string {
  return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(3)))
}

function GroupBlock({
  group,
  freeLabel,
  perCallLabel,
  index,
}: {
  group: PlazaGroup
  freeLabel: string
  perCallLabel: string
  index: number
}) {
  const models = group.models ?? []
  const shown = models.slice(0, MODELS_PER_GROUP)
  const rest = models.length - shown.length
  const multiplier = typeof group.rate_multiplier === 'number' ? group.rate_multiplier : null
  // Only the admin's own note. Falling back to `platform` looked informative
  // but is not: on a real instance every group reported `openai`, so the line
  // just repeated itself down the page and cost a row of height each time.
  const note = group.description?.trim() || ''
  // A multiplier of 1 is the default and carries no information; printing "×1"
  // on four rows out of five trains the eye to skip that position entirely.
  const showMultiplier = multiplier !== null && multiplier !== 1 && multiplier !== 0

  return (
    <div
      className="rise flex h-full flex-col border-t border-line pt-5"
      style={{ animationDelay: `${Math.min(index, 6) * 70}ms` }}
    >
      <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
        <h3 className="text-[16px] font-semibold leading-tight text-ink">{group.name}</h3>
        {showMultiplier ? (
          <span className="font-mono text-[11px] tracking-[0.03em] text-brand-ink tabular-nums">
            ×{trimMultiplier(multiplier as number)}
          </span>
        ) : null}
        {multiplier === 0 ? (
          <span className="font-mono text-[11px] tracking-[0.03em] text-brand-ink">{freeLabel}</span>
        ) : null}
        {rest > 0 ? (
          <span className="ml-auto font-mono text-[11px] text-ink-3 tabular-nums">+{rest}</span>
        ) : null}
      </div>

      {note ? (
        <p className="mt-1.5 line-clamp-1 text-[12.5px] leading-relaxed text-ink-3">{note}</p>
      ) : null}

      <ul className="mt-3.5">
        {shown.map((model) => {
          const price = priceTag(model, { perCall: perCallLabel, free: freeLabel })
          return (
            <li
              key={model.name}
              className="flex items-baseline justify-between gap-4 border-t border-line/70 py-1.5 first:border-t-0"
            >
              <span className="min-w-0 truncate font-mono text-[12.5px] leading-snug text-ink-2 transition-colors duration-150 group-hover:text-ink">
                {model.name}
              </span>
              <span
                className={[
                  'shrink-0 font-mono text-[11.5px] leading-snug tabular-nums',
                  price?.free ? 'text-brand-ink' : 'text-ink-3',
                ].join(' ')}
              >
                {price?.text ?? '—'}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default function ModelCatalog() {
  const { t } = useI18n()
  const { base, settings } = useInstance()
  const [plaza, setPlaza] = useState<ModelPlaza | null>(null)

  const enabled = settings?.model_plaza_enabled !== false

  useEffect(() => {
    if (!base || !enabled) {
      setPlaza(null)
      return
    }
    let alive = true
    // Behind a short delay: the catalogue is never the first thing read, and it
    // shares the network with the settings probe on cold loads.
    const timer = window.setTimeout(() => {
      void loadModelPlazaOnce(base).then((value) => {
        if (alive) setPlaza(value)
      })
    }, 400)
    return () => {
      alive = false
      window.clearTimeout(timer)
    }
  }, [base, enabled])

  const totals = useMemo(() => {
    if (!plaza) return { groups: 0, models: 0 }
    return {
      groups: plaza.groups.length,
      models: plaza.groups.reduce((sum, group) => sum + (group.models?.length ?? 0), 0),
    }
  }, [plaza])

  if (!plaza) return null

  return (
    <Section id="models" className="sheet-invert bg-canvas text-ink">
      <Container>
        <SectionHeader
          title={t.models.title}
          lead={t.models.lead}
          aside={
            <div className="flex items-center gap-3 font-mono text-[12.5px] text-ink-3">
              <span>
                <span className="text-ink tabular-nums">{totals.groups}</span> {t.models.groups}
              </span>
              <span aria-hidden="true" className="h-3 w-px bg-line-strong" />
              <span>
                <span className="text-ink tabular-nums">{totals.models}</span> {t.models.models}
              </span>
            </div>
          }
        />

        <div className="mt-10 grid grid-cols-1 gap-x-12 gap-y-8 sm:mt-12 md:grid-cols-2">
          {plaza.groups.map((group, index) => (
            <GroupBlock
              key={group.id ?? `${group.name}-${group.platform ?? ''}`}
              group={group}
              freeLabel={t.models.free}
              perCallLabel={t.models.perCall}
              index={index}
            />
          ))}
        </div>

        <p className="mt-8 border-t border-line pt-4 font-mono text-[11px] leading-relaxed text-ink-3">
          {t.models.note}
        </p>
      </Container>
    </Section>
  )
}
