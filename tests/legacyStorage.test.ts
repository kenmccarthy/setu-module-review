import { describe, expect, it } from 'vitest'
import { detectLegacyReview, migrateLegacyReview } from '../src/migrate/legacyStorage'
import { INDEX_KEY, V1_STORAGE_KEY, listReviews, loadReview } from '../src/store/library'
import { MemoryStorage } from './memoryStorage'
import { sample } from './fixture'

const persisted = (review: unknown, started = true) =>
  JSON.stringify({ state: { review, started }, version: 1 })

describe('migrating the v1 review saved in this browser', () => {
  it('reports nothing when there is no v1 review or it was never started', () => {
    const s = new MemoryStorage()
    expect(detectLegacyReview(s).state).toBe('none')
    s.setItem(V1_STORAGE_KEY, persisted(sample(), false))
    expect(detectLegacyReview(s).state).toBe('none')
  })

  it('migrates into new entries and never changes the v1 entry', () => {
    const s = new MemoryStorage()
    const raw = persisted(sample())
    s.setItem(V1_STORAGE_KEY, raw)
    const status = detectLegacyReview(s)
    expect(status.state).toBe('available')
    if (status.state !== 'available') return
    const out = migrateLegacyReview(s, status.review)
    expect(out.ok).toBe(true)
    expect(s.getItem(V1_STORAGE_KEY)).toBe(raw)
    expect(listReviews(s, 'programme')).toHaveLength(1)
    expect(listReviews(s, 'module')).toHaveLength(2)
    if (out.ok) expect(loadReview(s, out.result.programme.id)).toEqual(out.result.programme)
    expect(detectLegacyReview(s).state).toBe('migrated')
  })

  it('offers migration again if the v1 review changes afterwards', () => {
    const s = new MemoryStorage()
    const r = sample()
    s.setItem(V1_STORAGE_KEY, persisted(r))
    const first = detectLegacyReview(s)
    if (first.state === 'available') migrateLegacyReview(s, first.review)
    s.setItem(V1_STORAGE_KEY, persisted({ ...r, updatedAt: '2099-01-01T00:00:00.000Z' }))
    const again = detectLegacyReview(s)
    expect(again.state).toBe('available')
    if (again.state === 'available') expect(again.changedSinceMigration).toBe(true)
  })

  it('reports an unreadable v1 entry and leaves it untouched', () => {
    const s = new MemoryStorage()
    s.setItem(V1_STORAGE_KEY, '{broken')
    expect(detectLegacyReview(s).state).toBe('unreadable')
    s.setItem(V1_STORAGE_KEY, persisted({ modules: 'nope' }))
    expect(detectLegacyReview(s).state).toBe('unreadable')
    expect(s.getItem(V1_STORAGE_KEY)).toBe(persisted({ modules: 'nope' }))
  })

  it('removes a partial copy if storage fills up mid-migration', () => {
    const s = new MemoryStorage(4)
    s.setItem(V1_STORAGE_KEY, persisted(sample()))
    const status = detectLegacyReview(s)
    if (status.state !== 'available') throw new Error('expected available')
    const out = migrateLegacyReview(s, status.review)
    expect(out.ok).toBe(false)
    expect(s.keys().filter((k) => k.startsWith('setu-air:v2:review:'))).toEqual([])
    expect(listReviews(s)).toEqual([])
    expect(s.getItem(INDEX_KEY)).toBeNull()
    expect(detectLegacyReview(s).state).toBe('available')
  })
})
