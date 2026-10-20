import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Callout, Section } from '../../components/fields'
import { reviewPath } from '../../components/layout/nav'
import { SUMMARY } from '../../content/v2/programme'
import {
  NOT_ANSWERED,
  programmeSummary,
  programmeSummaryText,
} from '../../logic/v2/programmeSummary'
import { downloadJson, reviewFileName } from '../../store/download'
import { useProgramme } from './useProgramme'

export function ProgrammeSummary() {
  const { review: r, set } = useProgramme()
  const [copied, setCopied] = useState(false)
  const blocks = programmeSummary(r)
  const sectionFor: Record<string, string> = {
    context: 'context',
    independent: 'capabilities',
    'ai-enabled': 'capabilities',
    outcomes: 'capabilities',
    progression: 'progression',
    curriculum: 'curriculum',
    coherence: 'coherence',
    strengths: 'priorities',
    opportunities: 'priorities',
    priorities: 'priorities',
    questions: 'priorities',
  }

  return (
    <>
      <div className="no-print flex flex-wrap gap-2">
        <Button variant="primary" onClick={() => window.print()}>
          Print / save as PDF
        </Button>
        <Button
          onClick={() =>
            void navigator.clipboard.writeText(programmeSummaryText(r)).then(() => setCopied(true))
          }
        >
          {copied ? 'Copied' : 'Copy as text'}
        </Button>
        <Button onClick={() => downloadJson(reviewFileName(r), r)}>Export review (JSON)</Button>
      </div>

      <article className="space-y-4">
        <p className="hidden text-xs text-slate-500 print:block">
          SETU Programme AI Integration Review · generated {new Date().toLocaleDateString()}
        </p>
        {blocks.map((b) => (
          <Section key={b.id} title={b.heading}>
            {b.lines.length ? (
              <ul className="space-y-1 text-sm text-slate-800">
                {b.lines.map((l, i) => (
                  <li key={i} className="whitespace-pre-line">
                    {l}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">{NOT_ANSWERED}.</p>
            )}
            <Link
              className="no-print text-sm font-medium text-brand-700 hover:underline"
              to={reviewPath('programme', r.id, sectionFor[b.id])}
            >
              Edit
            </Link>
          </Section>
        ))}
      </article>

      <div className="no-print space-y-3">
        <Callout title="Programme AI Integration Statement" tone="note">
          <p>{SUMMARY.statementHint}</p>
          <p>
            <Link className="font-medium underline" to={reviewPath('programme', r.id, 'statement')}>
              Go to the statement
            </Link>
          </p>
        </Callout>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            className="h-4 w-4 accent-brand-600"
            checked={r.status === 'complete'}
            onChange={(e) => set({ status: e.target.checked ? 'complete' : 'in_progress' })}
          />
          Mark this initial review as complete (you can still change it later)
        </label>
      </div>
    </>
  )
}
