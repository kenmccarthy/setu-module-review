/** Programme AI Integration Review text, from the redevelopment specification §5. */

export const PROGRAMME_CONTEXT = {
  title: 'Programme context',
  lede: 'A few details to identify this review. Only the programme title is needed to begin; everything else can be added later.',
  disciplineQuestion:
    'How is AI affecting our discipline and the professional practice our graduates will enter?',
  disciplineHint:
    'Optional. A sentence or two is enough; it helps introduce the Programme AI Integration Statement.',
  stagesHint: 'Used for the AI capability progression map.',
}

export const CAPABILITIES = {
  heading: 'What should our graduates be able to do in an AI-enabled world?',
  intro:
    'AI is changing how knowledge is accessed, how tasks are undertaken and how professional practices evolve. This provides an opportunity to consider both the capabilities graduates must demonstrate independently and those they should develop through appropriate AI use.',
  q1: 'What knowledge, skills and capabilities must our graduates be able to demonstrate independently of AI?',
  q2: 'What should our graduates be able to do effectively, critically and responsibly with AI?',
  q3: 'Do our programme learning outcomes adequately reflect the capabilities graduates now require?',
  suggestions: 'Optional capability suggestions',
  comments: 'Comments or actions (optional)',
}

export const PROGRESSION = {
  heading: 'How do students develop their AI capabilities as they progress through the programme?',
  intro:
    'Students should have opportunities to build and deepen their AI capabilities throughout the programme, rather than encountering AI learning as a one-off activity.',
  instruction:
    'Mark where each capability is Introduced (I), Practised (P), Extended (E) or Demonstrated (D). Leave a cell empty where it does not apply.',
  reflection: 'Does the map suggest a coherent progression of AI capability across the programme?',
  gaps: 'Are there significant gaps, overlaps or opportunities for development? (optional)',
  unconfirmed:
    'Some cells were carried over from the previous version, where these capabilities were mapped separately. They are outlined in amber until you confirm them.',
}

export const CURRICULUM = {
  heading:
    'Does our curriculum and assessment approach remain appropriate in an AI-enabled environment?',
  intro:
    'Some assessments may benefit from intentional AI integration, while others may require students to demonstrate particular capabilities independently. The key consideration is whether the programme provides appropriate opportunities to develop and demonstrate the intended learning.',
  q1: 'Are we confident that students have sufficient opportunities to demonstrate the knowledge, skills and judgement expected of graduates?',
  q2: 'Does our assessment approach provide an appropriate balance between independent student performance and responsible AI-enabled practice?',
  q3: 'Are there areas where AI capabilities may affect our confidence in how student learning is demonstrated? (optional)',
  modules: 'Modules or assessments requiring further consideration (optional)',
  overview: 'Assessment overview from module reviews',
  overviewIntro:
    'Drawn from the module reviews linked to this programme. These are the module teams’ own observations, shown for discussion; they are not programme decisions.',
  overviewEmpty:
    'No module reviews are linked to this programme yet. This section can be completed without them; module contributions can be added at any time.',
}

export const COHERENCE = {
  heading: 'Are we taking a coordinated approach to AI across the programme?',
  intro:
    'Students encounter AI expectations across multiple modules, lecturers and assessments. A coordinated approach can help ensure these expectations are clear, consistent and educationally appropriate.',
  prompts: 'Prompts for discussion (optional)',
  promptHint: 'Open any prompt to note your discussion.',
  main: 'How would we describe our current programme approach?',
  strengthen: 'What would help strengthen our programme approach? (optional)',
}

export const PRIORITIES = {
  heading: 'What have we learned from this review?',
  strengths: {
    label: 'Our strengths',
    hint: 'What aspects of our current approach are working well?',
  },
  opportunities: {
    label: 'Our opportunities',
    hint: 'Where could we strengthen curriculum, assessment or AI capability development?',
  },
  priorities: {
    label: 'Our priorities',
    hint: 'What are the most important next steps for our programme? Up to three.',
  },
  questions: {
    label: 'Questions for module teams',
    hint: 'Are there particular questions we would like module leaders to consider through the Module AI Integration Review?',
  },
  exportHint:
    'Export the priorities and questions as a file module leaders can import into their module reviews. They appear there as optional prompts, not instructions.',
}

export const SUMMARY = {
  title: 'Programme review summary',
  lede: 'A concise record of the review, generated from your responses. Edit any section to change it here.',
  statementHint:
    'A provisional Programme AI Integration Statement can be drafted now; module reviews are not required.',
}
