import { useEffect, useState } from 'react'
import { PlatformHero } from '@/components/home/PlatformHero'
import { SkillsSection } from '@/components/home/SkillsSection'
import { HowItWorks } from '@/components/home/HowItWorks'
import { ExploreCatalog } from '@/components/home/ExploreCatalog'
import { ContinueLearning } from '@/components/home/ContinueLearning'
import { GenerateChallenge } from '@/components/home/GenerateChallenge'
import { useAuth } from '@/contexts/AuthContext'
import { greetingForHour } from '@/lib/labels'
import { fetchContinueLearning } from '@/services/activities/activity.service'
import type { Activity } from '@/types/activity'
import { FadeContent } from '@/components/motion/FadeContent'
import { SplitText } from '@/components/motion/SplitText'

export function HomePage() {
  const { isAuthenticated, user } = useAuth()
  const [continueList, setContinueList] = useState<Activity[]>([])

  useEffect(() => {
    if (!isAuthenticated || !user) return
    fetchContinueLearning(user.id).then(setContinueList)
  }, [isAuthenticated, user])

  return (
    <div>
      {isAuthenticated ? (
        <section className="container-wide px-4 pb-4 pt-10 sm:px-6">
          <SplitText
            text={`${greetingForHour()}, ${user?.name.split(' ')[0] ?? 'there'}`}
            className="text-2xl font-semibold text-sand sm:text-3xl"
            as="p"
          />
          <FadeContent delay={0.1}>
            <p className="mt-2 text-sand/65">Ready to practice English?</p>
          </FadeContent>
          <div className="mt-8 space-y-10">
            <FadeContent delay={0.15}>
              <ContinueLearning activities={continueList} />
            </FadeContent>
            <FadeContent delay={0.2}>
              <GenerateChallenge />
            </FadeContent>
          </div>
        </section>
      ) : (
        <>
          <PlatformHero />
          <SkillsSection />
          <HowItWorks />
        </>
      )}
      <ExploreCatalog />
    </div>
  )
}
