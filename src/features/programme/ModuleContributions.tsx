import { useState } from 'react'
import { Button, Callout, Disclosure, FilePicker, Section, TextArea } from '../../components/fields'
import { optionLabel } from '../../content/scales'
import {
  AI_ROLES,
  ASSESSMENT_ACTIONS,
  ASSESSMENT_CONFIDENCE,
  LT_OPPORTUNITIES,
  MODULE_ALIGNMENT,
  OUTCOMES_APPROPRIATE,
  RESPONSIBLE_ENGAGEMENT,
} from '../../content/v2/scales'
import {
  applyContribution,
  matchContribution,
  moduleContributionPacket,
  removeContribution,
} from '../../logic/v2/exchange'
import { assessmentName, moduleTitle } from '../../logic/v2/moduleSummary'
import type {
  ModuleContribution,
  ModuleContributionPacket,
  ModuleReview,
} from '../../model/v2/schema'
import { contributionFromImport } from '../../store/exchangeImport'
import { parseImport } from '../../store/importV2'
import { loadReview } from '../../store/library'
import { useWorkspace } from '../../store/workspace'
import { confirmImport } from '../review/confirmImport'
import { useProgramme } from './useProgramme'

const KEPT = 'Your programme notes on this module are kept.'

export function ModuleContributions() {
  const { review: r, edit } = useProgramme()
  const replace = useWorkspace((s) => s.replace)
  const storage = useWorkspace((s) => s.storage)
  const entries = useWorkspace((s) => s.entries)
  const [message, setMessage] = useState<{ text: string; tone: 'ok' | 'error' } | null>(null)

  const add = (packet: ModuleContributionPacket) => {
    const held = r.moduleContributions.find((c) => c.sourceReviewId === packet.sourceReviewId)
    const { apply, message } = confirmImport(
      matchContribution(r, packet),
      moduleTitle(packet.snapshot),
      held?.importedAt,
      KEPT,
    )
    if (apply) replace(applyContribution(r, packet))
    setMessage({ text: message, tone: 'ok' })
  }

  const fromFile = (text: string) => {
    const result = contributionFromImport(parseImport(text))
    if (!result.ok) setMessage({ text: result.error, tone: 'error' })
    else add(result.packet)
  }

  const savedModules = entries.filter((e) => e.kind === 'module')

  return (
    <>
      <p className="max-w-3xl text-sm text-slate-600">
        Module teams can share the findings of their Module AI Integration Review with the programme
        team. Contributions are shown here for discussion. They are the module teams’ own
        observations and proposals, not programme decisions, and importing them never changes the
        module review or the rest of this programme review.
      </p>

      <Section title="Add module contributions">
        <div className="flex flex-wrap gap-2">
          <FilePicker
            variant="primary"
            label="Import a module contribution file"
            onText={fromFile}
            onError={(text) => setMessage({ text, tone: 'error' })}
          />
        </div>
        {message && (
          <p
            role={message.tone === 'error' ? 'alert' : 'status'}
            className={`rounded-md px-3 py-2 text-sm ${message.tone === 'error' ? 'bg-rose-50 text-rose-800' : 'bg-brand-50 text-brand-800'}`}
          >
            {message.text}
          </p>
        )}
        {savedModules.length > 0 && (
          <Disclosure
            summary={`Add from module reviews saved in this browser (${savedModules.length})`}
          >
            <ul className="divide-y divide-slate-100">
              {savedModules.map((e) => {
                const linked = r.moduleContributions.find((c) => c.sourceReviewId === e.id)
                return (
                  <li key={e.id} className="flex flex-wrap items-center gap-3 py-2">
                    <span className="min-w-0 flex-1 truncate">
                      {[e.code, e.title].filter(Boolean).join(' ') || 'Untitled module'}
                    </span>
                    <Button
                      onClick={() => {
                        const m = loadReview(storage, e.id) as ModuleReview | undefined
                        if (m) add(moduleContributionPacket(m, m.updatedAt))
                      }}
                    >
                      {linked ? 'Update' : 'Add'}
                    </Button>
                  </li>
                )
              })}
            </ul>
          </Disclosure>
        )}
      </Section>

      {r.moduleContributions.length === 0 ? (
        <Callout title="No module contributions yet" tone="note">
          <p>
            This programme review can be completed without them. Module contributions can be added
            at any time, and having none does not indicate a weakness in the programme.
          </p>
        </Callout>
      ) : (
        <Section title={`Module contributions (${r.moduleContributions.length})`}>
          <ol aria-label="Module contributions" className="space-y-3">
            {[...r.moduleContributions]
              .sort(
                (a, b) =>
                  a.snapshot.stage - b.snapshot.stage ||
                  moduleTitle(a.snapshot).localeCompare(moduleTitle(b.snapshot)),
              )
              .map((c) => (
                <li key={c.sourceReviewId}>
                  <ContributionCard
                    c={c}
                    onNotes={(programmeNotes) =>
                      edit((d) => {
                        const x = d.moduleContributions.find(
                          (y) => y.sourceReviewId === c.sourceReviewId,
                        )
                        if (x) x.programmeNotes = programmeNotes
                      })
                    }
                    onRemove={() => {
                      if (
                        confirm(
                          `Remove ${moduleTitle(c.snapshot)} from this programme review? The module review itself is not affected.`,
                        )
                      )
                        replace(removeContribution(r, c.sourceReviewId))
                    }}
                  />
                </li>
              ))}
          </ol>
        </Section>
      )}
    </>
  )
}

