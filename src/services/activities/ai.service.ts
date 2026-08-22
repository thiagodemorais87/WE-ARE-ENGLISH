/** Stub for future AI writing feedback and activity generation. */

export type WritingScores = {
  grammar: number
  vocabulary: number
  structure: number
  feedback: string
}

export async function scoreWriting(_text: string): Promise<WritingScores> {
  await new Promise((r) => setTimeout(r, 600))
  return {
    grammar: 82,
    vocabulary: 75,
    structure: 88,
    feedback: 'Your answer has been submitted. Keep practicing linking words for even clearer structure.',
  }
}

export async function generateActivityPrompt(topic: string): Promise<{ prompt: string }> {
  return {
    prompt: `Create a practice session about ${topic}. (Mock — connect an AI API later.)`,
  }
}
