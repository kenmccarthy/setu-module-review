/**
 * Schema version 2: independent Programme and Module AI Integration Reviews, the exchange packets
 * that connect them, and the Programme AI Integration Statement.
 *
 * Every review carries its own id, timestamps, schema version and status, and is stored on its
 * own, so starting one review never overwrites another.
 */
import { z } from 'zod'
import { PROGRESSION_PHASES, STATEMENT_APPROACHES } from '../../content/scales'
import {
  ADDRESSED,
  AI_ROLES,
  ASSESSMENT_ACTIONS,
  ASSESSMENT_CONFIDENCE,
  COORDINATION,
  LT_OPPORTUNITIES,
  MODULE_ALIGNMENT,
  OPPORTUNITY_CONFIDENCE,
  OUTCOMES_APPROPRIATE,
  RESPONSIBLE_ENGAGEMENT,
  STATEMENT_STATUSES,
} from '../../content/v2/scales'
import { CapabilitySchema, scale, str, strList } from '../fields'
import { AssessmentSchema as V1AssessmentSchema, LearningOutcomeSchema } from '../legacy/v1'

export const SCHEMA_VERSION_V2 = 2

const ReviewStatusSchema = z.enum(['in_progress', 'complete']).default('in_progress')

/**
 * Data carried over from a version 1 review that has no v2 equivalent, or whose rating could not
 * be safely mapped. Kept verbatim and shown read-only; never reinterpreted.
 */
export const LegacySchema = z.object({
  source: z.literal('v1'),
  sourceReviewId: z.string(),
  migratedAt: z.string(),
  /** Plain-language notes on what was carried over, what was left unanswered and why. */
  notes: strList(),
  /** The original v1 data this review was created from (a whole review, or one module). */
  original: z.unknown(),
})
export type Legacy = z.infer<typeof LegacySchema>

const envelope = {
  schemaVersion: z.literal(SCHEMA_VERSION_V2).default(SCHEMA_VERSION_V2),
  id: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  status: ReviewStatusSchema,
  legacy: LegacySchema.optional(),
}

/** A short list item with a stable id (priorities, next steps, questions for module teams). */
export const ListItemSchema = z.object({ id: z.string(), text: str() })
export type ListItem = z.infer<typeof ListItemSchema>

const phase = z.enum(PROGRESSION_PHASES.map((p) => p.value) as [string, ...string[]])

// ── Module review ────────────────────────────────────────────────────────────────────────────

/** The detailed v1 assessment parameters, shown under "Explore Assessment Design in More Detail". */
export const AdvancedAssessmentSchema = V1AssessmentSchema.omit({
  id: true,
  title: true,
  semester: true,
  weighting: true,
  type: true,
})
export type AdvancedAssessment = z.infer<typeof AdvancedAssessmentSchema>

export const ModuleAssessmentSchema = z.object({
  id: z.string(),
  title: str(),
  weighting: str(),
  type: str(),
  semester: str(),
  aiRole: scale(AI_ROLES),
  confidence: scale(ASSESSMENT_CONFIDENCE),
  action: scale(ASSESSMENT_ACTIONS),
  rationale: str(),
  advanced: AdvancedAssessmentSchema.default(() => AdvancedAssessmentSchema.parse({})),
})
export type ModuleAssessment = z.infer<typeof ModuleAssessmentSchema>

/** A question or priority sent by a programme team, imported into a module review. */
export const ProgrammePromptSchema = z.object({
  id: z.string(),
  kind: z.enum(['question', 'priority']).default('question'),
  text: str(),
})
export type ProgrammePrompt = z.infer<typeof ProgrammePromptSchema>

export const ImportedProgrammePromptsSchema = z.object({
  /** Id of the programme review that sent these prompts. */
  sourceReviewId: z.string(),
  revision: z.string(),
  importedAt: z.string(),
  programmeTitle: str(),
  prompts: z.array(ProgrammePromptSchema).default([]),
  /** The module team's optional notes against each prompt, keyed by prompt id. */
  responses: z.record(z.string(), z.string()).default({}),
})
export type ImportedProgrammePrompts = z.infer<typeof ImportedProgrammePromptsSchema>

