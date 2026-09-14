import { Link, useNavigate } from 'react-router-dom'
import { useReviewStore } from '../../store/reviewStore'
import { moduleCompleteness } from '../../logic/completeness'
import { flagLevel } from '../../logic/flags'
import { Button, PageTitle, Section } from '../../components/fields'

export function ModulesPage() {
  const modules = useReviewStore((s) => s.review.modules)
  const addModule = useReviewStore((s) => s.addModule)
  const duplicateModule = useReviewStore((s) => s.duplicateModule)
  const removeModule = useReviewStore((s) => s.removeModule)
  const navigate = useNavigate()

  const sorted = [...modules].sort((a, b) => a.stage - b.stage || a.code.localeCompare(b.code))

  return (
    <>
      <PageTitle
        part="Part B – Module & Assessment Review"
        title="Modules"
        lede="Review each module and its assessments. The assessment ratings feed the programme portfolio (Part A) and the synthesis (Part C) automatically."
      />
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">
          {modules.length} module{modules.length === 1 ? '' : 's'}
        </p>
        <Button variant="primary" onClick={() => navigate(`/modules/${addModule()}`)}>
          + Add module
        </Button>
      </div>
      {sorted.length === 0 ? (
        <Section title="No modules yet">
          <p className="text-sm text-slate-600">
            Add the modules that make up the programme. You can review the most significant modules
            first and return to the others later.
          </p>
        </Section>
      ) : (
        <ul className="space-y-3">
          {sorted.map((m) => {
            const c = moduleCompleteness(m)
            const pct = c.total ? Math.round((100 * c.done) / c.total) : 0
            const priority = m.assessments.filter((a) => flagLevel(a) === 'priority').length
            return (
              <li key={m.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      to={`/modules/${m.id}`}
                      className="text-base font-semibold text-brand-700 hover:underline"
                    >
                      {m.code && <span className="mr-2 text-slate-500">{m.code}</span>}
                      {m.title || 'Untitled module'}
                    </Link>
                    <p className="text-sm text-slate-600">
                      Stage {m.stage}
                      {m.credits && ` · ${m.credits} credits`}
                      {m.leader && ` · ${m.leader}`}
                      {` · ${m.assessments.length} assessment${m.assessments.length === 1 ? '' : 's'}`}
                      {priority > 0 && (
                        <span className="ml-2 rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-800">
                          {priority} priority
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-28" title={`${c.done} of ${c.total} items`}>
                      <div className="h-2 rounded-full bg-slate-200">
                        <div
                          className="h-2 rounded-full bg-brand-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="mt-0.5 text-right text-[11px] text-slate-500">
                        {pct}% complete
                      </p>
                    </div>
                    <Button
                      onClick={() => navigate(`/modules/${duplicateModule(m.id)}`)}
                      title="Duplicate module"
                    >
                      Duplicate
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => {
                        if (
                          confirm(`Delete "${m.title || 'Untitled module'}" and its assessments?`)
                        )
                          removeModule(m.id)
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}
