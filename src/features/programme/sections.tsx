import { useMemo } from 'react'
import {
  CapabilityPicker,
  Choice,
  Disclosure,
  KeyQuestion,
  ListEditor,
  NumberInput,
  Section,
  TextArea,
  TextInput,
} from '../../components/fields'
import { ProgressionMap } from '../../components/ProgressionMap'
import { progressionKey } from '../../logic/v2/progression'
import { HUMAN_AI_CAPABILITIES, PROTECTED_CAPABILITIES } from '../../content/capabilities'
import {
  CAPABILITIES,
  COHERENCE,
  CURRICULUM,
  PRIORITIES,
  PROGRAMME_CONTEXT,
  PROGRESSION,
} from '../../content/v2/programme'
import {
  ADDRESSED,
  AI_ROLES,
  ASSESSMENT_ACTIONS,
  ASSESSMENT_CONFIDENCE,
  COHERENCE_PROMPTS,
  COORDINATION,
  OPPORTUNITY_CONFIDENCE,
  PROGRESSION_CAPABILITIES_V2,
} from '../../content/v2/scales'
import { optionLabel } from '../../content/scales'
import { programmeLegacy } from '../../logic/v2/legacy'
import { programmePromptsPacket } from '../../logic/v2/exchange'
import { MAX_PRIORITIES } from '../../model/v2/defaults'
import { downloadJson, reviewFileName } from '../../store/download'
import { LegacyPanel } from '../review/LegacyPanel'
import { useProgramme } from './useProgramme'

function useLegacy() {
  const { review } = useProgramme()
  return useMemo(() => programmeLegacy(review), [review])
}

export function ProgrammeContext() {
  const { review: r, set } = useProgramme()
  return (
    <>
      <Section title="About the programme" intro={PROGRAMME_CONTEXT.lede}>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput
            label="Programme title"
            value={r.title}
            onChange={(title) => set({ title })}
            className="sm:col-span-2"
          />
          <TextInput
            label="NFQ level"
            value={r.nfqLevel}
            onChange={(nfqLevel) => set({ nfqLevel })}
            placeholder="e.g. 8"
          />
          <NumberInput
            label="Number of stages / years"
            hint={PROGRAMME_CONTEXT.stagesHint}
            value={r.stages}
            min={1}
            max={8}
            onChange={(n) => set({ stages: Math.min(8, Math.max(1, Math.round(n))) })}
          />
          <TextInput
            label="Programme coordinator"
            value={r.coordinator}
            onChange={(coordinator) => set({ coordinator })}
          />
          <TextInput
            label="Faculty"
            value={r.academicUnit}
            onChange={(academicUnit) => set({ academicUnit })}
          />
          <TextInput
            label="Date of review"
            type="date"
            value={r.reviewDate}
            onChange={(reviewDate) => set({ reviewDate })}
          />
          <TextArea
            label="Programme team involved in the review"
            value={r.team}
            onChange={(team) => set({ team })}
            rows={2}
            className="sm:col-span-2"
          />
        </div>
      </Section>
      <Section title="AI and our discipline">
        <TextArea
          label={PROGRAMME_CONTEXT.disciplineQuestion}
          hint={PROGRAMME_CONTEXT.disciplineHint}
          value={r.disciplineReflection}
          onChange={(disciplineReflection) => set({ disciplineReflection })}
          rows={4}
        />
      </Section>
      {r.legacy && (
        <Disclosure summary="Notes on what was carried over from the previous version">
          <ul className="list-disc space-y-1 pl-5 text-slate-700">
            {r.legacy.notes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </Disclosure>
      )}
    </>
  )
}

export function ProgrammeCapabilities() {
  const { review: r, set } = useProgramme()
  const legacy = useLegacy()
  return (
    <>
      <KeyQuestion>{CAPABILITIES.heading}</KeyQuestion>
      <p className="max-w-3xl text-sm text-slate-600">{CAPABILITIES.intro}</p>
      <Section title="Independently of AI">
        <TextArea
          label={CAPABILITIES.q1}
          value={r.independentText}
          onChange={(independentText) => set({ independentText })}
        />
        <Disclosure
          summary={`${CAPABILITIES.suggestions}${r.independentCapabilities.length ? ` (${r.independentCapabilities.length} selected)` : ''}`}
          open={r.independentCapabilities.length > 0}
        >
          <CapabilityPicker
            presets={PROTECTED_CAPABILITIES}
            value={r.independentCapabilities}
            onChange={(independentCapabilities) => set({ independentCapabilities })}
          />
        </Disclosure>
      </Section>
      <Section title="With AI">
        <TextArea
          label={CAPABILITIES.q2}
          value={r.aiEnabledText}
          onChange={(aiEnabledText) => set({ aiEnabledText })}
        />
        <Disclosure
          summary={`${CAPABILITIES.suggestions}${r.aiEnabledCapabilities.length ? ` (${r.aiEnabledCapabilities.length} selected)` : ''}`}
          open={r.aiEnabledCapabilities.length > 0}
        >
          <CapabilityPicker
            presets={HUMAN_AI_CAPABILITIES}
            value={r.aiEnabledCapabilities}
            onChange={(aiEnabledCapabilities) => set({ aiEnabledCapabilities })}
          />
        </Disclosure>
      </Section>
      <Section title="Programme learning outcomes">
        <Choice
          label={CAPABILITIES.q3}
          options={ADDRESSED}
          value={r.outcomesAdequate}
          onChange={(outcomesAdequate) => set({ outcomesAdequate })}
        />
        <TextArea
          label={CAPABILITIES.comments}
          value={r.outcomesComments}
          onChange={(outcomesComments) => set({ outcomesComments })}
          rows={3}
        />
      </Section>
      <LegacyPanel items={legacy.capabilities} />
    </>
  )
}

export function ProgrammeProgression() {
  const { review: r, set, edit } = useProgramme()
  const legacy = useLegacy()
  const toggle = (capabilityId: string, stage: number, phase: string) =>
    edit((d) => {
      const key = progressionKey(capabilityId, stage)
      const cur = d.progression[key] ?? []
      d.progression[key] = cur.includes(phase) ? cur.filter((x) => x !== phase) : [...cur, phase]
      d.progressionUnconfirmed = d.progressionUnconfirmed.filter((k) => k !== key)
    })
  return (
    <>
      <KeyQuestion>{PROGRESSION.heading}</KeyQuestion>
      <p className="max-w-3xl text-sm text-slate-600">{PROGRESSION.intro}</p>
      <Section title="Progression map" intro={PROGRESSION.instruction}>
        {r.progressionUnconfirmed.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            <p className="flex-1">{PROGRESSION.unconfirmed}</p>
            <button
              type="button"
              className="rounded-md border border-amber-400 bg-white px-3 py-1 font-medium hover:bg-amber-100"
              onClick={() => set({ progressionUnconfirmed: [] })}
            >
              Confirm carried-over cells
            </button>
          </div>
        )}
        <ProgressionMap
          capabilities={PROGRESSION_CAPABILITIES_V2}
          stages={r.stages}
          value={r.progression}
          onToggle={toggle}
          unconfirmed={r.progressionUnconfirmed}
        />
        <p className="text-xs text-slate-500">The number of stages is set in Programme context.</p>
      </Section>
      <Section title="Reflection">
        <Choice
          label={PROGRESSION.reflection}
          options={ADDRESSED}
          value={r.progressionCoherent}
          onChange={(progressionCoherent) => set({ progressionCoherent })}
        />
        <TextArea
          label={PROGRESSION.gaps}
          value={r.progressionGaps}
          onChange={(progressionGaps) => set({ progressionGaps })}
          rows={3}
        />
      </Section>
      <LegacyPanel items={legacy.progression} />
    </>
  )
}

