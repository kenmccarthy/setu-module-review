import { describe, expect, it } from 'vitest'
import { moduleProgress, moduleSummary, moduleSummaryText } from '../src/logic/v2/moduleSummary'
import { NOT_ANSWERED } from '../src/logic/v2/programmeSummary'
import { moduleLegacy } from '../src/logic/v2/legacy'
import { moduleContributionPacket } from '../src/logic/v2/exchange'
import { migrateV1Review } from '../src/migrate/v1ToV2'
import { newListItem, newModuleAssessment, newModuleReview } from '../src/model/v2/defaults'
import { sample } from './fixture'

const block = (m: ReturnType<typeof newModuleReview>, id: string) =>
  moduleSummary(m).find((b) => b.id === id)!

const answered = (title: string, extra = {}) =>
  newModuleAssessment({
    title,
    aiRole: 'integrated',
    confidence: 'confident',
    action: 'maintain',
    ...extra,
  })

describe('module review summary', () => {
  it('covers the sections the specification lists, in order', () => {
    expect(moduleSummary(newModuleReview()).map((b) => b.heading)).toEqual([
      'Module details',
      'Learning outcome reflection',
      'Teaching and learning reflection',
      'Assessment approaches',
      'Confidence in learning assurance',
      'Proposed actions',
      'Matters requiring programme discussion',
      'Reflection',
      'Contribution to the Programme AI Integration Statement',
    ])
  })

  it('reports each assessment separately, with unanswered questions shown as such', () => {
    const m = newModuleReview({
      assessments: [
        answered('Project', { type: 'Group project', weighting: '60' }),
        newModuleAssessment({ title: 'Exam' }),
      ],
    })
    expect(block(m, 'assessments').lines).toEqual([
      'Project (Group project, 60%): AI Integrated',
      `Exam: ${NOT_ANSWERED}`,
    ])
    expect(block(m, 'confidence').lines).toEqual(['Project: Confident', `Exam: ${NOT_ANSWERED}`])
    // No totals or aggregate ratings anywhere in the summary.
    expect(moduleSummaryText(m)).not.toMatch(/\d+ (of|out of) \d+|%\s*confident|score/i)
  })

  it('collects matters for programme discussion', () => {
    const m = newModuleReview({
      programmeDiscussion: 'Shared AI statement wording',
      alignment: 'discuss',
      assessments: [answered('Report', { action: 'discuss' })],
    })
    expect(block(m, 'discussion').lines).toEqual([
      'Shared AI statement wording',
      'Report: Discuss with programme team',
      expect.stringMatching(/Further programme discussion would be useful$/),
    ])
    const aligned = newModuleReview({ alignment: 'yes' })
    expect(block(aligned, 'discussion').lines).toEqual([])
  })

  it('lists next steps and assessment actions as proposed actions, not completed ones', () => {
    const m = newModuleReview({
      nextSteps: [newListItem('Add an AI literacy session'), newListItem('')],
      assessments: [answered('Report', { action: 'enhance' })],
    })
    expect(block(m, 'actions').lines).toEqual([
      'Add an AI literacy session',
      'Report: Enhance assessment design',
    ])
  })
})

describe('module review progress', () => {
  it('needs all three core answers for every assessment, and ignores advanced detail', () => {
    const partial = newModuleReview({
      code: 'BIS101',
      assessments: [
        answered('A'),
        newModuleAssessment({ aiRole: 'open', confidence: 'confident' }),
      ],
    })
    expect(moduleProgress(partial)).toMatchObject({ context: true, assessment: false })
    const done = newModuleReview({ assessments: [answered('A'), answered('B')] })
    expect(moduleProgress(done).assessment).toBe(true)
    expect(done.assessments[0].advanced.vulnerability).toBe('')
  })
  it('treats a module with no assessments as not yet done', () => {
    expect(moduleProgress(newModuleReview()).assessment).toBe(false)
  })
})

describe('migrated modules', () => {
  const { modules } = migrateV1Review(sample())
  it('keep v1 detail in the advanced assessment section', () => {
    const report = modules[0].assessments[1]
    expect(report.advanced.vulnerability).toBe('critical')
    expect(report.advanced.processDecision).toBe('redesign')
    expect(report.aiRole).toBe('limited')
  })
  it('show v1 data with no v2 question read-only', () => {
    const legacy = moduleLegacy(modules[0])
    expect(legacy.context[0].label).toBe('Module context reflection')
    expect(legacy.teaching[0].value).toBe('Adequate')
  })
})

describe('module contribution packet', () => {
  it('shares the summary fields but not advanced detail or learning outcomes', () => {
    const m = newModuleReview({
      code: 'X1',
      contribution: 'Builds critical evaluation of AI outputs.',
      learningOutcomes: [{ id: 'lo', text: 'Private', rating: '', comments: '' }],
      assessments: [answered('Essay', { advanced: { purpose: 'internal note' } as never })],
    })
    const packet = moduleContributionPacket(m)
    expect(packet.snapshot.contribution).toBe('Builds critical evaluation of AI outputs.')
    expect(JSON.stringify(packet)).not.toContain('internal note')
    expect(JSON.stringify(packet)).not.toContain('Private')
  })
})
