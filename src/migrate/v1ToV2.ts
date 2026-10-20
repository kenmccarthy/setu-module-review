/**
 * Migration from a version 1 review (one document holding the programme, its modules, synthesis
 * and statement) to version 2 (one programme review plus one module review per module).
 *
 * Rules:
 * - Fields with a direct v2 equivalent are carried over unchanged.
 * - A v1 rating is mapped only where the meaning is the same; otherwise the v2 response is left
 *   unanswered and a note says so. Nothing is silently reinterpreted.
 * - The complete original data is kept in `legacy.original`, so nothing is lost and the original
 *   v1 review can always be recovered.
 */
import { optionLabel, QUALITY } from '../content/scales'
import { PROGRESSION_CAPABILITIES } from '../content/capabilities'
import type { Addressed } from '../content/v2/scales'
import type { Action, Module, Review } from '../model/legacy/v1'
import {
  ModuleReviewSchema,
  ProgrammeReviewSchema,
  type ModuleReview,
  type ProgrammeReview,
} from '../model/v2/schema'
import { MAX_PRIORITIES, newListItem, uid } from '../model/v2/defaults'
import { applyContribution, moduleContributionPacket } from '../logic/v2/exchange'

export interface MigrationResult {
  programme: ProgrammeReview
  modules: ModuleReview[]
}

/** v1 progression row → v2 row. Rows mapped to `null` are kept only in the legacy data. */
const PROGRESSION_ROW_MAP: Record<string, { to: string | null; confirm: boolean }> = {
  literacy: { to: 'literacy_responsible', confirm: true },
  ethics: { to: 'literacy_responsible', confirm: true },
  genai: { to: 'collaboration', confirm: true },
  evaluation: { to: 'evaluation', confirm: false },
  discipline: { to: 'discipline', confirm: false },
  oversight: { to: 'oversight', confirm: false },
  agentic: { to: null, confirm: false },
}

const PHASE_ORDER = ['introduced', 'practised', 'developed', 'demonstrated']

/** v1 "Do the PLOs reflect…?" → v2. "Mostly" sits between two v2 options, so it is not mapped. */
const PLO_MAP: Record<string, Addressed | undefined> = {
  yes: 'yes',
  partially: 'partially',
  discuss: 'partially',
  no: 'not_yet',
}

const v1RowLabel = (id: string) => PROGRESSION_CAPABILITIES.find((c) => c.id === id)?.label ?? id

function migrateProgression(
  progression: Record<string, string[]>,
  notes: string[],
): { progression: ProgrammeReview['progression']; unconfirmed: string[] } {
  const out: Record<string, Set<string>> = {}
  const unconfirmed = new Set<string>()
  const dropped = new Set<string>()
  for (const [key, phases] of Object.entries(progression)) {
    if (!phases.length) continue
    const [row, stage] = key.split(':')
    const rule = PROGRESSION_ROW_MAP[row]
    if (!rule?.to) {
      dropped.add(row)
      continue
    }
    const k = `${rule.to}:${stage}`
    out[k] ??= new Set()
    for (const p of phases) out[k].add(p)
    if (rule.confirm) unconfirmed.add(k)
  }
  if (unconfirmed.size)
    notes.push(
      'Progression map: “AI literacy” and “Responsible/ethical AI use” were combined into “AI literacy and responsible use”, and “Effective use of GenAI” was placed under “Effective human–AI collaboration”. These cells are marked for the team to confirm.',
    )
  for (const row of dropped)
    notes.push(
      `Progression map: the v1 row “${v1RowLabel(row)}” has no v2 equivalent and is kept in the original review data.`,
    )
  return {
    progression: Object.fromEntries(
      Object.entries(out).map(([k, set]) => [k, PHASE_ORDER.filter((p) => set.has(p))]),
    ),
    unconfirmed: [...unconfirmed],
  }
}

function unmappedRating(notes: string[], what: string, value: string) {
  if (value)
    notes.push(
      `${what}: the v1 rating “${optionLabel(QUALITY, value as never) || value}” does not correspond to a v2 response, so the v2 question is left unanswered.`,
    )
}

function migrateModule(
  m: Module,
  v1: Review,
  programmeId: string,
  actions: Action[],
  migratedAt: string,
): ModuleReview {
  const notes: string[] = []
  const steps = actions.filter((a) => a.text.trim())
  if (steps.length > MAX_PRIORITIES)
    notes.push(
      `${steps.length} module actions were recorded in v1; the first ${MAX_PRIORITIES} are shown as next steps and all are kept in the original review data.`,
    )
  unmappedRating(notes, 'Teaching and learning', m.ltRating)
  if (m.learningOutcomes.length)
    notes.push(
      'Individual learning outcomes and their v1 ratings are kept in the optional detailed learning-outcome review; the overall learning-outcomes question is left for the team to answer.',
    )
  if (m.assessments.some((a) => a.vulnerability || a.assurance))
    notes.push(
      'Assessment vulnerability and assurance ratings are kept under “Explore Assessment Design in More Detail”. “Confidence in learning” is a different question and is left for the team to answer.',
    )
  if (m.contextReflection.trim())
    notes.push('The v1 module context reflection is kept in the original review data.')

  return ModuleReviewSchema.parse({
    schemaVersion: 2,
    kind: 'module',
    id: uid(),
    createdAt: migratedAt,
    updatedAt: migratedAt,
    title: m.title,
    code: m.code,
    stage: m.stage,
    credits: m.credits,
    coordinator: m.leader,
    associatedProgrammes: m.programmes || v1.programme.title,
    reviewDate: v1.programme.reviewDate,
    outcomesChanges: m.outcomesComments,
    learningOutcomes: m.learningOutcomes,
    ltEnhance: m.ltActions,
    assessments: m.assessments.map(({ id, title, semester, weighting, type, ...advanced }) => ({
      id,
      title,
      semester,
      weighting,
      type,
      aiRole: advanced.position,
      rationale: advanced.positionRationale,
      advanced,
    })),
    nextSteps: steps.slice(0, MAX_PRIORITIES).map((a) => newListItem(a.text)),
    legacy: {
      source: 'v1',
      sourceReviewId: v1.id,
      migratedAt,
      notes,
      original: { programmeId, module: m, actions },
    },
  })
}

