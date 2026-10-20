/**
 * Browser-local storage for v2: an index of saved reviews plus one entry per review, so starting
 * or importing a review never overwrites another. Functions take a `Storage` so they can be
 * tested without a browser.
 *
 * The v1 tool (still served at /classic/ on the same origin) owns the key `setu-ai-review`.
 * Nothing here ever writes that key.
 */
import { z } from 'zod'
import {
  AnyReviewSchema,
  SCHEMA_VERSION_V2,
  type AnyReview,
  type ReviewKind,
} from '../model/v2/schema'

export const V1_STORAGE_KEY = 'setu-ai-review'
export const INDEX_KEY = 'setu-air:v2:index'
export const reviewKey = (id: string) => `setu-air:v2:review:${id}`

const IndexEntrySchema = z.object({
  id: z.string(),
  kind: z.enum(['programme', 'module']),
  title: z.string().default(''),
  code: z.string().default(''),
  updatedAt: z.string(),
  status: z.enum(['in_progress', 'complete']).default('in_progress'),
})
export type IndexEntry = z.infer<typeof IndexEntrySchema>

const IndexSchema = z.object({
  schemaVersion: z.literal(SCHEMA_VERSION_V2).default(SCHEMA_VERSION_V2),
  reviews: z.array(IndexEntrySchema).default([]),
  /** Record of v1 reviews already migrated, keyed by v1 review id → v1 updatedAt at migration. */
  migratedFromV1: z.record(z.string(), z.string()).default({}),
})
export type LibraryIndex = z.infer<typeof IndexSchema>

export function readIndex(storage: Storage): LibraryIndex {
  const raw = storage.getItem(INDEX_KEY)
  if (!raw) return IndexSchema.parse({})
  try {
    return IndexSchema.parse(JSON.parse(raw))
  } catch {
    return IndexSchema.parse({})
  }
}

function writeIndex(storage: Storage, index: LibraryIndex) {
  storage.setItem(INDEX_KEY, JSON.stringify(index))
}

export function indexEntry(review: AnyReview): IndexEntry {
  return {
    id: review.id,
    kind: review.kind,
    title: review.title,
    code: review.kind === 'module' ? review.code : '',
    updatedAt: review.updatedAt,
    status: review.status,
  }
}

export function listReviews(storage: Storage, kind?: ReviewKind): IndexEntry[] {
  return readIndex(storage)
    .reviews.filter((r) => !kind || r.kind === kind)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

export function loadReview(storage: Storage, id: string): AnyReview | undefined {
  const raw = storage.getItem(reviewKey(id))
  if (!raw) return undefined
  try {
    const result = AnyReviewSchema.safeParse(JSON.parse(raw))
    return result.success ? result.data : undefined
  } catch {
    return undefined
  }
}

export function saveReview(storage: Storage, review: AnyReview): void {
  storage.setItem(reviewKey(review.id), JSON.stringify(review))
  const index = readIndex(storage)
  const entry = indexEntry(review)
  const i = index.reviews.findIndex((r) => r.id === review.id)
  if (i >= 0) index.reviews[i] = entry
  else index.reviews.push(entry)
  writeIndex(storage, index)
}

export function deleteReview(storage: Storage, id: string): void {
  storage.removeItem(reviewKey(id))
  const index = readIndex(storage)
  index.reviews = index.reviews.filter((r) => r.id !== id)
  writeIndex(storage, index)
}

export function markV1Migrated(storage: Storage, v1Id: string, v1UpdatedAt: string): void {
  const index = readIndex(storage)
  index.migratedFromV1[v1Id] = v1UpdatedAt
  writeIndex(storage, index)
}
