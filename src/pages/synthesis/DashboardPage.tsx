import { Link } from 'react-router-dom'
import { SYNTHESIS } from '../../content/synthesis'
import { DASHBOARD_AREAS, QUALITY } from '../../content/scales'
import { useReview, useReviewStore } from '../../store/reviewStore'
import { suggestDashboard } from '../../logic/dashboard'
import { allAssessments, priorityAssessments } from '../../logic/flags'
import { Button, PageTitle, RatingScale, Section, TextArea } from '../../components/fields'

export function DashboardPage() {
  const review = useReview()
  const update = useReviewStore((s) => s.update)
  const suggested = suggestDashboard(review)
  const refs = allAssessments(review)
  const priority = priorityAssessments(review)

  return (
    <>
      <PageTitle
        part="Part C – Programme Synthesis"
        title="17. Bringing the Evidence Together"
        lede={SYNTHESIS.intro}
      />

      <div className="grid gap-3 sm:grid-cols-4">
        <Stat label="Modules" value={review.modules.length} to="/modules" />
        <Stat label="Assessments" value={refs.length} to="/programme/portfolio" />
        <Stat
          label="Rated for vulnerability & assurance"
          value={refs.filter((r) => r.assessment.vulnerability && r.assessment.assurance).length}
          to="/programme/portfolio"
        />
        <Stat
          label="Prioritised for review"
          value={priority.length}
          to="/programme/portfolio"
          tone={priority.length ? 'warn' : 'ok'}
        />
      </div>

      <Section
        title="Programme Dashboard"
        intro="Summarise each area. A rating is suggested from the review data; select a rating to override it, or click the selected rating to return to the suggestion."
      >
        <div className="divide-y divide-slate-100">
          {DASHBOARD_AREAS.map((area) => {
            const override = review.synthesis.dashboard[area.id] ?? ''
            const sug = suggested[area.id]
            return (
              <div key={area.id} className="grid gap-2 py-3 sm:grid-cols-[14rem_1fr]">
                <div>
                  <p className="font-medium text-slate-800">{area.label}</p>
                  <p className="text-xs text-slate-500">
                    {override ? 'Team override' : sug.value ? 'Suggested' : 'No suggestion yet'}:{' '}
                    {sug.reason}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <RatingScale
                    options={QUALITY}
                    value={override || sug.value}
                    onChange={(v) => update((r) => void (r.synthesis.dashboard[area.id] = v))}
                    compact
                  />
                  {override && (
                    <Button
                      variant="ghost"
                      onClick={() => update((r) => void (r.synthesis.dashboard[area.id] = ''))}
                    >
                      Use suggestion
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </Section>

      <Section
        title="Overall position"
        intro="Optional. A one-paragraph summary for the Final Programme Review Summary. If left blank, a summary is generated from the ratings."
      >
        <TextArea
          label="Overall position"
          value={review.synthesis.overallPosition}
          onChange={(overallPosition) =>
            update((r) => void (r.synthesis.overallPosition = overallPosition))
          }
          rows={4}
        />
      </Section>
    </>
  )
}

function Stat({
  label,
  value,
  to,
  tone = 'ok',
}: {
  label: string
  value: number
  to: string
  tone?: 'ok' | 'warn'
}) {
  return (
    <Link
      to={to}
      className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm hover:border-brand-400"
    >
      <p className={`text-2xl font-bold ${tone === 'warn' ? 'text-rose-700' : 'text-slate-900'}`}>
        {value}
      </p>
      <p className="text-xs text-slate-500">{label}</p>
    </Link>
  )
}
