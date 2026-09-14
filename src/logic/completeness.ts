import type { Assessment, Module } from '../model/schema'

export interface Completeness {
  done: number
  total: number
}

/** Rough completeness of an assessment: the ratings the synthesis depends on. */
export function assessmentCompleteness(a: Assessment): Completeness {
  const checks = [
    a.title.trim() !== '',
    a.purpose.trim() !== '',
    a.vulnerability !== '',
    a.position !== '',
    a.assurance !== '',
    a.humanAgencyEvidence !== '',
    a.processDecision !== '',
    a.authenticityRating !== '',
    a.practicalityRating !== '',
  ]
  return { done: checks.filter(Boolean).length, total: checks.length }
}

export function moduleCompleteness(m: Module): Completeness {
  const checks = [
    m.title.trim() !== '',
    m.contextReflection.trim() !== '',
    m.learningOutcomes.length > 0 && m.learningOutcomes.every((lo) => lo.rating !== ''),
    m.ltRating !== '',
    m.assessments.length > 0,
  ]
  let done = checks.filter(Boolean).length
  let total = checks.length
  for (const a of m.assessments) {
    const c = assessmentCompleteness(a)
    done += c.done
    total += c.total
  }
  return { done, total }
}
