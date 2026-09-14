import type { Action, Review } from '../model/schema'
import {
  ACTION_CATEGORIES,
  AI_POSITIONS,
  DASHBOARD_AREAS,
  QUALITY,
  optionLabel,
} from '../content/scales'
import { allAssessments, assessmentLabel, priorityAssessments, watchAssessments } from './flags'
import { detectPatterns } from './patterns'
import { effectiveDashboard } from './dashboard'
import { formatDate, joinList, plural } from './text'

export interface SummaryItem {
  text: string
  /** Optional link target within the app. */
  to?: string
}

export interface ReviewSummary {
  overallPosition: string
  keyStrengths: SummaryItem[]
  priorityVulnerabilities: SummaryItem[]
  protectedCapabilities: SummaryItem[]
  aiEnabledCapabilities: SummaryItem[]
  capabilityGaps: SummaryItem[]
  portfolioObservations: SummaryItem[]
  prioritisedForReview: SummaryItem[]
  programmeActions: SummaryItem[]
  moduleActions: SummaryItem[]
  reviewDate: string
}

export function actionText(a: Action, review: Review): string {
  const cat = optionLabel(ACTION_CATEGORIES, a.category)
  const mod = a.scope === 'module' ? review.modules.find((m) => m.id === a.moduleId) : undefined
  const where = mod ? ` [${mod.code || mod.title || 'module'}]` : ''
  const meta = [a.priority && `${a.priority} priority`, a.owner, a.timescale]
    .filter(Boolean)
    .join(', ')
  return `${cat ? cat + ': ' : ''}${a.text || '(no description)'}${where}${meta ? ` (${meta})` : ''}`
}

