import { useNavigate } from 'react-router-dom'
import {
  ActivityPlayer,
  ChoiceList,
  FeedbackBanner,
  useQuiz,
} from '@/components/activities/ActivityPlayer'
import { MultiQuestionQuiz, youtubeEmbedUrl, type QuizQuestion } from '@/components/activities/engine/MultiQuestionQuiz'
import type { EngineActivityProps } from '@/components/activities/engine/types'
import type { MediaQuizContent } from '@/types/activity'

const DEFAULT_MUSIC_EMBED = 'https://www.youtube-nocookie.com/embed/jfKfPfyJRdk'
const DEFAULT_VIDEO_EMBED = 'https://www.youtube-nocookie.com/embed/M7lc1UVf-VE'

function mediaQuestions(content: MediaQuizContent, fallback: QuizQuestion[]): QuizQuestion[] {
  if (content.questions?.length) return content.questions
  if (content.options?.length) {
    return [
      {
        question: content.prompt ?? 'What is the main idea?',
        options: content.options,
        correctIndex: content.correctIndex ?? 0,
      },
    ]
  }
  return fallback
}

export function MusicActivity({ activity, onComplete, onBack }: EngineActivityProps) {
  const navigate = useNavigate()
  const content = (activity.content ?? {}) as MediaQuizContent
  const embed = youtubeEmbedUrl(content.embedUrl, DEFAULT_MUSIC_EMBED)
  const questions = mediaQuestions(content, [
    {
      question: 'What helps you learn from a song?',
      options: [
        'Listening for repeated words and meaning',
        'Ignoring the lyrics',
        'Only reading the title',
        'Muting the audio',
      ],
      correctIndex: 0,
      explanation: 'Focus on lyrics and repeated phrases.',
    },
    {
      question: 'A chorus is usually…',
      options: ['The repeated main part', 'Only the intro', 'A grammar rule', 'A dictionary'],
      correctIndex: 0,
    },
    {
      question: '“Feel” in lyrics often means…',
      options: ['An emotion', 'A suitcase', 'A number', 'A city'],
      correctIndex: 0,
    },
    {
      question: 'To practice pronunciation with music, you should…',
      options: ['Sing along slowly', 'Never open your mouth', 'Only read once', 'Skip the audio'],
      correctIndex: 0,
    },
    {
      question: 'Vocabulary from songs is useful because…',
      options: ['It is used in real life', 'It is never spoken', 'It replaces grammar', 'It is only poetry'],
      correctIndex: 0,
    },
    {
      question: 'A verse usually…',
      options: ['Tells part of the story', 'Is always silent', 'Has no words', 'Is the video title'],
      correctIndex: 0,
    },
    {
      question: 'If you miss a word, you can…',
      options: ['Replay that part', 'Close the activity', 'Guess forever without listening', 'Delete the song'],
      correctIndex: 0,
    },
    {
      question: 'Rhythm helps with…',
      options: ['Natural stress and fluency', 'Math only', 'Passports', 'Wi-Fi passwords'],
      correctIndex: 0,
    },
    {
      question: 'Learning songs can improve…',
      options: ['Listening and vocabulary', 'Only typing speed', 'Only drawing', 'Only math'],
      correctIndex: 0,
    },
    {
      question: 'Before answering quiz items, first…',
      options: ['Listen carefully', 'Skip the media', 'Close your eyes forever', 'Ignore the lyrics'],
      correctIndex: 0,
    },
  ])

  return (
    <MultiQuestionQuiz
      activity={activity}
      questions={questions}
      onComplete={onComplete}
      onBack={onBack ?? (() => navigate(-1))}
      header={
        <div className="mb-6 overflow-hidden rounded-2xl border border-white/10 bg-black/40">
          <iframe
            title={activity.title}
            src={embed}
            className="aspect-video w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
          <p className="p-3 text-xs text-white/45">Music practice · YouTube embed</p>
        </div>
      }
    />
  )
}

