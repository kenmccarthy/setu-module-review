/**
 * The v2 app state: the list of saved reviews and the review currently open. Each change to the
 * open review is saved straight to its own storage entry (see library.ts). Unlike the v1 store
 * this does not use zustand's persist middleware, so nothing writes the v1 key.
 */
import { create } from 'zustand'
import { produce, type Draft } from 'immer'
import type { AnyReview, ModuleReview, ProgrammeReview, ReviewKind } from '../model/v2/schema'
import { newModuleReview, newProgrammeReview } from '../model/v2/defaults'
import {
  browserStorage,
  deleteReview,
  listReviews,
  loadReview,
  saveReview,
  type IndexEntry,
} from './library'

export interface WorkspaceState {
  storage: Storage
  /** False when the browser blocks localStorage: work lasts only until the tab is closed. */
  persistent: boolean
  entries: IndexEntry[]
  current: AnyReview | null
  /** Id of the last review that could not be opened (missing or unreadable). */
  failedId: string | null
  /** Re-read the saved-review list (after imports or migration). */
  refresh: () => void
  /** Open a saved review; returns it, or undefined if no review has that id. */
  open: (id: string) => AnyReview | undefined
  /** Open a new, not yet saved, review. It is saved on its first change. */
  createProgramme: (partial?: Partial<ProgrammeReview>) => ProgrammeReview
  createModule: (partial?: Partial<ModuleReview>) => ModuleReview
  /** Change the open review inside an immer draft; it is saved immediately. */
  update: <T extends AnyReview>(fn: (draft: Draft<T>) => void) => void
  /** Replace the open review wholesale (e.g. after a pure exchange function) and save it. */
  replace: (review: AnyReview) => void
  remove: (id: string) => void
  /** Use another storage (tests). */
  useStorage: (storage: Storage, persistent?: boolean) => void
}

const initial = typeof window === 'undefined' ? null : browserStorage()

export const useWorkspace = create<WorkspaceState>()((set, get) => {
  const save = (review: AnyReview) => {
    saveReview(get().storage, review)
    set({ current: review, entries: listReviews(get().storage) })
    return review
  }
  return {
    storage: initial?.storage ?? (undefined as unknown as Storage),
    persistent: initial?.persistent ?? false,
    entries: initial ? listReviews(initial.storage) : [],
    current: null,
    failedId: null,
    refresh: () => set({ entries: listReviews(get().storage) }),
    open: (id) => {
      const cur = get().current
      if (cur?.id === id) return cur
      const review = loadReview(get().storage, id)
      set({ current: review ?? null, failedId: review ? null : id })
      return review
    },
    // A new review is opened but not saved until something is entered, so starting a review and
    // leaving straight away does not leave an empty review behind.
    createProgramme: (partial) => {
      const r = newProgrammeReview(partial)
      set({ current: r, failedId: null })
      return r
    },
    createModule: (partial) => {
      const r = newModuleReview(partial)
      set({ current: r, failedId: null })
      return r
    },
    update: (fn) => {
      const cur = get().current
      if (!cur) return
      const next = produce(cur, (draft) => {
        fn(draft as Draft<never>)
        draft.updatedAt = new Date().toISOString()
      })
      save(next)
    },
    replace: (review) => save(review),
    remove: (id) => {
      deleteReview(get().storage, id)
      set({
        entries: listReviews(get().storage),
        current: get().current?.id === id ? null : get().current,
      })
    },
    useStorage: (storage, persistent = true) =>
      set({ storage, persistent, entries: listReviews(storage), current: null }),
  }
})

/** The open review, if it is of the given kind. */
export function useCurrent<K extends ReviewKind>(kind: K) {
  return useWorkspace((s) =>
    s.current?.kind === kind ? (s.current as Extract<AnyReview, { kind: K }>) : undefined,
  )
}
