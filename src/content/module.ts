/** Part B – Module & Assessment Review: section text and prompts. */

export const MODULE_CONTEXT = {
  keyQuestion:
    'Has Generative AI changed anything significant about what students need to learn in this module or how they might demonstrate that learning?',
}

export const LEARNING_OUTCOMES = {
  instruction: 'Review each module learning outcome.',
  askEach: [
    'Is this learning outcome still relevant in an AI-enabled context?',
    'Could a student appear to achieve this outcome through AI-generated output without actually possessing the intended capability?',
    'Does AI change the level or nature of capability we should now expect?',
    'Should AI capability itself form part of this outcome?',
    'Does this outcome represent a protected human capability that students should be able to demonstrate independently?',
  ],
}

export const LEARNING_TEACHING = {
  keyQuestion:
    'Are students being prepared for the expectations they will encounter in assessment?',
  consider: [
    'opportunities to explore appropriate AI use;',
    'explicit AI literacy development;',
    'opportunities to critically evaluate AI outputs;',
    'discipline-specific examples;',
    'discussion of limitations, bias and hallucination;',
    'ethical, privacy, copyright and sustainability considerations;',
    'opportunities to practise without AI where independent capability is important;',
    'human judgement and oversight;',
    'transparency about expectations.',
  ],
}

export const ASSESSMENT_REVIEW = {
  instruction: 'Complete this section for each assessment within the module.',
  purpose: {
    question: 'What is this assessment intended to evidence?',
    prompt: 'What knowledge, skill, judgement or capability do we need the student to demonstrate?',
  },
  aiCapability: {
    question: 'What could current Generative AI reasonably do within this assessment?',
  },
  vulnerability: {
    question:
      'Could a student produce an acceptable submission using AI while bypassing important learning?',
  },
  position: {
    question: 'Which position is educationally appropriate for this assessment?',
    reflection: 'Why is this the appropriate position?',
    note: 'The decision should derive from the intended learning rather than from a general preference either for or against AI.',
  },
  assurance: {
    question:
      'How confident are we that this assessment provides meaningful evidence that the student has achieved the intended learning?',
  },
}

export const HUMAN_AGENCY = {
  keyQuestion: 'Where does meaningful human agency need to remain visible within this assessment?',
  ask: 'Can the assessment currently provide sufficient evidence of this human contribution?',
}

export const PROCESS_VISIBILITY_SECTION = {
  keyQuestion:
    'Do we need greater visibility of the student’s learning process rather than relying solely on the final product?',
}

export const AUTHENTICITY = {
  keyQuestion:
    'Does this assessment reflect meaningful disciplinary, professional or real-world practice?',
  consider: [
    'Does the task require contextual judgement?',
    'Does it involve authentic decision-making?',
    'Would AI reasonably be used for this activity outside education?',
    'If yes, should students learn to use it here?',
    'Does the assessment test activities that AI has substantially automated while failing to assess the higher-level judgement now required?',
  ],
}

export const EQUITY = {
  keyQuestion: 'Could the proposed approach to AI create unintended inequalities?',
}

export const PRACTICALITY = {
  keyQuestion: 'Is the proposed assessment approach practical and sustainable?',
  important: [
    'AI resilience should not automatically result in more assessment.',
    'Where possible, redesign should seek to improve the quality of evidence rather than increase the quantity of assessment.',
  ],
}
