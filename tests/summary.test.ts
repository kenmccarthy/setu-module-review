import { describe, expect, it } from 'vitest'
import { generateSummary } from '../src/logic/summary'
import { newReview } from '../src/model/defaults'
import { sample } from './fixture'

describe('generateSummary', () => {
  it('produces a summary for the sample', () => {
    const s = generateSummary(sample())
    expect(s.overallPosition).toMatch(/Business Information Systems/)
    expect(s.priorityVulnerabilities[0].text).toMatch(/Business report/)
    expect(s.protectedCapabilities.some((i) => /Critical thinking – evidenced/.test(i.text))).toBe(
      true,
    )
    expect(s.programmeActions).toHaveLength(2)
    expect(s.moduleActions).toHaveLength(2)
    expect(s.reviewDate).toBe('1 September 2026')
  })
  it('uses the team overall position when provided', () => {
    const r = sample()
    r.synthesis.overallPosition = 'Team text.'
    expect(generateSummary(r).overallPosition).toBe('Team text.')
  })
  it('handles an empty review without throwing', () => {
    const s = generateSummary(newReview())
    expect(s.keyStrengths).toEqual([])
    expect(s.overallPosition).toMatch(/completed the AI Programme/)
  })
})
