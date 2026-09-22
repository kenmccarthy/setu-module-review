import { Link, Navigate, useParams } from 'react-router-dom'
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
  AI_POSITIONS,
  ASSESSMENT_TYPES,
  ASSURANCE,
  PROCESS_VISIBILITY,
  QUALITY,
  SUSTAINABILITY,
  VULNERABILITY,
} from '../../content/scales'
import {
  AI_CAN_DO,
  ASSURANCE_EVIDENCE,
  EQUITY_CONSIDERATIONS,
  HUMAN_AGENCY_ASPECTS,
  PRACTICALITY_CONSIDERATIONS,
  PROCESS_VISIBILITY_APPROACHES,
  PROTECTED_CAPABILITIES,
} from '../../content/capabilities'
import { useModule, useReviewStore } from '../../store/reviewStore'
import { flagLevel } from '../../logic/flags'
import {
  Callout,
  CapabilityPicker,
  CheckList,
  Consider,
  Field,
  KeyQuestion,
  PageTitle,
  RatingScale,
  Section,
  TextArea,
  TextInput,
  inputClass,
} from '../../components/fields'

export function AssessmentPage() {
  const { moduleId, assessmentId } = useParams()
  const module = useModule(moduleId)
  const updateAssessment = useReviewStore((s) => s.updateAssessment)
  const assessment = module?.assessments.find((a) => a.id === assessmentId)
  if (!module) return <Navigate to="/modules" replace />
  if (!assessment) return <Navigate to={`/modules/${module.id}`} replace />
  const a = assessment
  const patch = (p: Partial<typeof a>) => updateAssessment(module.id, a.id, p)
  const flag = flagLevel(a)
  const typeIsPreset = a.type !== 'Other' && ASSESSMENT_TYPES.includes(a.type as never)

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <PageTitle
          helpAnchor="part-b"
          part={`Part B – ${module.code ? module.code + ' ' : ''}${module.title || 'Module'}`}
          title={a.title || 'Assessment'}
        />
        <Link to={`/modules/${module.id}`} className="text-sm text-brand-700 hover:underline">
          ← Back to module
        </Link>
      </div>

      {flag === 'priority' && (
        <Callout title="Prioritised for review" tone="warn">
          <p>
            This assessment is rated High/Critical for AI vulnerability and Low for learning
            assurance. The specification recommends that such assessments are prioritised for
            review.
          </p>
        </Callout>
      )}

      <Section number={11} title="Assessment Review">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <TextInput
            label="Assessment title"
            value={a.title}
            onChange={(title) => patch({ title })}
            className="sm:col-span-2"
          />
          <TextInput
            label="Semester"
            value={a.semester}
            onChange={(semester) => patch({ semester })}
            placeholder="e.g. 1"
          />
          <TextInput
            label="Weighting (%)"
            value={a.weighting}
            onChange={(weighting) => patch({ weighting })}
            placeholder="e.g. 40"
          />
          <Field label="Assessment type" className="sm:col-span-2">
            {(id) => (
              <div className="flex gap-2">
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
              </div>
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

        <h3 className="font-semibold text-slate-900">Assessment Purpose</h3>
        <KeyQuestion>{ASSESSMENT_REVIEW.purpose.question}</KeyQuestion>
        {module.learningOutcomes.length > 0 ? (
          <CheckList
            label="Learning outcomes evidenced"
            options={module.learningOutcomes.map((lo, i) => ({
              id: lo.id,
              label: `LO${i + 1}: ${lo.text || '(no text)'}`,
            }))}
            value={a.outcomeIds}
            onChange={(outcomeIds) => patch({ outcomeIds })}
            columns={1}
          />
        ) : (
          <p className="text-sm text-slate-500">
            Add learning outcomes to the module (section 9) to link them here.
          </p>
        )}
        <TextArea
          label={ASSESSMENT_REVIEW.purpose.prompt}
          value={a.purpose}
          onChange={(purpose) => patch({ purpose })}
        />

        <h3 className="font-semibold text-slate-900">AI Capability</h3>
        <KeyQuestion>{ASSESSMENT_REVIEW.aiCapability.question}</KeyQuestion>
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

        <h3 className="font-semibold text-slate-900">AI Vulnerability</h3>
        <KeyQuestion>{ASSESSMENT_REVIEW.vulnerability.question}</KeyQuestion>
        <RatingScale
          options={VULNERABILITY}
          value={a.vulnerability}
          onChange={(vulnerability) => patch({ vulnerability })}
          showDescriptions
        />
        <TextArea
          label="Reason for judgement"
          value={a.vulnerabilityReason}
          onChange={(vulnerabilityReason) => patch({ vulnerabilityReason })}
        />

        <h3 className="font-semibold text-slate-900">Learning Assurance</h3>
        <KeyQuestion>{ASSESSMENT_REVIEW.assurance.question}</KeyQuestion>
        <CheckList
          label="Sources of evidence present in this assessment"
          options={ASSURANCE_EVIDENCE}
          value={a.assuranceEvidence}
          onChange={(assuranceEvidence) => patch({ assuranceEvidence })}
        />
        <RatingScale
          label="Rate"
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

        <h3 className="font-semibold text-slate-900">Intended AI Position</h3>
        <KeyQuestion>{ASSESSMENT_REVIEW.position.question}</KeyQuestion>
        <RatingScale
          options={AI_POSITIONS}
          value={a.position}
          onChange={(position) => patch({ position })}
          showDescriptions
        />
        <Callout title="Important reflection">
          <p>{ASSESSMENT_REVIEW.position.reflection}</p>
          <p>{ASSESSMENT_REVIEW.position.note}</p>
        </Callout>
        <TextArea
          label="Why is this the appropriate position?"
          value={a.positionRationale}
          onChange={(positionRationale) => patch({ positionRationale })}
        />
        <TextInput
          label="AI capability developed"
          hint="If AI use is part of this assessment, which AI capability does it develop? (Shown in the programme portfolio.)"
          value={a.aiCapabilityDeveloped}
          onChange={(aiCapabilityDeveloped) => patch({ aiCapabilityDeveloped })}
        />
      </Section>

      <Section number={12} title="Human Agency">
        <KeyQuestion>{HUMAN_AGENCY.keyQuestion}</KeyQuestion>
        <Consider items={HUMAN_AGENCY_ASPECTS.map((x) => `${x};`)} />
        <CapabilityPicker
          label="Protected human capability/capabilities"
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
        <RatingScale
          label={HUMAN_AGENCY.ask}
          options={AGREEMENT}
          value={a.humanAgencyEvidence}
          onChange={(humanAgencyEvidence) => patch({ humanAgencyEvidence })}
        />
      </Section>

      <Section number={13} title="Process Visibility">
        <KeyQuestion>{PROCESS_VISIBILITY_SECTION.keyQuestion}</KeyQuestion>
        <CheckList
          label="Potential approaches (tick those used or proposed)"
          options={PROCESS_VISIBILITY_APPROACHES}
          value={a.processApproaches}
          onChange={(processApproaches) => patch({ processApproaches })}
        />
        <RatingScale
          label="Decision"
          options={PROCESS_VISIBILITY}
          value={a.processDecision}
          onChange={(processDecision) => patch({ processDecision })}
        />
        <TextArea
          label="Proposed action"
          value={a.processAction}
          onChange={(processAction) => patch({ processAction })}
        />
      </Section>

      <Section number={14} title="Authenticity and Future Relevance">
        <KeyQuestion>{AUTHENTICITY.keyQuestion}</KeyQuestion>
        <Consider items={AUTHENTICITY.consider} open />
        <RatingScale
          label="Rating"
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
      </Section>

      <Section number={15} title="Equity, Access and Inclusion">
        <KeyQuestion>{EQUITY.keyQuestion}</KeyQuestion>
        <Consider items={EQUITY_CONSIDERATIONS.map((x) => `${x};`)} />
        <TextArea
          label="Issues identified"
          value={a.equityIssues}
          onChange={(equityIssues) => patch({ equityIssues })}
        />
        <TextArea
          label="Actions required"
          value={a.equityActions}
          onChange={(equityActions) => patch({ equityActions })}
        />
      </Section>

      <Section number={16} title="Practicality and Sustainability">
        <KeyQuestion>{PRACTICALITY.keyQuestion}</KeyQuestion>
        <Consider items={PRACTICALITY_CONSIDERATIONS.map((x) => `${x};`)} />
        <Callout title="Important">
          {PRACTICALITY.important.map((t) => (
            <p key={t}>{t}</p>
          ))}
        </Callout>
        <RatingScale
          label="Rating"
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
      </Section>

      <div className="flex justify-end">
        <Link to={`/modules/${module.id}`} className="text-sm text-brand-700 hover:underline">
          ← Back to module
        </Link>
      </div>
    </>
  )
}
