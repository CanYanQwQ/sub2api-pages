import { ArrowUpRight, BookOpen } from 'lucide-react'
import { useI18n } from '../../i18n'
import { useInstance } from '../InstanceContext'
import { ButtonLink, Container, Section, SectionHeader } from '../ui'

/**
 * Closing call to action. One bordered panel rather than a floating card: the
 * panel is part of the sheet, so it keeps a 1px hairline and a single 2px brand
 * rule on its left edge. The paper-grid texture is masked into the right half so
 * it reads as a drafting margin instead of wallpaper.
 */
export default function CallToAction() {
  const { t } = useI18n()
  const { links } = useInstance()

  return (
    <Section id="cta" rule>
      <Container>
        <div className="relative overflow-hidden rounded-md border border-line bg-surface">
          <div
            aria-hidden="true"
            className="paper-grid pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 opacity-50 md:block"
            style={{
              maskImage: 'linear-gradient(to left, #000 18%, transparent 88%)',
              WebkitMaskImage: 'linear-gradient(to left, #000 18%, transparent 88%)',
            }}
          />
          <div aria-hidden="true" className="absolute inset-y-0 left-0 w-0.5 bg-brand" />

          <div className="relative p-8 sm:p-12 lg:p-14">
            <SectionHeader
              title={t.cta.title}
              lead={t.cta.body}
              aside={
                <div className="flex flex-col gap-3 lg:flex-row">
                  <ButtonLink
                    href={links.register}
                    size="lg"
                    iconRight={<ArrowUpRight size={16} strokeWidth={1.75} aria-hidden="true" />}
                  >
                    {t.cta.primary}
                  </ButtonLink>
                  <ButtonLink
                    href={links.docs}
                    variant="secondary"
                    size="lg"
                    // Opaque here only: the secondary variant is transparent by
                    // default, which would let the paper-grid dots show through
                    // the button and read as noise.
                    className="bg-surface"
                    icon={<BookOpen size={16} strokeWidth={1.75} aria-hidden="true" />}
                  >
                    {t.cta.secondary}
                  </ButtonLink>
                </div>
              }
            />
          </div>
        </div>
      </Container>
    </Section>
  )
}
