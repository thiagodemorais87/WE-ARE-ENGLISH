import type {
  Activity,
  ActivityDifficulty,
  ActivityLevel,
  EngineActivityType,
  ActivityContent,
  QuizQuestionItem,
} from '@/types/activity'
import { pickThumbnail } from './thumbnails.ts'

const LEVELS: ActivityLevel[] = ['A1', 'A2', 'B1', 'B2']
const SKILLS: EngineActivityType[] = [
  'listening',
  'speaking',
  'writing',
  'reading',
  'grammar',
  'vocabulary',
]

const titles: Record<EngineActivityType, Record<ActivityLevel, string[]>> = {
  listening: {
    A1: ['At the Café', 'My Name Is', 'Numbers 1–20', 'Days of the Week', 'Simple Directions'],
    A2: ['My Daily Routine', 'Shopping for Clothes', 'Weather Today', 'At the Bus Stop', 'Calling a Friend'],
    B1: ['Planning a Trip', 'A Doctor Appointment', 'Renting a Flat', 'Weekend Plans', 'Lost Luggage'],
    B2: ['A Job Interview', 'University Open Day', 'News Report', 'Podcast: Habits', 'Customer Complaint'],
    C1: ['Debate on Remote Work', 'Scientific Podcast', 'Panel Meeting', 'Documentary Clip', 'Panel Interview'],
    C2: ['Policy Briefing', 'Literary Discussion', 'Market Analysis Call', 'Diplomatic Brief', 'Tech Keynote'],
  },
  speaking: {
    A1: ['Introduce Yourself', 'Say Your Phone Number', 'Describe Your Room', 'Food You Like', 'My Family'],
    A2: ['Describe Your Family', 'Talk About Hobbies', 'Your School Day', 'Favorite Film', 'Last Weekend'],
    B1: ['Talk About Your Last Vacation', 'Give Directions', 'Opinion on Sports', 'A Memorable Meal', 'Future Plans'],
    B2: ['Discuss Your Future Career', 'Persuade a Friend', 'Describe a Problem', 'Review a Product', 'City vs Countryside'],
    C1: ['Argue For Renewables', 'Pitch a Startup', 'Critique a Film', 'Explain a Process', 'Negotiate a Deal'],
    C2: ['Defend a Thesis', 'Chair a Meeting', 'Interpret Nuance', 'Impromptu Speech', 'Cross-cultural Advice'],
  },
  writing: {
    A1: ['Write About Yourself', 'My Favorite Food', 'A Short Postcard', 'My Pet', 'Today’s Weather'],
    A2: ['Write About Your Weekend', 'An Email to a Friend', 'Describe Your Town', 'My Best Friend', 'A Shopping List Email'],
    B1: ['Write About Your Last Vacation', 'A Complaint Email', 'Blog: Healthy Habits', 'Invite a Friend', 'Movie Review'],
    B2: ['Write an Email to Your Teacher', 'Opinion Essay: Social Media', 'Cover Letter Draft', 'Travel Blog Post', 'Reply to a Complaint'],
    C1: ['Argument Essay: AI', 'Formal Report Summary', 'Proposal Email', 'Editorial Reply', 'Case Study Notes'],
    C2: ['Policy Memo', 'Literary Analysis', 'Research Abstract', 'Op-Ed Draft', 'Executive Brief'],
  },
  reading: {
    A1: ['A Short Profile', 'Café Menu', 'Classroom Notice', 'Simple Story', 'Birthday Invitation'],
    A2: ['A Travel Brochure', 'Email from a Friend', 'Sports News Short', 'Recipe Steps', 'Lost Pet Poster'],
    B1: ['Article: Sleep Tips', 'Blog: City Guides', 'Message Board Posts', 'Product Review', 'School Newsletter'],
    B2: ['Opinion Piece: Transport', 'Company FAQ', 'Short Story Excerpt', 'Science News', 'Housing Contract Notes'],
    C1: ['Feature Article', 'Academic Abstract', 'Editorial', 'Case Study', 'Technical Blog'],
    C2: ['Journal Paper Intro', 'Legal Summary', 'Literary Essay', 'White Paper Excerpt', 'Philosophy Text'],
  },
  grammar: {
    A1: ['Verb To Be', 'A/An/The', 'Possessives', 'Present Simple', 'Plurals'],
    A2: ['Past Simple', 'Comparatives', 'Countable Nouns', 'Going To', 'Prepositions of Place'],
    B1: ['Present Perfect', 'First Conditional', 'Modal Verbs', 'Relative Clauses (who/which)', 'Used To'],
    B2: ['Second Conditional', 'Passive Voice', 'Reported Speech', 'Mixed Conditionals Intro', 'Wish + Past'],
    C1: ['Inversion', 'Cleft Sentences', 'Advanced Modals', 'Participle Clauses', 'Subjunctive'],
    C2: ['Nominalisation', 'Hedging Language', 'Complex Relatives', 'Ellipsis & Substitution', 'Register Shift'],
  },
  vocabulary: {
    A1: ['Colors & Clothes', 'Family Words', 'Food Basics', 'Classroom Objects', 'Feelings'],
    A2: ['Jobs', 'Travel Words', 'House Rooms', 'Hobbies', 'Weather Words'],
    B1: ['Health Vocabulary', 'Phrasal Verbs (daily)', 'Environment Basics', 'Money & Shopping', 'Technology Basics'],
    B2: ['Business English Starter', 'Idioms of Time', 'Academic Word List 1', 'Collocations', 'Media Vocabulary'],
    C1: ['Nuanced Adjectives', 'Academic Word List 2', 'Legal Basics', 'Science Collocations', 'Diplomatic Language'],
    C2: ['Literary Devices', 'Specialized Jargon', 'Metaphor Sets', 'Register Extremes', 'Obscure Synonyms'],
  },
  pronunciation: {
    A1: ['Vowels /ɪ/ vs /iː/', 'Final -s Sounds', 'Word Stress Basics', 'TH Sounds Intro', 'Numbers Pronunciation'],
    A2: ['Past -ed Endings', 'Schwa Sound', 'Linking Words', 'Minimal Pairs /æ/ /ʌ/', 'Sentence Stress'],
    B1: ['Intonation in Questions', 'Connected Speech', 'Silent Letters', 'Stress in Compounds', 'Weak Forms'],
    B2: ['Contrastive Stress', 'Assimilation', 'Chunking Speech', 'Emphatic Intonation', 'Accent Awareness'],
    C1: ['Prosody in Presentations', 'Subtle Vowel Shifts', 'Pragmatic Intonation', 'Rhythm Patterns', 'Clarity Drills'],
    C2: ['Actor’s Diction', 'Regional Variants', 'Rhetorical Pause', 'Precision Consonants', 'Public Speaking Prosody'],
  },
  multiple_choice: {
    A1: ['Choose the Greeting', 'Select the Number', 'Pick the Color', 'Choose the Animal', 'Select the Verb'],
    A2: ['Choose the Past Form', 'Pick the Preposition', 'Select the Job', 'Choose the Weather', 'Pick the Time'],
    B1: ['Choose the Best Reply', 'Select the Synonym', 'Pick the Connector', 'Choose the Modal', 'Select the Meaning'],
    B2: ['Choose the Formal Option', 'Pick the Collocation', 'Select the Inference', 'Choose the Tone', 'Pick the Headline'],
    C1: ['Nuance Choice', 'Register Choice', 'Academic Option', 'Implied Meaning', 'Best Paraphrase'],
    C2: ['Subtle Distinction', 'Legal Wording', 'Literary Tone', 'Precision Synonym', 'Pragmatic Force'],
  },
  fill_blank: {
    A1: ['Complete: I ___ a student', 'Fill: She ___ happy', 'Gap: They ___ friends', 'Blank: This ___ a book', 'Gap: We ___ here'],
    A2: ['Past Gap Fill', 'Preposition Gaps', 'Going-to Gaps', 'Article Gaps', 'Pronoun Gaps'],
    B1: ['Present Perfect Gaps', 'Connector Gaps', 'Modal Gaps', 'Relative Gaps', 'Phrasal Gaps'],
    B2: ['Passive Gaps', 'Reported Gaps', 'Conditional Gaps', 'Noun Clause Gaps', 'Adjective Gaps'],
    C1: ['Advanced Connector Gaps', 'Nominalisation Gaps', 'Hedging Gaps', 'Participle Gaps', 'Inversion Gaps'],
    C2: ['Precision Lexis Gaps', 'Formal Register Gaps', 'Idiom Gaps', 'Academic Verb Gaps', 'Subtle Grammar Gaps'],
  },
  word_order: {
    A1: ['Order: I am a teacher', 'Order: She likes apples', 'Order: They live in Brazil', 'Order: He is my friend', 'Order: We play football'],
    A2: ['Order: Yesterday I went home', 'Order: She is taller than me', 'Order: I am going to study', 'Order: There is a cat', 'Order: Do you like pizza'],
    B1: ['Order: I have already finished', 'Order: If it rains we will stay', 'Order: The book which I bought', 'Order: She used to dance', 'Order: You should see a doctor'],
    B2: ['Order: The letter was sent yesterday', 'Order: He said he was tired', 'Order: If I were you I would go', 'Order: Not only did she win', 'Order: Rarely have I seen'],
    C1: ['Order: Had I known I would have helped', 'Order: What matters is practice', 'Order: It was John who called', 'Order: Hardly had we arrived', 'Order: So rare is this'],
    C2: ['Order: Complex Cleft', 'Order: Formal Inversion', 'Order: Nested Relative', 'Order: Absolute Phrase', 'Order: Emphatic Fronting'],
  },
  matching: {
    A1: ['Match Greetings', 'Match Numbers', 'Match Colors', 'Match Rooms', 'Match Foods'],
    A2: ['Match Jobs', 'Match Places', 'Match Verbs', 'Match Clothes', 'Match Feelings'],
    B1: ['Match Phrasal Verbs', 'Match Synonyms', 'Match Topics', 'Match Definitions', 'Match Collocations'],
    B2: ['Match Idioms', 'Match Formal/Informal', 'Match Headlines', 'Match Academic Words', 'Match Causes'],
    C1: ['Match Nuances', 'Match Registers', 'Match Discourse Markers', 'Match Citations', 'Match Frameworks'],
    C2: ['Match Literary Terms', 'Match Legal Terms', 'Match Rhetorical Devices', 'Match Philosophies', 'Match Specialties'],
  },
  true_false: {
    A1: ['TF: The sun is hot', 'TF: Cats can fly', 'TF: Water is wet', 'TF: Monday is a day', 'TF: Ice is cold'],
    A2: ['TF: Routine Facts', 'TF: Weather Claims', 'TF: School Facts', 'TF: Travel Claims', 'TF: Food Facts'],
    B1: ['TF: Article Claims', 'TF: Health Myths', 'TF: City Facts', 'TF: Work Claims', 'TF: Tech Myths'],
    B2: ['TF: Opinion vs Fact', 'TF: News Claims', 'TF: Science Myths', 'TF: Business Claims', 'TF: Media Myths'],
    C1: ['TF: Academic Claims', 'TF: Policy Statements', 'TF: Research Claims', 'TF: Economic Myths', 'TF: Cultural Claims'],
    C2: ['TF: Philosophical Claims', 'TF: Legal Assertions', 'TF: Literary Claims', 'TF: Statistical Claims', 'TF: Ethical Claims'],
  },
}

