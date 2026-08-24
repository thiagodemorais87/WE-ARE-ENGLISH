import { useEffect, useRef, useState } from 'react'

type Props = {
  src?: string | null
  /** Spoken only when there is no audio file (Web Speech API). */
  speakText?: string | null
  title?: string
}

const WORDS_PER_MINUTE = 150

function pickEnglishVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null
  const voices = window.speechSynthesis.getVoices()
  if (!voices.length) return null
  const score = (v: SpeechSynthesisVoice) => {
    const n = `${v.name} ${v.lang}`.toLowerCase()
    let s = 0
    if (v.lang === 'en-US') s += 10
    else if (v.lang === 'en-GB') s += 8
    else if (v.lang.startsWith('en')) s += 4
    if (n.includes('neural') || n.includes('natural') || n.includes('premium')) s += 6
    if (n.includes('google') && n.includes('us')) s += 8
    if (n.includes('microsoft') && (n.includes('aria') || n.includes('guy') || n.includes('jenny')))
      s += 7
    if (n.includes('samantha') || n.includes('alex') || n.includes('daniel')) s += 5
    if (n.includes('brazil') || n.includes('portuguese') || n.includes('pt-') || n.includes('pt_br'))
      s -= 20
    if (v.localService) s -= 2
    return s
  }
  return [...voices].sort((a, b) => score(b) - score(a))[0] ?? null
}

function estimateTtsDurationSeconds(text: string, rate: number): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length
  const wpm = WORDS_PER_MINUTE * Math.max(0.5, rate)
  return Math.max(1, (words * 60) / wpm)
}

