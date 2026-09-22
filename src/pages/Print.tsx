import { useReview } from '../store/reviewStore'
import {
  AI_POSITIONS,
  AGREEMENT,
  ASSURANCE,
  DASHBOARD_AREAS,
  OUTCOME_REVIEW,
  PROCESS_VISIBILITY,
  PROGRESSION_PHASES,
  QUALITY,
  SUSTAINABILITY,
  VULNERABILITY,
  optionLabel,
  type ProgressionPhase,
} from '../content/scales'
import { PROGRESSION_CAPABILITIES } from '../content/capabilities'
import { COHERENCE } from '../content/programme'
import { DISCUSSION_QUESTIONS } from '../content/synthesis'
import { portfolioRows } from '../logic/portfolio'
import { effectiveDashboard } from '../logic/dashboard'
import { detectPatterns } from '../logic/patterns'
import { generateSummary, actionText } from '../logic/summary'
import { fullStatement, generateEvidenceSummary } from '../logic/statement'
import { formatDate } from '../logic/text'
import { Button } from '../components/fields'

export function PrintPage() {
  const review = useReview()
  const p = review.programme
  const rows = portfolioRows(review)
  const dash = effectiveDashboard(review)
  const patterns = detectPatterns(review).filter(
    (x) => x.status === 'triggered' || x.status === 'possible',
  )
  const summary = generateSummary(review)
  const statement = fullStatement(review)
  const evidence = generateEvidenceSummary(review)
  const stages = Array.from({ length: p.stages }, (_, i) => i + 1)

  return (
    <div className="mx-auto max-w-4xl bg-white px-6 py-8 text-[13px] leading-relaxed text-slate-900 print:max-w-none print:px-0 print:py-0">
      <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-2 rounded-md border border-slate-200 bg-slate-50 p-3">
        <p className="text-sm text-slate-600">
          This page contains the full review. Use your browser's print dialog and choose "Save as
          PDF".
        </p>
        <Button variant="primary" onClick={() => window.print()}>
          Print / Save as PDF
        </Button>
      </div>

      <header className="mb-8 border-b-2 border-brand-600 pb-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">
          SETU · AI Programme & Module Review
        </p>
        <h1 className="text-2xl font-bold">{p.title || 'Programme AI Review'}</h1>
        <dl className="mt-2 grid grid-cols-2 gap-x-6 gap-y-0.5 text-xs text-slate-600 sm:grid-cols-3">
          <Meta label="NFQ level" value={p.nfqLevel} />
          <Meta label="Duration" value={p.duration} />
          <Meta label="Coordinator" value={p.coordinator} />
          <Meta label="Faculty" value={p.academicUnit} />
          <Meta label="Date of review" value={formatDate(p.reviewDate)} />
          <Meta label="Review team" value={p.team} />
        </dl>
      </header>

      {/* ---------- Summary first: the audience is programme review / AUR ---------- */}
      <H1>Programme AI Review Summary</H1>
      <Block title="Overall position">
        <p>{summary.overallPosition}</p>
      </Block>
      <List title="Key strengths" items={summary.keyStrengths.map((i) => i.text)} />
      <List
        title="Priority vulnerabilities"
        items={summary.priorityVulnerabilities.map((i) => i.text)}
      />
      <List
        title="Protected human capabilities identified"
        items={summary.protectedCapabilities.map((i) => i.text)}
      />
      <List
        title="AI-enabled graduate capabilities identified"
        items={summary.aiEnabledCapabilities.map((i) => i.text)}
      />
      <List
        title="Curriculum/AI capability gaps"
        items={summary.capabilityGaps.map((i) => i.text)}
      />
      <List
        title="Assessment portfolio observations"
        items={summary.portfolioObservations.map((i) => i.text)}
      />
      <List
        title="Modules/assessments prioritised for review"
        items={summary.prioritisedForReview.map((i) => i.text)}
      />
      <List title="Programme-level actions" items={summary.programmeActions.map((i) => i.text)} />
      <List title="Module-level actions" items={summary.moduleActions.map((i) => i.text)} />
      <Block title="Review date">
        <p>{summary.reviewDate || '—'}</p>
      </Block>

      <div className="print-break" />
      <H1>Programme AI Integration Statement</H1>
      {statement.map((s) => (
        <div key={s.heading} className="avoid-break mb-3">
          <H2>{s.heading}</H2>
          {s.paragraphs.map((para, i) => (
            <p key={i} className="mb-1.5">
              {para}
            </p>
          ))}
        </div>
      ))}
      <p className="text-xs text-slate-600">
        Date agreed by programme team: {formatDate(review.statement.agreedDate) || '—'} · Next
        review: {formatDate(review.statement.nextReviewDate) || '—'}
      </p>
      <H2>External Review Panel – Evidence Summary</H2>
      <Table
        head={['Area', 'Programme position', 'Supporting evidence']}
        rows={evidence.map((e) => [e.area, e.position, e.evidence])}
      />

      <div className="print-break" />
      <H1>Part A – Programme Review</H1>
      <H2>1. Programme Context</H2>
      <Block title="How is AI affecting the discipline, profession or employment contexts?">
        <Text value={p.disciplineReflection} />
      </Block>
      <H2>2. Graduate Capabilities</H2>
      <List
        title="A. Enduring human capabilities"
        items={p.enduringCapabilities.map((c) => c.label)}
        inline
      />
      <List
        title="B. Protected human capabilities"
        items={p.protectedCapabilities.map((c) => c.label)}
        inline
      />
      {p.protectedNotes && <p className="mb-2">{p.protectedNotes}</p>}
      <List
        title="C. Human-AI capabilities"
        items={p.humanAiCapabilities.map((c) => c.label)}
        inline
      />
      <Block title="Do the programme learning outcomes adequately reflect the capabilities graduates now require?">
        <p>
          <strong>
            {optionLabel(
              [...AGREEMENT, { value: 'discuss', label: 'Requires further discussion' }],
              p.ploCheckpoint,
            ) || '—'}
          </strong>
          {p.ploAction && ` — ${p.ploAction}`}
        </p>
      </Block>
      <H2>3. AI Capability Progression</H2>
      <Table
        head={['Capability', ...stages.map((s) => `Stage ${s}`)]}
        rows={PROGRESSION_CAPABILITIES.map((c) => [
          c.label,
          ...stages.map((s) =>
            (p.progression[`${c.id}:${s}`] ?? [])
              .map((ph) => optionLabel(PROGRESSION_PHASES, ph as ProgressionPhase))
              .join(', '),
          ),
        ])}
      />
      <p className="mb-2">
        <strong>Coherent progression:</strong> {optionLabel(QUALITY, p.progressionRating) || '—'}
      </p>
      <Text value={p.progressionNotes} />
      <H2>4–6. Programme Assessment Portfolio</H2>
      <Table
        small
        head={[
          'Stage',
          'Sem',
          'Module',
          'Assessment',
          'Weight',
          'Type',
          'AI position',
          'Vulnerability',
          'Assurance',
          'Protected capability',
          'AI capability developed',
        ]}
        rows={rows.map((r) => [
          String(r.stage),
          r.semester,
          r.moduleLabel,
          r.assessmentTitle + (r.flag === 'priority' ? ' ⚑' : ''),
          r.weighting && `${r.weighting}%`,
          r.type,
          optionLabel(AI_POSITIONS, r.position as never),
          optionLabel(VULNERABILITY, r.vulnerability as never),
          optionLabel(ASSURANCE, r.assurance as never),
          r.protectedCapability,
          r.aiCapabilityDeveloped,
        ])}
      />
      <p className="mb-2 text-xs text-slate-600">
        ⚑ Prioritised for review: High/Critical AI vulnerability with Low learning assurance.
      </p>
      <H2>7. Programme Coherence</H2>
      {COHERENCE.questions.map((q) =>
        p.coherenceAnswers[q.id] ? (
          <Block key={q.id} title={q.text}>
            <p>{p.coherenceAnswers[q.id]}</p>
          </Block>
        ) : null,
      )}
      <p className="mb-2">
        <strong>Overall programme coherence:</strong>{' '}
        {optionLabel(QUALITY, p.coherenceRating) || '—'}
      </p>
      <Text value={p.coherenceObservations} />

      <div className="print-break" />
      <H1>Part B – Module & Assessment Review</H1>
      {review.modules.length === 0 && <p className="text-slate-500">No modules reviewed.</p>}
      {[...review.modules]
        .sort((a, b) => a.stage - b.stage)
        .map((m) => (
          <div key={m.id} className="mb-6 border-t border-slate-300 pt-3">
            <H2>{[m.code, m.title || 'Untitled module'].filter(Boolean).join(' ')}</H2>
            <p className="mb-2 text-xs text-slate-600">
              Stage {m.stage}
              {m.credits && ` · ${m.credits} credits`}
              {m.leader && ` · Leader: ${m.leader}`}
              {m.programmes && ` · Programmes: ${m.programmes}`}
            </p>
            <Block title="8. Has Generative AI changed anything significant about what students need to learn or how they demonstrate it?">
              <Text value={m.contextReflection} />
            </Block>
            {m.learningOutcomes.length > 0 && (
              <>
                <H3>9. Module Learning Outcomes</H3>
                <Table
                  head={['#', 'Outcome', 'Review', 'Comments/actions']}
                  rows={m.learningOutcomes.map((lo, i) => [
                    `LO${i + 1}`,
                    lo.text,
                    optionLabel(OUTCOME_REVIEW, lo.rating),
                    lo.comments,
                  ])}
                />
              </>
            )}
            <Block title="10. Learning & Teaching Design">
              <p>
                <strong>{optionLabel(QUALITY, m.ltRating) || '—'}</strong>
                {m.ltActions && ` — ${m.ltActions}`}
              </p>
            </Block>
            {m.assessments.map((a) => (
              <div key={a.id} className="avoid-break mb-3 rounded border border-slate-200 p-3">
                <H3>
                  {a.title || 'Untitled assessment'}{' '}
                  <span className="font-normal text-slate-500">
                    {[
                      a.type,
                      a.weighting && `${a.weighting}%`,
                      a.semester && `Semester ${a.semester}`,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </span>
                </H3>
                <dl className="grid gap-x-4 gap-y-1 sm:grid-cols-2">
                  <KV k="Purpose" v={a.purpose} />
                  <KV
                    k="Learning outcomes"
                    v={a.outcomeIds
                      .map((id) => {
                        const i = m.learningOutcomes.findIndex((lo) => lo.id === id)
                        return i >= 0 ? `LO${i + 1}` : ''
                      })
                      .filter(Boolean)
                      .join(', ')}
                  />
                  <KV k="AI could" v={a.aiCanDo.join(', ')} />
                  <KV
                    k="AI vulnerability"
                    v={[optionLabel(VULNERABILITY, a.vulnerability), a.vulnerabilityReason]
                      .filter(Boolean)
                      .join(' — ')}
                  />
                  <KV
                    k="Learning assurance"
                    v={[
                      optionLabel(ASSURANCE, a.assurance),
                      a.assuranceEvidence.join(', '),
                      a.assuranceNotes,
                    ]
                      .filter(Boolean)
                      .join(' — ')}
                  />
                  <KV
                    k="Intended AI position"
                    v={[optionLabel(AI_POSITIONS, a.position), a.positionRationale]
                      .filter(Boolean)
                      .join(' — ')}
                  />
                  <KV k="AI capability developed" v={a.aiCapabilityDeveloped} />
                  <KV
                    k="12. Protected human capability"
                    v={[
                      a.protectedCapabilities.map((c) => c.label).join(', '),
                      a.humanAgencyNotes,
                      a.humanAgencyEvidence &&
                        `Sufficient evidence: ${optionLabel(AGREEMENT, a.humanAgencyEvidence)}`,
                    ]
                      .filter(Boolean)
                      .join(' — ')}
                  />
                  <KV
                    k="13. Process visibility"
                    v={[
                      optionLabel(PROCESS_VISIBILITY, a.processDecision),
                      a.processApproaches.join(', '),
                      a.processAction,
                    ]
                      .filter(Boolean)
                      .join(' — ')}
                  />
                  <KV
                    k="14. Authenticity"
                    v={[optionLabel(QUALITY, a.authenticityRating), a.authenticityNotes]
                      .filter(Boolean)
                      .join(' — ')}
                  />
                  <KV
                    k="15. Equity"
                    v={[a.equityIssues, a.equityActions].filter(Boolean).join(' — ')}
                  />
                  <KV
                    k="16. Practicality"
                    v={[optionLabel(SUSTAINABILITY, a.practicalityRating), a.practicalityNotes]
                      .filter(Boolean)
                      .join(' — ')}
                  />
                </dl>
              </div>
            ))}
          </div>
        ))}

      <div className="print-break" />
      <H1>Part C – Programme Synthesis</H1>
      <H2>17. Programme Dashboard</H2>
      <Table
        head={['Area', 'Rating']}
        rows={DASHBOARD_AREAS.map((a) => [a.label, optionLabel(QUALITY, dash[a.id]) || '—'])}
      />
      <H2>18. Patterns identified</H2>
      {patterns.length === 0 ? (
        <p className="mb-2 text-slate-500">No programme-level patterns detected from the data.</p>
      ) : (
        <ul className="mb-3 list-disc pl-5">
          {patterns.map((x) => (
            <li key={x.id}>
              <strong>{x.text.charAt(0).toUpperCase() + x.text.slice(1)}</strong> (
              {x.status === 'triggered' ? 'detected' : 'possible'})
              {x.evidence.length > 0 && <span> — {x.evidence.join('; ')}</span>}
              {review.synthesis.patternNotes[x.id] && (
                <span> Team: {review.synthesis.patternNotes[x.id]}</span>
              )}
            </li>
          ))}
        </ul>
      )}
      <H2>19. Programme Team Discussion</H2>
      {DISCUSSION_QUESTIONS.map((q) =>
        review.synthesis.discussion[q.id] ? (
          <Block key={q.id} title={q.text}>
            <p>{review.synthesis.discussion[q.id]}</p>
          </Block>
        ) : null,
      )}
      <H2>20. Action Plan</H2>
      {review.synthesis.actions.length === 0 ? (
        <p className="text-slate-500">No actions recorded.</p>
      ) : (
        <Table
          head={[
            'Category',
            'Action',
            'Programme/Module',
            'Priority',
            'Responsible',
            'Timescale',
            'Review point',
          ]}
          rows={review.synthesis.actions.map((a) => {
            const mod =
              a.scope === 'module' ? review.modules.find((m) => m.id === a.moduleId) : undefined
            return [
              actionText(a, review).split(': ')[0],
              a.text,
              mod ? mod.code || mod.title : 'Programme',
              a.priority,
              a.owner,
              a.timescale,
              a.reviewPoint,
            ]
          })}
        />
      )}
    </div>
  )
}

function H1({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 mt-2 border-b border-slate-300 pb-1 text-xl font-bold text-brand-700">
      {children}
    </h2>
  )
}
function H2({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-2 mt-4 text-base font-semibold text-slate-900">{children}</h3>
}
function H3({ children }: { children: React.ReactNode }) {
  return <h4 className="mb-1 mt-2 text-sm font-semibold text-slate-900">{children}</h4>
}
function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="avoid-break mb-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
      <div>{children}</div>
    </div>
  )
}
function Text({ value }: { value: string }) {
  return value.trim() ? (
    <p className="whitespace-pre-wrap">{value}</p>
  ) : (
    <p className="text-slate-400">—</p>
  )
}
function List({ title, items, inline }: { title: string; items: string[]; inline?: boolean }) {
  return (
    <Block title={title}>
      {items.length === 0 ? (
        <p className="text-slate-400">—</p>
      ) : inline ? (
        <p>{items.join(', ')}</p>
      ) : (
        <ul className="list-disc pl-5">
          {items.map((i, k) => (
            <li key={k}>{i}</li>
          ))}
        </ul>
      )}
    </Block>
  )
}
function KV({ k, v }: { k: string; v: string }) {
  if (!v) return null
  return (
    <div>
      <dt className="text-xs font-semibold text-slate-500">{k}</dt>
      <dd className="whitespace-pre-wrap">{v}</dd>
    </div>
  )
}
function Meta({ label, value }: { label: string; value: string }) {
  if (!value) return null
  return (
    <div>
      <dt className="inline font-medium">{label}: </dt>
      <dd className="inline">{value}</dd>
    </div>
  )
}
function Table({ head, rows, small }: { head: string[]; rows: string[][]; small?: boolean }) {
  return (
    <div className="mb-3 overflow-x-auto">
      <table className={`w-full border-collapse ${small ? 'text-[11px]' : 'text-xs'}`}>
        <thead>
          <tr className="border-b border-slate-300 text-left">
            {head.map((h) => (
              <th key={h} className="py-1 pr-2 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-slate-100 align-top">
              {r.map((c, j) => (
                <td key={j} className="py-1 pr-2">
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
