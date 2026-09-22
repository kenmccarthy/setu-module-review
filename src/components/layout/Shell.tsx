import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useReviewStore } from '../../store/reviewStore'
import { downloadReview, parseReviewJson, readFileText } from '../../store/io'
import { NAV } from './nav'
import { Button } from '../fields'

/** The badge beside a nav item is a section number, not a count. */
const sectionLabel = (number: string) => `Section${number.includes('–') ? 's' : ''} ${number}`

export function Shell() {
  const review = useReviewStore((s) => s.review)
  const started = useReviewStore((s) => s.started)
  const load = useReviewStore((s) => s.load)
  const reset = useReviewStore((s) => s.reset)
  const navigate = useNavigate()
  const location = useLocation()
  const fileRef = useRef<HTMLInputElement>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    if (!notice) return
    const t = setTimeout(() => setNotice(null), 5000)
    return () => clearTimeout(t)
  }, [notice])

  const onImport = async (file: File | undefined) => {
    if (!file) return
    const result = parseReviewJson(await readFileText(file))
    if (!result.ok) {
      setNotice(result.error)
      return
    }
    if (
      started &&
      !confirm('Importing will replace the review currently in this browser. Continue?')
    )
      return
    load(result.review)
    setNotice('Review imported.')
    navigate('/programme/context')
  }

  const onNew = () => {
    if (
      started &&
      !confirm(
        'Start a new review? The current review will be cleared from this browser. Export it first if you want to keep it.',
      )
    )
      return
    reset()
    navigate('/')
  }

  const modules = review.modules
  const isPrint = location.pathname === '/print'

  return (
    <div className="min-h-screen lg:flex">
      <aside
        className={`no-print fixed inset-y-0 left-0 z-30 w-72 overflow-y-auto border-r border-slate-200 bg-white transition-transform lg:static lg:translate-x-0 ${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="border-b border-slate-200 px-4 py-4">
          <NavLink to="/" className="block">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">SETU</p>
            <p className="text-base font-bold leading-tight text-slate-900">
              AI Programme & Module Review
            </p>
          </NavLink>
          {review.programme.title && (
            <p className="mt-2 truncate text-sm text-slate-600" title={review.programme.title}>
              {review.programme.title}
            </p>
          )}
        </div>
        <nav className="space-y-5 px-3 py-4" onClick={() => setMenuOpen(false)}>
          {NAV.map((group) => (
            <div key={group.label}>
              <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                {group.label}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.to === '/statement' || item.to === '/modules'}
                      className={({ isActive }) =>
                        `flex items-center gap-2 rounded-md px-2 py-1.5 text-sm ${
                          isActive
                            ? 'bg-brand-50 font-medium text-brand-700'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`
                      }
                    >
                      {item.number && (
                        <span
                          className="w-8 shrink-0 text-xs text-slate-400"
                          title={sectionLabel(item.number)}
                          aria-label={sectionLabel(item.number)}
                        >
                          {item.number}
                        </span>
                      )}
                      <span>{item.label}</span>
                    </NavLink>
                    {item.to === '/modules' && modules.length > 0 && (
                      <ul className="ml-10 mt-0.5 space-y-0.5 border-l border-slate-200 pl-2">
                        {modules.map((m) => (
                          <li key={m.id}>
                            <NavLink
                              to={`/modules/${m.id}`}
                              className={({ isActive }) =>
                                `block truncate rounded px-2 py-1 text-xs ${
                                  isActive
                                    ? 'text-brand-700 font-medium'
                                    : 'text-slate-600 hover:bg-slate-100'
                                }`
                              }
                            >
                              {m.code ? `${m.code} ` : ''}
                              {m.title || 'Untitled module'}
                            </NavLink>
                          </li>
                        ))}
                      </ul>
                    )}
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
          <p className="min-w-0 flex-1 truncate text-xs text-slate-500">
            {started ? (
              <>
                Autosaved in this browser · last change{' '}
                {new Date(review.updatedAt).toLocaleString()}
              </>
            ) : (
              'No review started'
            )}
          </p>
          {notice && (
            <p role="status" className="hidden text-xs text-brand-700 sm:block">
              {notice}
            </p>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              void onImport(e.target.files?.[0])
              e.target.value = ''
            }}
          />
          <Button onClick={() => fileRef.current?.click()}>Import</Button>
          <Button onClick={() => downloadReview(review)} disabled={!started}>
            Export
          </Button>
          <Button onClick={onNew} variant="ghost">
            New
          </Button>
        </header>
        {notice && (
          <p role="status" className="bg-brand-50 px-4 py-2 text-xs text-brand-800 sm:hidden">
            {notice}
          </p>
        )}
        <main className={isPrint ? 'flex-1' : 'flex-1 px-4 py-6 sm:px-6 lg:px-8'}>
          <div className={isPrint ? '' : 'mx-auto max-w-5xl space-y-6'}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
