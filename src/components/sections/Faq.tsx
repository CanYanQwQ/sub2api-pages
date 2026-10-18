import { Plus } from 'lucide-react'
import { useI18n } from '../../i18n'
import { Container, Section } from '../ui'

/**
 * Questions that come up between "this page looks right" and "this page is
 * live". Native <details> keeps it keyboard-accessible and needs no state; the
 * plus mark rotates into a close mark on open.
 *
 * Set as a two-column editorial block — heading and standfirst in the margin,
 * questions in the measure — because a full-width stack of one-line questions
 * leaves about a thousand pixels of empty rule between the text and the mark.
 */
export default function Faq() {
  const { t } = useI18n()

  return (
    <Section id="faq" rule>
      <Container>
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[minmax(0,19rem)_minmax(0,1fr)] md:gap-16">
          <div className="md:sticky md:top-24 md:self-start">
            <h2 className="max-w-[26ch] text-title text-ink">{t.faq.title}</h2>
            <p className="mt-4 max-w-[34ch] text-[14px] leading-relaxed text-ink-2">
              {t.faq.lead}
            </p>
          </div>

          <div className="border-t border-line">
            {t.faq.items.map((item) => (
              <details key={item.q} className="group border-b border-line">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-5 [&::-webkit-details-marker]:hidden">
                  <span className="text-[15px] font-medium leading-snug text-ink">{item.q}</span>
                  <Plus
                    size={15}
                    strokeWidth={1.75}
                    aria-hidden="true"
                    className="mt-1 shrink-0 text-ink-3 transition-transform duration-200 ease-out group-open:rotate-45"
                  />
                </summary>
                <p className="max-w-[62ch] pb-6 pr-9 text-[14px] leading-[1.75] text-ink-2">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  )
}
