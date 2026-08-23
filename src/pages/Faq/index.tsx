import { type FormEvent, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { brand } from '@/data/brand'

const STORAGE_KEY = 'wae_faq_questions'

type SavedQuestion = {
  id: string
  name: string
  email: string
  question: string
  createdAt: string
}

const faqs = [
  {
    q: 'What is WE ARE ENGLISH?',
    a: 'WE ARE ENGLISH is an interactive learning platform where you practice real English skills — listening, writing, reading, grammar, vocabulary, music, video and games — with clear CEFR levels and instant feedback.',
  },
  {
    q: 'Do I need an account to practice?',
    a: 'You can explore the home catalog as a guest. To start activities, save scores, continue where you left off, and track progress, create a free account and sign in.',
  },
  {
    q: 'How is my progress saved?',
    a: 'Each finished activity stores a score and completion time. Open Progress to see overall score, skill breakdown, streak, practice time, and a full activity history. Incomplete sessions appear under Continue Learning on Home.',
  },
  {
    q: 'Which levels can I study?',
    a: 'Activities cover CEFR levels A1–C2. On Activities, filter by skill, level, difficulty and duration to match your goals.',
  },
  {
    q: 'Are music and video lessons free?',
    a: 'Yes. Music and video practice activities are part of the free catalog. You need internet access for YouTube embeds to load.',
  },
  {
    q: 'What is fill-in-the-blank vs writing?',
    a: 'Fill-in-the-blank (Cambridge-style) checks exact words in sentences. Writing activities ask for free text and give length and feedback-based scores.',
  },
  {
    q: 'How do Favorites work?',
    a: 'While signed in, tap Favorite on an activity detail page. Your list lives under Favorites in the main menu so you can reopen them quickly.',
  },
  {
    q: 'I found a bug or need help. What should I do?',
    a: 'Use the form below to send a question, or email support@weareenglish.com. You can also follow us on Instagram @weare__english for tips and updates.',
  },
]

function readSaved(): SavedQuestion[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as SavedQuestion[]
  } catch {
    return []
  }
}

export function FaqPage() {
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.q ?? null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [question, setQuestion] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [mine, setMine] = useState<SavedQuestion[]>([])

  useEffect(() => {
    setMine(readSaved())
  }, [])

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSent(false)
    if (!name.trim() || !email.trim() || !question.trim()) {
      setError('Please fill in your name, email and question.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.')
      return
    }

    const entry: SavedQuestion = {
      id: crypto.randomUUID(),
      name: name.trim(),
      email: email.trim(),
      question: question.trim(),
      createdAt: new Date().toISOString(),
    }
    const next = [entry, ...readSaved()].slice(0, 20)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    setMine(next)
    setSent(true)
    setQuestion('')

    const subject = encodeURIComponent(`WE ARE ENGLISH FAQ: ${entry.name}`)
    const body = encodeURIComponent(
      `Name: ${entry.name}\nEmail: ${entry.email}\n\nQuestion:\n${entry.question}`,
    )
    window.open(`mailto:support@weareenglish.com?subject=${subject}&body=${body}`, '_blank')
  }

  return (
    <div className="container-wide px-4 py-12 sm:px-6 sm:py-16">
      <Link to="/" className="text-sm text-fg-muted hover:text-fg">
        ← Home
      </Link>
      <h1 className="mt-4 display text-4xl text-fg sm:text-5xl">FAQ</h1>
      <p className="mt-3 max-w-2xl text-fg-muted">
        Answers about how {brand.name} works — accounts, progress, activities and support.
      </p>

      <ul className="mt-10 space-y-3">
        {faqs.map((item) => {
          const open = openId === item.q
          return (
            <li key={item.q} className="overflow-hidden rounded-2xl border border-edge bg-panel">
              <button
                type="button"
                onClick={() => setOpenId(open ? null : item.q)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              >
                <span className="font-semibold text-fg">{item.q}</span>
                <span className="text-fg-muted">{open ? '−' : '+'}</span>
              </button>
              {open ? (
                <p className="border-t border-edge px-5 py-4 text-sm leading-relaxed text-fg-muted sm:text-base">
                  {item.a}
                </p>
              ) : null}
            </li>
          )
        })}
      </ul>

      <section className="mt-14 rounded-3xl border border-edge bg-panel p-6 sm:p-8">
        <h2 className="display text-2xl text-fg sm:text-3xl">Ask a question</h2>
        <p className="mt-2 text-sm text-fg-muted">
          Send us a question about the platform. We’ll store it on this device and open your email
          client so you can send it to our support team.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label className="block space-y-1.5 text-xs font-semibold uppercase tracking-wider text-fg-muted">
            Name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="field"
              placeholder="Your name"
              autoComplete="name"
            />
          </label>
          <label className="block space-y-1.5 text-xs font-semibold uppercase tracking-wider text-fg-muted">
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="field"
              placeholder="you@email.com"
              autoComplete="email"
            />
          </label>
          <label className="block space-y-1.5 text-xs font-semibold uppercase tracking-wider text-fg-muted">
            Question
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="field min-h-[120px] resize-y"
              placeholder="How can we help?"
              rows={4}
            />
          </label>
          {error ? <p className="text-sm text-cherry">{error}</p> : null}
          {sent ? (
            <p className="text-sm text-cobalt">
              Question saved. If your email app opened, send the message to finish contacting us.
            </p>
          ) : null}
          <button
            type="submit"
            className="rounded-full bg-cherry px-6 py-3 text-sm font-bold uppercase tracking-wide text-white"
          >
            Submit question
          </button>
        </form>

        {mine.length > 0 ? (
          <div className="mt-10 space-y-3 border-t border-edge pt-8">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-fg-muted">
              Your recent questions
            </h3>
            <ul className="space-y-3">
              {mine.slice(0, 5).map((q) => (
                <li key={q.id} className="rounded-xl border border-edge bg-surface px-4 py-3">
                  <p className="text-sm font-medium text-fg">{q.question}</p>
                  <p className="mt-1 text-xs text-fg-muted">
                    {q.name} · {new Date(q.createdAt).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>
    </div>
  )
}
