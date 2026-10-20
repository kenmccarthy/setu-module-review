import { useState } from 'react'
import {
  Button,
  Callout,
  Choice,
  Disclosure,
  Section,
  TextArea,
  TextInput,
} from '../../components/fields'
import { STATEMENT_APPROACHES, optionLabel } from '../../content/scales'
import { STATEMENT_SECTIONS } from '../../content/statement'
import { STATEMENT_STATUSES } from '../../content/v2/scales'
import { APPROVAL, PROVENANCE, STATEMENT, type Provenance } from '../../content/v2/statement'
import {
  approveStatement,
  changedSinceAgreed,
  draftText,
  evidenceAppendix,
  keepOwnText,
  placeholders,
  revertToDraft,
  setSectionText,
  setStatus,
  statementExport,
  statementSections,
  statementText,
  wordCount,
  type DraftSentence,
  type StatementSectionView,
} from '../../logic/v2/statement'
import { formatDate } from '../../logic/text'
import { downloadJson, reviewFileName } from '../../store/download'
import { useWorkspace } from '../../store/workspace'
import { useProgramme } from '../programme/useProgramme'

export function StatementPage() {
  const { review: r, edit } = useProgramme()
  const replace = useWorkspace((s) => s.replace)
  const [copied, setCopied] = useState(false)
  const st = r.statement
  const sections = statementSections(r)
  const words = wordCount(statementText(r))
  const gaps = placeholders(r)
  const legacy = Object.entries(st.legacySections).filter(([, v]) => v.trim())

  return (
    <>
      <div className="no-print space-y-6">
        <p className="max-w-3xl text-sm text-slate-600">{STATEMENT.lede}</p>
        <Callout title="Drafted from your review" tone="note">
          <p>{STATEMENT.provisional}</p>
          <p>
            Each sentence is generated only from what your team recorded and is labelled with what
            it is based on. Edit any section into your own words; your text is kept if the review
            answers change later.
          </p>
        </Callout>
        <Disclosure summary="What the labels mean">
          <dl className="space-y-1">
            {(Object.keys(PROVENANCE) as Provenance[]).map((k) => (
              <div key={k} className="flex flex-wrap gap-2">
                <dt>
                  <Chip kind={k} />
                </dt>
                <dd className="text-slate-700">{PROVENANCE[k].description}</dd>
              </div>
            ))}
          </dl>
        </Disclosure>

        <Section title="Our approach">
          <Choice
            label={STATEMENT.approachQuestion}
            options={STATEMENT_APPROACHES}
            value={st.approach}
            onChange={(approach) => edit((d) => void (d.statement.approach = approach))}
          />
          {st.approach === 'other' && (
            <TextInput
              label="Describe the approach"
              value={st.approachOther}
              onChange={(v) => edit((d) => void (d.statement.approachOther = v))}
            />
          )}
          <TextArea
            label={STATEMENT.approachRationale}
            value={st.approachRationale}
            onChange={(v) => edit((d) => void (d.statement.approachRationale = v))}
            rows={3}
          />
        </Section>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-700">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              className="h-4 w-4 accent-brand-600"
              checked={st.includeModuleExamples}
              onChange={(e) =>
                edit((d) => void (d.statement.includeModuleExamples = e.target.checked))
              }
            />
            {STATEMENT.moduleExamples} ({r.moduleContributions.length} linked)
          </label>
          <span>
            {words} words · {STATEMENT.wordGuide}
          </span>
        </div>

        {sections.map((s, i) => (
          <SectionCard
            key={s.id}
            n={i + 1}
            s={s}
            onText={(text) => replace(setSectionText(r, s.id, text))}
            onRevert={() => replace(revertToDraft(r, s.id))}
            onKeep={() => replace(keepOwnText(r, s.id))}
          />
        ))}

        {gaps.length > 0 && (
          <Callout
            title={`${gaps.length} item${gaps.length === 1 ? '' : 's'} to confirm`}
            tone="warn"
          >
            <p>
              These placeholders are where the review has no answer yet. Answer the question in the
              review, or edit the section, before agreeing the statement.
            </p>
            <ul className="list-disc space-y-0.5 pl-5">
              {gaps.map((g, i) => (
                <li key={i}>
                  <span className="font-medium">{g.section}:</span> {g.text}
                </li>
              ))}
            </ul>
          </Callout>
        )}

        {legacy.length > 0 && (
          <Disclosure summary={STATEMENT.legacy}>
            <p className="text-slate-600">{STATEMENT.legacyIntro}</p>
            {legacy.map(([id, text]) => (
              <div key={id}>
                <p className="font-medium text-slate-800">
                  {STATEMENT_SECTIONS.find((x) => x.id === id)?.title ?? id}
                </p>
                <p className="whitespace-pre-line text-slate-700">{text}</p>
              </div>
            ))}
          </Disclosure>
        )}

        <ApprovalPanel />

        <Section title="Output">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              className="h-4 w-4 accent-brand-600"
              checked={st.includeEvidenceAppendix}
              onChange={(e) =>
                edit((d) => void (d.statement.includeEvidenceAppendix = e.target.checked))
              }
            />
            Include the supporting evidence appendix (programme review findings and module
            contributions)
          </label>
          <div className="flex flex-wrap gap-2">
            <Button variant="primary" onClick={() => window.print()}>
              Print / save as PDF
            </Button>
            <Button
              onClick={() =>
                void navigator.clipboard.writeText(statementText(r)).then(() => setCopied(true))
              }
            >
              {copied ? 'Copied' : 'Copy text'}
            </Button>
            <Button
              onClick={() =>
                downloadJson(reviewFileName(r, 'ai-integration-statement'), statementExport(r))
              }
            >
              Export statement (JSON)
            </Button>
          </div>
        </Section>
      </div>

      <PrintedStatement />
    </>
  )
}

