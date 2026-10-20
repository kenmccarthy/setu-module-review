import { buildSampleReview } from '../../model/sample'
import { migrateV1Review } from '../../migrate/v1ToV2'
import { saveReview } from '../../store/library'
import type { ProgrammeReview } from '../../model/v2/schema'

/**
 * Saves the worked example as a new programme review with two linked module reviews. It is
 * built from the v1 sample through the same migration real data takes, and titled "Sample: …"
 * so it is never mistaken for a real review.
 */
export function saveSample(storage: Storage): ProgrammeReview {
  const { programme, modules } = migrateV1Review(buildSampleReview())
  const label = (t: string) => `Sample: ${t}`
  const ms = modules.map((m) => ({ ...m, title: label(m.title), legacy: undefined }))
  const p: ProgrammeReview = {
    ...programme,
    title: label(programme.title),
    legacy: undefined,
    moduleContributions: programme.moduleContributions.map((c) => ({
      ...c,
      origin: 'import',
      snapshot: { ...c.snapshot, title: label(c.snapshot.title) },
    })),
  }
  for (const r of [...ms, p]) saveReview(storage, r)
  return p
}
