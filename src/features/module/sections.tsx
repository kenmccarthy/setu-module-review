import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { reviewPath } from '../../components/layout/nav'
import {
  Button,
  Choice,
  Disclosure,
  KeyQuestion,
  ListEditor,
  NumberInput,
  Section,
  SelectInput,
  TextArea,
  TextInput,
} from '../../components/fields'
import { OUTCOME_REVIEW } from '../../content/scales'
import { ASSESSMENT, MODULE_CONTEXT, OUTCOMES, REFLECTION, TEACHING } from '../../content/v2/module'
import {
  LT_OPPORTUNITIES,
  MODULE_ALIGNMENT,
  OUTCOMES_APPROPRIATE,
  RESPONSIBLE_ENGAGEMENT,
} from '../../content/v2/scales'
import { moduleLegacy } from '../../logic/v2/legacy'
import { MAX_PRIORITIES, newModuleAssessment, uid } from '../../model/v2/defaults'
import { LegacyPanel } from '../review/LegacyPanel'
import { AssessmentCard } from './AssessmentCard'
import { useModuleReview } from './useModuleReview'

function useLegacy() {
  const { review } = useModuleReview()
  return useMemo(() => moduleLegacy(review), [review])
}

export function ModuleContext() {
  const { review: m, set } = useModuleReview()
  const legacy = useLegacy()
  return (
    <>
      <Section title="About the module" intro={MODULE_CONTEXT.lede}>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput label="Module title" value={m.title} onChange={(title) => set({ title })} />
          <TextInput label="Module code" value={m.code} onChange={(code) => set({ code })} />
          <NumberInput
            label="Stage"
            value={m.stage}
            min={1}
            max={8}
            onChange={(n) => set({ stage: Math.min(8, Math.max(1, Math.round(n))) })}
          />
          <TextInput
            label="Credits"
            value={m.credits}
            onChange={(credits) => set({ credits })}
            placeholder="e.g. 10"
          />
          <TextInput
            label="Module coordinator"
            value={m.coordinator}
            onChange={(coordinator) => set({ coordinator })}
          />
          <TextInput
            label="Date of review"
            type="date"
            value={m.reviewDate}
            onChange={(reviewDate) => set({ reviewDate })}
          />
          <TextArea
            label="Associated programme or programmes"
            hint={MODULE_CONTEXT.programmesHint}
            value={m.associatedProgrammes}
            onChange={(associatedProgrammes) => set({ associatedProgrammes })}
            rows={2}
            className="sm:col-span-2"
          />
        </div>
      </Section>
      {m.legacy && (
        <Disclosure summary="Notes on what was carried over from the previous version">
          <ul className="list-disc space-y-1 pl-5 text-slate-700">
            {m.legacy.notes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </Disclosure>
      )}
      <LegacyPanel items={legacy.context} />
    </>
  )
}

export function ModuleOutcomes() {
  const { review: m, set, edit } = useModuleReview()
  return (
    <>
      <KeyQuestion>{OUTCOMES.heading}</KeyQuestion>
      <p className="max-w-3xl text-sm text-slate-600">{OUTCOMES.intro}</p>
      <Section title="Reflection">
        <Choice
          label={OUTCOMES.main}
          options={OUTCOMES_APPROPRIATE}
          value={m.outcomesAppropriate}
          onChange={(outcomesAppropriate) => set({ outcomesAppropriate })}
        />
        <TextArea
          label={OUTCOMES.capabilities}
          value={m.outcomesCapabilities}
          onChange={(outcomesCapabilities) => set({ outcomesCapabilities })}
          rows={3}
        />
        <TextArea
          label={OUTCOMES.changes}
          value={m.outcomesChanges}
          onChange={(outcomesChanges) => set({ outcomesChanges })}
          rows={3}
        />
      </Section>
      <Disclosure
        summary={`${OUTCOMES.detail}${m.learningOutcomes.length ? ` (${m.learningOutcomes.length} listed)` : ''}`}
      >
        <p className="text-slate-600">{OUTCOMES.detailIntro}</p>
        <ol className="space-y-4">
          {m.learningOutcomes.map((lo, i) => (
            <li key={lo.id} className="space-y-2 rounded-md border border-slate-200 p-3">
              <TextArea
                label={`Learning outcome ${i + 1}`}
                value={lo.text}
                rows={2}
                onChange={(text) => edit((d) => void (d.learningOutcomes[i].text = text))}
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <SelectInput
                  label="Review"
                  options={OUTCOME_REVIEW}
                  value={lo.rating}
                  onChange={(rating) => edit((d) => void (d.learningOutcomes[i].rating = rating))}
                  placeholder="Not reviewed"
                />
                <TextInput
                  label="Comments"
                  value={lo.comments}
                  onChange={(comments) =>
                    edit((d) => void (d.learningOutcomes[i].comments = comments))
                  }
                />
              </div>
              <button
                type="button"
                className="text-sm text-rose-700 hover:underline"
                onClick={() =>
                  edit((d) => {
                    const id = d.learningOutcomes[i].id
                    d.learningOutcomes.splice(i, 1)
                    for (const a of d.assessments)
                      a.advanced.outcomeIds = a.advanced.outcomeIds.filter((x) => x !== id)
                  })
                }
              >
                Remove learning outcome {i + 1}
              </button>
            </li>
          ))}
        </ol>
        <button
          type="button"
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          onClick={() =>
            edit(
              (d) =>
                void d.learningOutcomes.push({ id: uid(), text: '', rating: '', comments: '' }),
            )
          }
        >
          + Add a learning outcome
        </button>
      </Disclosure>
    </>
  )
}

export function ModuleTeaching() {
  const { review: m, set } = useModuleReview()
  const legacy = useLegacy()
  return (
    <>
      <KeyQuestion>{TEACHING.heading}</KeyQuestion>
      <p className="max-w-3xl text-sm text-slate-600">{TEACHING.intro}</p>
      <Section title="Reflection">
        <Choice
          label={TEACHING.q1}
          options={LT_OPPORTUNITIES}
          value={m.ltOpportunities}
          onChange={(ltOpportunities) => set({ ltOpportunities })}
        />
        <Choice
          label={TEACHING.q2}
          options={RESPONSIBLE_ENGAGEMENT}
          value={m.responsibleEngagement}
          onChange={(responsibleEngagement) => set({ responsibleEngagement })}
        />
        <Disclosure summary={TEACHING.guidance}>
          <ul className="list-disc space-y-1 pl-5 text-slate-700">
            {TEACHING.guidanceItems.map((g) => (
              <li key={g}>{g}</li>
            ))}
          </ul>
        </Disclosure>
        <TextArea
          label={TEACHING.enhance}
          value={m.ltEnhance}
          onChange={(ltEnhance) => set({ ltEnhance })}
          rows={3}
        />
      </Section>
      <LegacyPanel items={legacy.teaching} />
    </>
  )
}

export function ModuleAssessments() {
  const { review: m, edit } = useModuleReview()
  // The most recently added assessment opens; others start closed to keep the page short.
  const [opened, setOpened] = useState<string | null>(
    m.assessments.length === 1 ? m.assessments[0].id : null,
  )
  return (
    <>
      <KeyQuestion>{ASSESSMENT.heading}</KeyQuestion>
      <p className="max-w-3xl text-sm text-slate-600">{ASSESSMENT.intro}</p>
      {m.assessments.length === 0 && (
        <p className="rounded-md border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-600">
          {ASSESSMENT.empty}
        </p>
      )}
      {m.assessments.length > 0 && (
        <ol aria-label="Assessments" className="space-y-3">
          {m.assessments.map((a, i) => (
            <li key={a.id}>
              <AssessmentCard index={i} open={a.id === opened} />
            </li>
          ))}
        </ol>
      )}
      <div>
        <Button
          variant="primary"
          onClick={() => {
            const a = newModuleAssessment()
            edit((d) => void d.assessments.push(a))
            setOpened(a.id)
          }}
        >
          + Add an assessment
        </Button>
      </div>
    </>
  )
}

export function ModuleReflection() {
  const { review: m, set } = useModuleReview()
  const legacy = useLegacy()
  const prompts = m.programmePriorities.reduce((n, p) => n + p.prompts.length, 0)
  return (
    <>
      <KeyQuestion>{REFLECTION.heading}</KeyQuestion>
      {prompts > 0 && (
        <p className="rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-700">
          You have {prompts} optional prompt{prompts === 1 ? '' : 's'} from a programme team to
          consider.{' '}
          <Link
            className="font-medium text-brand-700 underline"
            to={reviewPath('module', m.id, 'programme-priorities')}
          >
            See programme priorities
          </Link>
        </p>
      )}
      <Section title="Reflection">
        <TextArea
          label={REFLECTION.workingWell}
          value={m.workingWell}
          onChange={(workingWell) => set({ workingWell })}
          rows={3}
        />
        <TextArea
          label={REFLECTION.enhance}
          value={m.enhance}
          onChange={(enhance) => set({ enhance })}
          rows={3}
        />
        <TextArea
          label={REFLECTION.programmeDiscussion}
          value={m.programmeDiscussion}
          onChange={(programmeDiscussion) => set({ programmeDiscussion })}
          rows={3}
        />
        <ListEditor
          label={REFLECTION.nextSteps}
          hint={REFLECTION.nextStepsHint}
          value={m.nextSteps}
          onChange={(nextSteps) => set({ nextSteps })}
          max={MAX_PRIORITIES}
          addLabel="Add a next step"
          itemLabel="Next step"
        />
      </Section>
      <Section title="Alignment">
        <Choice
          label={REFLECTION.alignment}
          options={MODULE_ALIGNMENT}
          value={m.alignment}
          onChange={(alignment) => set({ alignment })}
        />
      </Section>
      <LegacyPanel items={legacy.reflection} />
    </>
  )
}
