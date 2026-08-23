type Props = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function SearchActivities({
  value,
  onChange,
  placeholder = 'Search activities...',
  className = '',
}: Props) {
  return (
    <label className={`relative block ${className}`}>
      <span className="sr-only">Search</span>
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-muted">
        ⌕
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-full border border-edge bg-panel py-2.5 pl-9 pr-4 text-sm text-fg placeholder:text-fg-muted outline-none transition focus:border-cobalt/60"
      />
    </label>
  )
}
