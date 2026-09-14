import { ReviewSchema, SCHEMA_VERSION, type Review } from '../model/schema'

export interface ImportResult {
  ok: true
  review: Review
}
export interface ImportError {
  ok: false
  error: string
}

/** Validate and (in future) migrate an imported JSON document. */
export function parseReviewJson(text: string): ImportResult | ImportError {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    return { ok: false, error: 'The file is not valid JSON.' }
  }
  if (!data || typeof data !== 'object') {
    return { ok: false, error: 'The file does not contain a review.' }
  }
  const version = (data as { schemaVersion?: unknown }).schemaVersion
  if (typeof version === 'number' && version > SCHEMA_VERSION) {
    return {
      ok: false,
      error: `This file was saved by a newer version of the tool (schema ${version}). Please update the tool.`,
    }
  }
  const migrated = migrate(data as Record<string, unknown>)
  const result = ReviewSchema.safeParse(migrated)
  if (!result.success) {
    const first = result.error.issues[0]
    const path = first?.path.join('.') || 'document'
    return { ok: false, error: `The file is not a valid review (${path}: ${first?.message}).` }
  }
  return { ok: true, review: result.data }
}

function migrate(data: Record<string, unknown>): Record<string, unknown> {
  // Placeholder for future schema migrations; version 1 needs none.
  return { ...data, schemaVersion: SCHEMA_VERSION }
}

export function serializeReview(review: Review): string {
  return JSON.stringify(review, null, 2)
}

export function exportFileName(review: Review): string {
  const slug = (review.programme.title || 'programme')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  const date = new Date().toISOString().slice(0, 10)
  return `ai-review-${slug || 'programme'}-${date}.json`
}

export function downloadReview(review: Review): void {
  const blob = new Blob([serializeReview(review)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = exportFileName(review)
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function readFileText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => reject(reader.error)
    reader.readAsText(file)
  })
}
