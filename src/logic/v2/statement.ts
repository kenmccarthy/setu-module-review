/**
 * The Programme AI Integration Statement: pure functions that draft the five sections from the
 * programme review, apply the team's own text, and handle approval.
 *
 * Every generated sentence comes from a recorded answer and is tagged with its provenance.
 * Proposals are never described as implemented, module findings are never presented as
 * programme decisions, and missing information becomes a bracketed placeholder to confirm.
 */
import { produce } from 'immer'
import { optionLabel } from '../../content/scales'
import { PROGRESSION_CAPABILITIES_V2, STATEMENT_SECTIONS_V2 } from '../../content/v2/scales'
import type { Provenance } from '../../content/v2/statement'
import type { ModuleContribution, ProgrammeReview } from '../../model/v2/schema'
import { AI_ROLES, ASSESSMENT_CONFIDENCE } from '../../content/v2/scales'
import { assessmentName, moduleTitle } from './moduleSummary'
import { programmeSummary, progressionLines, type SummaryBlock } from './programmeSummary'
import { formatDate, joinList, lower, sentence } from '../text'

export type StatementSectionId = (typeof STATEMENT_SECTIONS_V2)[number]['id']

export interface DraftSentence {
  text: string
  kind: Provenance
}

const S = (text: string, kind: Provenance): DraftSentence => ({ text: sentence(text), kind })
const P = (hint: string): DraftSentence => ({ text: `[${hint}]`, kind: 'confirm' })
const clean = (t: string) => t.trim().replace(/[.;:,]+$/, '')

const APPROACH_PHRASE: Record<string, string> = {
  predominantly_integrated: 'a predominantly AI-integrated approach',
  selectively_integrated: 'a selectively AI-integrated approach',
  balanced: 'an approach balanced between AI-integrated and AI-restricted learning',
  predominantly_restricted: 'an approach that is predominantly AI-restricted in identified areas',
  mixed: 'a discipline-specific, mixed approach',
}

/** Text plus selected capability labels as one list, e.g. "x, critical thinking and y". */
function capabilityList(text: string, caps: { label: string }[]): string {
  return joinList([clean(text), ...caps.map((c) => lower(c.label))].filter(Boolean))
}

function moduleContributions(r: ProgrammeReview): ModuleContribution[] {
  return r.statement.includeModuleExamples ? r.moduleContributions : []
}

function approach(r: ProgrammeReview): DraftSentence[] {
  const st = r.statement
  const out: DraftSentence[] = []
  if (r.disciplineReflection.trim()) {
    out.push(
      S(
        'The programme team has considered how Generative AI is affecting the discipline and the professional practice that graduates will enter',
        'decision',
      ),
      // A reflection written as a fragment ("reshaping roles…") follows the v1 stem.
      S(
        /^[a-z]/.test(r.disciplineReflection.trim())
          ? `Generative AI is ${clean(r.disciplineReflection)}`
          : r.disciplineReflection,
        'decision',
      ),
    )
  } else
    out.push(
      P('How is AI affecting the discipline and the professional practice graduates will enter?'),
    )

  const phrase =
    st.approach === 'other' ? clean(st.approachOther) : (APPROACH_PHRASE[st.approach] ?? '')
  if (phrase)
    out.push(
      S(
        st.approach === 'other'
          ? `The programme’s approach to AI is: ${phrase}`
          : `The programme has adopted ${phrase}`,
        'decision',
      ),
    )
  else out.push(P('State the programme’s overall approach to AI'))
  if (st.approachRationale.trim()) out.push(S(st.approachRationale, 'decision'))

  const coordination = {
    established: S(
      'AI expectations are coordinated across the modules of the programme',
      'existing',
    ),
    some: S(
      'Some coordination of AI expectations exists across modules, and the programme team has identified further discussion as useful',
      'existing',
    ),
    not_yet: S(
      'A coordinated, programme-wide approach to AI has not yet been developed',
      'existing',
    ),
  }[r.coordination as string]
  if (coordination) out.push(coordination)
  if (r.strengthenApproach.trim())
    out.push(
      S(
        `To strengthen this approach, the programme team has identified: ${clean(r.strengthenApproach)}`,
        'proposed',
      ),
    )
  return out
}

