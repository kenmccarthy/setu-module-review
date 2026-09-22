import { Link } from 'react-router-dom'
import { ASSURANCE_SECTION, PORTFOLIO, VULNERABILITY_SECTION } from '../../content/programme'
import { AI_POSITIONS, ASSURANCE, VULNERABILITY, optionLabel } from '../../content/scales'
import { ASSURANCE_EVIDENCE } from '../../content/capabilities'
import { useReview } from '../../store/reviewStore'
import { portfolioRows } from '../../logic/portfolio'
import { assessmentLabel, vulnerabilityAssuranceGrid } from '../../logic/flags'
import { Callout, EmptyPill, KeyQuestion, PageTitle, Pill, Section } from '../../components/fields'

export function PortfolioPage() {
  const review = useReview()
  const rows = portfolioRows(review)
  const grid = vulnerabilityAssuranceGrid(review)
  return (
    <>
      <PageTitle
        helpAnchor="priority-rule"
        part="Part A – Programme Review"
        title="4. Programme Assessment Portfolio"
        lede={PORTFOLIO.purpose}
      />

      <Section
        title="Assessment map"
        intro={
          <>
            {PORTFOLIO.instruction} This table is built from the assessments you enter in{' '}
            <Link className="text-brand-700 underline" to="/modules">
              Part B
            </Link>
            ; click a row to edit it.
          </>
        }
      >
        {rows.length === 0 ? (
          <p className="text-sm text-slate-500">
            No assessments yet.{' '}
            <Link className="text-brand-700 underline" to="/modules">
              Add modules and assessments
            </Link>{' '}
            to populate the portfolio.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[60rem] border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="py-2 pr-2">Stage</th>
                  <th className="py-2 pr-2">Sem</th>
                  <th className="py-2 pr-2">Module</th>
                  <th className="py-2 pr-2">Assessment</th>
                  <th className="py-2 pr-2">Weight</th>
                  <th className="py-2 pr-2">Type</th>
                  <th className="py-2 pr-2">AI position</th>
                  <th className="py-2 pr-2">Vulnerability</th>
                  <th className="py-2 pr-2">Assurance</th>
                  <th className="py-2 pr-2">Protected capability</th>
                  <th className="py-2 pr-2">AI capability developed</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr
                    key={r.assessmentId}
                    className={`border-b border-slate-100 align-top ${r.flag === 'priority' ? 'bg-rose-50' : r.flag === 'watch' ? 'bg-amber-50' : ''}`}
                  >
                    <td className="py-2 pr-2">{r.stage}</td>
                    <td className="py-2 pr-2">{r.semester}</td>
                    <td className="py-2 pr-2">{r.moduleLabel}</td>
                    <td className="py-2 pr-2">
                      <Link
                        className="font-medium text-brand-700 hover:underline"
                        to={`/modules/${r.moduleId}/assessments/${r.assessmentId}`}
                      >
                        {r.assessmentTitle}
                      </Link>
                      {r.flag === 'priority' && (
                        <span className="ml-1 text-xs font-semibold text-rose-700">Priority</span>
                      )}
                    </td>
                    <td className="py-2 pr-2">{r.weighting && `${r.weighting}%`}</td>
                    <td className="py-2 pr-2">{r.type}</td>
                    <td className="py-2 pr-2">
                      {r.position ? (
                        optionLabel(AI_POSITIONS, r.position as never)
                      ) : (
                        <EmptyPill>—</EmptyPill>
                      )}
                    </td>
                    <td className="py-2 pr-2">
                      <ScalePill options={VULNERABILITY} value={r.vulnerability} />
                    </td>
                    <td className="py-2 pr-2">
                      <ScalePill options={ASSURANCE} value={r.assurance} />
                    </td>
                    <td className="py-2 pr-2">{r.protectedCapability}</td>
                    <td className="py-2 pr-2">{r.aiCapabilityDeveloped}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      <Section title="AI Position" intro={PORTFOLIO.aiPositionIntro}>
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          {AI_POSITIONS.map((o) => (
            <div key={o.value} className="rounded-md border border-slate-200 p-3">
              <dt className="font-semibold text-slate-800">{o.label}</dt>
              <dd className="text-slate-600">{o.description}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section number={5} title="AI Vulnerability">
        <KeyQuestion>{VULNERABILITY_SECTION.keyQuestion}</KeyQuestion>
        <p className="text-sm text-slate-600">Rate each assessment (in Part B):</p>
        <dl className="space-y-1 text-sm">
          {VULNERABILITY.map((o) => (
            <div key={o.value} className="flex gap-2">
              <dt className="w-24 shrink-0">
                <Pill tone={o.tone}>{o.label}</Pill>
              </dt>
              <dd className="text-slate-700">{o.description}</dd>
            </div>
          ))}
        </dl>
        <Callout title="Important">
          {VULNERABILITY_SECTION.important.map((t) => (
            <p key={t}>{t}</p>
          ))}
        </Callout>
      </Section>

      <Section number={6} title="Learning Assurance">
        <KeyQuestion>{ASSURANCE_SECTION.keyQuestion}</KeyQuestion>
        <p className="text-sm text-slate-600">Consider:</p>
        <ul className="grid list-disc gap-0.5 pl-6 text-sm text-slate-700 sm:grid-cols-2">
          {ASSURANCE_EVIDENCE.map((e, i) => (
            <li key={e.id}>
              {e.label.toLowerCase()}
              {i === ASSURANCE_EVIDENCE.length - 1 ? '.' : ';'}
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-2">
          {ASSURANCE.map((o) => (
            <Pill key={o.value} tone={o.tone}>
              {o.label}
            </Pill>
          ))}
        </div>

        <h3 className="pt-2 font-semibold text-slate-900">Vulnerability × Assurance Check</h3>
        <div className="space-y-1 text-sm text-slate-700">
          {ASSURANCE_SECTION.check.map((t) => (
            <p key={t}>{t}</p>
          ))}
        </div>
        <Callout title="Prioritise for review" tone="warn">
          <p>{ASSURANCE_SECTION.priorityRule}</p>
        </Callout>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[32rem] border-collapse text-sm">
            <thead>
              <tr>
                <th className="py-2 pr-2 text-left text-xs uppercase tracking-wide text-slate-500">
                  Vulnerability ↓ / Assurance →
                </th>
                {ASSURANCE.map((a) => (
                  <th key={a.value} className="px-2 py-2 text-center">
                    <Pill tone={a.tone}>{a.label}</Pill>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {VULNERABILITY.map((v) => (
                <tr key={v.value} className="border-t border-slate-100">
                  <th className="py-2 pr-2 text-left">
                    <Pill tone={v.tone}>{v.label}</Pill>
                  </th>
                  {ASSURANCE.map((a) => {
                    const refs = grid[v.value][a.value]
                    const priority =
                      (v.value === 'high' || v.value === 'critical') && a.value === 'low'
                    return (
                      <td
                        key={a.value}
                        className={`px-2 py-2 align-top ${priority ? 'bg-rose-50' : ''}`}
                      >
                        <p
                          className={`text-center text-lg font-semibold ${priority && refs.length ? 'text-rose-700' : 'text-slate-800'}`}
                        >
                          {refs.length}
                        </p>
                        <ul className="space-y-0.5 text-xs">
                          {refs.map((ref) => (
                            <li key={ref.assessment.id}>
                              <Link
                                className="text-brand-700 hover:underline"
                                to={`/modules/${ref.module.id}/assessments/${ref.assessment.id}`}
                              >
                                {assessmentLabel(ref)}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </>
  )
}

function ScalePill({
  options,
  value,
}: {
  options: readonly { value: string; label: string; tone: number }[]
  value: string
}) {
  const o = options.find((x) => x.value === value)
  return o ? <Pill tone={o.tone}>{o.label}</Pill> : <EmptyPill>—</EmptyPill>
}
