import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('mx-auto w-full max-w-sheet px-6 sm:px-8 lg:px-12', className)}>
      {children}
    </div>
  )
}

/**
 * A page band. `rule` draws the hairline that separates bands in the technical
 * sheet layout; it is opted into per section rather than applied globally so
 * spacing stays intentional.
 *
 * Bands are denser than they look: the vertical rhythm is set here once, so
 * `py-14/16/20` is what every section actually spends between blocks.
 */
export function Section({
  id,
  children,
  className,
  rule,
  reveal = true,
}: {
  id?: string
  children: ReactNode
  className?: string
  rule?: boolean
  reveal?: boolean
}) {
  return (
    <section
      id={id}
      data-reveal={reveal ? '' : undefined}
      className={cn(
        'relative scroll-mt-24 py-14 sm:py-16 lg:py-20',
        reveal && 'reveal',
        rule && 'border-t border-line',
        className,
      )}
    >
      {children}
    </section>
  )
}

export function SectionHeader({
  title,
  lead,
  aside,
  className,
}: {
  title: string
  lead?: string
  aside?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-6 md:flex-row md:items-end md:justify-between md:gap-12',
        className,
      )}
    >
      <div className="min-w-0">
        {/* The ch cap is measured against the heading's own font-size, so a
            short CJK title stays on one line instead of inheriting the lead's
            narrower measure and wrapping mid-word under text-wrap:balance. */}
        <h2 className="max-w-[26ch] text-title text-ink">{title}</h2>
        {lead ? (
          <p className="mt-4 max-w-[46ch] text-[15px] leading-relaxed text-ink-2">{lead}</p>
        ) : null}
      </div>
      {aside ? <div className="shrink-0">{aside}</div> : null}
    </div>
  )
}

/** Small mono label. Deliberately sentence case — no tracked-out capitals. */
export function Label({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn('text-mono-label', className)}>{children}</span>
}

export function Rule({ className }: { className?: string }) {
  return <div className={cn('rule-fade w-full', className)} aria-hidden="true" />
}
