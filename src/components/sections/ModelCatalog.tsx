import { useEffect, useMemo, useState } from 'react'
import { useI18n } from '../../i18n'
import { useInstance } from '../InstanceContext'
import { Container, Section, SectionHeader } from '../ui'
import { loadModelPlazaOnce, type ModelPlaza, type PlazaGroup } from '../../lib/instance'

/**
 * The catalogue band.
 *
 * This is the only section that leaves the page's light palette: it re-maps the
 * design tokens through `.sheet-invert`, so it reads as a dark plate dropped
 * into the sheet without needing a second colour system. Content is the
 * instance's own `/api/v1/model-plaza` payload — real groups, real multipliers,
 * real model names — and the whole section removes itself when that endpoint is
 * private or disabled, rather than showing an empty frame.
 *
 * Layout is a two-column block grid rather than a label/chip table: the table
 * version left the right half of the page empty whenever a group held one or
 * two models. Blocks keep each group's name, note and chips together, so the
 * density stays even at any model count.
 */

/** Groups routinely hold 30+ models; a landing page only needs a sample. */
const MODELS_PER_GROUP = 8

/** 0.17 → "0.17", 1 → "1", 0.085 → "0.085". */
function trimMultiplier(value: number): string {
  return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(3)))
}

function GroupBlock({ group, freeLabel }: { group: PlazaGroup; freeLabel: string }) {
  const models = group.models ?? []
  const shown = models.slice(0, MODELS_PER_GROUP)
  const rest = models.length - shown.length
  const multiplier = typeof group.rate_multiplier === 'number' ? group.rate_multiplier : null
  const note = group.description?.trim() || group.platform?.trim() || ''
  // A multiplier of 1 is the default and carries no information; printing "×1"
  // on four rows out of five trains the eye to skip that position entirely.
  const showMultiplier = multiplier !== null && multiplier !== 1 && multiplier !== 0

  return (
    <div className="flex h-full flex-col border-t border-line pt-5">
      <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
        <h3 className="text-[16px] font-semibold leading-tight text-ink">{group.name}</h3>
        {showMultiplier ? (
          <span className="font-mono text-[11px] tracking-[0.03em] text-brand-ink tabular-nums">
            ×{trimMultiplier(multiplier as number)}
          </span>
        ) : null}
        {multiplier === 0 ? (
          <span className="font-mono text-[11px] tracking-[0.03em] text-brand-ink">
            {freeLabel}
          </span>
        ) : null}
        {rest > 0 ? (
          <span className="ml-auto font-mono text-[11px] text-ink-3 tabular-nums">+{rest}</span>
        ) : null}
      </div>

      {note ? <p className="mt-1.5 text-[13px] leading-relaxed text-ink-3">{note}</p> : null}

      <ul className="mt-4 flex flex-wrap content-start gap-1.5">
        {shown.map((model) => (
          <li
            key={model.name}
            className="rounded-xs border border-line px-2.5 py-1.5 font-mono text-[11.5px] leading-none text-ink-2 transition-colors duration-150 hover:border-line-strong hover:text-ink"
          >
            {model.name}
          </li>
        ))}
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

        <div className="mt-12 grid grid-cols-1 gap-x-12 gap-y-8 sm:mt-14 md:grid-cols-2">
          {plaza.groups.map((group) => (
            <GroupBlock
              key={group.id ?? `${group.name}-${group.platform ?? ''}`}
              group={group}
              freeLabel={t.models.free}
            />
          ))}
        </div>
      </Container>
    </Section>
  )
}