function formatTime(s: number) {
  const safe = Number.isFinite(s) && s >= 0 ? s : 0
  const m = Math.floor(safe / 60)
  const sec = Math.floor(safe % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

function isAutoplayBlocked(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false
  const name = 'name' in err ? String((err as { name?: string }).name) : ''
  return name === 'NotAllowedError' || name === 'AbortError'
}

export function ListeningPlayer({ src, speakText, title }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const ttsStartRef = useRef(0)
  const ttsPausedAtRef = useRef(0)
  const ttsTickRef = useRef<number | null>(null)
  const seekResumeRef = useRef(false)

  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [speed, setSpeed] = useState(1)
  const [ttsSupported, setTtsSupported] = useState(false)
  /** Load/decode failure — never switches to TTS when src exists. */
  const [fileBroken, setFileBroken] = useState(false)
  const [playBlocked, setPlayBlocked] = useState(false)

  const text = speakText?.trim() || ''
  const hasSrc = Boolean(src)
  const useFile = hasSrc && !fileBroken
  const useTts = !hasSrc && Boolean(text) && ttsSupported
  const canPlay = useFile || useTts

  const stopTtsTick = () => {
    if (ttsTickRef.current != null) {
      window.clearInterval(ttsTickRef.current)
      ttsTickRef.current = null
    }
  }

  const startTtsTick = (estimated: number) => {
    stopTtsTick()
    ttsTickRef.current = window.setInterval(() => {
      const elapsed = (Date.now() - ttsStartRef.current) / 1000
      const next = Math.min(estimated, elapsed + ttsPausedAtRef.current)
      setProgress(next)
      if (next >= estimated - 0.05) stopTtsTick()
    }, 100)
  }

  useEffect(() => {
    setFileBroken(false)
    setPlayBlocked(false)
  }, [src])

  useEffect(() => {
    setTtsSupported(typeof window !== 'undefined' && 'speechSynthesis' in window)
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    const warm = () => {
      void window.speechSynthesis.getVoices()
    }
    warm()
    window.speechSynthesis.addEventListener('voiceschanged', warm)
    return () => window.speechSynthesis.removeEventListener('voiceschanged', warm)
  }, [])

  useEffect(() => {
    const el = audioRef.current
    if (!el || !useFile) return
    el.volume = volume
    el.playbackRate = speed
  }, [volume, speed, useFile])

  useEffect(() => {
    if (!useTts || !text) {
      if (!useFile) setDuration(0)
      return
    }
    setDuration(estimateTtsDurationSeconds(text, 0.95 * speed))
  }, [text, speed, useTts, useFile])

  useEffect(() => {
    setPlaying(false)
    setProgress(0)
    ttsPausedAtRef.current = 0
    stopTtsTick()
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    utteranceRef.current = null
  }, [src, speakText, fileBroken])

  useEffect(() => {
    return () => {
      stopTtsTick()
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
      utteranceRef.current = null
    }
  }, [])

  const retryFile = () => {
    setFileBroken(false)
    setPlayBlocked(false)
    setProgress(0)
    setPlaying(false)
    // Keep <audio> mounted when broken so reload works immediately
    const el = audioRef.current
    if (el) {
      el.load()
    }
  }

  const finishTts = () => {
    stopTtsTick()
    setPlaying(false)
    setProgress(duration || estimateTtsDurationSeconds(text, 0.95 * speed))
    ttsPausedAtRef.current = 0
    utteranceRef.current = null
  }

  const startTts = (fromSeconds = 0) => {
    if (!text || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    stopTtsTick()

    const rate = 0.95 * speed
    const estimated = estimateTtsDurationSeconds(text, rate)
    setDuration(estimated)

    let speakBody = text
    if (fromSeconds > 0.4 && estimated > 0) {
      const words = text.trim().split(/\s+/).filter(Boolean)
      const startWord = Math.min(
        words.length - 1,
        Math.floor((fromSeconds / estimated) * words.length),
      )
      speakBody = words.slice(Math.max(0, startWord)).join(' ') || text
    }

    const utter = new SpeechSynthesisUtterance(speakBody)
    utter.lang = 'en-US'
    utter.rate = rate
    utter.volume = volume
    const voice = pickEnglishVoice()
    if (voice) utter.voice = voice
    utter.onend = () => {
      if (seekResumeRef.current) {
        seekResumeRef.current = false
        return
      }
      finishTts()
    }
    utter.onerror = () => {
      if (seekResumeRef.current) {
        seekResumeRef.current = false
        return
      }
      stopTtsTick()
      setPlaying(false)
      utteranceRef.current = null
    }
    utteranceRef.current = utter
    ttsPausedAtRef.current = fromSeconds
    ttsStartRef.current = Date.now()
    setProgress(fromSeconds)
    window.speechSynthesis.speak(utter)
    setPlaying(true)
    startTtsTick(estimated)
  }

  const onFileMediaError = () => {
    setPlaying(false)
    setFileBroken(true)
  }

  const toggle = async () => {
    if (hasSrc) {
      if (fileBroken) return
      const el = audioRef.current
      if (!el || !src) return
      if (!el.paused) {
        el.pause()
        return
      }
      setPlayBlocked(false)
      try {
        await el.play()
      } catch (err) {
        if (isAutoplayBlocked(err)) {
          setPlayBlocked(true)
          return
        }
        onFileMediaError()
      }
      return
    }

    if (!useTts) return

    if (playing) {
      setPlaying(false)
      const elapsed = (Date.now() - ttsStartRef.current) / 1000
      ttsPausedAtRef.current = Math.min(
        duration || estimateTtsDurationSeconds(text, 0.95 * speed),
        ttsPausedAtRef.current + elapsed,
      )
      setProgress(ttsPausedAtRef.current)
      stopTtsTick()
      try {
        window.speechSynthesis.pause()
      } catch {
        /* ignore */
      }
      if (!window.speechSynthesis.paused && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel()
        utteranceRef.current = null
      }
      return
    }

    const pausedAt = ttsPausedAtRef.current
    const est = duration || estimateTtsDurationSeconds(text, 0.95 * speed)
    if (pausedAt > 0.2 && pausedAt < est - 0.3) {
      if (window.speechSynthesis.paused && utteranceRef.current) {
        try {
          window.speechSynthesis.resume()
          ttsStartRef.current = Date.now()
          setPlaying(true)
          startTtsTick(est)
          return
        } catch {
          /* fall through */
        }
      }
      startTts(pausedAt)
      return
    }

    startTts(0)
  }

  const replay = async () => {
    if (hasSrc) {
      if (fileBroken) return
      const el = audioRef.current
      if (!el || !src) return
      setPlayBlocked(false)
      try {
        el.currentTime = 0
        await el.play()
      } catch (err) {
        if (isAutoplayBlocked(err)) {
          setPlayBlocked(true)
          return
        }
        onFileMediaError()
      }
      return
    }
    if (!useTts) return
    ttsPausedAtRef.current = 0
    startTts(0)
  }

  const onSeek = (v: number) => {
    if (useFile) {
      if (audioRef.current) audioRef.current.currentTime = v
      setProgress(v)
      return
    }
    if (!useTts) return
    const est = duration || estimateTtsDurationSeconds(text, 0.95 * speed)
    const clamped = Math.max(0, Math.min(est, v))
    setProgress(clamped)
    ttsPausedAtRef.current = clamped
    if (playing) {
      seekResumeRef.current = true
      window.speechSynthesis.cancel()
      startTts(clamped)
    }
  }

  return (
    <div className="rounded-2xl border border-edge bg-panel p-4">
      {title ? <p className="mb-2 text-sm font-medium text-fg">{title}</p> : null}
      {useFile ? (
        <p className="mb-3 text-xs text-fg-muted">Listen · native audio</p>
      ) : hasSrc && fileBroken ? (
        <div className="mb-3 space-y-2">
          <p className="text-xs text-fg-muted">Audio file unavailable</p>
          <p className="text-xs text-amber-700 dark:text-amber-200/90">
            Native audio failed to load. Try again — we will not switch to the browser voice.
          </p>
          <button
            type="button"
            onClick={retryFile}
            className="rounded-full border border-edge px-3 py-1.5 text-xs text-fg-muted"
          >
            Try again
          </button>
        </div>
      ) : useTts ? (
        <div className="mb-3 space-y-1">
          <p className="text-xs text-fg-muted">Listen · browser voice</p>
          <p className="text-xs text-amber-700 dark:text-amber-200/90">
            Native audio is not available yet. Quality depends on your browser’s built-in voice.
          </p>
        </div>
      ) : null}
      {playBlocked ? (
        <p className="mb-3 text-xs text-amber-700 dark:text-amber-200/90">
          Playback was blocked by the browser. Press Play again.
        </p>
      ) : null}
      {hasSrc ? (
        <audio
          ref={audioRef}
          src={src ?? undefined}
          preload="auto"
          onTimeUpdate={(e) => {
            if (!fileBroken) setProgress(e.currentTarget.currentTime)
          }}
          onLoadedMetadata={(e) => {
            setDuration(e.currentTarget.duration || 0)
            setFileBroken(false)
          }}
          onPlay={() => {
            setPlaying(true)
            setPlayBlocked(false)
            setFileBroken(false)
          }}
          onPause={() => setPlaying(false)}
          onEnded={() => {
            setPlaying(false)
            setProgress(0)
          }}
          onError={onFileMediaError}
        />
      ) : null}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void toggle()}
          disabled={!canPlay}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-cherry text-white disabled:opacity-40"
          aria-label={playing ? 'Pause' : 'Play'}
        >
          {playing ? '❚❚' : '▶'}
        </button>
        <button
          type="button"
          onClick={() => void replay()}
          disabled={!canPlay}
          className="rounded-full border border-edge px-3 py-2 text-xs text-fg-muted disabled:opacity-40"
        >
          Replay
        </button>
        {canPlay ? (
          <div className="min-w-[10rem] flex-1">
            <input
              type="range"
              min={0}
              max={duration || 1}
              step={0.1}
              value={Math.min(progress, duration || 1)}
              onChange={(e) => onSeek(Number(e.target.value))}
              className="w-full accent-soft-pink"
              aria-label="Seek"
            />
            <p className="mt-1 text-xs text-fg-muted">
              {formatTime(progress)} / {formatTime(duration)}
            </p>
          </div>
        ) : (
          <div className="min-w-[10rem] flex-1 text-xs text-fg-muted">
            {hasSrc && fileBroken ? 'Fix audio to play' : 'No playable audio'}
          </div>
        )}
        <label className="flex items-center gap-2 text-xs text-fg-muted">
          Vol
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={(e) => {
              const v = Number(e.target.value)
              setVolume(v)
              if (useFile && audioRef.current) audioRef.current.volume = v
            }}
            className="w-20 accent-cobalt"
          />
        </label>
        <label className="flex items-center gap-2 text-xs text-fg-muted">
          Speed
          <select
            value={speed}
            onChange={(e) => {
              const v = Number(e.target.value)
              setSpeed(v)
              if (useFile && audioRef.current) audioRef.current.playbackRate = v
            }}
            className="rounded-lg border border-edge bg-surface px-2 py-1 text-fg"
          >
            <option value={0.75}>0.75×</option>
            <option value={1}>1×</option>
            <option value={1.25}>1.25×</option>
            <option value={1.5}>1.5×</option>
          </select>
        </label>
      </div>
      {!canPlay && !(hasSrc && fileBroken) ? (
        <p className="mt-3 text-xs text-amber-700 dark:text-amber-200/90">
          Audio is not available for this activity yet.
        </p>
      ) : null}
    </div>
  )
}
