/**
 * Browser-local storage for v2: an index of saved reviews plus one entry per review, so starting
 * or importing a review never overwrites another. Functions take a `Storage` so they can be
 * tested without a browser.
 *
 * The v1 tool (still served at /classic/ on the same origin) owns the key `setu-ai-review`.
 * Nothing here ever writes that key.
 */
import { z } from 'zod'
import { migrateV1Review } from '../migrate/v1ToV2'
import { uid } from '../model/v2/defaults'
import {
  AnyReviewSchema,
  SCHEMA_VERSION_V2,
  type AnyReview,
  type LibraryBundle,
  type ReviewKind,
} from '../model/v2/schema'
import type { ParsedImport } from './importV2'

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

// ── Import and export ────────────────────────────────────────────────────────────────────────

export type ConflictChoice = 'replace' | 'keep-both'

export type LibraryImportResult =
  | { ok: true; saved: AnyReview[]; message: string }
  /** A packet meant for a particular review; the caller asks which review should receive it. */
  | { ok: true; saved: []; packet: ParsedPacket; message: string }
  | { ok: false; error: string }

type ParsedPacket = Extract<ParsedImport, { type: 'module-contribution' | 'programme-prompts' }>

const describe = (n: number, what: string) => `${n} ${what}${n === 1 ? '' : 's'}`

/**
 * Save the reviews in an imported file as new saved reviews. A v1 review is migrated into new
 * reviews and never replaces anything; a v2 review whose id is already saved is replaced or kept
 * alongside, as `onConflict` decides. Nothing is written if the file is invalid.
 */
export function importIntoLibrary(
  storage: Storage,
  parsed: ParsedImport,
  onConflict: (existing: IndexEntry, incoming: AnyReview) => ConflictChoice,
): LibraryImportResult {
  if (!parsed.ok) return parsed
  switch (parsed.type) {
    case 'module-contribution':
      return {
        ok: true,
        saved: [],
        packet: parsed,
        message: 'This file is a module contribution. Import it from a programme review.',
      }
    case 'programme-prompts':
      return {
        ok: true,
        saved: [],
        packet: parsed,
        message: 'This file holds programme prompts. Import it from a module review.',
      }
    case 'v1-review': {
      const { programme, modules } = migrateV1Review(parsed.review)
      for (const r of [...modules, programme]) saveReview(storage, r)
      return {
        ok: true,
        saved: [programme, ...modules],
        message: `Brought in a review from the previous version as 1 programme review and ${describe(modules.length, 'module review')}.`,
      }
    }
    case 'review':
    case 'library': {
      const incoming = parsed.type === 'review' ? [parsed.review] : parsed.bundle.reviews
      const index = readIndex(storage)
      const saved = incoming.map((review) => {
        const existing = index.reviews.find((r) => r.id === review.id)
        const r =
          existing && onConflict(existing, review) === 'keep-both'
            ? { ...review, id: uid(), updatedAt: new Date().toISOString() }
            : review
        saveReview(storage, r)
        return r
      })
      return { ok: true, saved, message: `Imported ${describe(saved.length, 'review')}.` }
    }
  }
}

export function libraryBundle(
  storage: Storage,
  exportedAt = new Date().toISOString(),
): LibraryBundle {
  return {
    packetType: 'library',
    schemaVersion: SCHEMA_VERSION_V2,
    exportedAt,
    reviews: listReviews(storage)
      .map((e) => loadReview(storage, e.id))
      .filter((r): r is AnyReview => !!r),
  }
}

// ── Browser storage ──────────────────────────────────────────────────────────────────────────

/** In-memory Storage used when the browser blocks localStorage (e.g. some private windows). */
export class MemoryStorage implements Storage {
  private data = new Map<string, string>()
  get length() {
    return this.data.size
  }
  clear() {
    this.data.clear()
  }
  getItem(key: string) {
    return this.data.get(key) ?? null
  }
  key(i: number) {
    return [...this.data.keys()][i] ?? null
  }
  removeItem(key: string) {
    this.data.delete(key)
  }
  setItem(key: string, value: string) {
    this.data.set(key, value)
  }
}

/** The browser's localStorage if it works, otherwise an in-memory store (`persistent: false`). */
export function browserStorage(): { storage: Storage; persistent: boolean } {
  try {
    const s = window.localStorage
    const probe = 'setu-air:v2:probe'
    s.setItem(probe, '1')
    s.removeItem(probe)
    return { storage: s, persistent: true }
  } catch {
    return { storage: new MemoryStorage(), persistent: false }
  }
}
