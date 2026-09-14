import { DISCUSSION_QUESTIONS, SYNTHESIS } from '../../content/synthesis'
import { useReview, useReviewStore } from '../../store/reviewStore'
import { PageTitle, Section, TextArea } from '../../components/fields'

export function DiscussionPage() {
  const review = useReview()
  const update = useReviewStore((s) => s.update)
  return (
    <>
      <PageTitle
        part="Part C – Programme Synthesis"
        title="19. Programme Team Discussion"
        lede={SYNTHESIS.discussionIntro}
      />
      <Section title="Discussion">
        <div className="space-y-5">
          {DISCUSSION_QUESTIONS.map((q) => (
            <TextArea
              key={q.id}
              label={q.text}
              rows={3}
              value={review.synthesis.discussion[q.id] ?? ''}
              onChange={(v) => update((r) => void (r.synthesis.discussion[q.id] = v))}
            />
          ))}
        </div>
      </Section>
    </>
  )
}
