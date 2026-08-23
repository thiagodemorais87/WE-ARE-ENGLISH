import { Link } from 'react-router-dom'
import { brand } from '@/data/brand'

export function PrivacyPage() {
  return (
    <div className="container-wide max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <Link to="/" className="text-sm text-fg-muted hover:text-fg">
        ← Home
      </Link>
      <h1 className="mt-4 display text-4xl text-fg sm:text-5xl">Privacy Policy</h1>
      <p className="mt-2 text-sm text-fg-muted">WE ARE ENGLISH · Last updated: August 2026</p>
      <p className="mt-4 text-fg-muted">
        This policy describes how {brand.name} collects, uses and protects information when you use
        our English practice platform.
      </p>

      <div className="mt-10 space-y-8 text-sm leading-relaxed text-fg-muted sm:text-base">
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-fg">1. Who we are</h2>
          <p>
            WE ARE ENGLISH operates an interactive learning website where learners practice English
            through activities (listening, writing, grammar, vocabulary, music, video and games).
            Contact: support@weareenglish.com.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-fg">2. Information we collect</h2>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <strong className="text-fg">Account data</strong> — name, email and credentials you
              provide when you sign up.
            </li>
            <li>
              <strong className="text-fg">Learning data</strong> — activity attempts, scores,
              completion status, favorites and progress history.
            </li>
            <li>
              <strong className="text-fg">Device preferences</strong> — theme and similar settings
              stored in your browser (localStorage).
            </li>
            <li>
              <strong className="text-fg">Support messages</strong> — questions you send via FAQ or
              email.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-fg">3. How we use your information</h2>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Create and secure your account.</li>
            <li>Save progress, scores and “continue learning” history.</li>
            <li>Improve activities and fix technical issues.</li>
            <li>Respond to support requests.</li>
          </ul>
          <p>We do not sell your personal information.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-fg">4. Cookies and local storage</h2>
          <p>
            We use browser storage for session/auth state, theme preference, cart drafts and FAQ
            questions saved on your device. You can clear site data in your browser settings at any
            time.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-fg">5. Third-party services</h2>
          <p>
            Some activities embed media from YouTube or similar providers. Those services may collect
            data under their own policies. Authentication and database hosting (when enabled) may be
            provided by Supabase or equivalent infrastructure, processing data only to run the
            platform.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-fg">6. Your rights</h2>
          <p>
            You may request access, correction or deletion of your account data by emailing{' '}
            <a href="mailto:support@weareenglish.com" className="text-cobalt hover:underline">
              support@weareenglish.com
            </a>
            . We will respond within a reasonable time.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-fg">7. Children</h2>
          <p>
            If you are under the age required to use online services in your country, please use WE
            ARE ENGLISH only with a parent or guardian’s permission.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-fg">8. Changes</h2>
          <p>
            We may update this policy as the product evolves. The “Last updated” date at the top
            will change when we do.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-fg">9. Contact</h2>
          <p>
            Privacy questions: support@weareenglish.com · Instagram:{' '}
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
