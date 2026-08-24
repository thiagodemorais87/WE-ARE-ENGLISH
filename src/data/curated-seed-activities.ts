import type { Activity, ActivityLevel, ActivityType, QuizQuestionItem } from '@/types/activity'
import { pickThumbnail } from './thumbnails.ts'

type Diff = 'advanced' | 'intermediate' | 'basic'

function q(
  question: string,
  options: string[],
  correctIndex: number,
  explanation?: string,
): QuizQuestionItem {
  if (options.length < 6) {
    throw new Error(`q() requires ≥6 options (got ${options.length}): ${question.slice(0, 60)}`)
  }
  return { question, options, correctIndex, explanation }
}

/** Maps CEFR + exercise volume → difficulty, duration, and points. */
function metaFromExercises(
  level: ActivityLevel,
  type: ActivityType,
  exerciseCount: number,
): { diff: Diff; duration: number; points: number } {
  const diff: Diff =
    level === 'A1' || level === 'A2' ? 'basic' : level === 'B1' ? 'intermediate' : 'advanced'
  const n = Math.max(1, exerciseCount)

  let duration: number
  if (type === 'listening' || type === 'reading') {
    duration = Math.round(n * 1.1 + 2)
  } else if (type === 'grammar' || type === 'vocabulary' || type === 'fill_blank') {
    duration = Math.round(n * 0.8 + 1)
  } else if (type === 'writing') {
    duration = diff === 'basic' ? 12 : diff === 'intermediate' ? 16 : 20
  } else if (type === 'speaking' || type === 'pronunciation') {
    duration = Math.min(15, Math.max(8, Math.round(7 + n)))
  } else {
    duration = Math.round(n * 0.8 + 1)
  }
  duration = Math.min(25, duration)

  const points =
    diff === 'basic'
      ? Math.min(25, 10 + Math.floor(n * 1.5))
      : diff === 'intermediate'
        ? Math.min(35, 15 + Math.floor(n * 1.5))
        : Math.min(45, 20 + Math.floor(n * 1.5))

  return { diff, duration, points }
}

function base(
  partial: Omit<Activity, 'isPublished' | 'isSystem' | 'difficulty'> & { diff: Diff },
): Activity {
  const { diff, ...rest } = partial
  return {
    ...rest,
    difficulty: diff,
    isPublished: true,
    isSystem: true,
  }
}

function blank(
  id: string,
  sentence: string,
  answer: string,
  alternatives: string[],
): { id: string; sentence: string; answer: string; alternatives: string[] } {
  if (alternatives.length < 5) {
    throw new Error(`blank() needs ≥5 wrong alternatives (got ${alternatives.length}): ${id}`)
  }
  return { id, sentence, answer, alternatives }
}