function difficultyFor(level: ActivityLevel): ActivityDifficulty {
  if (level === 'A1' || level === 'A2') return 'easy'
  if (level === 'B1' || level === 'B2') return 'medium'
  return 'hard'
}

/** ≥10 MC items for quiz-style activities */
export function buildQuizQuestions(
  topic: string,
  level: ActivityLevel,
  count = 10,
): QuizQuestionItem[] {
  const stems = [
    `What is the main idea of “${topic}”?`,
    `Which option best matches “${topic}” at ${level}?`,
    `In “${topic}”, what should you notice first?`,
    `Which answer is most accurate for “${topic}”?`,
    `What skill does “${topic}” mainly practice?`,
    `Which choice supports understanding of “${topic}”?`,
    `For ${level} learners, “${topic}” focuses on…`,
    `What is a useful strategy for “${topic}”?`,
    `Which distractor is clearly wrong for “${topic}”?`,
    `After finishing “${topic}”, you should be able to…`,
    `Which example fits “${topic}” best?`,
    `What is the next step after studying “${topic}”?`,
  ]
  return Array.from({ length: count }, (_, i) => ({
    id: `q${i + 1}`,
    question: stems[i % stems.length]!,
    options: [
      `Best answer for item ${i + 1}`,
      `Unrelated detail`,
      `Opposite meaning`,
      `Off-topic option`,
    ],
    correctIndex: 0,
    explanation: `Item ${i + 1} checks comprehension of “${topic}”.`,
  }))
}

