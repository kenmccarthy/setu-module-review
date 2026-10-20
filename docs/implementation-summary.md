# Implementation summary — SETU AI Integration Review v2

This summarises the redevelopment of the AI Programme & Module Review into two shorter,
connected tools, as set out in the _SETU AI Integration Review — Redevelopment Specification_.
The approved plan and stage-by-stage progress are in `docs/v2-implementation-plan.md`.

## What changed

| Stage | Change                                                                                                                                                                                                                                                                                                |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0     | The original tool stays live as the Classic tool at `/classic/`, built in the same Pages deployment from a fixed commit (`CLASSIC_REF`).                                                                                                                                                              |
| 1     | Version 2 data model: independent programme and module reviews, exchange packets and the statement. v1 → v2 migration that never reinterprets data and keeps the full original. Multi-review browser storage that never writes the v1 key. Import of every supported file type.                       |
| 2     | New landing page with two equal entry points, saved reviews, an offer to bring in an earlier review (with backup first), and navigation that shows only the current review's sections.                                                                                                                |
| 3     | Programme AI Integration Review: context, five sections, summary, export of priorities and questions for module teams.                                                                                                                                                                                |
| 4     | Module AI Integration Review: context, four sections, three core questions per assessment, optional detailed assessment design, summary and module contribution export.                                                                                                                               |
| 5     | Connected workflow: Module contributions (programme side) and Programme priorities (module side), with duplicate detection and confirmed updates.                                                                                                                                                     |
| 6     | Programme AI Integration Statement: five-section drafting with provenance labels and placeholders, team editing that survives data changes, Draft / Under review / Agreed with recorded approval, print, copy and JSON export, optional evidence appendix. The old v1 screens and logic were removed. |
| 7     | Rewritten in-app user guide with "Guide for this section" links, README and this summary.                                                                                                                                                                                                             |

Retained from v1: the stack (React, TypeScript, Vite, Tailwind, Zustand, Zod, React Router,
Vitest), GitHub Pages deployment, repository URL and base path, the visual identity, form field
components, the I–P–E–D progression grid, capability lists, the detailed assessment prompts and
option lists, and JSON import/export.

## Acceptance criteria (specification §12)

Automated tests are in `tests/`; browser checks were run with Playwright in Chromium against a
production build served under `/setu-module-review/`.

**Independent use**

- Programme review without module reviews; module review without a programme review —
  `exchange.test.ts` (independence), `workspace.test.ts`, browser.
- Multiple modules reviewed independently; nothing overwritten — `workspace.test.ts`,
  `importLibrary.test.ts`.
- Save and resume — `workspace.test.ts`; browser reload checks in each review.

**Programme review**

- Five sections work and persist — browser walk-through; `programmeSummary.test.ts`.
- I–P–E–D map across configurable stages — `programmeSummary.test.ts` (stages beyond the
  programme ignored), browser.
- Provisional statement without module data — `statement-v2.test.ts`, browser.

**Module review**

- Four sections, multiple assessments, three core questions; advanced detail optional and never
  needed for progress — `moduleSummary.test.ts`, browser.
- Module summary exported independently — browser (print, copy, JSON, module contribution).

**Connected workflow**

- Prompts into a module review and contributions into a programme review, without overwriting
  unrelated work — `connected.test.ts`, `exchange.test.ts`, two-browser Playwright run.
- Duplicates handled; newer versions replace older ones only with confirmation; shared modules
  contribute to more than one programme independently — `exchange.test.ts`,
  `connected.test.ts`, browser.

**Statement**

- Five sections; claims come only from recorded responses; proposed actions not described as
  completed; module findings not presented as programme decisions; team text preserved when
  answers change; Draft and Agreed distinguished and Agreed only by recorded approval; export —
  `statement-v2.test.ts`, browser.

**Migration**

- v1 JSON exports and v1 browser data migrate; legacy assessment detail and statement text are
  kept; invalid files are rejected without data loss; newer schema versions are not downgraded;
  the original can be recovered — `migrate.test.ts`, `legacyStorage.test.ts`, `importV2.test.ts`,
  `importLibrary.test.ts`, `io.test.ts`.

**Technical quality**

- Lint (oxlint), type checking, unit tests (95) and production build pass, and CI runs all four.
- Keyboard: a skip link, native radio buttons and disclosures, and visible focus rings; checked in
  the browser for the skip link and form controls.
- Responsive layout: no horizontal page scroll at 375px on the landing page, progression map and
  assessment pages.
- Print: programme summary, module summary and statement checked with print emulation.

## Limitations and known gaps

- **Data stays in one browser.** Reviews are not shared between computers or people
  automatically; teams exchange files. Clearing browser data deletes saved reviews, including
  the Classic tool's, because both share the site's storage.
- **Update detection uses timestamps.** A contribution or set of prompts is recognised as newer
  by the exporting review's last-changed time, so a computer with a wrong clock could mislabel
  newer and older versions. The user is always asked before anything is replaced.
- **Statement wording is template-based.** Sentences are assembled from recorded answers and
  will often need rewording by the team. A fully migrated sample produces about 370 words, below
  the 400–600 guide, until the remaining questions are answered.
- **Accessibility testing was limited.** Checks were automated in Chromium; there has been no
  formal WCAG audit, screen-reader testing or testing in other browsers. A short accessibility
  review with real users is recommended before wider rollout.
- **Browser tests are not in CI.** The Playwright walk-throughs were run during development; CI
  runs lint, type checking, unit tests and the build.
- **Some v1 content remains in use.** `src/content/{module,capabilities,scales,programme,synthesis,statement}.ts`
  still supply the detailed assessment prompts and the labels for read-only v1 answers.
- **The Classic tool is pinned by commit.** No `v1.0.0` tag or `legacy/v1` branch was created;
  either can be added later, and v1 fixes ship by changing `CLASSIC_REF`.
- **Bundle size.** The single JavaScript bundle is about 540 kB (160 kB compressed), above Vite's
  advisory 500 kB warning. It loads once and is cached; code-splitting could be added if needed.