export const ModuleReviewSchema = z.object({
  ...envelope,
  kind: z.literal('module'),
  // Context
  title: str(),
  code: str(),
  stage: z.number().int().min(1).default(1),
  credits: str(),
  coordinator: str(),
  associatedProgrammes: str(),
  reviewDate: str(),
  // S1 Learning outcomes
  outcomesAppropriate: scale(OUTCOMES_APPROPRIATE),
  outcomesCapabilities: str(),
  outcomesChanges: str(),
  /** Optional advanced review: individual outcomes with v1 ratings. */
  learningOutcomes: z.array(LearningOutcomeSchema).default([]),
  // S2 Teaching and learning
  ltOpportunities: scale(LT_OPPORTUNITIES),
  responsibleEngagement: scale(RESPONSIBLE_ENGAGEMENT),
  ltEnhance: str(),
  // S3 Assessment
  assessments: z.array(ModuleAssessmentSchema).default([]),
  // S4 Reflection and next steps
  workingWell: str(),
  enhance: str(),
  programmeDiscussion: str(),
  nextSteps: z.array(ListItemSchema).default([]),
  alignment: scale(MODULE_ALIGNMENT),
  /** "How does this module contribute to the programme's overall approach to AI?" */
  contribution: str(),
  programmePriorities: z.array(ImportedProgrammePromptsSchema).default([]),
})
export type ModuleReview = z.infer<typeof ModuleReviewSchema>

// ── Exchange: module → programme ─────────────────────────────────────────────────────────────

/** The subset of a module review a programme team sees. */
export const ModuleSnapshotSchema = ModuleReviewSchema.pick({
  title: true,
  code: true,
  stage: true,
  credits: true,
  coordinator: true,
  associatedProgrammes: true,
  reviewDate: true,
  outcomesAppropriate: true,
  outcomesChanges: true,
  ltOpportunities: true,
  responsibleEngagement: true,
  ltEnhance: true,
  workingWell: true,
  enhance: true,
  programmeDiscussion: true,
  nextSteps: true,
  alignment: true,
  contribution: true,
}).extend({
  assessments: z
    .array(
      ModuleAssessmentSchema.pick({
        id: true,
        title: true,
        weighting: true,
        type: true,
        semester: true,
        aiRole: true,
        confidence: true,
        action: true,
        rationale: true,
      }),
    )
    .default([]),
})
export type ModuleSnapshot = z.infer<typeof ModuleSnapshotSchema>

export const ModuleContributionPacketSchema = z.object({
  packetType: z.literal('module-contribution'),
  schemaVersion: z.literal(SCHEMA_VERSION_V2),
  /** Id of the module review this came from: the stable key for duplicate detection. */
  sourceReviewId: z.string(),
  /** The module review's updatedAt when exported; a later value is a newer revision. */
  revision: z.string(),
  exportedAt: z.string(),
  snapshot: ModuleSnapshotSchema,
})
export type ModuleContributionPacket = z.infer<typeof ModuleContributionPacketSchema>

/** A module contribution as held by a programme review. */
export const ModuleContributionSchema = z.object({
  sourceReviewId: z.string(),
  revision: z.string(),
  importedAt: z.string(),
  origin: z.enum(['import', 'v1-migration']).default('import'),
  snapshot: ModuleSnapshotSchema,
  /** The programme team's own notes; never written back to the module review. */
  programmeNotes: str(),
})
export type ModuleContribution = z.infer<typeof ModuleContributionSchema>

// ── Statement ────────────────────────────────────────────────────────────────────────────────

