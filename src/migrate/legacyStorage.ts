/**
 * Detects a review saved by the v1 tool in this browser and migrates it into v2 storage. The v1
 * entry is only read, never changed or removed, so the classic tool keeps working with it.
 */
import { ReviewSchema, type Review } from '../model/legacy/v1'
import {
  INDEX_KEY,
  V1_STORAGE_KEY,
  markV1Migrated,
  readIndex,
  reviewKey,
  saveReview,
} from '../store/library'
import { migrateV1Review, type MigrationResult } from './v1ToV2'

export type LegacyStatus =
  | { state: 'none' }
  /** A v1 review exists and has not been migrated (or has changed since it was). */
  | { state: 'available'; review: Review; raw: string; changedSinceMigration: boolean }
  | { state: 'migrated' }
  /** Something is stored under the v1 key but cannot be read; it is left untouched. */
  | { state: 'unreadable'; raw: string; error: string }

export function detectLegacyReview(storage: Storage): LegacyStatus {
  const raw = storage.getItem(V1_STORAGE_KEY)
  if (!raw) return { state: 'none' }
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return { state: 'unreadable', raw, error: 'The saved v1 review is not valid JSON.' }
  }
  // zustand's persist middleware stores { state: { review, started }, version }.
  const state = (parsed as { state?: { review?: unknown; started?: unknown } } | null)?.state
  if (!state?.started) return { state: 'none' }
  const result = ReviewSchema.safeParse(state.review)
  if (!result.success) {
    const first = result.error.issues[0]
    return {
      state: 'unreadable',
      raw,
      error: `The saved v1 review could not be read (${first?.path.join('.') || 'review'}: ${first?.message}).`,
    }
  }
  const review = result.data
  const migratedAt = readIndex(storage).migratedFromV1[review.id]
  if (migratedAt === review.updatedAt) return { state: 'migrated' }
  return { state: 'available', review, raw, changedSinceMigration: migratedAt !== undefined }
}

/**
 * Migrate a v1 review into new v2 entries. Nothing is written unless the whole migration
 * succeeds; on failure the error is returned and storage is unchanged.
 */
export function migrateLegacyReview(
  storage: Storage,
  review: Review,
): { ok: true; result: MigrationResult } | { ok: false; error: string } {
  let result: MigrationResult
  try {
    result = migrateV1Review(review)
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) }
  }
  const written: string[] = []
  const previousIndex = storage.getItem(INDEX_KEY)
  try {
    for (const r of [...result.modules, result.programme]) {
      written.push(r.id)
      saveReview(storage, r)
    }
    markV1Migrated(storage, review.id, review.updatedAt)
  } catch (e) {
    // e.g. storage quota exceeded: remove the partial copy so a retry starts clean. Removals
    // free space, so restoring the previous (smaller) index afterwards is expected to succeed.
    for (const id of written) storage.removeItem(reviewKey(id))
    try {
      if (previousIndex === null) storage.removeItem(INDEX_KEY)
      else storage.setItem(INDEX_KEY, previousIndex)
    } catch {
      // The index still lists the removed reviews; loadReview returns undefined for them.
    }
    return { ok: false, error: e instanceof Error ? e.message : String(e) }
  }
  return { ok: true, result }
}
