import { Container, Section, SectionHeader } from '../ui'
import { useI18n } from '../../i18n'
import { cn } from '../../lib/cn'

/**
 * "How it works" — the only section where numbering is justified, because the
 * three steps are a real ordered sequence.
 *
 * The rail is drawn twice: a 1px horizontal line on desktop that runs behind the
 * step markers (the markers sit on top of it with the page background), and a
 * 1px vertical line on mobile that joins one marker to the next. The brand
 * segment marks the portion of the flow that is already reachable.
 */
export default function Flow() {
  const { t } = useI18n()
  const steps = t.flow.steps

  return (
    <Section id="flow" rule>
      <Container>
        <SectionHeader title={t.flow.title} lead={t.flow.lead} />

        <ol className="mt-12 grid gap-8 sm:mt-14 md:grid-cols-3 md:gap-10">
          {steps.map((step, index) => {
            const isLast = index === steps.length - 1

            return (
              <li
                key={step.title}
                className="relative grid grid-cols-[36px_minmax(0,1fr)] gap-x-4 md:block"
              >
                {!isLast ? (
                  // Dashed, not solid: a solid hairline here would read as one
                  // more table border, while the dash rhythm is unmistakably a
                  // diagram connector. It starts at the marker's right edge and
                  // runs exactly into the next marker (left-9 + gap-10).
                  <span
                    aria-hidden="true"
                    className="absolute left-9 -right-10 top-[17.5px] hidden border-t border-dashed border-line-strong md:block"
                  />
                ) : null}

                {!isLast ? (
                  <span
                    aria-hidden="true"
                    className="absolute left-[17.5px] top-9 -bottom-8 w-px border-l border-dashed border-line-strong md:hidden"
                  />
                ) : null}

                <span
                  aria-hidden="true"
                  className={cn(
                    'relative z-10 flex h-9 w-9 items-center justify-center rounded-xs border bg-canvas',
                    'font-mono text-[11px] tabular-nums',
                    index === 0 ? 'border-line-strong text-brand' : 'border-line text-ink-2',
                  )}
                >
                  {String(index + 1).padStart(2, '0')}
                </span>

                <div className="md:mt-5">
                  <h3 className="text-[15px] font-medium text-ink">{step.title}</h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-ink-2 text-pretty">
                    {step.body}
                  </p>
                </div>
              </li>
            )
          })}
        </ol>
      </Container>
    </Section>
  )
}
