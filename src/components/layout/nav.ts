import type { ReviewKind } from '../../model/v2/schema'

export interface NavItem {
  to: string
  label: string
  /** Section number shown beside the label (the numbered review sections only). */
  number?: string
  /** The section's main questions have been answered. */
  done?: boolean
}
export interface NavGroup {
  label: string
  items: NavItem[]
}

/** Section ids, in order, for each review. Pages and progress use the same ids. */
export const PROGRAMME_SECTIONS = [
  { id: 'context', label: 'Programme context' },
  { id: 'capabilities', label: 'Graduate capabilities', number: '1' },
  { id: 'progression', label: 'AI capability progression', number: '2' },
  { id: 'curriculum', label: 'Curriculum and assessment', number: '3' },
  { id: 'coherence', label: 'Programme coherence', number: '4' },
  { id: 'priorities', label: 'Priorities and next steps', number: '5' },
  { id: 'summary', label: 'Programme review summary' },
] as const

export const MODULE_SECTIONS = [
  { id: 'context', label: 'Module context' },
  { id: 'outcomes', label: 'Learning outcomes', number: '1' },
  { id: 'teaching', label: 'Teaching and learning', number: '2' },
  { id: 'assessment', label: 'Assessment', number: '3' },
  { id: 'reflection', label: 'Reflection and next steps', number: '4' },
  { id: 'summary', label: 'Module summary' },
] as const

export type ProgrammeSection = (typeof PROGRAMME_SECTIONS)[number]['id']
export type ModuleSection = (typeof MODULE_SECTIONS)[number]['id']

export const reviewPath = (kind: ReviewKind, id: string, section = 'context') =>
  `/${kind}/${id}/${section}`

const HOME: NavGroup = {
  label: 'SETU AI Integration Review',
  items: [
    { to: '/', label: 'Home' },
    { to: '/reviews', label: 'Saved reviews' },
    { to: '/help', label: 'Help and guidance' },
  ],
}

/**
 * Navigation for the current context. Inside a review only that tool's sections are listed,
 * never the other tool's, so a module review stays short.
 */
export function navFor(
  kind?: ReviewKind,
  id?: string,
  progress: Record<string, boolean> = {},
): NavGroup[] {
  if (!kind || !id) return [HOME]
  const sections = kind === 'programme' ? PROGRAMME_SECTIONS : MODULE_SECTIONS
  const groups: NavGroup[] = [
    { label: '', items: [{ to: '/', label: 'Home' }] },
    {
      label:
        kind === 'programme' ? 'Programme AI Integration Review' : 'Module AI Integration Review',
      items: sections.map((s) => ({
        to: reviewPath(kind, id, s.id),
        label: s.label,
        ...('number' in s ? { number: s.number } : {}),
        ...(progress[s.id] ? { done: true } : {}),
      })),
    },
  ]
  if (kind === 'programme')
    groups.push(
      {
        label: 'Connected reviews',
        items: [{ to: reviewPath(kind, id, 'contributions'), label: 'Module contributions' }],
      },
      {
        label: 'Programme AI Integration Statement',
        items: [{ to: reviewPath(kind, id, 'statement'), label: 'Statement' }],
      },
    )
  else
    groups.push({
      label: 'Connected reviews',
      items: [{ to: reviewPath(kind, id, 'programme-priorities'), label: 'Programme priorities' }],
    })
  return groups
}
