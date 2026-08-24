export type UserRole = 'student' | 'teacher' | 'admin'

export type ActivityType =
  | 'listening'
  | 'speaking'
  | 'pronunciation'
  | 'writing'
  | 'reading'
  | 'multiple_choice'
  | 'fill_blank'
  | 'word_order'
  | 'matching'
  | 'true_false'
  | 'vocabulary'
  | 'grammar'
  /** @deprecated legacy catalog types — mapped to engine types when possible */
  | 'music'
  | 'video'
  | 'game'

export type EngineActivityType = Exclude<ActivityType, 'music' | 'video' | 'game'>

export type ActivityLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
/** @deprecated use ActivityLevel */
export type CefrLevel = ActivityLevel

export type ActivityDifficulty = 'easy' | 'medium' | 'hard'
/** @deprecated mapped from/to ActivityDifficulty */
export type Difficulty = 'basic' | 'intermediate' | 'advanced'

export interface AuthUser {
  id: string
  name: string
  email: string
  role?: UserRole
}

export interface MultipleChoiceContent {
  question: string
  options: string[]
  correctIndex: number
  explanation?: string
  passage?: string
  audioText?: string
  transcript?: string
  questions?: QuizQuestionItem[]
}

export interface TrueFalseContent {
  statement: string
  correct: boolean
  explanation?: string
  passage?: string
  audioText?: string
}

export interface FillBlankItem {
  id: string
  sentence: string
  answer: string
  alternatives?: string[]
}

export interface FillBlankContent {
  /** Legacy single-passage mode */
  text?: string
  blanks?: { id: string; answer: string; alternatives?: string[] }[]
  /** Cambridge-style: 10 sentences with one gap each */
  items?: FillBlankItem[]
  explanation?: string
  audioText?: string
}

export interface WordOrderContent {
  prompt: string
  words: string[]
  correctOrder: string[]
  explanation?: string
}

export interface MatchingContent {
  prompt: string
  pairs: { left: string; right: string }[]
  explanation?: string
}

export interface WritingContent {
  prompt: string
  minWords: number
  maxWords: number
  taskType: 'short' | 'chat' | 'essay'
  sampleAnswer?: string
  /** Checklist used for self-review / scoring hints */
  criteria?: string[]
}

export interface SpeakingContent {
  prompt: string
  expectedDuration: number
  mode: 'read_aloud' | 'repeat' | 'describe' | 'answer' | 'spontaneous'
  referenceText?: string
  evaluation: {
    pronunciation: boolean
    fluency: boolean
    grammar: boolean
    vocabulary: boolean
    coherence: boolean
  }
  /** Checklist used for self-review / scoring hints */
  criteria?: string[]
}

export interface QuizQuestionItem {
  id?: string
  question: string
  options: string[]
  correctIndex: number
  explanation?: string
  passage?: string
}

export interface ListeningContent {
  subtype:
    | 'multiple_choice'
    | 'true_false'
    | 'fill_blank'
    | 'ordering'
    | 'comprehension'
    | 'dialogue'
  audioText?: string
  transcript?: string
  question?: string
  options?: string[]
  correctAnswer?: string | number | boolean
  explanation?: string
  characters?: { name: string; voiceId?: string }[]
  lines?: { speaker: string; text: string }[]
  blanks?: { id: string; answer: string }[]
  /** Multi-question listening quiz (≥10 preferred) */
  questions?: QuizQuestionItem[]
  embedUrl?: string
}

export interface ReadingContent {
  passage: string
  question: string
  options: string[]
  correctIndex: number
  explanation?: string
  questions?: QuizQuestionItem[]
}

export interface VocabularyContent {
  word: string
  definition?: string
  question: string
  options: string[]
  correctIndex: number
  explanation?: string
  questions?: QuizQuestionItem[]
}

export interface GrammarContent {
  prompt: string
  options: string[]
  correctIndex: number
  explanation?: string
  questions?: QuizQuestionItem[]
}

