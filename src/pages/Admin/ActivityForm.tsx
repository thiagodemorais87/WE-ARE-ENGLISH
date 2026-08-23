import { useState } from 'react'
import type { Activity, ActivityContent, ActivityLevel, ActivityType, Difficulty, EngineActivityType } from '@/types/activity'
import { toEngineDifficulty, toLegacyDifficulty } from '@/types/activity'
import { generateActivityAudio } from '@/lib/integrations/elevenlabs'
import { isSupabaseConfigured } from '@/lib/supabase/client'

const ENGINE_TYPES: EngineActivityType[] = [
  'listening',
  'speaking',
  'pronunciation',
  'writing',
  'reading',
  'multiple_choice',
  'fill_blank',
  'word_order',
  'matching',
  'true_false',
  'vocabulary',
  'grammar',
]

const LEVELS: ActivityLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
const DIFFS: Difficulty[] = ['basic', 'intermediate', 'advanced']

function defaultContent(type: ActivityType): ActivityContent {
  switch (type) {
    case 'listening':
      return {
        subtype: 'multiple_choice',
        audioText: 'Hello, welcome to class.',
        question: 'What did you hear?',
        options: ['A greeting', 'A recipe', 'A score', 'A map'],
        correctAnswer: 0,
      }
    case 'speaking':
      return {
        prompt: 'Introduce yourself briefly.',
        expectedDuration: 45,
        mode: 'answer',
        evaluation: { pronunciation: true, fluency: true, grammar: true, vocabulary: true, coherence: true },
      }
    case 'writing':
      return { prompt: 'Write a short paragraph about your weekend.', minWords: 40, maxWords: 120, taskType: 'short' }
    case 'reading':
      return {
        passage: 'Short reading passage.',
        question: 'Main idea?',
        options: ['A', 'B', 'C', 'D'],
        correctIndex: 0,
      }
    case 'true_false':
      return { statement: 'The Earth orbits the Sun.', correct: true }
    case 'fill_blank':
      return { text: 'I _____ a student.', blanks: [{ id: 'b1', answer: 'am' }], items: [
        { id: 'fb1', sentence: 'I _____ a student.', answer: 'am' },
        { id: 'fb2', sentence: 'She _____ happy today.', answer: 'is' },
        { id: 'fb3', sentence: 'They _____ my friends.', answer: 'are' },
        { id: 'fb4', sentence: 'He _____ from Brazil.', answer: 'is' },
        { id: 'fb5', sentence: 'We _____ in the classroom.', answer: 'are' },
        { id: 'fb6', sentence: 'This _____ a book.', answer: 'is' },
        { id: 'fb7', sentence: 'There _____ a cat on the sofa.', answer: 'is' },
        { id: 'fb8', sentence: 'My name _____ Ana.', answer: 'is' },
        { id: 'fb9', sentence: 'You _____ very kind.', answer: 'are' },
        { id: 'fb10', sentence: 'It _____ cold outside.', answer: 'is' },
      ] }
    case 'word_order':
      return { prompt: 'Order the words', words: ['I', 'am', 'happy'], correctOrder: ['I', 'am', 'happy'] }
    case 'matching':
      return { prompt: 'Match', pairs: [{ left: 'hello', right: 'olá' }] }
    case 'pronunciation':
      return { text: 'This is a ship.', tips: 'Focus on /ɪ/ vs /iː/' }
    case 'vocabulary':
    case 'grammar':
    case 'multiple_choice':
    default:
      return {
        question: type === 'grammar' ? undefined : 'Choose the best option',
        prompt: type === 'grammar' ? 'Select the correct form' : undefined,
        options: ['A', 'B', 'C', 'D'],
        correctIndex: 0,
      } as ActivityContent
  }
}

export type ActivityFormValues = {
  title: string
  description: string
  type: EngineActivityType
  level: ActivityLevel
  difficulty: Difficulty
  instructions: string
  duration: number
  points: number
  isPublished: boolean
  contentJson: string
  audioUrl: string
  imageUrl: string
}