function capabilities(r: ProgrammeReview): DraftSentence[] {
  const out: DraftSentence[] = []
  const independent = capabilityList(r.independentText, r.independentCapabilities)
  const aiEnabled = capabilityList(r.aiEnabledText, r.aiEnabledCapabilities)
  out.push(
    independent
      ? S(
          `Capabilities that graduates must be able to demonstrate independently of AI include ${independent}`,
          'decision',
        )
      : P('What must graduates be able to demonstrate independently of AI?'),
    aiEnabled
      ? S(
          `Capabilities that graduates should develop for using AI effectively, critically and responsibly include ${aiEnabled}`,
          'decision',
        )
      : P('What should graduates be able to do effectively, critically and responsibly with AI?'),
  )
  const outcomes = {
    yes: S(
      'The programme team considers that the programme learning outcomes adequately reflect these capabilities',
      'decision',
    ),
    partially: S(
      'The programme team has identified how well the programme learning outcomes reflect these capabilities as worth exploring further',
      'proposed',
    ),
    not_yet: S(
      'The programme team has noted that the programme learning outcomes do not yet address these capabilities',
      'proposed',
    ),
  }[r.outcomesAdequate as string]
  if (outcomes) out.push(outcomes)
  if (r.outcomesComments.trim()) out.push(S(r.outcomesComments, 'proposed'))
  return out
}

const ROLE_PHRASE: Record<string, string> = {
  restricted: 'AI-restricted',
  limited: 'AI-limited or bounded',
  integrated: 'AI-integrated',
  open: 'AI-open',
}

/** e.g. "AI-restricted assessment in BIS101 (Examination) and AI-integrated assessment in …" */
function assessmentExamples(contribs: ModuleContribution[]): DraftSentence[] {
  const byRole = AI_ROLES.map((role) => ({
    role,
    items: contribs.flatMap((c) =>
      c.snapshot.assessments
        .map((a, i) => ({ a, i }))
        .filter(({ a }) => a.aiRole === role.value)
        .map(
          ({ a, i }) =>
            `${c.snapshot.code || moduleTitle(c.snapshot)} (${lower(assessmentName(a, i))})`,
        ),
    ),
  })).filter((g) => g.items.length && g.role.value !== 'not_relevant')
  if (!byRole.length) return []
  const parts = byRole.map(
    (g) => `${ROLE_PHRASE[g.role.value]} assessment in ${joinList(g.items.slice(0, 3))}`,
  )
  return [S(`Module reviews describe ${joinList(parts)}`, 'module')]
}

