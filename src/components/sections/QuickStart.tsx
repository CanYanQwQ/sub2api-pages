import { useId, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { Container, CopyButton, Section, SectionHeader } from '../ui'
import { useI18n } from '../../i18n'
import { useInstance } from '../InstanceContext'
import { buildSnippets } from '../../data/content'
import { cn } from '../../lib/cn'

/**
 * "Quickstart" — a terminal panel with one tab per client.
 *
 * The tab strip follows the WAI-ARIA tabs pattern: roving tabindex, automatic
 * activation on arrow keys, Home/End to jump to the ends. Copy always reads the
 * active snippet, and is keyed by snippet id so the "copied" state does not leak
 * across tabs.
 */
export default function QuickStart() {
  const { t } = useI18n()
  const { base } = useInstance()
  const snippets = useMemo(() => buildSnippets(base), [base])
  const [active, setActive] = useState(0)
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])
  const idPrefix = useId()

  const current = snippets[active] ?? snippets[0]
  const tabs = t.quickstart.tabs

  const select = (index: number) => {
    if (index < 0 || index >= snippets.length) return
    setActive(index)
  }

  const move = (index: number) => {
    const count = snippets.length
    if (count === 0) return
    const next = ((index % count) + count) % count
    setActive(next)
    tabRefs.current[next]?.focus()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault()
        move(active + 1)
        break
      case 'ArrowLeft':
        event.preventDefault()
        move(active - 1)
        break
      case 'Home':
        event.preventDefault()
        move(0)
        break
      case 'End':
        event.preventDefault()
        move(snippets.length - 1)
        break
      default:
        break
    }
  }

  if (!current) return null

  const panelId = `${idPrefix}-panel`

  return (
    <Section id="quickstart" rule>
      <Container>
        <SectionHeader title={t.quickstart.title} lead={t.quickstart.lead} />

        <div className="mt-12 sm:mt-14">
          <div className="overflow-hidden rounded-md border border-line bg-surface">
            {/* On narrow screens the four tabs plus the copy button cannot share
                one row, and a hidden scrollbar would leave the last tab
                undiscoverable. Stacking keeps every tab visible. */}
            <div className="flex flex-col gap-2 border-b border-line p-2 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
              <div
                role="tablist"
                aria-label={t.quickstart.title}
                onKeyDown={handleKeyDown}
                className="flex w-full min-w-0 items-stretch overflow-x-auto [scrollbar-width:none] sm:w-auto [&::-webkit-scrollbar]:hidden"
              >
                {snippets.map((snippet, index) => {
                  const selected = index === active

                  return (
                    <button
                      key={snippet.id}
                      ref={(node) => {
                        tabRefs.current[index] = node
                      }}
                      type="button"
                      role="tab"
                      id={`${idPrefix}-tab-${index}`}
                      aria-selected={selected}
                      aria-controls={panelId}
                      tabIndex={selected ? 0 : -1}
                      onClick={() => select(index)}
                      className={cn(
                        'relative h-11 shrink-0 px-3 text-[13px] font-medium',
                        'transition-colors duration-150 focus-visible:[outline-offset:-2px]',
                        selected ? 'text-ink' : 'text-ink-3 hover:text-ink',
                      )}
                    >
                      {tabs[index] ?? snippet.id}
                      <span
                        aria-hidden="true"
                        className={cn(
                          'absolute inset-x-3 bottom-0 h-0.5 transition-colors duration-150',
                          selected ? 'bg-brand' : 'bg-transparent',
                        )}
                      />
                    </button>
                  )
                })}
              </div>

              <CopyButton
                key={current.id}
                value={current.code}
                label={t.hero.endpointCopy}
                copiedLabel={t.hero.endpointCopied}
                className="shrink-0 self-end sm:self-auto"
              />
            </div>

            <div
              id={panelId}
              role="tabpanel"
              aria-labelledby={`${idPrefix}-tab-${active}`}
              className="bg-surface-2"
            >
              <div className="flex items-center justify-between gap-3 px-5 pb-1 pt-3.5">
                <span className="text-mono-label">{current.id}</span>
                <span className="text-mono-label">{current.language}</span>
              </div>
              <pre
                tabIndex={0}
                className="overflow-x-auto px-5 pb-5 pt-1 text-[13px] leading-relaxed text-ink focus-visible:[outline-offset:-2px]"
              >
                <code>{current.code}</code>
              </pre>
            </div>
          </div>

          <p className="mt-3 text-[12px] leading-relaxed text-ink-3">{t.quickstart.note}</p>
        </div>
      </Container>
    </Section>
  )
}
