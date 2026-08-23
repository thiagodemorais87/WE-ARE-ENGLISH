import { Link } from 'react-router-dom'
import { brand } from '@/data/brand'

export function TermsPage() {
  return (
    <div className="container-wide max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <Link to="/" className="text-sm text-fg-muted hover:text-fg">
        ← Home
      </Link>
      <h1 className="mt-4 display text-4xl text-fg sm:text-5xl">Terms of Service</h1>
      <p className="mt-2 text-sm text-fg-muted">WE ARE ENGLISH · Last updated: August 2026</p>
      <p className="mt-4 text-fg-muted">
        These Terms govern your use of the {brand.name} learning platform. By creating an account or
        using the site, you agree to them.
      </p>

      <div className="mt-10 space-y-8 text-sm leading-relaxed text-fg-muted sm:text-base">
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-fg">1. The service</h2>
          <p>
            WE ARE ENGLISH provides interactive English practice activities for personal learning.
            Features may change as we improve the product. Some activities require an internet
            connection (for example video embeds).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-fg">2. Accounts</h2>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Keep your login details confidential.</li>
            <li>Provide accurate information when you register.</li>
            <li>
              You must be old enough to use online services under local law, or have permission from
              a parent/guardian.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-fg">3. Acceptable use</h2>
          <p>
            Use the platform for learning only. Do not attempt to break security, abuse other users,
            spam, scrape content at scale, or upload illegal material. We may suspend accounts that
            violate these rules.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-fg">4. Learning content</h2>
          <p>
            Activity content, branding and interface belong to WE ARE ENGLISH or its licensors.
            Third-party media (songs, videos) remains owned by the original rights holders and is
            embedded for educational practice. You may not copy or redistribute our materials without
            permission.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-fg">5. Progress and scores</h2>
          <p>
            Scores and history help you track practice. They are educational indicators, not official
            certifications. We may recalculate or reset technical data if needed to keep the system
            reliable.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-fg">6. Disclaimer</h2>
          <p>
            The platform is provided “as is”. We work to keep it available and useful, but we do not
            guarantee uninterrupted access or specific learning outcomes.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-fg">7. Limitation of liability</h2>
          <p>
            To the fullest extent allowed by law, WE ARE ENGLISH is not liable for indirect or
            consequential damages arising from your use of the service.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-fg">8. Changes to these Terms</h2>
          <p>
            We may update these Terms as the platform evolves. Continued use after changes means you
            accept the updated Terms. The date at the top shows the latest revision.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-fg">9. Contact</h2>
          <p>
            Questions about these Terms:{' '}
            <a href="mailto:support@weareenglish.com" className="text-cobalt hover:underline">
              support@weareenglish.com
            </a>
            . Instagram:{' '}
            <a
              href="https://www.instagram.com/weare__english/"
              target="_blank"
              rel="noreferrer"
              className="text-cherry hover:underline"
            >
              @weare__english
            </a>
          </p>
        </section>
      </div>
    </div>
  )
}
