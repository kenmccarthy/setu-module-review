import type { AnyReview } from '../model/v2/schema'

export function slug(text: string, fallback: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || fallback
  )
}

const today = () => new Date().toISOString().slice(0, 10)

/** e.g. "programme-review-bsc-business-2026-10-20.json" */
export function reviewFileName(review: AnyReview, what = `${review.kind}-review`): string {
  const name = review.kind === 'module' ? [review.code, review.title].join(' ') : review.title
  return `${what}-${slug(name, review.kind)}-${today()}.json`
}

export const libraryFileName = () => `ai-integration-reviews-${today()}.json`

export function downloadText(fileName: string, text: string, type = 'application/json'): void {
  const blob = new Blob([text], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export const downloadJson = (fileName: string, data: unknown) =>
  downloadText(fileName, JSON.stringify(data, null, 2))
