import { TONE_CLASSES } from './tone'

export function Pill({ tone = 1, children }: { tone?: number; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${TONE_CLASSES[tone]}`}
    >
      {children}
    </span>
  )
}

export function EmptyPill({ children = 'Not rated' }: { children?: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-dashed border-slate-300 px-2 py-0.5 text-xs text-slate-500">
      {children}
    </span>
  )
}
