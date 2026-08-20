import { lazy, Suspense, useCallback, useState } from 'react'
import { AnimatePresence } from 'motion/react'
import { BrandLoader } from '@/components/layout/BrandLoader'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Hero } from '@/components/sections/Hero'
import { TodaysMessage } from '@/components/sections/TodaysMessage'
import { MeetTeacher } from '@/components/sections/MeetTeacher'
import { ExperienceStats } from '@/components/sections/ExperienceStats'
import { Specialties } from '@/components/sections/Specialties'

const LessonExperience = lazy(() =>
  import('@/components/sections/LessonExperience').then((m) => ({
    default: m.LessonExperience,
  })),
)
const LearningPaths = lazy(() =>
  import('@/components/sections/LearningPaths').then((m) => ({ default: m.LearningPaths })),
)
const PricingSection = lazy(() =>
  import('@/components/sections/PricingSection').then((m) => ({
    default: m.PricingSection,
  })),
)
const TestimonialsSection = lazy(() =>
  import('@/components/sections/TestimonialsSection').then((m) => ({
    default: m.TestimonialsSection,
  })),
)
const FinalCta = lazy(() =>
  import('@/components/sections/FinalCta').then((m) => ({ default: m.FinalCta })),
)

function SectionFallback() {
  return <div className="h-40 bg-sand" aria-hidden />
}

export function HomePage() {
  const [loading, setLoading] = useState(true)
  const onDone = useCallback(() => setLoading(false), [])

  return (
    <>
      <AnimatePresence>{loading ? <BrandLoader onDone={onDone} /> : null}</AnimatePresence>

      <div className={loading ? 'overflow-hidden h-dvh' : undefined}>
        <Navbar />
        <main>
          <Hero />
          <TodaysMessage />
          <MeetTeacher />
          <ExperienceStats />
          <Specialties />
          <Suspense fallback={<SectionFallback />}>
            <LessonExperience />
            <LearningPaths />
            <PricingSection />
            <TestimonialsSection />
            <FinalCta />
          </Suspense>
        </main>
        <Footer />
      </div>
    </>
  )
}
