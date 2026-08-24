/**
 * Reads scripts/backups/activities-system-2026-08-24.json and writes
 * src/data/listening-system-from-db.ts with listening activities + audio URL map.
 *
 * Usage: node scripts/generate-listening-from-backup.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const backupPath = resolve(root, 'scripts/backups/activities-system-2026-08-24.json')
const outPath = resolve(root, 'src/data/listening-system-from-db.ts')

const DIFF_CAPS = {
  basic: { base: 10, cap: 25 },
  intermediate: { base: 15, cap: 35 },
  advanced: { base: 20, cap: 45 },
}

function slugFromTitle(title) {
  return title
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function difficultyFromLevel(level) {
  if (level === 'A1' || level === 'A2') return 'basic'
  if (level === 'B1') return 'intermediate'
  return 'advanced'
}

function durationPoints(n, difficulty) {
  const { base, cap } = DIFF_CAPS[difficulty]
  return {
    duration: Math.min(25, Math.ceil(n * 1.1) + 2),
    points: Math.min(cap, base + Math.floor(n * 1.5)),
  }
}

function esc(s) {
  return JSON.stringify(s)
}

/** Shuffle options so correctIndex is not always 0; returns { options, correctIndex }. */
function pack(correct, distractors, preferredIndex) {
  const six = [correct, ...distractors].slice(0, 6)
  while (six.length < 6) six.push(`Option ${six.length + 1}`)
  const idx =
    typeof preferredIndex === 'number'
      ? ((preferredIndex % 6) + 6) % 6
      : Math.abs(hash(correct + distractors.join('|'))) % 6
  const options = [...six]
  const [c] = options.splice(0, 1)
  options.splice(idx, 0, c)
  return { options, correctIndex: idx }
}

function hash(s) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return h
}

function q(question, correct, distractors, explanation, preferredIndex) {
  const { options, correctIndex } = pack(correct, distractors, preferredIndex)
  return { question, options, correctIndex, explanation }
}

function detectFamily(audioText) {
  if (audioText.includes('My name is Anna')) return 'a1'
  if (audioText.includes('wake up at seven')) return 'a2'
  if (audioText.includes('book the tickets today')) return 'b1'
  if (audioText.includes('remote collaboration')) return 'b2'
  return 'generic'
}

