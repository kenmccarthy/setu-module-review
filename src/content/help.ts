/**
 * User guide. Ships with the app so it can never drift from the deployed version.
 * Each section id is used as an anchor: pages link to `/help#<id>` via PageTitle's `helpAnchor`.
 */

export type HelpBlock =
  | { kind: 'p'; text: string }
  | { kind: 'ul'; items: string[] }
  | { kind: 'steps'; items: { title: string; text: string }[] }
  | { kind: 'note'; title: string; text: string }
  | { kind: 'faq'; items: { q: string; a: string }[] }

/** Anchor ids. `PageTitle`'s `helpAnchor` is typed against these, so a link cannot go stale. */
export const HELP_SECTION_IDS = [
  'purpose',
  'before-you-start',
  'part-a',
  'part-b',
  'part-c',
  'part-d',
  'priority-rule',
  'suggestions',
  'saving',
  'outputs',
  'faq',
] as const
export type HelpAnchor = (typeof HELP_SECTION_IDS)[number]

export interface HelpSection {
  id: HelpAnchor
  heading: string
  blocks: HelpBlock[]
}

export const HELP_INTRO =
  'This guide explains what the review asks for, how to work through it as a team, where your answers are stored, and how the tool works out its suggested ratings. You can print it with your browser (Ctrl/Cmd + P).'