function curriculum(r: ProgrammeReview): DraftSentence[] {
  const out: DraftSentence[] = []
  const lines = progressionLines(r)
  if (lines.length)
    out.push(
      S(
        `The programme’s AI capability progression map (I introduced, P practised, E extended, D demonstrated) records: ${lines.join('; ')}`,
        'existing',
      ),
    )
  else out.push(P('How do students develop AI capabilities across the stages of the programme?'))
  if (r.progressionUnconfirmed.length)
    out.push(
      P(
        'Some progression entries were carried over from an earlier review and have not yet been confirmed',
      ),
    )
  const coherent = {
    yes: S(
      'The programme team considers that this represents a coherent progression of AI capability',
      'decision',
    ),
    partially: S(
      'The programme team has identified the coherence of this progression as worth exploring further',
      'proposed',
    ),
    not_yet: S('The coherence of AI capability progression has not yet been addressed', 'proposed'),
  }[r.progressionCoherent as string]
  if (coherent) out.push(coherent)
  if (r.progressionGaps.trim())
    out.push(S(`The team has noted: ${clean(r.progressionGaps)}`, 'decision'))

  const demonstrate =
    'opportunities to demonstrate the knowledge, skills and judgement expected of graduates'
  const opportunities = {
    yes: S(
      `The programme team is confident that students have sufficient ${demonstrate}`,
      'decision',
    ),
    some_questions: S(
      `The programme team considers that some questions remain about whether students have sufficient ${demonstrate}`,
      'decision',
    ),
    further_review: S(
      `The programme team has identified that further review is needed of whether students have sufficient ${demonstrate}`,
      'proposed',
    ),
  }[r.opportunitiesConfidence as string]
  const balanceText =
    'the balance between independent student performance and responsible AI-enabled practice in assessment'
  const balance = {
    yes: S(`The programme team considers ${balanceText} to be appropriate`, 'decision'),
    partially: S(
      `The programme team has identified ${balanceText} as worth exploring further`,
      'proposed',
    ),
    not_yet: S(`The programme team has not yet addressed ${balanceText}`, 'proposed'),
  }[r.assessmentBalance as string]
  if (opportunities) out.push(opportunities)
  if (balance) out.push(balance)
  if (!opportunities && !balance)
    out.push(P('How does the programme provide appropriate assurance of student learning?'))
  if (r.confidenceConcerns.trim())
    out.push(
      S(
        `Areas where AI may affect confidence in how learning is demonstrated include: ${clean(r.confidenceConcerns)}`,
        'decision',
      ),
    )
  if (r.modulesForConsideration.trim())
    out.push(
      S(
        `The following have been identified for further consideration: ${clean(r.modulesForConsideration)}`,
        'proposed',
      ),
    )
  out.push(...assessmentExamples(moduleContributions(r)))
  return out
}

const RESPONSIBLE =
  /responsib|ethic|evaluat|hallucinat|bias|error|document|communicat|oversight|judgement/i

function responsible(r: ProgrammeReview): DraftSentence[] {
  const out: DraftSentence[] = []
  const caps = r.aiEnabledCapabilities.filter((c) => RESPONSIBLE.test(c.label))
  if (caps.length)
    out.push(
      S(
        `Graduates are expected to develop capabilities in ${joinList(caps.map((c) => lower(c.label)))}`,
        'decision',
      ),
    )
  const rows = PROGRESSION_CAPABILITIES_V2.filter(
    (c) =>
      ['literacy_responsible', 'evaluation', 'oversight'].includes(c.id) &&
      Object.entries(r.progression).some(([k, v]) => k.startsWith(`${c.id}:`) && v.length),
  )
  if (rows.length)
    out.push(
      S(
        `${joinList(rows.map((c, i) => (i === 0 ? c.label : lower(c.label))))} ${rows.length === 1 ? 'is' : 'are'} developed across the stages of the programme, as shown in the progression map`,
        'existing',
      ),
    )
  const contribs = moduleContributions(r)
  const name = (c: ModuleContribution) => c.snapshot.code || moduleTitle(c.snapshot)
  const supported = contribs.filter((c) => c.snapshot.responsibleEngagement === 'yes').map(name)
  const partly = contribs.filter((c) => c.snapshot.responsibleEngagement === 'partially').map(name)
  if (supported.length)
    out.push(
      S(
        `Module reviews for ${joinList(supported)} report that students are supported to engage with AI critically and responsibly`,
        'module',
      ),
    )
  if (partly.length)
    out.push(
      S(
        `Module reviews for ${joinList(partly)} report that this support is partially in place`,
        'module',
      ),
    )
  if (!out.length)
    out.push(
      P('How are students prepared to engage with AI critically, ethically and responsibly?'),
    )
  return out
}

