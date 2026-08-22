import { useCallback, useEffect, useState } from 'react'
import { useReducedMotion } from 'motion/react'

const STORAGE_KEY = 'wae_intro_seen'

export function useIntroLoader(durationMs = 2200) {
  const reduce = useReducedMotion()
  const [show, setShow] = useState(() => {
    try {
      return sessionStorage.getItem(STORAGE_KEY) !== '1'
    } catch {
      return true
    }
  })

  const finish = useCallback(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, '1')
    } catch {
      /* ignore */
    }
    setShow(false)
  }, [])

  useEffect(() => {
    if (!show) return
    const ms = reduce ? 400 : durationMs
    const id = window.setTimeout(finish, ms)
    return () => window.clearTimeout(id)
  }, [durationMs, finish, reduce, show])

  return { show, finish }
}
