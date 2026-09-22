import { useState } from 'react'
import { SYNTHESIS } from '../../content/synthesis'
import { ACTION_CATEGORIES, ACTION_PRIORITIES, type ActionCategory } from '../../content/scales'
import { useReview, useReviewStore } from '../../store/reviewStore'
import { Button, PageTitle, Section, inputClass } from '../../components/fields'

export function ActionsPage() {
  const review = useReview()
  const addAction = useReviewStore((s) => s.addAction)
  const updateAction = useReviewStore((s) => s.updateAction)
  const removeAction = useReviewStore((s) => s.removeAction)
  const [filter, setFilter] = useState<ActionCategory | ''>('')

  const actions = review.synthesis.actions.filter((a) => !filter || a.category === filter)

  return (
    <>
      <PageTitle
        part="Part C – Programme Synthesis"
        title="20. Action Plan"
        lede={SYNTHESIS.actionIntro}
      />

      <Section title="Action categories">
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          {ACTION_CATEGORIES.map((c) => (
            <div key={c.value} className="flex gap-2">
              <dt className="w-20 shrink-0 font-semibold text-slate-800">{c.label}</dt>
              <dd className="text-slate-600">{c.description}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section
        title="Actions"
        intro="For each item record the action, programme/module, priority, responsible person/team, timescale and review point."
      >
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-sm text-slate-600">
            Filter:{' '}
            <select
              className="rounded-md border border-slate-300 px-2 py-1 text-sm"
              value={filter}
              onChange={(e) => setFilter(e.target.value as ActionCategory | '')}
            >
              <option value="">All categories</option>
              {ACTION_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
          <span className="flex-1" />
          <Button variant="primary" onClick={() => addAction({ category: filter || '' })}>
            + Add action
          </Button>
        </div>

        {actions.length === 0 ? (
          <p className="text-sm text-slate-500">
            No actions{filter ? ' in this category' : ''} yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[64rem] border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="py-2 pr-2">Category</th>
                  <th className="py-2 pr-2 w-[26%]">Action</th>
                  <th className="py-2 pr-2">Programme/Module</th>
                  <th className="py-2 pr-2">Priority</th>
                  <th className="py-2 pr-2">Responsible</th>
                  <th className="py-2 pr-2">Timescale</th>
                  <th className="py-2 pr-2">Review point</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {actions.map((a) => (
                  <tr key={a.id} className="border-b border-slate-100 align-top">
                    <td className="py-2 pr-2">
                      <select
                        className={inputClass}
                        value={a.category}
                        onChange={(e) =>
                          updateAction(a.id, { category: e.target.value as ActionCategory | '' })
                        }
                        aria-label="Category"
                      >
                        <option value="">—</option>
                        {ACTION_CATEGORIES.map((c) => (
                          <option key={c.value} value={c.value}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 pr-2">
                      <textarea
                        className={`${inputClass} min-h-[2.5rem]`}
                        rows={2}
                        value={a.text}
                        onChange={(e) => updateAction(a.id, { text: e.target.value })}
                        aria-label="Action"
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <select
                        className={inputClass}
                        value={a.scope === 'programme' ? 'programme' : a.moduleId}
                        onChange={(e) => {
                          const v = e.target.value
                          if (v === 'programme')
                            updateAction(a.id, { scope: 'programme', moduleId: '' })
                          else updateAction(a.id, { scope: 'module', moduleId: v })
                        }}
                        aria-label="Programme or module"
                      >
                        <option value="programme">Programme</option>
                        {review.modules.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.code || m.title || 'Untitled module'}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 pr-2">
                      <select
                        className={inputClass}
                        value={a.priority}
                        onChange={(e) =>
                          updateAction(a.id, { priority: e.target.value as typeof a.priority })
                        }
                        aria-label="Priority"
                      >
                        <option value="">—</option>
                        {ACTION_PRIORITIES.map((p) => (
                          <option key={p.value} value={p.value}>
                            {p.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        className={inputClass}
                        value={a.owner}
                        onChange={(e) => updateAction(a.id, { owner: e.target.value })}
                        aria-label="Responsible person/team"
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        className={inputClass}
                        value={a.timescale}
                        onChange={(e) => updateAction(a.id, { timescale: e.target.value })}
                        aria-label="Timescale"
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        className={inputClass}
                        value={a.reviewPoint}
                        onChange={(e) => updateAction(a.id, { reviewPoint: e.target.value })}
                        aria-label="Review point"
                      />
                    </td>
                    <td className="py-2">
                      <Button
                        variant="ghost"
                        title="Remove action"
                        onClick={() => {
                          if (confirm('Remove this action?')) removeAction(a.id)
                        }}
                      >
                        ×
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>
    </>
  )
}
