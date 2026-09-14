import { Link } from 'react-router-dom'
import { STATEMENT_PURPOSE, STATEMENT_SECTIONS } from '../../content/statement'
import { STATEMENT_APPROACHES, type StatementApproach } from '../../content/scales'
import { useReview, useReviewStore } from '../../store/reviewStore'
import { generateStatementDrafts } from '../../logic/statement'
import {
  Button,
  Callout,
  Consider,
  KeyQuestion,
  PageTitle,
  Section,
  SelectInput,
  TextArea,
  TextInput,
} from '../../components/fields'

export function StatementPage() {
  const review = useReview()
  const update = useReviewStore((s) => s.update)
  const drafts = generateStatementDrafts(review)
  const st = review.statement

  return (
    <>
      <PageTitle
        part="Part D – AI Integration Statement"
        title="21. Developing the Programme AI Integration Statement"
        lede={STATEMENT_PURPOSE.intro}
      />

      <Callout title="Purpose">
        <p>The statement is intended to:</p>
        <ul className="list-disc pl-5">
          {STATEMENT_PURPOSE.intended.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
        {STATEMENT_PURPOSE.caveats.map((c) => (
          <p key={c}>{c}</p>
        ))}
      </Callout>

      <Callout title="How drafts work" tone="info">
        <p>
          A first draft of each section is generated from your review responses and updates as the
          review changes. Use <strong>Edit draft</strong> to copy it into the text box and amend it;
          your text then takes precedence. Clear the box to return to the generated draft. Square
          brackets mark information the review has not yet provided. See the assembled narrative on{' '}
          <Link to="/statement/full" className="underline">
            Full Statement & Evidence
          </Link>
          .
        </p>
      </Callout>

      <Section
        title="Programme approach"
        intro="In response, the programme has adopted an approach to AI that is:"
      >
        <SelectInput
          label="Approach"
          options={STATEMENT_APPROACHES}
          value={st.approach}
          onChange={(approach) =>
            update((r) => void (r.statement.approach = approach as StatementApproach | ''))
          }
        />
        {st.approach === 'other' && (
          <TextInput
            label="Describe the approach"
            value={st.approachOther}
            onChange={(v) => update((r) => void (r.statement.approachOther = v))}
          />
        )}
        <TextArea
          label="Rationale"
          value={st.approachRationale}
          onChange={(v) => update((r) => void (r.statement.approachRationale = v))}
        />
      </Section>

      {STATEMENT_SECTIONS.map((sec) => {
        const text = st.sections[sec.id] ?? ''
        const draft = drafts[sec.id]
        const usingDraft = text.trim() === ''
        return (
          <Section key={sec.id} number={sec.number} title={sec.title} id={sec.id}>
            <KeyQuestion>{sec.prompt}</KeyQuestion>
            {sec.extra && <p className="text-sm text-slate-600">{sec.extra}</p>}
            <Consider items={sec.consider} />
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Sentence stems
              </p>
              {sec.stems.map((s) => (
                <p
                  key={s}
                  className="border-l-2 border-slate-300 pl-3 text-sm italic text-slate-600"
                >
                  {s}
                </p>
              ))}
            </div>
            <div
              className={`rounded-md border p-3 text-sm ${usingDraft ? 'border-brand-200 bg-brand-50' : 'border-slate-200 bg-slate-50'}`}
            >
              <div className="mb-1 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
                  Generated draft {usingDraft ? '(in use)' : '(superseded by your text)'}
                </p>
                <Button
                  onClick={() => update((r) => void (r.statement.sections[sec.id] = draft))}
                  title="Copy the generated draft into the editable text box"
                >
                  Edit draft
                </Button>
              </div>
              <p className="whitespace-pre-wrap leading-relaxed text-slate-800">{draft}</p>
            </div>
            <TextArea
              label="Programme statement (team text)"
              hint={
                usingDraft
                  ? 'Empty – the generated draft will be used.'
                  : 'Your text is used in the statement.'
              }
              rows={6}
              value={text}
              onChange={(v) => update((r) => void (r.statement.sections[sec.id] = v))}
            />
          </Section>
        )
      })}

      <Section title="Dates">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput
            label="Date agreed by programme team"
            type="date"
            value={st.agreedDate}
            onChange={(v) => update((r) => void (r.statement.agreedDate = v))}
          />
          <TextInput
            label="Next review"
            type="date"
            value={st.nextReviewDate}
            onChange={(v) => update((r) => void (r.statement.nextReviewDate = v))}
          />
        </div>
      </Section>
    </>
  )
}
