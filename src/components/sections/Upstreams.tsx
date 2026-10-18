import { UPSTREAM_PLATFORMS } from '../../data/content'
import { useI18n } from '../../i18n'
import { Container, Section, SectionHeader } from '../ui'

/**
 * The credential band: which upstream platforms the gateway can front.
 *
 * This is reference data, not a feature pitch, so it is set as a dense hairline
 * table rather than a grid of cards — one quiet row per platform, the way an
 * appendix is typeset in a technical sheet. The dividers come from a 1px grid
 * gap over a line-colored backdrop, which avoids doubled outer edges entirely.
 */
export default function Upstreams() {
  const { t } = useI18n()

  return (
    <Section id="upstreams" rule>
      <Container>
        <SectionHeader title={t.upstreams.title} lead={t.upstreams.lead} />

        <div className="mt-12 overflow-hidden rounded-md border border-line bg-line sm:mt-14">
          <div className="grid grid-cols-2 gap-px sm:grid-cols-3 lg:grid-cols-5">
            {UPSTREAM_PLATFORMS.map((platform, index) => (
              <div
                key={platform.id}
                className="group flex min-h-16 items-center justify-between gap-3 bg-canvas px-4 py-3 transition-colors duration-150 hover:bg-surface"
              >
                <span className="text-[14px] text-ink transition-colors duration-150 group-hover:text-brand">
                  {platform.label}
                </span>
                <span className="text-mono-label tabular-nums">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>
            ))}
            {/* 15 entries leave one empty slot in the two-column mobile grid;
                it is filled so the table does not end on a bare hairline block. */}
            <div aria-hidden="true" className="bg-canvas sm:hidden" />
          </div>
        </div>
      </Container>
    </Section>
  )
}
