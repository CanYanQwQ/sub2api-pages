import { useCallback, useEffect, useRef, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { copyText } from '../../lib/clipboard'
import { cn } from '../../lib/cn'

/** Shared clipboard state so every control resets on the same schedule. */
function useCopyState(value: string) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<number | null>(null)

  useEffect(() => () => {
    if (timer.current) window.clearTimeout(timer.current)
  }, [])

  const copy = useCallback(async () => {
    const ok = await copyText(value)
    if (!ok) return
    setCopied(true)
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setCopied(false), 1600)
  }, [value])

  return { copied, copy }
}

interface CopyButtonProps {
  value: string
  label: string
  copiedLabel: string
  className?: string
  variant?: 'inline' | 'icon'
}

export function CopyButton({
  value,
  label,
  copiedLabel,
  className,
  variant = 'inline',
}: CopyButtonProps) {
  const { copied, copy } = useCopyState(value)
  const Icon = copied ? Check : Copy
  const text = copied ? copiedLabel : label

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={text}
      className={cn(
        'group/copy inline-flex items-center gap-1.5 rounded-sm transition-colors duration-150',
        variant === 'inline'
          ? 'border border-line-strong bg-surface px-2.5 py-1.5 text-[12px] font-medium text-ink-2 hover:border-ink hover:text-ink'
          : 'h-8 w-8 justify-center text-ink-3 hover:text-ink',
        copied && 'border-brand text-brand-ink',
        className,
      )}
    >
      <Icon size={13} strokeWidth={2} aria-hidden="true" />
      {variant === 'inline' ? <span>{text}</span> : null}
    </button>
  )
}

/**
 * A whole row that copies itself.
 *
 * The primary endpoint is a full-width field with its own copy control; the
 * alternates are secondary, so they carry the same affordance without the same
 * weight — the chip is the hit target, not just the icon at its end.
 */
export function CopyChip({
  value,
  label,
  copiedLabel,
  name,
  className,
}: {
  value: string
  /** Accessible label while idle, e.g. "复制 CloudFlare 地址". */
  label: string
  copiedLabel: string
  /** Visible short name, e.g. the admin's own label for this endpoint. */
  name: string
  className?: string
}) {
  const { copied, copy } = useCopyState(value)
  const Icon = copied ? Check : Copy

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? copiedLabel : label}
      title={copied ? copiedLabel : `${label} · ${value}`}
      className={cn(
        'group/chip inline-flex max-w-full items-center gap-2 rounded-sm border border-line px-2 py-1 transition-colors duration-150',
        copied ? 'border-brand' : 'hover:border-line-strong',
        className,
      )}
    >
      <span className="shrink-0 text-[11.5px] leading-none text-ink-3">{name}</span>
      <code
        className={cn(
          'min-w-0 truncate font-mono text-[11px] leading-none',
          copied ? 'text-brand-ink' : 'text-ink-2',
        )}
      >
        {value.replace(/^https?:\/\//, '')}
      </code>
      <Icon
        size={11}
        strokeWidth={2}
        aria-hidden="true"
        className={cn(
          'shrink-0 transition-colors duration-150',
          copied ? 'text-brand-ink' : 'text-ink-3 group-hover/chip:text-ink-2',
        )}
      />
    </button>
  )
}

/** Mono string with a trailing copy control — used for endpoints and hosts. */
export function CopyField({
  value,
  label,
  copiedLabel,
  prefix,
  className,
}: {
  value: string
  label: string
  copiedLabel: string
  prefix?: string
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-sm border border-line bg-surface px-3 py-2',
        className,
      )}
    >
      {prefix ? (
        <span className="text-mono-label shrink-0 select-none">{prefix}</span>
      ) : null}
      <code className="min-w-0 flex-1 truncate text-[12.5px] text-ink">{value}</code>
      <CopyButton value={value} label={label} copiedLabel={copiedLabel} variant="icon" />
    </div>
  )
}
