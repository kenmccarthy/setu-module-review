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
  'choosing',
  'programme',
  'module',
  'connecting',
  'statement',
  'previous-version',
  'saving',
  'accessibility',
  'faq',
] as const
export type HelpAnchor = (typeof HELP_SECTION_IDS)[number]

export interface HelpSection {
  id: HelpAnchor
  heading: string
  blocks: HelpBlock[]
}

export const HELP_INTRO =
  'This guide explains the two reviews, how they connect, how the Programme AI Integration Statement is drafted and agreed, and where your work is saved. You can print it with your browser (Ctrl/Cmd + P).'

export const HELP_SECTIONS: HelpSection[] = [
  {
    id: 'purpose',
    heading: 'What these tools are for',
    blocks: [
      {
        kind: 'p',
        text: 'The SETU AI Integration Review supports academic teams to reflect on what Generative AI means for curriculum, teaching, learning, assessment and graduate capabilities. It is built around two questions:',
      },
      {
        kind: 'ul',
        items: [
          'Learning assurance: can we have confidence that our students are developing and demonstrating the knowledge, skills, judgement and capabilities expected of our graduates in an AI-enabled world?',
          'Responsible AI engagement: are we preparing our students to engage with AI critically, ethically and responsibly, with appropriate human judgement, agency and oversight?',
        ],
      },
      {
        kind: 'note',
        title: 'What the tools are not',
        text: 'They are developmental tools, not compliance audits or AI detection systems, and they do not assume that more AI integration is better. A programme or module may appropriately take a restricted, bounded, integrated or open approach, depending on the intended learning. The aim is intentional, educationally justified decisions, not the maximum amount of information.',
      },
      {
        kind: 'p',
        text: 'There are two shorter reviews, a Programme AI Integration Review and a Module AI Integration Review, which can be used separately or together. Both contribute to one Programme AI Integration Statement.',
      },
    ],
  },
  {
    id: 'choosing',
    heading: 'Which review to start',
    blocks: [
      {
        kind: 'steps',
        items: [
          {
            title: 'Programme AI Integration Review',
            text: 'For a programme team. Explores graduate capabilities, how AI capability develops across the stages, curriculum and assessment, and how coordinated the programme’s approach is. An initial review takes about 15–20 minutes.',
          },
          {
            title: 'Module AI Integration Review',
            text: 'For a module leader or module team. Reflects on learning outcomes, teaching and learning, and each assessment. An initial review takes about 10–15 minutes.',
          },
        ],
      },
      {
        kind: 'p',
        text: 'Either can be started first, and neither needs the other. A module review does not need a programme review to exist; a programme review, and a provisional statement, can be completed without any module reviews. When both exist, each can inform the other (see “Connecting programme and module reviews”).',
      },
      {
        kind: 'p',
        text: 'The suggested times are a guide, not a limit. Short answers are fine; the reviews are meant to support discussion, not to capture everything.',
      },
    ],
  },
  {
    id: 'programme',
    heading: 'The Programme AI Integration Review',
    blocks: [
      {
        kind: 'p',
        text: 'Start with the programme context. Only the title is needed to begin, and the number of stages sets the columns of the progression map. Then work through five sections; previous and next links are at the foot of each page and a tick appears in the menu when a section’s main questions are answered.',
      },
      {
        kind: 'steps',
        items: [
          {
            title: '1. Graduate capabilities',
            text: 'What graduates must be able to demonstrate independently of AI, what they should be able to do effectively, critically and responsibly with AI, and whether the programme learning outcomes reflect this. Capability suggestions are available if you want them.',
          },
          {
            title: '2. AI capability progression',
            text: 'Mark where each of five broad capabilities is Introduced (I), Practised (P), Extended (E) or Demonstrated (D) at each stage, then reflect on whether the map suggests a coherent progression. The tool does not score the map.',
          },
          {
            title: '3. Curriculum and assessment',
            text: 'Whether students have sufficient opportunities to demonstrate the intended learning, and whether assessment balances independent performance with responsible AI-enabled practice. If module reviews are linked, an optional overview of their assessments is available.',
          },
          {
            title: '4. Programme coherence',
            text: 'Optional discussion prompts (open any to note your discussion), then how you would describe your current programme approach and what would strengthen it.',
          },
          {
            title: '5. Priorities and next steps',
            text: 'Strengths, opportunities, up to three priorities, and any questions you would like module leaders to consider. These priorities and questions can be exported for module teams.',
          },
        ],
      },
      {
        kind: 'p',
        text: 'The programme review summary gathers your answers in one place, with print / save as PDF, copy as text and export. It reports only what you recorded and says “Not yet answered” where a question is blank.',
      },
    ],
  },
  {
    id: 'module',
    heading: 'The Module AI Integration Review',
    blocks: [
      {
        kind: 'p',
        text: 'Start with the module context. The module title or code is enough to begin, and you do not need a programme review. A module shared by several programmes can list them all.',
      },
      {
        kind: 'steps',
        items: [
          {
            title: '1. Learning outcomes',
            text: 'Whether the module learning outcomes remain appropriate given developments in AI. You do not need to list or rate each outcome; an optional detailed review is available if it helps.',
          },
          {
            title: '2. Teaching and learning',
            text: 'Whether teaching and learning give students appropriate opportunities, and whether students are supported to engage with AI critically and responsibly where relevant. Guidance on what this might include is available on request.',
          },
          {
            title: '3. Assessment',
            text: 'Add each assessment and answer three questions: what role AI should play (restricted, limited/bounded, integrated, open or not materially relevant), how confident you are that it provides appropriate evidence of learning, and whether anything needs to change.',
          },
          {
            title: '4. Reflection and next steps',
            text: 'What is working well, what you might enhance, what needs programme-level discussion, up to three next steps, and whether your decisions about AI align with the intended learning and the wider programme approach.',
          },
        ],
      },
      {
        kind: 'note',
        title: 'Explore Assessment Design in More Detail',
        text: 'Each assessment has an optional detailed section covering vulnerability, learning assurance evidence, human agency, process visibility, authenticity, equity, practicality and sustainability. It is never needed to complete the review; use it when a fuller discussion would help.',
      },
      {
        kind: 'p',
        text: 'The module summary reports each assessment on its own, with no totals or scores, and ends with a short contribution to the programme’s statement: how the module contributes to the programme’s overall approach to AI. From the summary you can print, copy, export the review, or export a module contribution for the programme team.',
      },
    ],
  },
  {
    id: 'connecting',
    heading: 'Connecting programme and module reviews',
    blocks: [
      {
        kind: 'steps',
        items: [
          {
            title: 'Programme to module',
            text: 'In section 5 of the programme review, choose “Export priorities and questions for module teams” and send the file to module leaders. They open Programme priorities in their module review and import it. The prompts are optional, and the module team can note a response against each.',
          },
          {
            title: 'Module to programme',
            text: 'On the module summary, choose “Export module contribution” and send the file to the programme team. They open Module contributions in their programme review and import it, then can see each module’s assessment positions, confidence, proposed actions, matters for discussion and contribution, with the full findings on request.',
          },
          {
            title: 'In the same browser',
            text: 'If both reviews are saved in the same browser, each page offers to add them directly, without exporting a file. A whole exported review file can also be imported in place of the shorter contribution or prompts file.',
          },
        ],
      },
      {
        kind: 'ul',
        items: [
          'Importing never overwrites anything else in either review.',
          'Importing the same file twice changes nothing. If a newer version arrives, you are asked before it replaces the one you hold; your own notes on it are kept.',
          'A module can contribute to several programmes. Each programme keeps its own copy and notes, and nothing is ever written back to the module review.',
          'Module contributions are the module team’s observations and proposals. They are not treated as programme decisions, and having none is not a weakness.',
        ],
      },
    ],
  },
  {
    id: 'statement',
    heading: 'The Programme AI Integration Statement',
    blocks: [
      {
        kind: 'p',
        text: 'The statement is drafted from the programme review and can be started at any time; module reviews are not required. It has five sections: our approach to AI, graduate capabilities, curriculum and assessment, responsible AI, and review and development. Aim for around 400–600 words where the evidence supports it.',
      },
      {
        kind: 'p',
        text: 'Every drafted sentence comes from something your team recorded, and is labelled with what it is based on:',
      },
      {
        kind: 'ul',
        items: [
          'Existing practice: current practice, as recorded in the review.',
          'Proposed development: a priority or opportunity you identified. It is never described as already done.',
          'Programme-team decision: a judgement or position the team recorded.',
          'Module-level observation: reported by a module team. You can turn module examples off.',
          'To confirm: information that is missing or carried over. It appears as a bracketed question, for example [When will the programme team next review this statement?].',
        ],
      },
      {
        kind: 'p',
        text: 'The labels appear on screen only; the printed statement is plain text. Choose “Edit this section” to put any section into your own words. Your text is kept if review answers change later; the tool tells you when an updated draft is available and lets you keep your text or use the new draft.',
      },
      {
        kind: 'steps',
        items: [
          {
            title: 'Draft',
            text: 'The starting status. Answer or edit out any items to confirm.',
          },
          {
            title: 'Under programme-team review',
            text: 'Shared with the team for discussion.',
          },
          {
            title: 'Agreed',
            text: 'Only when you choose “Record approval” and enter the approving team or role and the date. Nothing else marks it agreed. If the text changes afterwards, the tool says so until approval is recorded again.',
          },
        ],
      },
      {
        kind: 'p',
        text: 'Copy the text, print or save it as a PDF (optionally with an appendix of supporting evidence from the programme review and module contributions), or export it as a structured file. The statement can be used as supporting documentation for Academic Unit Review, programme review and external review.',
      },
    ],
  },
  {
    id: 'previous-version',
    heading: 'Reviews from the previous version',
    blocks: [
      {
        kind: 'p',
        text: 'The previous version of the tool held one combined review (Parts A–D). It remains available, unchanged, as the Classic tool, so earlier work can still be opened and compared.',
      },
      {
        kind: 'p',
        text: 'If a review from the previous version is saved in your browser, the home page offers to bring it in. Download the backup it offers first. You can also import a file exported from the previous version. Either way, the original is not changed.',
      },
      {
        kind: 'ul',
        items: [
          'One earlier review becomes one programme review and one module review for each module, already linked.',
          'Details, capability selections, learning outcomes, assessments, comments, actions and statement text are carried over.',
          'Earlier ratings are copied only where they mean the same thing. Otherwise the new question is left for your team to answer, and the earlier answer is shown read-only under “From your review in the previous version”.',
          'The earlier assessment ratings appear in each assessment’s “Explore Assessment Design in More Detail” section.',
          'The progression map used seven rows; it now has five. Cells combined into a new row are outlined in amber until you confirm them.',
          'A statement marked agreed in the previous version starts here as a draft; its text is shown on the statement page for reuse.',
          'Notes on exactly what was carried over are on each review’s context page.',
        ],
      },
    ],
  },
  {
    id: 'saving',
    heading: 'Saving, sharing and backups',
    blocks: [
      {
        kind: 'p',
        text: 'Everything is saved automatically in this browser, on this computer. Nothing is sent to a server. A new review is saved as soon as you enter something in it.',
      },
      {
        kind: 'ul',
        items: [
          'You can keep several programme and module reviews; starting or importing one never overwrites another. They are listed under Saved reviews, where you can open, export or delete them.',
          'Use “Export review” to save a file for backup or to send to a colleague, and “Import existing review” on the home page to open one.',
          '“Export data” on the home page saves every review in this browser as one file, for example to move to another computer.',
          'Reviews do not move between browsers or computers by themselves. Export and import to do that.',
          'Clearing your browser data deletes saved reviews. In some private windows nothing can be saved at all; the tool shows a warning if so. Export regularly.',
        ],
      },
    ],
  },
  {
    id: 'accessibility',
    heading: 'Using the tool with a keyboard or screen reader',
    blocks: [
      {
        kind: 'ul',
        items: [
          'Press Tab from the top of any page to reach “Skip to content”.',
          'Every control can be reached and used with the keyboard. Choose an answer with the arrow keys or space; choose “Clear answer” to remove it.',
          'Optional guidance and detail are in sections that open and close with Enter or space.',
          'The menu shows which sections are answered, with a tick and the words “answered” for screen readers.',
          'Summaries and the statement are laid out for printing; use your browser’s print command to save them as a PDF.',
        ],
      },
    ],
  },
  {
    id: 'faq',
    heading: 'Questions',
    blocks: [
      {
        kind: 'faq',
        items: [
          {
            q: 'Do we have to finish the programme review before module reviews?',
            a: 'No. Either can be started first and each can be completed on its own.',
          },
          {
            q: 'Do we have to fill in the detailed assessment section?',
            a: 'No. The three questions for each assessment are all that is needed.',
          },
          {
            q: 'Why are some answers blank after bringing in our earlier review?',
            a: 'Where an earlier rating did not mean the same as a new question, it was not copied, so that nothing is reinterpreted. The earlier answer is shown read-only beside the question.',
          },
          {
            q: 'Does importing a module contribution change our programme review?',
            a: 'It only adds the contribution to Module contributions. Your answers, priorities and statement are not changed, and module findings are never treated as programme decisions.',
          },
          {
            q: 'Can we agree a statement that still has items to confirm?',
            a: 'You will be warned first. It is better to answer the question in the review or edit the section, so that the agreed statement contains no placeholders.',
          },
          {
            q: 'Can colleagues work on the same review at the same time?',
            a: 'Not live. Each person works in their own browser; share by exporting and importing files.',
          },
        ],
      },
    ],
  },
]
