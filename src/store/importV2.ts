/**
 * Reads any JSON file the tool accepts and says what it is, without changing stored data:
 * a v1 review (to migrate), a v2 programme or module review, a bundle of reviews, a module
 * contribution or a set of programme prompts. Files from a newer version are rejected rather
 * than downgraded.
 */
import type { z } from 'zod'
import { ReviewSchema, type Review } from '../model/legacy/v1'
import {
  AnyReviewSchema,
  LibraryBundleSchema,
  ModuleContributionPacketSchema,
  ProgrammePromptsPacketSchema,
  SCHEMA_VERSION_V2,
  type AnyReview,
  type LibraryBundle,
  type ModuleContributionPacket,
  type ProgrammePromptsPacket,
} from '../model/v2/schema'

export type ParsedImport =
  | { ok: true; type: 'v1-review'; review: Review }
  | { ok: true; type: 'review'; review: AnyReview }
  | { ok: true; type: 'library'; bundle: LibraryBundle }
  | { ok: true; type: 'module-contribution'; packet: ModuleContributionPacket }
  | { ok: true; type: 'programme-prompts'; packet: ProgrammePromptsPacket }
  | { ok: false; error: string }

function validate<T>(schema: z.ZodType<T>, data: unknown, what: string) {
  const result = schema.safeParse(data)
  if (result.success) return { ok: true as const, data: result.data }
  const first = result.error.issues[0]
  const path = first?.path.join('.') || 'document'
  return {
    ok: false as const,
    error: `The file is not a valid ${what} (${path}: ${first?.message}).`,
  }
}

export function parseImport(text: string): ParsedImport {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    return { ok: false, error: 'The file is not valid JSON.' }
  }
  if (!data || typeof data !== 'object' || Array.isArray(data))
    return { ok: false, error: 'The file does not contain a review.' }
  const doc = data as Record<string, unknown>
  const version = doc.schemaVersion
  if (typeof version === 'number' && version > SCHEMA_VERSION_V2)
    return {
      ok: false,
      error: `This file was saved by a newer version of the tool (schema ${version}). Please use the latest version of the tool.`,
    }

  switch (doc.packetType) {
    case 'module-contribution': {
      const r = validate(ModuleContributionPacketSchema, doc, 'module contribution')
      return r.ok ? { ok: true, type: 'module-contribution', packet: r.data } : r
    }
    case 'programme-prompts': {
      const r = validate(ProgrammePromptsPacketSchema, doc, 'set of programme prompts')
      return r.ok ? { ok: true, type: 'programme-prompts', packet: r.data } : r
    }
    case 'library': {
      const r = validate(LibraryBundleSchema, doc, 'review bundle')
      return r.ok ? { ok: true, type: 'library', bundle: r.data } : r
    }
    case undefined:
      break
    default:
      return { ok: false, error: 'The file type is not recognised.' }
  }

  if (doc.kind === 'programme' || doc.kind === 'module') {
    const r = validate(AnyReviewSchema, doc, `${doc.kind} review`)
    return r.ok ? { ok: true, type: 'review', review: r.data } : r
  }

  // Version 1 exports have schemaVersion 1 and hold the whole programme and its modules.
  if ((version === undefined || version === 1) && ('programme' in doc || 'modules' in doc)) {
    const r = validate(ReviewSchema, { ...doc, schemaVersion: 1 }, 'version 1 review')
    return r.ok ? { ok: true, type: 'v1-review', review: r.data } : r
  }
  return { ok: false, error: 'The file does not contain a review.' }
}
