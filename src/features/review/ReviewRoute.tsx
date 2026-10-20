import { useEffect } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { Callout, PageTitle } from '../../components/fields'
import { MODULE_SECTIONS, PROGRAMME_SECTIONS, reviewPath } from '../../components/layout/nav'
import type { ReviewKind } from '../../model/v2/schema'
import { useWorkspace } from '../../store/workspace'
import { SectionPager } from './SectionPager'
import {
  ProgrammeCapabilities,
  ProgrammeCoherence,
  ProgrammeContext,
  ProgrammeCurriculum,
  ProgrammePriorities,
  ProgrammeProgression,
} from '../programme/sections'
import { ProgrammeSummary } from '../programme/ProgrammeSummary'
import {
  ModuleAssessments,
  ModuleContext,
  ModuleOutcomes,
  ModuleReflection,
  ModuleTeaching,
} from '../module/sections'
import { ModuleSummary } from '../module/ModuleSummary'

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
  if (kind === 'programme' && section in PROGRAMME_PAGES) {
    const meta = PROGRAMME_SECTIONS.find((s) => s.id === section)!
    const Page = PROGRAMME_PAGES[section]
    return (
      <>
        <PageTitle
          part={
            'number' in meta ? `Programme review · Section ${meta.number} of 5` : 'Programme review'
          }
          title={meta.label}
        />
        <Page />
        <SectionPager kind={kind} section={section} />
      </>
    )
  }
  if (kind === 'module' && section in MODULE_PAGES) {
    const meta = MODULE_SECTIONS.find((s) => s.id === section)!
    const Page = MODULE_PAGES[section]
    return (
      <>
        <PageTitle
          part={'number' in meta ? `Module review · Section ${meta.number} of 4` : 'Module review'}
          title={meta.label}
        />
        <Page />
        <SectionPager kind={kind} section={section} />
      </>
    )
  }
  return <PlaceholderSection kind={kind} section={section} />
}

const MODULE_PAGES: Record<string, () => React.ReactNode> = {
  context: ModuleContext,
  outcomes: ModuleOutcomes,
  teaching: ModuleTeaching,
  assessment: ModuleAssessments,
  reflection: ModuleReflection,
  summary: ModuleSummary,
}

const PROGRAMME_PAGES: Record<string, () => React.ReactNode> = {
  context: ProgrammeContext,
  capabilities: ProgrammeCapabilities,
  progression: ProgrammeProgression,
  curriculum: ProgrammeCurriculum,
  coherence: ProgrammeCoherence,
  priorities: ProgrammePriorities,
  summary: ProgrammeSummary,
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
