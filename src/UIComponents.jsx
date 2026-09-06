import { useState } from 'react'

export function LeafMark({ className = 'h-8 w-8' }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="#2F5D50" />
      <path
        d="M16 7.5c-3.2 3.4-7.5 6.8-7.5 11.2A7.5 7.5 0 0 0 16 26a7.5 7.5 0 0 0 7.5-7.3C23.5 14.3 19.2 10.9 16 7.5Z"
        fill="#E8C07A"
      />
    </svg>
  )
}

export function Logo({ onClick }) {
  return (
    <button type="button" onClick={onClick} className="flex items-center gap-2.5 text-left">
      <LeafMark className="h-9 w-9" />
      <div>
        <p className="font-serif text-lg font-semibold leading-tight text-[#1f3d36]">Ayush Connect</p>
        <p className="text-[11px] uppercase tracking-[0.18em] text-[#6b7c76]">Academia × Industry</p>
      </div>
    </button>
  )
}

export function BackButton({ onClick, label = 'Back' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-xl border border-[#d9d1c3] bg-white px-4 py-2 text-sm font-semibold text-[#1f3d36] transition hover:bg-[#e8f0ec]"
    >
      ← {label}
    </button>
  )
}

export function Shell({ children, onHome, onBack, backLabel, right }) {
  return (
    <div className="min-h-screen bg-[#f4f1ea]">
      <header className="border-b border-[#e4ddd0] bg-[#faf8f3]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-4">
            <Logo onClick={onHome} />
            {onBack ? <BackButton onClick={onBack} label={backLabel} /> : null}
          </div>
          {right}
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  )
}

export function LoginCard({ title, subtitle, onSubmit, onBack, accent }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-[#e4ddd0] bg-white p-8 shadow-[0_20px_50px_-28px_rgba(47,93,80,0.45)]">
      <h2 className="font-serif text-3xl text-[#1f3d36]">{title}</h2>
      <p className="mt-2 text-sm text-[#5c6b66]">{subtitle}</p>
      <form
        className="mt-8 space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          onSubmit({ email, password })
        }}
      >
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-[#3d4f4a]">Email ID</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@college.edu"
            className="w-full rounded-xl border border-[#d9d1c3] bg-[#faf8f3] px-3 py-2.5 outline-none ring-[#2F5D50] focus:ring-2"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-[#3d4f4a]">Password</span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-xl border border-[#d9d1c3] bg-[#faf8f3] px-3 py-2.5 outline-none ring-[#2F5D50] focus:ring-2"
          />
        </label>
        <button
          type="submit"
          className={`mt-2 w-full rounded-xl py-3 font-semibold text-white transition ${accent}`}
        >
          Login
        </button>
      </form>
      <button type="button" onClick={onBack} className="mt-4 w-full text-sm text-[#6b7c76] hover:text-[#1f3d36]">
        ← Back to home
      </button>
    </div>
  )
}

export function Quiz({ title, questions, onFinish, onCancel, initialAnswers = [] }) {
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState(initialAnswers)
  const current = questions[index]
  const selected = answers[index]

  return (
    <div className="mx-auto max-w-2xl">
      <p className="text-sm font-medium uppercase tracking-widest text-[#8a6a2a]">
        Question {index + 1} of {questions.length}
      </p>
      <h2 className="mt-2 font-serif text-3xl text-[#1f3d36]">{title}</h2>
      <div className="mt-8 rounded-2xl border border-[#e4ddd0] bg-white p-6">
        <p className="text-lg font-medium text-[#243833]">{current.q}</p>
        <div className="mt-5 space-y-3">
          {current.options.map((option, i) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                const next = [...answers]
                next[index] = i
                setAnswers(next)
              }}
              className={`block w-full rounded-xl border px-4 py-3 text-left transition ${
                selected === i
                  ? 'border-[#2F5D50] bg-[#e8f0ec] text-[#1f3d36]'
                  : 'border-[#e4ddd0] bg-[#faf8f3] hover:border-[#c9bfae]'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
        <div className="mt-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={index === 0}
              onClick={() => setIndex((n) => Math.max(0, n - 1))}
              className="rounded-xl border border-[#d9d1c3] bg-white px-4 py-2 text-sm font-semibold text-[#1f3d36] disabled:opacity-40"
            >
              ← Back
            </button>
            <button type="button" onClick={onCancel} className="text-sm text-[#6b7c76]">
              Exit test
            </button>
          </div>
          <button
            type="button"
            disabled={selected === undefined}
            onClick={() => {
              if (index + 1 < questions.length) setIndex(index + 1)
              else onFinish(answers)
            }}
            className="rounded-xl bg-[#2F5D50] px-5 py-2.5 font-semibold text-white disabled:opacity-40"
          >
            {index + 1 < questions.length ? 'Next' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  )
}

export function ResponseList({ title, questions, result }) {
  if (!result?.answers) return null
  return (
    <div className="mt-4">
      <h4 className="text-sm font-semibold text-[#1f3d36]">{title}</h4>
      <ol className="mt-2 space-y-3">
        {questions.map((item, i) => {
          const chosen = result.answers[i]
          const ok = chosen === item.answer
          return (
            <li key={item.q} className="rounded-xl border border-[#e4ddd0] bg-white p-3 text-sm">
              <p className="font-medium text-[#243833]">
                {i + 1}. {item.q}
              </p>
              <p className={`mt-1 ${ok ? 'text-[#2F5D50]' : 'text-rose-700'}`}>
                Your answer: {chosen === undefined ? 'Not answered' : item.options[chosen]}
                {ok ? ' · Correct' : ' · Incorrect'}
              </p>
              {!ok && chosen !== undefined ? (
                <p className="mt-0.5 text-[#5c6b66]">Correct: {item.options[item.answer]}</p>
              ) : null}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
