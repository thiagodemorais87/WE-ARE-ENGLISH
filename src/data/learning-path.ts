import type { ActivityLevel, ActivityType } from '@/types/activity'

export type JourneyNode = {
  id: string
  level: ActivityLevel
  title: string
  skill?: ActivityType
  description?: string
}

export type JourneyLevelBlock = {
  level: ActivityLevel
  label: string
  nodes: JourneyNode[]
}

/** Static curriculum A1–B1 for Your English Journey. */
export const learningPath: JourneyLevelBlock[] = [
  {
    level: 'A1',
    label: 'LEVEL A1',
    nodes: [
      {
        id: 'a1-intros',
        level: 'A1',
        title: 'Basic introductions',
        skill: 'speaking',
        description: 'Say hello and talk about yourself',
      },
      {
        id: 'a1-vocab',
        level: 'A1',
        title: 'Daily vocabulary',
        skill: 'vocabulary',
        description: 'Everyday words and phrases',
      },
      {
        id: 'a1-numbers',
        level: 'A1',
        title: 'Numbers & time',
        skill: 'listening',
        description: 'Count, tell the time, understand prices',
      },
      {
        id: 'a1-present',
        level: 'A1',
        title: 'Present Simple',
        skill: 'grammar',
        description: 'Routines and facts with Present Simple',
      },
    ],
  },
  {
    level: 'A2',
    label: 'LEVEL A2',
    nodes: [
      {
        id: 'a2-conversations',
        level: 'A2',
        title: 'Daily conversations',
        skill: 'listening',
        description: 'Short dialogues for everyday life',
      },
      {
        id: 'a2-travel',
        level: 'A2',
        title: 'Travel English',
        skill: 'vocabulary',
        description: 'Airport, hotel and directions',
      },
      {
        id: 'a2-past',
        level: 'A2',
        title: 'Past Simple',
        skill: 'grammar',
        description: 'Talk about what happened yesterday',
      },
    ],
  },
  {
    level: 'B1',
    label: 'LEVEL B1',
    nodes: [
      {
        id: 'b1-real',
        level: 'B1',
        title: 'Real conversations',
        skill: 'listening',
        description: 'Longer, more natural dialogues',
      },
      {
        id: 'b1-work',
        level: 'B1',
        title: 'Work English',
        skill: 'vocabulary',
        description: 'Meetings, emails and office language',
      },
      {
        id: 'b1-story',
        level: 'B1',
        title: 'Storytelling',
        skill: 'writing',
        description: 'Narrate events with clearer structure',
      },
    ],
  },
]

export const flatJourneyNodes: JourneyNode[] = learningPath.flatMap((b) => b.nodes)
