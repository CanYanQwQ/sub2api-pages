import type { LucideIcon } from 'lucide-react'
import { KeyRound, Layers, LogIn, Radar, ReceiptText, Store } from 'lucide-react'
import { useI18n } from '../../i18n'
import { Container, Section, SectionHeader } from '../ui'

/**
 * Icons follow the copy order in the dictionary (account pools, keys, usage,
 * channel monitoring, model plaza, sign-in), which the Dict type keeps
 * identical across every locale.
 */
const CAPABILITY_ICONS: LucideIcon[] = [Layers, KeyRound, ReceiptText, Radar, Store, LogIn]

/**
 * Six things the gateway does beyond proxying requests. The cells share a
 * single 1px rule grid (gap-px over a line-coloured backing) instead of six
 * bordered cards, so the section reads as one table rather than six boxes.
 */
export default function Capabilities() {
  const { t } = useI18n()
  const items = t.capabilities.items

  return (
    <Section id="capabilities" rule>
      <Container>
        <SectionHeader title={t.capabilities.title} lead={t.capabilities.lead} />

        <div className="mt-12 overflow-hidden rounded-md border border-line bg-line sm:mt-14">
          <div className="grid grid-cols-1 gap-px sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, index) => {
              const Icon = CAPABILITY_ICONS[index] ?? Layers
              return (
                <div
                  key={item.title}
                  className="group bg-surface p-6 transition-colors duration-150 hover:bg-surface-2 sm:p-7"
                >
                  <Icon
                    size={20}
                    strokeWidth={1.75}
                    className="text-brand transition-colors duration-150 group-hover:text-ink"
                    aria-hidden="true"
                  />
                  <h3 className="mt-4 text-[15px] font-medium text-ink">{item.title}</h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-ink-2">{item.body}</p>
                </div>
              )
            })}
          </div>
        </div>
      </Container>
    </Section>
  )
}
