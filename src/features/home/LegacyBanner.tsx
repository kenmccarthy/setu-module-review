import { useState } from 'react'
import { Button, Callout } from '../../components/fields'
import { detectLegacyReview, migrateLegacyReview } from '../../migrate/legacyStorage'
import { downloadText } from '../../store/download'
import { serializeReview } from '../../store/io'
import { useWorkspace } from '../../store/workspace'

export const CLASSIC_URL = `${import.meta.env.BASE_URL}classic/`

/**
 * Offers to bring a review saved by the previous version into the new tool. The original is
 * never changed: it stays usable in the Classic tool, and a backup can be downloaded first.
 */
export function LegacyBanner() {
  const storage = useWorkspace((s) => s.storage)
  const refresh = useWorkspace((s) => s.refresh)
  const [status, setStatus] = useState(() => detectLegacyReview(storage))
  const [outcome, setOutcome] = useState<{ ok: boolean; text: string } | null>(null)

  const backup = (text: string) =>
    downloadText(`ai-review-backup-${new Date().toISOString().slice(0, 10)}.json`, text)

  if (outcome?.ok)
    return (
      <Callout title="Your earlier review has been brought in" tone="note">
        <p>{outcome.text}</p>
      </Callout>
    )

  if (status.state === 'unreadable')
    return (
      <Callout title="A review from the previous version could not be read" tone="warn">
        <p>{status.error} It has not been changed.</p>
        <p>
          Download a copy of the stored data to keep it safe, then open it in the{' '}
          <a className="font-medium underline" href={CLASSIC_URL}>
            Classic tool
          </a>{' '}
          or send it to the tool's maintainer.
        </p>
        <div className="pt-1">
          <Button onClick={() => backup(status.raw)}>Download stored data</Button>
        </div>
      </Callout>
    )

  if (status.state !== 'available') return null
  const title = status.review.programme.title || 'Untitled programme'

  const bringIn = () => {
    const result = migrateLegacyReview(storage, status.review)
    if (!result.ok) {
      setOutcome({
        ok: false,
        text: `The review could not be brought in (${result.error}). Your original review has not been changed and is still available in the Classic tool. Download a backup and try again, or import the backup file.`,
      })
      return
    }
    refresh()
    setStatus(detectLegacyReview(storage))
    const n = result.result.modules.length
    setOutcome({
      ok: true,
      text: `“${title}” is now a programme review with ${n} linked module review${n === 1 ? '' : 's'}. Open it with Continue Programme Review or from Saved reviews. Answers that could not be safely carried over are left for your team, with a note in each review. The original is unchanged in the Classic tool.`,
    })
  }

  return (
    <Callout
      title={
        status.changedSinceMigration
          ? 'Your review in the previous version has changed'
          : 'We found a review from the previous version of this tool'
      }
      tone="warn"
    >
      <p>
        <strong>{title}</strong> ({status.review.modules.length} modules) is saved in this browser
        from the previous version.
        {status.changedSinceMigration
          ? ' It has been edited since you last brought it in. You can bring in a new copy; the copy you already have is not changed.'
          : ' You can bring it into the new tool as a programme review with a module review for each module.'}
      </p>
      <p>
        We recommend downloading a backup first. The original stays available, unchanged, in the{' '}
        <a className="font-medium underline" href={CLASSIC_URL}>
          Classic tool
        </a>
        .
      </p>
      {outcome && !outcome.ok && (
        <p role="alert" className="font-medium text-rose-800">
          {outcome.text}
        </p>
      )}
      <div className="flex flex-wrap gap-2 pt-1">
        <Button onClick={() => backup(serializeReview(status.review))}>Download a backup</Button>
        <Button variant="primary" onClick={bringIn}>
          {status.changedSinceMigration ? 'Bring in a new copy' : 'Bring it into the new tool'}
        </Button>
      </div>
    </Callout>
  )
}
