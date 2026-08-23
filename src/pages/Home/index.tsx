import { useEffect, useState } from 'react'
import { PlatformHero } from '@/components/home/PlatformHero'
import { SkillsSection } from '@/components/home/SkillsSection'
import { HowItWorks } from '@/components/home/HowItWorks'
import { ExploreCatalog } from '@/components/home/ExploreCatalog'
import { ContinueLearning } from '@/components/home/ContinueLearning'
import { GenerateChallenge } from '@/components/home/GenerateChallenge'
import { DailyChallenge } from '@/components/home/DailyChallenge'
import { useAuth } from '@/contexts/AuthContext'
import { greetingForHour } from '@/lib/labels'
import {
  fetchContinueLearning,
  getDailyChallenge,
  isDailyChallengeCompletedToday,
} from '@/services/activities/activity.service'
import type { Activity } from '@/types/activity'
import { FadeContent } from '@/components/motion/FadeContent'
import { SplitText } from '@/components/motion/SplitText'

export function HomePage() {
  const { isAuthenticated, user } = useAuth()
  const [continueList, setContinueList] = useState<Activity[]>([])
  const [daily, setDaily] = useState<Activity | null>(null)
  const [dailyDone, setDailyDone] = useState(false)
  const [dailyLoading, setDailyLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setDailyLoading(true)
    getDailyChallenge().then(async (activity) => {
      if (cancelled) return
      setDaily(activity)
      if (activity && user) {
        const done = await isDailyChallengeCompletedToday(user.id, activity.id)
        if (!cancelled) setDailyDone(done)
      } else {
        setDailyDone(false)
      }
      if (!cancelled) setDailyLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [user])

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
            className="text-2xl font-semibold text-fg sm:text-3xl"
            as="p"
          />
          <FadeContent delay={0.1}>
            <p className="mt-2 text-fg-muted">Ready to practice English?</p>
          </FadeContent>
          <div className="mt-8 space-y-10">
            <FadeContent delay={0.12}>
              <DailyChallenge
                activity={daily}
                completedToday={dailyDone}
                loading={dailyLoading}
              />
            </FadeContent>
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
          <section className="container-wide px-4 py-10 sm:px-6">
            <DailyChallenge activity={daily} loading={dailyLoading} />
          </section>
          <SkillsSection />
          <HowItWorks />
        </>
      )}
      <ExploreCatalog />
    </div>
  )
}
