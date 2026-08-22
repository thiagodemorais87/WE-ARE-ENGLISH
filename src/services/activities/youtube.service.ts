import type { TranscriptLine } from '@/types/activity'

/** Stub for future YouTube / video transcript APIs. */
export async function fetchVideoTranscript(_videoId?: string): Promise<TranscriptLine[]> {
  return [
    { start: 0, end: 3.2, text: 'I went to New York last summer' },
    { start: 3.2, end: 6.5, text: 'and stayed there for two weeks.' },
    { start: 6.5, end: 10, text: 'It was an amazing experience.' },
  ]
}

export async function getEmbedPlaceholder(title: string): Promise<{ title: string; ready: false }> {
  return { title, ready: false }
}
