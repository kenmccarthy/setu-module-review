import { useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useMatch } from 'react-router-dom'
import { useWorkspace } from '../../store/workspace'
import { downloadJson, reviewFileName } from '../../store/download'
import { kindLabel, reviewTitle } from './labels'
import { navFor } from './nav'
import { programmeProgress } from '../../logic/v2/programmeSummary'
import { moduleProgress } from '../../logic/v2/moduleSummary'
import { Button } from '../fields'

export function Shell() {
  const match = useMatch('/:kind/:reviewId/*')
  const current = useWorkspace((s) => s.current)
  const persistent = useWorkspace((s) => s.persistent)
  const entries = useWorkspace((s) => s.entries)
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const inReview =
    match && current && current.id === match.params.reviewId && current.kind === match.params.kind
      ? current
      : null
  const nav = navFor(
    inReview?.kind,
    inReview?.id,
    !inReview
      ? {}
      : inReview.kind === 'programme'
        ? programmeProgress(inReview)
        : moduleProgress(inReview),
  )
  const isPrint = location.pathname.endsWith('/print')

  return (
    <div className="min-h-screen lg:flex">
      <a
        href="#main"
        onClick={(e) => {
          // Hash routing: move focus to the content rather than changing the route.
          e.preventDefault()
          document.getElementById('main')?.focus()
        }}
        className="no-print sr-only z-50 rounded-md bg-white px-3 py-2 text-sm font-medium text-brand-700 shadow focus:not-sr-only focus:fixed focus:left-2 focus:top-2"
      >
        Skip to content
      </a>
      <aside
        className={`no-print fixed inset-y-0 left-0 z-30 w-72 overflow-y-auto border-r border-slate-200 bg-white transition-transform lg:static lg:translate-x-0 ${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="border-b border-slate-200 px-4 py-4">
          <Link to="/" className="block">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">SETU</p>
            <p className="text-base font-bold leading-tight text-slate-900">
              AI Integration Review
            </p>
          </Link>
          {inReview && (
            <div className="mt-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                {kindLabel(inReview.kind)}
              </p>
              <p className="truncate text-sm text-slate-700" title={reviewTitle(inReview)}>
                {reviewTitle(inReview)}
              </p>
            </div>
          )}
        </div>
        <nav aria-label="Main" className="space-y-5 px-3 py-4" onClick={() => setMenuOpen(false)}>
          {nav.map((group, gi) => (
            <div key={group.label || gi}>
              {group.label && (
                <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  {group.label}
                </p>
              )}
              <ul className="space-y-0.5">
                {group.items.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end
                      className={({ isActive }) =>
                        `flex items-center gap-2 rounded-md px-2 py-1.5 text-sm ${
                          isActive
                            ? 'bg-brand-50 font-medium text-brand-700'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`
                      }
                    >
                      {item.number && (
                        <span className="w-5 shrink-0 text-xs text-slate-400" aria-hidden="true">
                          {item.number}
                        </span>
                      )}
                      <span>
                        {item.number && <span className="sr-only">Section {item.number}: </span>}
                        {item.label}
                      </span>
                      {item.done && (
                        <span className="ml-auto text-xs text-brand-600">
                          <span aria-hidden="true">✓</span>
                          <span className="sr-only"> (answered)</span>
                        </span>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
      {menuOpen && (
        <button
          aria-label="Close menu"
          className="fixed inset-0 z-20 bg-slate-900/30 lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="no-print sticky top-0 z-10 flex items-center gap-3 border-b border-slate-200 bg-white/95 px-4 py-2 backdrop-blur">
          <button
            className="rounded-md border border-slate-300 px-2 py-1 text-sm lg:hidden"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            ☰
          </button>
          <p className="min-w-0 flex-1 truncate text-xs text-slate-500" aria-live="polite">
            {!inReview
              ? ''
              : !entries.some((e) => e.id === inReview.id)
                ? 'Not saved yet: the review is saved as soon as you enter something'
                : `${persistent ? 'Saved in this browser' : 'Not saved: this browser is blocking storage'} · last change ${new Date(inReview.updatedAt).toLocaleString()}`}
          </p>
          {inReview && (
            <Button onClick={() => downloadJson(reviewFileName(inReview), inReview)}>
              Export review
            </Button>
          )}
          <Link
            to="/"
            className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            Home
          </Link>
        </header>
        {!persistent && (
          <p role="alert" className="no-print bg-amber-50 px-4 py-2 text-sm text-amber-900">
            This browser is blocking local storage, so your work will be lost when you close this
            tab. Export your review before leaving.
          </p>
        )}
        <main
          id="main"
          tabIndex={-1}
          className={
            isPrint ? 'flex-1 outline-none' : 'flex-1 px-4 py-6 outline-none sm:px-6 lg:px-8'
          }
        >
          <div className={isPrint ? '' : 'mx-auto max-w-5xl space-y-6'}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
