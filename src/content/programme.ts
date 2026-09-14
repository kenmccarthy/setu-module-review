/** Part A – Programme Review: section text and prompts. */

export const TOOL_PURPOSE = {
  intro:
    'The AI Programme & Module Review Tool supports programme teams to critically review curriculum and assessment in the context of increasingly capable Generative AI.',
  notAiProof:
    'The purpose of the review is not to make assessment “AI-proof”, nor to identify where AI should simply be prohibited. Instead, it supports programme teams to consider whether their curriculum and assessment approaches remain intentional, coherent, authentic and resilient in an AI-enabled environment.',
  enables: [
    'areas of existing strength and resilience;',
    'potential AI-related vulnerabilities;',
    'opportunities for meaningful AI integration;',
    'areas where human capability and independent performance need to be protected and assured;',
    'gaps or duplication in the development of student AI capability;',
    'inconsistencies in expectations across modules;',
    'priorities for curriculum and assessment redesign.',
  ],
  structure:
    'The module reviews provide detailed evidence which feeds into the programme-level review. The final stage brings both together to support programme-level discussion, decision-making and action planning.',
  guidingPrinciple:
    'Can we have confidence that our students are developing and demonstrating the knowledge, skills, judgement and capabilities expected of our graduates in an AI-enabled world?',
}

export const CONTEXT = {
  purpose:
    'Before considering individual assessments, establish the context in which the programme operates.',
  reflectionQuestion:
    'How is AI currently affecting, or likely to affect, the discipline, profession or employment contexts associated with this programme?',
  consider: [
    'changing professional practices;',
    'emerging AI tools;',
    'changing expectations of graduates;',
    'automation of existing tasks;',
    'new forms of human-AI collaboration;',
    'ethical or regulatory considerations;',
    'disciplinary differences in acceptable AI use.',
  ],
}

export const GRADUATE_CAPABILITIES = {
  keyQuestion:
    'What should a graduate of this programme know and be able to do in an AI-enabled world?',
  enduring: {
    title: 'A. Enduring Human Capabilities',
    question: 'Which capabilities remain fundamental regardless of developments in AI?',
  },
  protected: {
    title: 'B. Protected Human Capabilities',
    question:
      'Which capabilities must students be able to demonstrate independently or without inappropriate AI substitution for the programme to have confidence in graduate achievement?',
    prompt: 'What do graduates need to be able to do themselves?',
  },
  humanAi: {
    title: 'C. Human-AI Capabilities',
    question:
      'Which capabilities should graduates be able to demonstrate with AI because responsible AI use is becoming part of disciplinary or professional competence?',
  },
  checkpoint:
    'Do the programme learning outcomes adequately reflect the capabilities graduates now require?',
}

export const PROGRESSION = {
  keyQuestion: 'Where and how do students develop AI capability across the programme?',
  note: 'AI capability should be considered developmentally rather than as a single intervention.',
  instruction: 'For each stage/year, identify where students encounter each capability.',
  reflection: 'Does the programme demonstrate a coherent progression in AI capability?',
  prompts: [
    'Are students expected to use AI before they have been taught how to use it responsibly?',
    'Are the same basic AI capabilities repeatedly addressed across different modules?',
    'Are there gaps where students are expected to possess capabilities that are not explicitly developed?',
    'Is progression visible from introductory AI literacy towards more sophisticated, discipline-specific practice?',
  ],
}

export const PORTFOLIO = {
  purpose:
    'Assessment should be considered as a programme portfolio, rather than as a collection of independent module assessments.',
  instruction: 'Map the major assessments across the programme.',
  aiPositionIntro: 'Select the position that most closely represents the intended role of AI:',
}

export const VULNERABILITY_SECTION = {
  keyQuestion:
    'To what extent could a student use current Generative AI to produce an acceptable assessment output without adequately demonstrating the intended learning?',
  important: [
    'AI vulnerability does not automatically mean that an assessment needs to be redesigned.',
    'Vulnerability should always be considered alongside learning assurance.',
  ],
}

export const ASSURANCE_SECTION = {
  keyQuestion:
    'How confident are we that this assessment provides meaningful evidence that the student has achieved the intended learning?',
  check: [
    'Assessment vulnerability and assessment quality are not the same thing.',
    'A highly AI-vulnerable assessment may still provide strong learning assurance through its design or through complementary assessment elsewhere in the programme.',
    'Conversely, an assessment with low AI vulnerability may still provide poor evidence of meaningful learning.',
  ],
  priorityRule:
    'Programme teams should particularly examine assessments where AI Vulnerability = High/Critical AND Learning Assurance = Low. These assessments should be prioritised for review.',
}

export const COHERENCE = {
  keyQuestion:
    'What experience of AI does a student actually encounter as they move through this programme?',
  note: 'Consider the programme as a whole.',
  questions: [
    { id: 'communicated', text: 'Are expectations around AI clearly communicated across modules?' },
    { id: 'terms', text: 'Are similar terms and categories used?' },
    { id: 'contradictory', text: 'Are students encountering contradictory expectations?' },
    {
      id: 'balance',
      text: 'Is there an appropriate balance between independent human performance and human-AI collaboration?',
    },
    { id: 'progressive', text: 'Are students progressively developing AI capability?' },
    {
      id: 'vulnerable_formats',
      text: 'Are students repeatedly completing assessment formats that are particularly vulnerable to AI substitution?',
    },
    {
      id: 'protected_opportunities',
      text: 'Are there sufficient opportunities for students to demonstrate protected human capabilities?',
    },
    {
      id: 'responsible_practice',
      text: 'Are there opportunities to demonstrate responsible AI-enabled professional practice?',
    },
    { id: 'duplication', text: 'Does the assessment portfolio contain unnecessary duplication?' },
    {
      id: 'workload',
      text: 'Could assessment workload or volume be reduced through a more coordinated programme approach?',
    },
  ],
  overall: 'Overall programme coherence',
}
