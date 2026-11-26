# Latin honors: one full-record calculation

Status: approved and implemented, 2026-11-26. [Implementation verification](../../reviews/2026-11-26-latin-full-record-verification.md) records automated checks, actual Chrome behavior and policy limits. Findings below describe the pre-change implementation.

## Findings
- Latin mode already selects every saved semester in selectCalculationTerms; the global computation validates and evaluates the combined record. Each semester currently repeats the same all-record callback, creating a false per-semester mental model.
- SemesterCard also displays term GPA/PL/DL badges and Awaiting computation in Latin mode. Those visual cues reinforce the confusion even though they do not change the actual Latin calculation scope.
- ScopedSummary currently shows four cards: cumulative GWA, Latin honors, academic standing and recorded units.
- Review record opens RecordReviewDialog: saved semester/course/pending counts, two editable curriculum targets, term list and validation notices. Targets autosave in browser storage; changing them invalidates the calculation snapshot. It does not compute, confirm residence, verify degree completion or award honors.
- Active Latin help repeats wording across CalculatorHelp and LatinCalculationDetails, uses “app,” and explains a six-entered-regular-semester display milestone as though it were a necessary activation step.
- Existing tests confirm all-record weighting, Midyear inclusion, stale-result invalidation, pending/DRP exclusions and exact cutoff arithmetic. These are retained, not rebuilt.

## Evidence and academic boundaries
- Read bundled public/BU-Student-Handbook.pdf, printed pp.20–21 / PDF pp.30–31, plus Grading System and academic-standing sections. Text extraction contains repeated hidden page content; section headings and displayed printed/PDF references must remain distinct.
- The 2019 Graduation with Honors section describes a unit-based weighted average displayed to four decimal places, the Summa/Magna/Cum Laude ranges, subject-grade limits, curriculum completion and prescribed regular loads. A GWA range alone is not eligibility.
- The adjacent academic-distinction provision discusses degree-credit grades,75% of curriculum units at BU and six immediately preceding terms of residence. The BU Code2016 also addresses residence and credited curriculum courses directly. Entered semester count is not residence verification.
- Direct official handbook download returned403 this session; the bundled copy was read locally and the official indexed handbook excerpt corroborates the prescribed-load/residence wording. Do not claim a newer policy was verified.
- Official2019 handbook: https://bicol-u.edu.ph/wp-content/uploads/2024/05/492555631-BU-Student-Handbook.pdf
- BU Code2016: https://bicol-u.edu.ph/wp-content/uploads/2023/07/BU-Code-of-2016-FINAL-Dec.-2016with-cover-by-Earl.pdf (printed p.55, graduation sections7–12).
- Precision discrepancy: handbook2019 describes fourth-decimal computation; Code2016 section8 describes second-decimal rounding. Preserve current exact arithmetic/cutoff convention in this UI change, describe four-decimal display accurately, and do not claim that an unrounded comparison is explicitly mandated by the handbook. Official boundary-rounding interpretation remains a Registrar question.

## Inspection and brief
Friendly academic work tool for students reviewing their whole degree record. Preserve approved mascots, Outfit/Inter, existing cream/graphite surfaces and orange action, shared1280px page frame and browser-local records. Main problems: repeated term actions suggest the wrong scope; GWA, current honor range, record completeness and official eligibility are mixed together.

## Design Council
| Group | Concrete vote | Commands |
|---|---|---|
|A — Taste|One full-record workspace. Three cards with a larger Latin card and two quieter supporting cards; remove duplicated term actions/status clutter, retain artwork.|/distill /quieter|
|B — UX|One Compute Latin honors action explicitly says all saved semesters. Keep cumulative GWA inside the main card so the result remains explainable. Use native controls/existing dialog; no new library.|/layout /clarify|
|C — Standards|Separate numerical range from eligibility and unknown requirements.48px controls, visible focus, text statuses,13px minimum helper copy and four-decimal numeric alignment.|/harden /clarify|
|D — Motion|Keep the existing computation presentation and150ms dialog entry; no new waiting or count-up effect. Brief150ms button feedback only; reduced-motion support retained.|/choreograph /adapt|
|E — Engineering|Reuse selectCalculationTerms, buildCalculationReport, weighted evidence and existing SemesterCard options. Keep GWA selected-term mode intact; no new evaluator, store or persistence schema.|/ponytail /verify /polish|

## Unified direction
- Register: friendly work tool; whole-record scope is visible beside the only Latin compute action.
- Palette/font: retain Outfit/Inter, light#F7F5EF/#FFFFFF/#202124, dark#202124/#2B2C2E/#F7F5EF, orange#F48242 through existing semantic tokens.
- Commands selected: /distill /quieter /layout /clarify /harden /choreograph /adapt /ponytail /verify /polish.
- Hierarchy: primary full-record action, dominant Latin result/evidence, supporting standing and units, editable semester evidence below. Avoid three equally loud metric cards or repeated primary buttons.
- Result copy says “calculator,” “calculation” or “record,” not “app.” Do not call an incomplete-record bracket an earned honor or automatic graduation qualification.
- Existing150ms opacity/transform presentation only; no width/height animation, new library, extra modal stack or cloned math.

