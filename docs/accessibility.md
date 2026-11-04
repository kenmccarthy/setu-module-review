# Accessibility check — SETU AI Integration Review

**Scope:** the current tool (Programme review, Module review, Programme AI Integration Statement,
home page, saved reviews and help). The Classic tool at `/classic/` is a frozen copy of the
previous version and was not included.

**Standard:** WCAG 2.2 level AA, the level normally expected of public-sector websites.

**Date:** November 2026, on the code that includes the fixes listed below.

## Summary

- **Automated testing (axe-core):** no WCAG failures on any of the 19 screens tested, once the
  fixes below were made.
- **Scripted checks:** every screen passed the keyboard, zoom, narrow-screen and print checks.
- **Not yet confirmed:** full WCAG 2.2 AA conformance. Automated and scripted checks find many
  issues but not all of them. Screen-reader testing and testing with disabled users are still
  needed (see [What still needs testing](#what-still-needs-testing)).

## What was tested

All checks were run in Chromium (Playwright) on a production build served under `/review/`. The
sample review was loaded so that every screen had realistic content. Lists, optional sections
and the approval form were opened so that hidden content was checked too.

The 19 screens were:

- home, saved reviews and help;
- the programme review's context, five sections, summary, module contributions and statement;
- the module review's context, four sections (including an assessment with its detailed section
  open), summary and programme priorities.

| Check                | How                                                                                                                                                                               | Result                                                                                                                                                                  |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Automated rules      | axe-core 4.10 with the WCAG 2.0, 2.1 and 2.2 A/AA rules and best-practice rules, on every screen                                                                                  | No violations after the fixes below                                                                                                                                     |
| Colour contrast      | axe-core, plus every use of light grey text checked by hand                                                                                                                       | All text at least 4.5:1 after the fixes                                                                                                                                 |
| Keyboard reach       | Tab from the top of each screen through every control and back to the start                                                                                                       | Every control reached on every screen (radio groups count once: arrow keys move within them); no keyboard traps                                                         |
| Visible focus        | Focus style checked on every control reached                                                                                                                                      | Every control shows a visible focus ring                                                                                                                                |
| Keyboard operation   | Skip link; start a review; type into fields; choose answers with arrow keys; open optional sections with Enter; mark the progression map with Space; add an assessment with Enter | All work with the keyboard alone                                                                                                                                        |
| Page structure       | One `h1` per screen; heading levels in order; labelled `main` and `nav` landmarks; page language set (`en`)                                                                       | Passed after the heading fix below                                                                                                                                      |
| Reflow (WCAG 1.4.10) | Every screen at 320 CSS px wide                                                                                                                                                   | No sideways page scrolling. The progression map and the assessment overview table scroll sideways inside their own boxes, which WCAG allows for two-dimensional content |
| Zoom 200%            | Every screen at 640 CSS px wide (200% of a 1280 px window)                                                                                                                        | No clipped content or sideways page scrolling                                                                                                                           |
| Print                | Programme summary, module summary and statement in print mode                                                                                                                     | Menus and buttons hidden; text at least 12 px                                                                                                                           |

## Issues found and fixed

1. **Light grey text below the contrast minimum (WCAG 1.4.3 and 1.4.11).** Several elements used
   `#94a3b8` on white (2.6:1):
   - list numbers;
   - the unselected I/P/E/D letters on the progression map;
   - section numbers in the menu;
   - the +/− and ▾ symbols on optional sections.

   They now use `#64748b` (4.8:1 on white, 4.5:1 on the pale grey panels).

2. **Placeholder text too faint (WCAG 1.4.3).** Example text inside empty boxes, such as "e.g.
   8", used half-strength text (about 3:1). It now uses the same `#64748b`.
3. **Heading levels skipped on the Assessment page (WCAG 1.3.1).** The detailed-assessment
   headings jumped from level 1 to level 4. Each assessment's title is now a level-2 heading
   and its subheadings are level 3.

## Features that support accessibility

- **Navigation:** a "Skip to content" link, and the same menu and page structure on every
  screen.
- **Forms:** native form controls (radio buttons, checkboxes, text boxes and open/close
  sections) with visible labels, so they work with keyboards and assistive technology.
- **Neutral answer options:** answers are not colour-coded. Selected answers are shown by a
  filled radio button, a border and a tint, not by colour alone.
- **Progress:** progress ticks in the menu also say "(answered)" to screen readers. The
  progression map buttons announce their capability, stage and phase, for example "Critical
  evaluation of AI outputs, stage 2: Introduced", and whether they are pressed.
- **Status messages:** the result of an import is announced as a status message; errors are
  announced as alerts.
- **Data:** nothing times out, and work is saved as it is entered.

## What still needs testing

These need people and other software, and should be done before the tool is promoted widely:

- **Screen readers:** NVDA or JAWS with Chrome or Edge on Windows, and VoiceOver with Safari on
  macOS and iOS. Complete one programme review and one module review, including the statement
  and approval.
- **Other browsers:** Firefox, Safari and Edge, including keyboard use and printing.
- **Zoom and text size in a real browser:** 200% and 400% browser zoom, and text-only enlargement
  (WCAG 1.4.4 and 1.4.12, text spacing).
- **Speech recognition:** for example Dragon or Voice Control. Check every button can be
  activated by saying its visible label.
- **Users with disabilities:** a short session with two or three users, ideally through SETU's
  disability or accessibility service.
- **Content:** a plain-language read of the question wording (WCAG 3.1.5 is AAA, but helpful).

### Quick manual checklist

- [ ] Using only the keyboard, start a programme review, answer every section, mark the
      progression map and open the statement.
- [ ] Do the same for a module review with two assessments, including the detailed section.
- [ ] With a screen reader, check that each question is read with its options, that the chosen
      answer is announced, and that import messages are read out.
- [ ] At 400% zoom, check nothing is cut off and every control can still be used.
- [ ] Print the statement and check it reads correctly without colour.

## Keeping it accessible

Re-run an axe-core scan (for example with the axe DevTools browser extension) and the manual
checklist after changes to layout, colours or form controls. Use `slate-500` (`#64748b`) or
darker for any grey text.
