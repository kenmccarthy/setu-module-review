import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type {
  Action,
  Assessment,
  Module,
  Programme,
  Review,
  Statement,
  Synthesis,
} from '../model/schema'
import { cloneModule, newAction, newAssessment, newModule, newReview } from '../model/defaults'

export interface ReviewState {
  review: Review
  /** Whether a review has been started (vs. an untouched empty one). */
  started: boolean
  start: () => void
  load: (review: Review) => void
  reset: () => void
  /** Generic mutation helper – runs inside immer. */
  update: (fn: (review: Review) => void) => void
  updateProgramme: (patch: Partial<Programme>) => void
  updateSynthesis: (patch: Partial<Synthesis>) => void
  updateStatement: (patch: Partial<Statement>) => void
  addModule: () => string
  duplicateModule: (id: string) => string
  removeModule: (id: string) => void
  updateModule: (id: string, patch: Partial<Module>) => void
  addAssessment: (moduleId: string) => string
  removeAssessment: (moduleId: string, id: string) => void
  updateAssessment: (moduleId: string, id: string, patch: Partial<Assessment>) => void
  addAction: (partial?: Partial<Action>) => string
  updateAction: (id: string, patch: Partial<Action>) => void
  removeAction: (id: string) => void
}

const touch = (r: Review) => {
  r.updatedAt = new Date().toISOString()
}

export const useReviewStore = create<ReviewState>()(
  persist(
    immer((set) => ({
      review: newReview(),
      started: false,
      start: () => set({ review: newReview(), started: true }),
      load: (review) => set({ review, started: true }),
      reset: () => set({ review: newReview(), started: false }),
      update: (fn) =>
        set((s) => {
          fn(s.review)
          touch(s.review)
        }),
      updateProgramme: (patch) =>
        set((s) => {
          Object.assign(s.review.programme, patch)
          touch(s.review)
        }),
      updateSynthesis: (patch) =>
        set((s) => {
          Object.assign(s.review.synthesis, patch)
          touch(s.review)
        }),
      updateStatement: (patch) =>
        set((s) => {
          Object.assign(s.review.statement, patch)
          touch(s.review)
        }),
      addModule: () => {
        const m = newModule()
        set((s) => {
          s.review.modules.push(m)
          touch(s.review)
        })
        return m.id
      },
      duplicateModule: (id) => {
        let newId = ''
        set((s) => {
          const idx = s.review.modules.findIndex((m) => m.id === id)
          if (idx < 0) return
          const copy = cloneModule(s.review.modules[idx])
          newId = copy.id
          s.review.modules.splice(idx + 1, 0, copy)
          touch(s.review)
        })
        return newId
      },
      removeModule: (id) =>
        set((s) => {
          s.review.modules = s.review.modules.filter((m) => m.id !== id)
          s.review.synthesis.actions = s.review.synthesis.actions.filter((a) => a.moduleId !== id)
          touch(s.review)
        }),
      updateModule: (id, patch) =>
        set((s) => {
          const m = s.review.modules.find((x) => x.id === id)
          if (m) Object.assign(m, patch)
          touch(s.review)
        }),
      addAssessment: (moduleId) => {
        const a = newAssessment()
        set((s) => {
          s.review.modules.find((m) => m.id === moduleId)?.assessments.push(a)
          touch(s.review)
        })
        return a.id
      },
      removeAssessment: (moduleId, id) =>
        set((s) => {
          const m = s.review.modules.find((x) => x.id === moduleId)
          if (m) m.assessments = m.assessments.filter((a) => a.id !== id)
          touch(s.review)
        }),
      updateAssessment: (moduleId, id, patch) =>
        set((s) => {
          const a = s.review.modules
            .find((m) => m.id === moduleId)
            ?.assessments.find((x) => x.id === id)
          if (a) Object.assign(a, patch)
          touch(s.review)
        }),
      addAction: (partial) => {
        const a = newAction(partial)
        set((s) => {
          s.review.synthesis.actions.push(a)
          touch(s.review)
        })
        return a.id
      },
      updateAction: (id, patch) =>
        set((s) => {
          const a = s.review.synthesis.actions.find((x) => x.id === id)
          if (a) Object.assign(a, patch)
          touch(s.review)
        }),
      removeAction: (id) =>
        set((s) => {
          s.review.synthesis.actions = s.review.synthesis.actions.filter((a) => a.id !== id)
          touch(s.review)
        }),
    })),
    {
      name: 'setu-ai-review',
      version: 1,
      partialize: (s) => ({ review: s.review, started: s.started }),
    },
  ),
)

export const useReview = () => useReviewStore((s) => s.review)
export const useModule = (id: string | undefined) =>
  useReviewStore((s) => s.review.modules.find((m) => m.id === id))
