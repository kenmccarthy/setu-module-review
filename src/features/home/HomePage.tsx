import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Callout } from '../../components/fields'
import { reviewPath } from '../../components/layout/nav'
import { HOME } from '../../content/v2/home'
import type { ReviewKind } from '../../model/v2/schema'
import { downloadJson, libraryFileName } from '../../store/download'
import { libraryBundle } from '../../store/library'
import { useWorkspace } from '../../store/workspace'
import { ImportButton } from './ImportButton'
import { CLASSIC_URL, LegacyBanner } from './LegacyBanner'
import { saveSample } from './sample'

export function HomePage() {
  const entries = useWorkspace((s) => s.entries)
  const storage = useWorkspace((s) => s.storage)
  const refresh = useWorkspace((s) => s.refresh)
  const navigate = useNavigate()
  const [message, setMessage] = useState<{ text: string; tone: 'ok' | 'error' } | null>(null)

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">{HOME.title}</h1>
        <p className="max-w-3xl text-base text-slate-700">{HOME.subtitle}</p>
      </header>

      <LegacyBanner />

      <section aria-labelledby="questions" className="grid gap-4 sm:grid-cols-2">
        <h2 id="questions" className="sr-only">
          Guiding questions
        </h2>
        {HOME.questions.map((q) => (
          <blockquote
            key={q.label}
            className="rounded-lg border-l-4 border-brand-500 bg-white p-4 shadow-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">
              {q.label}
            </p>
            <p className="mt-1 text-sm text-slate-800">“{q.text}”</p>
          </blockquote>
        ))}
      </section>

      <section aria-labelledby="tools" className="space-y-3">
        <h2 id="tools" className="text-lg font-semibold">
          Choose a review
        </h2>
        <p className="max-w-3xl text-sm text-slate-700">{HOME.independence}</p>
        <div className="grid gap-4 md:grid-cols-2">
          <ToolCard kind="programme" />
          <ToolCard kind="module" />
        </div>
      </section>

      <section aria-labelledby="more" className="space-y-3">
        <h2 id="more" className="text-lg font-semibold">
          More options
        </h2>
        {message && (
          <p
            role={message.tone === 'error' ? 'alert' : 'status'}
            className={`rounded-md px-3 py-2 text-sm ${message.tone === 'error' ? 'bg-rose-50 text-rose-800' : 'bg-brand-50 text-brand-800'}`}
          >
            {message.text}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <ImportButton onMessage={(text, tone) => setMessage({ text, tone })} />
          <Button
            onClick={() => {
              const p = saveSample(storage)
              refresh()
              navigate(reviewPath('programme', p.id))
            }}
          >
            Explore sample
          </Button>
          <LinkButton to="/help">Help and guidance</LinkButton>
          <LinkButton to="/reviews">Saved reviews ({entries.length})</LinkButton>
          <Button
            disabled={!entries.length}
            onClick={() => downloadJson(libraryFileName(), libraryBundle(storage))}
            title="Download every review saved in this browser as one file"
          >
            Export data
          </Button>
        </div>
      </section>

      <Callout title="About these tools" tone="note">
        <p>{HOME.developmental}</p>
        <p>{HOME.data}</p>
        <p>
          The previous, single combined review remains available as the{' '}
          <a className="font-medium underline" href={CLASSIC_URL}>
            Classic tool
          </a>{' '}
          for comparison.
        </p>
      </Callout>
    </div>
  )
}

function ToolCard({ kind }: { kind: ReviewKind }) {
  const text = HOME[kind]
  const entries = useWorkspace((s) => s.entries).filter((e) => e.kind === kind)
  const createProgramme = useWorkspace((s) => s.createProgramme)
  const createModule = useWorkspace((s) => s.createModule)
  const navigate = useNavigate()
  const latest = entries[0]

  const start = () => {
    const r = kind === 'programme' ? createProgramme() : createModule()
    navigate(reviewPath(kind, r.id))
  }

  return (
    <article className="flex flex-col justify-between gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-slate-900">{text.title}</h3>
        <p className="text-sm text-slate-700">{text.body}</p>
        <p className="text-xs text-slate-500">{text.time}</p>
      </div>
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          <Button variant="primary" onClick={start}>
            {text.start}
          </Button>
          {latest && (
            <Button onClick={() => navigate(reviewPath(kind, latest.id))}>{text.continue}</Button>
          )}
        </div>
        {latest && (
          <p className="text-xs text-slate-500">
            Continue opens{' '}
            <span className="font-medium text-slate-700">
              {[latest.code, latest.title].filter(Boolean).join(' ') || 'your untitled review'}
            </span>
            .{' '}
            {entries.length > 1 && (
              <Link className="text-brand-700 underline" to="/reviews">
                See all {entries.length} saved {kind} reviews
              </Link>
            )}
          </p>
        )}
      </div>
    </article>
  )
}

export function LinkButton({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
    >
      {children}
    </Link>
  )
}