function Chip({ kind }: { kind: Provenance }) {
  return (
    <span
      className={`inline-block rounded border px-1.5 py-0.5 align-middle text-[11px] font-medium leading-none ${
        kind === 'confirm'
          ? 'border-dashed border-slate-500 text-slate-700'
          : 'border-slate-300 bg-slate-50 text-slate-600'
      }`}
    >
      {PROVENANCE[kind].label}
    </span>
  )
}

function Sentences({ items }: { items: DraftSentence[] }) {
  return (
    <ul className="space-y-1.5 text-sm text-slate-800">
      {items.map((d, i) => (
        <li key={i}>
          <Chip kind={d.kind} />{' '}
          <span className={d.kind === 'confirm' ? 'italic text-slate-600' : ''}>{d.text}</span>
        </li>
      ))}
    </ul>
  )
}

function SectionCard({
  n,
  s,
  onText,
  onRevert,
  onKeep,
}: {
  n: number
  s: StatementSectionView
  onText: (t: string) => void
  onRevert: () => void
  onKeep: () => void
}) {
  const [editing, setEditing] = useState(false)
  const showEditor = editing || s.edited
  return (
    <Section number={n} title={s.title} intro={s.question}>
      {showEditor ? (
        <>
          <TextArea
            label={`Statement text: ${s.title}`}
            value={s.text}
            onChange={onText}
            rows={7}
          />
          <p className="text-xs text-slate-500">
            {s.edited
              ? 'Your own text is used for this section.'
              : 'Start typing to use your own text for this section.'}
          </p>
          {s.draftChanged && (
            <Callout title="An updated draft is available" tone="note">
              <p>
                Answers in the review have changed since this section was edited. Your text has not
                been changed.
              </p>
              <Sentences items={s.draft} />
              <div className="flex flex-wrap gap-2 pt-1">
                <Button onClick={onKeep}>Keep my text</Button>
                <Button onClick={onRevert}>Use the updated draft</Button>
              </div>
            </Callout>
          )}
          <div className="flex flex-wrap gap-2">
            {s.edited && !s.draftChanged && (
              <Button
                variant="ghost"
                onClick={() => {
                  if (confirm('Replace your text for this section with the generated draft?')) {
                    onRevert()
                    setEditing(false)
                  }
                }}
              >
                Use the generated draft
              </Button>
            )}
            {!s.edited && (
              <Button variant="ghost" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            )}
          </div>
        </>
      ) : (
        <>
          <Sentences items={s.draft} />
          <div>
            <Button
              onClick={() => {
                setEditing(true)
                onText(draftText(s.draft))
              }}
            >
              Edit this section
            </Button>
          </div>
        </>
      )}
    </Section>
  )
}