/** 5 curated activities per core skill (no listening), ordered advanced → basic. */
export function buildCuratedCoreActivities(): Activity[] {
  const list: Activity[] = []

  // —— Grammar (5) ——
  {
    const questions = [
      q(
        'Backstage, the director whispers: “_____ had the curtain risen when the smoke alarm screamed.”',
        ['Hardly', 'Hard', 'Hardly never', 'Almost soft', 'Barely not', 'Seldom soft'],
        0,
        'Hardly had + subject + past participle = “almost immediately after”.',
      ),
      q(
        'An understudy sighs: “_____ I known the mic was dead, I would have projected more.”',
        ['Had', 'Have', 'Did', 'Would', 'Were having', 'Should'],
        0,
        'Had + subject + past participle is inverted third conditional.',
      ),
      q(
        'Critique note: “Not only _____ she forget the cue, she also waved at the wrong balcony.”',
        ['did', 'does', 'do', 'doing', 'has', 'was'],
        0,
        'After “not only” in mid-sentence emphasis, invert with did + base verb.',
      ),
      q(
        'Program insert: “Rarely _____ such a still, listening house.”',
        ['have we seen', 'we have seen', 'we saw have', 'seen we have', 'we seeing have', 'have seen we'],
        0,
        'Negative adverbial (rarely) triggers inversion: auxiliary + subject + past participle.',
      ),
      q(
        'Choose the cleft that spotlights the costume: “_____ the ripped cape that stole the scene.”',
        ['It was', 'It were', 'There was', 'It be', 'That were', 'It being'],
        0,
        'It-cleft: It was + noun phrase + that/who…',
      ),
      q(
        'Stage manager: “Were it not _____ your quick tip, I’d still be hunting the prop sword.”',
        ['for', 'to', 'of', 'by', 'with', 'on'],
        0,
        'Fixed formal pattern: were it not for + noun.',
      ),
      q(
        'Which line uses correct inversion for emphasis?',
        [
          'Never have I been so nervous on opening night',
          'Never I have been so nervous on opening night',
          'I never have been so nervous never on opening night',
          'Have never I been so nervous on opening night',
          'Never been I have so nervous on opening night',
          'I have never been so nervous never opening',
        ],
        0,
        'Never + auxiliary + subject + past participle.',
      ),
      q(
        'Reviewer: “So rare _____ this cast chemistry that tickets vanished overnight.”',
        ['was', 'were', 'be', 'been', 'been', 'being'],
        0,
        'So + adjective + was/were + subject (inversion after so + adj).',
      ),
      q(
        'Prompt card: “Only after the blackout _____ the audience gasp as one.”',
        ['did', 'does', 'do', 'had do', 'was do', 'have'],
        0,
        'Only after… triggers inversion with did + base verb in past narrative.',
      ),
      q(
        'Which is a correct “little” inversion?',
        [
          'Little did they realise the understudy was the star',
          'Little they did realise the understudy was the star',
          'Little realise they did the understudy was the star',
          'They little did realise understudy the star',
          'Did little they realise the understudy star',
          'Little they realise did the understudy was star',
        ],
        0,
        'Little did + subject + bare infinitive.',
      ),
      q(
        'Actor improvises: “_____ should the fire curtain drop, exit calmly stage left.”',
        ['Should', 'Would', 'Might will', 'Can if', 'Must that', 'Shall not'],
        0,
        'Should + subject = formal conditional (“if the curtain drops”).',
      ),
      q(
        'Choose the best emphatic rewrite of “I realised the mistake only then.”',
        [
          'Only then did I realise the mistake',
          'Only then I did realise the mistake',
          'Only then realised I did the mistake',
          'Then only I realise did the mistake',
          'Did only then I realise the mistake',
          'Only I then did realise mistake the',
        ],
        0,
        'Only then + did + subject + base verb.',
      ),
      q(
        'Which sentence correctly uses “no sooner…than”?',
        [
          'No sooner had she entered than the spotlight found her',
          'No sooner she had entered than the spotlight found her',
          'No sooner had she entered when the spotlight found her',
          'No sooner she entered that the spotlight found her',
          'No sooner entered she had than spotlight found',
          'No sooner than she had entered the spotlight found',
        ],
        0,
        'No sooner + had + subject + past participle + than…',
      ),
    ]
    const meta = metaFromExercises('C1', 'grammar', questions.length)
    list.push(
      base({
        id: 'sys-grammar-inversion-drama',
        title: 'Drama Club: Inversion',
        description: 'Fix theatrical lines using inversion and emphasis.',
        type: 'grammar',
        level: 'C1',
        ...meta,
        thumbnail: pickThumbnail('grammar', 0),
        instructions: 'Choose the most natural advanced form for each stage cue.',
        skills: ['grammar'],
        categoryTags: ['system', 'grammar'],
        content: { prompt: 'Advanced inversion in a drama-club crisis', questions },
      }),
    )
  }

  {
    const questions = [
      q(
        'Slack ping: “If the client _____ late again, we’ll reschedule the demo.”',
        ['is', 'will be', 'would be', 'were being', 'be', 'has been being'],
        0,
        'First conditional: if + present, will + verb.',
      ),
      q(
        'Mentor chat: “If I _____ you, I’d send the deck tonight—not tomorrow.”',
        ['were', 'am', 'be', 'was being', 'will be', 'been'],
        0,
        'Second conditional advice often uses were for all persons.',
      ),
      q(
        'Post-mortem: “If we _____ the brief earlier, we wouldn’t be rushing now.”',
        ['had started', 'start', 'would start', 'starts', 'have start', 'starting'],
        0,
        'Third / mixed feel: if + past perfect for a past missed action.',
      ),
      q(
        'Legal note: “Unless she _____, we can’t publish the case study.”',
        ['approves', 'approve', 'will approve', 'approving', 'approved will', 'to approve'],
        0,
        'Unless = if not; use present simple after unless here.',
      ),
      q(
        'IT desk: “I wish the printer _____ working before the board call.”',
        ['were', 'is', 'be', 'will', 'being', 'was be'],
        0,
        'Wish + past (were) for a present unreal situation.',
      ),
      q(
        'Zero conditional fact on the fridge: “If ice _____, it melts.”',
        ['heats', 'will heat', 'heated', 'heating', 'heat will', 'is heat'],
        0,
        'Facts: if + present, present.',
      ),
      q(
        'Formal calendar note: “_____ it rain, the rooftop picnic moves indoors.”',
        ['Should', 'Would', 'Might', 'Can', 'Will', 'Does'],
        0,
        'Should + subject = formal if.',
      ),
      q(
        'Mixed conditional: “If I had saved more last year, I _____ less stressed now.”',
        ['would be', 'will be', 'am', 'was', 'have been', 'would have being'],
        0,
        'Past condition → present result: would + base verb.',
      ),
      q(
        'Product owner: “We’ll ship Friday _____ QA finds a blocker.”',
        ['unless', 'if not unless', 'despite', 'although when', 'because if', 'while unless'],
        0,
        'Unless introduces the exception that stops the plan.',
      ),
      q(
        'Which is a correct second conditional?',
        [
          'If the vendor lowered the price, we would renew',
          'If the vendor lowers the price, we would renew yesterday',
          'If the vendor would lower the price, we renew',
          'If the vendor lower the price, we will would renew',
          'If vendor lowered, we renew will',
          'If the vendor will lower, we would renewing',
        ],
        0,
        'If + past, would + base verb.',
      ),
      q(
        'As soon as the NDA _____, please upload the files.',
        ['is signed', 'will be signed', 'would sign', 'signing', 'signed will', 'be signing'],
        0,
        'Time clause after as soon as uses present (passive) for future meaning.',
      ),
      q(
        '“If only we _____ the timezone before inviting Tokyo.”',
        ['had checked', 'check', 'will check', 'are checking', 'checks', 'checking had'],
        0,
        'If only + past perfect regrets a past action.',
      ),
    ]
    const meta = metaFromExercises('B2', 'grammar', questions.length)
    list.push(
      base({
        id: 'sys-grammar-conditionals-office',
        title: 'Office Chat: Conditionals',
        description: 'Pick the right conditional in workplace chats.',
        type: 'grammar',
        level: 'B2',
        ...meta,
        thumbnail: pickThumbnail('grammar', 1),
        instructions: 'Read each chat bubble and choose the best conditional form.',
        skills: ['grammar'],
        categoryTags: ['system', 'grammar'],
        content: { prompt: 'Conditionals at work', questions },
      }),
    )
  }

  {
    const questions = [
      q(
        'Crime scene card: “Someone _____ the window—glass is still on the carpet.”',
        ['has broken', 'broke yesterday only forever', 'breaking', 'break', 'is break', 'had break'],
        0,
        'Present perfect for a past action with a present result.',
      ),
      q(
        'Notebook: “I _____ three witnesses today (and I may talk to more).”',
        ['have interviewed', 'interview', 'am interview', 'interviewing always', 'interviewed have', 'was interview'],
        0,
        'Unfinished time period (today) → present perfect.',
      ),
      q(
        'Finished time stamp: “She _____ the evidence locker last night at 11.”',
        ['closed', 'has closed', 'have closed', 'closing', 'close', 'was close'],
        0,
        'Past simple with a finished past time (last night).',
      ),
      q(
        'Interrogation: “_____ you ever _____ a forged badge before?”',
        ['Have / seen', 'Did / see ever always', 'Are / seeing', 'Do / saw', 'Has / see', 'Have / saw'],
        0,
        'Have you ever + past participle.',
      ),
      q(
        'Radio: “The suspect hasn’t arrived _____.”',
        ['yet', 'already yesterday', 'never last year', 'ago', 'since night only', 'for yesterday'],
        0,
        'Yet is common in negative present-perfect waiting contexts.',
      ),
      q(
        'Stakeout log: “They _____ in this café since Monday.”',
        ['have been', 'are being', 'was', 'be', 'were being always', 'been'],
        0,
        'Have been + since + starting point.',
      ),
      q(
        'Which pair is grammatically wrong?',
        [
          'I have saw him near the alley',
          'I have seen him near the alley',
          'She has gone to HQ',
          'We have finished the report',
          'He has just left',
          'They have never confessed',
        ],
        0,
        '“Have saw” is incorrect; use seen.',
      ),
      q(
        '“Just” in detective English often pairs with…',
        ['present perfect', 'future only', 'imperative only', 'gerund only', 'past continuous forever', 'modal of'],
        0,
        'Have just + past participle = very recent past.',
      ),
      q(
        '“This is the first time I _____ this handwriting.”',
        ['have analysed', 'analyse', 'am analyse', 'analysing', 'was analyse', 'analyse have'],
        0,
        'This is the first time + present perfect.',
      ),
      q(
        'Choose the best contrast: result now vs finished story.',
        [
          'Someone has taken the key / Someone took the key at 9pm',
          'Someone takes the key / Someone taking the key at 9pm',
          'Someone taken has the key / Someone take the key at 9pm',
          'Someone is take the key / Someone have took at 9pm',
          'Someone took has the key / Someone has took at 9pm',
          'Someone taking key / Someone tooked the key at 9pm',
        ],
        0,
        'Present perfect = present relevance; past simple = finished time.',
      ),
      q(
        'Lab note: “We _____ the DNA results yet—still processing.”',
        ["haven't received", "didn't received", "don't receive yet always", "aren't receive", "hasn't receiving", "not have receive"],
        0,
        'Haven’t + past participle + yet.',
      ),
    ]
    const meta = metaFromExercises('B1', 'grammar', questions.length)
    list.push(
      base({
        id: 'sys-grammar-perfect-detective',
        title: 'Detective Notes: Present Perfect',
        description: 'Solve clue cards with present perfect vs past simple.',
        type: 'grammar',
        level: 'B1',
        ...meta,
        thumbnail: pickThumbnail('grammar', 2),
        instructions: 'Choose the form that fits each timeline clue.',
        skills: ['grammar'],
        categoryTags: ['system', 'grammar', 'trending'],
        content: { prompt: 'Present perfect detective', questions },
      }),
    )
  }

  {
    const questions = [
      q(
        'Picnic opener: “Yesterday we _____ to the sunny park by the lake.”',
        ['went', 'go', 'goed', 'going', 'goes', 'gone'],
        0,
        'Go → went in past simple.',
      ),
      q(
        'Maya _____ peanut-butter sandwiches for everyone.',
        ['made', 'maked', 'make', 'making', 'makes', 'maded'],
        0,
        'Make → made (irregular).',
      ),
      q(
        'Disaster line: “The dog _____ the whole chocolate cake!”',
        ['ate', 'eated', 'eat', 'eats', 'eating', 'aten'],
        0,
        'Eat → ate in past simple.',
      ),
      q(
        'We _____ so loud that a duck stared at us.',
        ['laughed', 'laugh', 'laughs', 'laughing', 'laughs did', 'laught'],
        0,
        'Regular verb: laugh → laughed.',
      ),
      q(
        'Weather note: “It _____ sunny all afternoon.”',
        ['was', 'were', 'is', 'be', 'been', 'been'],
        0,
        'It + was for past description.',
      ),
      q(
        'Negative: “We _____ stay late because of the ants.”',
        ["didn't", "doesn't", "don't", "isn't", "wasn't", "aren't"],
        0,
        'Past negative: didn’t + base verb.',
      ),
      q(
        'Question: “_____ you see the ant parade near the blanket?”',
        ['Did', 'Do', 'Does', 'Are', 'Was', 'Have'],
        0,
        'Past yes/no question: Did + subject + base verb.',
      ),
      q(
        'Leo _____ his lemonade when a bee arrived.',
        ['spilled', 'spill', 'spills', 'spilling', 'spilleds', 'spilted always'],
        0,
        'Spill → spilled (regular) in this story.',
      ),
      q(
        'Choose the correct past sentence.',
        [
          'They played football after lunch',
          'They play football after lunch yesterday',
          'They playing football after lunch',
          'They plays football after lunch',
          'They did played football after lunch',
          'They was play football after lunch',
        ],
        0,
        'Subject + past verb (played).',
      ),
    ]
    const meta = metaFromExercises('A2', 'grammar', questions.length)
    list.push(
      base({
        id: 'sys-grammar-past-picnic',
        title: 'Picnic Story: Past Simple',
        description: 'Complete a funny picnic story with past forms.',
        type: 'grammar',
        level: 'A2',
        ...meta,
        thumbnail: pickThumbnail('grammar', 3),
        instructions: 'Choose the correct past simple verb for each picnic beat.',
        skills: ['grammar'],
        categoryTags: ['system', 'grammar'],
        content: { prompt: 'Past simple picnic', questions },
      }),
    )
  }

  {
    const questions = [
      q('Comic panel: “I _____ Caped Banana.”', ['am', 'is', 'are', 'be', 'was are', 'being'], 0, 'I + am.'),
      q('She _____ very fast on her skateboard.', ['is', 'am', 'are', 'be', 'are is', 'been'], 0, 'She/he/it + is.'),
      q('They _____ best friends and crime-fighters.', ['are', 'is', 'am', 'be', 'is are', 'being'], 0, 'They + are.'),
      q('He _____ not lazy—he trains at dawn.', ['is', 'am', 'are', 'be', 'are not am', 'being'], 0, 'He + is (not).'),
      q('_____ you ready for the night patrol?', ['Are', 'Is', 'Am', 'Be', 'Does', 'Was'], 0, 'Questions with you → Are.'),
      q('We _____ in the quiet city tonight.', ['are', 'is', 'am', 'be', 'is we', 'being'], 0, 'We + are.'),
      q('It _____ a calm night over the rooftops.', ['is', 'are', 'am', 'be', 'are it', 'were am'], 0, 'It + is.'),
      q('My name _____ Spark Kid.', ['is', 'am', 'are', 'be', 'are name', 'being'], 0, 'Name / it / he/she → is.'),
      q('Choose the correct line.', ['You are brave', 'You is brave', 'You am brave', 'You be brave always', 'You are is brave', 'You being brave are'], 0, 'You + are.'),
    ]
    const meta = metaFromExercises('A1', 'grammar', questions.length)
    list.push(
      base({
        id: 'sys-grammar-be-superheroes',
        title: 'Superheroes: Verb To Be',
        description: 'Introduce silly heroes with am/is/are.',
        type: 'grammar',
        level: 'A1',
        ...meta,
        thumbnail: pickThumbnail('grammar', 4),
        instructions: 'Pick am, is, or are for each hero line.',
        skills: ['grammar'],
        categoryTags: ['system', 'grammar'],
        content: { prompt: 'Verb to be', questions },
      }),
    )
  }

  // —— Pronunciation (5) ——
  const pronSets: {
    id: string
    title: string
    level: ActivityLevel
    focus: string
    tips: string
    items: { text: string; tips?: string }[]
    i: number
  }[] = [
    {
      id: 'sys-pron-photography-stress',
      title: 'Word Stress: Photography',
      level: 'B2',
      focus: 'Word stress',
      tips: 'Stress pho-TOG-ra-phy (second syllable). Keep related forms rhythmic.',
      i: 0,
      items: [
        { text: 'Photography is interesting when the light is perfect.' },
        { text: 'A photographer adjusts the photograph carefully.' },
        { text: 'Photographic memory helps in detailed editing.' },
        { text: 'She studied photography at a respected academy.' },
        { text: 'Interesting compositions need deliberate framing.' },
        { text: 'The exhibition highlighted contemporary photography.' },
        { text: 'Please emphasise the second syllable in photography.' },
      ],
    },
    {
      id: 'sys-pron-thought-better',
      title: 'I Thought It Was Better',
      level: 'B1',
      focus: 'TH sound',
      tips: 'Tongue between teeth for “thought/through/those”—not a hard T.',
      i: 1,
      items: [
        { text: 'I thought it was better.' },
        { text: 'I thought through the problem carefully.' },
        { text: 'Those things are thicker than they look.' },
        { text: 'I thought Thursday would be quieter.' },
        { text: 'Thank you for thinking of both of us.' },
        { text: 'I thought the weather would be better than this.' },
      ],
    },
    {
      id: 'sys-pron-wanted-meeting',
      title: 'Past -ed: Wanted',
      level: 'A2',
      focus: 'Past -ed endings',
      tips: '“Wanted” adds a syllable: want-id. Don’t swallow -ed after /t/ or /d/.',
      i: 2,
      items: [
        { text: 'I wanted to ask about yesterday’s meeting.' },
        { text: 'She needed a quiet room for the call.' },
        { text: 'We decided to start at nine.' },
        { text: 'They waited outside the office.' },
        { text: 'He ended the meeting with a clear summary.' },
        { text: 'I wanted clearer notes from the discussion.' },
      ],
    },
    {
      id: 'sys-pron-schwa-banana',
      title: 'Schwa in Banana',
      level: 'A2',
      focus: 'Schwa sound',
      tips: 'Unstressed vowels often sound like /ə/: ba-NA-na, a, of, to.',
      i: 3,
      items: [
        { text: 'I need a banana and some butter.' },
        { text: 'Can you pass the banana bread, please?' },
        { text: 'A cup of coffee and a banana sound perfect.' },
        { text: 'The banana was softer than the apple.' },
        { text: 'We bought bananas for the picnic.' },
        { text: 'Another banana? Sure—take one from the bowl.' },
      ],
    },
    {
      id: 'sys-pron-thin-thing',
      title: 'TH Warm-up',
      level: 'A1',
      focus: 'TH sound',
      tips: 'Voice on for “this/that”; gentle airflow for “thin/thing/three”.',
      i: 4,
      items: [
        { text: 'This thin thing is for you.' },
        { text: 'Three thin things on the table.' },
        { text: 'I think this is the right thing.' },
        { text: 'Thank you for this thoughtful gift.' },
        { text: 'That thick book is next to the thin one.' },
      ],
    },
  ]
  for (const p of pronSets) {
    const meta = metaFromExercises(p.level, 'pronunciation', p.items.length)
    list.push(
      base({
        id: p.id,
        title: p.title,
        description: `Pronunciation Lab: ${p.focus}.`,
        type: 'pronunciation',
        level: p.level,
        ...meta,
        thumbnail: pickThumbnail('pronunciation', p.i),
        instructions: 'Listen → record → compare each phrase.',
        skills: ['pronunciation'],
        practicePoints: [p.focus],
        categoryTags: ['system', 'pronunciation'],
        content: {
          text: p.items[0]!.text,
          tips: p.tips,
          focus: p.focus,
          items: p.items,
        },
      }),
    )
  }

  // —— Vocabulary (5) advanced → basic ——
  {
    const questions = [
      q(
        'Polite pushback in a review: “I _____ with that approach, though I see the intent.”',
        ['respectfully disagree', 'hate forever', 'scream about', 'delete entirely', 'explode at', 'cancel loudly'],
        0,
        'Respectfully disagree softens conflict in professional English.',
      ),
      q(
        'Softer than “furious” for a mild annoyance:',
        ['irritated', 'enraged', 'livid', 'incandescent', 'seething violently', 'apoplectic'],
        0,
        'Irritated sits lower on the anger scale.',
      ),
      q(
        'Project update: “Let’s _____ the timeline before we promise the client.”',
        ['revisit', 'destroy', 'ignore', 'explode', 'abandon forever', 'erase casually'],
        0,
        'Revisit = look at again with care.',
      ),
      q(
        'Most formal thank-you line:',
        [
          'I appreciate your help on this',
          'Thx lol',
          'Whatever works',
          'K thanks',
          'Nice I guess',
          'You did a thing',
        ],
        0,
        'Appreciate is a polished workplace verb.',
      ),
      q(
        '“Mitigate risk” means roughly…',
        ['reduce', 'increase', 'celebrate', 'invent', 'ignore forever', 'advertise'],
        0,
        'Mitigate = make less severe.',
      ),
      q(
        'Opposite of “vague” in feedback:',
        ['precise', 'fuzzy', 'messy', 'random', 'cloudy', 'hazy'],
        0,
        'Precise = clear and exact.',
      ),
      q(
        '“Albeit late, the draft was strong.” Albeit ≈',
        ['although', 'because', 'never', 'yesterday', 'therefore', 'unless'],
        0,
        'Albeit = although / even though.',
      ),
      q(
        'Collocation: “raise a _____ in the meeting.”',
        ['concern', 'elephant', 'pizza', 'cloud', 'sock', 'melody'],
        0,
        'Raise a concern is a set business phrase.',
      ),
      q(
        'Which softens bad news best?',
        [
          'I’m afraid we need to postpone',
          'This is a disaster and you’re wrong',
          'Whatever, figure it out',
          'Lol no',
          'Stop talking',
          'This is hopeless forever',
        ],
        0,
        'I’m afraid… cushions disappointment.',
      ),
      q(
        '“Tentative” agreement means it is…',
        ['provisional / not final', 'illegal', 'already cancelled', 'printed in stone', 'about food only', 'musical'],
        0,
        'Tentative = not firmly decided.',
      ),
      q(
        'Choose the sharpest (most intense) word:',
        ['livid', 'annoyed', 'bothered', 'put out', 'mildly cross', 'a bit tired'],
        0,
        'Livid is near the top of the anger scale.',
      ),
      q(
        '“I’d rather we _____ expectations before Friday.”',
        ['align', 'explode', 'delete humans', 'ignore calendars', 'burn decks', 'whisper chaos'],
        0,
        'Align expectations = make sure everyone shares the same plan.',
      ),
      q(
        'Nuance pick: which is more diplomatic than “That’s wrong”?',
        [
          'I see it differently—could we compare assumptions?',
          'That’s wrong and silly',
          'You’re clueless',
          'Nope forever',
          'Delete your brain',
          'This is trash',
        ],
        0,
        'Reframe + invite comparison keeps tone constructive.',
      ),
    ]
    const meta = metaFromExercises('C1', 'vocabulary', questions.length)
    list.push(
      base({
        id: 'sys-vocab-nuance-tone',
        title: 'Nuance: Soft vs Sharp',
        description: 'Choose the word with the right emotional tone.',
        type: 'vocabulary',
        level: 'C1',
        ...meta,
        thumbnail: pickThumbnail('vocabulary', 0),
        instructions: 'Pick the best fit for tone and register.',
        skills: ['vocabulary'],
        categoryTags: ['system', 'vocabulary'],
        content: {
          word: 'nuance',
          question: 'Vocabulary in context',
          options: questions[0]!.options,
          correctIndex: 0,
          questions,
        },
      }),
    )
  }

  {
    const questions = [
      q('_____ a meeting with the stakeholders', ['Hold', 'Cook', 'Wear', 'Paint', 'Fry', 'Knit'], 0, 'Hold a meeting.'),
      q('_____ a deadline without drama', ['Meet', 'Eat', 'Sing', 'Drive', 'Water', 'Hug'], 0, 'Meet a deadline.'),
      q('_____ constructive feedback', ['Give', 'Bake', 'Swim', 'Fly', 'Plant', 'Whistle'], 0, 'Give feedback.'),
      q('_____ an email before close of play', ['Send', 'Drink', 'Wear', 'Plant', 'Fry', 'Climb'], 0, 'Send an email.'),
      q('_____ steady progress this sprint', ['Make', 'Break glass only', 'Sleep', 'Jump', 'Paint', 'Boil'], 0, 'Make progress.'),
      q('_____ a contract after legal review', ['Sign', 'Fry', 'Knit', 'Whistle', 'Dance', 'Microwave'], 0, 'Sign a contract.'),
      q('Heavy _____ of support tickets', ['volume', 'pizza', 'socks', 'clouds', 'melodies', 'umbrellas'], 0, 'Volume of emails/tickets.'),
      q('_____ an agenda for tomorrow', ['Set', 'Bake', 'Swim', 'Iron clothes into', 'Invent gravity', 'Paint silence'], 0, 'Set an agenda.'),
      q('_____ the budget carefully', ['Allocate', 'Fry', 'Whisper to', 'Wear', 'Gallop', 'Microwave'], 0, 'Allocate budget.'),
      q('_____ a proposal to the board', ['Present', 'Eat', 'Hide forever under', 'Knit into', 'Boil', 'Skip forever without'], 0, 'Present a proposal.'),
      q('We need to _____ consensus first', ['reach', 'fry', 'wear', 'swim', 'paint', 'microwave'], 0, 'Reach consensus.'),
      q('_____ actionable next steps', ['Define', 'Cook', 'Erase humans', 'Gallop', 'Whistle only', 'Knit quietly'], 0, 'Define next steps.'),
    ]
    const meta = metaFromExercises('B2', 'vocabulary', questions.length)
    list.push(
      base({
        id: 'sys-vocab-business-collocations',
        title: 'Business Collocations',
        description: 'Natural word partners for work English.',
        type: 'vocabulary',
        level: 'B2',
        ...meta,
        thumbnail: pickThumbnail('vocabulary', 4),
        instructions: 'Pick the natural collocation.',
        skills: ['vocabulary'],
        categoryTags: ['system', 'vocabulary'],
        content: {
          word: 'collocation',
          question: 'Business pairs',
          options: questions[0]!.options,
          correctIndex: 0,
          questions,
        },
      }),
    )
  }

  {
    const questions = [
      q('Please _____ the registration form.', ['fill in', 'fill under', 'fill off', 'fill away', 'fill into sky', 'fill beside'], 0, 'Fill in a form.'),
      q('I’ll _____ you after lunch.', ['call back', 'call under', 'call off to', 'call into pizza', 'call above', 'call beside socks'], 0, 'Call back = return a call.'),
      q('She _____ smoking last year.', ['gave up', 'gave under', 'gave across', 'gave into night', 'gave beside', 'gave off to'], 0, 'Give up = stop a habit.'),
      q('_____ the lights when you leave.', ['Turn off', 'Turn under', 'Turn of', 'Turn into soup', 'Turn beside', 'Turn away cake'], 0, 'Turn off lights.'),
      q('We need to _____ this kitchen mess.', ['clean up', 'clean under forever', 'clean off to', 'clean into', 'clean beside moon', 'clean away silence'], 0, 'Clean up = tidy.'),
      q('“Look after” means…', ['take care of', 'look for keys only', 'ignore', 'shout', 'delete', 'paint'], 0, 'Look after = care for.'),
      q('The meeting was _____ until Friday.', ['put off', 'put under', 'put eating', 'put sky', 'put beside', 'put into socks'], 0, 'Put off = postpone.'),
      q('Can you _____ the kids from school?', ['pick up', 'pick under', 'pick off to', 'pick into rain', 'pick beside', 'pick away silence'], 0, 'Pick up = collect.'),
      q('Don’t _____ — I’ll explain slowly.', ['give up', 'give under', 'give across pizza', 'give into clouds', 'give beside', 'give off forever'], 0, 'Don’t give up.'),
      q('Please _____ your shoes at the door.', ['take off', 'take under', 'take of', 'take into sky', 'take beside', 'take away silence only'], 0, 'Take off = remove.'),
      q('We ran _____ of milk this morning.', ['out', 'under', 'across pizza', 'into night only', 'beside', 'above forever'], 0, 'Run out of = have none left.'),
    ]
    const meta = metaFromExercises('B1', 'vocabulary', questions.length)
    list.push(
      base({
        id: 'sys-vocab-phrasal-daily',
        title: 'Daily Phrasal Verbs',
        description: 'Common phrasals in everyday scenes.',
        type: 'vocabulary',
        level: 'B1',
        ...meta,
        thumbnail: pickThumbnail('vocabulary', 1),
        instructions: 'Choose the phrasal that fits.',
        skills: ['vocabulary'],
        categoryTags: ['system', 'vocabulary'],
        content: {
          word: 'phrasal verbs',
          question: 'Phrasals',
          options: questions[0]!.options,
          correctIndex: 0,
          questions,
        },
      }),
    )
  }

  {
    const questions = [
      q('You show this at the gate before boarding:', ['boarding pass', 'menu', 'umbrella', 'receipt for socks', 'toothbrush', 'library card'], 0),
      q('Place where travellers sleep:', ['hotel', 'passport', 'gate', 'runway', 'engine', 'ticket stub only'], 0),
      q('After landing, bags go to…', ['baggage claim', 'classroom', 'kitchen', 'library', 'swimming pool', 'rooftop garden'], 0),
      q('“Departure” means…', ['leaving', 'arriving forever', 'eating', 'sleeping', 'painting', 'whispering'], 0),
      q('Photo document for international travel:', ['passport', 'napkin', 'ticket stub only always', 'keychain', 'pillow', 'sandwich'], 0),
      q('A “window seat” is…', ['next to the window', 'in the bathroom', 'outside the plane', 'a café chair only', 'under the wing forever', 'in the cockpit always'], 0),
      q('You wait for your flight in the…', ['departure lounge', 'kitchen sink', 'football pitch', 'library basement only', 'bakery oven', 'swimming lane'], 0),
      q('“Luggage” is another word for…', ['bags and suitcases', 'passports only', 'airline food', 'seat belts', 'weather', 'music'], 0),
      q('At check-in you often show your…', ['passport and booking', 'favourite song', 'house keys only', 'school timetable', 'plant', 'bicycle'], 0),
    ]
    const meta = metaFromExercises('A2', 'vocabulary', questions.length)
    list.push(
      base({
        id: 'sys-vocab-travel-pack',
        title: 'Travel Words Pack',
        description: 'Airport and hotel words you’ll actually use.',
        type: 'vocabulary',
        level: 'A2',
        ...meta,
        thumbnail: pickThumbnail('vocabulary', 2),
        instructions: 'Match meaning to travel context.',
        skills: ['vocabulary'],
        categoryTags: ['system', 'vocabulary'],
        content: {
          word: 'boarding pass',
          question: 'Travel vocab',
          options: questions[0]!.options,
          correctIndex: 0,
          questions,
        },
      }),
    )
  }

  {
    const questions = [
      q('I want food. I’m…', ['hungry', 'blue', 'tall', 'loud', 'empty shoes', 'closed'], 0),
      q('Morning meal:', ['breakfast', 'suitcase', 'ticket', 'cloud', 'engine', 'passport'], 0),
      q('Opposite of sad:', ['happy', 'heavy', 'late', 'cold metal', 'silent forever', 'square'], 0),
      q('Hot brown drink:', ['coffee', 'shoe', 'pencil', 'door', 'window', 'sock'], 0),
      q('“Thirsty” means you want…', ['water', 'a map', 'a coat', 'a song', 'a stamp', 'a ladder'], 0),
      q('I like apples and bananas. They are…', ['fruit', 'chairs', 'tickets', 'engines', 'clouds', 'keys'], 0),
      q('When food tastes very good, it is…', ['delicious', 'angry', 'heavy metal', 'silent', 'square only', 'closed'], 0),
      q('Evening meal:', ['dinner', 'airport', 'passport', 'engine', 'blackboard', 'umbrella'], 0),
    ]
    const meta = metaFromExercises('A1', 'vocabulary', questions.length)
    list.push(
      base({
        id: 'sys-vocab-food-feelings',
        title: 'Food & Feelings',
        description: 'Basic words for meals and moods.',
        type: 'vocabulary',
        level: 'A1',
        ...meta,
        thumbnail: pickThumbnail('vocabulary', 3),
        instructions: 'Choose the best everyday word.',
        skills: ['vocabulary'],
        categoryTags: ['system', 'vocabulary'],
        content: {
          word: 'hungry',
          question: 'Basics',
          options: questions[0]!.options,
          correctIndex: 0,
          questions,
        },
      }),
    )
  }

  // —— Reading (5) advanced → basic ——
  {
    const passage =
      'Cities that expand protected bike lanes often face loud pushback from drivers who fear slower car traffic and lost parking. Yet multi-year data from several European capitals shows average commute times falling within two years as more short trips shift to cycling and buses run more reliably in freed curb space. The trade-off is political, not merely technical: councils must decide whether street space maximises throughput of private cars or access for a larger share of residents. Advocates argue equity and air quality improve; opponents warn of delivery delays for local shops. The debate rarely stays about paint on asphalt—it becomes a question of whose daily journey the city designs for.'
    const questions = [
      q('What do several European cities report after expanding bike lanes?', ['Shorter average commute times within about two years', 'No measurable change ever', 'Only more accidents forever', 'Closed city centres with no transport', 'Permanent delivery frezes citywide', 'Higher parking fees with no other effects'], 0),
      q('Pushback mainly comes from…', ['Drivers worried about traffic and parking', 'Deep-sea fishers', 'Astronauts on leave', 'Dessert chefs only', 'Museum guides abroad', 'Airline pilots exclusively'], 0),
      q('The core trade-off is described as…', ['Political', 'Impossible to discuss', 'Only about dessert menus', 'A software bug', 'A fashion choice', 'A sports score'], 0),
      q('Street-space decisions weigh…', ['Car throughput vs access for more people', 'Only flower pots', 'Airport runway length', 'Museum ticket prices', 'Football league rankings', 'Coffee brand loyalty'], 0),
      q('Tone of the passage?', ['Analytical and balanced', 'Joke-only comedy', 'A cake recipe', 'A sports live score', 'A love poem', 'A shopping list'], 0),
      q('“Throughput” here relates to…', ['How many cars can move through', 'Cooking oil quality', 'Wi-Fi passwords', 'Shoe sizes', 'Paint colours only', 'Hotel star ratings'], 0),
      q('Advocates claim improvements in…', ['Equity and air quality', 'Deep-ocean fishing', 'Passport design', 'Guitar tuning', 'Dessert sweetness', 'Cinema subtitles'], 0),
      q('Opponents worry about…', ['Delivery delays for local shops', 'Too many libraries', 'Silent fireworks', 'Missing umbrellas', 'Longer novels', 'Colder coffee forever'], 0),
      q('The debate ultimately asks…', ['Whose daily journey the city designs for', 'Which dessert is best', 'How to build rockets', 'When museums close', 'Who invents slang', 'How to fold maps only'], 0),
      q('Bike lanes are said to free curb space that can help…', ['Buses run more reliably', 'Planes land downtown', 'Submarines park', 'Trains float', 'Taxis fly', 'Ferries climb hills'], 0),
      q('Which statement best matches the author’s framing?', ['Technical paint jobs hide political choices about mobility', 'Drivers always agree with cyclists', 'Data never matters in cities', 'Shops want zero deliveries', 'Councils avoid all decisions', 'Commute times always rise'], 0),
      q('“Protected” bike lanes imply…', ['Physical separation that improves cyclist safety', 'Invisible lanes only on maps', 'Lanes for cars exclusively', 'Temporary chalk jokes', 'Night-only decorations', 'Airport-only paths'], 0),
      q('Short trips shifting modes suggests…', ['Some car journeys are replaced by cycling', 'Everyone buys bigger cars', 'Trains replace oceans', 'Walking becomes illegal', 'Buses disappear', 'Parking doubles overnight forever'], 0),
    ]
    const meta = metaFromExercises('C1', 'reading', questions.length)
    list.push(
      base({
        id: 'sys-read-urban-mobility',
        title: 'Urban Mobility Debate',
        description: 'Read a short opinion piece on city transport.',
        type: 'reading',
        level: 'C1',
        ...meta,
        thumbnail: pickThumbnail('reading', 0),
        instructions: 'Read carefully, then answer each question.',
        skills: ['reading'],
        categoryTags: ['system', 'reading'],
        content: {
          passage,
          question: questions[0]!.question,
          options: questions[0]!.options,
          correctIndex: 0,
          questions,
        },
      }),
    )
  }

  {
    const passage =
      'I bought these over-ear headphones mainly for long-haul flights. Battery life is excellent—about thirty hours on a single charge—which easily covers a return trip plus layovers. The headband, however, feels tight after roughly two hours, so I loosen it between films. Noise cancelling is strong on engine roar and cabin hum, but weaker on nearby voices and trolley chatter. Call quality is clear enough for short work check-ins. For the price, I’d buy them again, especially if you prioritise battery over plush comfort.'
    const questions = [
      q('Overall verdict?', ['Would buy again despite a tight headband', 'Hates every feature', 'Never flew anywhere', 'Battery lasts two minutes', 'Refuses all headphones', 'Prefers silence only forever'], 0),
      q('Claimed battery life?', ['About 30 hours', '30 minutes', '3 hours only', 'Unknown forever', 'One week unused claim with no flight use', 'Ninety seconds'], 0),
      q('Problem after about two hours?', ['Tight headband', 'No sound at all', 'Device explodes', 'Colour changes randomly', 'Mic vanishes', 'App deletes photos'], 0),
      q('Noise cancelling is stronger on…', ['Engine roar / cabin hum', 'Nearby voices', 'Birdsong only', 'Complete silence', 'Street musicians exclusively', 'Whispers in libraries'], 0),
      q('Main use case mentioned?', ['Long flights', 'Underwater swimming', 'Mountain climbing only', 'Cooking classes', 'Garden watering', 'Football coaching'], 0),
      q('Would the reviewer buy again?', ['Yes', 'No', 'The review never says', 'Only if free forever', 'Only in another decade', 'Only for pets'], 0),
      q('Call quality is described as…', ['Clear enough for short check-ins', 'Unusable always', 'Better than cinema speakers', 'Illegal in some countries', 'Only for singing', 'Worse than tin cans forever'], 0),
      q('The reviewer loosens the headband…', ['Between films', 'Never', 'Every second', 'Only on land', 'Underwater', 'During takeoff only forever'], 0),
      q('Weaker cancellation affects…', ['Nearby voices and trolley chatter', 'All engine noise completely', 'Battery percentage icons', 'Seatbelt signs', 'Passport control', 'Dessert menus'], 0),
      q('Priority implied for repurchase:', ['Battery life over plush comfort', 'Fashion colour only', 'Brand logo size', 'Wireless charging docks exclusively', 'RGB lights', 'Built-in perfume'], 0),
      q('Which is opinion rather than a measured claim?', ['I’d buy them again', 'About thirty hours on a charge', 'Over-ear form factor', 'Used on flights', 'Has a headband', 'Has noise cancelling'], 0),
      q('“Long-haul” suggests…', ['Long-distance flights', 'City bus hops', 'Elevator rides', 'Taxi across one block', 'Ferry across a pond', 'Walking downstairs'], 0),
    ]
    const meta = metaFromExercises('B2', 'reading', questions.length)
    list.push(
      base({
        id: 'sys-read-product-review',
        title: 'Product Review: Headphones',
        description: 'A short customer review with pros and cons.',
        type: 'reading',
        level: 'B2',
        ...meta,
        thumbnail: pickThumbnail('reading', 4),
        instructions: 'Identify opinion vs fact and key details.',
        skills: ['reading'],
        categoryTags: ['system', 'reading'],
        content: {
          passage,
          question: questions[0]!.question,
          options: questions[0]!.options,
          correctIndex: 0,
          questions,
        },
      }),
    )
  }

  {
    const passage =
      'Researchers say sleeping seven to eight hours most nights can improve memory, focus, and mood. Simple routines help more than expensive gadgets: dim lights about an hour before bed, avoid heavy meals late in the evening, and keep phones outside the bedroom if you can. Caffeine after mid-afternoon may also delay sleep for sensitive people. Consistency matters—similar bed and wake times make it easier to fall asleep. If problems continue for weeks, talk to a health professional rather than relying only on tips from articles.'
    const questions = [
      q('Recommended sleep length?', ['7–8 hours', '2 hours', '14 hours every night', 'No sleep at all', '30 minutes total', '20 hours straight'], 0),
      q('Benefits mentioned include…', ['Memory, focus, and mood', 'Taller height overnight', 'Free money', 'New shoes', 'Instant languages', 'Perfect pitch'], 0),
      q('Before bed, dim…', ['Lights', 'The fridge forever', 'Your shoes', 'The sky', 'Passports', 'Traffic lights citywide'], 0),
      q('Heavy meals late are…', ['Best avoided', 'Required nightly', 'A competitive sport', 'Illegal everywhere', 'A breakfast rule', 'Only for athletes'], 0),
      q('Phones tip?', ['Keep them outside the bedroom if possible', 'Must sleep with three phones', 'Call strangers at midnight', 'Delete English apps', 'Charge under the pillow always', 'Watch videos until dawn'], 0),
      q('Caffeine late may…', ['Delay sleep for some people', 'Guarantee deeper dreams', 'Replace water', 'Fix all stress', 'Shorten flights', 'Improve handwriting instantly'], 0),
      q('Consistency refers to…', ['Similar bed and wake times', 'Buying new pillows weekly', 'Changing cities monthly', 'Random naps only', 'Never waking up', 'Sleeping in cars only'], 0),
      q('If problems last for weeks…', ['See a health professional', 'Only read more blogs', 'Stop sleeping forever', 'Drink more coffee at night', 'Ignore all advice', 'Travel without rest'], 0),
      q('Gadgets are described as…', ['Less important than simple routines', 'The only real solution', 'Illegal', 'Required by law', 'Better than sleep itself', 'Useless and dangerous always'], 0),
      q('Main idea of the article?', ['Sleep 7–8 hours and use simple evening routines', 'Never sleep again', 'Eat more at midnight', 'Only use phones in bed', 'Avoid all mornings', 'Replace sleep with caffeine'], 0),
      q('“Sensitive people” here means people who…', ['React strongly to caffeine', 'Cannot read', 'Hate articles', 'Never feel tired', 'Only sleep outdoors', 'Avoid water'], 0),
    ]
    const meta = metaFromExercises('B1', 'reading', questions.length)
    list.push(
      base({
        id: 'sys-read-sleep-tips',
        title: 'Article: Sleep Tips',
        description: 'A short health article with clear takeaways.',
        type: 'reading',
        level: 'B1',
        ...meta,
        thumbnail: pickThumbnail('reading', 1),
        instructions: 'Find the main idea and supporting details.',
        skills: ['reading'],
        categoryTags: ['system', 'reading'],
        content: {
          passage,
          question: questions[0]!.question,
          options: questions[0]!.options,
          correctIndex: 0,
          questions,
        },
      }),
    )
  }

  {
    const passage =
      'Welcome to Riverside. Visit the old stone bridge in the morning when the light is soft, try local coffee near the open market, and walk along the river path at sunset. Small museums are free on the first Sunday of each month. Boats leave the pier every hour until 6pm. Bring a light jacket—evenings can feel cool near the water.'
    const questions = [
      q('Visit the bridge…', ['In the morning', 'At midnight only', 'Never', 'By helicopter only', 'Underwater', 'In winter exclusively forever'], 0),
      q('Try coffee near the…', ['Market', 'Airport runway', 'Desert', 'Moon base', 'Football tunnel', 'Silent library vault only'], 0),
      q('Walk along the river…', ['At sunset', 'Underwater with weights', 'In a plane', 'In silence forever only', 'At 3am exclusively', 'During storms only'], 0),
      q('Museums are free on…', ['The first Sunday each month', 'Every night', 'Random Wednesdays at 3am', 'Never', 'Only in December forever', 'Every Tuesday at dawn only'], 0),
      q('Boats leave until…', ['6pm', 'Midnight only', 'Sunrise only', 'Never', 'Noon once a year', 'Monday mornings exclusively'], 0),
      q('Why bring a jacket?', ['Evenings can feel cool near the water', 'Jackets are tickets', 'It rains fire', 'Museums require costumes', 'Boats ban bags', 'Coffee shops are freezing always'], 0),
      q('The bridge is described as…', ['Old stone', 'Brand new glass', 'Invisible', 'Floating plastic', 'Underground only', 'Made of books'], 0),
      q('How often do boats leave (until 6pm)?', ['Every hour', 'Once a week', 'Twice a year', 'Never', 'Every minute', 'Only on leap days'], 0),
      q('Best summary of the guide?', ['Morning bridge, market coffee, sunset walk, free museum Sundays', 'Stay indoors all day', 'Only visit airports', 'Skip the river forever', 'Museums cost extra on Sundays', 'No boats exist'], 0),
    ]
    const meta = metaFromExercises('A2', 'reading', questions.length)
    list.push(
      base({
        id: 'sys-read-city-guide',
        title: 'City Guide: Riverside',
        description: 'A friendly tourist paragraph.',
        type: 'reading',
        level: 'A2',
        ...meta,
        thumbnail: pickThumbnail('reading', 2),
        instructions: 'Scan for facts about Riverside.',
        skills: ['reading'],
        categoryTags: ['system', 'reading'],
        content: {
          passage,
          question: questions[0]!.question,
          options: questions[0]!.options,
          correctIndex: 0,
          questions,
        },
      }),
    )
  }

  {
    const passage =
      'Notice: English club meets on Friday at 4pm in Room 12. Bring a notebook and a pen. New students are welcome! Snacks are free. Please arrive five minutes early.'
    const questions = [
      q('Room number?', ['12', '1200', '2', '0', '112', '21'], 0),
      q('Bring a…', ['Notebook (and a pen)', 'Fridge', 'Bicycle only', 'Passport always', 'Football', 'Suitcase full of bricks'], 0),
      q('New students are…', ['Welcome', 'Banned', 'Invisible', 'Teachers only', 'Late forever', 'Silent robots'], 0),
      q('Subject of the club?', ['English', 'Cooking cars', 'Silent chess only', 'Space travel exams', 'Football tactics only', 'Painting walls'], 0),
      q('When is the club?', ['Friday at 4pm', 'Monday at 8am', 'Sunday midnight', 'Never', 'Tuesday at dawn only', 'Thursday at noon only'], 0),
      q('Snacks are…', ['Free', 'Very expensive', 'Not allowed', 'Only for teachers', 'Sold outside', 'Imaginary'], 0),
      q('Arrive…', ['Five minutes early', 'Two hours late', 'Next month', 'Without coming', 'After snacks only', 'At midnight'], 0),
      q('What day is the meeting?', ['Friday', 'Monday', 'Sunday', 'Wednesday only forever', 'Saturday morning exclusively', 'Thursday night only'], 0),
    ]
    const meta = metaFromExercises('A1', 'reading', questions.length)
    list.push(
      base({
        id: 'sys-read-classroom-notice',
        title: 'Classroom Notice',
        description: 'Read a simple school notice.',
        type: 'reading',
        level: 'A1',
        ...meta,
        thumbnail: pickThumbnail('reading', 3),
        instructions: 'Find the key information on the notice.',
        skills: ['reading'],
        categoryTags: ['system', 'reading'],
        content: {
          passage,
          question: questions[0]!.question,
          options: questions[0]!.options,
          correctIndex: 0,
          questions,
        },
      }),
    )
  }

  // —— Writing (5) advanced → basic ——
  const writingSpecs: {
    id: string
    title: string
    level: ActivityLevel
    prompt: string
    min: number
    max: number
    task: 'short' | 'essay'
    criteria: string[]
    i: number
  }[] = [
    {
      id: 'sys-write-ai-argument',
      title: 'Argument: AI at Work',
      level: 'C1',
      prompt:
        'Write a short argument: Should companies limit AI tools at work? Give at least two reasoned points, acknowledge one counterargument, and end with a clear conclusion.',
      min: 120,
      max: 220,
      task: 'essay',
      i: 0,
      criteria: [
        'States a clear position in the introduction',
        'Develops at least two distinct supporting reasons',
        'Acknowledges a credible counterargument',
        'Uses formal, precise vocabulary (not slang)',
        'Links ideas with advanced connectors',
        'Ends with a decisive conclusion',
        'Stays within the word limits',
        'Controls complex grammar with few slips',
      ],
    },
    {
      id: 'sys-write-cover-letter',
      title: 'Cover Letter Draft',
      level: 'B2',
      prompt:
        'Draft a short cover letter for an English-speaking internship. Mention relevant skills, one concrete example of experience, and your motivation for the role.',
      min: 100,
      max: 180,
      task: 'essay',
      i: 4,
      criteria: [
        'Opens with purpose and target role',
        'Highlights relevant skills clearly',
        'Includes one specific example or achievement',
        'Explains motivation for this internship',
        'Uses polite professional tone',
        'Has a courteous closing and sign-off',
        'Respects min/max word counts',
      ],
    },
    {
      id: 'sys-write-complaint-email',
      title: 'Complaint Email',
      level: 'B1',
      prompt:
        'Write an email to a hotel about a noisy room. Be polite but clear. Describe the problem, say how it affected your stay, and ask for a concrete solution.',
      min: 80,
      max: 160,
      task: 'short',
      i: 1,
      criteria: [
        'Uses email greeting and closing',
        'States the problem clearly',
        'Explains the impact on the stay',
        'Makes a polite request for a solution',
        'Keeps a respectful tone',
        'Uses past forms accurately for the stay',
        'Stays within the word range',
      ],
    },
    {
      id: 'sys-write-weekend-friend',
      title: 'Email to a Friend',
      level: 'A2',
      prompt:
        'Write a short email to a friend about your weekend plans. Include a greeting, two plans, and a friendly closing.',
      min: 50,
      max: 120,
      task: 'short',
      i: 2,
      criteria: [
        'Includes a friendly greeting',
        'Mentions at least two weekend plans',
        'Uses simple present/future forms correctly',
        'Sounds natural and friendly',
        'Has a clear closing',
        'Stays within the word limits',
      ],
    },
    {
      id: 'sys-write-about-yourself',
      title: 'About Yourself',
      level: 'A1',
      prompt: 'Write 5–8 sentences about yourself: name, city, work or study, and one hobby.',
      min: 40,
      max: 100,
      task: 'short',
      i: 3,
      criteria: [
        'Says your name',
        'Says your city or country',
        'Mentions work or study',
        'Mentions one hobby',
        'Uses am/is/are correctly',
        'Writes complete simple sentences',
      ],
    },
  ]
  for (const w of writingSpecs) {
    const meta = metaFromExercises(w.level, 'writing', w.criteria.length)
    list.push(
      base({
        id: w.id,
        title: w.title,
        description: 'Guided writing practice with a clear task and checklist.',
        type: 'writing',
        level: w.level,
        ...meta,
        thumbnail: pickThumbnail('writing', w.i),
        instructions: 'Write within the word limits, then self-check the criteria.',
        skills: ['writing'],
        categoryTags: ['system', 'writing'],
        content: {
          prompt: w.prompt,
          minWords: w.min,
          maxWords: w.max,
          taskType: w.task,
          criteria: w.criteria,
        },
      }),
    )
  }

  // —— Speaking (5) advanced → basic ——
  const speakingSpecs: {
    id: string
    title: string
    level: ActivityLevel
    prompt: string
    mode: 'read_aloud' | 'answer'
    ref?: string
    criteria: string[]
    i: number
  }[] = [
    {
      id: 'sys-speak-career-pitch',
      title: 'Career Pitch (1 min)',
      level: 'B2',
      prompt:
        'Speak for about one minute: your future career direction, two skills you bring, and one challenge you will prepare for.',
      mode: 'answer',
      i: 0,
      criteria: [
        'States a clear career goal',
        'Mentions at least two relevant skills',
        'Names one realistic challenge',
        'Uses linking words (first, also, finally)',
        'Speaks for roughly one minute',
        'Maintains intelligible pronunciation',
        'Sounds organised, not random',
      ],
    },
    {
      id: 'sys-speak-persuade-friend',
      title: 'Persuade a Friend',
      level: 'B2',
      prompt: 'Persuade a friend to join an evening English club. Give three good reasons and invite them clearly.',
      mode: 'answer',
      i: 4,
      criteria: [
        'Opens with a friendly invitation',
        'Gives three distinct reasons',
        'Uses persuasive language (you’ll, we could, it’s worth)',
        'Addresses a possible objection briefly',
        'Ends with a clear call to action',
        'Keeps fluent, natural pacing',
        'Pronunciation remains clear under emphasis',
      ],
    },
    {
      id: 'sys-speak-last-vacation',
      title: 'Last Vacation',
      level: 'B1',
      prompt: 'Describe your last vacation: where you went, who you were with, what you did, and one funny or surprising moment.',
      mode: 'answer',
      i: 1,
      criteria: [
        'Says where you went',
        'Says who you were with',
        'Describes at least two activities',
        'Includes one funny/surprising moment',
        'Uses past simple accurately',
        'Speaks in a clear sequence',
      ],
    },
    {
      id: 'sys-speak-hobbies',
      title: 'Talk About Hobbies',
      level: 'A2',
      prompt: 'Talk about two hobbies. Say how often you do them and why you like them.',
      mode: 'answer',
      i: 2,
      criteria: [
        'Names two hobbies',
        'Says how often for each',
        'Gives a reason you like each',
        'Uses simple present correctly',
        'Speaks loudly enough to understand',
        'Finishes with a short closing line',
      ],
    },
    {
      id: 'sys-speak-introduce',
      title: 'Introduce Yourself',
      level: 'A1',
      prompt: 'Read the model aloud clearly, then try to say it from memory.',
      mode: 'read_aloud',
      ref: 'Hello, my name is Alex. I am from Brazil. I am a student. I like English classes.',
      i: 3,
      criteria: [
        'Says hello',
        'Says your name',
        'Says where you are from',
        'Says you are a student (or your job)',
        'Says one thing you like',
        'Speaks slowly and clearly',
      ],
    },
  ]
  for (const s of speakingSpecs) {
    const meta = metaFromExercises(s.level, 'speaking', s.criteria.length)
    list.push(
      base({
        id: s.id,
        title: s.title,
        description: 'Speaking practice with a clear prompt and checklist.',
        type: 'speaking',
        level: s.level,
        ...meta,
        thumbnail: pickThumbnail('speaking', s.i),
        instructions: 'Record when ready; use the criteria as a self-check.',
        skills: ['speaking'],
        categoryTags: ['system', 'speaking'],
        content: {
          prompt: s.prompt,
          expectedDuration: s.level.startsWith('A') ? 30 : 60,
          mode: s.mode,
          referenceText: s.ref,
          evaluation: {
            pronunciation: true,
            fluency: true,
            grammar: !s.level.startsWith('A') || s.level === 'A2',
            vocabulary: s.level !== 'A1',
            coherence: s.level !== 'A1',
          },
          criteria: s.criteria,
        },
      }),
    )
  }

  // —— Fill blank (5) advanced → basic ——
  {
    const items = [
      blank('1', '_____ the delay, the launch still succeeded.', 'Despite', ['Because', 'Although of', 'During', 'Unless', 'While', 'Since of']),
      blank('2', 'She left early _____ as to catch the last train.', 'so', ['such', 'too', 'enough', 'very', 'rather', 'quite']),
      blank('3', 'The plan failed; _____, the team learned a lot.', 'nevertheless', ['therefore only cake', 'because', 'during', 'onto', 'beneath', 'among']),
      blank('4', '_____ had we arrived when the storm began.', 'Hardly', ['Almost soft', 'Nearly we', 'Softly', 'Rare forever', 'Quickly had not', 'Seldom soft']),
      blank('5', 'He acts _____ he owns the entire building.', 'as', ['like if', 'so that forever', 'despite', 'unless', 'during', 'onto']),
      blank('6', 'I agree with the goal, _____ I still have doubts about timing.', 'although', ['because always', 'during', 'despite of', 'unless that', 'onto', 'beneath']),
      blank('7', 'Take a paper map _____ case you lose signal.', 'in', ['on', 'at', 'by', 'for of', 'under', 'over']),
      blank('8', 'The more you practise, _____ more natural it feels.', 'the', ['a', 'an', 'some', 'any', 'this', 'those']),
      blank('9', '_____ being exhausted, she finished the report.', 'Despite', ['Although she', 'Because of she', 'During', 'Unless', 'While that', 'Since she of']),
      blank('10', 'We postponed the launch _____ as to avoid the holiday rush.', 'so', ['such', 'too', 'enough', 'very', 'rather too', 'quite so']),
      blank('11', 'Rarely _____ the board approved a plan so quickly.', 'has', ['have they soft', 'did have forever', 'are', 'were being', 'do', 'was do']),
    ]
    const meta = metaFromExercises('C1', 'fill_blank', items.length)
    list.push(
      base({
        id: 'sys-fill-advanced-connectors',
        title: 'Connectors Challenge',
        description: 'Open cloze with advanced linkers and fixed patterns.',
        type: 'fill_blank',
        level: 'C1',
        ...meta,
        thumbnail: pickThumbnail('fill_blank', 0),
        instructions: 'Choose the best word for each gap.',
        skills: ['fill_blank', 'grammar'],
        categoryTags: ['system', 'fill_blank'],
        content: { items, explanation: 'Focus on linkers and fixed patterns.' },
      }),
    )
  }

  {
    const items = [
      blank('1', 'The letter was _____ yesterday afternoon.', 'sent', ['send', 'sending', 'sends', 'to send', 'sended', 'sendted']),
      blank('2', 'The bridge is being _____ this month.', 'repaired', ['repair', 'repairing by soft', 'repairs', 'to repair', 'repairful', 'reparationed']),
      blank('3', 'The thief was _____ by police near the station.', 'caught', ['catch', 'catching', 'catches', 'caughting', 'to catch', 'catchen']),
      blank('4', 'English is _____ all over the world.', 'spoken', ['speak', 'speaking', 'speaks', 'spoke always', 'to speak', 'speaken']),
      blank('5', 'The results will be _____ on Friday.', 'published', ['publish', 'publishing', 'publishes', 'to publish soft', 'publishful', 'publicationed']),
      blank('6', 'The film was _____ by a first-time director.', 'directed', ['direct', 'directing', 'directs', 'to direct', 'directioned', 'directful']),
      blank('7', 'A new library is being _____ downtown.', 'built', ['build', 'building soft', 'builds', 'to build', 'builded', 'builden']),
      blank('8', 'The awards were _____ by a local journalist.', 'announced', ['announce', 'announcing', 'announces', 'to announce', 'announcen', 'announceful']),
      blank('9', 'All passengers were _____ to leave the platform.', 'asked', ['ask', 'asking', 'asks', 'to ask soft', 'asken', 'askful']),
      blank('10', 'The mural was _____ overnight by volunteers.', 'painted', ['paint', 'painting', 'paints', 'to paint', 'paintful', 'paintten']),
    ]
    const meta = metaFromExercises('B2', 'fill_blank', items.length)
    list.push(
      base({
        id: 'sys-fill-passive-news',
        title: 'News Passive Gaps',
        description: 'Passive voice in short news lines.',
        type: 'fill_blank',
        level: 'B2',
        ...meta,
        thumbnail: pickThumbnail('fill_blank', 4),
        instructions: 'Choose the past participle that completes each passive.',
        skills: ['fill_blank', 'grammar'],
        categoryTags: ['system', 'fill_blank'],
        content: { items, explanation: 'Passive: be + past participle.' },
      }),
    )
  }

  {
    const items = [
      blank('1', 'I have _____ finished the quarterly report.', 'already', ['yet soft', 'ago', 'yesterday forever', 'never always only', 'still not word', 'tomorrow']),
      blank('2', 'She hasn’t called us _____.', 'yet', ['already ago', 'since night only', 'for yesterday', 'tomorrow', 'during', 'beneath']),
      blank('3', 'We have lived here _____ 2019.', 'since', ['for of', 'during from', 'by', 'until always soft', 'ago', 'at']),
      blank('4', 'They have been friends _____ ten years.', 'for', ['since of', 'during ten', 'ago', 'by', 'until soft', 'at']),
      blank('5', '_____ you ever tried kimchi?', 'Have', ['Did forever', 'Are', 'Do', 'Has you', 'Were', 'Be']),
      blank('6', 'He has _____ left the building.', 'just', ['yet ago', 'since', 'for soft', 'tomorrow', 'during', 'beneath']),
      blank('7', 'I haven’t seen her _____ Monday.', 'since', ['for Monday soft', 'ago Monday', 'during', 'by', 'until of', 'at']),
      blank('8', 'We have _____ spoken about the budget this week.', 'already', ['yet soft cake', 'ago', 'tomorrow', 'during under', 'beneath', 'onto']),
      blank('9', '_____ they finished the interviews yet?', 'Have', ['Did they soft forever', 'Are', 'Do', 'Has', 'Were', 'Be']),
      blank('10', 'She has worked here _____ last April.', 'since', ['for last', 'ago', 'during of', 'by soft', 'until always cake', 'at']),
    ]
    const meta = metaFromExercises('B1', 'fill_blank', items.length)
    list.push(
      base({
        id: 'sys-fill-present-perfect',
        title: 'Perfect Gaps',
        description: 'Present perfect open cloze.',
        type: 'fill_blank',
        level: 'B1',
        ...meta,
        thumbnail: pickThumbnail('fill_blank', 1),
        instructions: 'Choose one word per gap.',
        skills: ['fill_blank'],
        categoryTags: ['system', 'fill_blank'],
        content: { items, explanation: 'already / yet / since / for / just / have' },
      }),
    )
  }

  {
    const items = [
      blank('1', 'I _____ to the cinema yesterday.', 'went', ['go', 'goed', 'going', 'goes', 'gone', 'wented']),
      blank('2', 'She _____ a great movie with her brother.', 'watched', ['watch', 'watches', 'watching', 'watchs', 'watcheded', 'wached']),
      blank('3', 'We _____ pizza after the film.', 'ate', ['eat', 'eated', 'eats', 'eating', 'aten', 'ated']),
      blank('4', 'It _____ late when we left the mall.', 'was', ['were', 'is', 'be', 'are', 'been', 'been']),
      blank('5', 'They _____ not take a taxi home.', 'did', ['do', 'does', 'are', 'was', 'have', 'were']),
      blank('6', '_____ you enjoy the evening?', 'Did', ['Do', 'Does', 'Are', 'Was', 'Have', 'Is']),
      blank('7', 'Leo _____ his lemonade on the blanket.', 'spilled', ['spill', 'spills', 'spilling', 'spilted always', 'spilld', 'spillsed']),
      blank('8', 'Maya _____ sandwiches for the group.', 'made', ['make', 'maked', 'makes', 'making', 'maded', 'maked always']),
      blank('9', 'The children _____ football until sunset.', 'played', ['play', 'plays', 'playing', 'playeded', 'plaied', 'playying']),
    ]
    const meta = metaFromExercises('A2', 'fill_blank', items.length)
    list.push(
      base({
        id: 'sys-fill-past-simple',
        title: 'Yesterday Gaps',
        description: 'Past simple cloze for everyday stories.',
        type: 'fill_blank',
        level: 'A2',
        ...meta,
        thumbnail: pickThumbnail('fill_blank', 2),
        instructions: 'Choose one word per gap.',
        skills: ['fill_blank'],
        categoryTags: ['system', 'fill_blank'],
        content: { items, explanation: 'Past simple forms.' },
      }),
    )
  }

  {
    const items = [
      blank('1', 'I _____ a student.', 'am', ['is', 'are', 'be', 'was are', 'being', 'been']),
      blank('2', 'She _____ happy today.', 'is', ['am', 'are', 'be', 'are is', 'being', 'were am']),
      blank('3', 'They _____ my friends.', 'are', ['is', 'am', 'be', 'is are', 'being', 'was']),
      blank('4', 'He _____ from Brazil.', 'is', ['am', 'are', 'be', 'are he', 'being', 'were']),
      blank('5', 'We _____ in the classroom.', 'are', ['is', 'am', 'be', 'is we', 'being', 'was am']),
      blank('6', '_____ you ready?', 'Are', ['Is', 'Am', 'Be', 'Does', 'Was soft', 'Have']),
      blank('7', 'My name _____ Ana.', 'is', ['am', 'are', 'be', 'are name', 'being', 'were']),
      blank('8', 'It _____ a sunny morning.', 'is', ['am', 'are', 'be', 'are it', 'being', 'was am always']),
    ]
    const meta = metaFromExercises('A1', 'fill_blank', items.length)
    list.push(
      base({
        id: 'sys-fill-verb-be',
        title: 'Be Gaps',
        description: 'Am / is / are open cloze.',
        type: 'fill_blank',
        level: 'A1',
        ...meta,
        thumbnail: pickThumbnail('fill_blank', 3),
        instructions: 'Choose am, is, or are.',
        skills: ['fill_blank'],
        categoryTags: ['system', 'fill_blank'],
        content: { items, explanation: 'Verb to be.' },
      }),
    )
  }

  return list
}
