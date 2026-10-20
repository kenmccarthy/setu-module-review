import { beforeEach, describe, expect, it } from 'vitest'
import { useWorkspace } from '../src/store/workspace'
import { V1_STORAGE_KEY, loadReview } from '../src/store/library'
import type { ModuleReview, ProgrammeReview } from '../src/model/v2/schema'
import { MemoryStorage } from './memoryStorage'

const ws = () => useWorkspace.getState()

/** Start a review and make a first change, which is when it is saved. */
function create(kind: 'programme' | 'module', partial: { code?: string; title?: string } = {}) {
  const r = kind === 'programme' ? ws().createProgramme(partial) : ws().createModule(partial)
  ws().update((d) => void (d.title = partial.title ?? d.title))
  return ws().current!.id === r.id ? ws().current! : r
}
let storage: MemoryStorage

beforeEach(() => {
  storage = new MemoryStorage()
  storage.setItem(V1_STORAGE_KEY, 'v1 data')
  ws().useStorage(storage)
})

describe('workspace', () => {
  it('starts a module review without any programme review, and vice versa', () => {
    const m = create('module', { code: 'BIS101' })
    expect(ws().entries.map((e) => e.kind)).toEqual(['module'])
    const p = create('programme')
    expect(ws().entries).toHaveLength(2)
    expect(loadReview(storage, m.id)).toMatchObject({ code: 'BIS101' })
    expect(loadReview(storage, p.id)?.kind).toBe('programme')
  })

  it('does not save a new review until something is entered', () => {
    const m = ws().createModule()
    expect(ws().current?.id).toBe(m.id)
    expect(ws().entries).toEqual([])
    expect(loadReview(storage, m.id)).toBeUndefined()
    ws().update<ModuleReview>((d) => void (d.title = 'Now saved'))
    expect(ws().entries.map((e) => e.id)).toEqual([m.id])
  })

  it('keeps several reviews of each kind without overwriting', () => {
    const a = create('module', { code: 'A' })
    const b = create('module', { code: 'B' })
    create('programme', { title: 'P1' })
    create('programme', { title: 'P2' })
    expect(ws().entries).toHaveLength(4)
    expect((loadReview(storage, a.id) as ModuleReview).code).toBe('A')
    expect((loadReview(storage, b.id) as ModuleReview).code).toBe('B')
  })

  it('saves each change to the open review immediately', () => {
    const p = ws().createProgramme()
    ws().update<ProgrammeReview>((d) => {
      d.title = 'BSc Example'
    })
    expect(ws().current?.id).toBe(p.id)
    const saved = loadReview(storage, p.id) as ProgrammeReview
    expect(saved.title).toBe('BSc Example')
    expect(saved.updatedAt >= p.updatedAt).toBe(true)
    expect(ws().entries[0].title).toBe('BSc Example')
  })

  it('reopens a saved review by id, and reports one that does not exist', () => {
    const m = create('module', { code: 'X' })
    ws().useStorage(storage)
    expect(ws().current).toBeNull()
    expect(ws().open(m.id)?.id).toBe(m.id)
    expect(ws().open('nope')).toBeUndefined()
    expect(ws().failedId).toBe('nope')
  })

  it('deletes only the chosen review', () => {
    const a = create('module')
    const b = create('module')
    ws().remove(a.id)
    expect(ws().entries.map((e) => e.id)).toEqual([b.id])
    expect(ws().current?.id).toBe(b.id)
  })

  it('never writes the v1 storage key', () => {
    create('programme', { title: 'x' })
    ws().remove(ws().entries[0].id)
    expect(storage.getItem(V1_STORAGE_KEY)).toBe('v1 data')
  })
})
