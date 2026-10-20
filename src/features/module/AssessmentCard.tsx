import {
  CapabilityPicker,
  CheckList,
  Choice,
  Disclosure,
  KeyQuestion,
  TextArea,
  TextInput,
  Field,
  inputClass,
} from '../../components/fields'
import {
  AI_CAN_DO,
  ASSURANCE_EVIDENCE,
  EQUITY_CONSIDERATIONS,
  HUMAN_AGENCY_ASPECTS,
  PRACTICALITY_CONSIDERATIONS,
  PROCESS_VISIBILITY_APPROACHES,
  PROTECTED_CAPABILITIES,
} from '../../content/capabilities'
import {
  ASSESSMENT_REVIEW,
  AUTHENTICITY,
  EQUITY,
  HUMAN_AGENCY,
  PRACTICALITY,
  PROCESS_VISIBILITY_SECTION,
} from '../../content/module'
import {
  AGREEMENT,
  ASSESSMENT_TYPES,
  ASSURANCE,
  PROCESS_VISIBILITY,
  QUALITY,
  SUSTAINABILITY,
  VULNERABILITY,
  optionLabel,
} from '../../content/scales'
import { ASSESSMENT } from '../../content/v2/module'
import { AI_ROLES, ASSESSMENT_ACTIONS, ASSESSMENT_CONFIDENCE } from '../../content/v2/scales'
import { assessmentAnswered, assessmentName } from '../../logic/v2/moduleSummary'
import type { AdvancedAssessment, ModuleAssessment } from '../../model/v2/schema'
import { useModuleReview } from './useModuleReview'

