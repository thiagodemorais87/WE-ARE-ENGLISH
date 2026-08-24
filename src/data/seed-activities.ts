/**
 * System seed catalog: 20 listening (ElevenLabs from DB) + curated skills + short media.
 */
import type { Activity, ActivityLevel, QuizQuestionItem } from '@/types/activity'
import { pickThumbnail } from './thumbnails.ts'
import { buildCuratedCoreActivities } from './curated-seed-activities.ts'
import { buildListeningFromDbActivities } from './listening-system-from-db.ts'

export { buildQuizQuestions } from './legacy-quiz-helpers.ts'
export { listeningAudioUrlByTitle } from './listening-system-from-db.ts'

/** Short ESL / practice clips (all under ~5 minutes). */
const SHORT = {
  cafeOrder: 'https://www.youtube-nocookie.com/embed/IxbXVxYKVRw',
  cafeEasy: 'https://www.youtube-nocookie.com/embed/v9EWItbdvVs',
  airport: 'https://www.youtube-nocookie.com/embed/l3IC2r_k08U',
  cafePastry: 'https://www.youtube-nocookie.com/embed/1dxXd7JNu7g',
  musicFeel: 'https://www.youtube-nocookie.com/embed/e-ORhEE9VVg',
  musicChorus: 'https://www.youtube-nocookie.com/embed/hT_nvWreIhg',
} as const

const MEDIA_EMBEDS = {
  music: SHORT.musicFeel,
  video: SHORT.cafeEasy,
  game: SHORT.cafePastry,
} as const

function mq(
  question: string,
  options: string[],
  correctIndex: number,
  explanation?: string,
): QuizQuestionItem {
  if (options.length < 6) throw new Error(`media q needs ≥6 options: ${question}`)
  return { question, options, correctIndex, explanation }
}

function mediaMeta(level: ActivityLevel, n: number) {
  const difficulty =
    level === 'A1' || level === 'A2' ? 'basic' : level === 'B1' ? 'intermediate' : 'advanced'
  const duration = Math.min(25, Math.round(n * 0.7 + 3))
  const base = difficulty === 'basic' ? 10 : difficulty === 'intermediate' ? 15 : 20
  const cap = difficulty === 'basic' ? 25 : difficulty === 'intermediate' ? 35 : 45
  const points = Math.min(cap, base + Math.floor(n * 1.5))
  return { difficulty, duration, points } as const
}

