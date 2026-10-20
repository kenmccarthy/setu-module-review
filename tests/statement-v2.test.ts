import { describe, expect, it } from 'vitest'
import {
  approveStatement,
  changedSinceAgreed,
  draftStatement,
  keepOwnText,
  placeholders,
  revertToDraft,
  setSectionText,
  setStatus,
  statementExport,
  statementSections,
  statementText,
  wordCount,
} from '../src/logic/v2/statement'
import { applyContribution, moduleContributionPacket } from '../src/logic/v2/exchange'
import { migrateV1Review } from '../src/migrate/v1ToV2'
import {
  newListItem,
  newModuleAssessment,
  newModuleReview,
  newProgrammeReview,
} from '../src/model/v2/defaults'
import { newReview } from '../src/model/defaults'
import { sample } from './fixture'

const all = (r: ReturnType<typeof newProgrammeReview>) => Object.values(draftStatement(r)).flat()

const answered = () =>
  newProgrammeReview({
    title: 'BSc Business',
    disciplineReflection: 'AI is changing how analysts work.',
    independentText: 'Interpreting client needs',
    aiEnabledText: 'Using AI to draft and critique models',
    outcomesAdequate: 'yes',
    progression: { 'evaluation:1': ['introduced'], 'oversight:3': ['demonstrated'] },
    progressionCoherent: 'yes',
    opportunitiesConfidence: 'yes',
    assessmentBalance: 'partially',
    coordination: 'some',
    strengths: 'Strong project work',
    priorities: [newListItem('Introduce a common AI statement in every brief')],
    statement: { approach: 'balanced', nextReviewDate: '2027-09-01' } as never,
  })

describe('Programme AI Integration Statement', () => {
  it('drafts the five sections from the specification', () => {
    expect(statementSections(newProgrammeReview()).map((s) => s.title)).toEqual([
      'Our Approach to AI',
      'Graduate Capabilities',
      'Curriculum and Assessment',
      'Responsible AI',
      'Review and Development',
    ])
  })

  it('makes no claims for an empty review: every sentence is a placeholder to confirm', () => {
    const r = newProgrammeReview()
    expect(all(r).every((s) => s.kind === 'confirm' && /^\[.*\]$/.test(s.text))).toBe(true)
    expect(placeholders(r).length).toBeGreaterThan(0)
  })

  it('produces a provisional statement without any module reviews', () => {
    const r = answered()
    expect(r.moduleContributions).toEqual([])
    expect(all(r).some((s) => s.kind === 'module')).toBe(false)
    expect(statementText(r)).toContain('Interpreting client needs')
  })

  it('uses the recorded answers, tagged by provenance', () => {
    const d = draftStatement(answered())
    expect(d.approach.map((s) => s.text)).toContain('AI is changing how analysts work.')
    expect(d.approach).toContainEqual({
      kind: 'decision',
      text: 'The programme has adopted an approach balanced between AI-integrated and AI-restricted learning.',
    })
    expect(d.curriculum.find((s) => /balance/.test(s.text))?.kind).toBe('proposed')
    expect(d.review.at(-1)?.text).toMatch(/by 1 September 2027\.$/)
  })

  it('describes priorities as proposed developments, never as completed', () => {
    const d = draftStatement(answered())
    const p = d.review.find((s) => /priorities/.test(s.text))!
    expect(p.kind).toBe('proposed')
    expect(p.text).toMatch(/priorities for development are: \(1\) introduce a common AI statement/)
    expect(statementText(answered())).not.toMatch(/has (been )?(introduced|implemented|completed)/)
  })

  it('presents module findings as module observations, not programme decisions', () => {
    const m = newModuleReview({
      code: 'BIS301',
      responsibleEngagement: 'yes',
      programmeDiscussion: 'Shared rubric for AI use',
      assessments: [newModuleAssessment({ title: 'Client project', aiRole: 'integrated' })],
    })
    const r = applyContribution(answered(), moduleContributionPacket(m))
    const modules = all(r).filter((s) => /BIS301/.test(s.text))
    expect(modules.length).toBe(3)
    expect(modules.every((s) => s.kind === 'module' && /^Module reviews/.test(s.text))).toBe(true)
    expect(statementText(r)).not.toMatch(/agreed|approved/i)
    expect(r.statement.status).toBe('draft')

    const off = { ...r, statement: { ...r.statement, includeModuleExamples: false } }
    expect(all(off).some((s) => s.kind === 'module')).toBe(false)
  })

  it('keeps team-authored text when the answers change, and says a new draft exists', () => {
    let r = setSectionText(answered(), 'capabilities', 'Our own wording.')
    expect(statementSections(r)[1]).toMatchObject({
      text: 'Our own wording.',
      edited: true,
      draftChanged: false,
    })
    r = { ...r, independentText: 'Something new' }
    expect(statementSections(r)[1]).toMatchObject({ text: 'Our own wording.', draftChanged: true })
    expect(statementSections(keepOwnText(r, 'capabilities'))[1].draftChanged).toBe(false)
    const reverted = statementSections(revertToDraft(r, 'capabilities'))[1]
    expect(reverted.edited).toBe(false)
    expect(reverted.text).toContain('Something new')
  })

  it('is agreed only through an explicit approval with approver and date', () => {
    const r = answered()
    const missing = approveStatement(r, {
      programmeName: 'BSc',
      approvedBy: '',
      approvalDate: '',
      nextReviewDate: '',
    })
    expect(missing.ok).toBe(false)
    const ok = approveStatement(r, {
      programmeName: 'BSc Business',
      approvedBy: 'Programme board',
      approvalDate: '2026-11-01',
      nextReviewDate: '2027-11-01',
    })
    if (!ok.ok) throw new Error(ok.error)
    expect(ok.review.statement.status).toBe('agreed')
    expect(changedSinceAgreed(ok.review)).toBe(false)
    const edited = setSectionText(ok.review, 'approach', 'Changed after approval.')
    expect(changedSinceAgreed(edited)).toBe(true)
    expect(setStatus(edited, 'draft').statement).toMatchObject({
      status: 'draft',
      agreedSnapshot: '',
    })
  })

  it('starts migrated statements as drafts and preserves v1 statement text', () => {
    const v1 = newReview()
    v1.statement.sections = { context: 'Team text from v1.' }
    v1.statement.agreedDate = '2026-01-01'
    const { programme } = migrateV1Review(v1)
    expect(programme.statement.status).toBe('draft')
    expect(programme.statement.legacySections.context).toBe('Team text from v1.')
  })

  it('exports sections with their provenance and optional evidence', () => {
    const { programme } = migrateV1Review(sample())
    const plain = statementExport(programme)
    expect(plain.packetType).toBe('programme-statement')
    expect(plain.sections).toHaveLength(5)
    expect(plain.sections[0].generated[0].kind).toBeDefined()
    expect(plain.evidence).toBeNull()
    const withEvidence = statementExport({
      ...programme,
      statement: { ...programme.statement, includeEvidenceAppendix: true },
    })
    expect(withEvidence.evidence?.modules).toHaveLength(2)
  })

  it('is roughly the target length for a fully answered review', () => {
    const { programme } = migrateV1Review(sample())
    const n = wordCount(statementText(programme))
    expect(n).toBeGreaterThan(250)
    expect(n).toBeLessThan(700)
  })
})
