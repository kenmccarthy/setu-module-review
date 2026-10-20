import { useRef } from 'react'
import { readFileText } from '../../store/io'
import { Button } from './Section'

/** A button that opens a JSON file and passes its text on (or an error message). */
export function FilePicker({
  label,
  onText,
  onError,
  variant,
}: {
  label: string
  onText: (text: string) => void
  onError: (message: string) => void
  variant?: 'primary' | 'secondary'
}) {
  const ref = useRef<HTMLInputElement>(null)
  return (
    <>
      <input
        ref={ref}
        type="file"
        accept="application/json,.json"
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
        onChange={(e) => {
          const file = e.target.files?.[0]
          e.target.value = ''
          if (!file) return
          readFileText(file).then(onText, () => onError('The file could not be read.'))
        }}
      />
      <Button variant={variant} onClick={() => ref.current?.click()}>
        {label}
      </Button>
    </>
  )
}
