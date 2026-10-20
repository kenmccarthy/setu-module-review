import { PROGRESSION_PHASES } from '../content/scales'

import { progressionKey } from '../logic/v2/progression'

/**
 * The I–P–E–D progression grid: one row per capability, one column per programme stage. Cells
 * listed in `unconfirmed` are outlined until the team confirms them.
 */
export function ProgressionMap({
  capabilities,
  stages,
  value,
  onToggle,
  unconfirmed = [],
}: {
  capabilities: readonly { id: string; label: string }[]
  stages: number
  value: Record<string, string[]>
  onToggle: (capabilityId: string, stage: number, phase: string) => void
  unconfirmed?: string[]
}) {
  const cols = Array.from({ length: stages }, (_, i) => i + 1)
  const pending = new Set(unconfirmed)
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[36rem] border-collapse text-sm">
        <caption className="sr-only">
          AI capability progression by stage. Each cell has four toggle buttons: Introduced,
          Practised, Extended and Demonstrated.
        </caption>
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
            <th scope="col" className="py-2 pr-3">
              Capability
            </th>
            {cols.map((s) => (
              <th key={s} scope="col" className="px-2 py-2 text-center">
                Stage {s}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {capabilities.map((cap) => (
            <tr key={cap.id} className="border-b border-slate-100">
              <th scope="row" className="py-2 pr-3 text-left font-medium text-slate-800">
                {cap.label}
              </th>
              {cols.map((s) => {
                const key = progressionKey(cap.id, s)
                const phases = value[key] ?? []
                const flagged = pending.has(key)
                return (
                  <td key={s} className="px-2 py-2">
                    <div
                      className={`flex justify-center gap-1 rounded p-0.5 ${flagged ? 'ring-2 ring-amber-400' : ''}`}
                      title={
                        flagged
                          ? 'Carried over from the previous version: please confirm'
                          : undefined
                      }
                    >
                      {PROGRESSION_PHASES.map((ph) => {
                        const on = phases.includes(ph.value)
                        return (
                          <button
                            key={ph.value}
                            type="button"
                            aria-pressed={on}
                            aria-label={`${cap.label}, stage ${s}: ${ph.label}`}
                            title={ph.label}
                            onClick={() => onToggle(cap.id, s, ph.value)}
                            className={`h-7 w-7 rounded border text-xs font-semibold transition ${
                              on
                                ? 'border-brand-700 bg-brand-600 text-white'
                                : 'border-slate-200 bg-white text-slate-400 hover:border-brand-400'
                            }`}
                          >
                            {ph.label.charAt(0)}
                          </button>
                        )
                      })}
                    </div>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
