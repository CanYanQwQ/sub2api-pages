import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

const VARIANTS: Record<ButtonVariant, string> = {
  // Solid ink inverts with the theme, so one rule covers light and dark.
  primary:
    'bg-ink text-canvas border border-ink hover:bg-brand hover:border-brand hover:text-canvas active:translate-y-px',
  secondary:
    'bg-transparent text-ink border border-line-strong hover:border-ink hover:bg-surface active:translate-y-px',
  ghost: 'bg-transparent text-ink-2 border border-transparent hover:text-ink hover:bg-surface',
}

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-[13px] gap-1.5 rounded-sm',
  md: 'h-10 px-4 text-sm gap-2 rounded-sm',
  lg: 'h-12 px-6 text-[15px] gap-2.5 rounded-sm',
}

export function buttonClass(
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  extra?: string,
): string {
  return cn(
    'inline-flex select-none items-center justify-center whitespace-nowrap font-medium',
    'transition-colors duration-150 ease-out',
    'disabled:pointer-events-none disabled:opacity-45',
    VARIANTS[variant],
    SIZES[size],
    extra,
  )
}

export interface ButtonProps {
  children: ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
  icon?: ReactNode
  iconRight?: ReactNode
  type?: 'button' | 'submit'
  disabled?: boolean
  onClick?: () => void
  ariaLabel?: string
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  icon,
  iconRight,
  type = 'button',
  disabled,
  onClick,
  ariaLabel,
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
      className={buttonClass(variant, size, className)}
    >
      {icon}
      {children}
      {iconRight}
    </button>
  )
}

export interface ButtonLinkProps extends Omit<ButtonProps, 'type' | 'disabled' | 'onClick'> {
  href: string
  /** Sub2API embeds us in an iframe, so internal links must escape the frame. */
  external?: boolean
}

export function ButtonLink({
  children,
  href,
  variant = 'primary',
  size = 'md',
  className,
  icon,
  iconRight,
  external,
  ariaLabel,
}: ButtonLinkProps) {
  const isHttp = /^https?:/i.test(href)
  const target = isHttp || external ? '_blank' : '_top'
  return (
    <a
      href={href}
      target={target}
      rel={target === '_blank' ? 'noreferrer noopener' : undefined}
      aria-label={ariaLabel}
      className={buttonClass(variant, size, className)}
    >
      {icon}
      {children}
      {iconRight}
    </a>
  )
}
