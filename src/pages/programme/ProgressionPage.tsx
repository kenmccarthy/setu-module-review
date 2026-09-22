import { PROGRESSION } from '../../content/programme'
import { PROGRESSION_CAPABILITIES } from '../../content/capabilities'
import { PROGRESSION_PHASES, QUALITY, type ProgressionPhase } from '../../content/scales'
import { useReviewStore } from '../../store/reviewStore'
import {
  Callout,
  Consider,
  KeyQuestion,
  PageTitle,
  RatingScale,
  Section,
  TextArea,
} from '../../components/fields'

const progressionKey = (capabilityId: string, stage: number) => `${capabilityId}:${stage}`

export function ProgressionPage() {
  const p = useReviewStore((s) => s.review.programme)
  const update = useReviewStore((s) => s.update)
  const stages = Array.from({ length: p.stages }, (_, i) => i + 1)

  const toggle = (capabilityId: string, stage: number, phase: ProgressionPhase) =>
    update((r) => {
      const key = progressionKey(capabilityId, stage)
      const current = r.programme.progression[key] ?? []
      r.programme.progression[key] = current.includes(phase)
        ? current.filter((x) => x !== phase)
        : [...current, phase]
    })

  return (
    <>
      <PageTitle
        helpAnchor="part-a"
        part="Part A – Programme Review"
        title="3. AI Capability Progression"
      />
      <KeyQuestion>{PROGRESSION.keyQuestion}</KeyQuestion>
      <Callout title="Note">
        <p>{PROGRESSION.note}</p>
      </Callout>

      <Section title="Progression map" intro={PROGRESSION.instruction}>
        <p className="text-xs text-slate-500">
          Click to mark where each capability is{' '}
          {PROGRESSION_PHASES.map((ph, i) => (
            <span key={ph.value}>
              <strong>{ph.label.charAt(0)}</strong>
              {ph.label.slice(1).toLowerCase()}
              {i < PROGRESSION_PHASES.length - 1 ? ', ' : '.'}
            </span>
          ))}{' '}
          The number of stages is set in Programme Context.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[40rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="py-2 pr-3">Capability</th>
                {stages.map((s) => (
                  <th key={s} className="px-2 py-2 text-center">
                    Stage {s}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PROGRESSION_CAPABILITIES.map((cap) => (
                <tr key={cap.id} className="border-b border-slate-100">
                  <td className="py-2 pr-3 font-medium text-slate-800">{cap.label}</td>
                  {stages.map((s) => {
                    const phases = p.progression[progressionKey(cap.id, s)] ?? []
                    return (
                      <td key={s} className="px-2 py-2">
                        <div className="flex justify-center gap-1">
                          {PROGRESSION_PHASES.map((ph) => {
                            const on = phases.includes(ph.value)
                            return (
                              <button
                                key={ph.value}
                                type="button"
                                aria-pressed={on}
                                aria-label={`${cap.label}, stage ${s}: ${ph.label}`}
                                title={ph.label}
                                onClick={() => toggle(cap.id, s, ph.value)}
                                className={`h-7 w-7 rounded border text-xs font-semibold transition ${
                                  on
                                    ? 'border-brand-700 bg-brand-600 text-white'
                                    : 'border-slate-200 bg-white text-slate-400 hover:border-brand-400'
                                }`}
                              >
                                {ph.label.charAt(0)}
                              </button>
                            )
                          })}
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Reflection">
        <RatingScale
          label={PROGRESSION.reflection}
          options={QUALITY}
          value={p.progressionRating}
          onChange={(progressionRating) =>
            update((r) => void (r.programme.progressionRating = progressionRating))
          }
        />
        <Consider title="Prompts" items={PROGRESSION.prompts} open />
        <TextArea
          label="Programme team observations/actions"
          value={p.progressionNotes}
          onChange={(progressionNotes) =>
            update((r) => void (r.programme.progressionNotes = progressionNotes))
          }
          rows={5}
        />
      </Section>
    </>
  )
}
