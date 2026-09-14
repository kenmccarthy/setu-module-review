import type { Assessment, Module, Review } from '../model/schema'
import type { Assurance, Vulnerability } from '../content/scales'

export type FlagLevel = 'priority' | 'watch' | 'none'

/**
 * The specification's explicit rule: examine assessments where
 * AI Vulnerability = High/Critical AND Learning Assurance = Low.
 * "watch" is a softer flag for High/Critical with Moderate assurance.
 */
export function flagLevel(a: Pick<Assessment, 'vulnerability' | 'assurance'>): FlagLevel {
  const vulnerable = a.vulnerability === 'high' || a.vulnerability === 'critical'
  if (!vulnerable) return 'none'
  if (a.assurance === 'low') return 'priority'
  if (a.assurance === 'moderate') return 'watch'
  return 'none'
}

export interface AssessmentRef {
  module: Module
  assessment: Assessment
}

export function allAssessments(review: Review): AssessmentRef[] {
  return review.modules.flatMap((module) =>
    module.assessments.map((assessment) => ({ module, assessment })),
  )
}

export function priorityAssessments(review: Review): AssessmentRef[] {
  return allAssessments(review).filter((r) => flagLevel(r.assessment) === 'priority')
}

export function watchAssessments(review: Review): AssessmentRef[] {
  return allAssessments(review).filter((r) => flagLevel(r.assessment) === 'watch')
}

/** Counts for the Vulnerability × Assurance grid. Unrated assessments are excluded. */
export function vulnerabilityAssuranceGrid(
  review: Review,
): Record<Vulnerability, Record<Assurance, AssessmentRef[]>> {
  const grid = {} as Record<Vulnerability, Record<Assurance, AssessmentRef[]>>
  for (const v of ['low', 'moderate', 'high', 'critical'] as const) {
    grid[v] = { high: [], moderate: [], low: [] }
  }
  for (const ref of allAssessments(review)) {
    const { vulnerability, assurance } = ref.assessment
    if (vulnerability && assurance) grid[vulnerability][assurance].push(ref)
  }
  return grid
}

export function assessmentLabel(ref: AssessmentRef): string {
  const mod = ref.module.code || ref.module.title || 'Module'
  return `${mod}: ${ref.assessment.title || 'Untitled assessment'}`
}
