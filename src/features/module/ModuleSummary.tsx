import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Callout, Section, TextArea } from '../../components/fields'
import { reviewPath } from '../../components/layout/nav'
import { MODULE_SUMMARY } from '../../content/v2/module'
import { moduleContributionPacket } from '../../logic/v2/exchange'
import { moduleSummary, moduleSummaryText } from '../../logic/v2/moduleSummary'
import { NOT_ANSWERED } from '../../logic/v2/programmeSummary'
import { downloadJson, reviewFileName } from '../../store/download'
import { useModuleReview } from './useModuleReview'

const SECTION_FOR: Record<string, string> = {
  details: 'context',
  outcomes: 'outcomes',
  teaching: 'teaching',
  assessments: 'assessment',
  confidence: 'assessment',
  actions: 'reflection',
  discussion: 'reflection',
  reflection: 'reflection',
}

export function ModuleSummary() {
  const { review: m, set } = useModuleReview()
  const [copied, setCopied] = useState(false)
  const blocks = moduleSummary(m).filter((b) => b.id !== 'contribution')

  return (
    <>
      <div className="no-print flex flex-wrap gap-2">
        <Button variant="primary" onClick={() => window.print()}>
          Print / save as PDF
        </Button>
        <Button
          onClick={() =>
            void navigator.clipboard.writeText(moduleSummaryText(m)).then(() => setCopied(true))
          }
        >
          {copied ? 'Copied' : 'Copy as text'}
        </Button>
        <Button onClick={() => downloadJson(reviewFileName(m), m)}>Export review (JSON)</Button>
      </div>

      <article className="space-y-4">
        <p className="hidden text-xs text-slate-500 print:block">
          SETU Module AI Integration Review · generated {new Date().toLocaleDateString()}
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
              <p className="text-sm text-slate-500">
                {b.id === 'discussion'
                  ? 'Nothing noted for programme discussion.'
                  : `${NOT_ANSWERED}.`}
              </p>
            )}
            <Link
              className="no-print text-sm font-medium text-brand-700 hover:underline"
              to={reviewPath('module', m.id, SECTION_FOR[b.id])}
            >
              Edit
            </Link>
          </Section>
        ))}
        <Section title={MODULE_SUMMARY.contributionHeading}>
          <div className="no-print">
            <TextArea
              label={MODULE_SUMMARY.contributionPrompt}
              hint={MODULE_SUMMARY.contributionHint}
              value={m.contribution}
              onChange={(contribution) => set({ contribution })}
              rows={4}
            />
          </div>
          <p className="hidden whitespace-pre-line text-sm text-slate-800 print:block">
            {m.contribution.trim() || `${NOT_ANSWERED}.`}
          </p>
        </Section>
      </article>

      <div className="no-print space-y-3">
        <Callout title="Share with a programme team" tone="note">
          <p>{MODULE_SUMMARY.exportHint}</p>
          <div className="pt-1">
            <Button
              onClick={() =>
                downloadJson(reviewFileName(m, 'module-contribution'), moduleContributionPacket(m))
              }
            >
              Export module contribution
            </Button>
          </div>
        </Callout>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            className="h-4 w-4 accent-brand-600"
            checked={m.status === 'complete'}
            onChange={(e) => set({ status: e.target.checked ? 'complete' : 'in_progress' })}
          />
          Mark this initial review as complete (you can still change it later)
        </label>
      </div>
    </>
  )
}
