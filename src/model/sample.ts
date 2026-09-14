import { ReviewSchema, type Review } from './schema'
import { newAction, newAssessment, newLearningOutcome, newModule, newReview } from './defaults'
import {
  ENDURING_CAPABILITIES,
  HUMAN_AI_CAPABILITIES,
  PROTECTED_CAPABILITIES,
} from '../content/capabilities'

const pick = (list: { id: string; label: string }[], ...labels: string[]) =>
  list
    .filter((c) => labels.includes(c.label))
    .map((c) => ({ id: c.id, label: c.label, custom: false }))

/** A worked example used for demos and tests. */
export function buildSampleReview(): Review {
  const r = newReview()
  const p = r.programme
  p.title = 'BSc (Hons) in Business Information Systems'
  p.nfqLevel = '8'
  p.duration = '4 years'
  p.stages = 4
  p.coordinator = 'Dr A. Example'
  p.academicUnit = 'School of Business'
  p.reviewDate = '2026-09-01'
  p.team = 'Programme board members and module leaders'
  p.disciplineReflection =
    'reshaping analyst and consultancy roles: routine reporting, documentation and first-draft code are increasingly automated, while employers expect graduates to specify, evaluate and govern AI-enabled systems'
  p.enduringCapabilities = pick(
    ENDURING_CAPABILITIES,
    'Disciplinary knowledge',
    'Critical thinking',
    'Communication',
    'Professional judgement',
    'Problem solving',
  )
  p.protectedCapabilities = pick(
    PROTECTED_CAPABILITIES,
    'Foundational disciplinary knowledge',
    'Critical thinking',
    'Professional judgement',
    'Interpersonal communication',
  )
  p.protectedNotes =
    'invigilated examinations in stage 1 and 2, observed client presentations and an oral defence of the final-year project'
  p.humanAiCapabilities = pick(
    HUMAN_AI_CAPABILITIES,
    'Selecting appropriate AI tools',
    'Evaluating AI-generated outputs',
    'Responsible and ethical AI use',
    'Integrating AI into disciplinary workflows',
    'Documenting or communicating AI use',
  )
  p.ploCheckpoint = 'mostly'
  p.ploAction = 'Add an explicit programme outcome on responsible AI-enabled practice.'
  p.progression = {
    'literacy:1': ['introduced', 'practised'],
    'ethics:1': ['introduced'],
    'genai:2': ['introduced', 'practised'],
    'evaluation:2': ['introduced'],
    'evaluation:3': ['developed'],
    'discipline:3': ['introduced', 'practised'],
    'oversight:3': ['introduced'],
    'discipline:4': ['developed', 'demonstrated'],
    'oversight:4': ['demonstrated'],
    'agentic:4': ['introduced'],
  }
  p.progressionRating = 'adequate'
  p.coherenceAnswers = {
    communicated:
      'Module descriptors use different wording; a common AI position statement is needed in every assessment brief.',
    contradictory:
      'Stage 2 students reported being told AI was banned in one module and required in another without explanation.',
  }
  p.coherenceRating = 'review'
  p.coherenceObservations = 'The portfolio relies heavily on individual reports in stages 2 and 3.'

  const m1 = newModule(1)
  m1.code = 'BIS101'
  m1.title = 'Introduction to Information Systems'
  m1.credits = '10'
  m1.leader = 'Dr B. Example'
  m1.contextReflection =
    'Students now arrive using AI tools daily; the module must build foundational literacy and expectations early.'
  const lo1 = newLearningOutcome()
  lo1.text = 'Explain the role of information systems in organisations.'
  lo1.rating = 'appropriate'
  const lo2 = newLearningOutcome()
  lo2.text = 'Use standard office and collaboration tools to produce business documents.'
  lo2.rating = 'significant'
  lo2.comments =
    'Largely automated by AI; reframe around evaluating and adapting AI-generated documents.'
  m1.learningOutcomes = [lo1, lo2]
  m1.ltRating = 'adequate'
  m1.ltActions = 'Add a two-week AI literacy block with hands-on evaluation of AI outputs.'
  const a1 = newAssessment()
  Object.assign(a1, {
    title: 'End-of-semester examination',
    semester: '1',
    weighting: '60',
    type: 'Written exam (invigilated)',
    outcomeIds: [lo1.id],
    purpose: 'Foundational disciplinary knowledge and understanding.',
    aiCanDo: ['complete'],
    vulnerability: 'low',
    vulnerabilityReason: 'Invigilated, closed-book.',
    position: 'restricted',
    positionRationale: 'Foundational knowledge must be held independently.',
    assurance: 'high',
    assuranceEvidence: ['observation'],
    protectedCapabilities: pick(PROTECTED_CAPABILITIES, 'Foundational disciplinary knowledge'),
    humanAgencyEvidence: 'yes',
    processDecision: 'sufficient',
    authenticityRating: 'adequate',
    practicalityRating: 'sustainable',
  })
  const a2 = newAssessment()
  Object.assign(a2, {
    title: 'Business report',
    semester: '2',
    weighting: '40',
    type: 'Report',
    outcomeIds: [lo2.id],
    purpose: 'Apply IS concepts to a small organisation and communicate recommendations.',
    aiCanDo: ['complete', 'sections', 'research', 'rewrite'],
    vulnerability: 'critical',
    vulnerabilityReason: 'A generic 2,000-word report on a case study can be fully generated.',
    position: 'limited',
    positionRationale:
      'Students may use AI for structure and language but must interpret the specific organisation.',
    assurance: 'low',
    assuranceNotes: 'No process evidence and no dialogue with the student.',
    protectedCapabilities: pick(PROTECTED_CAPABILITIES, 'Critical thinking'),
    humanAgencyEvidence: 'partially',
    processApproaches: ['staged', 'ai_records'],
    processDecision: 'redesign',
    processAction:
      'Replace with a staged, contextualised report on a local organisation plus a short viva.',
    authenticityRating: 'review',
    authenticityNotes:
      'Report writing with AI is authentic practice; the assessment should test judgement, not drafting.',
    equityIssues: 'Not all students have paid AI subscriptions.',
    equityActions: 'Use the institutional AI tool for all AI-permitted work.',
    practicalityRating: 'adjust',
    practicalityNotes: 'Viva adds marking time for a cohort of 120.',
  })
  m1.assessments = [a1, a2]

  const m2 = newModule(3)
  m2.code = 'BIS301'
  m2.title = 'Systems Analysis and Design'
  m2.credits = '10'
  m2.leader = 'Dr C. Example'
  m2.contextReflection =
    'AI can generate requirements documents and models; the skill now lies in eliciting, validating and governing them.'
  const lo3 = newLearningOutcome()
  lo3.text = 'Elicit and model requirements for an information system.'
  lo3.rating = 'minor'
  m2.learningOutcomes = [lo3]
  m2.ltRating = 'strong'
  const a3 = newAssessment()
  Object.assign(a3, {
    title: 'Client project with presentation',
    semester: '2',
    weighting: '100',
    type: 'Group project',
    outcomeIds: [lo3.id],
    purpose: 'Elicit real client requirements, produce a design and defend it.',
    aiCanDo: ['sections', 'ideas', 'simulate', 'feedback'],
    aiCanDoNotes: 'AI is used intentionally to draft and critique models.',
    vulnerability: 'high',
    vulnerabilityReason:
      'Documentation can be generated, but the client interaction and defence cannot.',
    position: 'integrated',
    positionRationale:
      'Analysts use AI in practice; students must show they can direct and evaluate it.',
    assurance: 'high',
    assuranceEvidence: ['defence', 'authentic', 'staged', 'dialogue'],
    protectedCapabilities: pick(
      PROTECTED_CAPABILITIES,
      'Professional judgement',
      'Interpersonal communication',
    ),
    humanAgencyEvidence: 'yes',
    processApproaches: ['staged', 'ai_records', 'defence'],
    processDecision: 'sufficient',
    authenticityRating: 'strong',
    practicalityRating: 'sustainable',
    aiCapabilityDeveloped: 'Integrating AI into analysis workflows and documenting its use',
  })
  m2.assessments = [a3]

  r.modules = [m1, m2]

  r.synthesis.dashboard = {}
  r.synthesis.discussion = {
    doing_well:
      'Stage 3 and 4 project work already integrates AI with strong assurance through client contact and defence.',
    vulnerabilities: 'Stage 1 and 2 individual reports.',
    independent: 'foundational knowledge and client-facing communication',
    intentional_ai: 'analysis, design and documentation work from stage 3 onwards',
    monitor: 'Agentic tools for end-to-end system generation.',
  }
  r.synthesis.actions = [
    newAction({
      text: 'Adopt the common AI position categories in every assessment brief.',
      category: 'align',
      scope: 'programme',
      priority: 'high',
      owner: 'Programme board',
      timescale: 'Before next academic year',
      reviewPoint: 'Annual monitoring',
    }),
    newAction({
      text: 'Redesign the stage 1 business report as a staged, contextualised task with a short viva.',
      category: 'redesign',
      scope: 'module',
      moduleId: m1.id,
      priority: 'high',
      owner: 'Module leader',
      timescale: 'Semester 2',
      reviewPoint: 'Exam board',
    }),
    newAction({
      text: 'Keep the stage 3 client project as the model of AI-integrated assessment.',
      category: 'maintain',
      scope: 'module',
      moduleId: m2.id,
      priority: 'low',
      owner: 'Module leader',
      timescale: 'Ongoing',
      reviewPoint: 'Annual monitoring',
    }),
    newAction({
      text: 'Watch developments in agentic tools that could complete full system builds.',
      category: 'monitor',
      scope: 'programme',
      priority: 'medium',
      owner: 'Programme coordinator',
      timescale: 'Ongoing',
      reviewPoint: 'Annual monitoring',
    }),
  ]
  r.statement.approach = 'selectively_integrated'
  r.statement.approachRationale =
    'AI is integrated where it mirrors professional analyst practice and restricted where foundational knowledge or client communication must be demonstrated independently.'
  r.statement.nextReviewDate = '2027-09-01'
  return ReviewSchema.parse(r)
}

export function loadSampleReview(): Review {
  return buildSampleReview()
}
