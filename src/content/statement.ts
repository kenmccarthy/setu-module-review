/** Part D – AI Integration Statement: prompts, stems and template text. */

export const STATEMENT_PURPOSE = {
  intro:
    'Following completion of the Programme and Module Review, the programme team should develop an AI Integration Statement. The statement provides a concise, evidence-informed explanation of how the programme approaches Generative AI across curriculum, teaching, learning and assessment.',
  intended: [
    'articulate the programme team’s collective approach to AI;',
    'demonstrate that decisions about AI are intentional and educationally grounded;',
    'explain how the programme responds to changes within the discipline or profession;',
    'demonstrate how appropriate human capabilities continue to be developed and assured;',
    'identify where and why AI capability is developed;',
    'demonstrate coherence and progression across the programme;',
    'provide evidence of considered curriculum and assessment design during quality assurance, programme review and external review processes.',
  ],
  caveats: [
    'The statement should not attempt to demonstrate that a programme is “AI-proof”.',
    'Neither should programmes feel required to maximise the amount of AI integration.',
    'The purpose is to demonstrate that the programme team has considered the implications of AI and can provide a clear educational rationale for the approach adopted.',
  ],
  keyQuestion:
    '“What is your programme’s approach to AI, why have you adopted this approach, and how can you demonstrate that graduates continue to achieve the knowledge, skills and capabilities expected of the award?”',
  keyQuestionNote:
    'The strength of the response lies not in the amount of AI used or restricted, but in the programme team’s ability to demonstrate that its decisions are intentional, coherent, evidence-informed and educationally justified.',
}

export interface StatementSectionDef {
  id: string
  number: number
  title: string
  prompt: string
  consider: string[]
  /** Sentence stems shown to the team (one or more). */
  stems: string[]
  extra?: string
}

