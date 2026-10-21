/** Programme AI Integration Statement text, from the redevelopment specification §8. */

export const STATEMENT = {
  title: 'Programme AI Integration Statement',
  lede: 'A concise statement of the programme’s approach to AI, drafted from your programme review for the team to edit and agree. It can be used as supporting documentation for Academic Unit Review, programme review and external review.',
  provisional:
    'A provisional statement can be drafted now. Where module contributions have been added, they can provide supporting examples.',
  approachQuestion: 'Which best describes the programme’s overall approach to AI?',
  approachRationale: 'Why has the programme adopted this approach? (optional)',
  wordGuide: 'Around 400–600 words, where the evidence supports that length.',
  moduleExamples: 'Include supporting examples from module contributions',
  legacy: 'Text from your statement in the previous version',
  legacyIntro:
    'Your team wrote this text in the previous, ten-section statement. It is kept here so you can copy anything you want to reuse.',
}

/** What each generated sentence is based on. */
export const PROVENANCE = {
  existing: {
    label: 'Existing practice',
    description: 'Describes current practice, as recorded in the programme review.',
  },
  proposed: {
    label: 'Proposed development',
    description: 'A priority or opportunity the team has identified; not yet implemented.',
  },
  decision: {
    label: 'Programme-team decision',
    description: 'A judgement or position recorded by the programme team.',
  },
  module: {
    label: 'Module-level observation',
    description: 'Reported by a module team. Not a programme decision.',
  },
  confirm: {
    label: 'To confirm',
    description: 'Missing or carried-over information. Edit or remove before agreeing.',
  },
} as const
export type Provenance = keyof typeof PROVENANCE

export const APPROVAL = {
  heading: 'Status and approval',
  sendForReview: 'Send for programme-team review',
  record: 'Record approval',
  recordIntro:
    'The statement is marked agreed only when you record who approved it and when. Selecting an option elsewhere in the review never approves it.',
  approvedBy: 'Approving programme team or role',
  approvalDate: 'Approval date',
  nextReview: 'Next review date',
  programmeName: 'Programme name',
  markAgreed: 'Mark as agreed',
  returnToDraft: 'Return to draft',
  changedSinceAgreed:
    'The statement has changed since it was agreed. Record approval again, or return it to draft.',
}