export interface MediaQuizContent {
  embedUrl?: string
  audioText?: string
  questions?: QuizQuestionItem[]
  prompt?: string
  options?: string[]
  correctIndex?: number
}

export interface InteractiveVideoGlossaryEntry {
  meaning: string
  pronunciation?: string
  kind?: 'explain' | 'meaning' | 'sound'
}

export interface InteractiveVideoContent {
  mode: 'interactive'
  embedUrl: string
  transcript: TranscriptLine[]
  glossary: Record<string, InteractiveVideoGlossaryEntry>
  gap: {
    sentence: string
    options: string[]
    correctIndex: number
    explanation?: string
  }
}

export interface PronunciationContent {
  text: string
  tips?: string
  /** Sound or pattern focus, e.g. "TH sound" */
  focus?: string
  /** Multi-phrase practice set (5–8 items preferred) */
  items?: { text: string; tips?: string; focus?: string }[]
}

export type ActivityContent =
  | MultipleChoiceContent
  | TrueFalseContent
  | FillBlankContent
  | WordOrderContent
  | MatchingContent
  | WritingContent
  | SpeakingContent
  | ListeningContent
  | ReadingContent
  | VocabularyContent
  | GrammarContent
  | PronunciationContent
  | InteractiveVideoContent
  | Record<string, unknown>

export interface Activity {
  id: string
  title: string
  description: string
  type: ActivityType
  level: ActivityLevel
  difficulty: Difficulty | ActivityDifficulty
  duration: number
  thumbnail: string
  source?: string
  locked?: boolean
  progress?: number
  skills?: string[]
  practicePoints?: string[]
  categoryTags?: string[]
  /** Engine fields */
  instructions?: string
  content?: ActivityContent
  audioUrl?: string | null
  imageUrl?: string | null
  points?: number
  isPublished?: boolean
  isSystem?: boolean
  createdBy?: string | null
  audioVoiceId?: string | null
  audioModelId?: string | null
  voiceName?: string | null
  accent?: string | null
  speed?: number | null
}

export interface ActivityAttempt {
  id: string
  activityId: string
  userId: string
  answer: Record<string, unknown>
  score: number | null
  feedback: Record<string, unknown> | null
  startedAt: string
  completedAt: string | null
  createdAt: string
}

export interface SpeakingResult {
  success: boolean
  score: number | null
  cefr: string | null
  pronunciation: number | null
  fluency: number | null
  grammar: number | null
  vocabulary: number | null
  coherence: number | null
  transcript: string | null
  feedback: string[]
  wordScores: { word: string; score: number | null }[]
}

export interface WritingResult {
  score: number | null
  cefr: string | null
  grammar: number | null
  vocabulary: number | null
  coherence: number | null
  taskResponse: number | null
  feedback: string[]
  corrections: { original: string; corrected: string; explanation: string }[]
}

export interface TranscriptLine {
  start: number
  end: number
  text: string
}

export interface GameItem {
  id: string
  title: string
  description: string
  thumbnail: string
  players?: string
  embedUrl?: string
  /** Local catalog / seed activity to open on play */
  activityId?: string
  provider?: 'kahoot' | 'wordwall' | 'quizizz' | 'internal'
}

export interface LearningPack {
  id: string
  title: string
  activityCount: number
  description: string
  priceLabel: string
}

export interface UserProgress {
  overall: number
  bySkill: Record<string, number>
  activitiesCompleted: number
  streakDays: number
  timePracticedMinutes: number
}

export function toEngineDifficulty(d: Difficulty | ActivityDifficulty): ActivityDifficulty {
  if (d === 'basic' || d === 'easy') return 'easy'
  if (d === 'advanced' || d === 'hard') return 'hard'
  return 'medium'
}

export function toLegacyDifficulty(d: ActivityDifficulty): Difficulty {
  if (d === 'easy') return 'basic'
  if (d === 'hard') return 'advanced'
  return 'intermediate'
}
