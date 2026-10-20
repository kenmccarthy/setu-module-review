/**
 * Module review summary and progress, as pure functions of the recorded responses. Each
 * assessment is reported on its own: there are no totals, scores or overall ratings.
 */
import { OUTCOME_REVIEW, optionLabel } from '../../content/scales'
import {
  AI_ROLES,
  ASSESSMENT_ACTIONS,
  ASSESSMENT_CONFIDENCE,
  LT_OPPORTUNITIES,
  MODULE_ALIGNMENT,
  OUTCOMES_APPROPRIATE,
  RESPONSIBLE_ENGAGEMENT,
} from '../../content/v2/scales'
import { MODULE_SUMMARY, OUTCOMES, REFLECTION, TEACHING } from '../../content/v2/module'
import type { ModuleAssessment, ModuleReview } from '../../model/v2/schema'
import { NOT_ANSWERED, type SummaryBlock } from './programmeSummary'

const answer = <T extends string>(options: readonly { value: T; label: string }[], v: T | '') =>
  optionLabel(options, v) || NOT_ANSWERED

const nonEmpty = (...xs: string[]) => xs.map((x) => x.trim()).filter(Boolean)

export const assessmentName = (a: Pick<ModuleAssessment, 'title'>, i: number) =>
  a.title.trim() || `Assessment ${i + 1}`

function assessmentDetails(a: ModuleAssessment) {
  return [
    a.type,
    a.weighting && `${a.weighting.replace(/%$/, '')}%`,
    a.semester && `semester ${a.semester}`,
  ]
    .filter(Boolean)
    .join(', ')
}

export const moduleTitle = (m: Pick<ModuleReview, 'code' | 'title'>) =>
  [m.code, m.title].filter((x) => x.trim()).join(' ') || 'Untitled module'

export function moduleSummary(m: ModuleReview): SummaryBlock[] {
  const as = m.assessments
  const discussAssessments = as
    .map((a, i) => ({ a, i }))
    .filter(({ a }) => a.action === 'discuss')
    .map(({ a, i }) => `${assessmentName(a, i)}: ${optionLabel(ASSESSMENT_ACTIONS, a.action)}`)
  const flaggedOutcomes = m.learningOutcomes.filter(
    (lo) => lo.text.trim() && lo.rating && lo.rating !== 'appropriate',
  )
  return [
    {
      id: 'details',
      heading: 'Module details',
      lines: nonEmpty(
        moduleTitle(m),
        [`Stage ${m.stage}`, m.credits && `${m.credits} credits`].filter(Boolean).join(' · '),
        m.coordinator && `Module coordinator: ${m.coordinator}`,
        m.associatedProgrammes && `Programme(s): ${m.associatedProgrammes}`,
        m.reviewDate && `Review date: ${m.reviewDate}`,
      ),
    },
    {
      id: 'outcomes',
      heading: 'Learning outcome reflection',
      lines: [
        `${OUTCOMES.main} ${answer(OUTCOMES_APPROPRIATE, m.outcomesAppropriate)}`,
        ...nonEmpty(m.outcomesCapabilities, m.outcomesChanges),
        ...flaggedOutcomes.map(
          (lo) =>
            `Learning outcome noted: ${lo.text.trim()} (${optionLabel(OUTCOME_REVIEW, lo.rating)})`,
        ),
      ],
    },
    {
      id: 'teaching',
      heading: 'Teaching and learning reflection',
      lines: [
        `${TEACHING.q1} ${answer(LT_OPPORTUNITIES, m.ltOpportunities)}`,
        `${TEACHING.q2} ${answer(RESPONSIBLE_ENGAGEMENT, m.responsibleEngagement)}`,
        ...nonEmpty(m.ltEnhance),
      ],
    },
    {
      id: 'assessments',
      heading: 'Assessment approaches',
      lines: as.map((a, i) => {
        const d = assessmentDetails(a)
        return [
          `${assessmentName(a, i)}${d ? ` (${d})` : ''}: ${answer(AI_ROLES, a.aiRole)}`,
          a.rationale.trim(),
        ]
          .filter(Boolean)
          .join('. ')
      }),
    },
    {
      id: 'confidence',
      heading: 'Confidence in learning assurance',
      lines: as.map(
        (a, i) => `${assessmentName(a, i)}: ${answer(ASSESSMENT_CONFIDENCE, a.confidence)}`,
      ),
    },
    {
      id: 'actions',
      heading: 'Proposed actions',
      lines: [
        ...nonEmpty(...m.nextSteps.map((s) => s.text)),
        ...as
          .map((a, i) => ({ a, i }))
          .filter(({ a }) => a.action)
          .map(
            ({ a, i }) => `${assessmentName(a, i)}: ${optionLabel(ASSESSMENT_ACTIONS, a.action)}`,
          ),
      ],
    },
    {
      id: 'discussion',
      heading: 'Matters requiring programme discussion',
      lines: [
        ...nonEmpty(m.programmeDiscussion),
        ...discussAssessments,
        ...(m.alignment && m.alignment !== 'yes'
          ? [`${REFLECTION.alignment} ${optionLabel(MODULE_ALIGNMENT, m.alignment)}`]
          : []),
      ],
    },
    {
      id: 'reflection',
      heading: 'Reflection',
      lines: [
        ...nonEmpty(m.workingWell).map((t) => `Working well: ${t}`),
        ...nonEmpty(m.enhance).map((t) => `To enhance: ${t}`),
        ...(m.alignment === 'yes' ? [`${REFLECTION.alignment} Yes`] : []),
      ],
    },
    {
      id: 'contribution',
      heading: MODULE_SUMMARY.contributionHeading,
      lines: nonEmpty(m.contribution),
    },
  ]
}

export function moduleSummaryText(m: ModuleReview): string {
  return moduleSummary(m)
    .map((b) =>
      [b.heading.toUpperCase(), ...(b.lines.length ? b.lines : [NOT_ANSWERED])].join('\n'),
    )
    .join('\n\n')
}

/** The three core decisions for an assessment have been made. Advanced detail never counts. */
export const assessmentAnswered = (a: ModuleAssessment) => !!(a.aiRole && a.confidence && a.action)

export function moduleProgress(m: ModuleReview): Record<string, boolean> {
  return {
    context: !!(m.title.trim() || m.code.trim()),
    outcomes: !!m.outcomesAppropriate,
    teaching: !!(m.ltOpportunities && m.responsibleEngagement),
    assessment: m.assessments.length > 0 && m.assessments.every(assessmentAnswered),
    reflection: !!m.alignment,
  }
}
