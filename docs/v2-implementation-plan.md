<!-- Approved implementation plan for the v2 redevelopment. Progress is tracked at the end. -->

# Plan — SETU AI Integration Review v2 (two connected tools)

## Context

Staff feedback says the current single 21-section review (Parts A–D) is too long. The v2 spec
(`AI_Programme__Module_Review_Tool_-_v2.md`) asks us to refactor, not rebuild, into two shorter,
independently usable tools — **Programme AI Integration Review** (5 sections) and **Module AI
Integration Review** (4 sections) — that exchange data and feed one five-section **Programme AI
Integration Statement**. Existing v1 data must survive. The original tool is kept live
for review and comparison.

## Decision: hosting v1 alongside v2 (same repo, two paths)

A Pages site serves one artifact per repo, so a branch alone can't host both. Instead, one deploy
publishes both builds:

- Pin the current `main` commit (925fa57) as `CLASSIC_REF` in `deploy.yml`. A `v1.0.0` tag or a
  `legacy/v1` branch for v1 bug fixes can be added later; bump `CLASSIC_REF` to ship such a fix.
- Change `.github/workflows/deploy.yml` so the `build` job:
  1. builds `main` with `VITE_BASE=/setu-module-review/` → `dist/`
  2. checks out `CLASSIC_REF` into `classic-src/`, then `npm ci && npm run build` with
     `VITE_BASE=/setu-module-review/classic/` → copies into `dist/classic/`
  3. uploads `dist/` as the single Pages artifact.
     No change to the Pages environment rule is needed: it still deploys only from `main`.
- v2 at `https://kenmccarthy.github.io/setu-module-review/`, v1 at `.../classic/`. Repo URL and base
  path stay as spec §11 requires. The v2 landing page links to the "Classic (v1) tool".
- **localStorage**: both builds share the origin `kenmccarthy.github.io`. v1 owns the key
  `setu-ai-review`; v2 must **never write it**, only read it for migration. v2 uses new keys
  (`setu-air:v2:index`, `setu-air:v2:review:<id>`). So v1 keeps working on the same data.
- Do the v2 work on a long-lived branch (`claude/beautiful-darwin-f2wgyj` → PRs to `main`
  per stage); `main` keeps deploying v1 until Stage 8 merges, so nothing breaks mid-way. Stage 1 of
  the delivery (below) lands the deploy-workflow change first so `/classic/` exists before v2 ships.

## Current codebase (what we reuse)

~7k lines, React 19 / TS / Vite / Tailwind 4 / Zustand+immer+persist / Zod 4 / HashRouter / Vitest.

- `src/model/schema.ts` — single `ReviewSchema` v1 (programme, modules[], synthesis, statement).
- `src/store/reviewStore.ts` — one persisted review under `setu-ai-review`.
- `src/store/io.ts` — `parseReviewJson` already has version check + a `migrate()` stub.
- `src/components/fields/*` (RatingScale, Field, Guidance, CheckList, Section, CapabilityPicker, Pill)
  — reused as-is; `Guidance` gives progressive disclosure.
- `src/pages/programme/ProgressionPage.tsx` — I–P–E–D map with configurable stages; reused.
- `src/content/capabilities.ts`, `scales.ts` (AI_POSITIONS already = restricted/limited/integrated/
  open/not_relevant), `help.ts`.
- `src/logic/statement.ts`, `summary.ts`, `text.ts` — pure-function drafting; refactored to 5 sections.
- `src/logic/dashboard.ts`, `flags.ts`, `patterns.ts` — RAG/score style; kept only for the
  advanced/legacy view (spec §10 forbids scores as the principal outcome).

## Target architecture

