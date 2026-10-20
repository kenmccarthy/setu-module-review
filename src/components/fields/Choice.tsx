import { useId } from 'react'

/**
 * A single-choice question shown as a list of radio buttons. Options are neutral reflective
 * responses, so they are not colour-coded. The answer can be cleared.
 */
export function Choice<T extends string>({
  label,
  hint,
  options,
  value,
  onChange,
}: {
  label: React.ReactNode
  hint?: React.ReactNode
  options: readonly { value: T; label: string; description?: string }[]
  value: T | ''
  onChange: (v: T | '') => void
}) {
  const name = useId()
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium text-slate-800">{label}</legend>
      {hint && <p className="text-sm text-slate-500">{hint}</p>}
      <div className="space-y-1.5">
        {options.map((o) => (
          <label
            key={o.value}
            className={`flex cursor-pointer items-start gap-3 rounded-md border px-3 py-2 text-sm transition ${
              o.value === value
                ? 'border-brand-500 bg-brand-50 text-brand-900'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
            }`}
          >
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={o.value === value}
              onChange={() => onChange(o.value)}
              className="mt-0.5 h-4 w-4 accent-brand-600"
            />
            <span>
              <span className="font-medium">{o.label}</span>
              {o.description && <span className="block text-slate-600">{o.description}</span>}
            </span>
          </label>
        ))}
      </div>
      {value && (
        <button
          type="button"
          className="text-xs text-slate-500 underline hover:text-slate-700"
          onClick={() => onChange('')}
        >
          Clear answer
        </button>
      )}
    </fieldset>
  )
}

/** Native disclosure for optional guidance and advanced detail. */
export function Disclosure({
  summary,
  children,
  open,
}: {
  summary: React.ReactNode
  children: React.ReactNode
  open?: boolean
}) {
  return (
    <details open={open} className="group rounded-md border border-slate-200 bg-slate-50 text-sm">
      <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-2 font-medium text-slate-700">
        <span>{summary}</span>
        <span aria-hidden="true" className="text-slate-400 group-open:hidden">
          +
        </span>
        <span aria-hidden="true" className="hidden text-slate-400 group-open:inline">
          −
        </span>
      </summary>
      <div className="space-y-3 border-t border-slate-200 bg-white px-3 py-3">{children}</div>
    </details>
  )
}
