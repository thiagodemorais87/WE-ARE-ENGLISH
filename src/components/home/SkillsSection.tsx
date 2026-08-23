import { Link } from 'react-router-dom'
import { skillCategories } from '@/data/categories'
import { CategoryCard } from '@/components/activities/CategoryCard'
import { FadeContent } from '@/components/motion/FadeContent'
import { BlurText } from '@/components/motion/BlurText'
import { SpotlightCard } from '@/components/motion/SpotlightCard'

export function SkillsSection() {
  return (
    <section className="bg-sand">
      <div className="container-wide px-4 py-16 sm:px-6">
        <BlurText
          text="Everything you need to practice English"
          className="display text-3xl text-ink sm:text-4xl"
          as="h2"
        />
        <FadeContent delay={0.1}>
          <p className="mt-3 max-w-2xl text-muted">
            Discover interactive activities across the skills that matter — built for daily
            practice, not long lectures.
          </p>
        </FadeContent>
        <div className="mt-8 grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {skillCategories.map((category, index) => {
            const skillParam =
              category.type && category.type !== 'trending' ? category.type : category.id
            return (
              <FadeContent key={category.id} delay={0.05 * index} className="h-full">
                <Link
                  to={`/activities?skill=${skillParam}`}
                  className="block h-full rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cherry"
                >
                  <SpotlightCard className="h-full rounded-2xl">
                    <CategoryCard category={category} tone="light" />
                  </SpotlightCard>
                </Link>
              </FadeContent>
            )
          })}
        </div>
      </div>
    </section>
  )
}