function buildQuestions(title, audioText) {
  const family = detectFamily(audioText)
  const banks = {
    a1: () => [
      q(
        `What topic does the speaker introduce?`,
        title,
        ['Cooking pasta', 'Airport security', 'Football scores', 'Stock markets', 'Car repairs'],
        `The opening mentions practice about “${title}”.`,
        1,
      ),
      q(
        'What is the speaker’s name?',
        'Anna',
        ['Maria', 'John', 'Tom', 'Sarah', 'Lucas'],
        'She says “My name is Anna.”',
        0,
      ),
      q(
        'What does Anna do?',
        'She is a student',
        [
          'She is a teacher',
          'She is a pilot',
          'She is a doctor',
          'She is a chef',
          'She works in a bank',
        ],
        'She says “I am a student.”',
        2,
      ),
      q(
        'Which things does Anna like?',
        'Coffee and books',
        [
          'Tea and films',
          'Pizza and games',
          'Sports and cars',
          'Music and dancing only',
          'Travel and cooking only',
        ],
        'She says “I like coffee and books.”',
        3,
      ),
      q(
        'How does the audio begin?',
        'With a hello and a welcome',
        [
          'With a weather forecast',
          'With a phone number',
          'With a train timetable',
          'With an angry complaint',
          'With a news headline',
        ],
        'It starts “Hello! Welcome to today’s practice…”',
        4,
      ),
      q(
        'What should the listener do after hearing the talk?',
        'Answer the questions',
        [
          'Ignore the audio',
          'Call the police',
          'Buy tickets immediately',
          'Rewrite the whole script',
          'Turn off the device only',
        ],
        'The speaker asks you to listen carefully and answer the questions.',
        5,
      ),
      q(
        'Which word best describes the speaking speed and purpose?',
        'Clear practice listening',
        [
          'A chaotic argument',
          'A silent meditation',
          'A sports commentary',
          'A legal contract reading',
          'A music concert',
        ],
        undefined,
        1,
      ),
      q(
        'Does the speaker mention liking books?',
        'Yes',
        ['No', 'Only newspapers', 'Only magazines', 'Only comics', 'It is never said'],
        'She likes coffee and books.',
        2,
      ),
      q(
        'Is Anna introduced as a teacher?',
        'No — she is a student',
        [
          'Yes — she is a teacher',
          'Yes — she is a manager',
          'The job is unknown',
          'She is retired',
          'She is a tourist guide',
        ],
        'The audio says she is a student.',
        0,
      ),
      q(
        `Which title is named in this listening?`,
        title,
        [
          'Lost Keys',
          'Airport Delay',
          'Mountain Hiking',
          'Ocean Swimming',
          'Museum Night Tour',
        ],
        `The practice is about “${title}”.`,
        3,
      ),
    ],
    a2: () => [
      q(
        `What is this listening about?`,
        title,
        ['Space travel', 'Bank fraud', 'Opera history', 'Computer coding', 'Farm animals'],
        `The speaker says the listening is about “${title}”.`,
        2,
      ),
      q(
        'When does the speaker wake up?',
        'At seven',
        ['At five', 'At nine', 'At noon', 'At midnight', 'At three'],
        '“Every morning I wake up at seven.”',
        0,
      ),
      q(
        'What does the speaker do after waking up?',
        'Have breakfast',
        [
          'Go straight to bed',
          'Fly abroad',
          'Start a meeting online',
          'Buy a car',
          'Run a marathon first',
        ],
        'Wake up, have breakfast, then go to work.',
        1,
      ),
      q(
        'How does the speaker go to work?',
        'By bus',
        ['By plane', 'By boat', 'By helicopter', 'On foot only', 'By subway only'],
        '“…go to work by bus.”',
        4,
      ),
      q(
        'What does the speaker do later?',
        'Call a friend',
        [
          'Write a novel',
          'Close the shop forever',
          'Repair a roof',
          'Paint the house',
          'Visit the dentist only',
        ],
        '“Later I call a friend and plan the weekend.”',
        5,
      ),
      q(
        'What do they plan together?',
        'The weekend',
        ['Next year only', 'A wedding abroad', 'A tax return', 'A new company', 'A school exam'],
        'They plan the weekend.',
        3,
      ),
      q(
        'How does the clip open?',
        'Good morning',
        ['Good night', 'Ladies and gentlemen', 'Breaking news', 'Dear Sir', 'See you later'],
        'It begins “Good morning.”',
        1,
      ),
      q(
        'What should the listener focus on?',
        'Key details',
        [
          'Background music only',
          'Spelling of every word',
          'The speaker’s accent alone',
          'Ignoring times and actions',
          'Guessing without listening',
        ],
        '“Listen for the key details.”',
        2,
      ),
      q(
        'Is breakfast mentioned?',
        'Yes',
        ['No', 'Only dinner', 'Only snacks', 'Only coffee without food', 'Never said'],
        'The routine includes breakfast.',
        0,
      ),
      q(
        'Which transport is mentioned?',
        'Bus',
        ['Train', 'Taxi', 'Bike', 'Tram', 'Ferry'],
        'Work travel is by bus.',
        4,
      ),
    ],
    b1: () => [
      q(
        `What topic is discussed today?`,
        title,
        ['Cooking desserts', 'Football tactics', 'Garden insects', 'Piano tuning', 'Deep-sea diving'],
        `The speaker says they discuss “${title}”.`,
        1,
      ),
      q(
        'When should tickets be booked?',
        'Today',
        ['Next month', 'In two years', 'Never', 'Yesterday only', 'After the trip'],
        '“We should book the tickets today…”',
        0,
      ),
      q(
        'Why book today?',
        'Prices rise tomorrow morning',
        [
          'The station closes forever',
          'Passports expire tonight',
          'There is free food tomorrow',
          'Trains stop running forever',
          'The weather becomes perfect',
        ],
        'Prices rise tomorrow morning.',
        2,
      ),
      q(
        'What document should you check?',
        'Your passport',
        ['Your school report', 'Your gym card', 'Your library book', 'Your shopping list', 'Your Wi-Fi password'],
        '“Also, check your passport…”',
        3,
      ),
      q(
        'Where should you arrive early?',
        'At the station',
        ['At the cinema', 'At the beach', 'At the gym', 'At a café only', 'At the office cafeteria'],
        '“…arrive early at the station.”',
        5,
      ),
      q(
        'What should you focus on while listening?',
        'Reasons and next steps',
        [
          'Only background noise',
          'Only the speaker’s shoes',
          'Ignoring advice',
          'Memorizing every comma',
          'The color of the tickets',
        ],
        '“Focus on reasons and next steps.”',
        4,
      ),
      q(
        'How does the speaker greet the audience?',
        'Hi everyone',
        ['Dear customer', 'Breaking news', 'Good night all', 'Emergency alert', 'Class dismissed'],
        'It opens “Hi everyone.”',
        1,
      ),
      q(
        'When do prices rise?',
        'Tomorrow morning',
        ['Tonight at midnight', 'In one hour', 'Next winter', 'In ten years', 'They never rise'],
        'Prices rise tomorrow morning.',
        2,
      ),
      q(
        'Is arriving late recommended?',
        'No — arrive early',
        [
          'Yes — arrive late',
          'Arrive whenever you like',
          'Skip the station',
          'Stay home instead',
          'The time does not matter',
        ],
        'You should arrive early at the station.',
        0,
      ),
      q(
        'What action pairs with checking the passport?',
        'Booking tickets and arriving early',
        [
          'Deleting the booking',
          'Changing the destination randomly',
          'Ignoring prices',
          'Leaving the passport at home',
          'Waiting until prices rise',
        ],
        undefined,
        3,
      ),
    ],
    b2: () => [
      q(
        `Which listening title is announced?`,
        title,
        ['Market Crash Special', 'Sports Final', 'Weather Alert', 'Cooking Live', 'Traffic Update'],
        `It is introduced as a B2 listening on “${title}”.`,
        2,
      ),
      q(
        'Which theme does the speaker discuss first among the listed topics?',
        'Remote collaboration',
        [
          'Local farming',
          'Classical music theory',
          'Fashion trends',
          'Ocean pollution only',
          'Hotel breakfast menus',
        ],
        'The speaker discusses remote collaboration, measurable outcomes, and clear communication.',
        0,
      ),
      q(
        'Besides remote collaboration, what else is discussed?',
        'Measurable outcomes and clear communication',
        [
          'Holiday decorations',
          'Pet training tips',
          'Street food prices',
          'Airport lounges only',
          'Sports betting rules',
        ],
        'Those three themes are named together.',
        1,
      ),
      q(
        'What should you note before answering?',
        'The main argument and supporting examples',
        [
          'Only the background music',
          'The speaker’s clothing',
          'A shopping receipt',
          'Irrelevant side jokes only',
          'The room temperature',
        ],
        '“Note the main argument and supporting examples before you answer.”',
        4,
      ),
      q(
        'What level is this listening labeled as?',
        'B2',
        ['A1', 'A2', 'B1', 'C2 only', 'Beginner kids'],
        'It is introduced as a B2 listening.',
        3,
      ),
      q(
        'Is “clear communication” mentioned?',
        'Yes',
        ['No', 'Only once as a joke', 'Only in the title screen', 'Never', 'Replaced by silence'],
        'It is one of the three discussion points.',
        5,
      ),
      q(
        'What kind of outcomes are mentioned?',
        'Measurable outcomes',
        [
          'Random guesses',
          'Secret outcomes',
          'Impossible outcomes',
          'Unrelated jokes',
          'Fashion outcomes',
        ],
        undefined,
        1,
      ),
      q(
        'How does the clip welcome the listener?',
        'Welcome to this B2 listening…',
        [
          'Goodbye from this course…',
          'Sorry, wrong number…',
          'This is a silent track…',
          'Please hang up now…',
          'Emergency broadcast only…',
        ],
        'It opens with a welcome to the B2 listening.',
        2,
      ),
      q(
        'What is the listener asked to do with the main argument?',
        'Note it (and the examples) before answering',
        [
          'Ignore it completely',
          'Delete it from memory',
          'Argue against it without listening',
          'Skip straight to guessing',
          'Rewrite it in another language first',
        ],
        'Note the main argument and supporting examples first.',
        0,
      ),
      q(
        'Which skill area does this activity primarily train?',
        'Listening comprehension at B2',
        [
          'Silent reading only',
          'Handwriting practice',
          'Math calculation',
          'Drawing sketches',
          'Typing speed tests',
        ],
        undefined,
        3,
      ),
    ],
    generic: () => {
      const words = audioText.split(/\s+/).filter(Boolean)
      const snippet = words.slice(0, 8).join(' ')
      return [
        q(`What title is this listening about?`, title, ['Other topic A', 'Other topic B', 'Other topic C', 'Other topic D', 'Other topic E'], undefined, 0),
        q('How does the audio roughly begin?', snippet || 'With an introduction', ['With silence only', 'With a scream', 'With a song chorus', 'With static noise', 'With a countdown only'], undefined, 1),
        q('What should you do while listening?', 'Focus on meaning and details', ['Ignore the words', 'Sleep through it', 'Talk over the audio', 'Close your eyes and guess only', 'Skip every sentence'], undefined, 2),
        q('Is there spoken English content?', 'Yes', ['No', 'Only music', 'Only beep sounds', 'Only numbers', 'Only applause'], undefined, 3),
        q('What is the best strategy?', 'Listen carefully then answer', ['Guess without listening', 'Read only the options first forever', 'Mute the audio always', 'Skip questions', 'Change the topic'], undefined, 4),
        q('The passage length is…', 'A short practice clip', ['A full novel', 'A silent film', 'A three-hour lecture', 'An empty file', 'A phone ringtone only'], undefined, 5),
        q('Main purpose of the clip?', 'Listening practice', ['Cooking demo', 'Sports match', 'Weather satellite control', 'Bank transfer', 'Hardware repair'], undefined, 0),
        q('After listening you should…', 'Answer the comprehension questions', ['Delete the activity', 'Call customer support', 'Rewrite the MP3', 'Ignore feedback', 'Leave the page immediately'], undefined, 1),
      ]
    },
  }

  const list = (banks[family] || banks.generic)()
  // Keep 8–12
  if (list.length < 8) {
    while (list.length < 8) {
      list.push(
        q(
          `Extra check for “${title}”: what is the activity type?`,
          'Listening comprehension',
          ['Writing essay', 'Silent reading only', 'Math quiz', 'Drawing test', 'Typing race'],
          undefined,
          list.length % 6,
        ),
      )
    }
  }
  return list.slice(0, 12)
}

