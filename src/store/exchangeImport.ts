/**
 * Turns an imported file into the packet a review can take. A programme review accepts a module
 * contribution or a whole module review; a module review accepts programme prompts or a whole
 * programme review. Anything else is refused with a message saying where it belongs.
 */
import { moduleContributionPacket, programmePromptsPacket } from '../logic/v2/exchange'
import type { ModuleContributionPacket, ProgrammePromptsPacket } from '../model/v2/schema'
import type { ParsedImport } from './importV2'

type Result<T> = { ok: true; packet: T } | { ok: false; error: string }

export function contributionFromImport(parsed: ParsedImport): Result<ModuleContributionPacket> {
  if (!parsed.ok) return parsed
  if (parsed.type === 'module-contribution') return { ok: true, packet: parsed.packet }
  if (parsed.type === 'review' && parsed.review.kind === 'module')
    return { ok: true, packet: moduleContributionPacket(parsed.review, parsed.review.updatedAt) }
  if (parsed.type === 'programme-prompts')
    return {
      ok: false,
      error: 'This file holds programme priorities and questions. Import it into a module review.',
    }
  return {
    ok: false,
    error:
      'This file is not a module contribution. Ask the module team to use “Export module contribution” on their module summary.',
  }
}

export function promptsFromImport(parsed: ParsedImport): Result<ProgrammePromptsPacket> {
  if (!parsed.ok) return parsed
  if (parsed.type === 'programme-prompts') return { ok: true, packet: parsed.packet }
  if (parsed.type === 'review' && parsed.review.kind === 'programme')
    return { ok: true, packet: programmePromptsPacket(parsed.review, parsed.review.updatedAt) }
  if (parsed.type === 'module-contribution')
    return {
      ok: false,
      error: 'This file is a module contribution. Import it into a programme review.',
    }
  return {
    ok: false,
    error:
      'This file does not hold programme priorities or questions. Ask the programme team to use “Export priorities and questions for module teams”.',
  }
}