export const HELP_SECTIONS: HelpSection[] = [
  {
    id: 'purpose',
    heading: 'What this tool is for',
    blocks: [
      {
        kind: 'p',
        text: 'The tool supports a programme team to review its curriculum and assessment in the context of increasingly capable Generative AI. It asks whether the programme’s approaches remain intentional, coherent, authentic and resilient, and where they need to change.',
      },
      {
        kind: 'note',
        title: 'What it is not',
        text: 'The review is not an exercise in making assessment “AI-proof”, and it is not a search for places to prohibit AI. A high AI vulnerability rating is a prompt for discussion, not a verdict on an assessment.',
      },
      {
        kind: 'p',
        text: 'Worked through as a team, the review should surface:',
      },
      {
        kind: 'ul',
        items: [
          'areas of existing strength and resilience;',
          'potential AI-related vulnerabilities;',
          'opportunities for meaningful AI integration;',
          'areas where human capability and independent performance need to be protected and assured;',
          'gaps or duplication in the development of student AI capability;',
          'inconsistencies in expectations across modules;',
          'priorities for curriculum and assessment redesign.',
        ],
      },
    ],
  },
  {
    id: 'before-you-start',
    heading: 'Before you start',
    blocks: [
      {
        kind: 'p',
        text: 'The review is designed for a programme team rather than an individual. One person can enter the answers, but the judgements — particularly on vulnerability, learning assurance and protected capabilities — are more reliable when they are discussed.',
      },
      { kind: 'p', text: 'Have to hand:' },
      {
        kind: 'ul',
        items: [
          'the programme learning outcomes;',
          'module descriptors, including module learning outcomes and credit values;',
          'assessment briefs, weightings and submission points across the year;',
          'any existing programme or institutional guidance on student AI use.',
        ],
      },
      {
        kind: 'p',
        text: 'A workable sequence is to complete Part A sections 1–3 together in a first session, allocate the Part B module reviews to module leaders, then reconvene for Part A sections 4–7 and all of Part C. Part D is drafted by the tool and amended by the team.',
      },
      {
        kind: 'note',
        title: 'Try it first',
        text: 'Use “Load sample” on the landing page to open a worked example. It fills every part of the review so you can see how the portfolio, dashboard, patterns and statement draft are produced. Loading the sample replaces whatever is in the browser, so export your own review first if you have started one.',
      },
    ],
  },
  {
    id: 'part-a',
    heading: 'Part A – Programme Review (sections 1–7)',
    blocks: [
      {
        kind: 'steps',
        items: [
          {
            title: '1. Programme Context',
            text: 'Basic programme details and a reflection on how AI is affecting the discipline, profession or employment context. The number of stages you set here determines the columns in the progression map and the stages available to modules.',
          },
          {
            title: '2. Graduate Capabilities',
            text: 'Three lists: enduring human capabilities, protected human capabilities (what graduates must be able to do themselves), and human-AI capabilities. Preset options are offered and you can add your own. The protected list matters later: Part C checks whether each protected capability is evidenced by at least one assessment.',
          },
          {
            title: '3. AI Capability Progression',
            text: 'A map of where each AI capability is Introduced, Practised, Extended or Demonstrated across the stages (I, P, E, D). Click a letter to toggle it. The map feeds three of the pattern checks, so an incomplete map means those checks report “not enough information yet”.',
          },
          {
            title: '4. Programme Assessment Portfolio',
            text: 'This table is built automatically from the assessments you enter in Part B — there is nothing to type. Click any row to jump to that assessment.',
          },
          {
            title: '5. AI Vulnerability',
            text: 'Reference descriptions of the four vulnerability levels. The rating itself is given per assessment in Part B.',
          },
          {
            title: '6. Learning Assurance',
            text: 'Reference descriptions of the three assurance levels, plus the Vulnerability × Assurance grid, which counts your assessments into each cell and highlights the ones prioritised for review.',
          },
          {
            title: '7. Programme Coherence',
            text: 'Ten questions about the experience a student actually has moving through the programme, and an overall coherence rating. Your rating here overrides the tool’s suggestion for the portfolio-coherence area of the dashboard.',
          },
        ],
      },
    ],
  },
  {
    id: 'part-b',
    heading: 'Part B – Module & Assessment Review (sections 8–16)',
    blocks: [
      {
        kind: 'p',
        text: 'Sections 8–16 are completed once for each module, and the assessment sections once for each assessment within it. There is no limit on the number of modules — the “8–16” beside “Modules” in the sidebar is the section-number range, not a count.',
      },
      {
        kind: 'p',
        text: 'For each module you record its context, review each module learning outcome, and consider how students are prepared for what assessment expects of them. For each assessment you record:',
      },
      {
        kind: 'ul',
        items: [
          'what the assessment is intended to evidence;',
          'what current Generative AI could reasonably do within it;',
          'its AI vulnerability, with a reason;',
          'the AI position that is educationally appropriate, with a rationale;',
          'the level of learning assurance and the forms of evidence that support it;',
          'protected human capabilities, human agency and process visibility;',
          'authenticity, equity and practicality.',
        ],
      },
      {
        kind: 'note',
        title: 'Start where it matters',
        text: 'You do not have to review every module before the synthesis becomes useful. Review the most significant modules first — the ones carrying the largest assessment weightings or the capabilities you most need to assure — and return to the others later. Each module shows a completeness percentage in the list.',
      },
      {
        kind: 'p',
        text: 'Use “Duplicate” on a module when several modules share an assessment pattern, then edit the copy.',
      },
    ],
  },
  {
    id: 'part-c',
    heading: 'Part C – Programme Synthesis (sections 17–20)',
    blocks: [
      {
        kind: 'p',
        text: 'Part C is mostly derived from Parts A and B. Its purpose is not to catalogue individual problematic assessments but to see programme-level patterns.',
      },
      {
        kind: 'steps',
        items: [
          {
            title: '17. Bringing the Evidence Together',
            text: 'A rating for each of seven areas. Each one arrives with a suggested rating and the reason for it; select a different rating to override it, or use “Use suggestion” to go back.',
          },
          {
            title: '18. Pattern Identification',
            text: 'Ten programme-level patterns, each reported as triggered, possible, clear, or not enough information yet, with the evidence behind the result.',
          },
          {
            title: '19. Team Discussion',
            text: 'Eight discussion questions for the team to answer in its own words. Nothing is derived from these; they are the record of the conversation.',
          },
          {
            title: '20. Action Plan',
            text: 'Actions in seven categories — Maintain, Enhance, Redesign, Integrate, Assure, Align, Monitor — each with a priority, an owner, a timescale and a review point. Categorising is deliberate: it stops the review turning into an attempt to redesign everything at once.',
          },
        ],
      },
      {
        kind: 'p',
        text: 'The Review Summary page then generates a concise summary of the whole review, suitable for programme review and Academic Unit Review processes. Anything you type into the “Overall position” box on the dashboard is used in place of the generated opening paragraph.',
      },
    ],
  },
  {
    id: 'part-d',
    heading: 'Part D – AI Integration Statement (section 21)',
    blocks: [
      {
        kind: 'p',
        text: 'The statement is the outward-facing product of the review: what the programme tells students, external examiners and professional bodies about the place of AI in it.',
      },
      {
        kind: 'p',
        text: 'Every section of the statement arrives as a draft written from your review answers. The draft is a starting point, not an output to be accepted as it stands — it is assembled mechanically from what you entered and needs the team’s judgement and voice.',
      },
      {
        kind: 'ul',
        items: [
          'Edit any section and your text is used instead of the draft.',
          'Clear a section back to empty and the generated draft returns, so regenerating never destroys your wording.',
          'Where the review has nothing to say, the draft leaves a clearly marked placeholder for you to complete.',
        ],
      },
      {
        kind: 'p',
        text: 'The Full Statement page shows the assembled statement plus an evidence table mapping each claim back to the part of the review it came from.',
      },
    ],
  },
  {
    id: 'priority-rule',
    heading: 'How assessments are prioritised for review',
    blocks: [
      {
        kind: 'p',
        text: 'Vulnerability and quality are not the same thing. An assessment can be highly susceptible to AI assistance and still provide strong evidence of learning; an assessment with low AI vulnerability can still be poor evidence of meaningful learning. The two ratings are therefore always read together.',
      },
      { kind: 'p', text: 'The tool applies one rule consistently throughout:' },
      {
        kind: 'ul',
        items: [
          'AI vulnerability High or Critical with learning assurance Low → prioritised for review (shown in red).',
          'AI vulnerability High or Critical with learning assurance Moderate → worth watching (shown in amber).',
          'Everything else is not flagged.',
        ],
      },
      {
        kind: 'p',
        text: 'The same rule drives the red and amber rows in the assessment portfolio, the highlighted cells in the Vulnerability × Assurance grid, the “Prioritised for review” count on the dashboard, and the first pattern check. An assessment is only flagged once both ratings have been given.',
      },
    ],
  },
  {
    id: 'suggestions',
    heading: 'How the suggested ratings and patterns are worked out',
    blocks: [
      {
        kind: 'p',
        text: 'Nothing in the tool uses AI to reach these conclusions. Every suggestion is a fixed rule applied to what you entered, and every one can be overridden. Where you have given a team rating yourself — progression in section 3, coherence in section 7 — that rating is used in preference to any calculation.',
      },
      { kind: 'p', text: 'The dashboard areas are suggested as follows:' },
      {
        kind: 'ul',
        items: [
          'AI resilience — from the number of assessments prioritised for review: two or more suggests “Priority action required”, one suggests “Review recommended”.',
          'Learning assurance — from the proportion of rated assessments given Low assurance.',
          'AI capability progression — your section 3 rating, otherwise the progression pattern check.',
          'Protected human capability — whether each capability named in section 2B is evidenced by at least one assessment.',
          'Assessment portfolio coherence — your section 7 rating, otherwise the assessment-type overuse and volume checks.',
          'Consistency of AI expectations — whether any single stage mixes AI Restricted with AI Integrated or AI Open assessments.',
          'Future/disciplinary relevance — the average of the authenticity ratings given to assessments.',
        ],
      },
      {
        kind: 'p',
        text: 'The pattern checks apply similar thresholds — for example, an assessment type is reported as overused when it accounts for at least three assessments and at least 40% of those with a type recorded; assessment volume is queried above an average of three assessments per module. Each pattern shows its evidence, so you can see exactly which assessments or stages produced the result.',
      },
      {
        kind: 'note',
        title: 'Blank is not clear',
        text: 'A check that reports “not enough information yet” means the underlying answers are missing, not that there is no problem. Completing the progression map and the vulnerability, assurance and position ratings is what turns those into real results.',
      },
    ],
  },
  {
    id: 'saving',
    heading: 'Saving, sharing and browsers',
    blocks: [
      {
        kind: 'p',
        text: 'The tool runs entirely in your browser. Nothing you enter is sent to a server, and no account is needed.',
      },
      {
        kind: 'ul',
        items: [
          'Your review is saved automatically as you type. The header shows when it last changed.',
          'It is saved in this browser, on this device only. Opening the tool in a different browser, on a different computer, or in a private window shows an empty review.',
          'Export writes the whole review to a JSON file. That file is your backup and the way to pass the review to a colleague.',
          'Import loads an exported file back in, replacing whatever is currently in the browser. You will be asked to confirm.',
          'New clears the review and starts again — export first if you want to keep it.',
        ],
      },
      {
        kind: 'note',
        title: 'Working as a team',
        text: 'Because the review lives in one browser, two people cannot edit it at the same time. Pass it around instead: whoever holds it exports when they are finished and sends the file on. Exporting at the end of each session also gives you a version you can go back to.',
      },
      {
        kind: 'p',
        text: 'Clearing your browser’s site data, or using a device that clears it for you, removes an unexported review. Export regularly.',
      },
    ],
  },
  {
    id: 'outputs',
    heading: 'Printing and the final outputs',
    blocks: [
      {
        kind: 'p',
        text: 'The review produces three things you can take away:',
      },
      {
        kind: 'ul',
        items: [
          'Print / Save as PDF — the whole review, every part, laid out for A4. Use your browser’s print dialogue and choose “Save as PDF”.',
          'The Review Summary — a concise account of the review’s findings and priorities for programme review processes.',
          'The AI Integration Statement — the approved statement, plus the evidence table for external review.',
        ],
      },
      {
        kind: 'p',
        text: 'The JSON export is not a report: it is the review data, for backup and for handing on. Use the print view when you need something to read or circulate.',
      },
    ],
  },
  {
    id: 'faq',
    heading: 'Questions and troubleshooting',
    blocks: [
      {
        kind: 'faq',
        items: [
          {
            q: 'My review has disappeared.',
            a: 'Check that you are using the same browser, device and profile as before, and that you are not in a private window. If your browser’s site data was cleared, an unexported review cannot be recovered — import your most recent export.',
          },
          {
            q: 'Does anything I type leave my computer?',
            a: 'No. There is no server and no account. The only way data leaves the browser is when you export a file and send it somewhere yourself.',
          },
          {
            q: 'Can two of us work on the review at the same time?',
            a: 'No. Export and pass the file on instead — see “Saving, sharing and browsers” above.',
          },
          {
            q: 'What do the numbers beside the sidebar items mean?',
            a: 'They are the section numbers from the review specification. “8–16” beside Modules means that part covers sections 8 to 16 for each module; it is not a limit on how many modules you can add.',
          },
          {
            q: 'Do I have to answer everything?',
            a: 'No. Every field is optional and the review saves as you go. The derived views simply say where they have too little information, and the module list shows how complete each module is.',
          },
          {
            q: 'Can I change a suggested rating?',
            a: 'Yes. Every suggestion on the dashboard can be overridden by selecting a different rating, and every generated statement section can be rewritten. Clearing your override or your text restores the suggestion.',
          },
          {
            q: 'An import was rejected.',
            a: 'The tool only accepts JSON files it exported itself. A file saved by a newer version of the tool, or one that has been edited by hand into an invalid shape, is refused rather than loaded partially.',
          },
          {
            q: 'How do I start a second review for another programme?',
            a: 'Export the current review, then choose New. Keep the exported files — you can import any of them again later.',
          },
        ],
      },
    ],
  },
]
