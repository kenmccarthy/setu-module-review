import type { AnyReview } from '../../model/v2/schema'

export const reviewTitle = (r: AnyReview) =>
  r.kind === 'module'
    ? [r.code, r.title].filter(Boolean).join(' ') || 'Untitled module'
    : r.title || 'Untitled programme'

export const kindLabel = (kind: AnyReview['kind']) =>
  kind === 'programme' ? 'Programme review' : 'Module review'
