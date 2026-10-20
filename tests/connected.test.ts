import { describe, expect, it } from 'vitest'
import {
  applyContribution,
  applyPrompts,
  matchContribution,
  moduleContributionPacket,
  programmePromptsPacket,
} from '../src/logic/v2/exchange'
import { contributionFromImport, promptsFromImport } from '../src/store/exchangeImport'
import { parseImport } from '../src/store/importV2'
import {
  newListItem,
  newModuleAssessment,
  newModuleReview,
  newProgrammeReview,
} from '../src/model/v2/defaults'

/** Simulate saving a packet to a file and opening it elsewhere. */
const viaFile = (data: unknown) => parseImport(JSON.stringify(data))

describe('connected workflow, through exported files', () => {
  const programme = newProgrammeReview({
    title: 'BSc Business',
    updatedAt: '2026-10-01T09:00:00.000Z',
    strengths: 'Programme-only text',
    priorities: [newListItem('Common AI statement in every brief')],
    moduleQuestions: [newListItem('Where must students work without AI?')],
  })
  const module = newModuleReview({
    code: 'BIS205',
    title: 'Data Analytics',
    updatedAt: '2026-10-02T09:00:00.000Z',
    workingWell: 'Module-only text',
    assessments: [
      newModuleAssessment({ title: 'Project', aiRole: 'integrated', action: 'discuss' }),
    ],
    contribution: 'Develops critical evaluation of AI outputs.',
  })

  it('programme prompts reach a module review without overwriting it', () => {
    const r = promptsFromImport(viaFile(programmePromptsPacket(programme)))
    if (!r.ok) throw new Error(r.error)
    const m = applyPrompts(module, r.packet)
    expect(m.programmePriorities[0].prompts.map((p) => p.text)).toEqual([
      'Common AI statement in every brief',
      'Where must students work without AI?',
    ])
    expect(m.workingWell).toBe('Module-only text')
    expect(m.assessments).toEqual(module.assessments)
  })

  it('a module contribution reaches a programme review without overwriting it', () => {
    const r = contributionFromImport(viaFile(moduleContributionPacket(module)))
    if (!r.ok) throw new Error(r.error)
    const p = applyContribution(programme, r.packet)
    expect(p.moduleContributions[0].snapshot.contribution).toBe(
      'Develops critical evaluation of AI outputs.',
    )
    expect(p.strengths).toBe('Programme-only text')
    expect(p.priorities).toEqual(programme.priorities)
  })

  it('accepts a whole module or programme review file in place of the packet', () => {
    const c = contributionFromImport(viaFile(module))
    const q = promptsFromImport(viaFile(programme))
    expect(c.ok && c.packet.sourceReviewId).toBe(module.id)
    expect(q.ok && q.packet.prompts).toHaveLength(2)
  })

  it('refuses files meant for the other tool, with a pointer to the right place', () => {
    const c = contributionFromImport(viaFile(programmePromptsPacket(programme)))
    const q = promptsFromImport(viaFile(moduleContributionPacket(module)))
    expect(!c.ok && c.error).toMatch(/module review/)
    expect(!q.ok && q.error).toMatch(/programme review/)
    expect(contributionFromImport(parseImport('{bad')).ok).toBe(false)
  })

  it('recognises a re-imported contribution and an updated one', () => {
    const packet = moduleContributionPacket(module)
    const p = applyContribution(programme, packet)
    expect(matchContribution(p, moduleContributionPacket(module))).toBe('same')
    const later = moduleContributionPacket({ ...module, updatedAt: '2026-10-09T09:00:00.000Z' })
    expect(matchContribution(p, later)).toBe('newer')
    expect(applyContribution(p, later).moduleContributions).toHaveLength(1)
  })

  it('does not treat a module recommendation as a programme decision', () => {
    const p = applyContribution(programme, moduleContributionPacket(module))
    expect(p.priorities).toEqual(programme.priorities)
    expect(p.statement.status).toBe('draft')
  })
})
