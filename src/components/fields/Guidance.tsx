import { useState } from 'react'

/** Collapsible "Consider:" list from the specification. */
export function Consider({
  title = 'Consider',
  items,
  open = false,
}: {
  title?: string
  items: readonly string[]
  open?: boolean
}) {
  const [isOpen, setOpen] = useState(open)
  if (items.length === 0) return null
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 text-sm">
      <button
        type="button"
        className="flex w-full items-center justify-between px-3 py-2 text-left font-medium text-slate-700"
        onClick={() => setOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span>{title}</span>
        <span className="text-slate-400">{isOpen ? '−' : '+'}</span>
      </button>
      {isOpen && (
        <ul className="list-disc space-y-0.5 px-3 pb-3 pl-8 text-slate-600">
          {items.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function Callout({
  title = 'Important',
  children,
  tone = 'info',
}: {
  title?: string
  children: React.ReactNode
  tone?: 'info' | 'warn' | 'note'
}) {
  const cls = {
    info: 'border-brand-200 bg-brand-50 text-brand-900',
    warn: 'border-amber-300 bg-amber-50 text-amber-900',
    note: 'border-sky-300 bg-sky-50 text-sky-900',
  }[tone]
  return (
    <div className={`rounded-md border px-4 py-3 text-sm ${cls}`}>
      <p className="mb-1 font-semibold">{title}</p>
      <div className="space-y-1">{children}</div>
    </div>
  )
}

export function KeyQuestion({ children }: { children: React.ReactNode }) {
  return (
    <p className="border-l-4 border-brand-500 pl-3 text-base font-medium text-slate-800">
      {children}
    </p>
  )
}
