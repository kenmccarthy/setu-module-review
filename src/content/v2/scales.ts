/**
 * Response options for the v2 Programme and Module AI Integration Reviews, transcribed from the
 * "SETU AI Integration Review — Redevelopment Specification". These are reflective responses,
 * not quality scores, so they carry no colour tone.
 */
import { AI_POSITIONS } from '../scales'

export interface ResponseOption<T extends string = string> {
  value: T
  label: string
  description?: string
}

/** Used by several programme questions: "Yes / Partially / Not yet addressed". */
export const ADDRESSED = [
  { value: 'yes', label: 'Yes' },
  { value: 'partially', label: 'Partially / worth exploring further' },
  { value: 'not_yet', label: 'Not yet addressed' },
] as const satisfies readonly ResponseOption[]
export type Addressed = (typeof ADDRESSED)[number]['value']

/** Programme S3 Q1. */
export const OPPORTUNITY_CONFIDENCE = [
  { value: 'yes', label: 'Yes' },
  { value: 'some_questions', label: 'Some questions remain' },
  { value: 'further_review', label: 'Further review needed' },
] as const satisfies readonly ResponseOption[]

/** Programme S4 main question. */
export const COORDINATION = [
  { value: 'established', label: 'We have an established coordinated approach' },
  { value: 'some', label: 'Some coordination exists, but further discussion would be useful' },
  { value: 'not_yet', label: 'We have not yet developed a coordinated approach' },
] as const satisfies readonly ResponseOption[]

/** Module S1 main question. */
export const OUTCOMES_APPROPRIATE = [
  { value: 'appropriate', label: 'Yes, they remain appropriate' },
  { value: 'some_review', label: 'Some aspects may benefit from review' },
  { value: 'significant_review', label: 'Significant review may be needed' },
] as const satisfies readonly ResponseOption[]

/** Module S2 Q1. */
export const LT_OPPORTUNITIES = [
  { value: 'yes', label: 'Yes' },
  { value: 'enhance', label: 'Some opportunities for enhancement' },
  { value: 'further', label: 'Further consideration needed' },
] as const satisfies readonly ResponseOption[]

/** Module S2 Q2. */
export const RESPONSIBLE_ENGAGEMENT = [
  { value: 'yes', label: 'Yes' },
  { value: 'partially', label: 'Partially' },
  { value: 'not_yet', label: 'Not yet addressed' },
  { value: 'not_relevant', label: 'Not directly relevant to this module' },
] as const satisfies readonly ResponseOption[]

/** Module S3 Q1 — the same five positions as v1, so values carry over unchanged. */
export const AI_ROLES = AI_POSITIONS.map(({ value, label, description }) => ({
  value,
  label: value === 'not_relevant' ? 'AI Not Materially Relevant' : label,
  description:
    {
      restricted: 'Students complete specified work independently of Generative AI.',
      limited: 'AI may be used for clearly defined purposes or stages.',
      integrated: 'Appropriate AI use forms an intentional part of the assessment.',
      open: 'Students may determine whether and how to use AI, subject to relevant guidance and transparency requirements.',
      not_relevant: 'AI does not significantly affect the nature or validity of the assessment.',
    }[value] ?? description,
}))

/** Module S3 Q2. */
export const ASSESSMENT_CONFIDENCE = [
  { value: 'confident', label: 'Confident' },
  { value: 'some_questions', label: 'Some questions remain' },
  { value: 'review_needed', label: 'Review needed' },
] as const satisfies readonly ResponseOption[]

/** Module S3 Q3. */
export const ASSESSMENT_ACTIONS = [
  { value: 'maintain', label: 'Maintain current approach' },
  { value: 'clarify', label: 'Clarify expectations about AI use' },
  { value: 'enhance', label: 'Enhance assessment design' },
  { value: 'explore', label: 'Explore AI integration' },
  { value: 'discuss', label: 'Discuss with programme team' },
] as const satisfies readonly ResponseOption[]

/** Module S4 closing question. */
export const MODULE_ALIGNMENT = [
  { value: 'yes', label: 'Yes' },
  { value: 'discuss', label: 'Further programme discussion would be useful' },
  { value: 'review', label: 'Alignment needs to be reviewed' },
] as const satisfies readonly ResponseOption[]

export const STATEMENT_STATUSES = [
  { value: 'draft', label: 'Draft' },
  { value: 'under_review', label: 'Under programme-team review' },
  { value: 'agreed', label: 'Agreed' },
] as const satisfies readonly ResponseOption[]
export type StatementStatus = (typeof STATEMENT_STATUSES)[number]['value']

/** Programme S2: the five broad capabilities of the I–P–E–D progression map. */
export const PROGRESSION_CAPABILITIES_V2 = [
  { id: 'literacy_responsible', label: 'AI literacy and responsible use' },
  { id: 'evaluation', label: 'Critical evaluation of AI outputs' },
  { id: 'discipline', label: 'Discipline-specific AI application' },
  { id: 'oversight', label: 'Human judgement and oversight' },
  { id: 'collaboration', label: 'Effective human–AI collaboration' },
] as const
export type ProgressionCapabilityV2 = (typeof PROGRESSION_CAPABILITIES_V2)[number]['id']

/** Programme AI Integration Statement: five sections. */
export const STATEMENT_SECTIONS_V2 = [
  {
    id: 'approach',
    title: 'Our Approach to AI',
    question: 'How is AI affecting our discipline, and what overall approach have we adopted?',
  },
  {
    id: 'capabilities',
    title: 'Graduate Capabilities',
    question: 'What should our graduates be able to do independently and with AI?',
  },
  {
    id: 'curriculum',
    title: 'Curriculum and Assessment',
    question:
      'How does our programme develop these capabilities and provide appropriate assurance of student learning?',
  },
  {
    id: 'responsible',
    title: 'Responsible AI',
    question: 'How do we prepare students to engage with AI critically, ethically and responsibly?',
  },
  {
    id: 'review',
    title: 'Review and Development',
    question: 'What are our priorities, and how will we keep our approach under review?',
  },
] as const
export type StatementSectionV2 = (typeof STATEMENT_SECTIONS_V2)[number]['id']

/** Programme S4 expandable prompts. */
export const COHERENCE_PROMPTS = [
  { id: 'guidance', label: 'Consistency of student guidance' },
  { id: 'progression', label: 'Progression of AI capabilities' },
  { id: 'justification', label: 'Educational justification of AI restrictions and integration' },
  { id: 'capabilities', label: 'Independent and AI-enabled graduate capabilities' },
  { id: 'staff', label: 'Opportunities for staff coordination' },
] as const