/** Cambridge-style open cloze: 10 sentences with one gap each */
export function buildCambridgeFillBlank(
  level: ActivityLevel,
): {
  items: { id: string; sentence: string; answer: string; alternatives?: string[] }[]
  explanation: string
} {
  const banks: Record<ActivityLevel, { sentence: string; answer: string; alternatives?: string[] }[]> = {
    A1: [
      { sentence: 'I _____ a student.', answer: 'am' },
      { sentence: 'She _____ happy today.', answer: 'is' },
      { sentence: 'They _____ my friends.', answer: 'are' },
      { sentence: 'He _____ from Brazil.', answer: 'is' },
      { sentence: 'We _____ in the classroom.', answer: 'are' },
      { sentence: 'This _____ a book.', answer: 'is' },
      { sentence: 'There _____ a cat on the sofa.', answer: 'is' },
      { sentence: 'My name _____ Ana.', answer: 'is' },
      { sentence: 'You _____ very kind.', answer: 'are' },
      { sentence: 'It _____ cold outside.', answer: 'is' },
    ],
    A2: [
      { sentence: 'I _____ to the cinema yesterday.', answer: 'went' },
      { sentence: 'She is interested _____ music.', answer: 'in' },
      { sentence: 'We _____ going to visit grandma.', answer: 'are' },
      { sentence: 'He _____ already finished his homework.', answer: 'has' },
      { sentence: 'There _____ many people at the party.', answer: 'were' },
      { sentence: 'I usually _____ coffee in the morning.', answer: 'drink' },
      { sentence: 'Can you _____ me the salt, please?', answer: 'pass' },
      { sentence: 'She _____ taller than her brother.', answer: 'is' },
      { sentence: 'They _____ lived here for two years.', answer: 'have' },
      { sentence: 'Do you _____ pizza?', answer: 'like' },
    ],
    B1: [
      { sentence: 'I have _____ finished the report.', answer: 'already' },
      { sentence: 'If it rains, we _____ stay home.', answer: 'will' },
      { sentence: 'She used _____ dance when she was young.', answer: 'to' },
      { sentence: 'You should _____ a doctor.', answer: 'see' },
      { sentence: 'The book _____ I bought was expensive.', answer: 'which', alternatives: ['that'] },
      { sentence: 'He has been working here _____ 2020.', answer: 'since' },
      { sentence: 'I look forward _____ hearing from you.', answer: 'to' },
      { sentence: 'We _____ never been to Japan.', answer: 'have' },
      { sentence: 'She might _____ late tonight.', answer: 'be' },
      { sentence: 'Although it was cold, they _____ swimming.', answer: 'went' },
    ],
    B2: [
      { sentence: 'The letter was _____ yesterday.', answer: 'sent' },
      { sentence: 'He said he _____ tired.', answer: 'was' },
      { sentence: 'If I _____ you, I would apply.', answer: 'were' },
      { sentence: 'Not only _____ she win, but she also set a record.', answer: 'did' },
      { sentence: 'I wish I _____ more time.', answer: 'had' },
      { sentence: 'The project, _____ was delayed, finally launched.', answer: 'which' },
      { sentence: 'She insisted _____ paying the bill.', answer: 'on' },
      { sentence: 'By next year they will _____ finished the course.', answer: 'have' },
      { sentence: 'Rarely _____ I seen such talent.', answer: 'have' },
      { sentence: 'He apologized _____ being late.', answer: 'for' },
    ],
    C1: [
      { sentence: 'Had I known, I _____ have helped.', answer: 'would' },
      { sentence: 'What matters _____ practice.', answer: 'is' },
      { sentence: 'It was John _____ called.', answer: 'who' },
      { sentence: 'Hardly _____ we arrived when it started raining.', answer: 'had' },
      { sentence: 'She is believed _____ left the country.', answer: 'to' },
      { sentence: 'The more you practice, _____ better you become.', answer: 'the' },
      { sentence: 'I would rather you _____ tomorrow.', answer: 'came' },
      { sentence: 'No sooner _____ he spoken than the door opened.', answer: 'had' },
      { sentence: 'She denied _____ stolen the documents.', answer: 'having' },
      { sentence: 'Little _____ they know about the risks.', answer: 'did' },
    ],
    C2: [
      { sentence: 'Were it not _____ your help, we would have failed.', answer: 'for' },
      { sentence: 'Such _____ his influence that few dared disagree.', answer: 'was' },
      { sentence: 'Be that _____ it may, we must proceed.', answer: 'as' },
      { sentence: 'Scarcely _____ the ink dried when the deal collapsed.', answer: 'had' },
      { sentence: 'He spoke as _____ he owned the place.', answer: 'if', alternatives: ['though'] },
      { sentence: 'Far _____ it from me to criticize, but…', answer: 'be' },
      { sentence: 'The proposal, ingenious _____ it was, proved unworkable.', answer: 'though', alternatives: ['as'] },
      { sentence: 'Only then _____ the truth become clear.', answer: 'did' },
      { sentence: 'Suffice _____ to say that negotiations failed.', answer: 'it' },
      { sentence: 'Strange _____ it seems, the theory holds.', answer: 'as', alternatives: ['though'] },
    ],
  }

  const pool = banks[level] ?? banks.B1
  return {
    items: pool.slice(0, 10).map((item, i) => ({
      id: `fb${i + 1}`,
      sentence: item.sentence,
      answer: item.answer,
      alternatives: item.alternatives,
    })),
    explanation: 'Complete each gap with one word. Spelling must match (case does not matter).',
  }
}

