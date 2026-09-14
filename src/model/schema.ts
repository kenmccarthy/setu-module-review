import { z } from 'zod'
import {
  AGREEMENT,
  AGREEMENT_WITH_DISCUSSION,
  AI_POSITIONS,
  ASSURANCE,
  ACTION_CATEGORIES,
  ACTION_PRIORITIES,
  OUTCOME_REVIEW,
  PROCESS_VISIBILITY,
  PROGRESSION_PHASES,
  QUALITY,
  STATEMENT_APPROACHES,
  SUSTAINABILITY,
  VULNERABILITY,
} from '../content/scales'

export const SCHEMA_VERSION = 1

/** Enum of option values plus '' for "not yet answered". */
function scale<T extends string>(
  options: readonly { value: T }[],
): z.ZodType<'' | T, '' | T | undefined> {
  const values = ['', ...options.map((o) => o.value)] as [string, ...string[]]
  return z.enum(values).default('') as unknown as z.ZodType<'' | T, '' | T | undefined>
}

const str = () => z.string().default('')
const strList = () => z.array(z.string()).default([])

export const CapabilitySchema = z.object({
  id: z.string(),
  label: z.string(),
  custom: z.boolean().default(false),
})
export type Capability = z.infer<typeof CapabilitySchema>

export const LearningOutcomeSchema = z.object({
  id: z.string(),
  text: str(),
  rating: scale(OUTCOME_REVIEW),
  comments: str(),
})
export type LearningOutcome = z.infer<typeof LearningOutcomeSchema>

export const AssessmentSchema = z.object({
  id: z.string(),
  title: str(),
  semester: str(),
  weighting: str(),
  type: str(),
  outcomeIds: strList(),
  purpose: str(),
  // 11 – AI capability
  aiCanDo: strList(),
  aiCanDoNotes: str(),
  // 11 – vulnerability
  vulnerability: scale(VULNERABILITY),
  vulnerabilityReason: str(),
  // 11 – intended position
  position: scale(AI_POSITIONS),
  positionRationale: str(),
  // 6 – learning assurance
  assurance: scale(ASSURANCE),
  assuranceEvidence: strList(),
  assuranceNotes: str(),
  // 12 – human agency
  protectedCapabilities: z.array(CapabilitySchema).default([]),
  humanAgencyNotes: str(),
  humanAgencyEvidence: scale(AGREEMENT),
  // 13 – process visibility
  processApproaches: strList(),
  processDecision: scale(PROCESS_VISIBILITY),
  processAction: str(),
  // 14 – authenticity
  authenticityRating: scale(QUALITY),
  authenticityNotes: str(),
  // 15 – equity
  equityIssues: str(),
  equityActions: str(),
  // 16 – practicality
  practicalityRating: scale(SUSTAINABILITY),
  practicalityNotes: str(),
  // portfolio column
  aiCapabilityDeveloped: str(),
})
export type Assessment = z.infer<typeof AssessmentSchema>

export const ModuleSchema = z.object({
  id: z.string(),
  title: str(),
  code: str(),
  stage: z.number().int().min(1).default(1),
  credits: str(),
  leader: str(),
  programmes: str(),
  contextReflection: str(),
  learningOutcomes: z.array(LearningOutcomeSchema).default([]),
  outcomesComments: str(),
  ltRating: scale(QUALITY),
  ltActions: str(),
  assessments: z.array(AssessmentSchema).default([]),
})
export type Module = z.infer<typeof ModuleSchema>

export const ActionSchema = z.object({
  id: z.string(),
  text: str(),
  category: scale(ACTION_CATEGORIES),
  scope: z.enum(['programme', 'module']).default('programme'),
  moduleId: str(),
  priority: scale(ACTION_PRIORITIES),
  owner: str(),
  timescale: str(),
  reviewPoint: str(),
})
export type Action = z.infer<typeof ActionSchema>

export const ProgrammeSchema = z.object({
  title: str(),
  nfqLevel: str(),
  duration: str(),
  coordinator: str(),
  academicUnit: str(),
  reviewDate: str(),
  team: str(),
  stages: z.number().int().min(1).max(8).default(4),
  disciplineReflection: str(),
  enduringCapabilities: z.array(CapabilitySchema).default([]),
  protectedCapabilities: z.array(CapabilitySchema).default([]),
  protectedNotes: str(),
  humanAiCapabilities: z.array(CapabilitySchema).default([]),
  ploCheckpoint: scale(AGREEMENT_WITH_DISCUSSION),
  ploAction: str(),
  /** key `${capabilityId}:${stage}` → phases */
  progression: z
    .record(
      z.string(),
      z.array(z.enum(PROGRESSION_PHASES.map((p) => p.value) as [string, ...string[]])),
    )
    .default({}),
  progressionRating: scale(QUALITY),
  progressionNotes: str(),
  coherenceAnswers: z.record(z.string(), z.string()).default({}),
  coherenceRating: scale(QUALITY),
  coherenceObservations: str(),
})
export type Programme = z.infer<typeof ProgrammeSchema>

export const SynthesisSchema = z.object({
  dashboard: z.record(z.string(), scale(QUALITY)).default({}),
  patternNotes: z.record(z.string(), z.string()).default({}),
  discussion: z.record(z.string(), z.string()).default({}),
  actions: z.array(ActionSchema).default([]),
  overallPosition: str(),
})
export type Synthesis = z.infer<typeof SynthesisSchema>

export const StatementSchema = z.object({
  approach: scale(STATEMENT_APPROACHES),
  approachOther: str(),
  approachRationale: str(),
  /** Team-edited text per statement section id. Empty means "use the generated draft". */
  sections: z.record(z.string(), z.string()).default({}),
  /** Team-edited evidence summary overrides, keyed by area id. */
  evidencePosition: z.record(z.string(), z.string()).default({}),
  evidenceSupport: z.record(z.string(), z.string()).default({}),
  agreedDate: str(),
  nextReviewDate: str(),
})
export type Statement = z.infer<typeof StatementSchema>

export const ReviewSchema = z.object({
  schemaVersion: z.literal(SCHEMA_VERSION).default(SCHEMA_VERSION),
  id: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  programme: ProgrammeSchema.default(() => ProgrammeSchema.parse({})),
  modules: z.array(ModuleSchema).default([]),
  synthesis: SynthesisSchema.default(() => SynthesisSchema.parse({})),
  statement: StatementSchema.default(() => StatementSchema.parse({})),
})
export type Review = z.infer<typeof ReviewSchema>
