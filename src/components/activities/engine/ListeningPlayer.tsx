import { useEffect, useRef, useState } from 'react'

type Props = {
  src?: string | null
  /** Spoken when there is no audio file (Web Speech API). */
  speakText?: string | null
  title?: string
}

function pickEnglishVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null
  const voices = window.speechSynthesis.getVoices()
  const score = (v: SpeechSynthesisVoice) => {
    const n = `${v.name} ${v.lang}`.toLowerCase()
    let s = 0
    if (v.lang === 'en-US') s += 10
    else if (v.lang.startsWith('en')) s += 4
    if (n.includes('google') && n.includes('us')) s += 8
    if (n.includes('microsoft') && (n.includes('aria') || n.includes('guy') || n.includes('jenny')))
      s += 7
    if (n.includes('samantha') || n.includes('alex') || n.includes('daniel')) s += 5
    if (n.includes('brazil') || n.includes('portuguese') || n.includes('pt-')) s -= 20
    return s
  }
  return [...voices].sort((a, b) => score(b) - score(a))[0] ?? null
}

export function ListeningPlayer({ src, speakText, title }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [speed, setSpeed] = useState(1)
  const [ttsSupported, setTtsSupported] = useState(false)
  /** When remote MP3 fails, fall back to browser TTS. */
  const [fileBroken, setFileBroken] = useState(false)

  const text = speakText?.trim() || ''
  const useFile = Boolean(src) && !fileBroken
  const useTts = !useFile && Boolean(text) && ttsSupported
  const canPlay = useFile || useTts

  useEffect(() => {
    setFileBroken(false)
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
    setPlaying(false)
    setProgress(0)
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    utteranceRef.current = null
  }, [src, speakText, fileBroken])

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
      utteranceRef.current = null
    }
  }, [])

  const startTts = () => {
    if (!text || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = 'en-US'
    utter.rate = 0.95
    utter.volume = volume
    const voice = pickEnglishVoice()
    if (voice) utter.voice = voice
    utter.onend = () => {
      setPlaying(false)
      utteranceRef.current = null
    }
    utter.onerror = () => {
      setPlaying(false)
      utteranceRef.current = null
    }
    utteranceRef.current = utter
    window.speechSynthesis.speak(utter)
    setPlaying(true)
  }

  const onFileError = () => {
    setPlaying(false)
    setFileBroken(true)
  }

  const toggle = async () => {
    if (useFile) {
      const el = audioRef.current
      if (!el || !src) return
      if (playing) {
        el.pause()
        setPlaying(false)
      } else {
        try {
          await el.play()
          setPlaying(true)
        } catch {
          onFileError()
        }
      }
      return
    }

    if (!useTts) return
    if (playing) {
      window.speechSynthesis.pause()
      setPlaying(false)
      return
    }
    if (window.speechSynthesis.paused && utteranceRef.current) {
      window.speechSynthesis.resume()
      setPlaying(true)
      return
    }
    startTts()
  }

  const replay = async () => {
    if (useFile) {
      const el = audioRef.current
      if (!el || !src) return
      try {
        el.currentTime = 0
        await el.play()
        setPlaying(true)
      } catch {
        onFileError()
      }
      return
    }
    if (!useTts) return
    startTts()
  }

  const format = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  return (
    <div className="rounded-2xl border border-edge bg-panel p-4">
      {title ? <p className="mb-2 text-sm font-medium text-fg">{title}</p> : null}
        {useFile ? (
        <p className="mb-3 text-xs text-fg-muted">Listen · native audio</p>
      ) : useTts ? (
        <p className="mb-3 text-xs text-fg-muted">
          {fileBroken
            ? 'Audio file unavailable · browser voice'
            : 'Listen · browser voice'}
        </p>
      ) : null}
      {useFile ? (
        <audio
          ref={audioRef}
          src={src ?? undefined}
          preload="metadata"
          onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
          onEnded={() => setPlaying(false)}
          onError={onFileError}
        />
      ) : null}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={toggle}
          disabled={!canPlay}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-cherry text-white disabled:opacity-40"
          aria-label={playing ? 'Pause' : 'Play'}
        >
          {playing ? '❚❚' : '▶'}
        </button>
        <button
          type="button"
          onClick={replay}
          disabled={!canPlay}
          className="rounded-full border border-edge px-3 py-2 text-xs text-fg-muted disabled:opacity-40"
        >
          Replay
        </button>
        {useFile ? (
          <div className="min-w-[10rem] flex-1">
            <input
              type="range"
              min={0}
              max={duration || 1}
              step={0.1}
              value={progress}
              onChange={(e) => {
                const v = Number(e.target.value)
                if (audioRef.current) audioRef.current.currentTime = v
                setProgress(v)
              }}
              className="w-full accent-soft-pink"
            />
            <p className="mt-1 text-xs text-fg-muted">
              {format(progress)} / {format(duration)}
            </p>
          </div>
        ) : (
          <div className="min-w-[10rem] flex-1 text-xs text-fg-muted">
            {useTts ? 'Tap Listen to hear the passage' : 'No playable audio'}
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
      {!canPlay ? (
        <p className="mt-3 text-xs text-amber-700 dark:text-amber-200/90">
          Audio is not available for this activity yet.
        </p>
      ) : null}
    </div>
  )
}
