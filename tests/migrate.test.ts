import { describe, expect, it } from 'vitest'
import { migrateV1Review } from '../src/migrate/v1ToV2'
import { ModuleReviewSchema, ProgrammeReviewSchema } from '../src/model/v2/schema'
import { parseReviewJson, serializeReview } from '../src/store/io'
import { newReview } from '../src/model/defaults'
import { sample } from './fixture'

describe('v1 → v2 migration', () => {
  const v1 = sample()
  const { programme, modules } = migrateV1Review(v1, '2026-10-01T00:00:00.000Z')

  it('splits one v1 review into a programme review and one module review per module', () => {
    expect(programme.kind).toBe('programme')
    expect(modules.map((m) => m.code)).toEqual(['BIS101', 'BIS301'])
    expect(new Set([programme.id, ...modules.map((m) => m.id)]).size).toBe(3)
  })

  it('produces documents that validate against the v2 schema and survive a JSON round trip', () => {
    expect(ProgrammeReviewSchema.parse(JSON.parse(JSON.stringify(programme)))).toEqual(programme)
    for (const m of modules)
      expect(ModuleReviewSchema.parse(JSON.parse(JSON.stringify(m)))).toEqual(m)
  })

  it('carries programme context and capability selections over unchanged', () => {
    const p = v1.programme
    expect(programme).toMatchObject({
      title: p.title,
      nfqLevel: p.nfqLevel,
      coordinator: p.coordinator,
      academicUnit: p.academicUnit,
      stages: p.stages,
      disciplineReflection: p.disciplineReflection,
      independentCapabilities: p.protectedCapabilities,
      aiEnabledCapabilities: p.humanAiCapabilities,
      outcomesComments: p.ploAction,
      progressionGaps: p.progressionNotes,
      strengths: v1.synthesis.discussion.doing_well,
    })
  })

  it('leaves ratings that cannot be safely mapped unanswered, with a note', () => {
    expect(v1.programme.ploCheckpoint).toBe('mostly')
    expect(programme.outcomesAdequate).toBe('')
    expect(programme.progressionCoherent).toBe('')
    expect(programme.coordination).toBe('')
    expect(programme.legacy?.notes.join(' ')).toMatch(/Mostly/)
    for (const m of modules) {
      expect(m.outcomesAppropriate).toBe('')
      expect(m.ltOpportunities).toBe('')
      expect(m.assessments.every((a) => a.confidence === '' && a.action === '')).toBe(true)
    }
  })

  it('maps progression rows, flags merged cells for confirmation and keeps unmapped rows', () => {
    expect(programme.progression['literacy_responsible:1']).toEqual(['introduced', 'practised'])
    expect(programme.progression['collaboration:2']).toEqual(['introduced', 'practised'])
    expect(programme.progression['discipline:4']).toEqual(['developed', 'demonstrated'])
    expect(Object.keys(programme.progression).some((k) => k.startsWith('agentic'))).toBe(false)
    expect(programme.progressionUnconfirmed).toContain('literacy_responsible:1')
    expect(programme.progressionUnconfirmed).not.toContain('discipline:4')
    expect(programme.legacy?.notes.join(' ')).toMatch(/Advanced\/agentic/)
  })

  it('preserves module records, learning outcomes and every assessment parameter', () => {
    v1.modules.forEach((m, i) => {
      const mm = modules[i]
      expect(mm).toMatchObject({ title: m.title, stage: m.stage, coordinator: m.leader })
      expect(mm.learningOutcomes).toEqual(m.learningOutcomes)
      expect(mm.ltEnhance).toBe(m.ltActions)
      m.assessments.forEach((a, j) => {
        const { id, title, semester, weighting, type, ...advanced } = a
        const ma = mm.assessments[j]
        expect(ma).toMatchObject({ id, title, semester, weighting, type, aiRole: a.position })
        expect(ma.advanced).toEqual(advanced)
      })
    })
  })

  it('turns module-scoped v1 actions into module next steps', () => {
    expect(modules[0].nextSteps.map((s) => s.text)).toEqual([v1.synthesis.actions[1].text])
    expect(modules[1].nextSteps.map((s) => s.text)).toEqual([v1.synthesis.actions[2].text])
  })

  it('does not enter v1 programme actions as agreed priorities', () => {
    expect(programme.priorities).toEqual([])
  })

  it('starts the statement as a draft and preserves v1 statement text', () => {
    const r = newReview()
    r.statement.sections = { context: 'Our team wrote this.', rationale: '' }
    r.statement.agreedDate = '2026-06-01'
    const { programme: p } = migrateV1Review(r)
    expect(p.statement.status).toBe('draft')
    expect(p.statement.approvalDate).toBe('')
    expect(p.statement.legacySections).toEqual({ context: 'Our team wrote this.' })
    expect(programme.statement.approach).toBe(v1.statement.approach)
    expect(programme.statement.nextReviewDate).toBe(v1.statement.nextReviewDate)
  })

  it('links migrated modules to the programme as contributions without approving them', () => {
    expect(programme.moduleContributions.map((c) => c.sourceReviewId)).toEqual(
      modules.map((m) => m.id),
    )
    expect(programme.moduleContributions.every((c) => c.origin === 'v1-migration')).toBe(true)
  })

  it('keeps the complete original so the v1 review can be recovered (rollback)', () => {
    const recovered = parseReviewJson(serializeReview(programme.legacy!.original as never))
    expect(recovered.ok).toBe(true)
    if (recovered.ok) expect(recovered.review).toEqual(v1)
  })

  it('migrates an empty v1 review', () => {
    const { programme: p, modules: ms } = migrateV1Review(newReview())
    expect(ms).toEqual([])
    expect(p.moduleContributions).toEqual([])
  })
})
