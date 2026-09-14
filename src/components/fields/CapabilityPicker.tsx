import { useState } from 'react'
import type { Capability } from '../../model/schema'
import type { CapabilityPreset } from '../../content/capabilities'
import { inputClass } from './styles'

interface CapabilityPickerProps {
  label?: React.ReactNode
  hint?: React.ReactNode
  presets: readonly CapabilityPreset[]
  value: Capability[]
  onChange: (v: Capability[]) => void
  addLabel?: string
}

/** Toggle chips from a preset list, plus "add your own". */
export function CapabilityPicker({
  label,
  hint,
  presets,
  value,
  onChange,
  addLabel = 'Add your own',
}: CapabilityPickerProps) {
  const [draft, setDraft] = useState('')
  const selectedIds = new Set(value.map((v) => v.id))
  const toggle = (p: CapabilityPreset) => {
    if (selectedIds.has(p.id)) onChange(value.filter((v) => v.id !== p.id))
    else onChange([...value, { id: p.id, label: p.label, custom: false }])
  }
  const addCustom = () => {
    const label = draft.trim()
    if (!label) return
    const id = `custom:${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString(36)}`
    onChange([...value, { id, label, custom: true }])
    setDraft('')
  }
  const customs = value.filter((v) => v.custom)
  return (
    <fieldset className="space-y-2">
      {label && <legend className="text-sm font-medium text-slate-800">{label}</legend>}
      {hint && <p className="text-sm text-slate-500">{hint}</p>}
      <div className="flex flex-wrap gap-2">
        {presets.map((p) => {
          const on = selectedIds.has(p.id)
          return (
            <button
              key={p.id}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(p)}
              className={`rounded-full border px-3 py-1 text-sm transition ${
                on
                  ? 'border-brand-700 bg-brand-600 text-white'
                  : 'border-slate-300 bg-white text-slate-700 hover:border-brand-500 hover:text-brand-700'
              }`}
            >
              {p.label}
            </button>
          )
        })}
        {customs.map((c) => (
          <span
            key={c.id}
            className="inline-flex items-center gap-1 rounded-full border border-brand-700 bg-brand-600 px-3 py-1 text-sm text-white"
          >
            {c.label}
            <button
              type="button"
              aria-label={`Remove ${c.label}`}
              className="ml-1 rounded-full px-1 leading-none hover:bg-brand-700"
              onClick={() => onChange(value.filter((v) => v.id !== c.id))}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="flex max-w-md gap-2">
        <input
          className={inputClass}
          placeholder={addLabel}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addCustom()
            }
          }}
        />
        <button
          type="button"
          onClick={addCustom}
          className="shrink-0 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Add
        </button>
      </div>
    </fieldset>
  )
}
