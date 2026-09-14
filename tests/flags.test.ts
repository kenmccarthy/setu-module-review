import { describe, expect, it } from 'vitest'
import {
  flagLevel,
  priorityAssessments,
  vulnerabilityAssuranceGrid,
  watchAssessments,
} from '../src/logic/flags'
import { sample } from './fixture'

describe('flagLevel', () => {
  it('flags High/Critical vulnerability with Low assurance as priority', () => {
    expect(flagLevel({ vulnerability: 'high', assurance: 'low' })).toBe('priority')
    expect(flagLevel({ vulnerability: 'critical', assurance: 'low' })).toBe('priority')
  })
  it('flags High/Critical with Moderate assurance as watch', () => {
    expect(flagLevel({ vulnerability: 'high', assurance: 'moderate' })).toBe('watch')
  })
  it('does not flag low/moderate vulnerability or high assurance', () => {
    expect(flagLevel({ vulnerability: 'low', assurance: 'low' })).toBe('none')
    expect(flagLevel({ vulnerability: 'critical', assurance: 'high' })).toBe('none')
    expect(flagLevel({ vulnerability: '', assurance: 'low' })).toBe('none')
  })
})

describe('sample review flags', () => {
  it('finds exactly the business report as priority', () => {
    const p = priorityAssessments(sample())
    expect(p.map((r) => r.assessment.title)).toEqual(['Business report'])
    expect(watchAssessments(sample())).toHaveLength(0)
  })
  it('builds the vulnerability × assurance grid', () => {
    const grid = vulnerabilityAssuranceGrid(sample())
    expect(grid.critical.low).toHaveLength(1)
    expect(grid.low.high).toHaveLength(1)
    expect(grid.high.high).toHaveLength(1)
  })
})