function mediaQuestions(kind: 'music' | 'video' | 'game'): QuizQuestionItem[] {
  if (kind === 'music') {
    return [
      mq('What should you listen for first in a song?', ['The chorus / repeated words', 'Only the drums', 'Silence only', 'The video ads', 'The buffer spinner', 'The comment count'], 0, 'Choruses repeat key vocabulary.'),
      mq('A useful strategy is…', ['Replay a short part slowly', 'Never rewind', 'Ignore the lyrics', 'Mute the song', 'Skip to the end only', 'Close your eyes forever'], 0),
      mq('“Feel” in many lyrics often means…', ['An emotion', 'A suitcase', 'A Wi-Fi code', 'A passport', 'A bus ticket', 'A password'], 0),
      mq('Singing along quietly can help…', ['Pronunciation and rhythm', 'Only typing speed', 'Deleting words', 'Closing the tab', 'Ignoring stress', 'Skipping verbs'], 0),
      mq('Before the quiz, you should…', ['Listen at least once carefully', 'Skip the audio', 'Guess randomly', 'Close the player', 'Mute forever', 'Refresh endlessly'], 0),
      mq('Repeated lines are useful because…', ['You hear the same words again', 'They remove meaning', 'They hide grammar', 'They delete verbs', 'They stop learning', 'They replace listening'], 0),
      mq('If a word is unclear, you can…', ['Replay and check the lyric context', 'Never listen again', 'Guess and quit', 'Ignore all songs', 'Only look at ads', 'Change languages randomly'], 0),
      mq('Rhythm practice helps with…', ['Natural stress and fluency', 'Deleting articles', 'Avoiding English', 'Mute-only study', 'Skipping homework', 'Ignoring vowels'], 0),
      mq('A chorus is usually…', ['The most repeated part', 'Never sung', 'Only instrumental forever', 'The ad break', 'The thumbnail', 'The upload date'], 0),
      mq('After listening, check…', ['Which words you understood', 'Only the view count', 'Only the URL', 'Nothing at all', 'Only emojis', 'Only the pause icon'], 0),
    ]
  }
  if (kind === 'game') {
    return [
      mq('In a language game, you should…', ['Read each question carefully', 'Tap the first option always', 'Ignore feedback', 'Quit immediately', 'Close without looking', 'Spam random answers'], 0),
      mq('Wrong answers help you…', ['Notice gaps and try again', 'Delete English', 'Stop learning', 'Skip forever', 'Mute feedback', 'Hide progress'], 0),
      mq('A good pace is…', ['Steady and focused', 'As fast as possible with no reading', 'Never checking', 'Only guessing', 'Skipping all tips', 'Refreshing mid-answer'], 0),
      mq('Vocabulary in games is useful because…', ['It appears in real contexts', 'It replaces sleep', 'It is never spoken', 'It deletes grammar', 'It hides meaning', 'It ends learning'], 0),
      mq('After finishing, you should…', ['Review mistakes briefly', 'Forget everything', 'Close without looking', 'Never replay', 'Delete your score', 'Ignore explanations'], 0),
      mq('If you do not know a word…', ['Use context and eliminate options', 'Always pick option one', 'Quit the round', 'Skip English forever', 'Mute the UI', 'Ignore the prompt'], 0),
      mq('Feedback after an answer…', ['Shows what to improve', 'Is useless always', 'Deletes progress', 'Ends the course', 'Hides the score', 'Removes vocabulary'], 0),
      mq('Grammar duels still need…', ['Careful reading of the sentence', 'Blind tapping', 'No attention', 'Only speed', 'Ignoring verbs', 'Skipping subjects'], 0),
      mq('A fair strategy is…', ['Think, then choose', 'Spam clicks', 'Close the tab', 'Guess without reading', 'Ignore timers thoughtfully but still read', 'Never review'], 0),
      mq('Replaying a round helps…', ['Consolidate memory', 'Erase English', 'Avoid practice', 'Delete words', 'Skip grammar', 'Hide mistakes'], 0),
    ]
  }
  return [
    mq('What should you do first?', ['Watch for the main idea', 'Skip the video', 'Mute forever', 'Close the tab', 'Only read comments', 'Ignore visuals'], 0, 'Gist first, then details.'),
    mq('If speech is fast, you can…', ['Replay and slow the clip', 'Give up immediately', 'Ignore visuals', 'Skip all questions', 'Mute forever', 'Close without trying'], 0),
    mq('Subtitles help you…', ['Connect sound and spelling', 'Avoid English', 'Stop listening', 'Delete audio', 'Hide meaning', 'Skip practice'], 0),
    mq('Key vocabulary often appears…', ['More than once', 'Never', 'Only in ads', 'Only in the title', 'Only in silence', 'Only offline'], 0),
    mq('After watching, check…', ['What you understood', 'Only the thumbnail', 'Only the URL', 'Nothing', 'Only the buffer', 'Only the share button'], 0),
    mq('Body language and setting can…', ['Support comprehension', 'Replace all words forever', 'Delete listening', 'Hide the topic', 'Stop learning', 'Mute meaning'], 0),
    mq('A second watch is useful for…', ['Details and specific words', 'Avoiding English', 'Skipping quizzes', 'Closing early', 'Ignoring grammar', 'Deleting notes'], 0),
    mq('If you miss a phrase…', ['Rewind a few seconds', 'Never rewind', 'Quit immediately', 'Skip the unit', 'Mute forever', 'Guess and leave'], 0),
    mq('Café / travel clips often practice…', ['Polite requests and service language', 'Only advanced law terms', 'Silent reading only', 'Math formulas', 'Coding syntax', 'Medical surgery'], 0),
    mq('Before answering the quiz…', ['Confirm the main situation', 'Ignore the video', 'Pick randomly', 'Close the player', 'Skip instructions', 'Mute and guess'], 0),
  ]
}

