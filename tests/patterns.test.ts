import { describe, expect, it } from 'vitest'
import { detectPatterns } from '../src/logic/patterns'
import { suggestDashboard } from '../src/logic/dashboard'
import { newReview } from '../src/model/defaults'
import { sample } from './fixture'

const byId = (r: ReturnType<typeof detectPatterns>) => Object.fromEntries(r.map((p) => [p.id, p]))

describe('detectPatterns', () => {
  it('reports unknown for an empty review', () => {
    const p = byId(detectPatterns(newReview()))
    expect(p.vulnerable_low_assurance.status).toBe('unknown')
    expect(p.protected_unassessed.status).toBe('unknown')
    expect(p.volume.status).toBe('unknown')
  })
  it('detects patterns in the sample', () => {
    const p = byId(detectPatterns(sample()))
    expect(p.vulnerable_low_assurance.status).toBe('possible') // one priority assessment
    expect(p.outcomes_review.status).toBe('triggered')
    expect(p.protected_unassessed.status).toBe('clear')
    expect(p.literacy_gap.status).toBe('clear')
    expect(p.contradictory.status).toBe('possible') // team note recorded
  })
  it('flags a stage that mixes restricted and open positions', () => {
    const r = sample()
    r.modules[1].stage = 1
    r.modules[1].assessments[0].position = 'open'
    const p = byId(detectPatterns(r))
    expect(p.contradictory.status).toBe('possible')
    expect(p.contradictory.evidence[0]).toMatch(/Stage 1 mixes/)
  })
  it('detects integration without preparation', () => {
    const r = sample()
    r.programme.progression = {}
    const p = byId(detectPatterns(r))
    expect(p.integration_unprepared.status).toBe('triggered')
  })
})

describe('suggestDashboard', () => {
  it('suggests review for resilience with one priority assessment', () => {
    const s = suggestDashboard(sample())
    expect(s.resilience.value).toBe('review')
    expect(s.protected.value).toBe('strong')
    expect(s.progression.value).toBe('adequate')
    expect(s.coherence.value).toBe('review')
  })
  it('suggests nothing for an empty review', () => {
    const s = suggestDashboard(newReview())
    expect(Object.values(s).every((x) => x.value === '')).toBe(true)
  })
})