function improveDescription(title, level, family) {
  const byFamily = {
    a1: `Short A1 listening practice on “${title}”. Catch the speaker’s name, job, and likes.`,
    a2: `A2 listening on “${title}”. Track morning routine details: times, transport, and plans.`,
    b1: `B1 listening on “${title}”. Follow advice about booking, documents, and timing.`,
    b2: `B2 listening on “${title}”. Identify the themes and the main argument with examples.`,
    generic: `Listening comprehension practice: ${title} (${level}).`,
  }
  return byFamily[family] || byFamily.generic
}

function instructionsFor(family) {
  if (family === 'a1') return 'Listen once carefully, then answer every question about what you heard.'
  if (family === 'a2') return 'Listen for times, actions, and plans. Answer all questions.'
  if (family === 'b1') return 'Note reasons and next steps. Then answer the questions.'
  if (family === 'b2') return 'Note the main argument and supporting examples before you answer.'
  return 'Play the audio, then answer all questions.'
}

function renderQuestion(item, indent) {
  const sp = ' '.repeat(indent)
  const lines = [
    `${sp}{`,
    `${sp}  question: ${esc(item.question)},`,
    `${sp}  options: [`,
    ...item.options.map((o) => `${sp}    ${esc(o)},`),
    `${sp}  ],`,
    `${sp}  correctIndex: ${item.correctIndex},`,
  ]
  if (item.explanation) {
    lines.push(`${sp}  explanation: ${esc(item.explanation)},`)
  }
  lines.push(`${sp}},`)
  return lines.join('\n')
}