function review(r: ProgrammeReview): DraftSentence[] {
  const out: DraftSentence[] = []
  if (r.strengths.trim())
    out.push(S(`Strengths identified in the review include: ${clean(r.strengths)}`, 'existing'))
  if (r.opportunities.trim())
    out.push(S(`Opportunities for development include: ${clean(r.opportunities)}`, 'proposed'))
  const priorities = r.priorities.map((p) => clean(p.text)).filter(Boolean)
  if (priorities.length)
    out.push(
      S(
        `The programme team’s priorities for development are: ${priorities.map((p, i) => `(${i + 1}) ${lower(p)}`).join('; ')}`,
        'proposed',
      ),
    )
  else out.push(P('What are the programme’s priorities for developing its approach to AI?'))
  const questions = r.moduleQuestions.map((q) => clean(q.text)).filter(Boolean)
  if (questions.length)
    out.push(
      S(
        `The programme team has identified questions for module teams to consider, including: ${questions.join('; ')}`,
        'proposed',
      ),
    )
  const matters = moduleContributions(r)
    .filter((c) => c.snapshot.programmeDiscussion.trim())
    .slice(0, 3)
    .map(
      (c) =>
        `${c.snapshot.code || moduleTitle(c.snapshot)} (${lower(clean(c.snapshot.programmeDiscussion))})`,
    )
  if (matters.length)
    out.push(
      S(
        `Module reviews have raised matters for programme discussion, including ${joinList(matters)}`,
        'module',
      ),
    )
  out.push(
    r.statement.nextReviewDate
      ? S(
          `The programme team will review this statement by ${formatDate(r.statement.nextReviewDate)}`,
          'decision',
        )
      : P('When will the programme team next review this statement?'),
  )
  return out
}

/** The generated draft for each of the five sections. */
export function draftStatement(r: ProgrammeReview): Record<StatementSectionId, DraftSentence[]> {
  return {
    approach: approach(r),
    capabilities: capabilities(r),
    curriculum: curriculum(r),
    responsible: responsible(r),
    review: review(r),
  }
}

export const draftText = (sentences: DraftSentence[]) => sentences.map((s) => s.text).join(' ')

export interface StatementSectionView {
  id: StatementSectionId
  title: string
  question: string
  draft: DraftSentence[]
  /** The team's text if they have edited the section, otherwise the draft. */
  text: string
  edited: boolean
  /** The generated draft has changed since the team edited this section. */
  draftChanged: boolean
}

export function statementSections(r: ProgrammeReview): StatementSectionView[] {
  const drafts = draftStatement(r)
  return STATEMENT_SECTIONS_V2.map((s) => {
    const draft = drafts[s.id]
    const own = (r.statement.sections[s.id] ?? '').trim()
    const basis = r.statement.sectionBasis[s.id]
    return {
      id: s.id,
      title: s.title,
      question: s.question,
      draft,
      text: own || draftText(draft),
      edited: !!own,
      draftChanged: !!own && basis !== undefined && basis !== draftText(draft),
    }
  })
}

/** The full statement as plain text, with section headings. */
export function statementText(r: ProgrammeReview): string {
  return statementSections(r)
    .map((s) => `${s.title}\n${s.text}`)
    .join('\n\n')
}

export const wordCount = (text: string) => (text.match(/\S+/g) ?? []).length

/** Bracketed placeholders still in the statement. */
export function placeholders(r: ProgrammeReview): { section: string; text: string }[] {
  return statementSections(r).flatMap((s) =>
    (s.text.match(/\[[^\]]+\]/g) ?? []).map((text) => ({ section: s.title, text })),
  )
}

// ── Editing ──────────────────────────────────────────────────────────────────────────────────

/** Save the team's text for a section, remembering the draft it was based on. */
export function setSectionText(
  r: ProgrammeReview,
  id: StatementSectionId,
  text: string,
): ProgrammeReview {
  const draft = draftText(draftStatement(r)[id])
  return produce(r, (d) => {
    d.statement.sections[id] = text
    if (!text.trim()) delete d.statement.sectionBasis[id]
    else d.statement.sectionBasis[id] ??= draft
  })
}

