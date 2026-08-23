import type { InteractiveVideoGlossaryEntry, TranscriptLine } from '@/types/activity'
import { useMemo, useState } from 'react'

type Props = {
  lines: TranscriptLine[]
  glossary?: Record<string, InteractiveVideoGlossaryEntry>
  /** When false, only show explore mode (no inline blanks). */
  exploreOnly?: boolean
  blanks?: Record<number, { answer: string; hint?: string }>
}

function normalizeKey(word: string): string {
  return word.replace(/^[\s"'([{]+|[.,!?;:"')\]}]+$/g, '').trim()
}

function lookupGlossary(
  word: string,
  glossary: Record<string, InteractiveVideoGlossaryEntry>,
): { key: string; entry: InteractiveVideoGlossaryEntry } | null {
  const clean = normalizeKey(word)
  if (!clean) return null
  const keys = Object.keys(glossary)
  const found =
    keys.find((k) => k === clean) ??
    keys.find((k) => k.toLowerCase() === clean.toLowerCase())
  if (!found) return null
  return { key: found, entry: glossary[found]! }
}

function speak(text: string) {
  try {
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'en-US'
    window.speechSynthesis.speak(u)
  } catch {
    /* ignore */
  }
}

export function InteractiveTranscript({
  lines,
  blanks = {},
  glossary = {},
  exploreOnly = false,
}: Props) {
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [checked, setChecked] = useState(false)
  const [selectedKey, setSelectedKey] = useState<string | null>(null)

  const blankEntries = Object.entries(blanks)
  const selected = selectedKey ? glossary[selectedKey] : null

  const kindLabel = useMemo(() => {
    if (!selected) return ''
    if (selected.kind === 'explain') return 'Explanation'
    if (selected.kind === 'sound') return 'Pronunciation'
    return 'Meaning'
  }, [selected])

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-fg-muted">
        Transcript
      </h3>
      <div className="space-y-2 rounded-2xl border border-edge bg-panel p-4 text-fg">
        {lines.map((line, index) => {
          const blank = !exploreOnly ? blanks[index] : undefined
          if (!blank) {
            return (
              <p key={index} className="leading-relaxed">
                {line.text.split(' ').map((word, wi) => {
                  const hit = lookupGlossary(word, glossary)
                  if (!hit) return <span key={wi}>{word} </span>
                  return (
                    <button
                      key={wi}
                      type="button"
                      className="underline decoration-dotted underline-offset-2 hover:text-cherry"
                      onClick={() => setSelectedKey(hit.key)}
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
            <p key={index} className="leading-relaxed">
              {parts[0]}
              <input
                value={answers[index] ?? ''}
                onChange={(e) => setAnswers((a) => ({ ...a, [index]: e.target.value }))}
                className="mx-1 w-28 border-b border-edge bg-transparent px-1 text-center text-cherry outline-none"
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

      {!exploreOnly && blankEntries.length > 0 && (
        <button
          type="button"
          onClick={() => setChecked(true)}
          className="rounded-full bg-cobalt px-4 py-2 text-xs font-bold uppercase tracking-wide text-white"
        >
          Check blanks
        </button>
      )}

      {selectedKey && selected && (
        <aside className="rounded-2xl border border-edge bg-surface p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-fg-muted">
                {kindLabel}
              </p>
              <p className="mt-1 font-semibold text-fg">{selectedKey}</p>
            </div>
            <button
              type="button"
              onClick={() => speak(selectedKey)}
              className="rounded-full border border-edge bg-panel px-3 py-1.5 text-sm hover:bg-panel-strong"
              aria-label="Play pronunciation"
            >
              🔊
            </button>
          </div>
          {selected.pronunciation ? (
            <p className="mt-2 text-sm text-soft-pink">{selected.pronunciation}</p>
          ) : null}
          <p className="mt-2 text-sm text-fg-muted">{selected.meaning}</p>
        </aside>
      )}
    </div>
  )
}
