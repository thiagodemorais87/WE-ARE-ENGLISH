import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ActivityPlayer } from '@/components/activities/ActivityPlayer'
import type { EngineActivityProps } from './types'
import type { PronunciationContent } from '@/types/activity'

function pickUsEnglishVoice(): SpeechSynthesisVoice | null {
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
    if (n.includes('enhanced') || n.includes('premium') || n.includes('neural')) s += 3
    if (n.includes('brazil') || n.includes('portuguese') || n.includes('pt-')) s -= 20
    return s
  }
  return [...voices].sort((a, b) => score(b) - score(a))[0] ?? null
}

function speakNative(text: string) {
  try {
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'en-US'
    u.rate = 0.95
    u.pitch = 1
    const voice = pickUsEnglishVoice()
    if (voice) u.voice = voice
    window.speechSynthesis.speak(u)
  } catch {
    /* ignore */
  }
}

function pickRecorderMime(): string {
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4']
  for (const t of candidates) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(t)) return t
  }
  return ''
}

type PhraseItem = { text: string; tips?: string; focus?: string }

export function PronunciationActivity({ activity, onComplete, onBack }: EngineActivityProps) {
  const navigate = useNavigate()
  const content = (activity.content ?? {}) as PronunciationContent

  const phrases: PhraseItem[] = useMemo(() => {
    if (content.items?.length) {
      return content.items.map((it) => ({
        text: it.text,
        tips: it.tips ?? content.tips,
        focus: it.focus ?? content.focus,
      }))
    }
    return [
      {
        text: content.text?.trim() || activity.title,
        tips: content.tips,
        focus: content.focus,
      },
    ]
  }, [activity.title, content.focus, content.items, content.text, content.tips])

  const [itemIndex, setItemIndex] = useState(0)
  const current = phrases[itemIndex] ?? phrases[0]!
  const phrase = current.text
  const isLast = itemIndex >= phrases.length - 1
  const multi = phrases.length > 1

  const mediaRef = useRef<MediaRecorder | null>(null)
  const chunks = useRef<Blob[]>([])
  const objectUrlRef = useRef<string | null>(null)
  const levelRaf = useRef<number | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)

  const [step, setStep] = useState(1)
  const [recording, setRecording] = useState(false)
  const [level, setLevel] = useState(0)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [micError, setMicError] = useState<string | null>(null)
  const [ttsWarning, setTtsWarning] = useState(false)
  const [finished, setFinished] = useState(false)
  const [practiced, setPracticed] = useState<Record<number, boolean>>({})

  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    const warm = () => void window.speechSynthesis.getVoices()
    warm()
    window.speechSynthesis.addEventListener('voiceschanged', warm)
    return () => window.speechSynthesis.removeEventListener('voiceschanged', warm)
  }, [])

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
      if (levelRaf.current) cancelAnimationFrame(levelRaf.current)
      void audioCtxRef.current?.close()
    }
  }, [])

  const clearRecording = () => {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    objectUrlRef.current = null
    setAudioUrl(null)
  }

  const playNative = () => {
    setTtsWarning(false)
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      setTtsWarning(true)
      return
    }
    speakNative(phrase)
  }

  const stopMeter = () => {
    if (levelRaf.current) cancelAnimationFrame(levelRaf.current)
    levelRaf.current = null
    setLevel(0)
    void audioCtxRef.current?.close()
    audioCtxRef.current = null
  }

  const startMeter = (stream: MediaStream) => {
    try {
      const ctx = new AudioContext()
      audioCtxRef.current = ctx
      const source = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)
      const data = new Uint8Array(analyser.frequencyBinCount)
      const tick = () => {
        analyser.getByteFrequencyData(data)
        let sum = 0
        for (let i = 0; i < data.length; i++) sum += data[i]!
        setLevel(Math.min(1, sum / (data.length * 80)))
        levelRaf.current = requestAnimationFrame(tick)
      }
      tick()
    } catch {
      /* meter optional */
    }
  }

  const startRecording = async () => {
    setMicError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
        },
      })
      const mime = pickRecorderMime()
      const rec = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream)
      chunks.current = []
      rec.ondataavailable = (e) => {
        if (e.data.size) chunks.current.push(e.data)
      }
      rec.onstop = () => {
        stopMeter()
        stream.getTracks().forEach((t) => t.stop())
        const type = mime || 'audio/webm'
        const blob = new Blob(chunks.current, { type })
        if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
        const url = URL.createObjectURL(blob)
        objectUrlRef.current = url
        setAudioUrl(url)
        setStep(3)
        setPracticed((prev) => ({ ...prev, [itemIndex]: true }))
      }
      mediaRef.current = rec
      startMeter(stream)
      rec.start(250)
      setRecording(true)
    } catch {
      setMicError('Microphone access was denied or is unavailable. Allow the mic and try again.')
    }
  }

  const stopRecording = () => {
    mediaRef.current?.stop()
    setRecording(false)
  }

  const goNextPhrase = () => {
    if (isLast) return
    clearRecording()
    setMicError(null)
    setStep(1)
    setItemIndex((i) => i + 1)
  }

  const finish = () => {
    if (!audioUrl || finished) return
    if (multi && !isLast) {
      goNextPhrase()
      return
    }
    setFinished(true)
    onComplete?.({
      answer: {
        recorded: true,
        text: phrase,
        focus: current.focus ?? content.focus ?? null,
        itemsPracticed: phrases.map((p) => p.text),
        phraseCount: phrases.length,
      },
      score: 100,
      feedback: { mode: 'compare_only' },
    })
  }

  const allPracticed = phrases.every((_, i) => practiced[i])

  return (
    <ActivityPlayer
      activity={activity}
      step={step}
      totalSteps={3}
      onBack={onBack ?? (() => navigate(`/activity/${activity.id}`))}
    >
      <div className="space-y-5">
        <div>
          {multi ? (
            <p className="text-xs font-semibold uppercase tracking-wider text-fg-muted">
              Phrase {itemIndex + 1} of {phrases.length}
            </p>
          ) : null}
          {current.focus || content.focus ? (
            <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-soft-pink">
              Focus: {current.focus ?? content.focus}
            </p>
          ) : null}
          <p className="mt-2 text-2xl font-semibold leading-snug text-fg sm:text-3xl">
            “{phrase}”
          </p>
          {current.tips || content.tips ? (
            <p className="mt-3 text-sm text-fg-muted">{current.tips ?? content.tips}</p>
          ) : null}
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <p className="text-sm text-fg-muted">
              Listen to a clear model. Then continue when ready.
            </p>
            <button
              type="button"
              onClick={playNative}
              className="rounded-full bg-cobalt px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white"
            >
              Listen
            </button>
            {ttsWarning ? (
              <p className="text-sm text-amber-800 dark:text-amber-200">
                Speech playback is unavailable in this browser. You can still record yourself.
              </p>
            ) : null}
            <div>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="rounded-full bg-cherry px-6 py-3 text-sm font-bold uppercase tracking-wide text-white"
              >
                Continue to record
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-fg-muted">
              Speak clearly into the mic. Watch the meter — it should move when you talk.
            </p>
            {!recording ? (
              <button
                type="button"
                onClick={startRecording}
                className="rounded-full bg-cherry px-6 py-3 text-sm font-bold uppercase tracking-wide text-white"
              >
                Record yourself
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-cherry">Recording…</p>
                <div className="h-2 overflow-hidden rounded-full bg-panel-strong">
                  <div
                    className="h-full rounded-full bg-cobalt transition-[width] duration-75"
                    style={{ width: `${Math.round(level * 100)}%` }}
                  />
                </div>
                <button
                  type="button"
                  onClick={stopRecording}
                  className="rounded-full bg-cobalt px-6 py-3 text-sm font-bold uppercase tracking-wide text-white"
                >
                  Stop
                </button>
              </div>
            )}
            {micError ? (
              <div className="space-y-2">
                <p className="text-sm text-red-700 dark:text-red-300">{micError}</p>
                <button
                  type="button"
                  onClick={startRecording}
                  className="rounded-full border border-edge bg-panel px-4 py-2 text-sm font-semibold text-fg hover:bg-panel-strong"
                >
                  Try again
                </button>
              </div>
            ) : null}
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-sm text-fg-muted underline-offset-2 hover:underline"
            >
              Back to listen
            </button>
          </div>
        )}

        {step === 3 && audioUrl && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-fg">Your pronunciation</h3>
            <p className="text-fg-muted">{phrase}</p>
            <audio controls src={audioUrl} className="w-full" />
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={playNative}
                className="rounded-full border border-edge bg-panel px-5 py-2.5 text-sm font-semibold text-fg hover:bg-panel-strong"
              >
                Play native again
              </button>
              <button
                type="button"
                onClick={() => {
                  clearRecording()
                  setStep(2)
                }}
                className="rounded-full border border-edge bg-panel px-5 py-2.5 text-sm font-semibold text-fg hover:bg-panel-strong"
              >
                Record again
              </button>
            </div>
            {!finished ? (
              <button
                type="button"
                onClick={finish}
                disabled={multi && isLast && !allPracticed && !practiced[itemIndex]}
                className="rounded-full bg-cherry px-6 py-3 text-sm font-bold uppercase tracking-wide text-white disabled:opacity-50"
              >
                {multi && !isLast ? 'Next phrase' : 'Finish activity'}
              </button>
            ) : (
              <p className="text-sm text-cobalt">Progress saved. Keep practicing!</p>
            )}
          </div>
        )}
      </div>
    </ActivityPlayer>
  )
}
