import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { FadeContent } from '@/components/motion/FadeContent'
import { BlurText } from '@/components/motion/BlurText'

const steps = [
  { n: '01', title: 'Create your account' },
  { n: '02', title: 'Choose an activity' },
  { n: '03', title: 'Practice at your level' },
  { n: '04', title: 'Track your progress' },
]

export function HowItWorks() {
  const { isAuthenticated } = useAuth()

  return (
    <section className="border-y border-ink/8 bg-soft-pink/25">
      <div className="container-wide px-4 py-16 sm:px-6">
        <BlurText text="How it works" className="display text-3xl text-ink sm:text-4xl" as="h2" />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <FadeContent key={step.n} delay={0.08 * index} className="space-y-2">
              <p className="display text-4xl text-cherry">{step.n}</p>
              <p className="text-lg font-semibold text-ink">{step.title}</p>
            </FadeContent>
          ))}
        </div>
        <FadeContent delay={0.35}>
          <Link
            to={isAuthenticated ? '/activities' : '/signup'}
            className="mt-10 inline-flex rounded-full bg-cobalt px-6 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-lift"
          >
            Start Learning
          </Link>
        </FadeContent>
      </div>
    </section>
  )
}
