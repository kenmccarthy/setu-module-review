import { useId } from 'react'
import type { ScaleOption } from '../../content/scales'
import { TONE_CLASSES, TONE_SELECTED } from './tone'

interface RatingScaleProps<T extends string> {
  label?: React.ReactNode
  hint?: React.ReactNode
  options: readonly ScaleOption<T>[]
  value: T | ''
  onChange: (v: T | '') => void
  /** Show option descriptions under the pills. */
  showDescriptions?: boolean
  /** Compact single-row layout for tables. */
  compact?: boolean
}

/** Radio-group rendered as colour-coded pills. Click the selected pill again to clear. */
export function RatingScale<T extends string>({
  label,
  hint,
  options,
  value,
  onChange,
  showDescriptions,
  compact,
}: RatingScaleProps<T>) {
  const name = useId()
  return (
    <fieldset className={compact ? '' : 'space-y-2'}>
      {label && <legend className="text-sm font-medium text-slate-800">{label}</legend>}
      {hint && <p className="text-sm text-slate-500">{hint}</p>}
      <div className={`flex flex-wrap ${compact ? 'gap-1' : 'gap-2'}`} role="radiogroup">
        {options.map((o) => {
          const selected = o.value === value
          return (
            <label
              key={o.value}
              className={`cursor-pointer select-none rounded-full border font-medium transition ${
                compact ? 'px-2 py-0.5 text-xs' : 'px-3 py-1.5 text-sm'
              } ${selected ? TONE_SELECTED[o.tone] : `${TONE_CLASSES[o.tone]} opacity-80 hover:opacity-100`}`}
              title={o.description}
            >
              <input
                type="radio"
                name={name}
                value={o.value}
                checked={selected}
                className="sr-only"
                onChange={() => onChange(o.value)}
                onClick={() => {
                  if (selected) onChange('')
                }}
              />
              {o.label}
            </label>
          )
        })}
      </div>
      {showDescriptions && (
        <dl className="grid gap-1 text-sm text-slate-600 sm:grid-cols-2">
          {options
            .filter((o) => o.description)
            .map((o) => (
              <div key={o.value} className="flex gap-2">
                <dt className="shrink-0 font-medium text-slate-800">{o.label}:</dt>
                <dd>{o.description}</dd>
              </div>
            ))}
        </dl>
      )}
    </fieldset>
  )
}
