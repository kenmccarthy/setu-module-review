import { Disclosure } from '../../components/fields'
import type { LegacyItem } from '../../logic/v2/legacy'

/** Read-only answers from the previous version that have no matching question here. */
export function LegacyPanel({ items }: { items: LegacyItem[] | undefined }) {
  if (!items?.length) return null
  return (
    <Disclosure summary="From your review in the previous version (read only)">
      <p className="text-slate-600">
        These answers were recorded in the previous version of the tool. They have no direct
        equivalent here, so they are kept for reference rather than copied into the questions above.
      </p>
      <dl className="space-y-2">
        {items.map((i) => (
          <div key={i.label + i.value}>
            <dt className="font-medium text-slate-800">{i.label}</dt>
            <dd className="whitespace-pre-line text-slate-700">{i.value}</dd>
          </div>
        ))}
      </dl>
    </Disclosure>
  )
}
