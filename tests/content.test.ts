import { describe, expect, it } from 'vitest'
import * as capabilities from '../src/content/capabilities'
import * as help from '../src/content/help'
import * as moduleContent from '../src/content/module'
import * as programme from '../src/content/programme'
import * as scales from '../src/content/scales'
import * as statementContent from '../src/content/statement'
import * as synthesis from '../src/content/synthesis'
import { COHERENCE } from '../src/content/programme'
import { HELP_SECTIONS, HELP_SECTION_IDS } from '../src/content/help'
import { PROGRESSION_PHASES } from '../src/content/scales'
import { suggestDashboard } from '../src/logic/dashboard'
import { generateEvidenceSummary } from '../src/logic/statement'
import { sample } from './fixture'

/** Every string reachable from a value, however deeply nested. */
function strings(value: unknown): string[] {
  if (typeof value === 'string') return [value]
  if (typeof value === 'function') return []
  if (Array.isArray(value)) return value.flatMap(strings)
  if (value && typeof value === 'object') return Object.values(value).flatMap(strings)
  return []
}

const CONTENT = [capabilities, help, moduleContent, programme, scales, statementContent, synthesis]

describe('user-facing text', () => {
  it('spells out "section" rather than using §', () => {
    // The § glyph rendered as an unexplained symbol on screen and confused reviewers.
    for (const text of CONTENT.flatMap(strings)) expect(text).not.toContain('§')
    const review = sample()
    const derived = [
      ...Object.values(suggestDashboard(review)).map((area) => area.reason),
      ...strings(generateEvidenceSummary(review)),
    ]
    for (const text of derived) expect(text).not.toContain('§')
  })
})

describe('progression phases', () => {
  it('have distinct initials spelling IPED', () => {
    expect(PROGRESSION_PHASES.map((p) => p.label.charAt(0)).join('')).toBe('IPED')
  })
  it('keep their stored values so saved reviews still load', () => {
    expect(PROGRESSION_PHASES.map((p) => p.value)).toEqual([
      'introduced',
      'practised',
      'developed',
      'demonstrated',
    ])
  })
})

describe('coherence questions', () => {
  it('keep unique ids, which key the saved answers', () => {
    const ids = COHERENCE.questions.map((q) => q.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(ids).toContain('vulnerable_formats')
  })
})

describe('help guide', () => {
  it('defines every declared anchor exactly once', () => {
    expect(HELP_SECTIONS.map((s) => s.id)).toEqual([...HELP_SECTION_IDS])
  })
})
