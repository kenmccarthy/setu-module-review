# AI Programme & Module Review Tool

A browser-based tool that supports SETU programme teams to review curriculum and assessment in the
context of increasingly capable Generative AI. It implements the _AI Programme & Module Review Tool_
specification:

- **Part A – Programme Review**: context, graduate capabilities, AI capability progression map,
  programme assessment portfolio (derived from Part B), vulnerability × assurance check, coherence.
- **Part B – Module & Assessment Review**: each module and each of its assessments (sections 8–16).
- **Part C – Programme Synthesis**: dashboard with data-driven suggested ratings, automatic pattern
  detection, team discussion, categorised action plan and a generated Final Programme Review Summary.
- **Part D – AI Integration Statement**: a first draft of every statement section is generated from
  the review responses for the team to amend and approve, plus the external review evidence table.
- **Print / Save as PDF**: a print-styled view of the whole review.

## How data is stored

Everything is client-side. The review is autosaved to the browser's `localStorage` and can be
exported to / imported from a JSON file for backup or to share with colleagues. No data is sent to
a server.

## Development

```bash
npm install
npm run dev        # local dev server
npm run lint       # oxlint
npm run typecheck  # tsc
npm test           # vitest (pure logic: flags, patterns, summary, statement, import/export)
npm run build      # production build to dist/
```

Stack: Vite, React, TypeScript, Tailwind CSS, Zustand (+ immer, persist), Zod, react-router (hash
routing so deep links work on GitHub Pages).

## Project layout

```
src/content/    question text, prompt lists and rating scales transcribed from the specification
src/model/      Zod schema, defaults, sample review
src/store/      Zustand store (localStorage persistence) and JSON import/export
src/logic/      pure functions: flags, portfolio, patterns, dashboard, summary, statement drafts
src/components/ reusable form fields and the app shell
src/pages/      one page per part / section
tests/          vitest specs for src/logic and src/store
```

## Deployment

`.github/workflows/deploy.yml` builds the app and publishes `dist/` to GitHub Pages on every push
to `main` (or manually via "Run workflow"). The build uses `VITE_BASE=/<repo-name>/` so assets
resolve under the project path, and the site is served at
`https://<owner>.github.io/<repo-name>/`.

Three one-time repository settings are required, otherwise the `deploy` job is rejected and Pages
serves the raw source instead of the built app:

1. **Settings → General → Default branch: `main`.**
2. **Settings → Pages → Build and deployment → Source: "GitHub Actions"** (not "Deploy from a
   branch").
3. **Settings → Environments → `github-pages` → Deployment branches and tags: allow `main`** (or
   "No restriction"). GitHub creates this rule automatically from whichever branch first enabled
   Pages; if that was not `main`, deployments from `main` are rejected before they start.