export function activityToForm(a?: Partial<Activity>): ActivityFormValues {
  const type = (a?.type && ENGINE_TYPES.includes(a.type as EngineActivityType)
    ? a.type
    : 'multiple_choice') as EngineActivityType
  return {
    title: a?.title ?? '',
    description: a?.description ?? '',
    type,
    level: a?.level ?? 'A1',
    difficulty:
      a?.difficulty === 'easy' || a?.difficulty === 'medium' || a?.difficulty === 'hard'
        ? toLegacyDifficulty(a.difficulty)
        : ((a?.difficulty as Difficulty) ?? 'basic'),
    instructions: a?.instructions ?? '',
    duration: a?.duration ?? 10,
    points: a?.points ?? 10,
    isPublished: a?.isPublished ?? false,
    contentJson: JSON.stringify(a?.content ?? defaultContent(type), null, 2),
    audioUrl: a?.audioUrl ?? '',
    imageUrl: a?.imageUrl ?? a?.thumbnail ?? '',
  }
}

export function formToActivityInput(values: ActivityFormValues): Partial<Activity> &
  Pick<Activity, 'title' | 'type' | 'level' | 'difficulty'> {
  let content: ActivityContent = defaultContent(values.type)
  try {
    content = JSON.parse(values.contentJson) as ActivityContent
  } catch {
    /* keep default */
  }
  return {
    title: values.title.trim(),
    description: values.description.trim(),
    type: values.type,
    level: values.level,
    difficulty: values.difficulty,
    instructions: values.instructions.trim(),
    duration: values.duration,
    points: values.points,
    isPublished: values.isPublished,
    content,
    audioUrl: values.audioUrl || null,
    imageUrl: values.imageUrl || null,
    thumbnail: values.imageUrl || '',
  }
}

type Props = {
  initial?: Partial<Activity>
  activityId?: string
  submitLabel: string
  onSubmit: (values: ActivityFormValues) => Promise<void>
}