/** Go back to the generated draft for a section. */
export function revertToDraft(r: ProgrammeReview, id: StatementSectionId): ProgrammeReview {
  return produce(r, (d) => {
    delete d.statement.sections[id]
    delete d.statement.sectionBasis[id]
  })
}

/** Keep the team's text and stop flagging the newer draft. */
export function keepOwnText(r: ProgrammeReview, id: StatementSectionId): ProgrammeReview {
  const draft = draftText(draftStatement(r)[id])
  return produce(r, (d) => void (d.statement.sectionBasis[id] = draft))
}

// ── Approval ─────────────────────────────────────────────────────────────────────────────────

export interface Approval {
  programmeName: string
  approvedBy: string
  approvalDate: string
  nextReviewDate: string
}

export function approveStatement(
  r: ProgrammeReview,
  a: Approval,
): { ok: true; review: ProgrammeReview } | { ok: false; error: string } {
  if (!a.approvedBy.trim() || !a.approvalDate)
    return { ok: false, error: 'Record who approved the statement and the date of approval.' }
  const approved = produce(r, (d) => {
    Object.assign(d.statement, a, { status: 'agreed' })
  })
  return {
    ok: true,
    review: produce(approved, (d) => void (d.statement.agreedSnapshot = statementText(approved))),
  }
}

export function setStatus(r: ProgrammeReview, status: 'draft' | 'under_review'): ProgrammeReview {
  return produce(r, (d) => {
    d.statement.status = status
    d.statement.agreedSnapshot = ''
  })
}

export const changedSinceAgreed = (r: ProgrammeReview) =>
  r.statement.status === 'agreed' && r.statement.agreedSnapshot !== statementText(r)

// ── Evidence and export ──────────────────────────────────────────────────────────────────────

export interface EvidenceAppendix {
  programme: SummaryBlock[]
  modules: {
    module: string
    stage: number
    positions: string[]
    confidence: string[]
    contribution: string
  }[]
}

const EVIDENCE_BLOCKS = [
  'independent',
  'ai-enabled',
  'outcomes',
  'progression',
  'curriculum',
  'coherence',
  'priorities',
]

export function evidenceAppendix(r: ProgrammeReview): EvidenceAppendix {
  return {
    programme: programmeSummary(r).filter((b) => EVIDENCE_BLOCKS.includes(b.id) && b.lines.length),
    modules: r.moduleContributions.map((c) => ({
      module: moduleTitle(c.snapshot),
      stage: c.snapshot.stage,
      positions: c.snapshot.assessments.map(
        (a, i) => `${assessmentName(a, i)}: ${optionLabel(AI_ROLES, a.aiRole) || 'not recorded'}`,
      ),
      confidence: c.snapshot.assessments.map(
        (a, i) =>
          `${assessmentName(a, i)}: ${optionLabel(ASSESSMENT_CONFIDENCE, a.confidence) || 'not recorded'}`,
      ),
      contribution: c.snapshot.contribution.trim(),
    })),
  }
}

/** Structured export of the statement, its provenance and (optionally) the evidence appendix. */
export function statementExport(r: ProgrammeReview, exportedAt = new Date().toISOString()) {
  const st = r.statement
  return {
    packetType: 'programme-statement' as const,
    schemaVersion: 2 as const,
    exportedAt,
    sourceReviewId: r.id,
    programme: st.programmeName || r.title,
    status: st.status || 'draft',
    approval:
      st.status === 'agreed'
        ? {
            approvedBy: st.approvedBy,
            approvalDate: st.approvalDate,
            changedSinceAgreed: changedSinceAgreed(r),
          }
        : null,
    nextReviewDate: st.nextReviewDate,
    sections: statementSections(r).map((s) => ({
      id: s.id,
      title: s.title,
      question: s.question,
      text: s.text,
      teamEdited: s.edited,
      generated: s.draft,
    })),
    evidence: st.includeEvidenceAppendix ? evidenceAppendix(r) : null,
  }
}