function listeningScript(level: ActivityLevel, topic: string): string {
  if (level === 'A1') {
    return `Hello! Welcome to today’s practice about ${topic}. My name is Anna. I am a student. I like coffee and books. Please listen carefully and answer the questions.`
  }
  if (level === 'A2') {
    return `Good morning. This listening is about ${topic}. Every morning I wake up at seven, have breakfast, and go to work by bus. Later I call a friend and plan the weekend. Listen for the key details.`
  }
  if (level === 'B1') {
    return `Hi everyone. Today we discuss ${topic}. We should book the tickets today because prices rise tomorrow morning. Also, check your passport and arrive early at the station. Focus on reasons and next steps.`
  }
  return `Welcome to this ${level} listening on ${topic}. The speaker discusses remote collaboration, measurable outcomes, and clear communication. Note the main argument and supporting examples before you answer.`
}

function readingPassage(level: ActivityLevel, topic: string): string {
  if (level === 'A1') {
    return `Tom is a teacher. He lives in London. He likes books and tea. This short text is about ${topic}. Read carefully and choose the best answers.`
  }
  if (level === 'A2') {
    return `Last Saturday, Maya visited a museum with her brother. They saw old paintings and took many photos. The visit connects to ${topic}. Look for facts and simple opinions.`
  }
  if (level === 'B1') {
    return `Researchers say sleeping seven to eight hours can improve memory and mood. Simple routines help. This article relates to ${topic}. Identify the main idea and supporting details.`
  }
  return `Urban mobility plans increasingly prioritize cycling lanes, yet funding debates remain contentious among councils. The piece explores ${topic} with nuance suitable for ${level} readers.`
}

