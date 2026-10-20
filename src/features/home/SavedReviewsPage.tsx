import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, PageTitle } from '../../components/fields'
import { reviewPath } from '../../components/layout/nav'
import { kindLabel } from '../../components/layout/labels'
import type { ReviewKind } from '../../model/v2/schema'
import { downloadJson, libraryFileName, reviewFileName } from '../../store/download'
import { libraryBundle, loadReview, type IndexEntry } from '../../store/library'
import { useWorkspace } from '../../store/workspace'
import { ImportButton } from './ImportButton'

const entryTitle = (e: IndexEntry) =>
  [e.code, e.title].filter(Boolean).join(' ') ||
  (e.kind === 'programme' ? 'Untitled programme' : 'Untitled module')

export function SavedReviewsPage() {
  const entries = useWorkspace((s) => s.entries)
  const storage = useWorkspace((s) => s.storage)
  const [message, setMessage] = useState<{ text: string; tone: 'ok' | 'error' } | null>(null)

  return (
    <>
      <PageTitle
        title="Saved reviews"
        lede="Reviews saved in this browser. Programme and module reviews are kept separately, so opening or starting one never changes another."
      />
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
          disabled={!entries.length}
          onClick={() => downloadJson(libraryFileName(), libraryBundle(storage))}
        >
          Export all reviews
        </Button>
      </div>
      {(['programme', 'module'] as ReviewKind[]).map((kind) => (
        <ReviewList key={kind} kind={kind} entries={entries.filter((e) => e.kind === kind)} />
      ))}
    </>
  )
}

function ReviewList({ kind, entries }: { kind: ReviewKind; entries: IndexEntry[] }) {
  const storage = useWorkspace((s) => s.storage)
  const remove = useWorkspace((s) => s.remove)
  const navigate = useNavigate()
  return (
    <section
      aria-labelledby={`${kind}-list`}
      className="space-y-3 rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
    >
      <h2 id={`${kind}-list`} className="text-lg font-semibold">
        {kindLabel(kind)}s
      </h2>
      {entries.length === 0 ? (
        <p className="text-sm text-slate-600">
          No {kind} reviews are saved in this browser yet. You can start one from the home page.
        </p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {entries.map((e) => (
            <li key={e.id} className="flex flex-wrap items-center gap-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-slate-900">{entryTitle(e)}</p>
                <p className="text-xs text-slate-500">
                  <span className="mr-2 rounded bg-slate-100 px-1.5 py-0.5 font-medium text-slate-700">
                    {kindLabel(e.kind)}
                  </span>
                  {e.status === 'complete' ? 'Complete' : 'In progress'} · last changed{' '}
                  {new Date(e.updatedAt).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="primary" onClick={() => navigate(reviewPath(e.kind, e.id))}>
                  Open
                </Button>
                <Button
                  onClick={() => {
                    const r = loadReview(storage, e.id)
                    if (r) downloadJson(reviewFileName(r), r)
                  }}
                >
                  Export
                </Button>
                <Button
                  variant="danger"
                  onClick={() => {
                    if (
                      confirm(
                        `Delete “${entryTitle(e)}” from this browser? This cannot be undone. Export it first if you may need it.`,
                      )
                    )
                      remove(e.id)
                  }}
                >
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
