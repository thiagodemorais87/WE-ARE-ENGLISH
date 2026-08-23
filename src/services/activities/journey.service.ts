import { flatJourneyNodes, learningPath, type JourneyNode } from '@/data/learning-path'
import { getActivityFromDb } from '@/services/activities/activity.repository'
import { listAttemptsForUser } from '@/services/activities/attempt.service'
import type { Activity, ActivityAttempt, ActivityType } from '@/types/activity'

export type NodeStatus = 'done' | 'current' | 'pending'

export type JourneyNodeState = JourneyNode & {
  status: NodeStatus
}

export type JourneyLevelState = {
  level: string
  label: string
  nodes: JourneyNodeState[]
}

export type JourneyProgress = {
  levels: JourneyLevelState[]
  current: JourneyNodeState | null
  completedCount: number
  totalCount: number
}

function matchesNode(activity: Activity, node: JourneyNode): boolean {
  if (activity.level !== node.level) return false
  if (!node.skill) return true
  // speaking nodes also accept listening at same level (more practice coverage)
  if (node.skill === 'speaking') {
    return activity.type === 'speaking' || activity.type === 'listening' || activity.type === 'pronunciation'
  }
  return activity.type === node.skill
}

async function completedActivitiesForUser(
  userId: string,
): Promise<Activity[]> {
  const attempts = await listAttemptsForUser(userId)
  const completed = attempts.filter((a) => a.completedAt)
  const byId = new Map<string, ActivityAttempt>()
  for (const a of completed) {
    if (!byId.has(a.activityId)) byId.set(a.activityId, a)
  }
  const activities: Activity[] = []
  for (const id of byId.keys()) {
    const act = await getActivityFromDb(id)
    if (act) activities.push(act)
  }
  return activities
}

export function evaluateJourney(
  completedActivities: Activity[],
): JourneyProgress {
  const doneIds = new Set<string>()
  for (const node of flatJourneyNodes) {
    if (completedActivities.some((a) => matchesNode(a, node))) {
      doneIds.add(node.id)
    }
  }

  let currentId: string | null = null
  for (const node of flatJourneyNodes) {
    if (!doneIds.has(node.id)) {
      currentId = node.id
      break
    }
  }
  if (!currentId && flatJourneyNodes.length) {
    currentId = flatJourneyNodes[flatJourneyNodes.length - 1]!.id
  }

  const levels: JourneyLevelState[] = learningPath.map((block) => ({
    level: block.level,
    label: block.label,
    nodes: block.nodes.map((node) => {
      let status: NodeStatus = 'pending'
      if (doneIds.has(node.id)) status = 'done'
      else if (node.id === currentId) status = 'current'
      // If all done, last node shows as done AND current highlight via status done
      if (doneIds.size === flatJourneyNodes.length && node.id === currentId) {
        status = 'done'
      }
      return { ...node, status }
    }),
  }))

  // Mark current on first pending; if all done, mark last as current visually
  let current: JourneyNodeState | null = null
  for (const level of levels) {
    for (const node of level.nodes) {
      if (node.status === 'current') current = node
    }
  }
  if (!current && levels.length) {
    const lastBlock = levels[levels.length - 1]!
    const last = lastBlock.nodes[lastBlock.nodes.length - 1]
    if (last) {
      last.status = 'current'
      current = last
    }
  }

  return {
    levels,
    current,
    completedCount: doneIds.size,
    totalCount: flatJourneyNodes.length,
  }
}

export async function fetchJourneyProgress(userId: string): Promise<JourneyProgress> {
  const completed = await completedActivitiesForUser(userId)
  return evaluateJourney(completed)
}

export function continuePathHref(node: JourneyNode | null): string {
  if (!node) return '/activities'
  const params = new URLSearchParams()
  params.set('level', node.level)
  if (node.skill) {
    const skill: ActivityType =
      node.skill === 'speaking' ? 'listening' : node.skill
    params.set('skill', skill)
  }
  return `/activities?${params.toString()}`
}
