import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline'

const variants: Record<Variant, string> = {
  primary:
    'bg-cherry text-white hover:brightness-110 shadow-[0_10px_30px_rgb(210_0_1/0.25)]',
  secondary:
    'bg-cobalt text-white hover:brightness-110 shadow-[0_10px_30px_rgb(2_18_238/0.2)]',
  ghost: 'bg-transparent text-ink hover:bg-black/5',
  outline: 'bg-transparent text-ink border border-ink/15 hover:border-cobalt hover:text-cobalt',
}

type Common = {
  variant?: Variant
  children: ReactNode
  className?: string
}

type ButtonAsButton = Common &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined
  }

type ButtonAsLink = Common &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string
  }

type Props = ButtonAsButton | ButtonAsLink

export function Button({
  variant = 'primary',
  children,
  className = '',
  ...props
}: Props) {
  const classes = [
    'inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold tracking-[0.04em] uppercase transition-all duration-300 will-change-transform',
    'hover:-translate-y-0.5 active:translate-y-0',
    'disabled:opacity-50 disabled:pointer-events-none',
    variants[variant],
    className,
  ].join(' ')

  if ('href' in props && props.href) {
    const { href, ...rest } = props
    return (
      <a href={href} className={classes} {...rest}>
        {children}
      </a>
    )
  }

  const buttonProps = props as ButtonAsButton
  return (
    <button type="button" className={classes} {...buttonProps}>
      {children}
    </button>
  )
}
