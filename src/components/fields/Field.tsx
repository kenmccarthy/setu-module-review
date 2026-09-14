import { useId } from 'react'

interface FieldProps {
  label: React.ReactNode
  hint?: React.ReactNode
  children: (id: string) => React.ReactNode
  className?: string
}

/** Label + optional hint wrapper; passes a generated id to the control. */
export function Field({ label, hint, children, className = '' }: FieldProps) {
  const id = useId()
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label htmlFor={id} className="block text-sm font-medium text-slate-800">
        {label}
      </label>
      {hint && <p className="text-sm text-slate-500">{hint}</p>}
      {children(id)}
    </div>
  )
}

import { inputClass } from './styles'

export function TextInput({
  label,
  hint,
  value,
  onChange,
  placeholder,
  type = 'text',
  className,
}: {
  label: React.ReactNode
  hint?: React.ReactNode
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: 'text' | 'date' | 'number'
  className?: string
}) {
  return (
    <Field label={label} hint={hint} className={className}>
      {(id) => (
        <input
          id={id}
          type={type}
          className={inputClass}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </Field>
  )
}

export function TextArea({
  label,
  hint,
  value,
  onChange,
  placeholder,
  rows = 4,
  className,
}: {
  label: React.ReactNode
  hint?: React.ReactNode
  value: string
  onChange: (v: string) => void
  placeholder?: string
  rows?: number
  className?: string
}) {
  return (
    <Field label={label} hint={hint} className={className}>
      {(id) => (
        <textarea
          id={id}
          rows={rows}
          className={`${inputClass} min-h-[5rem] resize-y leading-relaxed`}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </Field>
  )
}

export function SelectInput<T extends string>({
  label,
  hint,
  value,
  onChange,
  options,
  placeholder = 'Select…',
  className,
}: {
  label: React.ReactNode
  hint?: React.ReactNode
  value: T | ''
  onChange: (v: T | '') => void
  options: readonly { value: T; label: string }[]
  placeholder?: string
  className?: string
}) {
  return (
    <Field label={label} hint={hint} className={className}>
      {(id) => (
        <select
          id={id}
          className={inputClass}
          value={value}
          onChange={(e) => onChange(e.target.value as T | '')}
        >
          <option value="">{placeholder}</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )}
    </Field>
  )
}

export function NumberInput({
  label,
  hint,
  value,
  onChange,
  min,
  max,
  className,
}: {
  label: React.ReactNode
  hint?: React.ReactNode
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  className?: string
}) {
  return (
    <Field label={label} hint={hint} className={className}>
      {(id) => (
        <input
          id={id}
          type="number"
          min={min}
          max={max}
          className={inputClass}
          value={value}
          onChange={(e) => {
            const n = Number(e.target.value)
            if (!Number.isNaN(n)) onChange(n)
          }}
        />
      )}
    </Field>
  )
}
