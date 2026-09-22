/**
 * Rating scales and option sets transcribed from the
 * "AI Programme & Module Review Tool" specification.
 */

export interface ScaleOption<T extends string = string> {
  value: T
  label: string
  description?: string
  /** Tone used for colour coding pills: 0 = good … 3 = worst. */
  tone: 0 | 1 | 2 | 3
}

export const AI_POSITIONS = [
  {
    value: 'restricted',
    label: 'AI Restricted',
    description:
      'Students are expected to undertake specified elements independently of Generative AI.',
    tone: 1,
  },
  {
    value: 'limited',
    label: 'AI Limited/Bounded',
    description: 'AI may be used for specified purposes or stages of the assessment.',
    tone: 1,
  },
  {
    value: 'integrated',
    label: 'AI Integrated',
    description:
      'Appropriate AI use forms an intentional part of the learning and/or assessment process.',
    tone: 0,
  },
  {
    value: 'open',
    label: 'AI Open',
    description:
      'Students may determine whether and how AI is useful, subject to transparency and academic integrity requirements.',
    tone: 0,
  },
  {
    value: 'not_relevant',
    label: 'AI Not Relevant',
    description: 'AI does not significantly affect the nature or validity of the assessment.',
    tone: 0,
  },
] as const satisfies readonly ScaleOption[]
export type AiPosition = (typeof AI_POSITIONS)[number]['value']

export const VULNERABILITY = [
  {
    value: 'low',
    label: 'Low',
    description: 'AI provides little opportunity to bypass the intended learning.',
    tone: 0,
  },
  {
    value: 'moderate',
    label: 'Moderate',
    description:
      'AI could complete or support some elements, but meaningful student engagement remains necessary.',
    tone: 1,
  },
  {
    value: 'high',
    label: 'High',
    description:
      'AI could substantially complete the task or obscure whether the student achieved important learning outcomes.',
    tone: 2,
  },
  {
    value: 'critical',
    label: 'Critical',
    description:
      'AI could enable an acceptable submission while providing little reliable evidence that the student achieved the intended learning.',
    tone: 3,
  },
] as const satisfies readonly ScaleOption[]
export type Vulnerability = (typeof VULNERABILITY)[number]['value']

export const ASSURANCE = [
  { value: 'high', label: 'High assurance', tone: 0 },
  { value: 'moderate', label: 'Moderate assurance', tone: 1 },
  { value: 'low', label: 'Low assurance', tone: 3 },
] as const satisfies readonly ScaleOption[]
export type Assurance = (typeof ASSURANCE)[number]['value']

/** Strong / Adequate / Review recommended / Priority action required */
export const QUALITY = [
  { value: 'strong', label: 'Strong', tone: 0 },
  { value: 'adequate', label: 'Adequate', tone: 1 },
  { value: 'review', label: 'Review recommended', tone: 2 },
  { value: 'priority', label: 'Priority action required', tone: 3 },
] as const satisfies readonly ScaleOption[]
export type Quality = (typeof QUALITY)[number]['value']

export const AGREEMENT = [
  { value: 'yes', label: 'Yes', tone: 0 },
  { value: 'mostly', label: 'Mostly', tone: 1 },
  { value: 'partially', label: 'Partially', tone: 2 },
  { value: 'no', label: 'No', tone: 3 },
] as const satisfies readonly ScaleOption[]
export type Agreement = (typeof AGREEMENT)[number]['value']

export const AGREEMENT_WITH_DISCUSSION = [
  ...AGREEMENT,
  { value: 'discuss', label: 'Requires further discussion', tone: 2 },
] as const satisfies readonly ScaleOption[]
export type AgreementWithDiscussion = (typeof AGREEMENT_WITH_DISCUSSION)[number]['value']

export const OUTCOME_REVIEW = [
  { value: 'appropriate', label: 'Remains appropriate', tone: 0 },
  { value: 'minor', label: 'Minor review recommended', tone: 1 },
  { value: 'significant', label: 'Significant review recommended', tone: 2 },
  { value: 'new', label: 'Consider new/additional outcome', tone: 2 },
] as const satisfies readonly ScaleOption[]
export type OutcomeReview = (typeof OUTCOME_REVIEW)[number]['value']

export const PROCESS_VISIBILITY = [
  { value: 'sufficient', label: 'Existing process visibility is sufficient', tone: 0 },
  { value: 'minor', label: 'Minor enhancement recommended', tone: 1 },
  { value: 'redesign', label: 'Redesign recommended', tone: 2 },
] as const satisfies readonly ScaleOption[]
export type ProcessVisibility = (typeof PROCESS_VISIBILITY)[number]['value']

