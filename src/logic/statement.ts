import type { Review } from '../model/schema'
import { ACTION_CATEGORIES, AI_POSITIONS, QUALITY, optionLabel } from '../content/scales'
import { PROGRESSION_CAPABILITIES } from '../content/capabilities'
import {
  EVIDENCE_AREAS,
  STATEMENT_SECTIONS,
  type EvidenceAreaId,
  type StatementSectionId,
} from '../content/statement'
import { allAssessments, assessmentLabel, priorityAssessments, watchAssessments } from './flags'
import { detectPatterns } from './patterns'
import { effectiveDashboard } from './dashboard'
import { formatDate, joinList, lower, plural, sentence } from './text'

const APPROACH_PHRASE: Record<string, string> = {
  predominantly_integrated: 'predominantly AI-integrated',
  selectively_integrated: 'selectively AI-integrated',
  balanced: 'balanced between AI-integrated and AI-restricted learning',
  predominantly_restricted: 'predominantly AI-restricted in identified areas',
  mixed: 'discipline-specific and mixed',
}

const PLACEHOLDER = (hint: string) => `[${hint}]`

function approachPhrase(review: Review): string {
  const s = review.statement
  if (s.approach === 'other') return s.approachOther.trim() || PLACEHOLDER('describe the approach')
  return APPROACH_PHRASE[s.approach] ?? PLACEHOLDER('selective / balanced / integrated…')
}

function protectedLabels(review: Review): string[] {
  return review.programme.protectedCapabilities.map((c) => lower(c.label))
}
function humanAiLabels(review: Review): string[] {
  return review.programme.humanAiCapabilities.map((c) => lower(c.label))
}

function positionMix(review: Review): string {
  const refs = allAssessments(review)
  const present = AI_POSITIONS.filter((o) =>
    refs.some((r) => r.assessment.position === o.value),
  ).map((o) => lower(o.label.replace(/^AI /, 'AI-')))
  return present.length
    ? joinList(present)
    : PLACEHOLDER('AI-restricted / bounded / integrated / open')
}

function assuredExamples(review: Review): string {
  const refs = allAssessments(review).filter(
    (r) =>
      (r.assessment.position === 'restricted' || r.assessment.position === 'limited') &&
      r.assessment.assurance === 'high',
  )
  const fallback = allAssessments(review).filter((r) => r.assessment.assurance === 'high')
  const list = (refs.length ? refs : fallback).slice(0, 4).map(assessmentLabel)
  return list.length
    ? joinList(list)
    : PLACEHOLDER('examples of assessments assuring independent capability')
}

function integratedExamples(review: Review): string {
  const list = allAssessments(review)
    .filter((r) => r.assessment.position === 'integrated' || r.assessment.position === 'open')
    .slice(0, 4)
    .map(assessmentLabel)
  return list.length ? joinList(list) : PLACEHOLDER('examples of AI-integrated assessment')
}

function stageSummary(review: Review, stage: number): string[] {
  const p = review.programme.progression
  return PROGRESSION_CAPABILITIES.filter((c) => (p[`${c.id}:${stage}`] ?? []).length > 0).map((c) =>
    lower(c.label.replace(/, where relevant$/, '')),
  )
}

function resilienceResponses(review: Review): string {
  const actions = review.synthesis.actions
  const refs = allAssessments(review)
  const responses: string[] = []
  if (
    actions.some((a) => a.category === 'redesign') ||
    refs.some((r) => r.assessment.processDecision === 'redesign')
  )
    responses.push('redesigned assessment')
  if (
    refs.some(
      (r) => r.assessment.processDecision === 'minor' || r.assessment.processApproaches.length > 0,
    )
  )
    responses.push('increased process visibility')
  if (
    refs.some((r) =>
      r.assessment.assuranceEvidence.some((e) =>
        ['defence', 'dialogue', 'performance', 'practical', 'observation'].includes(e),
      ),
    )
  )
    responses.push('introduced oral, practical or observed verification')
  if (
    actions.some((a) => a.category === 'integrate') ||
    refs.some((r) => r.assessment.position === 'integrated')
  )
    responses.push('integrated AI where it forms part of professional practice')
  if (
    refs.some(
      (r) =>
        (r.assessment.vulnerability === 'high' || r.assessment.vulnerability === 'critical') &&
        r.assessment.assurance === 'high',
    )
  )
    responses.push('determined that existing assurance is sufficient for some assessments')
  return responses.length
    ? joinList(responses)
    : PLACEHOLDER(
        'redesigned assessment / increased process visibility / introduced verification / integrated AI / determined that existing assurance is sufficient',
      )
}

