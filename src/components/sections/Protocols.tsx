import type { LucideIcon } from 'lucide-react'
import { MessageSquareCode, Sparkles, Terminal } from 'lucide-react'
import { useI18n } from '../../i18n'
import { cn } from '../../lib/cn'
import { Container, Section, SectionHeader } from '../ui'

/**
 * Icons follow the copy order in the dictionary (OpenAI / Anthropic / Gemini),
 * which the Dict type keeps identical across every locale.
 */
const PROTOCOL_ICONS: LucideIcon[] = [Terminal, MessageSquareCode, Sparkles]

/**
 * The three wire protocols the gateway speaks. Rendered as one ruled band
 * rather than three cards: this reads as a row of specifications, which is the
 * point — the client only changes a base URL, not its request shape.
 */
export default function Protocols() {
  const { t } = useI18n()
  const items = t.protocol.items

  return (
    <Section id="protocols" rule>
      <Container>
        <SectionHeader title={t.protocol.title} lead={t.protocol.lead} />

        <div className="mt-12 grid grid-cols-1 border-y border-line sm:mt-14 sm:grid-cols-3">
          {items.map((item, index) => {
            const Icon = PROTOCOL_ICONS[index] ?? Terminal
            const isFirst = index === 0
            const isLast = index === items.length - 1
            return (
              <div
                key={item.path}
                className={cn(
                  'py-7 sm:py-9',
                  // Mobile stacks the cells, so each one after the first gets a
                  // top rule; on desktop the row turns the rules vertical.
                  !isFirst && 'border-t border-line sm:border-t-0 sm:border-l',
                  // Outer cells stay flush with the container edge — the rule
                  // between cells carries the padding.
                  isFirst ? 'sm:pr-7' : isLast ? 'sm:pl-7' : 'sm:px-7',
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <Icon size={18} strokeWidth={1.75} className="text-ink-3" aria-hidden="true" />
                  <span className="text-mono-label">{String(index + 1).padStart(2, '0')}</span>
                </div>

                <h3 className="mt-6 text-[15px] font-medium text-ink">{item.name}</h3>
                <p className="mt-2 font-mono text-[13px] leading-snug text-brand">{item.path}</p>
                <p className="mt-3 text-[14px] leading-relaxed text-ink-2">{item.note}</p>
              </div>
            )
          })}
        </div>
      </Container>
    </Section>
  )
}