export function generateSummary(review: Review): ReviewSummary {
  const p = review.programme
  const refs = allAssessments(review)
  const dash = effectiveDashboard(review)
  const patterns = detectPatterns(review)
  const patternById = Object.fromEntries(patterns.map((x) => [x.id, x]))
  const priority = priorityAssessments(review)
  const watch = watchAssessments(review)

  const strongAreas = DASHBOARD_AREAS.filter((a) => dash[a.id] === 'strong').map((a) => a.label)
  const weakAreas = DASHBOARD_AREAS.filter(
    (a) => dash[a.id] === 'priority' || dash[a.id] === 'review',
  ).map((a) => `${a.label} (${optionLabel(QUALITY, dash[a.id])})`)

  const overallPosition =
    review.synthesis.overallPosition.trim() ||
    [
      p.title
        ? `The programme team has reviewed ${p.title} against the AI Programme & Module Review framework.`
        : 'The programme team has completed the AI Programme & Module Review.',
      `The review covered ${plural(review.modules.length, 'module')} and ${plural(refs.length, 'assessment')}.`,
      strongAreas.length ? `The programme is rated Strong for ${joinList(strongAreas)}.` : '',
      weakAreas.length ? `Areas needing attention: ${joinList(weakAreas)}.` : '',
      priority.length
        ? `${plural(priority.length, 'assessment')} ${priority.length === 1 ? 'has' : 'have'} been prioritised for review because AI vulnerability is High/Critical and learning assurance is Low.`
        : refs.length
          ? 'No assessment combines High/Critical AI vulnerability with Low learning assurance.'
          : '',
    ]
      .filter(Boolean)
      .join(' ')

  const keyStrengths: SummaryItem[] = [
    ...strongAreas.map((a) => ({ text: `${a}: rated Strong.` })),
    ...refs
      .filter(
        (r) =>
          r.assessment.assurance === 'high' &&
          (r.assessment.vulnerability === 'low' || r.assessment.vulnerability === 'moderate'),
      )
      .map((r) => ({
        text: `${assessmentLabel(r)} provides high learning assurance.`,
        to: `/modules/${r.module.id}/assessments/${r.assessment.id}`,
      })),
    ...review.modules
      .filter((m) => m.ltRating === 'strong')
      .map((m) => ({
        text: `${m.code || m.title}: learning and teaching design prepares students well for AI expectations.`,
        to: `/modules/${m.id}`,
      })),
    ...review.synthesis.actions
      .filter((a) => a.category === 'maintain')
      .map((a) => ({ text: actionText(a, review), to: '/synthesis/actions' })),
  ]

  const priorityVulnerabilities: SummaryItem[] = [
    ...priority.map((r) => ({
      text: `${assessmentLabel(r)} – ${optionLabel(
        ['low', 'moderate', 'high', 'critical'].map((v) => ({
          value: v,
          label: v.charAt(0).toUpperCase() + v.slice(1),
        })),
        r.assessment.vulnerability,
      )} vulnerability, Low assurance.${r.assessment.vulnerabilityReason ? ' ' + r.assessment.vulnerabilityReason : ''}`,
      to: `/modules/${r.module.id}/assessments/${r.assessment.id}`,
    })),
    ...watch.map((r) => ({
      text: `${assessmentLabel(r)} – High/Critical vulnerability with Moderate assurance (watch).`,
      to: `/modules/${r.module.id}/assessments/${r.assessment.id}`,
    })),
    ...(patternById['type_overused'].status === 'triggered'
      ? patternById['type_overused'].evidence.map((e) => ({
          text: `Assessment type overused – ${e}.`,
          to: '/synthesis/patterns',
        }))
      : []),
  ]

  const protectedCapabilities: SummaryItem[] = p.protectedCapabilities.map((c) => {
    const where = refs.filter((r) =>
      r.assessment.protectedCapabilities.some(
        (x) => x.label.toLowerCase() === c.label.toLowerCase(),
      ),
    )
    return {
      text: where.length
        ? `${c.label} – evidenced in ${joinList(where.map(assessmentLabel))}.`
        : `${c.label} – not yet evidenced by any assessment.`,
      to: '/programme/capabilities',
    }
  })

  const aiEnabledCapabilities: SummaryItem[] = p.humanAiCapabilities.map((c) => ({
    text: c.label,
    to: '/programme/capabilities',
  }))

  const capabilityGaps: SummaryItem[] = [
    ...['literacy_gap', 'no_progression', 'integration_unprepared', 'protected_unassessed'].flatMap(
      (id) => {
        const pat = patternById[id as keyof typeof patternById]
        return pat.status === 'triggered' || pat.status === 'possible'
          ? pat.evidence.map((e) => ({ text: e, to: '/synthesis/patterns' }))
          : []
      },
    ),
    ...(p.progressionNotes.trim()
      ? [{ text: p.progressionNotes.trim(), to: '/programme/progression' }]
      : []),
  ]

  const positionCounts = AI_POSITIONS.map((o) => ({
    label: o.label,
    n: refs.filter((r) => r.assessment.position === o.value).length,
  })).filter((x) => x.n > 0)
  const portfolioObservations: SummaryItem[] = [
    ...(positionCounts.length
      ? [
          {
            text: `AI positions across the portfolio: ${positionCounts.map((x) => `${x.label} (${x.n})`).join(', ')}.`,
            to: '/programme/portfolio',
          },
        ]
      : []),
    ...(p.coherenceRating
      ? [
          {
            text: `Overall programme coherence rated ${optionLabel(QUALITY, p.coherenceRating)}.`,
            to: '/programme/coherence',
          },
        ]
      : []),
    ...(p.coherenceObservations.trim()
      ? [{ text: p.coherenceObservations.trim(), to: '/programme/coherence' }]
      : []),
    ...['volume', 'contradictory', 'integration_opportunity'].flatMap((id) => {
      const pat = patternById[id as keyof typeof patternById]
      return pat.status === 'triggered' || pat.status === 'possible'
        ? pat.evidence.map((e) => ({ text: e, to: '/synthesis/patterns' }))
        : []
    }),
  ]

  const prioritisedForReview: SummaryItem[] = [
    ...priority.map((r) => ({
      text: assessmentLabel(r),
      to: `/modules/${r.module.id}/assessments/${r.assessment.id}`,
    })),
    ...review.modules
      .filter(
        (m) =>
          m.ltRating === 'priority' ||
          m.learningOutcomes.some((lo) => lo.rating === 'significant' || lo.rating === 'new'),
      )
      .map((m) => ({
        text: `${m.code || m.title || 'Module'} – learning outcomes or teaching design flagged for review.`,
        to: `/modules/${m.id}`,
      })),
    ...refs
      .filter(
        (r) =>
          r.assessment.processDecision === 'redesign' ||
          r.assessment.authenticityRating === 'priority',
      )
      .filter((r) => !priority.some((x) => x.assessment.id === r.assessment.id))
      .map((r) => ({
        text: `${assessmentLabel(r)} – redesign recommended.`,
        to: `/modules/${r.module.id}/assessments/${r.assessment.id}`,
      })),
  ]

  const programmeActions = review.synthesis.actions
    .filter((a) => a.scope === 'programme')
    .map((a) => ({ text: actionText(a, review), to: '/synthesis/actions' }))
  const moduleActions = review.synthesis.actions
    .filter((a) => a.scope === 'module')
    .map((a) => ({ text: actionText(a, review), to: '/synthesis/actions' }))

  return {
    overallPosition,
    keyStrengths,
    priorityVulnerabilities,
    protectedCapabilities,
    aiEnabledCapabilities,
    capabilityGaps,
    portfolioObservations,
    prioritisedForReview,
    programmeActions,
    moduleActions,
    reviewDate: formatDate(p.reviewDate),
  }
}
