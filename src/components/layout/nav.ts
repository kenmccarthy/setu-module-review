export interface NavItem {
  to: string
  label: string
  number?: string
}
export interface NavGroup {
  label: string
  items: NavItem[]
}

export const NAV: NavGroup[] = [
  {
    label: 'Part A – Programme Review',
    items: [
      { to: '/programme/context', label: 'Programme Context', number: '1' },
      { to: '/programme/capabilities', label: 'Graduate Capabilities', number: '2' },
      { to: '/programme/progression', label: 'AI Capability Progression', number: '3' },
      { to: '/programme/portfolio', label: 'Assessment Portfolio', number: '4–6' },
      { to: '/programme/coherence', label: 'Programme Coherence', number: '7' },
    ],
  },
  {
    label: 'Part B – Module & Assessment Review',
    items: [{ to: '/modules', label: 'Modules', number: '8–16' }],
  },
  {
    label: 'Part C – Programme Synthesis',
    items: [
      { to: '/synthesis/dashboard', label: 'Programme Dashboard', number: '17' },
      { to: '/synthesis/patterns', label: 'Pattern Identification', number: '18' },
      { to: '/synthesis/discussion', label: 'Team Discussion', number: '19' },
      { to: '/synthesis/actions', label: 'Action Plan', number: '20' },
      { to: '/synthesis/summary', label: 'Review Summary' },
    ],
  },
  {
    label: 'Part D – AI Integration Statement',
    items: [
      { to: '/statement', label: 'Statement Sections', number: '21' },
      { to: '/statement/full', label: 'Full Statement & Evidence' },
    ],
  },
  {
    label: 'Output',
    items: [{ to: '/print', label: 'Print / Save as PDF' }],
  },
]
