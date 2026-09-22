import { SYNTHESIS } from '../../content/synthesis'
import { useReview, useReviewStore } from '../../store/reviewStore'
import { detectPatterns, type PatternStatus } from '../../logic/patterns'
import { PageTitle, Pill, EmptyPill, TextArea } from '../../components/fields'

const STATUS: Record<PatternStatus, { label: string; tone: number | null }> = {
  triggered: { label: 'Pattern detected', tone: 3 },
  possible: { label: 'Possible – check', tone: 1 },
  clear: { label: 'Not detected', tone: 0 },
  unknown: { label: 'Not enough data', tone: null },
}

export function PatternsPage() {
  const review = useReview()
  const update = useReviewStore((s) => s.update)
  const patterns = detectPatterns(review)
  return (
    <>
      <PageTitle
        helpAnchor="suggestions"
        part="Part C – Programme Synthesis"
        title="18. Pattern Identification"
        lede={SYNTHESIS.patternsIntro}
      />
      <p className="text-sm text-slate-600">
        Each pattern below is checked automatically against the review data. Treat the result as a
        prompt for discussion, not a verdict, and record the team's view.
      </p>
      <ul className="space-y-3">
        {patterns.map((p) => {
          const st = STATUS[p.status]
          return (
            <li
              key={p.id}
              className="space-y-2 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium text-slate-800">Highlight where {p.text}</p>
                {st.tone === null ? (
                  <EmptyPill>{st.label}</EmptyPill>
                ) : (
                  <Pill tone={st.tone}>{st.label}</Pill>
                )}
              </div>
              {p.evidence.length > 0 && (
                <ul className="list-disc space-y-0.5 pl-5 text-sm text-slate-600">
                  {p.evidence.map((e) => (
                    <li key={e}>{e}</li>
                  ))}
                </ul>
              )}
              <TextArea
                label="Team observation"
                rows={2}
                value={review.synthesis.patternNotes[p.id] ?? ''}
                onChange={(v) => update((r) => void (r.synthesis.patternNotes[p.id] = v))}
              />
            </li>
          )
        })}
      </ul>
    </>
  )
}
