import { newListItem } from '../../model/v2/defaults'
import type { ListItem } from '../../model/v2/schema'
import { inputClass } from './styles'

/** An editable list of short entries (priorities, next steps, questions), optionally capped. */
export function ListEditor({
  label,
  hint,
  value,
  onChange,
  max,
  addLabel = 'Add',
  itemLabel = 'Item',
}: {
  label: React.ReactNode
  hint?: React.ReactNode
  value: ListItem[]
  onChange: (v: ListItem[]) => void
  max?: number
  addLabel?: string
  itemLabel?: string
}) {
  const full = max !== undefined && value.length >= max
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium text-slate-800">{label}</legend>
      {hint && <p className="text-sm text-slate-500">{hint}</p>}
      <ol className="space-y-2">
        {value.map((item, i) => (
          <li key={item.id} className="flex items-start gap-2">
            <span className="mt-2 w-5 shrink-0 text-sm text-slate-400" aria-hidden="true">
              {i + 1}.
            </span>
            <textarea
              aria-label={`${itemLabel} ${i + 1}`}
              rows={2}
              className={`${inputClass} resize-y`}
              value={item.text}
              onChange={(e) =>
                onChange(value.map((v) => (v.id === item.id ? { ...v, text: e.target.value } : v)))
              }
            />
            <button
              type="button"
              aria-label={`Remove ${itemLabel.toLowerCase()} ${i + 1}`}
              className="mt-1 rounded-md px-2 py-1 text-sm text-slate-500 hover:bg-slate-100 hover:text-rose-700"
              onClick={() => onChange(value.filter((v) => v.id !== item.id))}
            >
              Remove
            </button>
          </li>
        ))}
      </ol>
      {full ? (
        <p className="text-xs text-slate-500">Up to {max} can be recorded.</p>
      ) : (
        <button
          type="button"
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          onClick={() => onChange([...value, newListItem()])}
        >
          + {addLabel}
        </button>
      )}
    </fieldset>
  )
}