/** Generate the draft narrative for each statement section. */
export function generateStatementDrafts(review: Review): Record<StatementSectionId, string> {
  const p = review.programme
  const refs = allAssessments(review)
  const priority = priorityAssessments(review)
  const watch = watchAssessments(review)
  const patterns = Object.fromEntries(detectPatterns(review).map((x) => [x.id, x]))
  const discipline = p.disciplineReflection.trim()
  const discussion = review.synthesis.discussion
  const protectedList = protectedLabels(review)
  const humanAi = humanAiLabels(review)
  const stages = Array.from({ length: p.stages }, (_, i) => i + 1)

  const context = [
    `This programme recognises that Generative AI is ${discipline ? lower(sentence(discipline)) : PLACEHOLDER('describe how AI is affecting the discipline, profession or wider context')}`,
    `In response, the programme has adopted an approach to AI that is ${approachPhrase(review)}.`,
    review.statement.approachRationale.trim() ? sentence(review.statement.approachRationale) : '',
  ]
    .filter(Boolean)
    .join(' ')

  const rationale = [
    'Our approach to AI integration is driven primarily by the learning needs of our students and the capabilities expected of graduates.',
    `Decisions regarding AI use are therefore determined by ${protectedList.length || humanAi.length ? `the capabilities graduates must demonstrate independently (${joinList(protectedList) || PLACEHOLDER('protected capabilities')}) and those they must demonstrate with AI (${joinList(humanAi) || PLACEHOLDER('AI-enabled capabilities')})` : PLACEHOLDER('programme learning outcomes, disciplinary expectations, professional practice and graduate attributes')}, rather than by a general preference either for or against AI.`,
    discussion['independent']?.trim()
      ? `Independent student performance is particularly important where ${lower(sentence(discussion['independent']))}`
      : '',
    discussion['intentional_ai']?.trim()
      ? `AI is becoming a more intentional part of the curriculum where ${lower(sentence(discussion['intentional_ai']))}`
      : '',
  ]
    .filter(Boolean)
    .join(' ')

  const protectedEvidence = p.protectedCapabilities
    .map((c) => {
      const where = refs
        .filter((r) =>
          r.assessment.protectedCapabilities.some(
            (x) => x.label.toLowerCase() === c.label.toLowerCase(),
          ),
        )
        .map(assessmentLabel)
      return where.length ? `${c.label} is evidenced through ${joinList(where)}.` : ''
    })
    .filter(Boolean)
  const protectedText = [
    `The programme identifies the following as particularly important protected human capabilities: ${joinList(protectedList) || PLACEHOLDER('insert capabilities')}.`,
    `These capabilities are developed and assured through ${p.protectedNotes.trim() ? lower(sentence(p.protectedNotes)) : assuredExamples(review) + '.'}`,
    ...protectedEvidence,
  ].join(' ')

  const introducedAt = (capId: string) =>
    stages.filter((s) => (p.progression[`${capId}:${s}`] ?? []).includes('introduced'))
  const demonstratedAt = (capId: string) =>
    stages.filter((s) => (p.progression[`${capId}:${s}`] ?? []).includes('demonstrated'))
  const introStages = [
    ...new Set(PROGRESSION_CAPABILITIES.flatMap((c) => introducedAt(c.id))),
  ].sort()
  const demoStages = [
    ...new Set(PROGRESSION_CAPABILITIES.flatMap((c) => demonstratedAt(c.id))),
  ].sort()
  const aiEnabled = [
    `Graduates of this programme are expected to develop the ability to use AI ${humanAi.length ? `to support ${joinList(humanAi)}` : PLACEHOLDER('describe expected AI-enabled capabilities')}.`,
    introStages.length
      ? `These capabilities are introduced at ${joinList(introStages.map((s) => `stage ${s}`))}${demoStages.length ? ` and demonstrated at ${joinList(demoStages.map((s) => `stage ${s}`))}` : ''}.`
      : '',
    integratedExamples(review).startsWith('[')
      ? ''
      : `Assessments in which AI use is intentionally integrated include ${integratedExamples(review)}.`,
    refs.filter((r) => r.assessment.aiCapabilityDeveloped.trim()).length
      ? `AI capabilities developed through assessment include ${joinList([...new Set(refs.map((r) => lower(r.assessment.aiCapabilityDeveloped.trim())).filter(Boolean))])}.`
      : '',
  ]
    .filter(Boolean)
    .join(' ')

  const assessment = [
    `Assessment across the programme has been reviewed as a portfolio rather than as a collection of isolated assessment tasks. This enables the programme team to balance ${positionMix(review)} approaches according to the learning each assessment is intended to evidence.`,
    `Independent student capability is particularly assured through ${assuredExamples(review)}, while students are expected to demonstrate appropriate and responsible AI-enabled practice through ${integratedExamples(review)}.`,
    discussion['coherent']?.trim() ? sentence(discussion['coherent']) : '',
    `This balance has been selected because ${review.statement.approachRationale.trim() ? lower(sentence(review.statement.approachRationale)) : PLACEHOLDER('educational rationale')}`,
  ]
    .filter(Boolean)
    .join(' ')

  const dash = effectiveDashboard(review)
  const resilience = [
    `The programme review identified ${refs.length ? `${plural(refs.length, 'assessment')} across ${plural(review.modules.length, 'module')}, of which ${priority.length ? plural(priority.length, 'assessment') + (priority.length === 1 ? ' combines' : ' combine') + ' High or Critical AI vulnerability with Low learning assurance' : 'none combine High or Critical AI vulnerability with Low learning assurance'}${watch.length ? `, and ${plural(watch.length, 'assessment')} rel${watch.length === 1 ? 'ies' : 'y'} on Moderate assurance despite High or Critical vulnerability` : ''}.` : PLACEHOLDER('summary of vulnerabilities identified')}`,
    priority.length ? `Prioritised for review: ${joinList(priority.map(assessmentLabel))}.` : '',
    `Where assessments demonstrated higher levels of AI vulnerability, these were considered alongside the level of learning assurance provided. As a result, the programme has ${resilienceResponses(review)}.`,
    dash.resilience
      ? `Overall AI resilience is rated ${optionLabel(QUALITY, dash.resilience)}.`
      : '',
    discussion['vulnerabilities']?.trim() ? sentence(discussion['vulnerabilities']) : '',
  ]
    .filter(Boolean)
    .join(' ')

  const early = stageSummary(review, 1)
  const middle =
    stages.length > 2 ? stages.slice(1, -1).flatMap((s) => stageSummary(review, s)) : []
  const final = stages.length > 1 ? stageSummary(review, stages[stages.length - 1]) : []
  const journey = [
    `Students encounter AI progressively throughout the programme. At the early stages, students are ${early.length ? `introduced to ${joinList([...new Set(early)])}` : PLACEHOLDER('describe early-stage AI literacy')}.`,
    `As students progress, ${middle.length ? `they build on this through ${joinList([...new Set(middle)])}` : PLACEHOLDER('describe how capability develops')}.`,
    `By graduation, students are expected to ${final.length ? `demonstrate ${joinList([...new Set(final)])}` : humanAi.length ? `be capable of ${joinList(humanAi)}` : PLACEHOLDER('describe graduate AI capability')}.`,
    patterns['no_progression'].status === 'triggered'
      ? `The review noted that ${lower(patterns['no_progression'].evidence[0] ?? 'progression should be strengthened.')}`
      : '',
  ]
    .filter(Boolean)
    .join(' ')

  const consistency = [
    `The programme team has adopted a coordinated approach to communicating expectations regarding AI, using the common AI position categories (${joinList(AI_POSITIONS.map((o) => o.label))}) across modules so that students encounter consistent terminology.`,
    p.coherenceAnswers['communicated']?.trim() ? sentence(p.coherenceAnswers['communicated']) : '',
    p.coherenceAnswers['terms']?.trim() ? sentence(p.coherenceAnswers['terms']) : '',
    patterns['contradictory'].status !== 'clear' && patterns['contradictory'].evidence.length
      ? `The review identified areas to align: ${lower(patterns['contradictory'].evidence[0])}.`
      : '',
    review.synthesis.actions.some((a) => a.category === 'align')
      ? `Programme-level alignment actions include ${joinList(
          review.synthesis.actions
            .filter((a) => a.category === 'align')
            .map((a) => lower(a.text))
            .filter(Boolean),
        )}.`
      : '',
  ]
    .filter(Boolean)
    .join(' ')

  const equityIssues = [
    ...new Set(refs.map((r) => r.assessment.equityIssues.trim()).filter(Boolean)),
  ]
  const equityActions = [
    ...new Set(refs.map((r) => r.assessment.equityActions.trim()).filter(Boolean)),
  ]
  const equity = [
    'AI integration within the programme is informed by SETU’s principles for responsible AI use. In particular, the programme considers equitable access to AI tools, accessibility, privacy and data protection, intellectual property and copyright, bias, environmental implications and the AI literacy of students and staff.',
    equityIssues.length
      ? `Issues identified during the review include ${joinList(equityIssues.map(lower))}.`
      : '',
    equityActions.length
      ? `Actions in response include ${joinList(equityActions.map(lower))}.`
      : '',
  ]
    .filter(Boolean)
    .join(' ')

  const monitorActions = review.synthesis.actions.filter((a) => a.category === 'monitor')
  const reviewText = [
    'The programme recognises that AI integration is an evolving area rather than a one-time curriculum intervention. The programme team will therefore keep its approach under review through annual programme monitoring, student and external examiner feedback, industry and professional input, and changes to AI capability and institutional guidance.',
    monitorActions.length
      ? `Areas being monitored include ${joinList(monitorActions.map((a) => lower(a.text)).filter(Boolean))}.`
      : '',
    discussion['monitor']?.trim() ? sentence(discussion['monitor']) : '',
    review.statement.nextReviewDate
      ? `The next review is scheduled for ${formatDate(review.statement.nextReviewDate)}.`
      : '',
  ]
    .filter(Boolean)
    .join(' ')

  return {
    context,
    rationale,
    protected: protectedText,
    ai_enabled: aiEnabled,
    assessment,
    resilience,
    journey,
    consistency,
    equity,
    review: reviewText,
  }
}

