type Props = {
  value: number
  className?: string
  trackClassName?: string
  barClassName?: string
}

export function ProgressBar({
  value,
  className = '',
  trackClassName = 'bg-panel-strong',
  barClassName = 'bg-cherry',
}: Props) {
  const clamped = Math.max(0, Math.min(100, value))
  return (
    <div className={`h-2 w-full overflow-hidden rounded-full ${trackClassName} ${className}`}>
      <div
        className={`h-full rounded-full transition-all duration-500 ${barClassName}`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}
