/**
 * Read-only views of data carried over from a v1 review that has no place in the v2 questions.
 * Shown beside the relevant section so nothing recorded earlier is hidden or lost.
 */
import { PROGRESSION_CAPABILITIES } from '../../content/capabilities'
import { DISCUSSION_QUESTIONS, PATTERN_DEFINITIONS } from '../../content/synthesis'
import { COHERENCE as V1_COHERENCE } from '../../content/programme'
import {
  ACTION_CATEGORIES,
  ACTION_PRIORITIES,
  PROGRESSION_PHASES,
  QUALITY,
  optionLabel,
} from '../../content/scales'
import { z } from 'zod'
import { ActionSchema, ModuleSchema, ReviewSchema, type Review } from '../../model/legacy/v1'
import { MAX_PRIORITIES } from '../../model/v2/defaults'
import type { ModuleReview, ProgrammeReview } from '../../model/v2/schema'

export interface LegacyItem {
  label: string
  value: string
}

export function originalV1(review: ProgrammeReview): Review | undefined {
  if (review.legacy?.source !== 'v1') return undefined
  const r = ReviewSchema.safeParse(review.legacy.original)
  return r.success ? r.data : undefined
}

const phaseLetters = (phases: string[]) =>
  phases.map((p) => optionLabel(PROGRESSION_PHASES, p as never).charAt(0)).join(', ')

/** Legacy items per programme section id. Empty values are left out. */
export function programmeLegacy(review: ProgrammeReview): Record<string, LegacyItem[]> {
  const v1 = originalV1(review)
  if (!v1) return {}
  const p = v1.programme
  const s = v1.synthesis
  const quality = (v: string) => optionLabel(QUALITY, v as never)
  const items = (list: [string, string][]): LegacyItem[] =>
    list.filter(([, v]) => v.trim()).map(([label, value]) => ({ label, value }))

  const agentic = Object.entries(p.progression)
    .filter(([k, v]) => k.startsWith('agentic:') && v.length)
    .map(([k, v]) => `Stage ${k.split(':')[1]}: ${phaseLetters(v)}`)
    .join('; ')

  return {
    capabilities: items([
      ['Enduring graduate capabilities', p.enduringCapabilities.map((c) => c.label).join(', ')],
      ['How protected capabilities are assured', p.protectedNotes],
      ['Programme learning outcomes checkpoint', p.ploCheckpoint === 'mostly' ? 'Mostly' : ''],
    ]),
    progression: items([
      [PROGRESSION_CAPABILITIES.find((c) => c.id === 'agentic')!.label, agentic],
      ['Progression rating', quality(p.progressionRating)],
    ]),
    curriculum: items(
      Object.entries(s.patternNotes).map(([id, note]) => [
        `Pattern: ${PATTERN_DEFINITIONS.find((x) => x.id === id)?.text ?? id}`,
        note,
      ]),
    ),
    coherence: items([
      ...Object.entries(p.coherenceAnswers).map(
        ([id, v]) =>
          [V1_COHERENCE.questions.find((q) => q.id === id)?.text ?? id, v] as [string, string],
      ),
      ['Coherence observations', p.coherenceObservations],
      ['Coherence rating', quality(p.coherenceRating)],
    ]),
    priorities: items([
      ...Object.entries(s.discussion)
        .filter(([id]) => id !== 'doing_well')
        .map(
          ([id, v]) =>
            [DISCUSSION_QUESTIONS.find((q) => q.id === id)?.text ?? id, v] as [string, string],
        ),
      ...s.actions
        .filter((a) => a.scope === 'programme')
        .map(
          (a) =>
            [
              `Action plan (${[optionLabel(ACTION_CATEGORIES, a.category), optionLabel(ACTION_PRIORITIES, a.priority) && `${optionLabel(ACTION_PRIORITIES, a.priority)} priority`].filter(Boolean).join(', ') || 'programme'})`,
              [a.text, a.owner && `Owner: ${a.owner}`, a.timescale && `Timescale: ${a.timescale}`]
                .filter(Boolean)
                .join(' · '),
            ] as [string, string],
        ),
      ['Overall position', s.overallPosition],
    ]),
  }
}

/** v1 module data with no v2 question, from a migrated module review. */
export function moduleLegacy(review: ModuleReview): Record<string, LegacyItem[]> {
  if (review.legacy?.source !== 'v1') return {}
  const r = V1ModuleOriginalSchema.safeParse(review.legacy.original)
  if (!r.success) return {}
  const { module: m, actions } = r.data
  const items = (list: [string, string][]): LegacyItem[] =>
    list.filter(([, v]) => v.trim()).map(([label, value]) => ({ label, value }))
  const steps = actions.filter((a) => a.text.trim())
  return {
    context: items([['Module context reflection', m.contextReflection]]),
    teaching: items([['Learning and teaching rating', optionLabel(QUALITY, m.ltRating as never)]]),
    reflection: items(
      steps
        .slice(MAX_PRIORITIES)
        .map((a) => [
          'Further module action from the v1 action plan',
          [a.text, a.owner && `Owner: ${a.owner}`, a.timescale && `Timescale: ${a.timescale}`]
            .filter(Boolean)
            .join(' · '),
        ]),
    ),
  }
}

const V1ModuleOriginalSchema = z.object({
  module: ModuleSchema,
  actions: z.array(ActionSchema).default([]),
})
