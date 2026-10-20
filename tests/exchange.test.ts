import { describe, expect, it } from 'vitest'
import {
  applyContribution,
  applyPrompts,
  matchContribution,
  matchPrompts,
  moduleContributionPacket,
  programmePromptsPacket,
  removeContribution,
} from '../src/logic/v2/exchange'
import {
  newListItem,
  newModuleAssessment,
  newModuleReview,
  newProgrammeReview,
} from '../src/model/v2/defaults'

const moduleReview = () =>
  newModuleReview({
    title: 'Systems Analysis',
    code: 'BIS301',
    stage: 3,
    updatedAt: '2026-10-01T10:00:00.000Z',
    assessments: [
      newModuleAssessment({ title: 'Project', aiRole: 'integrated', confidence: 'confident' }),
    ],
    nextSteps: [newListItem('Share the project brief'), newListItem('')],
    contribution: 'Develops AI-enabled analysis practice.',
  })

describe('module → programme', () => {
  it('imports a contribution without changing the rest of the programme review', () => {
    const p = newProgrammeReview({ title: 'BIS', strengths: 'Ours' })
    const packet = moduleContributionPacket(moduleReview())
    expect(matchContribution(p, packet)).toBe('new')
    const next = applyContribution(p, packet)
    expect(next.moduleContributions).toHaveLength(1)
    expect(next.strengths).toBe('Ours')
    expect(next.moduleContributions[0].snapshot.nextSteps).toHaveLength(1)
    expect(p.moduleContributions).toHaveLength(0)
  })

  it('does not duplicate a contribution imported twice', () => {
    const packet = moduleContributionPacket(moduleReview())
    const once = applyContribution(newProgrammeReview(), packet)
    expect(matchContribution(once, packet)).toBe('same')
    expect(applyContribution(once, packet)).toBe(once)
  })

  it('identifies newer and older revisions and replaces in place, keeping programme notes', () => {
    const m = moduleReview()
    const v1 = moduleContributionPacket(m)
    let p = applyContribution(newProgrammeReview(), v1)
    p.moduleContributions[0].programmeNotes = 'Discuss at board'
    const v2 = moduleContributionPacket({
      ...m,
      updatedAt: '2026-10-05T10:00:00.000Z',
      contribution: 'Updated',
    })
    expect(matchContribution(p, v2)).toBe('newer')
    p = applyContribution(p, v2)
    expect(p.moduleContributions).toHaveLength(1)
    expect(p.moduleContributions[0].snapshot.contribution).toBe('Updated')
    expect(p.moduleContributions[0].programmeNotes).toBe('Discuss at board')
    expect(matchContribution(p, v1)).toBe('older')
  })

  it('lets one module contribute to several programmes independently', () => {
    const packet = moduleContributionPacket(moduleReview())
    const a = applyContribution(newProgrammeReview({ title: 'A' }), packet)
    const b = applyContribution(newProgrammeReview({ title: 'B' }), packet)
    a.moduleContributions[0].programmeNotes = 'A only'
    expect(b.moduleContributions[0].programmeNotes).toBe('')
  })

  it('removes a contribution by source id', () => {
    const p = applyContribution(newProgrammeReview(), moduleContributionPacket(moduleReview()))
    expect(
      removeContribution(p, p.moduleContributions[0].sourceReviewId).moduleContributions,
    ).toEqual([])
  })
})

describe('programme → module', () => {
  const programme = () =>
    newProgrammeReview({
      title: 'BIS',
      updatedAt: '2026-10-01T10:00:00.000Z',
      priorities: [newListItem('Common AI statement in briefs'), newListItem(' ')],
      moduleQuestions: [newListItem('Where must students work without AI?')],
    })

  it('exports non-empty priorities and questions as prompts', () => {
    const packet = programmePromptsPacket(programme())
    expect(packet.prompts.map((p) => p.kind)).toEqual(['priority', 'question'])
  })

  it('imports prompts without overwriting the module review', () => {
    const m = moduleReview()
    const next = applyPrompts(m, programmePromptsPacket(programme()))
    expect(next.programmePriorities).toHaveLength(1)
    expect({ ...next, programmePriorities: [], updatedAt: m.updatedAt }).toEqual(m)
  })

  it('updates prompts from the same programme and keeps responses to prompts that remain', () => {
    const p = programme()
    let m = applyPrompts(moduleReview(), programmePromptsPacket(p))
    const [kept, dropped] = m.programmePriorities[0].prompts
    m.programmePriorities[0].responses = { [kept.id]: 'Noted', [dropped.id]: 'Gone' }
    const updated = { ...p, updatedAt: '2026-10-02T00:00:00.000Z', moduleQuestions: [] }
    const packet = programmePromptsPacket(updated)
    expect(matchPrompts(m, packet)).toBe('newer')
    m = applyPrompts(m, packet)
    expect(m.programmePriorities).toHaveLength(1)
    expect(m.programmePriorities[0].responses).toEqual({ [kept.id]: 'Noted' })
  })
})

describe('independence', () => {
  it('a programme review is valid with no modules, and a module review with no programme', () => {
    expect(newProgrammeReview().moduleContributions).toEqual([])
    const m = newModuleReview({ code: 'X1' })
    expect(m.associatedProgrammes).toBe('')
    expect(m.programmePriorities).toEqual([])
  })
})
