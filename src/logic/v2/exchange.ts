/**
 * Pure functions connecting programme and module reviews. Imports never overwrite unrelated work:
 * they return a new review with only the contribution or prompts list changed, and they report
 * how an incoming packet relates to what is already held so the UI can ask before replacing it.
 */
import {
  ModuleSnapshotSchema,
  SCHEMA_VERSION_V2,
  type ModuleContribution,
  type ModuleContributionPacket,
  type ModuleReview,
  type ModuleSnapshot,
  type ProgrammePromptsPacket,
  type ProgrammeReview,
} from '../../model/v2/schema'

export function moduleSnapshot(review: ModuleReview): ModuleSnapshot {
  return ModuleSnapshotSchema.parse({
    ...review,
    nextSteps: review.nextSteps.filter((s) => s.text.trim()),
    assessments: review.assessments.map(
      ({ id, title, weighting, type, semester, aiRole, confidence, action, rationale }) => ({
        id,
        title,
        weighting,
        type,
        semester,
        aiRole,
        confidence,
        action,
        rationale,
      }),
    ),
  })
}

export function moduleContributionPacket(
  review: ModuleReview,
  exportedAt = new Date().toISOString(),
): ModuleContributionPacket {
  return {
    packetType: 'module-contribution',
    schemaVersion: SCHEMA_VERSION_V2,
    sourceReviewId: review.id,
    revision: review.updatedAt,
    exportedAt,
    snapshot: moduleSnapshot(review),
  }
}

export function programmePromptsPacket(
  review: ProgrammeReview,
  exportedAt = new Date().toISOString(),
): ProgrammePromptsPacket {
  return {
    packetType: 'programme-prompts',
    schemaVersion: SCHEMA_VERSION_V2,
    sourceReviewId: review.id,
    revision: review.updatedAt,
    exportedAt,
    programmeTitle: review.title,
    prompts: [
      ...review.priorities
        .filter((p) => p.text.trim())
        .map((p) => ({ id: p.id, kind: 'priority' as const, text: p.text })),
      ...review.moduleQuestions
        .filter((q) => q.text.trim())
        .map((q) => ({ id: q.id, kind: 'question' as const, text: q.text })),
    ],
  }
}

/**
 * How an incoming packet relates to one already held with the same source id:
 * `new` (not held), `same` (identical revision), `newer` or `older`.
 */
export type ImportMatch = 'new' | 'same' | 'newer' | 'older'

function compareRevision(held: string | undefined, incoming: string): ImportMatch {
  if (held === undefined) return 'new'
  if (held === incoming) return 'same'
  return incoming > held ? 'newer' : 'older'
}

export function matchContribution(
  programme: ProgrammeReview,
  packet: ModuleContributionPacket,
): ImportMatch {
  const held = programme.moduleContributions.find((c) => c.sourceReviewId === packet.sourceReviewId)
  return compareRevision(held?.revision, packet.revision)
}

/**
 * Add a module contribution, or replace the one from the same module review. Callers ask the
 * user before passing a packet whose match is `newer` or `older`; `same` is a no-op. The
 * programme team's notes on a replaced contribution are kept.
 */
export function applyContribution(
  programme: ProgrammeReview,
  packet: ModuleContributionPacket,
  importedAt = new Date().toISOString(),
  origin: ModuleContribution['origin'] = 'import',
): ProgrammeReview {
  const idx = programme.moduleContributions.findIndex(
    (c) => c.sourceReviewId === packet.sourceReviewId,
  )
  const held = idx >= 0 ? programme.moduleContributions[idx] : undefined
  if (held?.revision === packet.revision) return programme
  const next: ModuleContribution = {
    sourceReviewId: packet.sourceReviewId,
    revision: packet.revision,
    importedAt,
    origin,
    snapshot: packet.snapshot,
    programmeNotes: held?.programmeNotes ?? '',
  }
  const moduleContributions = [...programme.moduleContributions]
  if (idx >= 0) moduleContributions[idx] = next
  else moduleContributions.push(next)
  return { ...programme, moduleContributions, updatedAt: importedAt }
}

export function removeContribution(
  programme: ProgrammeReview,
  sourceReviewId: string,
  at = new Date().toISOString(),
): ProgrammeReview {
  return {
    ...programme,
    moduleContributions: programme.moduleContributions.filter(
      (c) => c.sourceReviewId !== sourceReviewId,
    ),
    updatedAt: at,
  }
}

export function matchPrompts(module: ModuleReview, packet: ProgrammePromptsPacket): ImportMatch {
  const held = module.programmePriorities.find((p) => p.sourceReviewId === packet.sourceReviewId)
  return compareRevision(held?.revision, packet.revision)
}

/**
 * Add or replace a programme's prompts in a module review. The module team's responses to
 * prompts that still exist are kept; nothing else in the module review changes.
 */
export function applyPrompts(
  module: ModuleReview,
  packet: ProgrammePromptsPacket,
  importedAt = new Date().toISOString(),
): ModuleReview {
  const idx = module.programmePriorities.findIndex(
    (p) => p.sourceReviewId === packet.sourceReviewId,
  )
  const held = idx >= 0 ? module.programmePriorities[idx] : undefined
  if (held?.revision === packet.revision) return module
  const ids = new Set(packet.prompts.map((p) => p.id))
  const responses = Object.fromEntries(
    Object.entries(held?.responses ?? {}).filter(([id]) => ids.has(id)),
  )
  const next = {
    sourceReviewId: packet.sourceReviewId,
    revision: packet.revision,
    importedAt,
    programmeTitle: packet.programmeTitle,
    prompts: packet.prompts,
    responses,
  }
  const programmePriorities = [...module.programmePriorities]
  if (idx >= 0) programmePriorities[idx] = next
  else programmePriorities.push(next)
  return { ...module, programmePriorities, updatedAt: importedAt }
}
