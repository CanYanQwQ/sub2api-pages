import { useCallback, useEffect, useRef, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { copyText } from '../../lib/clipboard'
import { cn } from '../../lib/cn'

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
  const [copied, setCopied] = useState(false)
  const timer = useRef<number | null>(null)

  useEffect(() => () => {
    if (timer.current) window.clearTimeout(timer.current)
  }, [])

  const handleCopy = useCallback(async () => {
    const ok = await copyText(value)
    if (!ok) return
    setCopied(true)
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setCopied(false), 1600)
  }, [value])

  const Icon = copied ? Check : Copy
  const text = copied ? copiedLabel : label

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={text}
      className={cn(
        'group/copy inline-flex items-center gap-1.5 rounded-sm transition-colors duration-150',
        variant === 'inline'
          ? 'border border-line-strong bg-surface px-2.5 py-1.5 text-[12px] font-medium text-ink-2 hover:border-ink hover:text-ink'
          : 'h-8 w-8 justify-center text-ink-3 hover:text-ink',
        copied && 'border-brand text-brand',
        className,
      )}
    >
      <Icon size={13} strokeWidth={2} aria-hidden="true" />
      {variant === 'inline' ? <span>{text}</span> : null}
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
