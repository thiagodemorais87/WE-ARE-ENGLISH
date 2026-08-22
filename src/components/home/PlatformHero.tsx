import { Link } from 'react-router-dom'
import { brand } from '@/data/brand'
import { activities } from '@/data/activities'
import { useAuth } from '@/contexts/AuthContext'
import { SplitText } from '@/components/motion/SplitText'
import { BlurText } from '@/components/motion/BlurText'
import { FadeContent } from '@/components/motion/FadeContent'
import { GlareHover } from '@/components/motion/GlareHover'
import { thumbnailStyle } from '@/lib/thumbnail'

export function PlatformHero() {
  const { isAuthenticated } = useAuth()
  const preview = activities.slice(0, 5)

  return (
    <section className="relative overflow-hidden border-b border-ink/8 bg-sand">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-cherry/20 blur-3xl" />
        <div className="absolute -right-10 bottom-0 h-80 w-80 rounded-full bg-cobalt/15 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_transparent_20%,_#f3f3e9_75%)]" />
      </div>

      <div className="container-wide relative grid items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
        <div>
          <SplitText
            text={brand.name}
            className="display text-4xl text-ink sm:text-5xl lg:text-6xl"
            as="p"
          />
          <BlurText
            text={brand.tagline}
            className="mt-4 text-2xl font-semibold text-cherry sm:text-3xl"
            as="h1"
            delay={0.15}
          />
          <FadeContent delay={0.2}>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
              {brand.heroSubtitle}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <GlareHover className="rounded-full">
                <Link
                  to={isAuthenticated ? '/activities' : '/#explore'}
                  className="inline-flex rounded-full bg-cherry px-6 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-lift"
                >
                  Explore Activities
                </Link>
              </GlareHover>
              {!isAuthenticated && (
                <Link
                  to="/signup"
                  className="rounded-full border border-ink/15 bg-white/60 px-6 py-3 text-sm font-bold uppercase tracking-wide text-ink transition hover:bg-white"
                >
                  Create Free Account
                </Link>
              )}
            </div>
          </FadeContent>
        </div>

        <FadeContent delay={0.25} className="relative mx-auto h-[280px] w-full max-w-md sm:h-[340px]">
          {preview.map((item, index) => (
            <div
              key={item.id}
              className="absolute w-[70%] overflow-hidden rounded-2xl border border-ink/10 shadow-lift transition"
              style={{
                ...thumbnailStyle(item.thumbnail),
                top: `${index * 28}px`,
                left: `${index * 18}px`,
                zIndex: preview.length - index,
                transform: `rotate(${index % 2 === 0 ? -3 : 4}deg)`,
              }}
            >
              <div className="flex aspect-[16/10] items-end bg-gradient-to-t from-ink/80 to-transparent p-4">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-white/70">{item.type}</p>
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                </div>
              </div>
            </div>
          ))}
        </FadeContent>
      </div>
    </section>
  )
}
