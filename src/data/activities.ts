import type { Activity, ActivityType } from '@/types/activity'

/** Unsplash photos cropped for activity cards (topic-matched). */
const photos = {
  airport:
    'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80&auto=format&fit=crop',
  writing:
    'https://images.unsplash.com/photo-1455390582262-044cdead168a?w=800&q=80&auto=format&fit=crop',
  city:
    'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&q=80&auto=format&fit=crop',
  grammar:
    'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80&auto=format&fit=crop',
  travel:
    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80&auto=format&fit=crop',
  music:
    'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&q=80&auto=format&fit=crop',
  office:
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80&auto=format&fit=crop',
  game:
    'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&q=80&auto=format&fit=crop',
  cafe:
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80&auto=format&fit=crop',
  remote:
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80&auto=format&fit=crop',
  news:
    'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80&auto=format&fit=crop',
  chalkboard:
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80&auto=format&fit=crop',
  dictionary:
    'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80&auto=format&fit=crop',
  concert:
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80&auto=format&fit=crop',
  interview:
    'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80&auto=format&fit=crop',
  duel:
    'https://images.unsplash.com/photo-1553481187-be93c21490a9?w=800&q=80&auto=format&fit=crop',
} as const

export const activities: Activity[] = [
  {
    id: 'airport-listening',
    title: 'At the Airport',
    description:
      'Practice listening through a real-life airport conversation and travel vocabulary.',
    type: 'listening',
    level: 'B1',
    difficulty: 'intermediate',
    duration: 10,
    thumbnail: photos.airport,
    skills: ['Listening', 'Vocabulary', 'Comprehension'],
    practicePoints: [
      'Travel vocabulary',
      'Airport expressions',
      'Listening comprehension',
      'Real-life English',
    ],
    categoryTags: ['trending', 'listening'],
    instructions: 'Listen to the announcement, then answer the questions.',
    content: {
      audioText:
        'Good morning passengers. Flight BA dual four two to London is now boarding at gate twelve. Please have your boarding pass and passport ready. Thank you for flying with us.',
      transcript:
        'Good morning passengers. Flight BA dual four two to London is now boarding at gate twelve. Please have your boarding pass and passport ready. Thank you for flying with us.',
      questions: [
        {
          question: 'Where should passengers go?',
          options: ['Gate 12', 'Gate 2', 'Baggage claim', 'The café'],
          correctIndex: 0,
          explanation: 'The announcement says boarding at gate twelve.',
        },
        {
          question: 'What do passengers need ready?',
          options: ['Boarding pass and passport', 'Only a ticket stub', 'Cash only', 'A suitcase key'],
          correctIndex: 0,
        },
      ],
    },
  },
  {
    id: 'weekend-email',
    title: 'Weekend Email',
    description: 'Write a short email to a friend about your weekend plans.',
    type: 'writing',
    level: 'A2',
    difficulty: 'basic',
    duration: 15,
    thumbnail: photos.writing,
    skills: ['Writing', 'Grammar'],
    practicePoints: ['Email structure', 'Past tense', 'Friendly tone'],
    categoryTags: ['trending', 'writing'],
    content: {
      prompt: 'Write a short email to a friend about your weekend plans (40–80 words).',
      minWords: 40,
      maxWords: 120,
      taskType: 'short',
      rubric: ['Greeting', 'Plans', 'Closing'],
    },
  },
  {
    id: 'city-guide-reading',
    title: 'City Guide',
    description: 'Read a short city guide and answer comprehension questions.',
    type: 'reading',
    level: 'B1',
    difficulty: 'intermediate',
    duration: 12,
    thumbnail: photos.city,
    skills: ['Reading', 'Vocabulary'],
    practicePoints: ['Skimming', 'Detail questions', 'Context clues'],
    categoryTags: ['reading'],
    content: {
      passage:
        'Welcome to Riverside. Visit the old bridge in the morning, try local coffee near the market, and walk along the river at sunset. Museums are free on the first Sunday of each month.',
      question: 'When are museums free?',
      options: [
        'The first Sunday of each month',
        'Every Friday evening',
        'Only in winter',
        'Never',
      ],
      correctIndex: 0,
      questions: [
        {
          question: 'What is the best main idea of the guide?',
          options: [
            'Tips for enjoying Riverside in one day',
            'How to build a bridge',
            'Airport rules in Riverside',
            'A restaurant menu only',
          ],
          correctIndex: 0,
          explanation: 'The text suggests places and times to visit, like a short city guide.',
        },
        {
          question: 'When should you visit the old bridge?',
          options: ['In the morning', 'At midnight only', 'Never', 'Only in winter'],
          correctIndex: 0,
        },
        {
          question: 'Where can you try local coffee?',
          options: ['Near the market', 'On the bridge roof', 'At the airport gate', 'Under the river'],
          correctIndex: 0,
        },
        {
          question: 'When is a good time to walk along the river?',
          options: ['At sunset', 'Before sunrise only', 'During a storm only', 'Never mentioned'],
          correctIndex: 0,
        },
        {
          question: 'When are museums free?',
          options: [
            'The first Sunday of each month',
            'Every Friday evening',
            'Only in winter',
            'Never',
          ],
          correctIndex: 0,
          explanation: 'The last sentence states museums are free on the first Sunday of each month.',
        },
        {
          question: '“Local coffee” most likely means coffee that is…',
          options: [
            'Typical of the area / nearby cafés',
            'Only from another country',
            'Frozen forever',
            'Free for pilots only',
          ],
          correctIndex: 0,
        },
      ],
    },
  },
  {
    id: 'present-perfect-lab',
    title: 'Present Perfect Lab',
    description: 'Interactive challenges to master the present perfect tense.',
    type: 'grammar',
    level: 'B1',
    difficulty: 'intermediate',
    duration: 10,
    thumbnail: photos.grammar,
    skills: ['Grammar'],
    practicePoints: ['Have/has + past participle', 'Time expressions', 'Common mistakes'],
    categoryTags: ['grammar', 'trending'],
    content: {
      prompt: 'Choose the correct present perfect form.',
      options: [
        'I have visited Paris twice.',
        'I has visited Paris twice.',
        'I visit Paris twice.',
        'I visiting Paris twice.',
      ],
      correctIndex: 0,
      explanation: 'Use have/has + past participle.',
      questions: [
        {
          question: 'Choose the correct sentence.',
          options: [
            'She has finished her homework.',
            'She have finished her homework.',
            'She finishing her homework.',
            'She finish her homework yesterday already.',
          ],
          correctIndex: 0,
          explanation: 'She + has + past participle.',
        },
        {
          question: '“I _____ three countries this year.”',
          options: ['have visited', 'visited always yesterday only', 'am visit', 'visiting'],
          correctIndex: 0,
          explanation: 'Unfinished time (this year) → present perfect.',
        },
        {
          question: 'Which word fits? “He hasn’t called _____.”',
          options: ['yet', 'ago', 'yesterday night forever', 'last year only as past'],
          correctIndex: 0,
          explanation: 'Yet is common with negative present perfect.',
        },
        {
          question: '“We have lived here _____ 2019.”',
          options: ['since', 'for 2019', 'ago', 'at'],
          correctIndex: 0,
          explanation: 'Since + starting point; for + period.',
        },
        {
          question: 'Finished time yesterday → choose past simple:',
          options: [
            'She closed the shop yesterday.',
            'She has closed the shop yesterday.',
            'She have closed yesterday.',
            'She closing the shop yesterday.',
          ],
          correctIndex: 0,
          explanation: 'Specific finished time (yesterday) uses past simple.',
        },
        {
          question: '“_____ you ever tried sushi?”',
          options: ['Have', 'Did you ever tried', 'Are', 'Do'],
          correctIndex: 0,
          explanation: 'Have you ever + past participle.',
        },
      ],
    },
  },
  {
    id: 'travel-words',
    title: 'Travel Words Boost',
    description: 'Learn and practice essential travel vocabulary with quick drills.',
    type: 'vocabulary',
    level: 'A2',
    difficulty: 'basic',
    duration: 8,
    thumbnail: photos.travel,
    skills: ['Vocabulary'],
    practicePoints: ['Airport words', 'Hotel phrases', 'Directions'],
    categoryTags: ['vocabulary', 'trending'],
    content: {
      word: 'boarding pass',
      question: 'What do you show at the gate before you get on the plane?',
      options: ['Boarding pass', 'Menu', 'Receipt only', 'Umbrella'],
      correctIndex: 0,
      questions: [
        {
          question: 'What do you show at the gate before boarding?',
          options: ['Boarding pass', 'Hotel pillow', 'Only a shopping bag', 'A museum ticket'],
          correctIndex: 0,
          explanation: 'The boarding pass lets you get on the plane.',
        },
        {
          question: 'A place to sleep when you travel is a…',
          options: ['hotel', 'passport', 'gate', 'runway'],
          correctIndex: 0,
        },
        {
          question: 'Where do bags arrive after a flight?',
          options: ['Baggage claim', 'Classroom', 'Kitchen', 'Library'],
          correctIndex: 0,
        },
        {
          question: '“Departure” means…',
          options: ['Leaving / taking off', 'Arriving forever', 'Eating lunch', 'Sleeping'],
          correctIndex: 0,
        },
        {
          question: 'The document with your photo for international travel is a…',
          options: ['passport', 'napkin', 'boarding stub only', 'keychain'],
          correctIndex: 0,
        },
        {
          question: 'A “window seat” is…',
          options: [
            'Next to the window on the plane',
            'In the airport bathroom',
            'Outside the terminal forever',
            'A café chair only',
          ],
          correctIndex: 0,
        },
      ],
    },
  },
  {
    id: 'cafe-order',
    title: 'Ordering at a Café',
    description: 'Listen to a café order and choose what the customer asked for.',
    type: 'listening',
    level: 'A1',
    difficulty: 'basic',
    duration: 5,
    thumbnail: photos.cafe,
    skills: ['Listening'],
    practicePoints: ['Food vocabulary', 'Polite requests'],
    categoryTags: ['listening'],
    instructions: 'Listen, then choose the correct order.',
    content: {
      audioText:
        "I'd like a large coffee and a banana muffin, please. No sugar, thank you.",
      transcript:
        "I'd like a large coffee and a banana muffin, please. No sugar, thank you.",
      questions: [
        {
          question: 'What size coffee did the customer want?',
          options: ['Large', 'Small', 'Medium', 'No coffee'],
          correctIndex: 0,
        },
        {
          question: 'What else did they order?',
          options: ['A banana muffin', 'A sandwich', 'Tea', 'Water only'],
          correctIndex: 0,
        },
      ],
    },
  },
  {
    id: 'opinion-paragraph',
    title: 'Share Your Opinion',
    description: 'Write a short paragraph giving your opinion on remote work.',
    type: 'writing',
    level: 'B2',
    difficulty: 'advanced',
    duration: 20,
    thumbnail: photos.remote,
    skills: ['Writing', 'Structure'],
    practicePoints: ['Opinion phrases', 'Linking words', 'Paragraph unity'],
    categoryTags: ['writing'],
    content: {
      prompt: 'Write a short paragraph giving your opinion on remote work (60–120 words).',
      minWords: 60,
      maxWords: 150,
      taskType: 'essay',
      rubric: ['Clear opinion', 'Supporting reasons', 'Linking words'],
    },
  },
  {
    id: 'news-snippet',
    title: 'News Snippet',
    description: 'Read a short news excerpt and identify key facts.',
    type: 'reading',
    level: 'B2',
    difficulty: 'advanced',
    duration: 10,
    thumbnail: photos.news,
    skills: ['Reading'],
    practicePoints: ['Fact vs opinion', 'Headline meaning'],
    categoryTags: ['reading'],
    content: {
      passage:
        'City officials opened a new riverside park on Monday. The project cost two million dollars and includes bike paths, picnic areas, and free Wi-Fi. Local residents say the park will improve weekend tourism.',
      question: 'When did the park open?',
      options: ['Monday', 'Friday', 'Last year only', 'Never'],
      correctIndex: 0,
      questions: [
        {
          question: 'When did the park open?',
          options: ['Monday', 'Friday', 'Last year only', 'Never'],
          correctIndex: 0,
          explanation: 'The first sentence says it opened on Monday.',
        },
        {
          question: 'How much did the project cost?',
          options: ['Two million dollars', 'Two hundred dollars', 'Nothing', 'Unknown forever'],
          correctIndex: 0,
        },
        {
          question: 'Which facilities are mentioned?',
          options: [
            'Bike paths, picnic areas, and free Wi-Fi',
            'An airport and a stadium only',
            'A shopping mall only',
            'None',
          ],
          correctIndex: 0,
        },
        {
          question: '“Local residents say…” is mainly…',
          options: [
            'An opinion / expectation',
            'A proven scientific law',
            'A flight number',
            'A menu item',
          ],
          correctIndex: 0,
          explanation: '“Say” introduces what people believe, not a measured fact in the text.',
        },
        {
          question: 'What do residents expect the park to improve?',
          options: ['Weekend tourism', 'Airplane speed', 'School exams', 'Ocean tides'],
          correctIndex: 0,
        },
        {
          question: 'Where is the new park?',
          options: ['By the river (riverside)', 'On the moon', 'Inside a plane', 'Under the sea only'],
          correctIndex: 0,
        },
      ],
    },
  },
  {
    id: 'conditionals-challenge',
    title: 'Conditionals Challenge',
    description: 'Choose the correct conditional forms in everyday situations.',
    type: 'grammar',
    level: 'B2',
    difficulty: 'advanced',
    duration: 12,
    thumbnail: photos.chalkboard,
    skills: ['Grammar'],
    practicePoints: ['Zero/first/second conditional'],
    categoryTags: ['grammar'],
    content: {
      prompt: 'Choose the correct conditional.',
      options: [
        'If it rains, we will stay inside.',
        'If it rains, we stay will inside.',
        'If it will rain, we stay inside.',
        'If rains it, we will stay.',
      ],
      correctIndex: 0,
      questions: [
        {
          question: 'First conditional — choose the correct sentence:',
          options: [
            'If it rains, we will stay inside.',
            'If it rains, we stay will inside.',
            'If it will rain, we stay inside.',
            'If rains it, we will stay.',
          ],
          correctIndex: 0,
          explanation: 'If + present, will + verb.',
        },
        {
          question: 'Second conditional — “If I _____ you, I would study more.”',
          options: ['were', 'am', 'be', 'will be'],
          correctIndex: 0,
          explanation: 'If I were you… is the standard form.',
        },
        {
          question: 'Zero conditional (facts): “If you heat ice, it _____.”',
          options: ['melts', 'will melted', 'melted always yesterday', 'melting'],
          correctIndex: 0,
        },
        {
          question: '“Unless she _____, we can’t publish.”',
          options: ['approves', 'approve', 'will approve', 'approving'],
          correctIndex: 0,
          explanation: 'Unless = if not; use present here.',
        },
        {
          question: '“If we had left earlier, we _____ the train.”',
          options: ['would have caught', 'will catch', 'catch', 'are catching'],
          correctIndex: 0,
          explanation: 'Third conditional: if + past perfect, would have + past participle.',
        },
        {
          question: 'Mixed idea — past condition, present result: “If I had slept more, I _____ tired now.”',
          options: ["wouldn't be", "won't be", "am not being forever", "wasn't be"],
          correctIndex: 0,
        },
      ],
    },
  },
  {
    id: 'phrasal-verbs-pack',
    title: 'Phrasal Verbs Pack',
    description: 'Match phrasal verbs with meanings in context.',
    type: 'vocabulary',
    level: 'B1',
    difficulty: 'intermediate',
    duration: 10,
    thumbnail: photos.dictionary,
    skills: ['Vocabulary'],
    practicePoints: ['Common phrasal verbs', 'Context usage'],
    categoryTags: ['vocabulary'],
    content: {
      word: 'give up',
      question: 'What does “give up” usually mean?',
      options: ['Stop trying', 'Start running', 'Buy something', 'Wake up'],
      correctIndex: 0,
      questions: [
        {
          question: '“Give up” usually means…',
          options: ['Stop trying', 'Start running', 'Buy something', 'Wake up'],
          correctIndex: 0,
          explanation: 'Give up = quit / stop trying.',
        },
        {
          question: '“Look after” means…',
          options: ['Take care of', 'Look for keys only', 'Look up a word', 'Look away'],
          correctIndex: 0,
        },
        {
          question: 'Please _____ the form before Friday.',
          options: ['fill in', 'fill under', 'fill off', 'fill away'],
          correctIndex: 0,
          explanation: 'Fill in a form = complete it.',
        },
        {
          question: 'The meeting was _____ until next week.',
          options: ['put off', 'put under', 'put eating', 'put sky'],
          correctIndex: 0,
          explanation: 'Put off = postpone.',
        },
        {
          question: 'I’ll _____ you tomorrow about the tickets.',
          options: ['call back', 'call under', 'call off to', 'call into pizza'],
          correctIndex: 0,
        },
        {
          question: '_____ the lights when you leave.',
          options: ['Turn off', 'Turn under', 'Turn of', 'Turn into'],
          correctIndex: 0,
        },
      ],
    },
  },
]

export function getActivityById(id: string): Activity | undefined {
  return activities.find((a) => a.id === id)
}

export function getActivitiesByType(type: ActivityType): Activity[] {
  return activities.filter((a) => a.type === type)
}

export function getTrendingActivities(): Activity[] {
  return activities.filter((a) => a.categoryTags?.includes('trending'))
}
