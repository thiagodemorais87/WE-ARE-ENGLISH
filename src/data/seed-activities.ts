/**
 * System seed catalog: curated core skills (5 each) + short media embeds (<5 min).
 */
import type { Activity, ActivityLevel, QuizQuestionItem } from '@/types/activity'
import { pickThumbnail } from './thumbnails.ts'
import { buildCuratedCoreActivities } from './curated-seed-activities.ts'

export { buildQuizQuestions } from './legacy-quiz-helpers.ts'

/** Short ESL / practice clips (all under ~5 minutes). */
const SHORT = {
  /** ~1 min — modern café / coffee order */
  cafeOrder: 'https://www.youtube-nocookie.com/embed/IxbXVxYKVRw',
  /** Short coffee-shop dialogue for beginners */
  cafeEasy: 'https://www.youtube-nocookie.com/embed/v9EWItbdvVs',
  /** Airport / travel English short */
  airport: 'https://www.youtube-nocookie.com/embed/l3IC2r_k08U',
  /** Ordering coffee A2 listening (oEmbed-verified replacement for dead 0gu3MSatfo4) */
  cafePastry: 'https://www.youtube-nocookie.com/embed/1dxXd7JNu7g',
  /** Short lyric / song practice (≤5 min pop chorus focus) */
  musicFeel: 'https://www.youtube-nocookie.com/embed/e-ORhEE9VVg',
  /** Alternate short music practice */
  musicChorus: 'https://www.youtube-nocookie.com/embed/hT_nvWreIhg',
} as const

const MEDIA_EMBEDS = {
  music: SHORT.musicFeel,
  video: SHORT.cafeEasy,
  game: SHORT.cafePastry,
} as const

function mediaQuestions(kind: 'music' | 'video' | 'game'): QuizQuestionItem[] {
  if (kind === 'music') {
    return [
      {
        question: 'What should you listen for first in a song?',
        options: ['The chorus / repeated words', 'Only the drums', 'Silence only', 'The video ads'],
        correctIndex: 0,
        explanation: 'Choruses repeat key vocabulary and are easier to catch.',
      },
      {
        question: 'A useful strategy is…',
        options: ['Replay a short part slowly', 'Never rewind', 'Ignore the lyrics', 'Mute the song'],
        correctIndex: 0,
      },
      {
        question: '“Feel” in many lyrics often means…',
        options: ['An emotion', 'A suitcase', 'A Wi-Fi code', 'A passport'],
        correctIndex: 0,
      },
      {
        question: 'Singing along quietly can help…',
        options: ['Pronunciation and rhythm', 'Only typing speed', 'Deleting words', 'Closing the tab'],
        correctIndex: 0,
      },
      {
        question: 'Before the quiz, you should…',
        options: ['Listen at least once carefully', 'Skip the audio', 'Guess randomly', 'Close your eyes forever'],
        correctIndex: 0,
      },
    ]
  }
  if (kind === 'game') {
    return [
      {
        question: 'In a language game, you should…',
        options: ['Read each question carefully', 'Tap the first option always', 'Ignore feedback', 'Quit immediately'],
        correctIndex: 0,
      },
      {
        question: 'Wrong answers help you…',
        options: ['Notice gaps and try again', 'Delete English', 'Stop learning', 'Skip forever'],
        correctIndex: 0,
      },
      {
        question: 'A good pace is…',
        options: ['Steady and focused', 'As fast as possible with no reading', 'Never checking', 'Only guessing'],
        correctIndex: 0,
      },
      {
        question: 'Vocabulary in games is useful because…',
        options: ['It appears in real contexts', 'It replaces sleep', 'It is never spoken', 'It deletes grammar'],
        correctIndex: 0,
      },
      {
        question: 'After finishing, you should…',
        options: ['Review mistakes briefly', 'Forget everything', 'Close without looking', 'Never replay'],
        correctIndex: 0,
      },
    ]
  }
  return [
    {
      question: 'What should you do first?',
      options: ['Watch for the main idea', 'Skip the video', 'Mute forever', 'Close the tab'],
      correctIndex: 0,
      explanation: 'Gist first, then details — Cambridge-style listening.',
    },
    {
      question: 'If speech is fast, you can…',
      options: ['Replay and slow the clip', 'Give up immediately', 'Ignore visuals', 'Skip all questions'],
      correctIndex: 0,
    },
    {
      question: 'Subtitles help you…',
      options: ['Connect sound and spelling', 'Avoid English', 'Stop listening', 'Delete audio'],
      correctIndex: 0,
    },
    {
      question: 'Key vocabulary often appears…',
      options: ['More than once', 'Never', 'Only in ads', 'Only in the title'],
      correctIndex: 0,
    },
    {
      question: 'After watching, check…',
      options: ['What you understood', 'Only the thumbnail', 'Only the URL', 'Nothing'],
      correctIndex: 0,
    },
  ]
}