function ApprovalPanel() {
  const { review: r } = useProgramme()
  const replace = useWorkspace((s) => s.replace)
  const st = r.statement
  const [form, setForm] = useState({
    programmeName: st.programmeName || r.title,
    approvedBy: st.approvedBy,
    approvalDate: st.approvalDate,
    nextReviewDate: st.nextReviewDate,
  })
  const [error, setError] = useState('')
  const [open, setOpen] = useState(false)
  const status = st.status || 'draft'
  const gaps = placeholders(r).length

  return (
    <Section title={APPROVAL.heading}>
      <p className="text-sm">
        Status: <strong>{optionLabel(STATEMENT_STATUSES, status)}</strong>
        {status === 'agreed' &&
          ` · approved by ${st.approvedBy} on ${formatDate(st.approvalDate)}${st.nextReviewDate ? ` · next review ${formatDate(st.nextReviewDate)}` : ''}`}
      </p>
      {changedSinceAgreed(r) && (
        <p role="alert" className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-900">
          {APPROVAL.changedSinceAgreed}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {status === 'draft' && (
          <Button onClick={() => replace(setStatus(r, 'under_review'))}>
            {APPROVAL.sendForReview}
          </Button>
        )}
        {(status !== 'agreed' || changedSinceAgreed(r)) && (
          <Button variant="primary" onClick={() => setOpen(true)}>
            {APPROVAL.record}
          </Button>
        )}
        {status !== 'draft' && (
          <Button variant="ghost" onClick={() => replace(setStatus(r, 'draft'))}>
            {APPROVAL.returnToDraft}
          </Button>
        )}
      </div>
      {open && (
        <form
          className="space-y-3 rounded-md border border-slate-200 p-4"
          onSubmit={(e) => {
            e.preventDefault()
            if (
              gaps &&
              !confirm(
                `The statement still has ${gaps} placeholder${gaps === 1 ? '' : 's'} to confirm. Mark it as agreed anyway?`,
              )
            )
              return
            const result = approveStatement(r, form)
            if (!result.ok) return setError(result.error)
            replace(result.review)
            setError('')
            setOpen(false)
          }}
        >
          <p className="text-sm text-slate-600">{APPROVAL.recordIntro}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <TextInput
              label={APPROVAL.programmeName}
              value={form.programmeName}
              onChange={(programmeName) => setForm({ ...form, programmeName })}
            />
            <TextInput
              label={APPROVAL.approvedBy}
              value={form.approvedBy}
              onChange={(approvedBy) => setForm({ ...form, approvedBy })}
            />
            <TextInput
              type="date"
              label={APPROVAL.approvalDate}
              value={form.approvalDate}
              onChange={(approvalDate) => setForm({ ...form, approvalDate })}
            />
            <TextInput
              type="date"
              label={APPROVAL.nextReview}
              value={form.nextReviewDate}
              onChange={(nextReviewDate) => setForm({ ...form, nextReviewDate })}
            />
          </div>
          {error && (
            <p role="alert" className="text-sm text-rose-800">
              {error}
            </p>
          )}
          <div className="flex gap-2">
            <Button type="submit" variant="primary">
              {APPROVAL.markAgreed}
            </Button>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}
      {status !== 'agreed' && (
        <div className="grid gap-3 sm:grid-cols-2">
          <TextInput
            type="date"
            label={`${APPROVAL.nextReview} (optional, used in section 5)`}
            value={st.nextReviewDate}
            onChange={(nextReviewDate) =>
              replace({
                ...r,
                statement: { ...st, nextReviewDate },
                updatedAt: new Date().toISOString(),
              })
            }
          />
        </div>
      )}
    </Section>
  )
}

/** The clean statement as printed: no labels, plus status, approval and the optional appendix. */
function PrintedStatement() {
  const { review: r } = useProgramme()
  const st = r.statement
  const status = st.status || 'draft'
  const evidence = st.includeEvidenceAppendix ? evidenceAppendix(r) : null
  return (
    <article className="hidden space-y-5 print:block">
      <header>
        <p className="text-xs uppercase tracking-wider text-slate-500">SETU · {STATEMENT.title}</p>
        <h1 className="text-2xl font-bold">{st.programmeName || r.title || 'Programme'}</h1>
        <p className="text-sm">
          Status: {optionLabel(STATEMENT_STATUSES, status)}
          {status === 'agreed' &&
            ` · approved by ${st.approvedBy} on ${formatDate(st.approvalDate)}`}
          {st.nextReviewDate && ` · next review ${formatDate(st.nextReviewDate)}`}
          {changedSinceAgreed(r) && ' · edited since approval'}
        </p>
      </header>
      {statementSections(r).map((s, i) => (
        <section key={s.id} className="avoid-break">
          <h2 className="text-lg font-semibold">
            {i + 1}. {s.title}
          </h2>
          <p className="whitespace-pre-line text-sm leading-relaxed">{s.text}</p>
        </section>
      ))}
      {evidence && (
        <section className="print-break space-y-3">
          <h2 className="text-lg font-semibold">Appendix: supporting evidence</h2>
          <h3 className="font-semibold">Programme review findings</h3>
          {evidence.programme.map((b) => (
            <div key={b.id} className="avoid-break text-sm">
              <p className="font-medium">{b.heading}</p>
              <ul className="list-disc pl-5">
                {b.lines.map((l, i) => (
                  <li key={i}>{l}</li>
                ))}
              </ul>
            </div>
          ))}
          <h3 className="font-semibold">Module contributions</h3>
          <p className="text-sm italic">
            Module-level observations reported by module teams; not programme decisions.
          </p>
          {evidence.modules.length === 0 ? (
            <p className="text-sm">No module contributions were included.</p>
          ) : (
            evidence.modules.map((m) => (
              <div key={m.module} className="avoid-break text-sm">
                <p className="font-medium">
                  {m.module} (stage {m.stage})
                </p>
                <ul className="list-disc pl-5">
                  {m.positions.length > 0 && <li>Role of AI: {m.positions.join('; ')}</li>}
                  {m.confidence.length > 0 && (
                    <li>Confidence in learning: {m.confidence.join('; ')}</li>
                  )}
                  {m.contribution && <li>Contribution: {m.contribution}</li>}
                </ul>
              </div>
            ))
          )}
        </section>
      )}
    </article>
  )
}
