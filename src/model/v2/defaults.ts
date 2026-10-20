import { uid } from '../defaults'
import {
  ListItemSchema,
  ModuleAssessmentSchema,
  ModuleReviewSchema,
  ProgrammeReviewSchema,
  type ListItem,
  type ModuleAssessment,
  type ModuleReview,
  type ProgrammeReview,
} from './schema'

export { uid }

const now = () => new Date().toISOString()

export function newProgrammeReview(partial: Partial<ProgrammeReview> = {}): ProgrammeReview {
  const ts = now()
  return ProgrammeReviewSchema.parse({
    id: uid(),
    createdAt: ts,
    updatedAt: ts,
    ...partial,
    kind: 'programme',
  })
}

export function newModuleReview(partial: Partial<ModuleReview> = {}): ModuleReview {
  const ts = now()
  return ModuleReviewSchema.parse({
    id: uid(),
    createdAt: ts,
    updatedAt: ts,
    ...partial,
    kind: 'module',
  })
}

export function newModuleAssessment(partial: Partial<ModuleAssessment> = {}): ModuleAssessment {
  return ModuleAssessmentSchema.parse({ id: uid(), ...partial })
}

export function newListItem(text = ''): ListItem {
  return ListItemSchema.parse({ id: uid(), text })
}

/** Maximum entries for "Our priorities" (programme) and "Our next steps" (module). */
export const MAX_PRIORITIES = 3
