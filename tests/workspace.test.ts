import { beforeEach, describe, expect, it } from 'vitest'
import { useWorkspace } from '../src/store/workspace'
import { V1_STORAGE_KEY, loadReview } from '../src/store/library'
import type { ModuleReview, ProgrammeReview } from '../src/model/v2/schema'
import { MemoryStorage } from './memoryStorage'

const ws = () => useWorkspace.getState()
let storage: MemoryStorage

beforeEach(() => {
  storage = new MemoryStorage()
  storage.setItem(V1_STORAGE_KEY, 'v1 data')
  ws().useStorage(storage)
})

describe('workspace', () => {
  it('starts a module review without any programme review, and vice versa', () => {
    const m = ws().createModule({ code: 'BIS101' })
    expect(ws().entries.map((e) => e.kind)).toEqual(['module'])
    const p = ws().createProgramme()
    expect(ws().entries).toHaveLength(2)
    expect(loadReview(storage, m.id)).toEqual(m)
    expect(loadReview(storage, p.id)).toEqual(p)
  })

  it('keeps several reviews of each kind without overwriting', () => {
    const a = ws().createModule({ code: 'A' })
    const b = ws().createModule({ code: 'B' })
    ws().createProgramme({ title: 'P1' })
    ws().createProgramme({ title: 'P2' })
    expect(ws().entries).toHaveLength(4)
    expect((loadReview(storage, a.id) as ModuleReview).code).toBe('A')
    expect((loadReview(storage, b.id) as ModuleReview).code).toBe('B')
  })

  it('saves each change to the open review immediately', () => {
    const p = ws().createProgramme()
    ws().update<ProgrammeReview>((d) => {
      d.title = 'BSc Example'
    })
    const saved = loadReview(storage, p.id) as ProgrammeReview
    expect(saved.title).toBe('BSc Example')
    expect(saved.updatedAt >= p.updatedAt).toBe(true)
    expect(ws().entries[0].title).toBe('BSc Example')
  })

  it('reopens a saved review by id, and reports one that does not exist', () => {
    const m = ws().createModule({ code: 'X' })
    ws().useStorage(storage)
    expect(ws().current).toBeNull()
    expect(ws().open(m.id)?.id).toBe(m.id)
    expect(ws().open('nope')).toBeUndefined()
    expect(ws().failedId).toBe('nope')
  })

  it('deletes only the chosen review', () => {
    const a = ws().createModule()
    const b = ws().createModule()
    ws().remove(a.id)
    expect(ws().entries.map((e) => e.id)).toEqual([b.id])
    expect(ws().current?.id).toBe(b.id)
  })

  it('never writes the v1 storage key', () => {
    ws().createProgramme()
    ws().update<ProgrammeReview>((d) => {
      d.title = 'x'
    })
    ws().remove(ws().entries[0].id)
    expect(storage.getItem(V1_STORAGE_KEY)).toBe('v1 data')
  })
})
