# SETU AI Integration Review

A browser-based tool that supports SETU academic teams to make informed decisions about
curriculum, assessment and graduate capabilities in an AI-enabled world. It implements the
_SETU AI Integration Review — Redevelopment Specification_ and replaces the earlier single,
combined AI Programme & Module Review.

It offers two shorter reviews that can be used separately or together, and one shared output:

- **Programme AI Integration Review**: programme context plus five sections (graduate
  capabilities, AI capability progression with the I–P–E–D map, curriculum and assessment,
  programme coherence, priorities and next steps) and a programme review summary.
- **Module AI Integration Review**: module context plus four sections (learning outcomes,
  teaching and learning, assessment, reflection and next steps). Each assessment asks three
  questions; the detailed v1 assessment parameters are kept in an optional "Explore Assessment
  Design in More Detail" section. Ends with a module summary and a contribution to the statement.
- **Programme AI Integration Statement**: five sections drafted from the programme review (and,
  optionally, linked module contributions). Every drafted sentence is labelled with its basis
  (existing practice, proposed development, programme-team decision, module-level observation,
  or to confirm), the team can rewrite any section, and the statement is marked agreed only when
  an approval is recorded.

The reviews connect both ways: a programme team can export priorities and questions for module
teams, and module teams can export a module contribution for the programme review. Imports never
overwrite unrelated work, repeat imports are recognised, and newer versions replace older ones
only after confirmation.

A user guide is built into the app at `/help` (linked from every review page as "Guide for this
section").

## The Classic tool

The original combined review (Parts A–D) is still published, unchanged, at
`https://<owner>.github.io/<repo-name>/classic/`, for comparison and for teams that want to open
earlier work there. It is built from a fixed commit (`CLASSIC_REF` in
`.github/workflows/deploy.yml`) so changes on `main` never alter it.

## How data is stored

Everything is client-side; no data is sent to a server.

- Each review is saved to its own `localStorage` entry (`setu-air:v2:review:<id>`), with an index
  of saved reviews in `setu-air:v2:index`. Programme and module reviews are kept separately and
  any number can be saved; each has its own id, created and updated dates, schema version and
  status.
- A new review is saved once something is entered in it.
- The Classic tool, served from the same origin, owns the key `setu-ai-review`. The new app only
  reads it, to offer to bring an earlier review in, and never writes it (a test checks that
  only `src/store/library.ts` names the key and nothing uses zustand's `persist` middleware).

### Files the tool reads and writes

| File                                | Written by                                    | Read by                                   |
| ----------------------------------- | --------------------------------------------- | ----------------------------------------- |
| v1 review (`schemaVersion: 1`)      | the Classic tool                              | Import: migrated into new reviews         |
| programme or module review (`kind`) | "Export review"                               | Import; Module contributions / priorities |
| bundle (`packetType: library`)      | "Export data" / "Export all reviews"          | Import                                    |
| `module-contribution`               | module summary → "Export module contribution" | programme review → Module contributions   |
| `programme-prompts`                 | programme section 5 → export for module teams | module review → Programme priorities      |
| `programme-statement`               | statement → "Export statement (JSON)"         | (for records; not re-imported)            |

Files from a newer schema version are rejected rather than downgraded, and invalid files are
rejected without changing anything.

### Bringing in reviews from the previous version

`src/migrate/v1ToV2.ts` turns one v1 review into one programme review plus one module review per
module, linked as contributions. Fields with a direct equivalent are carried over; a v1 rating is
mapped only where it means the same thing, otherwise the new question is left unanswered with a
note and the v1 answer is shown read-only. The complete original is kept in `legacy.original`,
so the v1 review can always be recovered. The progression map's seven v1 rows map to five; cells
combined into a new row are flagged until the team confirms them. A backup download is offered
before migrating, the v1 entry is never changed, and a failed write removes any partial copy.

## Development

```bash
npm install
npm run dev           # local dev server
npm run lint          # oxlint
npm run typecheck     # tsc
npm test              # vitest
npm run format:check  # prettier
npm run build         # production build to dist/
```

Stack: Vite, React, TypeScript, Tailwind CSS, Zustand (+ immer), Zod, react-router (hash routing
so deep links work on GitHub Pages), Vitest.

## Architecture

Business logic is in pure functions; components are thin. Both reviews share the same field
components, navigation, storage and exchange code.

```
src/model/legacy/   the v1 schema, frozen (v1 files must keep loading)
src/model/v2/       v2 schemas (programme review, module review, statement, exchange packets)
src/migrate/        v1 → v2 migration and the in-browser migration runner
src/store/          saved-review library, workspace store, import/export, downloads
src/logic/v2/       summaries, progress, exchange, statement drafting, legacy views (pure)
src/features/home/        landing page, saved reviews, import, legacy-review banner, sample
src/features/programme/   programme sections, summary, module contributions
src/features/module/      module sections, assessment cards, summary, programme priorities
src/features/statement/   statement drafting, editing, approval, print
src/features/review/      review routing, section paging, shared review components
src/components/     form fields, progression map, app shell and navigation
src/content/v2/     question text and response options from the redevelopment specification
src/content/        v1 text and option lists, still used by the detailed assessment fields,
                    the read-only legacy views and the user guide
tests/              vitest specs (migration, storage, import/export, exchange, summaries,
                    statement, navigation, content)
docs/               implementation plan and implementation summary
```

## Deployment

A second workflow, `.github/workflows/webserver-package.yml`, builds the same site for
`https://ai.setu.ie/review/` (Classic tool at `/review/classic/`) and offers it as a downloadable
artifact for manual upload to the SETU web server. It deploys nothing. See
[docs/setu-webserver-deployment.md](docs/setu-webserver-deployment.md).

### GitHub Pages

`.github/workflows/deploy.yml` runs on every push to `main` (or manually via "Run workflow"). It
builds the app with `VITE_BASE=/<repo-name>/`, builds the Classic tool from `CLASSIC_REF` with
`VITE_BASE=/<repo-name>/classic/` into `dist/classic/`, and publishes both as one GitHub Pages
site at `https://<owner>.github.io/<repo-name>/`.

Three one-time repository settings are required, otherwise the `deploy` job is rejected and Pages
serves the raw source instead of the built app:

1. **Settings → General → Default branch: `main`.**
2. **Settings → Pages → Build and deployment → Source: "GitHub Actions"** (not "Deploy from a
   branch").
3. **Settings → Environments → `github-pages` → Deployment branches and tags: allow `main`** (or
   "No restriction"). GitHub creates this rule automatically from whichever branch first enabled
   Pages; if that was not `main`, deployments from `main` are rejected before they start.
