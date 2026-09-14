import { Link } from 'react-router-dom'
import { STATEMENT_PURPOSE } from '../../content/statement'
import { useReview, useReviewStore } from '../../store/reviewStore'
import { fullStatement, generateEvidenceSummary } from '../../logic/statement'
import { formatDate } from '../../logic/text'
import { Button, Callout, PageTitle, Section, inputClass } from '../../components/fields'

export function FullStatementPage() {
  const review = useReview()
  const update = useReviewStore((s) => s.update)
  const parts = fullStatement(review)
  const evidence = generateEvidenceSummary(review)
  const st = review.statement

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <PageTitle
          part="Part D – AI Integration Statement"
          title="Programme AI Integration Statement"
          lede="The assembled narrative statement, following the specification's synthesis template, plus the external review evidence summary."
        />
        <Link to="/print">
          <Button>Print / PDF</Button>
        </Link>
      </div>

      <Section title={review.programme.title || '[Programme Name]'}>
        {parts.map((p) => (
          <div key={p.heading} className="space-y-2">
            <h3 className="font-semibold text-slate-900">{p.heading}</h3>
            {p.paragraphs.map((para, i) => (
              <p key={i} className="text-sm leading-relaxed text-slate-800">
                {para}
              </p>
            ))}
          </div>
        ))}
        <div className="grid gap-1 pt-2 text-sm text-slate-700 sm:grid-cols-2">
          <p>
            <span className="font-medium">Date agreed by programme team:</span>{' '}
            {formatDate(st.agreedDate) || '[Date]'}
          </p>
          <p>
            <span className="font-medium">Next review:</span>{' '}
            {formatDate(st.nextReviewDate) || '[Date]'}
          </p>
        </div>
      </Section>

      <Section
        title="External Review Panel – Evidence Summary"
        intro="Auto-populated from the review. Edit any cell to override; clear it to restore the generated text."
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[40rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="py-2 pr-2 w-[22%]">Area</th>
                <th className="py-2 pr-2 w-[44%]">Programme position</th>
                <th className="py-2 pr-2">Supporting evidence</th>
              </tr>
            </thead>
            <tbody>
              {evidence.map((row) => (
                <tr key={row.id} className="border-b border-slate-100 align-top">
                  <td className="py-2 pr-2 font-medium text-slate-800">{row.area}</td>
                  <td className="py-2 pr-2">
                    <textarea
                      className={`${inputClass} min-h-[3rem]`}
                      rows={2}
                      aria-label={`${row.area} – programme position`}
                      value={st.evidencePosition[row.id] ?? ''}
                      placeholder={row.position}
                      onChange={(e) =>
                        update((r) => void (r.statement.evidencePosition[row.id] = e.target.value))
                      }
                    />
                  </td>
                  <td className="py-2 pr-2">
                    <textarea
                      className={`${inputClass} min-h-[3rem]`}
                      rows={2}
                      aria-label={`${row.area} – supporting evidence`}
                      value={st.evidenceSupport[row.id] ?? ''}
                      placeholder={row.evidence}
                      onChange={(e) =>
                        update((r) => void (r.statement.evidenceSupport[row.id] = e.target.value))
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Callout title="Key question for external review">
        <p>The AI Integration Statement should enable the programme team to confidently answer:</p>
        <p className="font-medium">{STATEMENT_PURPOSE.keyQuestion}</p>
        <p>{STATEMENT_PURPOSE.keyQuestionNote}</p>
      </Callout>
    </>
  )
}