export function migrateV1Review(
  v1: Review,
  migratedAt = new Date().toISOString(),
): MigrationResult {
  const p = v1.programme
  const notes: string[] = []
  const programmeId = uid()

  const ploAdequate = PLO_MAP[p.ploCheckpoint] ?? ''
  if (p.ploCheckpoint && !ploAdequate)
    notes.push(
      'Graduate capabilities: the v1 answer “Mostly” to the programme learning outcomes question has no single v2 equivalent, so the question is left unanswered.',
    )
  if (p.enduringCapabilities.length)
    notes.push(
      'Graduate capabilities: the v1 list of enduring capabilities is kept in the original review data. Protected human capabilities now appear under “independently of AI” and human–AI capabilities under “with AI”.',
    )
  if (p.protectedNotes.trim())
    notes.push(
      'Graduate capabilities: the v1 notes on how protected capabilities are assured are kept in the original review data.',
    )

  const { progression, unconfirmed } = migrateProgression(p.progression, notes)
  unmappedRating(notes, 'AI capability progression', p.progressionRating)
  unmappedRating(notes, 'Programme coherence', p.coherenceRating)
  if (Object.values(p.coherenceAnswers).some((v) => v.trim()) || p.coherenceObservations.trim())
    notes.push(
      'Programme coherence: the v1 coherence answers and observations used different prompts and are kept in the original review data.',
    )

  const s = v1.synthesis
  if (Object.keys(s.dashboard).length)
    notes.push(
      'The v1 programme dashboard ratings are not used in v2 and are kept in the original review data.',
    )
  const otherDiscussion = Object.entries(s.discussion).filter(
    ([k, v]) => k !== 'doing_well' && v.trim(),
  )
  if (otherDiscussion.length)
    notes.push(
      'Team discussion: the answer to “What are we already doing well?” is shown under strengths; other v1 discussion answers are kept in the original review data.',
    )
  const programmeActions = s.actions.filter((a) => a.scope === 'programme' && a.text.trim())
  if (programmeActions.length)
    notes.push(
      `${programmeActions.length} programme-level actions from the v1 action plan are kept in the original review data for the team to draw on when agreeing up to ${MAX_PRIORITIES} priorities. They have not been entered as agreed priorities.`,
    )

  const st = v1.statement
  if (st.agreedDate)
    notes.push(
      `The v1 statement recorded an agreed date (${st.agreedDate}). The v2 statement starts as a draft and is marked agreed only when the team approves it.`,
    )
  if (Object.values(st.sections).some((v) => v.trim()))
    notes.push(
      'Team-written text from the ten-section v1 statement is preserved and shown alongside the five v2 statement sections.',
    )

  let programme = ProgrammeReviewSchema.parse({
    schemaVersion: 2,
    kind: 'programme',
    id: programmeId,
    createdAt: migratedAt,
    updatedAt: migratedAt,
    title: p.title,
    nfqLevel: p.nfqLevel,
    duration: p.duration,
    coordinator: p.coordinator,
    academicUnit: p.academicUnit,
    reviewDate: p.reviewDate,
    team: p.team,
    stages: p.stages,
    disciplineReflection: p.disciplineReflection,
    independentCapabilities: p.protectedCapabilities,
    aiEnabledCapabilities: p.humanAiCapabilities,
    outcomesAdequate: ploAdequate,
    outcomesComments: p.ploAction,
    progression,
    progressionUnconfirmed: unconfirmed,
    progressionGaps: p.progressionNotes,
    strengths: s.discussion.doing_well ?? '',
    statement: {
      approach: st.approach,
      approachOther: st.approachOther,
      approachRationale: st.approachRationale,
      status: 'draft',
      programmeName: p.title,
      nextReviewDate: st.nextReviewDate,
      legacySections: Object.fromEntries(Object.entries(st.sections).filter(([, v]) => v.trim())),
    },
    legacy: { source: 'v1', sourceReviewId: v1.id, migratedAt, notes, original: v1 },
  })

  const modules = v1.modules.map((m) =>
    migrateModule(
      m,
      v1,
      programmeId,
      s.actions.filter((a) => a.scope === 'module' && a.moduleId === m.id),
      migratedAt,
    ),
  )
  for (const m of modules)
    programme = applyContribution(
      programme,
      moduleContributionPacket(m, migratedAt),
      migratedAt,
      'v1-migration',
    )

  return { programme, modules }
}