/** Team-edited text if present, otherwise the generated draft. */
export function effectiveStatement(review: Review): Record<StatementSectionId, string> {
  const drafts = generateStatementDrafts(review)
  const out = {} as Record<StatementSectionId, string>
  for (const s of STATEMENT_SECTIONS) {
    out[s.id] = (review.statement.sections[s.id] ?? '').trim() || drafts[s.id]
  }
  return out
}

export interface EvidenceRow {
  id: EvidenceAreaId
  area: string
  position: string
  evidence: string
}

/** External review panel evidence summary, auto-populated and overridable. */
export function generateEvidenceSummary(review: Review): EvidenceRow[] {
  const p = review.programme
  const dash = effectiveDashboard(review)
  const refs = allAssessments(review)
  const priority = priorityAssessments(review)
  const text = effectiveStatement(review)
  const q = (v: string) => (v ? optionLabel(QUALITY, v as never) : 'Not rated')
  const mods = (list: string[]) => (list.length ? joinList(list) : '—')

  const generated: Record<EvidenceAreaId, { position: string; evidence: string }> = {
    disciplinary_impact: {
      position: p.disciplineReflection.trim() || approachPhrase(review),
      evidence: 'Part A section 1 programme context; Statement section 1',
    },
    protected: {
      position: joinList(p.protectedCapabilities.map((c) => c.label)) || '—',
      evidence: mods([
        ...new Set(
          refs.filter((r) => r.assessment.protectedCapabilities.length).map(assessmentLabel),
        ),
      ]),
    },
    ai_enabled: {
      position: joinList(p.humanAiCapabilities.map((c) => c.label)) || '—',
      evidence: mods([
        ...new Set(
          refs
            .filter(
              (r) => r.assessment.position === 'integrated' || r.assessment.position === 'open',
            )
            .map(assessmentLabel),
        ),
      ]),
    },
    progression: {
      position: q(dash.progression),
      evidence: 'Part A section 3 AI capability progression map',
    },
    resilience: {
      position: `${q(dash.resilience)}${priority.length ? ` – ${plural(priority.length, 'assessment')} prioritised` : ''}`,
      evidence: 'Part A sections 4–6 assessment portfolio and Vulnerability × Assurance check',
    },
    assurance: {
      position: q(dash.assurance),
      evidence: mods(
        refs
          .filter((r) => r.assessment.assurance === 'high')
          .slice(0, 5)
          .map(assessmentLabel),
      ),
    },
    responsible: {
      position: text.equity.split('. ')[0] + '.',
      evidence: mods([
        ...new Set(
          review.modules
            .filter((m) => m.ltRating === 'strong' || m.ltRating === 'adequate')
            .map((m) => m.code || m.title),
        ),
      ]),
    },
    consistency: {
      position: q(dash.consistency),
      evidence: 'Part A section 7 programme coherence; common AI position categories',
    },
    actions: {
      position: review.synthesis.actions.length
        ? `${plural(review.synthesis.actions.length, 'action')}: ${joinList([...new Set(review.synthesis.actions.map((a) => optionLabel(ACTION_CATEGORIES, a.category)).filter(Boolean))])}`
        : 'No actions recorded',
      evidence: 'Part C section 20 action plan',
    },
  }

  return EVIDENCE_AREAS.map((a) => ({
    id: a.id,
    area: a.label,
    position: (review.statement.evidencePosition[a.id] ?? '').trim() || generated[a.id].position,
    evidence: (review.statement.evidenceSupport[a.id] ?? '').trim() || generated[a.id].evidence,
  }))
}

