import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ActivityPlayer } from '@/components/activities/ActivityPlayer'
import type { EngineActivityProps } from './types'
import type { PronunciationContent } from '@/types/activity'

function speakNative(text: string) {
  try {
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'en-US'
    window.speechSynthesis.speak(u)
  } catch {
    /* ignore — UI shows soft warning if needed */
  }
}

export function PronunciationActivity({ activity, onComplete, onBack }: EngineActivityProps) {
  const navigate = useNavigate()
  const content = (activity.content ?? {}) as PronunciationContent
  const phrase = content.text?.trim() || activity.title

  const mediaRef = useRef<MediaRecorder | null>(null)
  const chunks = useRef<Blob[]>([])
  const objectUrlRef = useRef<string | null>(null)

  const [step, setStep] = useState(1)
  const [recording, setRecording] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [micError, setMicError] = useState<string | null>(null)
  const [ttsWarning, setTtsWarning] = useState(false)
  const [finished, setFinished] = useState(false)

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    }
  }, [])

  const playNative = () => {
    setTtsWarning(false)
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      setTtsWarning(true)
      return
    }
    speakNative(phrase)
  }

  const startRecording = async () => {
    setMicError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const rec = new MediaRecorder(stream)
      chunks.current = []
      rec.ondataavailable = (e) => {
        if (e.data.size) chunks.current.push(e.data)
      }
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop())
        const blob = new Blob(chunks.current, { type: 'audio/webm' })
        if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
        const url = URL.createObjectURL(blob)
        objectUrlRef.current = url
        setAudioUrl(url)
        setStep(3)
      }
      mediaRef.current = rec
      rec.start()
      setRecording(true)
    } catch {
      setMicError('Microphone access was denied or is unavailable. Allow the mic and try again.')
    }
  }

  const stopRecording = () => {
    mediaRef.current?.stop()
    setRecording(false)
  }

  const finish = () => {
    if (!audioUrl || finished) return
    setFinished(true)
    onComplete?.({
      answer: { recorded: true, text: phrase, focus: content.focus ?? null },
      score: 100,
      feedback: { mode: 'compare_only' },
    })
  }

  return (
    <ActivityPlayer
      activity={activity}
      step={step}
      totalSteps={3}
      onBack={onBack ?? (() => navigate(`/activity/${activity.id}`))}
    >
      <div className="space-y-5">
        <div>
          {content.focus ? (
            <p className="text-xs font-semibold uppercase tracking-wider text-soft-pink">
              Focus: {content.focus}
            </p>
          ) : null}
          <p className="mt-2 text-2xl font-semibold leading-snug text-fg sm:text-3xl">
            “{phrase}”
          </p>
          {content.tips ? <p className="mt-3 text-sm text-fg-muted">{content.tips}</p> : null}
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <p className="text-sm text-fg-muted">Listen to the native model, then continue to record.</p>
            <button
              type="button"
              onClick={playNative}
              className="rounded-full bg-cobalt px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white"
            >
              Native pronunciation
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
            <p className="text-sm text-fg-muted">Record yourself saying the phrase clearly.</p>
            {!recording ? (
              <button
                type="button"
                onClick={startRecording}
                className="rounded-full bg-cherry px-6 py-3 text-sm font-bold uppercase tracking-wide text-white"
              >
                Record yourself
              </button>
            ) : (
              <button
                type="button"
                onClick={stopRecording}
                className="rounded-full bg-cobalt px-6 py-3 text-sm font-bold uppercase tracking-wide text-white"
              >
                Stop
              </button>
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
                  setAudioUrl(null)
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
                className="rounded-full bg-cherry px-6 py-3 text-sm font-bold uppercase tracking-wide text-white"
              >
                Finish activity
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