## Proposed interaction
1. Latin mode shows “All saved semesters are included, including Midyear.” Place one Compute Latin honors button above the summary, with a secondary Record & curriculum button.
2. Remove compute buttons from every semester in Latin mode. Hide per-semester GPA/PL/DL badges and Awaiting computation there; retain term title, course/unit counts, expand/collapse, editing, reorder, delete, Midyear and Underloaded controls. GWA mode keeps its current selected-semester compute behavior.
3. The singleton action reads all saved courses regardless of which term was last selected or marked computed. One compute updates all three cards and one cumulative result dialog. Do not require clicking each semester or use computed markers as an inclusion filter.
4. Adding/editing/removing courses or term flags marks the full-record result stale. Show “Record changed — calculate again,” rather than leaving a current-looking result. Keep current signature guards during animation.

## Exactly three cards
- **Latin honors** (large): current numerical range, e.g. “Current range: Cum Laude”; cumulative GWA1.6667 below; scope/graded units; clear record-status line such as “Partial record” or “Requirements need review.” Before computation: no named range or fabricated number.
- **Academic standing**: all-record evidence summary. Pending/conditional/failing entries remain visible. Do not sum failures across semesters to declare present probation or dismissal; official restrictions require college review.
- **Recorded units**: total recorded units and course count, with graded units shown separately. Explain recorded units may include pending/failed work and are not officially earned degree credits.
- Three-card desktop composition: Latin card left, Standing/Units stacked right. Mobile uses the same reading order in one column, with no extra GWA card.

## Numerical range versus record readiness
- Reuse report.bracket for the current GWA range; do not hide the range until six entered semesters. “Current range” describes the grades entered, not a forecast or eligibility decision.
- Replace the six-entered-semester activation message with honest record coverage and optional curriculum-target progress. Residence remains an external verification requirement.
- Show missing grades, INC, invalid entries, numeric grades above3.00, underload and dropped-course load review immediately, including in early-year records. Do not hide problems behind a “more semesters needed” status.
- Curriculum targets measure progress only. Meeting entered counts does not establish degree-credit acceptance, completed prescribed courses, residence or eligibility. No automated certification or Academic Distinction award.
- Unset targets do not block valid weighted computation. Optional targets accept a positive whole semester count and positive units; do not impose six as a universal program-length minimum. Partial/invalid target entries need clear field guidance, not invented defaults.
- Only credited degree courses belong in an official graduation average. This calculator currently includes all valid numeric course entries supplied by the student; it cannot infer transfer-credit acceptance or decide which repeats count. Ask students to use their degree-credit record; show that limitation in the explanation. No new per-course inclusion toggles or transcript rules in this pass.

## Record & curriculum dialog
- Rename Review record to **Record & curriculum** so both functions are discoverable.
- Start with coverage: semesters, courses, graded/recorded units, pending and review flags, using existing report evidence.
- Keep optional curriculum targets in a labelled section: “Compare with your curriculum.” Explain where to get them, browser autosave and recalculation after changes.
- Give each semester a compact count/review summary and an explicit Edit semester action which closes the dialog, expands that semester in Latin mode and moves keyboard focus to it. Do not compute silently while opening the dialog.
- Keep status wording “Entered target reached” or “Record incomplete”; never “Graduation confirmed.” No new load-confirmation checkbox.

## Replacement help: How Latin honors are calculated
Show sections in this order, using a single shared explanation in help and result details:
1. **Which grades count?** All saved semesters together. Valid numeric grades with positive units contribute; degree-credit Midyear courses follow the same weighting. Blank/INC/DRP and zero-unit courses do not contribute to the numeric average. Exclusion from the average does not automatically resolve an eligibility issue. Final4.00/5.00 entries still affect the numeric average and trigger review.
2. **Where does the number come from?** Sum grade×units across courses, then divide by total graded units. Do not average semester GWAs equally. Show actual weighted points÷graded units when available; otherwise an explicitly labelled example.
3. **Example:** Semester1:1.00×3units=3points; Semester2:2.00×6units=12points. Combined15÷9=1.6667; equal averaging of1.00 and2.00 would be wrong because unit totals differ.
4. **What range does it meet?** Summa1.0000–1.2500; Magna>1.2500–1.4500; Cum Laude>1.4500–1.7500; above1.7500 is outside these ranges. Four-decimal display; precision caveat stays in source/verification notes.
5. **What can prevent eligibility?** Prescribed curriculum/load and subject-grade conditions; pending/INC/conditional/failing evidence; degree-credit and residence checks. A range is not an award. Do not infer official permission or disqualification from missing institutional data.
6. **What does this result mean?** “Current range” reflects only grades entered; “Partial record” means the degree record is unfinished; “Requirements need review” points to recorded issues; official honors are determined by BU.
- Footer: “Unofficial estimate based on the grades entered. Final graduation honors are determined by the Bicol University Office of the University Registrar.”
- Plain-text source reference: “BU Student Handbook, Reprinted Version2019, Graduation with Honors, printed pp.20–21 / PDF pp.30–31.” Preserve earlier user preference against handbook hyperlinks in cumulative explanations.

