# Simulator redesign verification — 2026-11-23

## Scope and design
User approved research, Design Council planning and implementation in advance. A pause stopped work after the first domain edits; the user then resumed and requested Chrome. The completed surface uses next-semester planning first, optional remaining-degree planning, shared scenario math and visible number provenance.
Design Council passes: /distill (one connected workspace), /clarify (plain scope/input/result copy), /layout (inputs beside evidence, compact baseline), /harden (validation, stale sources, persistence failures), /adapt (mobile/dialog bounds), /polish (spacing/focus/launcher), /verify (domain tests and Chrome).
Approved mascots, theme palette, fonts, global navigation and grade-store schema retained. No new package installed.

## Research applied
- https://advising.uw.edu/academic-support/gpa-calculator/ — expected course grades/credits, recorded grade points and explicit estimate caveat informed the planning workflow; UW's grade scale was not applied to BU.
- https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/ — focus containment, Escape, initial/restored focus and visible close controls informed modal verification.
- Existing BU research and exact source findings: docs/research/2026-11-23-simulator-purpose-and-accuracy.md. No new university-policy amendment verification is claimed.

## Calculation and persistence checks
- Full suite: 209 tests across 17 suites passed; production TypeScript/Vite build passed.
- Lint: 0 errors, 1 existing unused import warning in src/components/scanner/__tests__/ocr-engine.test.ts. Build retains the existing third-party Lottie eval warning.
- New tests cover 1.7800/1.7100 provenance, empty/zero/fractional inputs, 4/5 assumptions, continuous averages versus discrete course grades, exact 1.25/1.45/1.75 boundaries, conservative target rounding, impossible targets, all-assigned goals and source changes.
- Separate draft tests cover reload, horizon separation, reset isolation, malformed stored data, blocked reads/writes and writing only bu_gwa_simulator_v1.

## Chrome observations
Chrome was initially unavailable before the pause; after resume it connected successfully. Reviewed the app at http://127.0.0.1:5174/ using Chrome, not only the earlier in-app fallback.
- Existing 9-unit / 21.9-point baseline with 21 future units at 1.50 displays 1.7800 with explicit arithmetic. Changing 1.50 to 1.40 gives 1.7100.
- Overall 1.75 target requires an upper average of 1.4571; a semester 1.75 target stays a semester target and gives a different cumulative outcome. Summa 1.25 is explicitly unreachable with the entered units.
- An unnamed 3-unit course at 1.50 gives 2.2000 cumulatively. The draft survives Calculator/Simulator navigation and reload. Degree inputs stay separate.
- Reset/cancel, field validation, included-record disclosure, saved-only history modes, all three help topics and focus return inspected. Shift+Tab from modal close wraps to its footer; Escape closes it. Input helpers >=13px, editable numeric fields 16px, visible buttons >=48px.
- Both themes inspected. Layouts at 375x667, 390x844, 768x1024, 1024x768 and 1280x900 have no document horizontal overflow. At 375x667, the modal is 565.11px (<85vh), its body scrolls and background overflow is hidden. Reduced-motion behavior is covered by scoped CSS; no live media-emulation claim.
- A separate http://localhost:5174/ test origin held an explicitly named sample record. Import included exactly one blank course, repeat import preserved its assumption, and saving its grade caused a stale-plan warning. Confirmation removed the future row while retaining the 16-unit baseline. The original 127.0.0.1 grade record was not edited. The isolated sample remains in that separate local origin; its temporary tab was closed.
- Screenshots: assets/2026-11-23-simulator-light.jpg and assets/2026-11-23-simulator-dark.jpg. Cropped Chrome captures of working inputs and explained result.

## Limits and delivery
The simulator is conditional arithmetic, not a prediction or academic certification. Repeated-course replacement, unresolved INC and transfer-credit policy are not inferred. Remaining-degree units are student-entered; curriculum credits are context only.
Local dev server remains available on port 5174; Chrome is left on the redesigned Simulator. No commit, push or deployment performed.