export const SUSTAINABILITY = [
  { value: 'sustainable', label: 'Sustainable', tone: 0 },
  { value: 'adjust', label: 'Some adjustment required', tone: 1 },
  { value: 'significant', label: 'Significant consideration required', tone: 2 },
] as const satisfies readonly ScaleOption[]
export type Sustainability = (typeof SUSTAINABILITY)[number]['value']

/**
 * Progression phases. The initials are shown in the progression map, so they must stay distinct:
 * I, P, E, D. The stored value of the third phase remains 'developed' so that reviews already
 * saved in a browser, and JSON exported before the label changed, keep validating.
 */
export const PROGRESSION_PHASES = [
  { value: 'introduced', label: 'Introduced' },
  { value: 'practised', label: 'Practised' },
  { value: 'developed', label: 'Extended' },
  { value: 'demonstrated', label: 'Demonstrated' },
] as const
export type ProgressionPhase = (typeof PROGRESSION_PHASES)[number]['value']

export const ACTION_CATEGORIES = [
  {
    value: 'maintain',
    label: 'Maintain',
    description: 'Areas of existing strong practice that should continue.',
  },
  {
    value: 'enhance',
    label: 'Enhance',
    description: 'Minor changes that could strengthen existing curriculum or assessment.',
  },
  {
    value: 'redesign',
    label: 'Redesign',
    description: 'Areas requiring more significant curriculum or assessment redesign.',
  },
  {
    value: 'integrate',
    label: 'Integrate',
    description: 'Opportunities for purposeful AI integration.',
  },
  {
    value: 'assure',
    label: 'Assure',
    description: 'Areas where stronger evidence of protected human capability is required.',
  },
  {
    value: 'align',
    label: 'Align',
    description: 'Programme-level inconsistencies requiring coordinated decisions.',
  },
  {
    value: 'monitor',
    label: 'Monitor',
    description:
      'Areas affected by rapidly changing AI capabilities which do not currently require intervention.',
  },
] as const
export type ActionCategory = (typeof ACTION_CATEGORIES)[number]['value']

export const ACTION_PRIORITIES = [
  { value: 'high', label: 'High', tone: 3 },
  { value: 'medium', label: 'Medium', tone: 1 },
  { value: 'low', label: 'Low', tone: 0 },
] as const satisfies readonly ScaleOption[]
export type ActionPriority = (typeof ACTION_PRIORITIES)[number]['value']

export const STATEMENT_APPROACHES = [
  { value: 'predominantly_integrated', label: 'Predominantly AI-integrated' },
  { value: 'selectively_integrated', label: 'Selectively AI-integrated' },
  { value: 'balanced', label: 'Balanced between AI-integrated and AI-restricted learning' },
  { value: 'predominantly_restricted', label: 'Predominantly AI-restricted in identified areas' },
  { value: 'mixed', label: 'Discipline-specific/mixed' },
  { value: 'other', label: 'Other' },
] as const
export type StatementApproach = (typeof STATEMENT_APPROACHES)[number]['value']

export const DASHBOARD_AREAS = [
  { id: 'resilience', label: 'AI resilience' },
  { id: 'assurance', label: 'Learning assurance' },
  { id: 'progression', label: 'AI capability progression' },
  { id: 'protected', label: 'Protected human capability' },
  { id: 'coherence', label: 'Assessment portfolio coherence' },
  { id: 'consistency', label: 'Consistency of AI expectations' },
  { id: 'relevance', label: 'Future/disciplinary relevance' },
] as const
export type DashboardArea = (typeof DASHBOARD_AREAS)[number]['id']

/** Common assessment formats — free text is also allowed. */
export const ASSESSMENT_TYPES = [
  'Essay',
  'Report',
  'Written exam (invigilated)',
  'Open-book exam',
  'Take-home exam',
  'Multiple-choice quiz',
  'Presentation',
  'Oral / viva',
  'Practical / lab',
  'Performance',
  'Portfolio',
  'Project',
  'Group project',
  'Case study',
  'Reflective journal',
  'Placement / work-based',
  'Coding assignment',
  'Design / creative artefact',
  'Dissertation / thesis',
  'Other',
] as const

export function optionLabel<T extends string>(
  options: readonly { value: T; label: string }[],
  value: T | '' | undefined | null,
): string {
  if (!value) return ''
  return options.find((o) => o.value === value)?.label ?? value
}