export const StatementV2Schema = z.object({
  approach: scale(STATEMENT_APPROACHES),
  approachOther: str(),
  approachRationale: str(),
  /** Team-edited text per section id. Empty means "use the generated draft". */
  sections: z.record(z.string(), z.string()).default({}),
  /** The generated draft of each section when the team first edited it, to tell when it changes. */
  sectionBasis: z.record(z.string(), z.string()).default({}),
  /** Include supporting examples drawn from module contributions in the draft. */
  includeModuleExamples: z.boolean().default(true),
  includeEvidenceAppendix: z.boolean().default(false),
  /** The full statement text at the moment it was marked agreed. */
  agreedSnapshot: str(),
  status: scale(STATEMENT_STATUSES).default('draft'),
  programmeName: str(),
  approvalDate: str(),
  approvedBy: str(),
  nextReviewDate: str(),
  /** Team-authored text from a v1 statement (ten sections), preserved verbatim by section id. */
  legacySections: z.record(z.string(), z.string()).default({}),
})
export type StatementV2 = z.infer<typeof StatementV2Schema>

// ── Programme review ─────────────────────────────────────────────────────────────────────────

export const ProgrammeReviewSchema = z.object({
  ...envelope,
  kind: z.literal('programme'),
  // Context
  title: str(),
  nfqLevel: str(),
  duration: str(),
  coordinator: str(),
  academicUnit: str(),
  reviewDate: str(),
  team: str(),
  stages: z.number().int().min(1).max(8).default(4),
  disciplineReflection: str(),
  // S1 Graduate capabilities
  independentText: str(),
  independentCapabilities: z.array(CapabilitySchema).default([]),
  aiEnabledText: str(),
  aiEnabledCapabilities: z.array(CapabilitySchema).default([]),
  outcomesAdequate: scale(ADDRESSED),
  outcomesComments: str(),
  // S2 Progression: key `${capabilityId}:${stage}` → phases
  progression: z.record(z.string(), z.array(phase)).default({}),
  /** Map cells carried over from v1 that the team has not yet confirmed. */
  progressionUnconfirmed: strList(),
  progressionCoherent: scale(ADDRESSED),
  progressionGaps: str(),
  // S3 Curriculum and assessment
  opportunitiesConfidence: scale(OPPORTUNITY_CONFIDENCE),
  assessmentBalance: scale(ADDRESSED),
  confidenceConcerns: str(),
  modulesForConsideration: str(),
  // S4 Coherence
  coherenceNotes: z.record(z.string(), z.string()).default({}),
  coordination: scale(COORDINATION),
  strengthenApproach: str(),
  // S5 Priorities and next steps
  strengths: str(),
  opportunities: str(),
  priorities: z.array(ListItemSchema).default([]),
  moduleQuestions: z.array(ListItemSchema).default([]),
  // Connected workflow
  moduleContributions: z.array(ModuleContributionSchema).default([]),
  statement: StatementV2Schema.default(() => StatementV2Schema.parse({})),
})
export type ProgrammeReview = z.infer<typeof ProgrammeReviewSchema>

// ── Exchange: programme → module ─────────────────────────────────────────────────────────────

export const ProgrammePromptsPacketSchema = z.object({
  packetType: z.literal('programme-prompts'),
  schemaVersion: z.literal(SCHEMA_VERSION_V2),
  sourceReviewId: z.string(),
  revision: z.string(),
  exportedAt: z.string(),
  programmeTitle: str(),
  prompts: z.array(ProgrammePromptSchema).default([]),
})
export type ProgrammePromptsPacket = z.infer<typeof ProgrammePromptsPacketSchema>

// ── Any review, and a bundle of several ──────────────────────────────────────────────────────

export const AnyReviewSchema = z.discriminatedUnion('kind', [
  ProgrammeReviewSchema,
  ModuleReviewSchema,
])
export type AnyReview = z.infer<typeof AnyReviewSchema>
export type ReviewKind = AnyReview['kind']

export const LibraryBundleSchema = z.object({
  packetType: z.literal('library'),
  schemaVersion: z.literal(SCHEMA_VERSION_V2),
  exportedAt: z.string(),
  reviews: z.array(AnyReviewSchema).default([]),
})
export type LibraryBundle = z.infer<typeof LibraryBundleSchema>
