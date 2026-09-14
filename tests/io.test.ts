import { describe, expect, it } from 'vitest'
import { parseReviewJson, serializeReview, exportFileName } from '../src/store/io'
import { ReviewSchema, SCHEMA_VERSION } from '../src/model/schema'
import { newReview, cloneModule } from '../src/model/defaults'
import { sample } from './fixture'

describe('JSON import/export', () => {
  it('round-trips a review', () => {
    const r = sample()
    const result = parseReviewJson(serializeReview(r))
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.review).toEqual(r)
  })
  it('rejects malformed JSON', () => {
    const result = parseReviewJson('{not json')
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toMatch(/not valid JSON/)
  })
  it('rejects a document that is not a review', () => {
    const result = parseReviewJson(JSON.stringify({ hello: 'world' }))
    expect(result.ok).toBe(false)
  })
  it('rejects a newer schema version', () => {
    const result = parseReviewJson(
      JSON.stringify({ ...newReview(), schemaVersion: SCHEMA_VERSION + 1 }),
    )
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toMatch(/newer version/)
  })
  it('fills defaults for missing optional fields', () => {
    const minimal = {
      id: 'x',
      createdAt: 'a',
      updatedAt: 'b',
      modules: [{ id: 'm', assessments: [{ id: 'a' }] }],
    }
    const result = parseReviewJson(JSON.stringify(minimal))
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.review.programme.stages).toBe(4)
      expect(result.review.modules[0].assessments[0].vulnerability).toBe('')
    }
  })
  it('names the export file from the programme title', () => {
    expect(exportFileName(sample())).toMatch(
      /^ai-review-bsc-hons-in-business-information-systems-\d{4}-\d{2}-\d{2}\.json$/,
    )
  })
  it('schema parses an empty object into a full review', () => {
    const r = ReviewSchema.parse({ id: 'i', createdAt: 'c', updatedAt: 'u' })
    expect(r.schemaVersion).toBe(SCHEMA_VERSION)
    expect(r.synthesis.actions).toEqual([])
  })
  it('clones a module with fresh ids and remapped outcome links', () => {
    const r = sample()
    const copy = cloneModule(r.modules[0])
    expect(copy.id).not.toBe(r.modules[0].id)
    expect(copy.title).toMatch(/\(copy\)$/)
    const loIds = new Set(copy.learningOutcomes.map((lo) => lo.id))
    expect(copy.assessments.every((a) => a.outcomeIds.every((o) => loIds.has(o)))).toBe(true)
  })
})