/** One assessment: identification, the three core questions, and optional detailed design. */
export function AssessmentCard({ index, open }: { index: number; open?: boolean }) {
  const { review: m, edit } = useModuleReview()
  const a = m.assessments[index]
  const patch = (p: Partial<ModuleAssessment>) =>
    edit((d) => void Object.assign(d.assessments[index], p))
  const adv = (p: Partial<AdvancedAssessment>) =>
    edit((d) => void Object.assign(d.assessments[index].advanced, p))
  const typeIsPreset = ASSESSMENT_TYPES.includes(a.type as never) && a.type !== 'Other'
  const name = assessmentName(a, index)
  const status = assessmentAnswered(a)
    ? [optionLabel(AI_ROLES, a.aiRole), optionLabel(ASSESSMENT_CONFIDENCE, a.confidence)].join(
        ' · ',
      )
    : 'Questions to answer'

  return (
    <details open={open} className="group rounded-lg border border-slate-200 bg-white shadow-sm">
      <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-3 gap-y-1 px-5 py-4">
        <span className="font-semibold text-slate-900">{name}</span>
        <span className="text-sm text-slate-500">
          {status}
          {assessmentAnswered(a) && <span className="sr-only"> (answered)</span>}
        </span>
        <span aria-hidden="true" className="ml-auto text-slate-400 group-open:rotate-180">
          ▾
        </span>
      </summary>
      <div className="space-y-5 border-t border-slate-200 px-5 py-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <TextInput
            label="Assessment title"
            value={a.title}
            onChange={(title) => patch({ title })}
            className="sm:col-span-2"
          />
          <TextInput
            label="Weighting % (optional)"
            value={a.weighting}
            onChange={(weighting) => patch({ weighting })}
            placeholder="e.g. 40"
          />
          <TextInput
            label="Semester (optional)"
            value={a.semester}
            onChange={(semester) => patch({ semester })}
            placeholder="e.g. 1"
          />
          <Field label="Assessment type (optional)" className="sm:col-span-2">
            {(id) => (
              <select
                id={id}
                className={inputClass}
                value={typeIsPreset ? a.type : a.type ? 'Other' : ''}
                onChange={(e) => patch({ type: e.target.value })}
              >
                <option value="">Select…</option>
                {ASSESSMENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            )}
          </Field>
          {!typeIsPreset && a.type !== '' && (
            <TextInput
              label="Describe the assessment type"
              value={a.type === 'Other' ? '' : a.type}
              onChange={(type) => patch({ type: type || 'Other' })}
              className="sm:col-span-2"
            />
          )}
        </div>

        <Choice
          label={`1. ${ASSESSMENT.role}`}
          options={AI_ROLES}
          value={a.aiRole}
          onChange={(aiRole) => patch({ aiRole })}
        />
        <Choice
          label={`2. ${ASSESSMENT.confidence}`}
          hint={ASSESSMENT.confidenceNote}
          options={ASSESSMENT_CONFIDENCE}
          value={a.confidence}
          onChange={(confidence) => patch({ confidence })}
        />
        <Choice
          label={`3. ${ASSESSMENT.action}`}
          options={ASSESSMENT_ACTIONS}
          value={a.action}
          onChange={(action) => patch({ action })}
        />
        <TextArea
          label={ASSESSMENT.rationale}
          value={a.rationale}
          onChange={(rationale) => patch({ rationale })}
          rows={3}
        />

        <Disclosure summary={ASSESSMENT.advanced}>
          <p className="text-slate-600">{ASSESSMENT.advancedIntro}</p>
          <AdvancedFields
            value={a.advanced}
            onChange={adv}
            outcomes={m.learningOutcomes.map((lo, i) => ({
              id: lo.id,
              label: `LO${i + 1}: ${lo.text || '(no text)'}`,
            }))}
          />
        </Disclosure>

        <div className="flex justify-end">
          <button
            type="button"
            className="rounded-md px-3 py-1.5 text-sm text-rose-700 hover:bg-rose-50"
            onClick={() => {
              if (confirm(`Remove “${name}” from this module review?`))
                edit((d) => void d.assessments.splice(index, 1))
            }}
          >
            Remove assessment
          </button>
        </div>
      </div>
    </details>
  )
}

function Sub({
  title,
  question,
  children,
}: {
  title: string
  question?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-3 border-t border-slate-100 pt-4 first:border-0 first:pt-0">
      <h4 className="font-semibold text-slate-900">{title}</h4>
      {question && <KeyQuestion>{question}</KeyQuestion>}
      {children}
    </div>
  )
}

/** The detailed v1 assessment parameters, unchanged in meaning, shown with neutral controls. */
function AdvancedFields({
  value: a,
  onChange: patch,
  outcomes,
}: {
  value: AdvancedAssessment
  onChange: (p: Partial<AdvancedAssessment>) => void
  outcomes: { id: string; label: string }[]
}) {
  return (
    <div className="space-y-4">
      <Sub title="Purpose" question={ASSESSMENT_REVIEW.purpose.question}>
        {outcomes.length > 0 && (
          <CheckList
            label="Learning outcomes evidenced"
            options={outcomes}
            value={a.outcomeIds}
            onChange={(outcomeIds) => patch({ outcomeIds })}
            columns={1}
          />
        )}
        <TextArea
          label={ASSESSMENT_REVIEW.purpose.prompt}
          value={a.purpose}
          onChange={(purpose) => patch({ purpose })}
          rows={3}
        />
      </Sub>
      <Sub title="AI capability" question={ASSESSMENT_REVIEW.aiCapability.question}>
        <CheckList
          label="Consider whether AI could:"
          options={AI_CAN_DO}
          value={a.aiCanDo}
          onChange={(aiCanDo) => patch({ aiCanDo })}
        />
        <TextArea
          label="Notes"
          rows={2}
          value={a.aiCanDoNotes}
          onChange={(aiCanDoNotes) => patch({ aiCanDoNotes })}
        />
      </Sub>
      <Sub title="Vulnerability" question={ASSESSMENT_REVIEW.vulnerability.question}>
        <Choice
          label="Vulnerability"
          options={VULNERABILITY}
          value={a.vulnerability}
          onChange={(vulnerability) => patch({ vulnerability })}
        />
        <TextArea
          label="Reason for judgement"
          rows={2}
          value={a.vulnerabilityReason}
          onChange={(vulnerabilityReason) => patch({ vulnerabilityReason })}
        />
      </Sub>
      <Sub title="Learning assurance evidence" question={ASSESSMENT_REVIEW.assurance.question}>
        <CheckList
          label="Sources of evidence present in this assessment"
          options={ASSURANCE_EVIDENCE}
          value={a.assuranceEvidence}
          onChange={(assuranceEvidence) => patch({ assuranceEvidence })}
        />
        <Choice
          label="Assurance"
          options={ASSURANCE}
          value={a.assurance}
          onChange={(assurance) => patch({ assurance })}
        />
        <TextArea
          label="Notes"
          rows={2}
          value={a.assuranceNotes}
          onChange={(assuranceNotes) => patch({ assuranceNotes })}
        />
      </Sub>
      <Sub title="Human agency" question={HUMAN_AGENCY.keyQuestion}>
        <CapabilityPicker
          label="Capabilities students should demonstrate themselves"
          hint={`For example: ${HUMAN_AGENCY_ASPECTS.slice(0, 4).join(', ')}.`}
          presets={PROTECTED_CAPABILITIES}
          value={a.protectedCapabilities}
          onChange={(protectedCapabilities) => patch({ protectedCapabilities })}
        />
        <TextArea
          label="Notes"
          rows={2}
          value={a.humanAgencyNotes}
          onChange={(humanAgencyNotes) => patch({ humanAgencyNotes })}
        />
        <Choice
          label={HUMAN_AGENCY.ask}
          options={AGREEMENT}
          value={a.humanAgencyEvidence}
          onChange={(humanAgencyEvidence) => patch({ humanAgencyEvidence })}
        />
      </Sub>
      <Sub title="Process visibility" question={PROCESS_VISIBILITY_SECTION.keyQuestion}>
        <CheckList
          label="Approaches used or proposed"
          options={PROCESS_VISIBILITY_APPROACHES}
          value={a.processApproaches}
          onChange={(processApproaches) => patch({ processApproaches })}
        />
        <Choice
          label="Decision"
          options={PROCESS_VISIBILITY}
          value={a.processDecision}
          onChange={(processDecision) => patch({ processDecision })}
        />
        <TextArea
          label="Proposed action"
          rows={2}
          value={a.processAction}
          onChange={(processAction) => patch({ processAction })}
        />
      </Sub>
      <Sub title="Authenticity" question={AUTHENTICITY.keyQuestion}>
        <Choice
          label="Authenticity and future relevance"
          options={QUALITY}
          value={a.authenticityRating}
          onChange={(authenticityRating) => patch({ authenticityRating })}
        />
        <TextArea
          label="Notes"
          rows={2}
          value={a.authenticityNotes}
          onChange={(authenticityNotes) => patch({ authenticityNotes })}
        />
      </Sub>
      <Sub title="Equity, access and inclusion" question={EQUITY.keyQuestion}>
        <p className="text-slate-600">Consider: {EQUITY_CONSIDERATIONS.join('; ')}.</p>
        <TextArea
          label="Issues identified"
          rows={2}
          value={a.equityIssues}
          onChange={(equityIssues) => patch({ equityIssues })}
        />
        <TextArea
          label="Actions required"
          rows={2}
          value={a.equityActions}
          onChange={(equityActions) => patch({ equityActions })}
        />
      </Sub>
      <Sub title="Practicality and sustainability" question={PRACTICALITY.keyQuestion}>
        <p className="text-slate-600">Consider: {PRACTICALITY_CONSIDERATIONS.join('; ')}.</p>
        <Choice
          label="Practicality"
          options={SUSTAINABILITY}
          value={a.practicalityRating}
          onChange={(practicalityRating) => patch({ practicalityRating })}
        />
        <TextArea
          label="Notes"
          rows={2}
          value={a.practicalityNotes}
          onChange={(practicalityNotes) => patch({ practicalityNotes })}
        />
      </Sub>
      <Sub title="AI capability developed">
        <TextInput
          label="If AI use is part of this assessment, which AI capability does it develop?"
          value={a.aiCapabilityDeveloped}
          onChange={(aiCapabilityDeveloped) => patch({ aiCapabilityDeveloped })}
        />
      </Sub>
    </div>
  )
}
