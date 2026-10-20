import { useState } from 'react'
import { Button, Callout, Disclosure, FilePicker, Section, TextArea } from '../../components/fields'
import { applyPrompts, matchPrompts, programmePromptsPacket } from '../../logic/v2/exchange'
import type { ProgrammePromptsPacket, ProgrammeReview } from '../../model/v2/schema'
import { promptsFromImport } from '../../store/exchangeImport'
import { parseImport } from '../../store/importV2'
import { loadReview } from '../../store/library'
import { useWorkspace } from '../../store/workspace'
import { confirmImport } from '../review/confirmImport'
import { useModuleReview } from './useModuleReview'

const KEPT = 'Your notes against prompts that are still included are kept.'

export function ImportedProgrammePriorities() {
  const { review: m, edit } = useModuleReview()
  const replace = useWorkspace((s) => s.replace)
  const storage = useWorkspace((s) => s.storage)
  const entries = useWorkspace((s) => s.entries)
  const [message, setMessage] = useState<{ text: string; tone: 'ok' | 'error' } | null>(null)

  const add = (packet: ProgrammePromptsPacket) => {
    if (!packet.prompts.length) {
      setMessage({
        text: 'That programme has not recorded any priorities or questions yet.',
        tone: 'error',
      })
      return
    }
    const held = m.programmePriorities.find((p) => p.sourceReviewId === packet.sourceReviewId)
    const name = `the prompts from ${packet.programmeTitle || 'this programme'}`
    const { apply, message } = confirmImport(matchPrompts(m, packet), name, held?.importedAt, KEPT)
    if (apply) replace(applyPrompts(m, packet))
    setMessage({ text: message, tone: 'ok' })
  }

  const savedProgrammes = entries.filter((e) => e.kind === 'programme')

  return (
    <>
      <p className="max-w-3xl text-sm text-slate-600">
        A programme team can share its priorities and questions for module teams. They appear here
        as optional prompts to consider during your review, not as instructions, and importing them
        never changes the rest of your module review.
      </p>

      <Section title="Add programme priorities">
        <div className="flex flex-wrap gap-2">
          <FilePicker
            variant="primary"
            label="Import programme priorities file"
            onText={(text) => {
              const r = promptsFromImport(parseImport(text))
              if (!r.ok) setMessage({ text: r.error, tone: 'error' })
              else add(r.packet)
            }}
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
        {savedProgrammes.length > 0 && (
          <Disclosure
            summary={`Add from programme reviews saved in this browser (${savedProgrammes.length})`}
          >
            <ul className="divide-y divide-slate-100">
              {savedProgrammes.map((e) => (
                <li key={e.id} className="flex flex-wrap items-center gap-3 py-2">
                  <span className="min-w-0 flex-1 truncate">{e.title || 'Untitled programme'}</span>
                  <Button
                    onClick={() => {
                      const p = loadReview(storage, e.id) as ProgrammeReview | undefined
                      if (p) add(programmePromptsPacket(p, p.updatedAt))
                    }}
                  >
                    {m.programmePriorities.some((x) => x.sourceReviewId === e.id)
                      ? 'Update'
                      : 'Add'}
                  </Button>
                </li>
              ))}
            </ul>
          </Disclosure>
        )}
      </Section>

      {m.programmePriorities.length === 0 ? (
        <Callout title="No programme priorities imported" tone="note">
          <p>
            This module review can be completed without them. If a programme team shares priorities
            or questions, you can add them here at any time.
          </p>
        </Callout>
      ) : (
        m.programmePriorities.map((set, si) => (
          <Section
            key={set.sourceReviewId}
            title={set.programmeTitle || 'Programme priorities'}
            intro={`Imported ${new Date(set.importedAt).toLocaleDateString()} · programme review last changed ${new Date(set.revision).toLocaleDateString()}`}
          >
            <ol className="space-y-4">
              {set.prompts.map((p) => (
                <li key={p.id} className="space-y-2">
                  <p className="text-sm text-slate-800">
                    <span className="mr-2 rounded bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-700">
                      {p.kind === 'priority' ? 'Programme priority' : 'Question for module teams'}
                    </span>
                    {p.text}
                  </p>
                  <TextArea
                    label="Our notes (optional)"
                    rows={2}
                    value={set.responses[p.id] ?? ''}
                    onChange={(v) =>
                      edit((d) => void (d.programmePriorities[si].responses[p.id] = v))
                    }
                  />
                </li>
              ))}
            </ol>
            <div className="flex justify-end">
              <button
                type="button"
                className="rounded-md px-3 py-1.5 text-sm text-rose-700 hover:bg-rose-50"
                onClick={() => {
                  if (
                    confirm(
                      `Remove the prompts from ${set.programmeTitle || 'this programme'}, and your notes on them?`,
                    )
                  )
                    edit((d) => void d.programmePriorities.splice(si, 1))
                }}
              >
                Remove these prompts
              </button>
            </div>
          </Section>
        ))
      )}
    </>
  )
}
