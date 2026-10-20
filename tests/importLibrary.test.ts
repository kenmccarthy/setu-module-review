import { describe, expect, it } from 'vitest'
import { importIntoLibrary, libraryBundle, listReviews, loadReview } from '../src/store/library'
import { parseImport } from '../src/store/importV2'
import { serializeReview } from '../src/store/io'
import { newModuleReview, newProgrammeReview } from '../src/model/v2/defaults'
import { moduleContributionPacket } from '../src/logic/v2/exchange'
import { MemoryStorage } from './memoryStorage'
import { sample } from './fixture'

const never = () => {
  throw new Error('no conflict expected')
}

describe('importing into saved reviews', () => {
  it('brings in a v1 export as new reviews', () => {
    const s = new MemoryStorage()
    const r = importIntoLibrary(s, parseImport(serializeReview(sample())), never)
    expect(r.ok && r.saved.length).toBe(3)
    expect(listReviews(s, 'module')).toHaveLength(2)
    // Importing the same v1 file again adds another copy rather than replacing anything.
    importIntoLibrary(s, parseImport(serializeReview(sample())), never)
    expect(listReviews(s, 'programme')).toHaveLength(2)
  })

  it('asks before replacing a review with the same id, and can keep both', () => {
    const s = new MemoryStorage()
    const m = newModuleReview({ code: 'M1', title: 'Original' })
    importIntoLibrary(s, parseImport(JSON.stringify(m)), never)
    const edited = JSON.stringify({ ...m, title: 'From file' })

    importIntoLibrary(s, parseImport(edited), () => 'keep-both')
    expect(listReviews(s)).toHaveLength(2)
    expect(loadReview(s, m.id)).toMatchObject({ title: 'Original' })

    importIntoLibrary(s, parseImport(edited), () => 'replace')
    expect(listReviews(s)).toHaveLength(2)
    expect(loadReview(s, m.id)).toMatchObject({ title: 'From file' })
  })

  it('round-trips everything through an exported bundle', () => {
    const a = new MemoryStorage()
    importIntoLibrary(a, parseImport(JSON.stringify(newProgrammeReview({ title: 'P' }))), never)
    importIntoLibrary(a, parseImport(JSON.stringify(newModuleReview({ code: 'M' }))), never)
    const b = new MemoryStorage()
    const r = importIntoLibrary(b, parseImport(JSON.stringify(libraryBundle(a))), never)
    expect(r.ok && r.saved.length).toBe(2)
    expect(listReviews(b)).toEqual(listReviews(a))
  })

  it('does not save exchange packets or invalid files', () => {
    const s = new MemoryStorage()
    const packet = JSON.stringify(moduleContributionPacket(newModuleReview()))
    const r = importIntoLibrary(s, parseImport(packet), never)
    expect(r.ok && 'packet' in r).toBe(true)
    expect(importIntoLibrary(s, parseImport('{bad'), never).ok).toBe(false)
    expect(s.writes).toBe(0)
  })
})
