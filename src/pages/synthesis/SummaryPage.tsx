import { Link } from 'react-router-dom'
import { SYNTHESIS } from '../../content/synthesis'
import { useReview } from '../../store/reviewStore'
import { generateSummary, type SummaryItem } from '../../logic/summary'
import { Button, PageTitle, Section } from '../../components/fields'

export function SummaryPage() {
  const review = useReview()
  const s = generateSummary(review)
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <PageTitle
          part="Part C – Programme Synthesis"
          title="Final Programme Review Summary"
          lede={SYNTHESIS.summaryIntro}
        />
        <Link to="/print">
          <Button>Print / PDF</Button>
        </Link>
      </div>
      <Section
        title="Programme AI Review Summary"
        intro="Generated from the review. Edit the underlying sections to change it; the overall position can be written on the Dashboard page."
      >
        <SummaryBlock title="Overall position">
          <p className="text-sm text-slate-700">{s.overallPosition}</p>
        </SummaryBlock>
        <SummaryList title="Key strengths" items={s.keyStrengths} />
        <SummaryList title="Priority vulnerabilities" items={s.priorityVulnerabilities} />
        <SummaryList
          title="Protected human capabilities identified"
          items={s.protectedCapabilities}
        />
        <SummaryList
          title="AI-enabled graduate capabilities identified"
          items={s.aiEnabledCapabilities}
        />
        <SummaryList title="Curriculum/AI capability gaps" items={s.capabilityGaps} />
        <SummaryList title="Assessment portfolio observations" items={s.portfolioObservations} />
        <SummaryList
          title="Modules/assessments prioritised for review"
          items={s.prioritisedForReview}
        />
        <SummaryList title="Programme-level actions" items={s.programmeActions} />
        <SummaryList title="Module-level actions" items={s.moduleActions} />
        <SummaryBlock title="Review date">
          <p className="text-sm text-slate-700">
            {s.reviewDate || <span className="text-slate-400">Set in Programme Context</span>}
          </p>
        </SummaryBlock>
      </Section>
    </>
  )
}

export function SummaryBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{title}</h3>
      {children}
    </div>
  )
}

export function SummaryList({
  title,
  items,
  linkable = true,
}: {
  title: string
  items: SummaryItem[]
  linkable?: boolean
}) {
  return (
    <SummaryBlock title={title}>
      {items.length === 0 ? (
        <p className="text-sm text-slate-400">Nothing recorded yet.</p>
      ) : (
        <ul className="list-disc space-y-0.5 pl-5 text-sm text-slate-700">
          {items.map((it, i) => (
            <li key={i}>
              {it.to && linkable ? (
                <Link to={it.to} className="hover:underline">
                  {it.text}
                </Link>
              ) : (
                it.text
              )}
            </li>
          ))}
        </ul>
      )}
    </SummaryBlock>
  )
}