```
src/model/v2/        schemas: ProgrammeReview, ModuleReview, Statement, exchange packets
src/model/legacy/    frozen copy of v1 schema (for parsing old data)
src/migrate/         v1→v2 pure functions + localStorage migration runner
src/store/           library store (index of saved reviews) + per-review stores
src/features/home/        landing page, saved reviews, import
src/features/programme/   5 sections + summary + Module Contributions
src/features/module/      context + 4 sections + summary + Programme Priorities
src/features/statement/   5-section statement, evidence appendix, approval
src/features/exchange/    export/import of prompts & contributions, duplicate handling
src/components/      shared fields + context-aware Shell/nav
```

### Data model (schemaVersion 2)

Common envelope per review: `{ schemaVersion: 2, kind: 'programme'|'module', id, createdAt,
updatedAt, status: 'in_progress'|'complete', legacy?: {...} }`.

- **ProgrammeReview**: context (reuse v1 programme fields incl. `stages`); S1 `independentCapabilities`
  (text + `Capability[]`), `aiEnabledCapabilities` (text + `Capability[]`), `ploAdequacy`;
  S2 `progression` record (5 capability ids), `progressionCoherent`, `progressionGaps`;
  S3 `opportunitiesConfidence`, `balance`, `confidenceConcerns`, `modulesForConsideration`;
  S4 `coherencePrompts` notes, `approach`, `strengthen`; S5 `strengths`, `opportunities`,
  `priorities[≤3]`, `moduleQuestions[]` (each with stable id); `moduleContributions[]` (imported);
  `statement` (below).
- **ModuleReview**: context (title|code required only); S1 `loAppropriate`, two reflections,
  `learningOutcomes[]` (advanced, from v1); S2 `ltOpportunities`, `responsibleEngagement`,
  `enhance`; S3 `assessments[]` each = core {title, weighting, type, semester, `aiRole`,
  `confidence`, `action`, `rationale`} + `advanced` {all v1 assessment fields}; S4 working-well,
  enhance, programme-discussion, `nextSteps[≤3]`, `alignment`; `contribution` text;
  `programmePriorities[]` (imported, keyed by source programme id + prompt id).
- **Statement** (inside programme review): `sections` (5 ids, team text overrides — empty = use
  draft), `status: draft|under_review|agreed`, `programmeName`, `approvalDate`, `approvedBy`,
  `nextReviewDate`, `legacySections` (v1 ten-section text preserved verbatim).
- **Exchange packets** (JSON): `ModuleContributionPacket {packetType:'module-contribution',
sourceReviewId, revision, exportedAt, summary...}`; `ProgrammePromptsPacket
{packetType:'programme-prompts', sourceReviewId, revision, prompts[]}`. `revision` increments on
  each export; import matches on `sourceReviewId` → "update to revision N or keep existing".
  A module imported into several programmes is copied per programme; programme-side notes live on
  the contribution wrapper, never on the source module review.

### Migration v1 → v2 (no silent reinterpretation)

One v1 review → one ProgrammeReview + one ModuleReview per v1 module (linked: module
`associatedProgrammes` gets the programme id, and the programme gets each as a contribution).

- Direct reuse: programme context, stages, capability lists, module context, LO list, assessment
  title/weighting/type/semester/position→`aiRole`, PLO comments, statement dates, actions.
- Mapped only where unambiguous: `ploCheckpoint` yes→Yes, discuss/partially→Partially, no→Not yet.
  `protectedCapabilities`→independent, `humanAiCapabilities`→AI-enabled (both retained).
- Not mapped (left unanswered, original kept in `legacy`): QUALITY ratings (progression, coherence,
  L&T), vulnerability/assurance → confidence, dashboard, patterns, discussion.
- Progression 7→5 rows: evaluation, discipline, oversight map 1:1; literacy+ethics → "AI literacy
  and responsible use" (union of phases, flagged "migrated – please confirm"); genai → "human–AI
  collaboration" (flagged); agentic kept in `legacy.progression` and shown read-only.
- v1 synthesis actions: programme-scope → `priorities` candidates in legacy panel (not auto-filled
  beyond 3); module-scope → that module's `nextSteps` (≤3, rest in legacy).
