import { useEffect, useRef, useState } from 'react'

export function useInView(rootMargin = '0px 0px -8% 0px', threshold = 0.15) {
  const ref = useRef<HTMLElement | null>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node || inView) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { rootMargin, threshold },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [inView, rootMargin, threshold])

  return { ref, inView }
}
