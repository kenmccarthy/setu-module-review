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
  // The v1 store persists to the key the Classic tool uses; the new app must never load it.
  it('the running app does not import the v1 store', () => {
    const sources = import.meta.glob('../src/**/*.{ts,tsx}', {
      query: '?raw',
      import: 'default',
      eager: true,
    }) as Record<string, string>
    const join = (from: string, spec: string) => {
      const parts = from.split('/').slice(0, -1)
      for (const seg of spec.split('/')) {
        if (seg === '..') parts.pop()
        else if (seg !== '.') parts.push(seg)
      }
      return parts.join('/')
    }
    const seen = new Set<string>()
    const visit = (file: string) => {
      if (seen.has(file)) return
      seen.add(file)
      for (const [, spec] of sources[file].matchAll(/from '(\.[^']+)'/g)) {
        const base = join(file, spec)
        const target = [base + '.ts', base + '.tsx', base + '/index.ts'].find((f) => f in sources)
        if (target) visit(target)
      }
    }
    visit('../src/main.tsx')
    expect(seen.has('../src/features/home/HomePage.tsx')).toBe(true)
    expect(seen.has('../src/store/reviewStore.ts')).toBe(false)
  })
})