export function ProgrammeCurriculum() {
  const { review: r, set } = useProgramme()
  const legacy = useLegacy()
  return (
    <>
      <KeyQuestion>{CURRICULUM.heading}</KeyQuestion>
      <p className="max-w-3xl text-sm text-slate-600">{CURRICULUM.intro}</p>
      <Section title="Reflection">
        <Choice
          label={CURRICULUM.q1}
          options={OPPORTUNITY_CONFIDENCE}
          value={r.opportunitiesConfidence}
          onChange={(opportunitiesConfidence) => set({ opportunitiesConfidence })}
        />
        <Choice
          label={CURRICULUM.q2}
          options={ADDRESSED}
          value={r.assessmentBalance}
          onChange={(assessmentBalance) => set({ assessmentBalance })}
        />
        <TextArea
          label={CURRICULUM.q3}
          value={r.confidenceConcerns}
          onChange={(confidenceConcerns) => set({ confidenceConcerns })}
          rows={3}
        />
        <TextArea
          label={CURRICULUM.modules}
          value={r.modulesForConsideration}
          onChange={(modulesForConsideration) => set({ modulesForConsideration })}
          rows={3}
        />
      </Section>
      <Disclosure summary={`${CURRICULUM.overview} (optional)`}>
        <AssessmentOverview />
      </Disclosure>
      <LegacyPanel items={legacy.curriculum} />
    </>
  )
}

