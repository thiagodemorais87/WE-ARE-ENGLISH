import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ActivityPlayer, FeedbackBanner } from '@/components/activities/ActivityPlayer'
import { InteractiveTranscript } from '@/components/activities/InteractiveTranscript'
import { youtubeEmbedUrl } from '@/components/activities/engine/MultiQuestionQuiz'
import type { EngineActivityProps } from '@/components/activities/engine/types'
import type { InteractiveVideoContent } from '@/types/activity'

const DEFAULT_EMBED = 'https://www.youtube-nocookie.com/embed/M7lc1UVf-VE'

export function isInteractiveVideoContent(
  content: unknown,
): content is InteractiveVideoContent {
  if (!content || typeof content !== 'object') return false
  const c = content as Record<string, unknown>
  const hasTranscriptGlossary =
    Array.isArray(c.transcript) &&
    typeof c.glossary === 'object' &&
    c.glossary != null
  const hasGap = typeof c.gap === 'object' && c.gap != null
  if (c.mode === 'interactive' && hasTranscriptGlossary && hasGap) return true
  return hasTranscriptGlossary && hasGap
}

export function InteractiveVideoListening({
  activity,
  onComplete,
  onBack,
}: EngineActivityProps) {
  const navigate = useNavigate()
  const content = activity.content as InteractiveVideoContent
  const [step, setStep] = useState(1)
  const [selected, setSelected] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)
  const [score, setScore] = useState(0)
  const [replayKey, setReplayKey] = useState(0)
  const [finished, setFinished] = useState(false)

  const embed = youtubeEmbedUrl(content.embedUrl, DEFAULT_EMBED)
  const gap = content.gap
  const correct = selected === gap.correctIndex

  const finish = useCallback(() => {
    if (finished) return
    setFinished(true)
    onComplete?.({
      answer: {
        selected,
        gapSentence: gap.sentence,
        correctOption: gap.options[gap.correctIndex],
      },
      score,
      feedback: { explanation: gap.explanation, listenedAgain: true },
    })
  }, [finished, onComplete, selected, gap, score])

  const onCheckGap = () => {
    if (selected == null) return
    setChecked(true)
    setScore(selected === gap.correctIndex ? 100 : 0)
  }

  return (
    <ActivityPlayer
      activity={activity}
      step={step}
      totalSteps={3}
      onBack={onBack ?? (() => navigate(`/activity/${activity.id}`))}
    >
      {(step === 1 || step === 3) && (
        <div className="mb-6 overflow-hidden rounded-2xl border border-edge bg-black/40">
          <iframe
            key={replayKey}
            title={activity.title}
            src={embed}
            className="aspect-video w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      )}

      {step === 1 && (
        <div className="space-y-5">
          <p className="text-sm text-fg-muted">
            Watch the clip, then tap underlined words for meaning and pronunciation.
          </p>
          <InteractiveTranscript
            lines={content.transcript}
            glossary={content.glossary}
            exploreOnly
          />
          <button
            type="button"
            onClick={() => setStep(2)}
            className="rounded-full bg-cherry px-6 py-3 text-sm font-bold uppercase tracking-wide text-white"
          >
            Continue to practice
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5">
          <h3 className="text-lg font-semibold text-fg">Complete the sentence</h3>
          <p className="text-xl text-fg">{gap.sentence}</p>
          <div className="flex flex-wrap gap-2">
            {gap.options.map((opt, i) => (
              <button
                key={opt}
                type="button"
                disabled={checked}
                onClick={() => setSelected(i)}
                className={[
                  'rounded-full border px-4 py-2 text-sm font-semibold transition',
                  selected === i
                    ? 'border-cherry bg-cherry text-white'
                    : 'border-edge bg-panel text-fg hover:bg-panel-strong',
                  checked && i === gap.correctIndex ? 'ring-2 ring-cobalt' : '',
                ].join(' ')}
              >
                {opt}
              </button>
            ))}
          </div>
          {!checked ? (
            <button
              type="button"
              disabled={selected == null}
              onClick={onCheckGap}
              className="rounded-full bg-cobalt px-6 py-3 text-sm font-bold uppercase tracking-wide text-white disabled:opacity-50"
            >
              Check
            </button>
          ) : (
            <div className="space-y-4">
              <FeedbackBanner
                correct={correct}
                message={
                  gap.explanation ??
                  (correct ? 'Nice listening!' : `Correct answer: ${gap.options[gap.correctIndex]}`)
                }
              />
              <button
                type="button"
                onClick={() => setStep(3)}
                className="rounded-full bg-cherry px-6 py-3 text-sm font-bold uppercase tracking-wide text-white"
              >
                Listen again
              </button>
            </div>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="space-y-5">
          <p className="text-sm text-fg-muted">
            Replay the video to reinforce what you heard, then finish the activity.
          </p>
          <button
            type="button"
            onClick={() => setReplayKey((k) => k + 1)}
            className="rounded-full border border-edge bg-panel px-5 py-2.5 text-sm font-semibold text-fg hover:bg-panel-strong"
          >
            Replay video
          </button>
          <p className="text-lg font-semibold text-fg">Your score: {score}%</p>
          {!finished ? (
            <button
              type="button"
              onClick={finish}
              className="rounded-full bg-cherry px-6 py-3 text-sm font-bold uppercase tracking-wide text-white"
            >
              Finish activity
            </button>
          ) : (
            <p className="text-sm text-cobalt">Progress saved. Great work!</p>
          )}
        </div>
      )}
    </ActivityPlayer>
  )
}