/** Full narrative in the specification's synthesis template order. */
export function fullStatement(review: Review): { heading: string; paragraphs: string[] }[] {
  const t = effectiveStatement(review)
  return [
    { heading: 'Context and Approach', paragraphs: [t.context, t.rationale] },
    {
      heading: 'Human and AI-Enabled Capability',
      paragraphs: [
        'The programme distinguishes between capabilities which graduates must be able to demonstrate independently and those where effective human-AI collaboration represents an increasingly important element of disciplinary or professional practice.',
        t.protected,
        t.ai_enabled,
      ],
    },
    { heading: 'Curriculum and Assessment', paragraphs: [t.assessment] },
    {
      heading: 'Assessment Resilience',
      paragraphs: [
        t.resilience,
        'The programme does not seek to make assessment “AI-proof”. Instead, its assessment strategy aims to provide appropriate evidence that students have achieved the intended learning outcomes in an environment where increasingly capable AI tools are readily available.',
      ],
    },
    { heading: 'Student AI Capability Journey', paragraphs: [t.journey] },
    { heading: 'Consistency and Transparency', paragraphs: [t.consistency] },
    {
      heading: 'Responsible AI',
      paragraphs: [
        'Students are expected to engage with AI critically, ethically and transparently in accordance with SETU guidance.',
        t.equity,
      ],
    },
    { heading: 'Continuous Review', paragraphs: [t.review] },
  ]
}
