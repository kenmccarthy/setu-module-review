interface CheckListProps {
  label?: React.ReactNode
  hint?: React.ReactNode
  options: readonly { id: string; label: string }[]
  value: string[]
  onChange: (v: string[]) => void
  columns?: 1 | 2 | 3
}

export function CheckList({ label, hint, options, value, onChange, columns = 2 }: CheckListProps) {
  const toggle = (id: string) =>
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id])
  const cols = { 1: '', 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-2 lg:grid-cols-3' }[columns]
  return (
    <fieldset className="space-y-2">
      {label && <legend className="text-sm font-medium text-slate-800">{label}</legend>}
      {hint && <p className="text-sm text-slate-500">{hint}</p>}
      <div className={`grid gap-1.5 ${cols}`}>
        {options.map((o) => (
          <label
            key={o.id}
            className="flex cursor-pointer items-start gap-2 text-sm text-slate-700"
          >
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              checked={value.includes(o.id)}
              onChange={() => toggle(o.id)}
            />
            <span>{o.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
