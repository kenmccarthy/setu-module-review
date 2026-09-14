/** Capability preset lists from the specification. Teams can add their own. */

export interface CapabilityPreset {
  id: string
  label: string
}

const preset = (prefix: string, labels: string[]): CapabilityPreset[] =>
  labels.map((label) => ({
    id: `${prefix}:${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    label,
  }))

/** 2A – capabilities that remain fundamental regardless of developments in AI. */
export const ENDURING_CAPABILITIES = preset('enduring', [
  'Disciplinary knowledge',
  'Critical thinking',
  'Creativity',
  'Communication',
  'Professional judgement',
  'Ethical reasoning',
  'Problem solving',
  'Interpersonal skills',
  'Practical or technical skills',
])

/** 2B / 12 / Statement §3 – capabilities students must demonstrate independently. */
export const PROTECTED_CAPABILITIES = preset('protected', [
  'Foundational disciplinary knowledge',
  'Critical thinking',
  'Professional judgement',
  'Ethical reasoning',
  'Creativity',
  'Practical or technical skills',
  'Interpersonal communication',
  'Problem solving',
  'Performance',
  'Decision-making',
  'Interpretation',
  'Personal response',
  'Disciplinary reasoning',
])

/** 2C – capabilities graduates should demonstrate with AI. */
export const HUMAN_AI_CAPABILITIES = preset('human-ai', [
  'Selecting appropriate AI tools',
  'Effective interaction with AI systems',
  'Evaluating AI-generated outputs',
  'Recognising hallucination, bias and error',
  'Responsible and ethical AI use',
  'Integrating AI into disciplinary workflows',
  'Exercising human judgement and oversight',
  'Documenting or communicating AI use',
])

/** 3 – AI capability progression rows. */
export const PROGRESSION_CAPABILITIES = [
  { id: 'literacy', label: 'AI literacy' },
  { id: 'ethics', label: 'Responsible/ethical AI use' },
  { id: 'genai', label: 'Effective use of GenAI' },
  { id: 'evaluation', label: 'Critical evaluation of AI outputs' },
  { id: 'discipline', label: 'Discipline-specific AI use' },
  { id: 'oversight', label: 'Human oversight and judgement' },
  { id: 'agentic', label: 'Advanced/agentic AI practice, where relevant' },
] as const
export type ProgressionCapabilityId = (typeof PROGRESSION_CAPABILITIES)[number]['id']

/** 11 – what current Generative AI could reasonably do within an assessment. */
export const AI_CAN_DO = [
  { id: 'complete', label: 'Generate the complete output' },
  { id: 'sections', label: 'Generate substantial sections' },
  { id: 'research', label: 'Undertake research or synthesis' },
  { id: 'ideas', label: 'Generate ideas' },
  { id: 'problems', label: 'Solve problems' },
  { id: 'code', label: 'Produce code' },
  { id: 'data', label: 'Analyse data' },
  { id: 'creative', label: 'Generate creative material' },
  { id: 'rewrite', label: 'Translate or rewrite' },
  { id: 'feedback', label: 'Provide feedback' },
  { id: 'simulate', label: 'Simulate professional processes' },
  { id: 'agentic', label: 'Operate tools or complete multi-stage tasks through agentic systems' },
] as const

/** 6 – forms of evidence that support learning assurance. */
export const ASSURANCE_EVIDENCE = [
  { id: 'defence', label: 'Student explanation or defence' },
  { id: 'authentic', label: 'Application to authentic contexts' },
  { id: 'staged', label: 'Staged/process evidence' },
  { id: 'contextual', label: 'Personal or contextualised decision-making' },
  { id: 'observation', label: 'Observation' },
  { id: 'performance', label: 'Performance' },
  { id: 'practical', label: 'Practical demonstration' },
  { id: 'dialogue', label: 'Dialogue' },
  { id: 'reflection', label: 'Reflection' },
  { id: 'synthesis', label: 'Synthesis across multiple sources' },
  { id: 'other', label: 'Other evidence of student thinking and judgement' },
] as const

/** 12 – aspects of human agency. */
export const HUMAN_AGENCY_ASPECTS = [
  'decision-making',
  'critical judgement',
  'interpretation',
  'creativity',
  'personal response',
  'disciplinary reasoning',
  'professional judgement',
  'ethical reasoning',
  'communication',
  'practical performance',
]

/** 13 – approaches to process visibility. */
export const PROCESS_VISIBILITY_APPROACHES = [
  { id: 'staged', label: 'Staged submissions' },
  { id: 'drafts', label: 'Drafts' },
  { id: 'planning', label: 'Planning documents' },
  { id: 'annotations', label: 'Annotations' },
  { id: 'reflective', label: 'Reflective commentary' },
  { id: 'logs', label: 'Decision logs' },
  { id: 'ai_records', label: 'AI-use records where educationally appropriate' },
  { id: 'checkpoints', label: 'Tutorials/checkpoints' },
  { id: 'peer', label: 'Peer discussion' },
  { id: 'oral', label: 'Oral explanation' },
  { id: 'defence', label: 'Presentation or defence' },
] as const

/** 15 – equity considerations. */
export const EQUITY_CONSIDERATIONS = [
  'access to paid AI systems',
  'accessibility',
  'digital confidence',
  'language',
  'prior experience',
  'availability of institutional tools',
  'privacy and data protection',
  'reasonable accommodations',
]

/** 16 – practicality considerations. */
export const PRACTICALITY_CONSIDERATIONS = [
  'cohort size',
  'marking workload',
  'staff capacity',
  'availability of technology',
  'student workload',
  'scalability',
  'unnecessary additional assessment',
  'environmental impact of AI use where relevant',
]