/** Assessments from linked module reviews: the module teams' positions, for discussion only. */
function AssessmentOverview() {
  const { review: r } = useProgramme()
  const rows = r.moduleContributions.flatMap((c) => c.snapshot.assessments.map((a) => ({ c, a })))
  if (!r.moduleContributions.length)
    return <p className="text-slate-600">{CURRICULUM.overviewEmpty}</p>
  return (
    <>
      <p className="text-slate-600">{CURRICULUM.overviewIntro}</p>
      {rows.length === 0 ? (
        <p className="text-slate-600">The linked module reviews do not list any assessments yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-slate-500">
              <tr className="border-b border-slate-200">
                <th scope="col" className="py-2 pr-3">
                  Module
                </th>
                <th scope="col" className="py-2 pr-3">
                  Stage
                </th>
                <th scope="col" className="py-2 pr-3">
                  Assessment
                </th>
                <th scope="col" className="py-2 pr-3">
                  Role of AI
                </th>
                <th scope="col" className="py-2 pr-3">
                  Confidence in learning
                </th>
                <th scope="col" className="py-2">
                  Proposed action
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ c, a }) => (
                <tr
                  key={`${c.sourceReviewId}:${a.id}`}
                  className="border-b border-slate-100 align-top"
                >
                  <td className="py-2 pr-3">
                    {[c.snapshot.code, c.snapshot.title].filter(Boolean).join(' ')}
                  </td>
                  <td className="py-2 pr-3">{c.snapshot.stage}</td>
                  <td className="py-2 pr-3">{a.title || 'Untitled assessment'}</td>
                  <td className="py-2 pr-3">{optionLabel(AI_ROLES, a.aiRole) || '—'}</td>
                  <td className="py-2 pr-3">
                    {optionLabel(ASSESSMENT_CONFIDENCE, a.confidence) || '—'}
                  </td>
                  <td className="py-2">{optionLabel(ASSESSMENT_ACTIONS, a.action) || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

export function ProgrammeCoherence() {
  const { review: r, set, edit } = useProgramme()
  const legacy = useLegacy()
  return (
    <>
      <KeyQuestion>{COHERENCE.heading}</KeyQuestion>
      <p className="max-w-3xl text-sm text-slate-600">{COHERENCE.intro}</p>
      <Section title={COHERENCE.prompts} intro={COHERENCE.promptHint}>
        <div className="space-y-2">
          {COHERENCE_PROMPTS.map((p) => {
            const note = r.coherenceNotes[p.id] ?? ''
            return (
              <Disclosure
                key={p.id}
                summary={`${p.label}${note.trim() ? ' ✓' : ''}`}
                open={!!note.trim()}
              >
                <TextArea
                  label={`Notes: ${p.label}`}
                  value={note}
                  onChange={(v) => edit((d) => void (d.coherenceNotes[p.id] = v))}
                  rows={3}
                />
              </Disclosure>
            )
          })}
        </div>
      </Section>
      <Section title="Our approach">
        <Choice
          label={COHERENCE.main}
          options={COORDINATION}
          value={r.coordination}
          onChange={(coordination) => set({ coordination })}
        />
        <TextArea
          label={COHERENCE.strengthen}
          value={r.strengthenApproach}
          onChange={(strengthenApproach) => set({ strengthenApproach })}
          rows={3}
        />
      </Section>
      <LegacyPanel items={legacy.coherence} />
    </>
  )
}

export function ProgrammePriorities() {
  const { review: r, set } = useProgramme()
  const legacy = useLegacy()
  const prompts = programmePromptsPacket(r)
  return (
    <>
      <KeyQuestion>{PRIORITIES.heading}</KeyQuestion>
      <Section title="Reflection">
        <TextArea
          label={PRIORITIES.strengths.label}
          hint={PRIORITIES.strengths.hint}
          value={r.strengths}
          onChange={(strengths) => set({ strengths })}
        />
        <TextArea
          label={PRIORITIES.opportunities.label}
          hint={PRIORITIES.opportunities.hint}
          value={r.opportunities}
          onChange={(opportunities) => set({ opportunities })}
        />
        <ListEditor
          label={PRIORITIES.priorities.label}
          hint={PRIORITIES.priorities.hint}
          value={r.priorities}
          onChange={(priorities) => set({ priorities })}
          max={MAX_PRIORITIES}
          addLabel="Add a priority"
          itemLabel="Priority"
        />
      </Section>
      <Section title={PRIORITIES.questions.label} intro={PRIORITIES.questions.hint}>
        <ListEditor
          label="Questions or prompts"
          value={r.moduleQuestions}
          onChange={(moduleQuestions) => set({ moduleQuestions })}
          addLabel="Add a question"
          itemLabel="Question"
        />
        <div className="space-y-2 rounded-md bg-slate-50 p-3 text-sm text-slate-700">
          <p>{PRIORITIES.exportHint}</p>
          <button
            type="button"
            disabled={!prompts.prompts.length}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 font-medium shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => downloadJson(reviewFileName(r, 'programme-prompts'), prompts)}
          >
            Export priorities and questions for module teams
          </button>
        </div>
      </Section>
      <LegacyPanel items={legacy.priorities} />
    </>
  )
}
