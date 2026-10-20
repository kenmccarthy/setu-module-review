import { describe, expect, it } from 'vitest'
import { MODULE_SECTIONS, PROGRAMME_SECTIONS, navFor } from '../src/components/layout/nav'

const paths = (kind: 'programme' | 'module') =>
  navFor(kind, 'r1').flatMap((g) => g.items.map((i) => i.to))

describe('context-aware navigation', () => {
  it('shows only module sections in a module review', () => {
    const p = paths('module')
    expect(p.filter((x) => x.startsWith('/programme'))).toEqual([])
    expect(p).toContain('/module/r1/assessment')
    expect(p.some((x) => x.includes('statement'))).toBe(false)
  })
  it('shows programme sections and the statement in a programme review', () => {
    const p = paths('programme')
    expect(p.filter((x) => x.startsWith('/module'))).toEqual([])
    expect(p).toContain('/programme/r1/statement')
  })
  it('numbers the five programme and four module review sections', () => {
    expect(PROGRAMME_SECTIONS.filter((s) => 'number' in s)).toHaveLength(5)
    expect(MODULE_SECTIONS.filter((s) => 'number' in s)).toHaveLength(4)
  })
  it('offers a way home from every context', () => {
    for (const nav of [navFor(), navFor('programme', 'x'), navFor('module', 'x')])
      expect(nav.flatMap((g) => g.items).some((i) => i.to === '/')).toBe(true)
  })
})

describe('v1 isolation', () => {
  // The Classic tool, served from the same origin, owns this localStorage key. The new app may
  // read it for migration but must never write it, so it is named in one place only and no code
  // uses zustand's persist middleware (which is what wrote it in v1).
  const sources = import.meta.glob('../src/**/*.{ts,tsx}', {
    query: '?raw',
    import: 'default',
    eager: true,
  }) as Record<string, string>

  it('names the v1 storage key only in the library module', () => {
    const files = Object.entries(sources)
      .filter(([, src]) => src.includes("'setu-ai-review'"))
      .map(([f]) => f)
    expect(files).toEqual(['../src/store/library.ts'])
  })

  it('does not use the persist middleware anywhere', () => {
    expect(Object.entries(sources).filter(([, src]) => /zustand\/middleware'/.test(src))).toEqual(
      [],
    )
  })
})
