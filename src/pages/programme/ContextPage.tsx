import { CONTEXT } from '../../content/programme'
import { useReviewStore } from '../../store/reviewStore'
import {
  Consider,
  KeyQuestion,
  NumberInput,
  PageTitle,
  Section,
  TextArea,
  TextInput,
} from '../../components/fields'

export function ContextPage() {
  const p = useReviewStore((s) => s.review.programme)
  const update = useReviewStore((s) => s.updateProgramme)
  return (
    <>
      <PageTitle
        part="Part A – Programme Review"
        title="1. Programme Context"
        lede={CONTEXT.purpose}
      />
      <Section title="Capture">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput
            label="Programme title"
            value={p.title}
            onChange={(title) => update({ title })}
            className="sm:col-span-2"
          />
          <TextInput
            label="NFQ level"
            value={p.nfqLevel}
            onChange={(nfqLevel) => update({ nfqLevel })}
            placeholder="e.g. 8"
          />
          <TextInput
            label="Programme duration"
            value={p.duration}
            onChange={(duration) => update({ duration })}
            placeholder="e.g. 4 years"
          />
          <NumberInput
            label="Number of stages / years"
            hint="Used for the AI capability progression map and module stages."
            value={p.stages}
            min={1}
            max={8}
            onChange={(stages) => update({ stages: Math.min(8, Math.max(1, Math.round(stages))) })}
          />
          <TextInput
            label="Programme coordinator"
            value={p.coordinator}
            onChange={(coordinator) => update({ coordinator })}
          />
          <TextInput
            label="Faculty"
            value={p.academicUnit}
            onChange={(academicUnit) => update({ academicUnit })}
          />
          <TextInput
            label="Date of review"
            type="date"
            value={p.reviewDate}
            onChange={(reviewDate) => update({ reviewDate })}
          />
          <TextArea
            label="Programme team involved in review"
            value={p.team}
            onChange={(team) => update({ team })}
            rows={2}
            className="sm:col-span-2"
          />
        </div>
      </Section>
      <Section title="Reflection">
        <KeyQuestion>{CONTEXT.reflectionQuestion}</KeyQuestion>
        <Consider items={CONTEXT.consider} open />
        <TextArea
          label="Programme team reflection"
          value={p.disciplineReflection}
          onChange={(disciplineReflection) => update({ disciplineReflection })}
          rows={6}
        />
      </Section>
    </>
  )
}
