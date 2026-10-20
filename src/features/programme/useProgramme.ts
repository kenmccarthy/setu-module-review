import type { Draft } from 'immer'
import type { ProgrammeReview } from '../../model/v2/schema'
import { useCurrent, useWorkspace } from '../../store/workspace'

/** The open programme review plus helpers to change it (each change is saved). */
export function useProgramme() {
  const review = useCurrent('programme')
  const update = useWorkspace((s) => s.update)
  const edit = (fn: (d: Draft<ProgrammeReview>) => void) => update<ProgrammeReview>(fn)
  const set = (patch: Partial<ProgrammeReview>) => edit((d) => void Object.assign(d, patch))
  return { review: review!, edit, set }
}
