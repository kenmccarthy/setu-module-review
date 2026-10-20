import { describe, expect, it } from 'vitest'
import { parseImport } from '../src/store/importV2'
import { serializeReview } from '../src/store/io'
import { newModuleReview, newProgrammeReview } from '../src/model/v2/defaults'
import { moduleContributionPacket, programmePromptsPacket } from '../src/logic/v2/exchange'
import { sample } from './fixture'

describe('importing files', () => {
  it('recognises an existing version 1 export', () => {
    const r = parseImport(serializeReview(sample()))
    expect(r.ok && r.type).toBe('v1-review')
    if (r.ok && r.type === 'v1-review') expect(r.review.modules).toHaveLength(2)
  })
  it('recognises a version 1 export saved before schemaVersion was written', () => {
    const { schemaVersion: _, ...old } = sample()
    expect(parseImport(JSON.stringify(old)).ok).toBe(true)
  })
  it('recognises v2 programme and module reviews', () => {
    const p = parseImport(JSON.stringify(newProgrammeReview({ title: 'P' })))
    const m = parseImport(JSON.stringify(newModuleReview({ code: 'M1' })))
    expect(p.ok && p.type === 'review' && p.review.kind).toBe('programme')
    expect(m.ok && m.type === 'review' && m.review.kind).toBe('module')
  })
  it('recognises exchange packets', () => {
    const c = parseImport(JSON.stringify(moduleContributionPacket(newModuleReview())))
    const q = parseImport(JSON.stringify(programmePromptsPacket(newProgrammeReview())))
    expect(c.ok && c.type).toBe('module-contribution')
    expect(q.ok && q.type).toBe('programme-prompts')
  })
  it('rejects files from a newer version instead of downgrading them', () => {
    const r = parseImport(JSON.stringify({ ...newProgrammeReview(), schemaVersion: 3 }))
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error).toMatch(/newer version/)
  })
  it('rejects invalid files with a clear message', () => {
    for (const text of ['{nope', '[]', '"x"', '{"hello":1}', '{"packetType":"other"}']) {
      const r = parseImport(text)
      expect(r.ok).toBe(false)
    }
    const bad = parseImport(JSON.stringify({ ...newModuleReview(), assessments: 'x' }))
    expect(!bad.ok && bad.error).toMatch(/assessments/)
  })
})