## Layout sketch
```
All saved semesters, including Midyear
[Compute Latin honors]    [Record & curriculum]

LATIN HONORS                    ACADEMIC STANDING
Current range: Cum Laude         Pending review
Cumulative GWA 1.6667
Partial record                  RECORDED UNITS
9 graded units · 2 semesters     12 recorded · 9 graded

Your semesters                            [Add semester]
Semester1 — courses/units, edit, collapse, delete
Semester2 — courses/units, edit, collapse, delete
```
Example counts are synthetic; labels use sentence case in the actual interface.

## File manifest and order
Paths relative to R:/Code/BU-GWA Calculator; every file has one responsibility. This document does not itself approve implementation.
|Step|File|Responsibility|
|---|---|---|
|1/5|src/core/latin-honors.ts|Separate record-coverage/target guidance from the numerical range and remove six-entered-semester activation language.|
|1/5|src/core/calculation-report.ts|Keep shared all-record math and expose immediate record issues/readiness without certifying eligibility.|
|1/5|src/core/__tests__/calculation-report.test.ts|Verify all-record weighting, current range versus readiness, targets, early blockers, stale results and GWA isolation.|
|2/5|src/components/dashboard/CalculatorView.tsx|Own the singleton Latin compute action and record-review/edit navigation.|
|2/5|src/components/dashboard/calculator-records.tsx|Present Latin semesters as editable evidence without term compute actions.|
|2/5|src/components/semester/SemesterCard.tsx|Honor existing hideCompute/showRecognition options for Latin record-only headers, preserving GWA behavior.|
|3/5|src/components/dashboard/scoped-summary.tsx|Render exactly three Latin cards, including cumulative GWA inside the Latin card.|
|3/5|src/components/modals/record-review-dialog.tsx|Present coverage, optional curriculum targets and focused navigation to a semester.|
|3/5|src/components/dashboard/calculator-help.tsx|Use clear mode-scoped help and plain-text Latin source attribution.|
|3/5|src/components/dashboard/calculation-result.tsx|Reuse the shared Latin calculation/range/readiness explanation and actual numeric evidence.|
|4/5|src/css/calculator-v2.css|Scope three-card/action layout and responsive type sizes to Latin mode.|
|4/5|src/css/record-tools-v2.css|Style compact record/target sections only if existing dialog classes do not suffice.|
|5/5|docs/redesign/v2/04-latin-honors.md|Record the approved combined-mode contract after implementation.|
|5/5|docs/reviews/2026-11-26-latin-full-record-verification.md (new)|Record actual tests/browser evidence and remaining policy limits after implementation.|

Dependencies: domain/report/tests first; existing controller/semester actions next; summaries/dialog copy and scoped CSS next; Chrome verification last. No new evaluator, duplicate state, package, artwork or file deletion.

## Acceptance and risks
- Latin has exactly one compute trigger across1/2/8semesters and no per-term GPA/PL/DL/awaiting-compute result display. GWA remains selected-term only. Course edits, term modifiers and record changes stay available.
- Three cards before and after compute. Cumulative GWA and exact denominator remain visible in the Latin card/result. No confusion between recorded/graded/earned units.
- Test unequal semester loads, decimal units, Midyear, pending/INC/DRP,0units,4.00/5.00, underload, invalid/partial/unset targets, record edits during computation and target edits after a result. Numeric blockers remain visible before six terms.
- Entered program targets are not residence or official curriculum evidence. Repeated/transferred/non-degree courses cannot be certified by this calculator. Eligibility wording must reflect these limits.
- The existing six-term display policy is deliberately revised by this proposal; it is not silently reinterpreted as a handbook mandate. Current cutoff arithmetic stays unchanged until the documented rounding discrepancy is resolved.
- Legacy LatinHonorsModal and old honor-rules unit milestones are retained but not wired into this screen. Do not reintroduce their45/105unit milestone logic or delete unused files in this task.
- Chrome: inspect empty/partial/complete-looking/stale states in both themes at375/390/768/1280/1536px; verify long honor labels, card alignment, singleton button, focus return, help scroll and≤85vh mobile dialogs. Test synthetic data only, preserving original records.
- Run npm test, npm run build, npm run lint after implementation. No new runtime checks were run for this planning task;241test results belong to the preceding scanner implementation.
- Planning was followed by explicit implementation approval. No commit, push, deployment or browser settings changes in this task.
