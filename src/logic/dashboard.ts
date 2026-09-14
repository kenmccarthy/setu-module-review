import type { Review } from '../model/schema'
import type { DashboardArea, Quality } from '../content/scales'
import { allAssessments, flagLevel } from './flags'
import { detectPatterns } from './patterns'

const QUALITY_ORDER: Quality[] = ['strong', 'adequate', 'review', 'priority']

function average(values: Quality[]): Quality | '' {
  if (values.length === 0) return ''
  const mean = values.reduce((n, v) => n + QUALITY_ORDER.indexOf(v), 0) / values.length
  return QUALITY_ORDER[Math.min(3, Math.round(mean))]
}

/** Data-driven suggestion for each dashboard area; the team can override. */
export function suggestDashboard(
  review: Review,
): Record<DashboardArea, { value: Quality | ''; reason: string }> {
  const refs = allAssessments(review)
  const rated = refs.filter((r) => r.assessment.vulnerability && r.assessment.assurance)
  const patterns = Object.fromEntries(detectPatterns(review).map((p) => [p.id, p]))

  const resilience = (() => {
    if (rated.length === 0) return { value: '' as const, reason: 'No assessments rated yet.' }
    const priority = rated.filter((r) => flagLevel(r.assessment) === 'priority').length
    const watch = rated.filter((r) => flagLevel(r.assessment) === 'watch').length
    if (priority >= 2)
      return {
        value: 'priority' as const,
        reason: `${priority} assessments are High/Critical vulnerability with Low assurance.`,
      }
    if (priority === 1)
      return {
        value: 'review' as const,
        reason: '1 assessment is High/Critical vulnerability with Low assurance.',
      }
    if (watch > 0)
      return {
        value: 'adequate' as const,
        reason: `${watch} High/Critical assessments rely on Moderate assurance.`,
      }
    return {
      value: 'strong' as const,
      reason: 'No High/Critical assessments with Low or Moderate assurance.',
    }
  })()

  const assurance = (() => {
    const withA = refs.filter((r) => r.assessment.assurance)
    if (withA.length === 0) return { value: '' as const, reason: 'No assurance ratings yet.' }
    const low = withA.filter((r) => r.assessment.assurance === 'low').length / withA.length
    const value: Quality =
      low === 0 ? 'strong' : low < 0.25 ? 'adequate' : low < 0.5 ? 'review' : 'priority'
    return {
      value,
      reason: `${Math.round(low * 100)}% of rated assessments provide Low assurance.`,
    }
  })()

  const progression = (() => {
    const team = review.programme.progressionRating
    if (team) return { value: team, reason: 'Team rating from Part A §3.' }
    const p = patterns['no_progression']
    if (p.status === 'unknown')
      return { value: '' as const, reason: 'Progression map not completed.' }
    return {
      value: p.status === 'triggered' ? ('review' as const) : ('adequate' as const),
      reason: p.evidence[0] ?? 'Progression mapped across stages.',
    }
  })()

  const protectedArea = (() => {
    const p = patterns['protected_unassessed']
    if (p.status === 'unknown')
      return { value: '' as const, reason: 'No protected capabilities selected in Part A §2.' }
    if (p.status === 'clear')
      return {
        value: 'strong' as const,
        reason: 'Every protected capability is evidenced by at least one assessment.',
      }
    if (p.status === 'possible')
      return {
        value: 'review' as const,
        reason: `${p.evidence.length} protected capabilities are not evidenced by any assessment.`,
      }
    return {
      value: 'priority' as const,
      reason: 'No protected capability is evidenced by any assessment.',
    }
  })()

  const coherence = (() => {
    const team = review.programme.coherenceRating
    if (team) return { value: team, reason: 'Team rating from Part A §7.' }
    const flags = [patterns['type_overused'], patterns['volume']].filter(
      (p) => p.status === 'triggered' || p.status === 'possible',
    )
    if (refs.length === 0) return { value: '' as const, reason: 'No assessments yet.' }
    return {
      value: flags.length ? ('review' as const) : ('adequate' as const),
      reason: flags.length
        ? flags.map((f) => f.evidence[0]).join(' ')
        : 'No overuse or volume patterns detected.',
    }
  })()

  const consistency = (() => {
    const p = patterns['contradictory']
    if (p.status === 'unknown') return { value: '' as const, reason: 'Too few AI positions set.' }
    return {
      value: p.status === 'clear' ? ('adequate' as const) : ('review' as const),
      reason: p.evidence[0] ?? 'No stage mixes restricted and open positions.',
    }
  })()

  const relevance = (() => {
    const ratings = refs
      .map((r) => r.assessment.authenticityRating)
      .filter((x): x is Quality => x !== '')
    const value = average(ratings)
    return {
      value,
      reason: value
        ? `Average of ${ratings.length} authenticity ratings.`
        : 'No authenticity ratings yet.',
    }
  })()

  return {
    resilience,
    assurance,
    progression,
    protected: protectedArea,
    coherence,
    consistency,
    relevance,
  }
}

export function effectiveDashboard(review: Review): Record<DashboardArea, Quality | ''> {
  const suggested = suggestDashboard(review)
  const out = {} as Record<DashboardArea, Quality | ''>
  for (const area of Object.keys(suggested) as DashboardArea[]) {
    out[area] =
      (review.synthesis.dashboard[area] as Quality | '' | undefined) || suggested[area].value
  }
  return out
}