- v1 statement section text preserved in `legacySections`, shown beside the new sections.
- Runner: on first v2 load, if `setu-ai-review` exists and no v2 index → offer **"Download a
  backup of your existing review"** first, then migrate into new keys. v1 key is never modified.
  On failure: show recovery message, keep original, offer raw-JSON download.
- `parseReviewJson` dispatch: v1 → migrate; v2 → validate; >2 → reject (no downgrade); packets →
  exchange import; invalid → reject without touching state.

## Delivery stages (CI green before each merge)

0. **Freeze & dual deploy** — pin `CLASSIC_REF`, update `deploy.yml` to publish `/classic/`.
   Verify v1 still works at both paths. Stages 0–1 change no UI, so they can merge to `main` early;
   stages 2–7 stay on the branch until release so the live tool never shows a half-built v2.
1. **Data model & migration** — `src/model/v2`, `src/model/legacy`, `src/migrate`, library store,
   tests (fixtures from `tests/fixture.ts` + `src/model/sample.ts`): round-trip, field-preservation
   checklist, unmappable ratings stay unanswered, future-version rejection, invalid-file safety.
2. **Landing & navigation** — new Home (two cards, Start/Continue, secondary actions, link to
   Classic), saved-reviews list (badged Programme/Module), context-aware `Shell` (only the current
   tool's sections + Statement + Home).
3. **Programme Review** — 5 section pages reusing fields + `ProgressionPage` grid (refactored to a
   component taking capability list + stages); summary page; print/JSON export.
4. **Module Review** — context + 4 sections; assessment card with 3 core questions; collapsible
   "Explore Assessment Design in More Detail" reusing v1 `AssessmentPage` fields; summary +
   contribution; independent export.
5. **Connected workflow** — export/import packets, Programme Priorities and Module Contributions
   views (empty states that don't imply weakness), duplicate/update confirm dialog.
6. **Statement** — refactor `logic/statement.ts` into 5 pure generators; tag each sentence by
   provenance (existing practice / proposed / team decision / module observation / to confirm);
   placeholders for missing data; status & approval (Agreed only via explicit action);
   copy/print/JSON; optional evidence appendix.
7. **Docs & QA** — rewrite `content/help.ts` user guide and README; implementation summary.
8. **Release** — merge to `main`; dual deploy publishes v2 + classic.

## Verification

- `npm run lint && npm run typecheck && npm test && npm run build` per stage (CI does the same).
- New Vitest suites: `migrate.test.ts`, `exchange.test.ts` (no overwrite, dedupe, revision update,
  shared module across 2 programmes), `statement-v2.test.ts` (claims trace to responses, proposed
  ≠ completed, imported findings not called approved, team text survives regeneration, status),
  `independence.test.ts` (programme with no modules → provisional statement; module with no programme).
- Playwright (preinstalled Chromium) smoke run against `vite preview` with base `/setu-module-review/`:
  seed v1 localStorage → open v2 → backup offered → migrated reviews appear → v1 at `/classic/`
  still shows the original data; keyboard-only walk of each tool; 375px viewport; print emulation.
- After Stage 0 and Stage 8 deploys, check both URLs load on GitHub Pages.

## Open points to confirm during Stage 1 review

- Progression 7→5 mapping above (especially literacy+ethics merge and genai→collaboration).
- Whether migrated v1 modules should be auto-linked as contributions to the migrated programme
  (proposed: yes, marked "imported from v1").

## Progress

- [x] Stage 0 — `/classic/` published from `CLASSIC_REF` in `deploy.yml`.
- [x] Stage 1 — v2 schemas (`src/model/v2`), frozen v1 schema (`src/model/legacy/v1.ts`), migration
      (`src/migrate`), multi-review storage (`src/store/library.ts`), import dispatch
      (`src/store/importV2.ts`), exchange logic (`src/logic/v2/exchange.ts`) and tests. No UI changes yet.
- [ ] Stages 2–8.