function main() {
  const raw = JSON.parse(readFileSync(backupPath, 'utf8'))
  const rows = (Array.isArray(raw) ? raw : raw.activities || []).filter(
    (a) => a && a.type === 'listening',
  )
  if (rows.length !== 20) {
    console.warn(`Expected 20 listening rows, found ${rows.length}`)
  }

  const audioMap = {}
  const activityBlocks = []

  rows.forEach((row, index) => {
    const title = row.title
    const level = row.level
    const audioText = row.content?.audioText ?? ''
    const transcript = row.content?.transcript ?? audioText
    const family = detectFamily(audioText)
    const questions = buildQuestions(title, audioText)
    const n = questions.length
    const difficulty = difficultyFromLevel(level)
    const { duration, points } = durationPoints(n, difficulty)
    const id = `sys-listen-${slugFromTitle(title)}`
    const description = improveDescription(title, level, family)
    if (row.audio_url) audioMap[title] = row.audio_url

    // Validate
    if (n < 8 || n > 12) throw new Error(`${title}: bad question count ${n}`)
    for (const qq of questions) {
      if (qq.options.length !== 6) throw new Error(`${title}: options !== 6`)
      if (qq.correctIndex < 0 || qq.correctIndex >= 6) throw new Error(`${title}: bad correctIndex`)
    }

    activityBlocks.push(`    {
      id: ${esc(id)},
      title: ${esc(title)},
      description: ${esc(description)},
      type: 'listening',
      level: ${esc(level)},
      difficulty: ${esc(difficulty)},
      duration: ${duration},
      points: ${points},
      thumbnail: pickThumbnail('listening', ${index}),
      instructions: ${esc(instructionsFor(family))},
      skills: ['listening'],
      categoryTags: ['system', 'listening'],
      isPublished: true,
      isSystem: true,
      content: {
        subtype: 'comprehension',
        audioText: ${esc(audioText)},
        transcript: ${esc(transcript)},
        questions: [
${questions.map((qq) => renderQuestion(qq, 10)).join('\n')}
        ],
      },
    }`)
  })

  const audioEntries = Object.entries(audioMap)
    .map(([t, u]) => `  ${esc(t)}: ${esc(u)},`)
    .join('\n')

  const file = `/* eslint-disable */
/**
 * AUTO-GENERATED by scripts/generate-listening-from-backup.mjs
 * Source: scripts/backups/activities-system-2026-08-24.json
 * Do not edit audioText/transcript by hand — regenerate from backup instead.
 */
import type { Activity } from '@/types/activity'
import { pickThumbnail } from './thumbnails.ts'

/** Backup audio_url by activity title (for sync / re-upload scripts). */
export const listeningAudioUrlByTitle: Record<string, string> = {
${audioEntries}
}

export function buildListeningFromDbActivities(): Activity[] {
  return [
${activityBlocks.join(',\n')}
  ]
}
`

  writeFileSync(outPath, file, 'utf8')
  console.log(`Wrote ${outPath}`)
  console.log(`Activities: ${rows.length}`)
  console.log(
    rows
      .slice(0, 2)
      .map((r) => {
        const qs = buildQuestions(r.title, r.content?.audioText ?? '')
        return `  - ${r.title}: ${qs.length} questions`
      })
      .join('\n'),
  )
}

main()