function ContributionCard({
  c,
  onNotes,
  onRemove,
}: {
  c: ModuleContribution
  onNotes: (v: string) => void
  onRemove: () => void
}) {
  const s = c.snapshot
  const roles = [
    ...new Set(s.assessments.map((a) => optionLabel(AI_ROLES, a.aiRole)).filter(Boolean)),
  ]
  const discussion = [
    s.programmeDiscussion.trim(),
    ...s.assessments
      .map((a, i) => ({ a, i }))
      .filter(({ a }) => a.action === 'discuss')
      .map(({ a, i }) => `${assessmentName(a, i)}: discuss with programme team`),
    s.alignment && s.alignment !== 'yes'
      ? `Alignment: ${optionLabel(MODULE_ALIGNMENT, s.alignment)}`
      : '',
  ].filter(Boolean)

  return (
    <article className="rounded-md border border-slate-200 p-4">
      <header className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h3 className="font-semibold text-slate-900">{moduleTitle(s)}</h3>
        <span className="text-sm text-slate-500">Stage {s.stage}</span>
        <span className="text-xs text-slate-500">
          {c.origin === 'v1-migration' ? 'Brought in from the previous version' : 'Imported'}{' '}
          {new Date(c.importedAt).toLocaleDateString()} · module review last changed{' '}
          {new Date(c.revision).toLocaleDateString()}
        </span>
      </header>
      <dl className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
        <Item label="Assessment AI positions">{roles.join(', ') || 'Not recorded'}</Item>
        <Item label="Confidence in learning assurance">
          {s.assessments.length
            ? s.assessments
                .map(
                  (a, i) =>
                    `${assessmentName(a, i)}: ${optionLabel(ASSESSMENT_CONFIDENCE, a.confidence) || 'not answered'}`,
                )
                .join('; ')
            : 'No assessments listed'}
        </Item>
        <Item label="Proposed actions">
          {[
            ...s.nextSteps.map((n) => n.text),
            ...s.assessments
              .map((a, i) => ({ a, i }))
              .filter(({ a }) => a.action && a.action !== 'maintain' && a.action !== 'discuss')
              .map(
                ({ a, i }) =>
                  `${assessmentName(a, i)}: ${optionLabel(ASSESSMENT_ACTIONS, a.action)}`,
              ),
          ].join('; ') || 'None recorded'}
        </Item>
        <Item label="Matters for programme discussion">
          {discussion.join('; ') || 'None noted'}
        </Item>
        <Item label="Contribution to the integration statement" wide>
          {s.contribution.trim() || 'Not written yet'}
        </Item>
      </dl>
      <div className="mt-3 space-y-3">
        <Disclosure summary="See the full module findings">
          <dl className="space-y-2 text-sm">
            <Item label="Learning outcomes remain appropriate?">
              {optionLabel(OUTCOMES_APPROPRIATE, s.outcomesAppropriate) || 'Not answered'}
              {s.outcomesChanges.trim() && ` — ${s.outcomesChanges.trim()}`}
            </Item>
            <Item label="Teaching and learning opportunities">
              {optionLabel(LT_OPPORTUNITIES, s.ltOpportunities) || 'Not answered'}
            </Item>
            <Item label="Students supported to engage with AI critically and responsibly">
              {optionLabel(RESPONSIBLE_ENGAGEMENT, s.responsibleEngagement) || 'Not answered'}
              {s.ltEnhance.trim() && ` — ${s.ltEnhance.trim()}`}
            </Item>
            {s.assessments.map((a, i) => (
              <Item key={a.id} label={`Assessment: ${assessmentName(a, i)}`}>
                {[
                  [a.type, a.weighting && `${a.weighting}%`].filter(Boolean).join(', '),
                  optionLabel(AI_ROLES, a.aiRole),
                  optionLabel(ASSESSMENT_CONFIDENCE, a.confidence),
                  optionLabel(ASSESSMENT_ACTIONS, a.action),
                  a.rationale.trim(),
                ]
                  .filter(Boolean)
                  .join(' · ') || 'Not answered'}
              </Item>
            ))}
            <Item label="What is working well">{s.workingWell.trim() || '—'}</Item>
            <Item label="What might be enhanced">{s.enhance.trim() || '—'}</Item>
            {s.associatedProgrammes.trim() && (
              <Item label="Associated programmes">{s.associatedProgrammes}</Item>
            )}
          </dl>
        </Disclosure>
        <TextArea
          label="Programme team notes (optional, kept with this programme review only)"
          value={c.programmeNotes}
          onChange={onNotes}
          rows={2}
        />
        <div className="flex justify-end">
          <button
            type="button"
            className="rounded-md px-3 py-1.5 text-sm text-rose-700 hover:bg-rose-50"
            onClick={onRemove}
          >
            Remove from this programme review
          </button>
        </div>
      </div>
    </article>
  )
}

function Item({
  label,
  children,
  wide,
}: {
  label: string
  children: React.ReactNode
  wide?: boolean
}) {
  return (
    <div className={wide ? 'sm:col-span-2' : ''}>
      <dt className="font-medium text-slate-800">{label}</dt>
      <dd className="whitespace-pre-line text-slate-700">{children}</dd>
    </div>
  )
}
