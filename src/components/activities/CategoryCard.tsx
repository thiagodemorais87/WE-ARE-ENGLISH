import type { CategoryMeta } from '@/data/categories'

type Props = {
  category: CategoryMeta
  tone?: 'dark' | 'light'
}

export function CategoryCard({ category, tone = 'dark' }: Props) {
  const light = tone === 'light'

  return (
    <article
      className={[
        'flex h-full flex-col rounded-2xl border p-5 transition',
        light
          ? 'border-ink/10 bg-white/70 hover:border-cherry/40 hover:bg-white'
          : 'border-white/8 bg-gradient-to-br from-white/[0.06] to-transparent hover:border-cherry/40 hover:bg-white/[0.08]',
      ].join(' ')}
    >
      <div className="mb-3 text-2xl">{category.icon}</div>
      <h3 className={['text-base font-semibold', light ? 'text-ink' : 'text-white'].join(' ')}>
        {category.label}
      </h3>
      <p
        className={[
          'mt-2 flex-1 text-sm leading-relaxed line-clamp-3',
          light ? 'text-muted' : 'text-white/55',
        ].join(' ')}
      >
        {category.description}
      </p>
    </article>
  )
}