function buildContent(type: EngineActivityType, level: ActivityLevel, index: number): ActivityContent {
  const topic = titles[type][level][index] ?? `${type} ${level} ${index + 1}`
  const questions = buildQuizQuestions(topic, level, 10)

  switch (type) {
    case 'listening':
      return {
        subtype: 'multiple_choice',
        audioText: listeningScript(level, topic),
        transcript: listeningScript(level, topic),
        question: questions[0]!.question,
        options: questions[0]!.options,
        correctAnswer: 0,
        explanation: questions[0]!.explanation,
        questions,
      }
    case 'speaking':
      return {
        prompt: `Speak for about one minute: ${topic}. Cover at least three clear points and use ${level}-level language.`,
        expectedDuration: level.startsWith('A') ? 30 : 60,
        mode: level === 'A1' ? 'read_aloud' : 'answer',
        referenceText:
          level === 'A1'
            ? 'Hello, my name is Alex. I am from Brazil. I am a student. I like English classes.'
            : undefined,
        evaluation: {
          pronunciation: true,
          fluency: true,
          grammar: level !== 'A1',
          vocabulary: level !== 'A1',
          coherence: level === 'B1' || level === 'B2' || level.startsWith('C'),
        },
      }
    case 'writing':
      return {
        prompt: `${topic}. Write a clear response with an opening, 2–3 supporting ideas, and a short closing. Use examples from daily life.`,
        minWords: level === 'A1' ? 40 : level === 'A2' ? 60 : level === 'B1' ? 90 : 120,
        maxWords: level === 'A1' ? 100 : level === 'A2' ? 140 : level === 'B1' ? 200 : 280,
        taskType: level.startsWith('A') ? 'short' : 'essay',
        sampleAnswer: undefined,
      }
    case 'reading':
      return {
        passage: readingPassage(level, topic),
        question: questions[0]!.question,
        options: questions[0]!.options,
        correctIndex: 0,
        explanation: questions[0]!.explanation,
        questions,
      }
    case 'grammar':
      return {
        prompt: `Choose the correct option for: ${topic}.`,
        options: questions[0]!.options,
        correctIndex: 0,
        explanation: 'Review the target structure for this level.',
        questions,
      }
    case 'vocabulary':
      return {
        word: level === 'A1' ? 'happy' : level === 'A2' ? 'journey' : level === 'B1' ? 'improve' : 'outcome',
        definition: undefined,
        question: questions[0]!.question,
        options: questions[0]!.options,
        correctIndex: 0,
        explanation: questions[0]!.explanation,
        questions,
      }
    case 'pronunciation':
      return {
        text:
          level === 'A1'
            ? 'This is a thin thing.'
            : level === 'A2'
              ? 'I thought it was better.'
              : level === 'B1'
                ? 'I wanted to ask about yesterday’s meeting.'
                : 'Photography is interesting when light is perfect.',
        tips: 'Listen to the model, record yourself, then compare side by side.',
        focus:
          level === 'A1'
            ? 'TH sound'
            : level === 'A2'
              ? 'TH sound'
              : level === 'B1'
                ? 'Past -ed endings'
                : 'Word stress',
      }
    case 'multiple_choice':
      return {
        question: questions[0]!.question,
        options: questions[0]!.options,
        correctIndex: 0,
        explanation: questions[0]!.explanation,
        questions,
      }
    case 'fill_blank': {
      const cloze = buildCambridgeFillBlank(level)
      return {
        items: cloze.items,
        text: cloze.items[0]?.sentence,
        blanks: cloze.items.map((it) => ({
          id: it.id,
          answer: it.answer,
          alternatives: it.alternatives,
        })),
        explanation: cloze.explanation,
      }
    }
    case 'word_order':
      return {
        prompt: 'Put the words in the correct order.',
        words: level === 'A1' ? ['I', 'am', 'a', 'teacher'] : ['I', 'have', 'already', 'finished'],
        correctOrder: level === 'A1' ? ['I', 'am', 'a', 'teacher'] : ['I', 'have', 'already', 'finished'],
        explanation: 'Follow standard English word order.',
      }
    case 'matching':
      return {
        prompt: topic,
        pairs: [
          { left: 'hello', right: 'olá' },
          { left: 'goodbye', right: 'tchau' },
          { left: 'thanks', right: 'obrigado' },
          { left: 'please', right: 'por favor' },
          { left: 'sorry', right: 'desculpa' },
        ],
        explanation: 'Match each English item to its pair.',
      }
    case 'true_false':
      return {
        statement: level === 'A1' ? 'Water is wet.' : 'All opinions are measurable facts.',
        correct: level === 'A1',
        explanation: level === 'A1' ? 'This is a true everyday fact.' : 'Opinions are not always facts.',
      }
    default:
      return {}
  }
}

