import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

/** The brand mark: a subscription loop resolving into a single stream. */
export function BrandMark({ className, size = 28 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={cn('shrink-0', className)}
    >
      <rect x="0.75" y="0.75" width="30.5" height="30.5" rx="7.25" stroke="currentColor" strokeOpacity="0.28" strokeWidth="1.5" />
      <path d="M9 11.5h9.5a3.5 3.5 0 0 1 0 7H9" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
      <path d="M9 18.5h5.5a3.5 3.5 0 0 1 0 7H9" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeOpacity="0.45" />
      <circle cx="23.2" cy="23.2" r="2.6" fill="currentColor" />
    </svg>
  )
}

export function StatusDot({ tone = 'brand', pulse = true }: { tone?: 'brand' | 'signal' | 'muted'; pulse?: boolean }) {
  const color =
    tone === 'brand' ? 'bg-brand' : tone === 'signal' ? 'bg-signal' : 'bg-ink-3'
  return (
    <span className="relative flex h-1.5 w-1.5 shrink-0" aria-hidden="true">
      {pulse ? (
        <span className={cn('absolute inset-0 rounded-full', color)} style={{ animation: 'soft-pulse 2.6s ease-in-out infinite' }} />
      ) : null}
      <span className={cn('relative h-1.5 w-1.5 rounded-full', color)} />
    </span>
  )
}

export function Chip({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-1',
        'font-mono text-[11px] leading-none text-ink-2',
        className,
      )}
    >
      {children}
    </span>
  )
}
