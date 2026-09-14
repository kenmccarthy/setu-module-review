import { COHERENCE } from '../../content/programme'
import { QUALITY } from '../../content/scales'
import { useReviewStore } from '../../store/reviewStore'
import { KeyQuestion, PageTitle, RatingScale, Section, TextArea } from '../../components/fields'

export function CoherencePage() {
  const p = useReviewStore((s) => s.review.programme)
  const update = useReviewStore((s) => s.update)
  return (
    <>
      <PageTitle
        part="Part A – Programme Review"
        title="7. Programme Coherence"
        lede={COHERENCE.note}
      />
      <KeyQuestion>{COHERENCE.keyQuestion}</KeyQuestion>
      <Section title="Review">
        <div className="space-y-4">
          {COHERENCE.questions.map((q) => (
            <TextArea
              key={q.id}
              label={q.text}
              rows={2}
              value={p.coherenceAnswers[q.id] ?? ''}
              onChange={(v) => update((r) => void (r.programme.coherenceAnswers[q.id] = v))}
            />
          ))}
        </div>
      </Section>
      <Section title={COHERENCE.overall}>
        <RatingScale
          options={QUALITY}
          value={p.coherenceRating}
          onChange={(v) => update((r) => void (r.programme.coherenceRating = v))}
        />
        <TextArea
          label="Observations"
          value={p.coherenceObservations}
          onChange={(v) => update((r) => void (r.programme.coherenceObservations = v))}
          rows={5}
        />
      </Section>
    </>
  )
}
