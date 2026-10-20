import { useEffect } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { Callout, PageTitle } from '../../components/fields'
import { MODULE_SECTIONS, PROGRAMME_SECTIONS, reviewPath } from '../../components/layout/nav'
import type { ReviewKind } from '../../model/v2/schema'
import { useWorkspace } from '../../store/workspace'
import { SectionPager } from './SectionPager'

/** Opens the review named in the URL and renders the requested section. */
export function ReviewRoute({ kind }: { kind: ReviewKind }) {
  const { reviewId = '', section = 'context' } = useParams()
  const review = useWorkspace((s) => (s.current?.id === reviewId ? s.current : null))
  const open = useWorkspace((s) => s.open)
  const missing = useWorkspace(
    (s) => !review && (s.failedId === reviewId || !s.entries.some((e) => e.id === reviewId)),
  )

  useEffect(() => {
    open(reviewId)
  }, [reviewId, open])

  if (missing)
    return (
      <>
        <PageTitle title="Review not found" />
        <Callout title="This review is not saved in this browser" tone="warn">
          <p>
            It may have been deleted, saved in a different browser, or damaged. If you have an
            exported file, import it from the home page.
          </p>
          <p>
            <Link className="font-medium underline" to="/">
              Return to the home page
            </Link>
          </p>
        </Callout>
      </>
    )
  if (!review) return null
  if (review.kind !== kind) return <Navigate to={reviewPath(review.kind, review.id)} replace />
  return <PlaceholderSection kind={kind} section={section} />
}

const EXTRA: Record<string, string> = {
  contributions: 'Module contributions',
  statement: 'Programme AI Integration Statement',
  'programme-priorities': 'Programme priorities',
}

/** Stand-in for section pages built in later stages. */
function PlaceholderSection({ kind, section }: { kind: ReviewKind; section: string }) {
  const sections = kind === 'programme' ? PROGRAMME_SECTIONS : MODULE_SECTIONS
  const title = sections.find((s) => s.id === section)?.label ?? EXTRA[section]
  if (!title) return <Navigate to="../context" replace relative="path" />
  return (
    <>
      <PageTitle title={title} />
      <Callout title="Being rebuilt" tone="note">
        <p>This section of the new tool is under development.</p>
      </Callout>
      <SectionPager kind={kind} section={section} />
    </>
  )
}