function mediaSeed(
  id: string,
  type: 'music' | 'video' | 'game',
  title: string,
  level: ActivityLevel,
  thumb: string,
  embedUrl?: string,
): Activity {
  const questions = mediaQuestions(type)
  const { difficulty, duration, points } = mediaMeta(level, questions.length)
  return {
    id,
    title,
    description:
      type === 'music'
        ? 'Short song clip (under 5 min) + comprehension quiz.'
        : type === 'video'
          ? 'Short English video (under 5 min) + comprehension quiz.'
          : 'Short practice round with a focused quiz.',
    type,
    level,
    difficulty,
    duration,
    thumbnail: thumb,
    instructions: `Watch the short clip (under 5 min), then answer ${questions.length} questions.`,
    content: {
      embedUrl: embedUrl ?? MEDIA_EMBEDS[type],
      questions,
      prompt: questions[0]!.question,
      options: questions[0]!.options,
      correctIndex: questions[0]!.correctIndex,
    },
    points,
    isPublished: true,
    isSystem: true,
    skills: [type],
    practicePoints: [`${type} comprehension`, 'Real English'],
    categoryTags: ['system', type, 'trending'],
  }
}

export function buildSystemSeedActivities(): Activity[] {
  const list: Activity[] = [
    ...buildListeningFromDbActivities(),
    ...buildCuratedCoreActivities(),
  ]

  list.push(
    mediaSeed('sys-music-feel-lyrics', 'music', 'Feel the Lyrics', 'B1', pickThumbnail('music', 0), SHORT.musicFeel),
    mediaSeed('sys-music-chorus-fill', 'music', 'Chorus Fill-In', 'A2', pickThumbnail('music', 1), SHORT.musicChorus),
    mediaSeed('sys-video-workday-vlog', 'video', 'Coffee Shop English', 'B1', pickThumbnail('video', 0), SHORT.cafeEasy),
    mediaSeed('sys-video-interview-clip', 'video', 'Café Order Practice', 'A2', pickThumbnail('video', 1), SHORT.cafePastry),
    {
      id: 'sys-video-ordering-coffee',
      title: 'Ordering Coffee',
      description: 'Short café clip (under 5 min): tap words, then complete the gap.',
      type: 'video',
      level: 'A2',
      difficulty: 'basic',
      duration: 8,
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
          latte: { meaning: 'Espresso with steamed milk — a popular café drink.', pronunciation: '/ˈlɑːteɪ/', kind: 'meaning' },
          grande: { meaning: 'A medium-large size in many cafés (bigger than tall).', pronunciation: '/ˈɡrɑːndeɪ/', kind: 'meaning' },
          almond: { meaning: 'A nut; “almond milk” is a dairy-free milk option.', pronunciation: '/ˈɑːmənd/', kind: 'sound' },
          vanilla: { meaning: 'A sweet flavour often added to coffee drinks.', pronunciation: '/vəˈnɪlə/', kind: 'meaning' },
        },
        gap: {
          sentence: "I'll go with a ______, with almond milk and vanilla.",
          options: ['grande', 'short', 'venti', 'tall', 'tiny', 'gallon'],
          correctIndex: 0,
          explanation: 'The customer chooses a grande size.',
        },
      },
      points: 18,
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
      duration: 8,
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
          reservation: { meaning: 'A booking you made in advance.', pronunciation: '/ˌrezəˈveɪʃn/', kind: 'meaning' },
          passport: { meaning: 'Official travel document with your photo.', pronunciation: '/ˈpɑːspɔːt/', kind: 'sound' },
          May: { meaning: 'Polite word for asking permission.', pronunciation: '/meɪ/', kind: 'explain' },
          flight: { meaning: 'A journey by plane.', pronunciation: '/flaɪt/', kind: 'meaning' },
        },
        gap: {
          sentence: 'May I see your ______, please?',
          options: ['passport', 'ticket', 'suitcase', 'menu', 'receipt', 'umbrella'],
          correctIndex: 0,
          explanation: 'The agent asks to see the passenger’s passport.',
        },
      },
      points: 18,
      isPublished: true,
      isSystem: true,
      skills: ['video', 'listening'],
      practicePoints: ['Travel English', 'Polite questions'],
      categoryTags: ['system', 'video', 'listening'],
    },
    mediaSeed('sys-game-quick-quiz', 'game', 'Quick Quiz Arena', 'A2', pickThumbnail('game', 0)),
    mediaSeed('sys-game-grammar-duel', 'game', 'Grammar Duel', 'B1', pickThumbnail('game', 1)),
    mediaSeed('sys-game-vocab-battle', 'game', 'Vocabulary Battle', 'B1', pickThumbnail('game', 2)),
  )

  return list
}

export const systemSeedActivities = buildSystemSeedActivities()
