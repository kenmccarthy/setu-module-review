/** Module AI Integration Review text, from the redevelopment specification §6. */

export const MODULE_CONTEXT = {
  lede: 'A few details to identify this module. The module title or code is enough to begin, and a programme review is not needed.',
  programmesHint: 'Optional. A module shared across programmes can list them all.',
}

export const OUTCOMES = {
  heading: 'Are our learning outcomes still appropriate in an AI-enabled context?',
  intro:
    'AI may change how particular tasks are undertaken or what students need to know and be able to do. This does not necessarily mean learning outcomes need to change.',
  main: 'Taking account of developments in AI, do the module learning outcomes remain appropriate?',
  capabilities:
    'Are there particular capabilities students should develop independently or with AI? (optional)',
  changes: 'Any proposed changes or considerations? (optional)',
  detail: 'Review individual learning outcomes (optional)',
  detailIntro:
    'If it helps your discussion, list the module learning outcomes and note any that may need attention. This is not required.',
}

export const TEACHING = {
  heading: 'Are we preparing students appropriately for learning in an AI-enabled environment?',
  intro:
    'Where AI is relevant, students may benefit from opportunities to explore its capabilities, limitations and appropriate use. Some learning activities may also intentionally take place without AI to support independent capability development.',
  q1: 'Does our teaching and learning approach provide appropriate opportunities for students to develop the capabilities they need?',
  q2: 'Where relevant, are students supported to engage with AI critically and responsibly?',
  guidance: 'Guidance: what this might include',
  guidanceItems: [
    'Critical evaluation of AI outputs, including limitations, bias and hallucination',
    'Verification of AI-generated information against reliable sources',
    'Ethical considerations in using AI within the discipline',
    'Privacy and data protection when using AI tools',
    'Copyright, ownership and acknowledgement of AI use',
    'Disciplinary applications of AI in professional practice',
    'Human judgement and oversight of AI-assisted work',
    'Opportunities for independent learning without AI where that capability matters',
  ],
  enhance: 'What, if anything, might we enhance? (optional)',
}

export const ASSESSMENT = {
  heading: 'Does our assessment approach provide appropriate evidence of student learning?',
  intro:
    'The central question is not simply whether AI can complete an assessment task, but whether the assessment continues to provide meaningful evidence that students have achieved the intended learning.',
  empty:
    'No assessments added yet. Add each assessment in the module; three questions are asked for each.',
  role: 'What role should AI play in this assessment?',
  confidence:
    'Taking account of what AI can do, how confident are you that this assessment provides appropriate evidence of student learning?',
  confidenceNote:
    'AI involvement does not automatically weaken an assessment. Consider whether students still demonstrate the intended understanding, judgement, decision-making, creativity, performance or other capabilities.',
  action: 'Does anything need to change?',
  rationale: 'Comments or rationale (optional)',
  advanced: 'Explore Assessment Design in More Detail (optional)',
  advancedIntro:
    'Optional prompts carried forward from the detailed review. They are not needed to complete the module review.',
}

export const REFLECTION = {
  heading: 'What have we learned from this review?',
  workingWell: 'What is working well?',
  enhance: 'What might we enhance?',
  programmeDiscussion: 'What requires programme-level discussion?',
  nextSteps: 'Our next steps',
  nextStepsHint: 'Up to three actions.',
  alignment:
    'Are our decisions about AI within this module aligned with the intended learning and the wider programme approach?',
}

export const MODULE_SUMMARY = {
  contributionHeading: 'Contribution to the Programme AI Integration Statement',
  contributionPrompt: "How does this module contribute to the programme's overall approach to AI?",
  contributionHint:
    'A short contribution, not a full statement. It is shared with the programme team when you export your module contribution.',
  exportHint:
    'Export a module contribution to share this summary with a programme team. They can import it into their programme review; it never changes your module review.',
}
