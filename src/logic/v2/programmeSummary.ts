/**
 * Programme review summary and progress, as pure functions of the recorded responses. The
 * summary reports only what the team entered or selected: no scores, ratings or inferences.
 */
import { PROGRESSION_PHASES, optionLabel } from '../../content/scales'
import {
  ADDRESSED,
  COHERENCE_PROMPTS,
  COORDINATION,
  OPPORTUNITY_CONFIDENCE,
  PROGRESSION_CAPABILITIES_V2,
} from '../../content/v2/scales'
import { CAPABILITIES, COHERENCE, CURRICULUM, PROGRESSION } from '../../content/v2/programme'
import type { ProgrammeReview } from '../../model/v2/schema'

export const NOT_ANSWERED = 'Not yet answered'

export interface SummaryBlock {
  id: string
  heading: string
  lines: string[]
}

const answer = <T extends string>(options: readonly { value: T; label: string }[], v: T | '') =>
  optionLabel(options, v) || NOT_ANSWERED

const nonEmpty = (...xs: string[]) => xs.map((x) => x.trim()).filter(Boolean)
const labels = (caps: { label: string }[]) =>
  caps.length ? [`Selected capabilities: ${caps.map((c) => c.label).join('; ')}`] : []

/** One line per capability row that has entries, e.g. "Human judgement: Stage 2 (I), Stage 4 (D)". */
export function progressionLines(r: ProgrammeReview): string[] {
  return PROGRESSION_CAPABILITIES_V2.flatMap((cap) => {
    const cells = Array.from({ length: r.stages }, (_, i) => i + 1)
      .map((s) => ({ s, phases: r.progression[`${cap.id}:${s}`] ?? [] }))
      .filter((c) => c.phases.length)
      .map(
        (c) =>
          `Stage ${c.s} (${c.phases.map((p) => optionLabel(PROGRESSION_PHASES, p as never).charAt(0)).join(', ')})`,
      )
    return cells.length ? [`${cap.label}: ${cells.join(', ')}`] : []
  })
}

export function programmeSummary(r: ProgrammeReview): SummaryBlock[] {
  const lines = progressionLines(r)
  return [
    {
      id: 'context',
      heading: 'Programme context',
      lines: nonEmpty(
        r.title,
        [r.nfqLevel && `NFQ level ${r.nfqLevel}`, r.duration, r.stages && `${r.stages} stages`]
          .filter(Boolean)
          .join(' · '),
        r.academicUnit && `Faculty: ${r.academicUnit}`,
        r.coordinator && `Programme coordinator: ${r.coordinator}`,
        r.reviewDate && `Review date: ${r.reviewDate}`,
        r.team && `Review team: ${r.team}`,
        r.disciplineReflection,
      ),
    },
    {
      id: 'independent',
      heading: 'Independent graduate capabilities',
      lines: [...nonEmpty(r.independentText), ...labels(r.independentCapabilities)],
    },
    {
      id: 'ai-enabled',
      heading: 'AI-enabled graduate capabilities',
      lines: [...nonEmpty(r.aiEnabledText), ...labels(r.aiEnabledCapabilities)],
    },
    {
      id: 'outcomes',
      heading: 'Programme learning outcomes',
      lines: [
        `${CAPABILITIES.q3} ${answer(ADDRESSED, r.outcomesAdequate)}`,
        ...nonEmpty(r.outcomesComments),
      ],
    },
    {
      id: 'progression',
      heading: 'Capability progression',
      lines: [
        ...(lines.length ? lines : ['No progression has been mapped yet.']),
        ...(r.progressionUnconfirmed.length
          ? [
              `${r.progressionUnconfirmed.length} map cells carried over from the previous version are awaiting confirmation.`,
            ]
          : []),
        `${PROGRESSION.reflection} ${answer(ADDRESSED, r.progressionCoherent)}`,
        ...nonEmpty(r.progressionGaps),
      ],
    },
    {
      id: 'curriculum',
      heading: 'Curriculum and assessment reflections',
      lines: [
        `${CURRICULUM.q1} ${answer(OPPORTUNITY_CONFIDENCE, r.opportunitiesConfidence)}`,
        `${CURRICULUM.q2} ${answer(ADDRESSED, r.assessmentBalance)}`,
        ...nonEmpty(r.confidenceConcerns),
        ...nonEmpty(r.modulesForConsideration).map((m) => `For further consideration: ${m}`),
      ],
    },
    {
      id: 'coherence',
      heading: 'Programme coherence',
      lines: [
        `${COHERENCE.main} ${answer(COORDINATION, r.coordination)}`,
        ...COHERENCE_PROMPTS.flatMap((p) =>
          nonEmpty(r.coherenceNotes[p.id] ?? '').map((n) => `${p.label}: ${n}`),
        ),
        ...nonEmpty(r.strengthenApproach),
      ],
    },
    { id: 'strengths', heading: 'Strengths', lines: nonEmpty(r.strengths) },
    { id: 'opportunities', heading: 'Opportunities', lines: nonEmpty(r.opportunities) },
    {
      id: 'priorities',
      heading: 'Agreed priorities',
      lines: nonEmpty(...r.priorities.map((p) => p.text)),
    },
    {
      id: 'questions',
      heading: 'Questions for module teams',
      lines: nonEmpty(...r.moduleQuestions.map((q) => q.text)),
    },
  ]
}

/** Plain-text version of the summary for copying. */
export function programmeSummaryText(r: ProgrammeReview): string {
  return programmeSummary(r)
    .map((b) =>
      [b.heading.toUpperCase(), ...(b.lines.length ? b.lines : [NOT_ANSWERED])].join('\n'),
    )
    .join('\n\n')
}

/** Whether each section's main questions have been answered (for progress indication). */
export function programmeProgress(r: ProgrammeReview): Record<string, boolean> {
  const has = (s: string) => s.trim().length > 0
  return {
    context: has(r.title),
    capabilities:
      !!r.outcomesAdequate &&
      (has(r.independentText) || r.independentCapabilities.length > 0) &&
      (has(r.aiEnabledText) || r.aiEnabledCapabilities.length > 0),
    progression: !!r.progressionCoherent && Object.values(r.progression).some((v) => v.length > 0),
    curriculum: !!r.opportunitiesConfidence && !!r.assessmentBalance,
    coherence: !!r.coordination,
    priorities: has(r.strengths) || has(r.opportunities) || r.priorities.some((p) => has(p.text)),
  }
}
