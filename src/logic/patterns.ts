import type { Review } from '../model/schema'
import { PATTERN_DEFINITIONS, type PatternId } from '../content/synthesis'
import { AI_POSITIONS, optionLabel } from '../content/scales'
import { allAssessments, assessmentLabel, priorityAssessments } from './flags'
import { plural } from './text'

export type PatternStatus = 'triggered' | 'possible' | 'clear' | 'unknown'

export interface PatternResult {
  id: PatternId
  text: string
  status: PatternStatus
  /** Human-readable evidence lines. */
  evidence: string[]
}

const stageKey = (capId: string, stage: number) => `${capId}:${stage}`

export function detectPatterns(review: Review): PatternResult[] {
  const refs = allAssessments(review)
  const rated = refs.filter((r) => r.assessment.vulnerability && r.assessment.assurance)
  const prog = review.programme.progression
  const stages = Array.from({ length: review.programme.stages }, (_, i) => i + 1)

  const results: Record<PatternId, Omit<PatternResult, 'id' | 'text'>> = {
    vulnerable_low_assurance: (() => {
      if (rated.length === 0) return { status: 'unknown', evidence: [] }
      const p = priorityAssessments(review)
      const evidence = p.map(assessmentLabel)
      return {
        status: p.length >= 2 ? 'triggered' : p.length === 1 ? 'possible' : 'clear',
        evidence,
      }
    })(),

    type_overused: (() => {
      const typed = refs.filter((r) => r.assessment.type)
      if (typed.length < 3) return { status: 'unknown', evidence: [] }
      const counts = new Map<string, number>()
      for (const r of typed) counts.set(r.assessment.type, (counts.get(r.assessment.type) ?? 0) + 1)
      const over = [...counts.entries()].filter(([, n]) => n >= 3 && n / typed.length >= 0.4)
      const evidence = over.map(([t, n]) => `${t}: ${n} of ${typed.length} assessments`)
      return { status: over.length ? 'triggered' : 'clear', evidence }
    })(),

    contradictory: (() => {
      const positioned = refs.filter((r) => r.assessment.position)
      if (positioned.length < 2) return { status: 'unknown', evidence: [] }
      const evidence: string[] = []
      for (const s of stages) {
        const inStage = positioned.filter((r) => r.module.stage === s)
        const has = (p: string) => inStage.some((r) => r.assessment.position === p)
        if (has('restricted') && (has('open') || has('integrated'))) {
          const mix = [
            ...new Set(inStage.map((r) => optionLabel(AI_POSITIONS, r.assessment.position))),
          ]
          evidence.push(
            `Stage ${s} mixes ${mix.join(', ')} – check that the reasons are explained to students`,
          )
        }
      }
      const answer = (review.programme.coherenceAnswers['contradictory'] ?? '').trim()
      if (answer) evidence.push(`Team note: ${answer}`)
      return { status: evidence.length ? 'possible' : 'clear', evidence }
    })(),

    protected_unassessed: (() => {
      const protectedCaps = review.programme.protectedCapabilities
      if (protectedCaps.length === 0) return { status: 'unknown', evidence: [] }
      const assessed = new Set(
        refs.flatMap((r) => r.assessment.protectedCapabilities.map((c) => c.label.toLowerCase())),
      )
      const missing = protectedCaps.filter((c) => !assessed.has(c.label.toLowerCase()))
      const evidence = missing.map((c) => `${c.label}: not evidenced by any assessment`)
      const status: PatternStatus =
        missing.length === 0
          ? 'clear'
          : missing.length === protectedCaps.length
            ? 'triggered'
            : 'possible'
      return { status, evidence }
    })(),

    integration_unprepared: (() => {
      const integrated = refs.filter(
        (r) => r.assessment.position === 'integrated' || r.assessment.position === 'open',
      )
      if (integrated.length === 0) return { status: 'unknown', evidence: [] }
      const introducedBy = (stage: number) =>
        ['literacy', 'ethics', 'genai'].some((cap) =>
          stages.filter((s) => s <= stage).some((s) => (prog[stageKey(cap, s)] ?? []).length > 0),
        )
      const evidence = integrated
        .filter((r) => !introducedBy(r.module.stage))
        .map(
          (r) =>
            `${assessmentLabel(r)} (stage ${r.module.stage}) – no AI literacy/ethics/GenAI use mapped at or before this stage`,
        )
      return { status: evidence.length ? 'triggered' : 'clear', evidence }
    })(),

    literacy_gap: (() => {
      const anyMapped = Object.values(prog).some((v) => v.length > 0)
      if (!anyMapped)
        return {
          status: 'unknown',
          evidence: ['The AI capability progression map has not been completed.'],
        }
      const introducedStages = stages.filter((s) =>
        (prog[stageKey('literacy', s)] ?? []).includes('introduced'),
      )
      if (introducedStages.length === 0)
        return { status: 'triggered', evidence: ['AI literacy is not introduced at any stage.'] }
      if (introducedStages.length >= 3)
        return {
          status: 'possible',
          evidence: [
            `AI literacy is marked as "introduced" at stages ${introducedStages.join(', ')} – possible duplication.`,
          ],
        }
      return {
        status: 'clear',
        evidence: [`AI literacy introduced at stage ${introducedStages.join(', ')}.`],
      }
    })(),

    no_progression: (() => {
      const anyMapped = Object.values(prog).some((v) => v.length > 0)
      if (!anyMapped) return { status: 'unknown', evidence: [] }
      const stagesUsed = stages.filter((s) =>
        Object.entries(prog).some(([k, v]) => k.endsWith(`:${s}`) && v.length > 0),
      )
      const demonstrated = Object.values(prog).some((v) => v.includes('demonstrated'))
      const evidence: string[] = []
      if (stagesUsed.length <= 1)
        evidence.push(
          `AI capability is only mapped at ${stagesUsed.length ? `stage ${stagesUsed[0]}` : 'no stage'}.`,
        )
      if (!demonstrated) evidence.push('No capability is marked as "demonstrated" at any stage.')
      const teamRating = review.programme.progressionRating
      if (teamRating === 'review' || teamRating === 'priority')
        evidence.push(
          `Team rated progression as "${teamRating === 'review' ? 'Review recommended' : 'Priority action required'}".`,
        )
      return { status: evidence.length ? 'triggered' : 'clear', evidence }
    })(),

    volume: (() => {
      const mods = review.modules.filter((m) => m.assessments.length > 0)
      if (mods.length === 0) return { status: 'unknown', evidence: [] }
      const total = mods.reduce((n, m) => n + m.assessments.length, 0)
      const avg = total / mods.length
      const heavy = mods.filter((m) => m.assessments.length >= 4)
      const evidence: string[] = []
      if (avg > 3) evidence.push(`Average of ${avg.toFixed(1)} assessments per module.`)
      for (const m of heavy)
        evidence.push(
          `${m.code || m.title || 'Module'}: ${plural(m.assessments.length, 'assessment')}`,
        )
      const answer = (review.programme.coherenceAnswers['workload'] ?? '').trim()
      if (answer) evidence.push(`Team note: ${answer}`)
      return { status: avg > 3 || heavy.length ? 'possible' : 'clear', evidence }
    })(),

    integration_opportunity: (() => {
      if (refs.length === 0) return { status: 'unknown', evidence: [] }
      const evidence = refs
        .filter(
          (r) =>
            (r.assessment.position === 'restricted' || r.assessment.position === 'limited') &&
            (r.assessment.authenticityRating === 'review' ||
              r.assessment.authenticityRating === 'priority'),
        )
        .map(
          (r) => `${assessmentLabel(r)} – AI-restricted/limited but authenticity rated for review`,
        )
      const anyIntegrated = refs.some(
        (r) => r.assessment.position === 'integrated' || r.assessment.position === 'open',
      )
      if (!anyIntegrated && review.programme.humanAiCapabilities.length > 0)
        evidence.push(
          'Human-AI capabilities are expected of graduates but no assessment is AI Integrated or AI Open.',
        )
      return { status: evidence.length ? 'possible' : 'clear', evidence }
    })(),

    outcomes_review: (() => {
      const evidence: string[] = []
      const plo = review.programme.ploCheckpoint
      if (plo === 'partially' || plo === 'no' || plo === 'discuss')
        evidence.push(
          'Programme learning outcomes checkpoint: ' +
            { partially: 'Partially', no: 'No', discuss: 'Requires further discussion' }[plo],
        )
      for (const m of review.modules) {
        const flagged = m.learningOutcomes.filter(
          (lo) => lo.rating === 'significant' || lo.rating === 'new',
        )
        if (flagged.length)
          evidence.push(
            `${m.code || m.title || 'Module'}: ${plural(flagged.length, 'outcome')} need significant review or addition`,
          )
      }
      const anyRated =
        plo !== '' || review.modules.some((m) => m.learningOutcomes.some((lo) => lo.rating))
      return { status: !anyRated ? 'unknown' : evidence.length ? 'triggered' : 'clear', evidence }
    })(),
  }

  return PATTERN_DEFINITIONS.map((d) => ({ id: d.id, text: d.text, ...results[d.id] }))
}