/** Reliable, embeddable YouTube URLs (youtube-nocookie + known public IDs). */
const MEDIA_EMBEDS = {
  // Popular song with stable embed (not a live stream)
  music: 'https://www.youtube-nocookie.com/embed/e-ORhEE9VVg',
  // YouTube IFrame API sample video — always embeddable
  video: 'https://www.youtube-nocookie.com/embed/M7lc1UVf-VE',
  game: 'https://www.youtube-nocookie.com/embed/M7lc1UVf-VE',
} as const

function mediaSeed(
  id: string,
  type: 'music' | 'video' | 'game',
  title: string,
  level: ActivityLevel,
  thumb: string,
): Activity {
  const questions = buildQuizQuestions(title, level, 10)
  return {
    id,
    title,
    description: `${type} practice with YouTube embed and a 10-question quiz.`,
    type,
    level,
    difficulty: difficultyFor(level) === 'easy' ? 'basic' : difficultyFor(level) === 'hard' ? 'advanced' : 'intermediate',
    duration: type === 'game' ? 12 : 15,
    thumbnail: thumb,
    instructions: `Watch or play, then answer all ${questions.length} questions.`,
    content: {
      embedUrl: MEDIA_EMBEDS[type],
      questions,
      prompt: questions[0]!.question,
      options: questions[0]!.options,
      correctIndex: 0,
    },
    points: 15,
    isPublished: true,
    isSystem: true,
    skills: [type],
    practicePoints: [`${type} comprehension`, 'Vocabulary in context'],
    categoryTags: ['system', type, 'trending'],
  }
}

