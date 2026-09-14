import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { LEARNING_OUTCOMES, LEARNING_TEACHING, MODULE_CONTEXT } from '../../content/module'
import {
  OUTCOME_REVIEW,
  QUALITY,
  VULNERABILITY,
  ASSURANCE,
  AI_POSITIONS,
  optionLabel,
} from '../../content/scales'
import { useModule, useReviewStore } from '../../store/reviewStore'
import { newLearningOutcome } from '../../model/defaults'
import { assessmentCompleteness } from '../../logic/completeness'
import { flagLevel } from '../../logic/flags'
import {
  Button,
  Consider,
  EmptyPill,
  KeyQuestion,
  NumberInput,
  PageTitle,
  Pill,
  RatingScale,
  Section,
  TextArea,
  TextInput,
} from '../../components/fields'

export function ModulePage() {
  const { moduleId } = useParams()
  const module = useModule(moduleId)
  const stages = useReviewStore((s) => s.review.programme.stages)
  const updateModule = useReviewStore((s) => s.updateModule)
  const update = useReviewStore((s) => s.update)
  const addAssessment = useReviewStore((s) => s.addAssessment)
  const removeAssessment = useReviewStore((s) => s.removeAssessment)
  const navigate = useNavigate()

  if (!module) return <Navigate to="/modules" replace />
  const m = module
  const patch = (p: Partial<typeof m>) => updateModule(m.id, p)

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <PageTitle
          part="Part B – Module & Assessment Review"
          title={m.title ? `${m.code ? m.code + ' ' : ''}${m.title}` : 'Module'}
        />
        <Link to="/modules" className="text-sm text-brand-700 hover:underline">
          ← All modules
        </Link>
      </div>

      <Section number={8} title="Module Context">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput
            label="Module title"
            value={m.title}
            onChange={(title) => patch({ title })}
            className="sm:col-span-2"
          />
          <TextInput label="Module code" value={m.code} onChange={(code) => patch({ code })} />
          <NumberInput
            label="Stage"
            value={m.stage}
            min={1}
            max={stages}
            onChange={(stage) => patch({ stage: Math.min(stages, Math.max(1, Math.round(stage))) })}
          />
          <TextInput label="Credits" value={m.credits} onChange={(credits) => patch({ credits })} />
          <TextInput
            label="Module leader"
            value={m.leader}
            onChange={(leader) => patch({ leader })}
          />
          <TextInput
            label="Programme(s)"
            value={m.programmes}
            onChange={(programmes) => patch({ programmes })}
            className="sm:col-span-2"
            hint="Other programmes that share this module, if any."
          />
        </div>
        <KeyQuestion>{MODULE_CONTEXT.keyQuestion}</KeyQuestion>
        <TextArea
          label="Module team reflection"
          value={m.contextReflection}
          onChange={(contextReflection) => patch({ contextReflection })}
        />
      </Section>

      <Section number={9} title="Module Learning Outcomes" intro={LEARNING_OUTCOMES.instruction}>
        <Consider title="For each outcome ask" items={LEARNING_OUTCOMES.askEach} open />
        <div className="space-y-4">
          {m.learningOutcomes.map((lo, i) => (
            <div key={lo.id} className="space-y-3 rounded-md border border-slate-200 p-3">
              <div className="flex items-start gap-2">
                <span className="mt-2 text-sm font-semibold text-slate-500">LO{i + 1}</span>
                <TextArea
                  label="Learning outcome"
                  rows={2}
                  value={lo.text}
                  onChange={(text) =>
                    update((r) => {
                      const t = r.modules
                        .find((x) => x.id === m.id)
                        ?.learningOutcomes.find((x) => x.id === lo.id)
                      if (t) t.text = text
                    })
                  }
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  className="mt-6"
                  onClick={() =>
                    patch({ learningOutcomes: m.learningOutcomes.filter((x) => x.id !== lo.id) })
                  }
                  title="Remove outcome"
                >
                  ×
                </Button>
              </div>
              <RatingScale
                label="Outcome"
                options={OUTCOME_REVIEW}
                value={lo.rating}
                onChange={(rating) =>
                  update((r) => {
                    const t = r.modules
                      .find((x) => x.id === m.id)
                      ?.learningOutcomes.find((x) => x.id === lo.id)
                    if (t) t.rating = rating
                  })
                }
              />
              <TextArea
                label="Comments/actions"
                rows={2}
                value={lo.comments}
                onChange={(comments) =>
                  update((r) => {
                    const t = r.modules
                      .find((x) => x.id === m.id)
                      ?.learningOutcomes.find((x) => x.id === lo.id)
                    if (t) t.comments = comments
                  })
                }
              />
            </div>
          ))}
        </div>
        <Button
          onClick={() => patch({ learningOutcomes: [...m.learningOutcomes, newLearningOutcome()] })}
        >
          + Add learning outcome
        </Button>
      </Section>

      <Section number={10} title="Learning & Teaching Design">
        <KeyQuestion>{LEARNING_TEACHING.keyQuestion}</KeyQuestion>
        <Consider items={LEARNING_TEACHING.consider} open />
        <RatingScale
          label="Rating"
          options={QUALITY}
          value={m.ltRating}
          onChange={(ltRating) => patch({ ltRating })}
        />
        <TextArea
          label="Actions"
          value={m.ltActions}
          onChange={(ltActions) => patch({ ltActions })}
        />
      </Section>

      <Section
        number={11}
        title="Assessments"
        intro="Complete the assessment review (sections 11–16) for each assessment within the module."
      >
        {m.assessments.length === 0 ? (
          <p className="text-sm text-slate-500">No assessments yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100 rounded-md border border-slate-200">
            {m.assessments.map((a) => {
              const c = assessmentCompleteness(a)
              const flag = flagLevel(a)
              return (
                <li
                  key={a.id}
                  className="flex flex-wrap items-center justify-between gap-2 px-3 py-2"
                >
                  <div className="min-w-0">
                    <Link
                      to={`/modules/${m.id}/assessments/${a.id}`}
                      className="font-medium text-brand-700 hover:underline"
                    >
                      {a.title || 'Untitled assessment'}
                    </Link>
                    <p className="text-xs text-slate-500">
                      {[
                        a.type,
                        a.weighting && `${a.weighting}%`,
                        a.semester && `Semester ${a.semester}`,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                      {' · '}
                      {c.done}/{c.total} complete
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <ScalePill options={AI_POSITIONS} value={a.position} />
                    <ScalePill options={VULNERABILITY} value={a.vulnerability} />
                    <ScalePill options={ASSURANCE} value={a.assurance} />
                    {flag === 'priority' && <Pill tone={3}>Priority</Pill>}
                    <Button
                      variant="ghost"
                      onClick={() => {
                        if (confirm(`Delete "${a.title || 'Untitled assessment'}"?`))
                          removeAssessment(m.id, a.id)
                      }}
                      title="Delete assessment"
                    >
                      ×
                    </Button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
        <Button
          variant="primary"
          onClick={() => navigate(`/modules/${m.id}/assessments/${addAssessment(m.id)}`)}
        >
          + Add assessment
        </Button>
      </Section>
    </>
  )
}

function ScalePill({
  options,
  value,
}: {
  options: readonly { value: string; label: string; tone: number }[]
  value: string
}) {
  if (!value) return <EmptyPill>—</EmptyPill>
  const o = options.find((x) => x.value === value)
  return <Pill tone={o?.tone ?? 1}>{optionLabel(options, value)}</Pill>
}
