import { Link } from 'react-router-dom'
import { brand } from '@/data/brand'
import { footerData } from '@/data/footer'
import { CountUp } from '@/components/motion/CountUp'

function SocialIcon({ id }: { id: string }) {
  const common = 'h-4 w-4'
  switch (id) {
    case 'instagram':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm5 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm6.5-.75a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5zM12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6z" />
        </svg>
      )
    case 'facebook':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M13.5 22v-8h2.7l.4-3h-3.1V9.1c0-.9.3-1.5 1.6-1.5H16.8V4.1C16.4 4 15.3 4 14.1 4c-2.5 0-4.2 1.5-4.2 4.3V11H7v3h2.9v8h3.6z" />
        </svg>
      )
    case 'youtube':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M23 7.5s-.2-1.6-.9-2.3c-.9-.9-1.9-.9-2.3-1C16.9 4 12 4 12 4h0s-4.9 0-7.8.2c-.5.1-1.4.1-2.3 1C1.2 5.9 1 7.5 1 7.5S.8 9.4.8 11.2v1.6c0 1.9.2 3.7.2 3.7s.2 1.6.9 2.3c.9.9 2.1.8 2.6.9 1.9.2 7.5.2 7.5.2s4.9 0 7.8-.2c.5-.1 1.4-.1 2.3-1 .7-.7.9-2.3.9-2.3s.2-1.9.2-3.7v-1.6c0-1.8-.2-3.7-.2-3.7zM9.8 14.8V8.9l6 2.95-6 2.95z" />
        </svg>
      )
    case 'tiktok':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M19.6 8.3a6.5 6.5 0 0 1-3.8-1.2v7.1a5.9 5.9 0 1 1-5.9-5.9c.3 0 .6 0 .9.1v3a2.9 2.9 0 1 0 2 2.8V2.5h3c.1 1.5.8 2.9 1.9 3.9a6.4 6.4 0 0 0 1.9 1.1v.8z" />
        </svg>
      )
    default:
      return null
  }
}

function FooterColumn({
  title,
  links,
  dark,
}: {
  title: string
  links: readonly { label: string; href: string }[]
  dark?: boolean
}) {
  return (
    <div>
      <h3 className={`text-sm font-bold ${dark ? 'text-sand' : 'text-ink'}`}>{title}</h3>
      <ul className="mt-4 space-y-2.5">
        {links.map((link) => (
          <li key={link.label}>
            {link.href.startsWith('mailto:') ||
            link.href.startsWith('http') ||
            link.href === '#' ? (
              <a
                href={link.href}
                className={`text-sm transition hover:text-cherry ${dark ? 'text-fg-muted' : 'text-muted'}`}
                {...(link.href.startsWith('http')
                  ? { target: '_blank', rel: 'noreferrer' }
                  : {})}
              >
                {link.label}
              </a>
            ) : (
              <Link
                to={link.href}
                className={`text-sm transition hover:text-cherry ${dark ? 'text-fg-muted' : 'text-muted'}`}
              >
                {link.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function SiteFooter({ variant = 'light' }: { variant?: 'light' | 'dark' }) {
  const dark = variant === 'dark'
  return (
    <footer
      className={
        dark
          ? 'border-t border-edge bg-ink text-sand'
          : 'border-t border-ink/8 bg-sand text-ink'
      }
    >
      <div className="container-wide grid gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4 lg:pr-6">
          <Link to="/" className={`display text-2xl ${dark ? 'text-sand' : 'text-ink'}`}>
            <span>WE ARE </span>
            <span className="text-cherry">ENGLISH</span>
          </Link>
          <p className={`max-w-sm text-sm leading-relaxed ${dark ? 'text-fg-muted' : 'text-muted'}`}>
            {footerData.blurb}
          </p>
          <p className={`text-sm font-semibold ${dark ? 'text-sand' : 'text-ink'}`}>
            Trusted by{' '}
            <CountUp to={footerData.activeLearners} className="text-cherry" suffix="+" />{' '}
            learners worldwide.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {footerData.socials.map((social) => (
              <a
                key={social.id}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                aria-label={social.label}
                className={
                  dark
                    ? 'inline-flex h-9 w-9 items-center justify-center rounded-lg border border-edge bg-panel text-sand transition hover:border-cherry/40 hover:text-cherry'
                    : 'inline-flex h-9 w-9 items-center justify-center rounded-lg border border-ink/10 bg-white text-ink transition hover:border-cherry/40 hover:text-cherry'
                }
              >
                <SocialIcon id={social.id} />
              </a>
            ))}
          </div>
          <a
            href={`mailto:${footerData.contactEmail}`}
            className="inline-block text-sm font-medium text-cobalt hover:underline"
          >
            {footerData.contactEmail}
          </a>
        </div>

        <FooterColumn title="Product" links={footerData.product} dark={dark} />
        <FooterColumn title="Resources" links={footerData.resources} dark={dark} />
        <FooterColumn title="Support" links={footerData.support} dark={dark} />
      </div>

      <div
        className={
          dark
            ? 'border-t border-edge px-4 py-5 text-center text-xs text-fg-muted sm:px-6'
            : 'border-t border-ink/8 px-4 py-5 text-center text-xs text-muted sm:px-6'
        }
      >
        © {new Date().getFullYear()} {brand.name}. Practice English. Your way.
      </div>
    </footer>
  )
}
