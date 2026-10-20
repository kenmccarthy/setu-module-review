import { Link, useParams } from 'react-router-dom'
import { MODULE_SECTIONS, PROGRAMME_SECTIONS, reviewPath } from '../../components/layout/nav'
import type { ReviewKind } from '../../model/v2/schema'

/** Previous / next links between the sections of a review, with "Step n of N" progress. */
export function SectionPager({ kind, section }: { kind: ReviewKind; section: string }) {
  const { reviewId = '' } = useParams()
  const sections = kind === 'programme' ? PROGRAMME_SECTIONS : MODULE_SECTIONS
  const i = sections.findIndex((s) => s.id === section)
  if (i < 0) return null
  const prev = sections[i - 1]
  const next = sections[i + 1]
  const link = 'rounded-md border px-3 py-1.5 text-sm font-medium shadow-sm'
  const secondary = `${link} border-slate-300 bg-white text-slate-700 hover:bg-slate-50`
  const primary = `${link} border-brand-700 bg-brand-600 text-white hover:bg-brand-700`
  return (
    <nav
      aria-label="Section navigation"
      className="no-print flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4"
    >
      <div>
        {prev && (
          <Link className={secondary} to={reviewPath(kind, reviewId, prev.id)}>
            ← {prev.label}
          </Link>
        )}
      </div>
      <p className="text-xs text-slate-500">
        Step {i + 1} of {sections.length}
      </p>
      <div>
        {next && (
          <Link className={primary} to={reviewPath(kind, reviewId, next.id)}>
            {next.label} →
          </Link>
        )}
      </div>
    </nav>
  )
}