function mediaSeed(
  id: string,
  type: 'music' | 'video' | 'game',
  title: string,
  level: ActivityLevel,
  thumb: string,
  difficulty: 'basic' | 'intermediate' | 'advanced' = 'intermediate',
  embedUrl?: string,
): Activity {
  const questions = mediaQuestions(type)
  return {
    id,
    title,
    description:
      type === 'music'
        ? 'Short song clip (under 5 min) + quick comprehension quiz.'
        : type === 'video'
          ? 'Short English video (under 5 min) + quick quiz.'
          : 'Short practice round with a focused quiz.',
    type,
    level,
    difficulty,
    duration: 5,
    thumbnail: thumb,
    instructions: `Watch the short clip (under 5 min), then answer ${questions.length} questions.`,
    content: {
      embedUrl: embedUrl ?? MEDIA_EMBEDS[type],
      questions,
      prompt: questions[0]!.question,
      options: questions[0]!.options,
      correctIndex: 0,
    },
    points: 15,
    isPublished: true,
    isSystem: true,
    skills: [type],
    practicePoints: [`${type} comprehension`, 'Real English'],
    categoryTags: ['system', type, 'trending'],
  }
}

export function buildSystemSeedActivities(): Activity[] {
  const list = buildCuratedCoreActivities()

  list.push(
    mediaSeed(
      'sys-music-feel-lyrics',
      'music',
      'Feel the Lyrics',
      'B1',
      pickThumbnail('music', 0),
      'intermediate',
      SHORT.musicFeel,
    ),
    mediaSeed(
      'sys-music-chorus-fill',
      'music',
      'Chorus Fill-In',
      'A2',
      pickThumbnail('music', 1),
      'basic',
      SHORT.musicChorus,
    ),
    mediaSeed(
      'sys-video-workday-vlog',
      'video',
      'Coffee Shop English',
      'B1',
      pickThumbnail('video', 0),
      'intermediate',
      SHORT.cafeEasy,
    ),
    mediaSeed(
      'sys-video-interview-clip',
      'video',
      'Café Order Practice',
      'A2',
      pickThumbnail('video', 1),
      'basic',
      SHORT.cafePastry,
    ),
    {
      id: 'sys-video-ordering-coffee',
      title: 'Ordering Coffee',
      description: 'Short café clip (under 5 min): tap words, then complete the gap.',
      type: 'video',
      level: 'A2',
      difficulty: 'basic',
      duration: 5,
      thumbnail: pickThumbnail('video', 2),
      instructions: 'Watch (under 5 min) → tap words → complete the gap → listen again.',
      content: {
        mode: 'interactive',
        embedUrl: SHORT.cafeOrder,
        transcript: [
          { start: 0, end: 4, text: 'Good morning. Welcome to our cafe. What are you in the mood for today?' },
          { start: 4, end: 8, text: "I'd like a latte style coffee, please. Something smooth." },
          { start: 8, end: 12, text: 'What size? Short, tall, grande, or venti?' },
          { start: 12, end: 16, text: "I'll go with a grande, with almond milk and a hint of vanilla." },
        ],
        glossary: {
          latte: {
            meaning: 'Espresso with steamed milk — a popular café drink.',
            pronunciation: '/ˈlɑːteɪ/',
            kind: 'meaning',
          },
          grande: {
            meaning: 'A medium-large size in many cafés (bigger than tall).',
            pronunciation: '/ˈɡrɑːndeɪ/',
            kind: 'meaning',
          },
          almond: {
            meaning: 'A nut; “almond milk” is a dairy-free milk option.',
            pronunciation: '/ˈɑːmənd/',
            kind: 'sound',
          },
          vanilla: {
            meaning: 'A sweet flavour often added to coffee drinks.',
            pronunciation: '/vəˈnɪlə/',
            kind: 'meaning',
          },
        },
        gap: {
          sentence: "I'll go with a ______, with almond milk and vanilla.",
          options: ['grande', 'short', 'venti'],
          correctIndex: 0,
          explanation: 'The customer chooses a grande size.',
        },
      },
      points: 15,
      isPublished: true,
      isSystem: true,
      skills: ['video', 'listening', 'vocabulary'],
      practicePoints: ['Café English', 'Sizes', 'Polite orders'],
      categoryTags: ['system', 'video', 'trending', 'listening'],
    },
    {
      id: 'sys-video-at-the-airport-desk',
      title: 'At the Airport',
      description: 'Short travel English clip (under 5 min) with tap-to-learn transcript.',
      type: 'video',
      level: 'A2',
      difficulty: 'basic',
      duration: 5,
      thumbnail: pickThumbnail('video', 3),
      instructions: 'Watch (under 5 min) → explore words → complete the gap → listen again.',
      content: {
        mode: 'interactive',
        embedUrl: SHORT.airport,
        transcript: [
          { start: 0, end: 4, text: 'Good morning. I have a reservation.' },
          { start: 4, end: 8, text: 'May I see your passport, please?' },
          { start: 8, end: 12, text: 'Of course. Here you are.' },
          { start: 12, end: 16, text: 'Thank you. Enjoy your flight.' },
        ],
        glossary: {
          reservation: {
            meaning: 'A booking you made in advance.',
            pronunciation: '/ˌrezəˈveɪʃn/',
            kind: 'meaning',
          },
          passport: {
            meaning: 'Official travel document with your photo.',
            pronunciation: '/ˈpɑːspɔːt/',
            kind: 'sound',
          },
          May: {
            meaning: 'Polite word for asking permission.',
            pronunciation: '/meɪ/',
            kind: 'explain',
          },
          flight: {
            meaning: 'A journey by plane.',
            pronunciation: '/flaɪt/',
            kind: 'meaning',
          },
        },
        gap: {
          sentence: 'May I see your ______, please?',
          options: ['passport', 'ticket', 'suitcase'],
          correctIndex: 0,
          explanation: 'The agent asks to see the passenger’s passport.',
        },
      },
      points: 15,
      isPublished: true,
      isSystem: true,
      skills: ['video', 'listening'],
      practicePoints: ['Travel English', 'Polite questions'],
      categoryTags: ['system', 'video', 'listening'],
    },
    mediaSeed('sys-game-quick-quiz', 'game', 'Quick Quiz Arena', 'A2', pickThumbnail('game', 0), 'basic'),
    mediaSeed('sys-game-grammar-duel', 'game', 'Grammar Duel', 'B1', pickThumbnail('game', 1), 'intermediate'),
    mediaSeed('sys-game-vocab-battle', 'game', 'Vocabulary Battle', 'B1', pickThumbnail('game', 2), 'intermediate'),
  )

  return list
}

export const systemSeedActivities = buildSystemSeedActivities()
