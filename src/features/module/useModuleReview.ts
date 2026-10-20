import type { Draft } from 'immer'
import type { ModuleReview } from '../../model/v2/schema'
import { useCurrent, useWorkspace } from '../../store/workspace'

/** The open module review plus helpers to change it (each change is saved). */
export function useModuleReview() {
  const review = useCurrent('module')
  const update = useWorkspace((s) => s.update)
  const edit = (fn: (d: Draft<ModuleReview>) => void) => update<ModuleReview>(fn)
  const set = (patch: Partial<ModuleReview>) => edit((d) => void Object.assign(d, patch))
  return { review: review!, edit, set }
}
