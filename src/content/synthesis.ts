/** Part C – Programme Synthesis: section text. */

export const SYNTHESIS = {
  intro: 'Once module reviews are completed, return to the programme-level view.',
  patternsIntro:
    'The purpose of the synthesis is not simply to identify individual problematic assessments. Look for programme-level patterns.',
  discussionIntro: 'Having reviewed the evidence, discuss:',
  actionIntro: 'Categorise actions rather than attempting to redesign everything simultaneously.',
  summaryIntro:
    'The completed review should generate a concise summary suitable for programme review and Academic Unit Review processes.',
}

export const PATTERN_DEFINITIONS = [
  {
    id: 'vulnerable_low_assurance',
    text: 'multiple assessments have high AI vulnerability and low learning assurance',
  },
  { id: 'type_overused', text: 'a particular assessment type is overused' },
  { id: 'contradictory', text: 'students experience contradictory AI expectations' },
  { id: 'protected_unassessed', text: 'protected human capabilities are insufficiently assessed' },
  { id: 'integration_unprepared', text: 'AI integration occurs without adequate preparation' },
  { id: 'literacy_gap', text: 'AI literacy is duplicated or absent' },
  { id: 'no_progression', text: 'there is little progression in AI capability' },
  { id: 'volume', text: 'assessment volume could be rationalised' },
  { id: 'integration_opportunity', text: 'opportunities exist for authentic AI integration' },
  { id: 'outcomes_review', text: 'programme or module learning outcomes require review' },
] as const
export type PatternId = (typeof PATTERN_DEFINITIONS)[number]['id']

export const DISCUSSION_QUESTIONS = [
  { id: 'doing_well', text: 'What are we already doing well?' },
  { id: 'vulnerabilities', text: 'Where are our most significant vulnerabilities?' },
  { id: 'protect', text: 'Which capabilities must we continue to protect and assure?' },
  {
    id: 'intentional_ai',
    text: 'Where should AI become a more intentional part of the curriculum?',
  },
  { id: 'independent', text: 'Where is independent student performance important?' },
  { id: 'coherent', text: 'Are our expectations coherent from the student’s perspective?' },
  { id: 'change_now', text: 'What needs to change now?' },
  { id: 'monitor', text: 'What should be monitored rather than immediately changed?' },
] as const
export type DiscussionId = (typeof DISCUSSION_QUESTIONS)[number]['id']
