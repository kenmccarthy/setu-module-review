import { describe, expect, it } from 'vitest'
import {
  NOT_ANSWERED,
  programmeProgress,
  programmeSummary,
  programmeSummaryText,
  progressionLines,
} from '../src/logic/v2/programmeSummary'
import { programmeLegacy } from '../src/logic/v2/legacy'
import { migrateV1Review } from '../src/migrate/v1ToV2'
import { newListItem, newProgrammeReview } from '../src/model/v2/defaults'
import { sample } from './fixture'

const block = (r: ReturnType<typeof newProgrammeReview>, id: string) =>
  programmeSummary(r).find((b) => b.id === id)!

describe('programme review summary', () => {
  it('covers every section the specification lists, in order', () => {
    expect(programmeSummary(newProgrammeReview()).map((b) => b.heading)).toEqual([
      'Programme context',
      'Independent graduate capabilities',
      'AI-enabled graduate capabilities',
      'Programme learning outcomes',
      'Capability progression',
      'Curriculum and assessment reflections',
      'Programme coherence',
      'Strengths',
      'Opportunities',
      'Agreed priorities',
      'Questions for module teams',
    ])
  })

  it('says a question is unanswered rather than guessing', () => {
    const r = newProgrammeReview()
    expect(block(r, 'curriculum').lines[0]).toMatch(new RegExp(`${NOT_ANSWERED}$`))
    expect(block(r, 'strengths').lines).toEqual([])
    expect(programmeSummaryText(r)).toContain(`STRENGTHS\n${NOT_ANSWERED}`)
  })

  it('reports recorded answers with their option labels', () => {
    const r = newProgrammeReview({
      opportunitiesConfidence: 'some_questions',
      coordination: 'some',
      coherenceNotes: { guidance: 'Briefs use different wording.' },
      priorities: [newListItem('Common AI statement'), newListItem('  ')],
    })
    expect(block(r, 'curriculum').lines[0]).toMatch(/Some questions remain$/)
    expect(block(r, 'coherence').lines).toContain(
      'Consistency of student guidance: Briefs use different wording.',
    )
    expect(block(r, 'priorities').lines).toEqual(['Common AI statement'])
  })

  it('describes the progression map by capability and stage, ignoring stages beyond the programme', () => {
    const r = newProgrammeReview({
      stages: 3,
      progression: {
        'evaluation:1': ['introduced'],
        'evaluation:3': ['developed', 'demonstrated'],
        'oversight:5': ['demonstrated'],
      },
    })
    expect(progressionLines(r)).toEqual([
      'Critical evaluation of AI outputs: Stage 1 (I), Stage 3 (E, D)',
    ])
  })

  it('tracks progress from the main questions only', () => {
    const empty = programmeProgress(newProgrammeReview())
    expect(Object.values(empty).every((v) => !v)).toBe(true)
    const r = newProgrammeReview({
      title: 'BSc',
      coordination: 'established',
      opportunitiesConfidence: 'yes',
    })
    const p = programmeProgress(r)
    expect(p).toMatchObject({ context: true, coherence: true, curriculum: false })
  })
})

describe('data from the previous version', () => {
  it('shows v1 answers that have no v2 question, by section', () => {
    const { programme } = migrateV1Review(sample())
    const legacy = programmeLegacy(programme)
    expect(legacy.capabilities.map((i) => i.label)).toContain(
      'How protected capabilities are assured',
    )
    expect(legacy.progression[0].value).toBe('Stage 4: I')
    expect(legacy.coherence.some((i) => /common AI position statement/.test(i.value))).toBe(true)
    expect(legacy.priorities.filter((i) => i.label.startsWith('Action plan'))).toHaveLength(2)
  })

  it('is empty for a review started in v2', () => {
    expect(programmeLegacy(newProgrammeReview())).toEqual({})
  })
})
