import { GRADUATE_CAPABILITIES } from '../../content/programme'
import {
  ENDURING_CAPABILITIES,
  HUMAN_AI_CAPABILITIES,
  PROTECTED_CAPABILITIES,
} from '../../content/capabilities'
import { AGREEMENT_WITH_DISCUSSION } from '../../content/scales'
import { useReviewStore } from '../../store/reviewStore'
import {
  CapabilityPicker,
  KeyQuestion,
  PageTitle,
  RatingScale,
  Section,
  TextArea,
} from '../../components/fields'

export function CapabilitiesPage() {
  const p = useReviewStore((s) => s.review.programme)
  const update = useReviewStore((s) => s.updateProgramme)
  const c = GRADUATE_CAPABILITIES
  return (
    <>
      <PageTitle part="Part A – Programme Review" title="2. Graduate Capabilities" />
      <KeyQuestion>{c.keyQuestion}</KeyQuestion>
      <p className="text-sm text-slate-600">Consider three categories.</p>

      <Section title={c.enduring.title} intro={c.enduring.question}>
        <CapabilityPicker
          presets={ENDURING_CAPABILITIES}
          value={p.enduringCapabilities}
          onChange={(enduringCapabilities) => update({ enduringCapabilities })}
        />
      </Section>

      <Section title={c.protected.title} intro={c.protected.question}>
        <CapabilityPicker
          label={c.protected.prompt}
          presets={PROTECTED_CAPABILITIES}
          value={p.protectedCapabilities}
          onChange={(protectedCapabilities) => update({ protectedCapabilities })}
        />
        <TextArea
          label="Notes"
          hint="Why these capabilities, and what independent demonstration looks like in this programme."
          value={p.protectedNotes}
          onChange={(protectedNotes) => update({ protectedNotes })}
        />
      </Section>

      <Section title={c.humanAi.title} intro={c.humanAi.question}>
        <CapabilityPicker
          presets={HUMAN_AI_CAPABILITIES}
          value={p.humanAiCapabilities}
          onChange={(humanAiCapabilities) => update({ humanAiCapabilities })}
        />
      </Section>

      <Section title="Programme Team Checkpoint">
        <RatingScale
          label={c.checkpoint}
          options={AGREEMENT_WITH_DISCUSSION}
          value={p.ploCheckpoint}
          onChange={(ploCheckpoint) => update({ ploCheckpoint })}
        />
        <TextArea
          label="Action required"
          value={p.ploAction}
          onChange={(ploAction) => update({ ploAction })}
        />
      </Section>
    </>
  )
}
