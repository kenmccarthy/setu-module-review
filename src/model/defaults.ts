import {
  ActionSchema,
  AssessmentSchema,
  LearningOutcomeSchema,
  ModuleSchema,
  ReviewSchema,
  type Action,
  type Assessment,
  type LearningOutcome,
  type Module,
  type Review,
} from './schema'

export function uid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

const now = () => new Date().toISOString()

export function newReview(): Review {
  const ts = now()
  return ReviewSchema.parse({ id: uid(), createdAt: ts, updatedAt: ts })
}

export function newModule(stage = 1): Module {
  return ModuleSchema.parse({ id: uid(), stage })
}

export function newAssessment(): Assessment {
  return AssessmentSchema.parse({ id: uid() })
}

export function newLearningOutcome(): LearningOutcome {
  return LearningOutcomeSchema.parse({ id: uid() })
}

export function newAction(partial: Partial<Action> = {}): Action {
  return ActionSchema.parse({ id: uid(), ...partial })
}

/** Deep-copy a module with fresh ids for it and its children. */
export function cloneModule(source: Module): Module {
  const copy = structuredClone(source)
  copy.id = uid()
  copy.title = copy.title ? `${copy.title} (copy)` : ''
  const loMap = new Map<string, string>()
  copy.learningOutcomes = copy.learningOutcomes.map((lo) => {
    const id = uid()
    loMap.set(lo.id, id)
    return { ...lo, id }
  })
  copy.assessments = copy.assessments.map((a) => ({
    ...a,
    id: uid(),
    outcomeIds: a.outcomeIds.map((o) => loMap.get(o) ?? o),
  }))
  return copy
}
