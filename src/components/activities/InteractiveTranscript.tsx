import type { TranscriptLine } from '@/types/activity'
import { useState } from 'react'

type Props = {
  lines: TranscriptLine[]
  blanks?: Record<number, { answer: string; hint?: string }>
  glossary?: Record<string, { pronunciation: string; meaning: string }>
}

export function InteractiveTranscript({ lines, blanks = {}, glossary = {} }: Props) {
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [checked, setChecked] = useState(false)
  const [selectedWord, setSelectedWord] = useState<string | null>(null)

  const blankEntries = Object.entries(blanks)

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-white/45">Transcript</h3>
      <div className="space-y-2 rounded-2xl bg-ink/40 p-4 text-white/80">
        {lines.map((line, index) => {
          const blank = blanks[index]
          if (!blank) {
            return (
              <p key={index}>
                {line.text.split(' ').map((word, wi) => {
                  const clean = word.replace(/[.,!?]/g, '')
                  const entry = glossary[clean.toUpperCase()]
                  if (!entry) return <span key={wi}>{word} </span>
                  return (
                    <button
                      key={wi}
                      type="button"
                      className="underline decoration-dotted underline-offset-2 hover:text-soft-pink"
                      onClick={() => setSelectedWord(clean.toUpperCase())}
                    >
                      {word}{' '}
                    </button>
                  )
                })}
              </p>
            )
          }
          const parts = line.text.split(blank.answer)
          return (
            <p key={index}>
              {parts[0]}
              <input
                value={answers[index] ?? ''}
                onChange={(e) => setAnswers((a) => ({ ...a, [index]: e.target.value }))}
                className="mx-1 w-28 border-b border-white/40 bg-transparent px-1 text-center text-soft-pink outline-none"
                placeholder="______"
              />
              {parts[1] ?? ''}
              {checked && (
                <span className="ml-2 text-xs">
                  {answers[index]?.toLowerCase() === blank.answer.toLowerCase()
                    ? '✓'
                    : `→ ${blank.answer}`}
                </span>
              )}
            </p>
          )
        })}
      </div>

      {blankEntries.length > 0 && (
        <button
          type="button"
          onClick={() => setChecked(true)}
          className="rounded-full bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white"
        >
          Check blanks
        </button>
      )}

      {selectedWord && glossary[selectedWord] && (
        <aside className="rounded-2xl border border-white/10 bg-graphite p-4">
          <p className="font-semibold text-white">{selectedWord}</p>
          <p className="mt-1 text-sm text-soft-pink">
            Pronunciation {glossary[selectedWord].pronunciation}
          </p>
          <p className="mt-2 text-sm text-white/65">{glossary[selectedWord].meaning}</p>
        </aside>
      )}
    </div>
  )
}
