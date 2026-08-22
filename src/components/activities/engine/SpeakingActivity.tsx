import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ActivityPlayer, FeedbackBanner } from '@/components/activities/ActivityPlayer'
import { isSupabaseConfigured } from '@/lib/supabase/client'
import { scoreSpeaking } from '@/lib/integrations/speechace'
import type { EngineActivityProps } from './types'
import type { SpeakingContent, SpeakingResult } from '@/types/activity'

async function blobToBase64(blob: Blob): Promise<string> {
  const buf = await blob.arrayBuffer()
  let binary = ''
  const bytes = new Uint8Array(buf)
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary)
}

export function SpeakingActivity({ activity, onComplete, onBack }: EngineActivityProps) {
  const navigate = useNavigate()
  const content = (activity.content ?? {}) as SpeakingContent
  const mediaRef = useRef<MediaRecorder | null>(null)
  const chunks = useRef<Blob[]>([])
  const [recording, setRecording] = useState(false)
  const [result, setResult] = useState<SpeakingResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const start = async () => {
    setError(null)
    setResult(null)
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const rec = new MediaRecorder(stream)
    chunks.current = []
    rec.ondataavailable = (e) => {
      if (e.data.size) chunks.current.push(e.data)
    }
    rec.onstop = async () => {
      stream.getTracks().forEach((t) => t.stop())
      const blob = new Blob(chunks.current, { type: 'audio/webm' })
      setLoading(true)
      try {
        let scored: SpeakingResult
        if (isSupabaseConfigured) {
          const audioBase64 = await blobToBase64(blob)
          scored = await scoreSpeaking({
            activityId: activity.id,
            audioBase64,
            mimeType: 'audio/webm',
            referenceText: content.referenceText,
          })
        } else {
          scored = {
            success: true,
            score: 78,
            cefr: activity.level,
            pronunciation: 80,
            fluency: 75,
            grammar: 70,
            vocabulary: 72,
            coherence: 74,
            transcript: content.referenceText ?? 'Local mock transcript',
            feedback: ['Clear speech. Keep practicing natural rhythm.'],
            wordScores: [],
          }
        }
        setResult(scored)
        onComplete?.({
          answer: { mode: content.mode, hasRecording: true },
          score: scored.score,
          feedback: scored as unknown as Record<string, unknown>,
        })
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Scoring failed')
      } finally {
        setLoading(false)
      }
    }
    mediaRef.current = rec
    rec.start()
    setRecording(true)
  }

  const stop = () => {
    mediaRef.current?.stop()
    setRecording(false)
  }

  return (
    <ActivityPlayer
      activity={activity}
      step={1}
      totalSteps={1}
      onBack={onBack ?? (() => navigate(-1))}
    >
      <p className="text-white/80">{content.prompt}</p>
      {content.referenceText ? (
        <p className="mt-3 rounded-xl bg-white/5 p-3 text-sm italic text-soft-pink">{content.referenceText}</p>
      ) : null}
      <p className="mt-2 text-xs text-white/45">Target ~{content.expectedDuration}s</p>
      <div className="mt-5 flex gap-3">
        {!recording ? (
          <button
            type="button"
            onClick={start}
            disabled={loading}
            className="rounded-full bg-cherry px-5 py-2.5 text-sm font-bold uppercase text-white disabled:opacity-40"
          >
            Record
          </button>
        ) : (
          <button
            type="button"
            onClick={stop}
            className="rounded-full bg-cobalt px-5 py-2.5 text-sm font-bold uppercase text-white"
          >
            Stop & Score
          </button>
        )}
      </div>
      {loading ? <p className="mt-3 text-sm text-white/50">Scoring…</p> : null}
      {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
      {result ? (
        <div className="mt-5 space-y-2">
          <FeedbackBanner
            correct={(result.score ?? 0) >= 60}
            message={`Score: ${result.score ?? '—'} · ${result.cefr ?? ''}`}
          />
          <ul className="list-disc space-y-1 pl-5 text-sm text-white/70">
            {result.feedback.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </ActivityPlayer>
  )
}
