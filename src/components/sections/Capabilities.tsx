import type { LucideIcon } from 'lucide-react'
import { KeyRound, Layers, LogIn, Radar, ReceiptText, Store } from 'lucide-react'
import { useI18n } from '../../i18n'
import { revealDelay } from '../../lib/motion'
import { Container, Section, SectionHeader } from '../ui'

/**
 * Icons follow the copy order in the dictionary (account pools, keys, usage,
 * channel monitoring, model plaza, sign-in), which the Dict type keeps
 * identical across every locale.
 */
const CAPABILITY_ICONS: LucideIcon[] = [Layers, KeyRound, ReceiptText, Radar, Store, LogIn]

/**
 * Six things the gateway does beyond proxying requests.
 *
 * Deliberately not a 3×2 card grid: six equally sized boxes with an icon on top
 * is the most templated shape a feature section can take, and it spends the
 * page's largest block on its least specific content. The first item gets the
 * full measure and a row of concrete mechanisms; the other five collapse into a
 * tight three-column list on hairlines. One subject, five supporting notes.
 */
export default function Capabilities() {
  const { t } = useI18n()
  const items = t.capabilities.items
  const [lead, ...rest] = items
  const LeadIcon = CAPABILITY_ICONS[0] ?? Layers

  return (
    <Section id="capabilities" rule>
      <Container>
        <SectionHeader title={t.capabilities.title} lead={t.capabilities.lead} />

        {lead ? (
          <div
            data-reveal=""
            className="reveal mt-12 flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:gap-7 sm:pt-7"
          >
            <LeadIcon
              size={18}
              strokeWidth={1.75}
              className="mt-1 shrink-0 text-brand"
              aria-hidden="true"
            />
            <div className="min-w-0">
              <h3 className="text-[17px] font-medium text-ink">{lead.title}</h3>
              <p className="mt-2 max-w-[56ch] text-[14px] leading-relaxed text-ink-2">
                {lead.body}
              </p>
              <dl className="mt-5 flex flex-wrap gap-x-9 gap-y-3">
                {t.capabilities.mechanisms.map((mechanism) => (
                  <div key={mechanism.term} className="flex items-baseline gap-2">
                    <dt className="font-mono text-[11px] text-ink-3">{mechanism.term}</dt>
                    <dd className="text-[12.5px] text-ink-2">{mechanism.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        ) : null}

        {/* Five items on one full-width rule: laid out as 3+2 they left a dead
            cell in the last row and their hairlines never lined up, because
            each row sized to its tallest note. One row of five keeps the rule
            continuous and matches the upstream table's rhythm. */}
        <div className="mt-10 grid grid-cols-1 gap-x-10 sm:grid-cols-2 lg:grid-cols-5">
          {rest.map((item, index) => {
            const Icon = CAPABILITY_ICONS[index + 1] ?? Layers
            return (
              <div
                key={item.title}
                data-reveal=""
                style={revealDelay(60 + index * 55)}
                className="reveal group border-t border-line py-5 transition-colors duration-150"
              >
                <div className="flex items-baseline gap-2.5">
                  <Icon
                    size={14}
                    strokeWidth={1.75}
                    className="shrink-0 translate-y-[1px] text-brand transition-colors duration-150 group-hover:text-ink"
                    aria-hidden="true"
                  />
                  <h3 className="text-[14.5px] font-medium text-ink">{item.title}</h3>
                </div>
                <p className="mt-2 pl-[26px] text-[13.5px] leading-relaxed text-ink-2">
                  {item.body}
                </p>
              </div>
            )
          })}
        </div>
      </Container>
    </Section>
  )
}
