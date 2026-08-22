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
  return (
    voices.find((v) => v.lang === 'en-US') ??
    voices.find((v) => v.lang.startsWith('en')) ??
    null
  )
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

  const useFile = Boolean(src)
  const text = speakText?.trim() || ''
  const useTts = !useFile && Boolean(text) && ttsSupported
  const canPlay = useFile || useTts

  useEffect(() => {
    setTtsSupported(typeof window !== 'undefined' && 'speechSynthesis' in window)
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    // Chrome loads voices asynchronously
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
  }, [src, speakText])

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
    utter.rate = speed
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

  const toggle = async () => {
    if (useFile) {
      const el = audioRef.current
      if (!el || !src) return
      if (playing) {
        el.pause()
        setPlaying(false)
      } else {
        await el.play()
        setPlaying(true)
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
      el.currentTime = 0
      await el.play()
      setPlaying(true)
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
    <div className="rounded-2xl border border-white/10 bg-ink/40 p-4">
      {title ? <p className="mb-3 text-sm text-white/60">{title}</p> : null}
      {useTts ? (
        <p className="mb-3 text-xs text-white/45">Browser voice · transcript</p>
      ) : null}
      {useFile ? (
        <audio
          ref={audioRef}
          src={src ?? undefined}
          preload="metadata"
          onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
          onEnded={() => setPlaying(false)}
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
          className="rounded-full border border-white/15 px-3 py-2 text-xs text-white/70 disabled:opacity-40"
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
            <p className="mt-1 text-xs text-white/45">
              {format(progress)} / {format(duration)}
            </p>
          </div>
        ) : (
          <div className="min-w-[10rem] flex-1 text-xs text-white/45">
            {useTts ? 'Tap play to hear the passage' : 'No playable audio'}
          </div>
        )}
        <label className="flex items-center gap-2 text-xs text-white/55">
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
        <label className="flex items-center gap-2 text-xs text-white/55">
          Speed
          <select
            value={speed}
            onChange={(e) => {
              const v = Number(e.target.value)
              setSpeed(v)
              if (useFile && audioRef.current) audioRef.current.playbackRate = v
            }}
            className="rounded-lg border border-white/15 bg-ink px-2 py-1 text-white"
          >
            <option value={0.75}>0.75×</option>
            <option value={1}>1×</option>
            <option value={1.25}>1.25×</option>
            <option value={1.5}>1.5×</option>
          </select>
        </label>
      </div>
      {!canPlay ? (
        <p className="mt-3 text-xs text-amber-200/80">
          Audio is not available for this activity yet.
        </p>
      ) : null}
    </div>
  )
}
