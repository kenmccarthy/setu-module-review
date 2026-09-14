import type { Review } from '../model/schema'
import { allAssessments, flagLevel, type FlagLevel } from './flags'

export interface PortfolioRow {
  moduleId: string
  assessmentId: string
  stage: number
  semester: string
  moduleLabel: string
  assessmentTitle: string
  weighting: string
  type: string
  position: string
  vulnerability: string
  assurance: string
  protectedCapability: string
  aiCapabilityDeveloped: string
  flag: FlagLevel
}

/** Part A §4 – the programme assessment portfolio, derived from module assessments. */
export function portfolioRows(review: Review): PortfolioRow[] {
  return allAssessments(review)
    .map(({ module, assessment }) => ({
      moduleId: module.id,
      assessmentId: assessment.id,
      stage: module.stage,
      semester: assessment.semester,
      moduleLabel: [module.code, module.title].filter(Boolean).join(' ') || 'Untitled module',
      assessmentTitle: assessment.title || 'Untitled assessment',
      weighting: assessment.weighting,
      type: assessment.type,
      position: assessment.position,
      vulnerability: assessment.vulnerability,
      assurance: assessment.assurance,
      protectedCapability: assessment.protectedCapabilities.map((c) => c.label).join(', '),
      aiCapabilityDeveloped: assessment.aiCapabilityDeveloped,
      flag: flagLevel(assessment),
    }))
    .sort(
      (a, b) =>
        a.stage - b.stage ||
        a.semester.localeCompare(b.semester) ||
        a.moduleLabel.localeCompare(b.moduleLabel),
    )
}