/** ~120 system activities: 6 skills × 4 levels × 5 items (+ extra types sampled). */
export function buildSystemSeedActivities(): Activity[] {
  const list: Activity[] = []
  let n = 0

  for (const type of SKILLS) {
    for (const level of LEVELS) {
      for (let i = 0; i < 5; i++) {
        n += 1
        const title = titles[type][level][i]
        const difficulty = difficultyFor(level)
        list.push({
          id: `sys-${type}-${level.toLowerCase()}-${i + 1}`,
          title,
          description: `CEFR ${level} ${type} practice: ${title}.`,
          type,
          level,
          difficulty: difficulty === 'easy' ? 'basic' : difficulty === 'hard' ? 'advanced' : 'intermediate',
          duration: type === 'writing' || type === 'speaking' ? 15 : 10,
          thumbnail: pickThumbnail(type, n),
          instructions: `Complete this ${type} activity carefully.`,
          content: buildContent(type, level, i),
          points: difficulty === 'easy' ? 10 : difficulty === 'medium' ? 15 : 20,
          isPublished: true,
          isSystem: true,
          skills: [type],
          practicePoints: [`Practice ${type} at ${level}`],
          categoryTags: ['system', type, level],
        })
      }
    }
  }

  // Additional interactive types (A1–B2 × 2 each) for fill/matching/etc.
  const extras: EngineActivityType[] = [
    'multiple_choice',
    'fill_blank',
    'word_order',
    'matching',
    'true_false',
    'pronunciation',
  ]
  for (const type of extras) {
    for (const level of LEVELS) {
      for (let i = 0; i < 2; i++) {
        n += 1
        const title = titles[type][level][i]
        const difficulty = difficultyFor(level)
        list.push({
          id: `sys-${type}-${level.toLowerCase()}-${i + 1}`,
          title,
          description: `CEFR ${level} ${type.replace('_', ' ')} drill.`,
          type,
          level,
          difficulty: difficulty === 'easy' ? 'basic' : difficulty === 'hard' ? 'advanced' : 'intermediate',
          duration: 8,
          thumbnail: pickThumbnail(type, n),
          instructions: `Complete the ${type.replace('_', ' ')} task.`,
          content: buildContent(type, level, i),
          points: 10,
          isPublished: true,
          isSystem: true,
          skills: [type],
          categoryTags: ['system', type, level],
        })
      }
    }
  }

  list.push(
    {
      id: 'sys-pron-thought-better',
      title: 'I Thought It Was Better',
      description: 'Pronunciation Lab: listen, record, and compare the TH sound.',
      type: 'pronunciation',
      level: 'A2',
      difficulty: 'basic',
      duration: 5,
      thumbnail: pickThumbnail('pronunciation', 0),
      instructions: 'Listen to the native model, record yourself, then compare.',
      content: {
        text: 'I thought it was better.',
        tips: 'Put your tongue between your teeth for “thought” and “the” sounds.',
        focus: 'TH sound',
      },
      points: 15,
      isPublished: true,
      isSystem: true,
      skills: ['pronunciation'],
      practicePoints: ['TH sound', 'Clear consonants'],
      categoryTags: ['system', 'pronunciation', 'trending'],
    },
    {
      id: 'sys-pron-word-stress',
      title: 'Word Stress: Photography',
      description: 'Pronunciation Lab: practice stress on the right syllable.',
      type: 'pronunciation',
      level: 'B1',
      difficulty: 'intermediate',
      duration: 5,
      thumbnail: pickThumbnail('pronunciation', 1),
      instructions: 'Listen, record, and compare word stress.',
      content: {
        text: 'Photography is interesting.',
        tips: 'Stress falls on -TOG- in pho-TOG-ra-phy.',
        focus: 'Word stress',
      },
      points: 15,
      isPublished: true,
      isSystem: true,
      skills: ['pronunciation'],
      practicePoints: ['Word stress', 'Multisyllable words'],
      categoryTags: ['system', 'pronunciation'],
    },
    {
      id: 'sys-pron-past-ed',
      title: 'Past -ed Endings',
      description: 'Pronunciation Lab: clear -ed endings in past verbs.',
      type: 'pronunciation',
      level: 'A2',
      difficulty: 'basic',
      duration: 5,
      thumbnail: pickThumbnail('pronunciation', 2),
      instructions: 'Listen, record, and compare the -ed endings.',
      content: {
        text: 'I wanted to ask about yesterday’s meeting.',
        tips: '“Wanted” has an extra syllable: want-ed. Keep the ending clear.',
        focus: 'Past -ed endings',
      },
      points: 15,
      isPublished: true,
      isSystem: true,
      skills: ['pronunciation'],
      practicePoints: ['-ed endings', 'Past tense clarity'],
      categoryTags: ['system', 'pronunciation'],
    },
    mediaSeed('sys-music-feel-lyrics', 'music', 'Feel the Lyrics', 'B1', pickThumbnail('music', 0)),
    mediaSeed('sys-music-chorus-fill', 'music', 'Chorus Fill-In', 'A2', pickThumbnail('music', 1)),
    mediaSeed('sys-video-workday-vlog', 'video', 'Workday Vlog', 'B1', pickThumbnail('video', 0)),
    mediaSeed('sys-video-interview-clip', 'video', 'Interview Clip', 'B2', pickThumbnail('video', 1)),
    {
      id: 'sys-video-ordering-coffee',
      title: 'Ordering Coffee in New York',
      description:
        'Watch a café order, tap words in the transcript, then complete the sentence.',
      type: 'video',
      level: 'A2',
      difficulty: 'basic',
      duration: 8,
      thumbnail: pickThumbnail('video', 2),
      instructions: 'Watch → explore the transcript → complete the gap → listen again.',
      content: {
        mode: 'interactive',
        embedUrl: 'https://www.youtube-nocookie.com/embed/M7lc1UVf-VE',
        transcript: [
          { start: 0, end: 3, text: "I'd like a large coffee, please." },
          { start: 3, end: 6, text: 'Sure. Anything else today?' },
          { start: 6, end: 9, text: 'No, just the coffee. Thank you.' },
        ],
        glossary: {
          "I'd": {
            meaning: 'I would — polite way to ask for something.',
            pronunciation: '/aɪd/',
            kind: 'explain',
          },
          large: {
            meaning: 'Big size (bigger than medium or small).',
            pronunciation: '/lɑːrdʒ/',
            kind: 'meaning',
          },
          coffee: {
            meaning: 'A hot drink made from coffee beans.',
            pronunciation: '/ˈkɒfi/',
            kind: 'sound',
          },
          please: {
            meaning: 'A polite word used when asking for something.',
            pronunciation: '/pliːz/',
            kind: 'meaning',
          },
        },
        gap: {
          sentence: "I'd like a ______ coffee, please.",
          options: ['large', 'small', 'hot'],
          correctIndex: 0,
          explanation: 'In the video, the customer asks for a large coffee.',
        },
      },
      points: 15,
      isPublished: true,
      isSystem: true,
      skills: ['video', 'listening', 'vocabulary'],
      practicePoints: ['Café English', 'Polite requests', 'Size vocabulary'],
      categoryTags: ['system', 'video', 'trending', 'listening'],
    },
    {
      id: 'sys-video-at-the-airport-desk',
      title: 'At the Airport Desk',
      description: 'Interactive video: check-in phrases with tap-to-learn transcript.',
      type: 'video',
      level: 'B1',
      difficulty: 'intermediate',
      duration: 10,
      thumbnail: pickThumbnail('video', 3),
      instructions: 'Watch → explore words → complete the gap → listen again.',
      content: {
        mode: 'interactive',
        embedUrl: 'https://www.youtube-nocookie.com/embed/M7lc1UVf-VE',
        transcript: [
          { start: 0, end: 4, text: 'Good morning. I have a reservation.' },
          { start: 4, end: 8, text: 'May I see your passport, please?' },
          { start: 8, end: 12, text: 'Of course. Here you are.' },
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
    mediaSeed('sys-game-quick-quiz', 'game', 'Quick Quiz Arena', 'A2', pickThumbnail('game', 0)),
    mediaSeed('sys-game-grammar-duel', 'game', 'Grammar Duel', 'B1', pickThumbnail('game', 1)),
    mediaSeed('sys-game-vocab-battle', 'game', 'Vocabulary Battle', 'B1', pickThumbnail('game', 2)),
  )

  return list
}

export const systemSeedActivities = buildSystemSeedActivities()
