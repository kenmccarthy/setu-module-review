import { describe, expect, it } from 'vitest'
import {
  effectiveStatement,
  fullStatement,
  generateEvidenceSummary,
  generateStatementDrafts,
} from '../src/logic/statement'
import { newReview } from '../src/model/defaults'
import { sample } from './fixture'

describe('generateStatementDrafts', () => {
  it('fills the context section from the review', () => {
    const d = generateStatementDrafts(sample())
    expect(d.context).toMatch(/^This programme recognises that Generative AI is reshaping/)
    expect(d.context).toMatch(/selectively AI-integrated/)
    expect(d.protected).toMatch(
      /foundational disciplinary knowledge, critical thinking, professional judgement and interpersonal communication/,
    )
    expect(d.resilience).toMatch(
      /1 assessment combines High or Critical AI vulnerability with Low learning assurance/,
    )
    expect(d.journey).toMatch(/At the early stages, students are introduced to AI literacy/)
    expect(d.review).toMatch(/1 September 2027/)
  })
  it('leaves bracketed placeholders for an empty review', () => {
    const d = generateStatementDrafts(newReview())
    expect(d.context).toMatch(/\[describe how AI is affecting/)
    expect(d.assessment).toMatch(/\[examples of/)
    for (const text of Object.values(d)) expect(text.length).toBeGreaterThan(20)
  })
  it('prefers team text over the draft and reverts when cleared', () => {
    const r = sample()
    r.statement.sections.context = 'Our own words.'
    expect(effectiveStatement(r).context).toBe('Our own words.')
    r.statement.sections.context = '   '
    expect(effectiveStatement(r).context).toMatch(/^This programme recognises/)
  })
  it('assembles the full statement in template order', () => {
    const parts = fullStatement(sample())
    expect(parts.map((p) => p.heading)).toEqual([
      'Context and Approach',
      'Human and AI-Enabled Capability',
      'Curriculum and Assessment',
      'Assessment Resilience',
      'Student AI Capability Journey',
      'Consistency and Transparency',
      'Responsible AI',
      'Continuous Review',
    ])
  })
  it('builds the evidence summary with overrides', () => {
    const r = sample()
    r.statement.evidencePosition.resilience = 'Override'
    const rows = generateEvidenceSummary(r)
    expect(rows).toHaveLength(9)
    expect(rows.find((x) => x.id === 'resilience')?.position).toBe('Override')
    expect(rows.find((x) => x.id === 'actions')?.position).toMatch(/4 actions/)
  })
})
