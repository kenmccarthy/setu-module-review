import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/fields'
import { reviewPath } from '../../components/layout/nav'
import { reviewTitle } from '../../components/layout/labels'
import { readFileText } from '../../store/io'
import { parseImport } from '../../store/importV2'
import { importIntoLibrary } from '../../store/library'
import { useWorkspace } from '../../store/workspace'

/**
 * Imports a review file into the saved reviews without overwriting anything unless the user
 * chooses to replace a saved copy of the same review.
 */
export function ImportButton({
  onMessage,
  label = 'Import existing review',
}: {
  onMessage: (message: string, tone: 'ok' | 'error') => void
  label?: string
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const storage = useWorkspace((s) => s.storage)
  const refresh = useWorkspace((s) => s.refresh)
  const navigate = useNavigate()

  const onFile = async (file: File | undefined) => {
    if (!file) return
    let text: string
    try {
      text = await readFileText(file)
    } catch {
      onMessage('The file could not be read.', 'error')
      return
    }
    const result = importIntoLibrary(storage, parseImport(text), (existing, incoming) =>
      confirm(
        `“${reviewTitle(incoming)}” is already saved in this browser (last changed ${new Date(existing.updatedAt).toLocaleString()}).\n\nOK: replace the saved copy with the file.\nCancel: keep both.`,
      )
        ? 'replace'
        : 'keep-both',
    )
    if (!result.ok) {
      onMessage(result.error, 'error')
      return
    }
    refresh()
    onMessage(result.message, 'ok')
    const [first] = result.saved
    if (first && result.saved.length === 1) navigate(reviewPath(first.kind, first.id))
  }

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
        onChange={(e) => {
          void onFile(e.target.files?.[0])
          e.target.value = ''
        }}
      />
      <Button onClick={() => fileRef.current?.click()}>{label}</Button>
    </>
  )
}