export function VideoActivity({ activity, onComplete, onBack }: EngineActivityProps) {
  const navigate = useNavigate()
  const content = (activity.content ?? {}) as MediaQuizContent
  const embed = youtubeEmbedUrl(content.embedUrl, DEFAULT_VIDEO_EMBED)
  const questions = mediaQuestions(content, [
    {
      question: 'What should you do first?',
      options: ['Watch for the main idea', 'Skip the video', 'Close the tab', 'Mute forever'],
      correctIndex: 0,
    },
    {
      question: 'Subtitles can help you…',
      options: ['Connect sound and spelling', 'Avoid English', 'Stop listening', 'Delete audio'],
      correctIndex: 0,
    },
    {
      question: 'A good viewing strategy is…',
      options: ['Watch once for gist, then details', 'Never rewind', 'Only read comments', 'Ignore visuals'],
      correctIndex: 0,
    },
    {
      question: 'Body language in videos can show…',
      options: ['Attitude and emotion', 'Wi-Fi speed', 'Battery %', 'File size'],
      correctIndex: 0,
    },
    {
      question: 'If speech is fast, you can…',
      options: ['Slow playback and replay', 'Give up immediately', 'Turn off the screen', 'Skip all questions'],
      correctIndex: 0,
    },
    {
      question: 'Key vocabulary often appears…',
      options: ['More than once', 'Never', 'Only in the title', 'Only in ads'],
      correctIndex: 0,
    },
    {
      question: 'Taking short notes while watching helps…',
      options: ['Memory and answers', 'Nothing', 'Only drawing', 'Deleting words'],
      correctIndex: 0,
    },
    {
      question: 'The speaker’s purpose might be to…',
      options: ['Inform, persuade, or entertain', 'Hide English', 'Stop learning', 'Break the player'],
      correctIndex: 0,
    },
    {
      question: 'After watching, check…',
      options: ['What you understood', 'Only the thumbnail', 'Only the URL', 'Nothing'],
      correctIndex: 0,
    },
    {
      question: 'A follow-up question tests…',
      options: ['Comprehension', 'Your phone brand', 'Keyboard color', 'Desk height'],
      correctIndex: 0,
    },
  ])

  return (
    <MultiQuestionQuiz
      activity={activity}
      questions={questions}
      onComplete={onComplete}
      onBack={onBack ?? (() => navigate(-1))}
      header={
        <div className="mb-6 overflow-hidden rounded-2xl border border-white/10 bg-black/40">
          <iframe
            title={activity.title}
            src={embed}
            className="aspect-video w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
          <p className="p-3 text-xs text-white/45">Video practice · YouTube embed</p>
        </div>
      }
    />
  )
}

/** Lightweight fallback used only if SkillActivities GameActivity is not preferred */
export function SimpleGameQuiz({ activity, onComplete, onBack }: EngineActivityProps) {
  const navigate = useNavigate()
  const quiz = useQuiz(0)
  return (
    <ActivityPlayer
      activity={activity}
      step={1}
      totalSteps={1}
      onBack={onBack ?? (() => navigate(-1))}
    >
      <p className="text-lg font-medium text-white">Quick check</p>
      <ChoiceList
        options={['Practice makes progress', 'Never practice', 'Delete English', 'Skip forever']}
        value={quiz.selected}
        onChange={quiz.setSelected}
        disabled={quiz.checked}
      />
      {!quiz.checked ? (
        <button
          type="button"
          onClick={() => {
            quiz.check()
            onComplete?.({
              answer: { selected: quiz.selected },
              score: quiz.selected === 0 ? 100 : 0,
            })
          }}
          className="mt-4 rounded-full bg-cobalt px-5 py-2.5 text-sm font-bold uppercase text-white"
        >
          Check
        </button>
      ) : (
        <FeedbackBanner correct={quiz.correct} message="Keep practicing!" />
      )}
    </ActivityPlayer>
  )
}