export const STATEMENT_SECTIONS: StatementSectionDef[] = [
  {
    id: 'context',
    number: 1,
    title: 'Programme Context and Position',
    prompt:
      'How is Generative AI affecting the discipline, profession or wider context for which this programme prepares graduates?',
    consider: [
      'developments within the discipline;',
      'changes in professional practice;',
      'emerging tools and workflows;',
      'employer or professional expectations;',
      'ethical, regulatory or societal considerations;',
      'the anticipated future role of AI within the field.',
    ],
    stems: ['This programme recognises that Generative AI is…'],
  },
  {
    id: 'rationale',
    number: 2,
    title: 'Educational Rationale',
    prompt: 'What principles underpin the programme’s overall approach to AI?',
    consider: [
      'programme learning outcomes;',
      'disciplinary expectations;',
      'professional practice;',
      'graduate attributes;',
      'academic integrity;',
      'authentic assessment;',
      'student learning;',
      'human agency;',
      'ethical and responsible AI use.',
    ],
    stems: [
      'Our approach to AI integration is driven primarily by the learning needs of our students and the capabilities expected of graduates. Decisions regarding AI use are therefore determined by…',
    ],
    extra:
      'Explain why the programme has adopted its particular balance between independent human capability and AI-enabled practice.',
  },
  {
    id: 'protected',
    number: 3,
    title: 'Protected Human Capabilities',
    prompt:
      'Which capabilities must graduates of this programme be able to demonstrate independently or without inappropriate AI substitution?',
    consider: [
      'foundational disciplinary knowledge;',
      'critical thinking;',
      'professional judgement;',
      'ethical reasoning;',
      'creativity;',
      'practical or technical skills;',
      'interpersonal communication;',
      'problem solving;',
      'performance;',
      'decision-making.',
    ],
    stems: [
      'The programme identifies the following as particularly important protected human capabilities:',
      'These capabilities are developed and assured through…',
    ],
    extra:
      'Identify the modules and/or assessments providing particularly strong evidence of these capabilities.',
  },
  {
    id: 'ai_enabled',
    number: 4,
    title: 'AI-Enabled Graduate Capabilities',
    prompt: 'What should graduates of this programme be capable of doing with AI?',
    consider: [
      'appropriate selection and use of AI tools;',
      'effective human-AI collaboration;',
      'critical evaluation of AI outputs;',
      'recognition of hallucination, bias and limitations;',
      'verification;',
      'ethical and responsible AI use;',
      'disciplinary application;',
      'human oversight;',
      'transparency;',
      'advanced or agentic AI practice where appropriate.',
    ],
    stems: ['Graduates of this programme are expected to develop the ability to use AI…'],
    extra: 'Where are these capabilities introduced, developed and demonstrated?',
  },
  {
    id: 'assessment',
    number: 5,
    title: 'Approach to Assessment',
    prompt:
      'How does the programme ensure that assessment remains meaningful and provides appropriate assurance of learning in an AI-enabled environment?',
    consider: [
      'balance between AI-restricted and AI-integrated assessment;',
      'authentic assessment;',
      'process visibility;',
      'oral/practical/performance elements;',
      'contextualised tasks;',
      'opportunities for independent demonstration;',
      'opportunities for responsible AI-enabled practice;',
      'complementary assessment approaches.',
    ],
    stems: [
      'Assessment across the programme has been reviewed as a portfolio rather than as a collection of isolated assessment tasks. This enables the programme team to…',
    ],
    extra:
      'The statement should explain the portfolio approach, rather than attempting to justify every individual assessment. The team should be able to explain where independent student capability is assured, where AI use is intentionally integrated into assessment, and why this balance is educationally appropriate.',
  },
  {
    id: 'resilience',
    number: 6,
    title: 'AI Vulnerability and Assessment Resilience',
    prompt:
      'What did the review reveal about potential AI vulnerabilities within the assessment portfolio and how has the programme responded?',
    consider: [
      'no change required because sufficient learning assurance already exists;',
      'enhanced process visibility;',
      'assessment redesign;',
      'greater contextualisation;',
      'oral or practical verification;',
      'integration of AI;',
      'revised student guidance;',
      'complementary assessment elsewhere in the programme.',
    ],
    stems: [
      'The programme review identified…',
      'Where assessments demonstrated higher levels of AI vulnerability, these were considered alongside the level of learning assurance provided. As a result…',
    ],
    extra:
      'The purpose is not to claim that assessments cannot be completed using AI. Instead, demonstrate that the programme team has identified where AI could potentially obscure evidence of student learning and has considered whether sufficient learning assurance remains.',
  },
  {
    id: 'journey',
    number: 7,
    title: 'Student AI Capability Journey',
    prompt:
      'What does the student’s experience of AI look like as they progress through the programme?',
    consider: [],
    stems: [
      'Students encounter AI progressively throughout the programme. At the early stages…',
      'As students progress…',
      'By graduation, students are expected to…',
    ],
    extra:
      'Rather than treating AI literacy as a one-off activity, explain how students move from foundational understanding towards increasingly sophisticated and discipline-appropriate practice.',
  },
  {
    id: 'consistency',
    number: 8,
    title: 'Consistency and Transparency',
    prompt: 'How does the programme ensure that students understand what is expected of them?',
    consider: [
      'common terminology;',
      'clear assessment instructions;',
      'consistency between modules;',
      'explanation of permitted/restricted AI use;',
      'expectations regarding acknowledgement or transparency;',
      'opportunities for students to seek clarification.',
    ],
    stems: [
      'The programme team has adopted a coordinated approach to communicating expectations regarding AI…',
    ],
  },
  {
    id: 'equity',
    number: 9,
    title: 'Equity, Responsibility and Sustainability',
    prompt:
      'How does the programme ensure that its approach to AI is responsible, equitable and sustainable?',
    consider: [
      'equitable access;',
      'accessibility;',
      'institutional tool provision;',
      'privacy and data protection;',
      'intellectual property and copyright;',
      'bias;',
      'environmental implications;',
      'ethical use;',
      'student and staff AI literacy.',
    ],
    stems: [
      'AI integration within the programme is informed by SETU’s principles for responsible AI use. In particular, the programme considers…',
    ],
  },
  {
    id: 'review',
    number: 10,
    title: 'Review and Continuous Development',
    prompt:
      'AI capabilities and disciplinary practices are changing rapidly. How will the programme keep its approach under review?',
    consider: [
      'annual programme monitoring;',
      'student feedback;',
      'external examiner feedback;',
      'industry/professional input;',
      'changes to AI capability;',
      'changes to institutional guidance;',
      'curriculum and assessment review.',
    ],
    stems: [
      'The programme recognises that AI integration is an evolving area rather than a one-time curriculum intervention. The programme team will therefore…',
    ],
  },
]
export type StatementSectionId = (typeof STATEMENT_SECTIONS)[number]['id']

export const EVIDENCE_AREAS = [
  { id: 'disciplinary_impact', label: 'Disciplinary impact of AI' },
  { id: 'protected', label: 'Protected human capabilities' },
  { id: 'ai_enabled', label: 'AI-enabled graduate capabilities' },
  { id: 'progression', label: 'AI capability progression' },
  { id: 'resilience', label: 'Assessment resilience' },
  { id: 'assurance', label: 'Independent learning assurance' },
  { id: 'responsible', label: 'Responsible AI' },
  { id: 'consistency', label: 'Consistency of expectations' },
  { id: 'actions', label: 'Actions arising from review' },
] as const
export type EvidenceAreaId = (typeof EVIDENCE_AREAS)[number]['id']