export function ActivityForm({ initial, activityId, submitLabel, onSubmit }: Props) {
  const [values, setValues] = useState(() => activityToForm(initial))
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [audioMsg, setAudioMsg] = useState<string | null>(null)

  const set = <K extends keyof ActivityFormValues>(key: K, value: ActivityFormValues[K]) => {
    setValues((v) => {
      const next = { ...v, [key]: value }
      if (key === 'type' && !initial?.content) {
        next.contentJson = JSON.stringify(defaultContent(value as ActivityType), null, 2)
      }
      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!values.title.trim()) {
      setError('Title is required')
      return
    }
    try {
      JSON.parse(values.contentJson)
    } catch {
      setError('Content JSON is invalid')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await onSubmit(values)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const generateAudio = async () => {
    if (!activityId || !isSupabaseConfigured) {
      setAudioMsg('Save the activity first and configure Supabase to generate audio.')
      return
    }
    setAudioMsg('Generating…')
    try {
      const { audioUrl } = await generateActivityAudio(activityId, true)
      set('audioUrl', audioUrl)
      setAudioMsg('Audio generated and saved.')
    } catch (e) {
      setAudioMsg(e instanceof Error ? e.message : 'Audio generation failed')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-5">
      <label className="block space-y-1">
        <span className="text-xs uppercase text-fg-muted">Title</span>
        <input
          value={values.title}
          onChange={(e) => set('title', e.target.value)}
          className="w-full rounded-xl border border-edge bg-ink/50 px-3 py-2 text-fg"
        />
      </label>
      <label className="block space-y-1">
        <span className="text-xs uppercase text-fg-muted">Description</span>
        <textarea
          value={values.description}
          onChange={(e) => set('description', e.target.value)}
          rows={2}
          className="w-full rounded-xl border border-edge bg-ink/50 px-3 py-2 text-fg"
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block space-y-1">
          <span className="text-xs uppercase text-fg-muted">Type</span>
          <select
            value={values.type}
            onChange={(e) => set('type', e.target.value as EngineActivityType)}
            className="w-full rounded-xl border border-edge bg-ink px-3 py-2 text-fg"
          >
            {ENGINE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-1">
          <span className="text-xs uppercase text-fg-muted">Level</span>
          <select
            value={values.level}
            onChange={(e) => set('level', e.target.value as ActivityLevel)}
            className="w-full rounded-xl border border-edge bg-ink px-3 py-2 text-fg"
          >
            {LEVELS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-1">
          <span className="text-xs uppercase text-fg-muted">Difficulty</span>
          <select
            value={values.difficulty}
            onChange={(e) => set('difficulty', e.target.value as Difficulty)}
            className="w-full rounded-xl border border-edge bg-ink px-3 py-2 text-fg"
          >
            {DIFFS.map((d) => (
              <option key={d} value={d}>
                {d} ({toEngineDifficulty(d)})
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="block space-y-1">
        <span className="text-xs uppercase text-fg-muted">Instructions</span>
        <textarea
          value={values.instructions}
          onChange={(e) => set('instructions', e.target.value)}
          rows={2}
          className="w-full rounded-xl border border-edge bg-ink/50 px-3 py-2 text-fg"
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1">
          <span className="text-xs uppercase text-fg-muted">Duration (min)</span>
          <input
            type="number"
            min={1}
            value={values.duration}
            onChange={(e) => set('duration', Number(e.target.value))}
            className="w-full rounded-xl border border-edge bg-ink/50 px-3 py-2 text-fg"
          />
        </label>
        <label className="block space-y-1">
          <span className="text-xs uppercase text-fg-muted">Points</span>
          <input
            type="number"
            min={1}
            value={values.points}
            onChange={(e) => set('points', Number(e.target.value))}
            className="w-full rounded-xl border border-edge bg-ink/50 px-3 py-2 text-fg"
          />
        </label>
      </div>
      <label className="flex items-center gap-2 text-sm text-fg/80">
        <input
          type="checkbox"
          checked={values.isPublished}
          onChange={(e) => set('isPublished', e.target.checked)}
        />
        Published
      </label>
      <label className="block space-y-1">
        <span className="text-xs uppercase text-fg-muted">Content JSON</span>
        <textarea
          value={values.contentJson}
          onChange={(e) => set('contentJson', e.target.value)}
          rows={12}
          className="w-full rounded-xl border border-edge bg-ink/70 px-3 py-2 font-mono text-xs text-fg"
        />
      </label>
      <label className="block space-y-1">
        <span className="text-xs uppercase text-fg-muted">Image URL</span>
        <input
          value={values.imageUrl}
          onChange={(e) => set('imageUrl', e.target.value)}
          className="w-full rounded-xl border border-edge bg-ink/50 px-3 py-2 text-fg"
        />
      </label>
      <div className="space-y-2">
        <label className="block space-y-1">
          <span className="text-xs uppercase text-fg-muted">Audio URL</span>
          <input
            value={values.audioUrl}
            onChange={(e) => set('audioUrl', e.target.value)}
            className="w-full rounded-xl border border-edge bg-ink/50 px-3 py-2 text-fg"
          />
        </label>
        <button
          type="button"
          onClick={generateAudio}
          className="rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-wide text-fg/80"
        >
          Generate / regenerate audio (ElevenLabs)
        </button>
        {audioMsg ? <p className="text-xs text-fg-muted">{audioMsg}</p> : null}
      </div>
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      <button
        type="submit"
        disabled={saving}
        className="rounded-full bg-cherry px-6 py-2.5 text-sm font-bold uppercase text-white disabled:opacity-40"
      >
        {saving ? 'Saving…' : submitLabel}
      </button>
    </form>
  )
}
