import { useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { TOOL_PURPOSE } from '../content/programme'
import { useReviewStore } from '../store/reviewStore'
import { parseReviewJson, readFileText } from '../store/io'
import { Button, Callout, PageTitle } from '../components/fields'
import { loadSampleReview } from '../model/sample'

export function Home() {
  const started = useReviewStore((s) => s.started)
  const review = useReviewStore((s) => s.review)
  const start = useReviewStore((s) => s.start)
  const load = useReviewStore((s) => s.load)
  const navigate = useNavigate()
  const fileRef = useRef<HTMLInputElement>(null)

  const onImport = async (file: File | undefined) => {
    if (!file) return
    const result = parseReviewJson(await readFileText(file))
    if (!result.ok) {
      alert(result.error)
      return
    }
    if (
      started &&
      !confirm('Importing will replace the review currently in this browser. Continue?')
    )
      return
    load(result.review)
    navigate('/programme/context')
  }

  return (
    <div className="space-y-8">
      <PageTitle title="AI Programme & Module Review Tool" lede={TOOL_PURPOSE.intro} />

      <div className="grid gap-4 sm:grid-cols-3">
        {started ? (
          <Card
            title="Continue review"
            body={review.programme.title || 'Untitled programme'}
            action={
              <Button variant="primary" onClick={() => navigate('/programme/context')}>
                Continue
              </Button>
            }
          />
        ) : (
          <Card
            title="Start a new review"
            body="Begin with the programme context, then add modules and assessments."
            action={
              <Button
                variant="primary"
                onClick={() => {
                  start()
                  navigate('/programme/context')
                }}
              >
                Start
              </Button>
            }
          />
        )}
        <Card
          title="Import a saved review"
          body="Open a JSON file exported earlier by you or a colleague."
          action={
            <>
              <input
                ref={fileRef}
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={(e) => {
                  void onImport(e.target.files?.[0])
                  e.target.value = ''
                }}
              />
              <Button onClick={() => fileRef.current?.click()}>Choose file…</Button>
            </>
          }
        />
        <Card
          title="Explore a sample"
          body="Load a worked example to see how the synthesis and statement are generated."
          action={
            <Button
              onClick={() => {
                if (
                  started &&
                  !confirm(
                    'Loading the sample will replace the current review in this browser. Continue?',
                  )
                )
                  return
                load(loadSampleReview())
                navigate('/synthesis/dashboard')
              }}
            >
              Load sample
            </Button>
          }
        />
      </div>

      <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Purpose of the tool</h2>
        <p className="text-sm text-slate-700">{TOOL_PURPOSE.notAiProof}</p>
        <p className="text-sm text-slate-700">
          The tool is designed to support a team-based approach to curriculum and assessment review.
          It enables programme teams to identify:
        </p>
        <ul className="list-disc space-y-0.5 pl-6 text-sm text-slate-700">
          {TOOL_PURPOSE.enables.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
        <h3 className="pt-2 font-semibold">How the review is structured</h3>
        <ol className="list-decimal space-y-1 pl-6 text-sm text-slate-700">
          <li>
            <strong>Part A – Programme Review.</strong> Context, graduate capabilities, AI
            capability progression, and the assessment portfolio.
          </li>
          <li>
            <strong>Part B – Module & Assessment Review.</strong> Each module and each of its
            assessments. The assessment ratings feed the programme portfolio automatically.
          </li>
          <li>
            <strong>Part C – Programme Synthesis.</strong> Dashboard, patterns, team discussion,
            action plan and the generated review summary.
          </li>
          <li>
            <strong>Part D – AI Integration Statement.</strong> A first draft is generated from your
            review responses for the team to amend and approve.
          </li>
        </ol>
        <p className="text-sm text-slate-700">{TOOL_PURPOSE.structure}</p>
        <p className="text-sm text-slate-700">
          New to the tool?{' '}
          <Link className="font-medium text-brand-700 underline" to="/help">
            Read the Help &amp; Guide
          </Link>{' '}
          for a walkthrough of each part, how the review is saved and shared, and how the suggested
          ratings are worked out.
        </p>
      </section>

      <Callout title="Guiding principles">
        <ul className="list-disc space-y-1 pl-5">
          {TOOL_PURPOSE.guidingPrinciples.map((principle) => (
            <li key={principle}>{principle}</li>
          ))}
        </ul>
      </Callout>

      <Callout title="Where your data lives" tone="note">
        <p>
          Everything you enter is saved automatically in this browser only. Nothing is sent to a
          server. Use <strong>Export</strong> to save a JSON file for backup or to share with
          colleagues, and <strong>Import</strong> to load it again.
        </p>
      </Callout>
    </div>
  )
}

function Card({ title, body, action }: { title: string; body: string; action: React.ReactNode }) {
  return (
    <div className="flex flex-col justify-between gap-3 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <h2 className="font-semibold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm text-slate-600">{body}</p>
      </div>
      <div>{action}</div>
    </div>
  )
}
