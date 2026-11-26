# Simulator redesign: connected grade planning

Status: implemented 2026-11-23 under advance approval; source, tests and Chrome review complete. See docs/reviews/2026-11-23-simulator-redesign-verification.md.

## Brief and locked constraints

- User chose next-semester planning first, with a separate graduation-planning option.
- One purpose: help a student understand which future grades would meet a numerical goal and how those grades affect cumulative GWA.
- Research: R:/Code/BU-GWA Calculator/docs/research/2026-11-23-simulator-purpose-and-accuracy.md.
- Retain the 1280px page frame, existing Outfit/Inter typography, semantic cream/graphite/orange palette, approved Simulator mascots, navigation and shared footer.
- Application grade records and actual honors evaluations remain authoritative inputs, never destinations for hypothetical writes.

## Design Council synthesis

| Group | Vote |
|---|---|
| A — Direction | Replace disconnected widgets with a guided planning workspace. Preserve artwork and identity; make the result and its provenance dominant. |
| B — Understanding | Default to next semester. Ask a question, establish the baseline, enter assumptions, then explain the result. Course planning is an optional detailed input method. |
| C — Trust | Separate recorded facts, hypothetical assumptions and numerical targets. Show inclusion/exclusion and arithmetic. Honors cutoffs are references, not awards. |
| D — Feedback | Recalculate immediately. No computing delay, counting numbers, animated charts or extra Lottie. Restrained 150ms control feedback; reduced-motion support. |
| E — Engineering | One typed scenario model, one derivation engine, controlled inputs and a separate local draft store. Reuse exact saved-grade totals; test scope, credit identity and grade-scale boundaries. |

Executed Design Council commands: /distill, /clarify, /layout, /harden, /adapt, /polish, /verify.

## Student workflow

1. Compact heading: **Plan your grades**. Subtitle: **Explore future grades without changing your saved record.** Keep the navigation label Simulator.
2. Horizon selector: **Next semester** (default) / **Remaining degree**.
3. Question selector: **What if I earn these grades?** / **What grades do I need for a goal?**
4. Starting-record strip: recorded cumulative GWA, numeric graded units and semesters included; expandable point/unit breakdown and counts of pending/excluded entries. State that saved numeric grades count even before Compute is pressed.
5. Scenario inputs and the resulting explanation share a workspace. Never show a personal forecast from automatic21-unit/1.50 defaults. Empty fields show an instructional result state.
6. Secondary collapsible section: **Your recorded history — saved grades only**.

### Next-semester inputs

- Default method: **Quick estimate**. Student enters future units and expected future average. Numeric average input supports up to four decimals, with a synchronized slider for coarse changes.
- Optional method: **Plan by course**. Student enters course units and expected ratings. Unnamed rows remain valid and display Course1, Course2, etc. Units come from the rows; there is no second independently editable total.
- Offer **Import ungraded courses** from one saved semester. Import blank-grade rows only, once per source row; show existing numeric grades as already recorded, read-only context. INC/DRP are not silently converted into future numeric grades.
- Importing an incomplete saved semester changes the scope wording to **Finish [semester name]**. For a semester-average goal, its already-recorded numeric points/units count toward that semester's target, but are never added a second time to the cumulative baseline.
- No automatic1.50 ratings. In forecast mode all positive-unit future rows need explicit numeric assumptions before a complete projected result appears.
- Course ratings use the existing discrete grade options, including4.00/5.00 with clear conditional/failing-assumption messages. Expected averages may be continuous; an average1.45 is not shown as an individual course mark.

### Remaining-degree inputs

- First version uses an aggregate estimate: manually entered additional numeric-grade units plus an expected average or cumulative goal. Detailed course allocation remains in semester planning.
- Explain that this horizon covers all entered remaining coursework, not one semester and not an assumed four-year program.
- Read the curriculum-unit target from Review record as context labelled **From your Review record settings**. Do not automatically subtract graded units from total curriculum credits; they are not guaranteed equivalent categories.
- No curriculum target is required for a hypothetical scenario. Without a confirmed complete record and remaining course coverage, the result is not labelled a final graduation GWA.
- Each horizon keeps its own draft so a21-unit semester estimate never silently becomes the remaining-degree estimate.

## Connections and results

All controls write to the active scenario draft; every result is derived from that same draft plus the saved record. No independent target or allocator result state.

| Question | Primary result | Supporting result |
|---|---|---|
| Forecast | Projected cumulative GWA after the planned units | Starting cumulative GWA, future semester/block average, added units and change |
| Cumulative goal | Average needed across the still-unassigned future units, stated as an upper numerical bound | Cumulative GWA at that boundary; effect of already assigned expected grades |
| Semester-average goal, semester horizon only | Average needed in the semester's unassigned future courses | Semester average at that boundary and resulting cumulative GWA |

- Goal mode offers **Overall GWA** or **Semester average** for the semester horizon; Remaining degree supports Overall GWA only.
- Custom targets range1.00–3.00. Existing cumulative and PL/DL cutoff presets remain optional numerical references, explicitly labelled **GWA cutoff only**. Selecting one updates the main goal result.
- In course goal mode, an assigned expected rating is fixed in this hypothetical scenario; a blank rating is an unknown. Remove lock/unlock jargon. Show one required average across the unknown units, not fabricated identical grades on each row.
- Do not automatically fill unknown courses with the solved average. A goal-bound result says **If the remaining courses average this or better…**. Switching back to forecast requires explicit expected ratings.
- All assigned: evaluate whether the numerical goal is met; never divide by zero. Required average below1.00: goal unreachable with these units/assumptions. A passing3.00 average sufficient: state that fact without implying honors eligibility. No future units: show baseline unchanged or ask for units to solve an unmet goal.
- No baseline: show **No recorded grades yet**; the scenario can still produce a future-only average, not an invented current0.0000.
- Replace “Regular Academic Standing Pace” and awarded-honor styling with numerical goal/bracket wording. Academic standing and honors eligibility are separate evaluations.

### Always-visible calculation provenance

For a quick synthetic example:

1. **Your record:**21.9 weighted points across9 graded units; current GWA≈2.4333.
2. **Your assumption:**21 additional units at1.50 =31.5 future points.
3. **Combined:**53.4 points ÷30 units = projected1.7800.

For course mode, show the sum of individual grade×unit products and offer a row-level breakdown. Do not multiply a rounded displayed average and present the result as an exact points total. Goal mode shows target points minus recorded/fixed expected points, divided by unknown units, with substituted values.

## Calculation, state and safety contract

- Core inputs use discriminated horizon/method/goal types. A derived report contains baseline, future totals, exclusions, warnings, calculation steps and one explicit result state: setup, invalid, stale, forecast, goal, unreachable, met or missed.
- Pure domain functions import no React, Zustand, storage or browser APIs. Low-level arithmetic lives in simulation.ts; scenario-planner.ts validates drafts and assembles source-aware totals/results.
- Reuse existing weighted totals and unit scales for saved grades and valid course ratings. Normalize scenario expected averages/targets to four decimal places and normalize unit scales before point arithmetic; comparisons use scaled integer/rational totals, not rounded displayed GWAs. Required upper bounds displayed to four decimals round toward the better/lower grade so the displayed recommendation does not miss its own target.
- Keep existing projectGWA callers compatible; expand valid hypothetical averages to1.00–5.00. Move target arithmetic behind the same core helpers and leave calculateTargetGrade in honor-rules.ts as a compatibility adapter, avoiding two independent formulas.
- Future units must be finite, non-negative and at most the existing named200-unit limit; preserve fractional units, including finer precision already in imported records. Zero-credit courses are visible but do not affect weighted GWA.
- Store input drafts only, never derived BigInt totals, under a new versioned local key bu_gwa_simulator_v1. Semester/degree drafts survive navigation and reload; Reset scenario affects the active draft only. Validate persisted drafts; storage failure leaves an in-memory scenario with a visible save-status message.
- Track imported source semester/row identity and the original row fingerprint. Never import the same source twice or include a now-graded source in both baseline and future totals.
- Saved-record changes preserve user assumptions but mark linked scenarios stale. Show changed baseline totals and require review; Refresh imported courses rebuilds only imported future rows, preserving unaffected manual rows and asking before replacing affected assumptions. Changes to computed flags alone do not invalidate a draft.
- Invalid saved grades or units block a combined result with a link back to Calculator. Incomplete records produce an explanatory warning, not a fabricated complete transcript.
- Repeated courses, INC removal and transfer-credit replacement are not inferred. Explain those limits where relevant; no old regular-load confirmation gate or fixed15-unit rule is introduced.

## Layout and accessibility

- Desktop: starting-record strip above a roughly55/45 input/result grid; course planner lives inside the input column. On wider/taller windows, result may remain sticky; disable sticky behavior on short viewports so the page owns scrolling.
- Mobile: selectors→starting record→inputs→result→history. Course rows become labelled cards; include a View result anchor after long input sections. No fixed result overlay or second full-width toolbar.
- Preserve page width and approved mascots in both themes. Compact32px desktop/26px mobile heading; body14–16px, helper text at least13px, labels at least12px, controls at least48px; mobile editable inputs16px.
- Every field has a programmatic label and nearby source/scope text. Concise polite live result announcements; visible keyboard focus and inline validation; normal text contrast at least4.5:1.
- History stays independent and explicitly saved-only. Rename toggles Semester GWA/Cumulative GWA; support the full1.00–5.00 plotted range so4.00/5.00 are not clamped to3.25. Do not add a predictive trend line.

## File manifest and implementation order

All existing callers were inspected. These are internal component/domain changes; no hosted API, grade-record schema or global navigation contract changes.

| Stage | File | Responsibility |
|---|---|---|
|1|R:/Code/BU-GWA Calculator/src/core/simulation.ts|Shared validated projection and reverse-target arithmetic, limits and numeric precision.|
|1|R:/Code/BU-GWA Calculator/src/core/scenario-planner.ts (new)|Typed draft/report contracts, scopes, source exclusions, totals and evidence derivation.|
|1|R:/Code/BU-GWA Calculator/src/core/honor-rules.ts|Delegate legacy calculateTargetGrade through shared arithmetic without changing honors rules.|
|1|R:/Code/BU-GWA Calculator/src/core/__tests__/simulation.test.ts|Formula, precision, bounds and compatibility tests.|
|1|R:/Code/BU-GWA Calculator/src/core/__tests__/scenario-planner.test.ts (new)|Scope, partial-record, target feasibility and duplicate-credit behavior.|
|2|R:/Code/BU-GWA Calculator/src/store/simulator-store.ts (new)|Separate validated local scenario drafts and reset/refresh actions.|
|2|R:/Code/BU-GWA Calculator/src/store/__tests__/simulator-store.test.ts (new)|Persistence, horizon separation, invalid data, storage failure and record-safety tests.|
|2|R:/Code/BU-GWA Calculator/src/components/simulator/use-simulator-plan.ts (new)|Bind saved-record reads and draft actions to the pure derived report.|
|3|R:/Code/BU-GWA Calculator/src/components/simulator/SimulatorView.tsx|Compose the guided workspace and clearly separated history.|
|3|R:/Code/BU-GWA Calculator/src/components/simulator/simulator-inputs.tsx (new)|Controlled question/horizon/goal and quick-estimate controls.|
|3|R:/Code/BU-GWA Calculator/src/components/simulator/SubjectTargetAllocator.tsx|Controlled future-course editor; remove private solver/state and naming gate.|
|3|R:/Code/BU-GWA Calculator/src/components/simulator/simulator-result.tsx (new)|Render the shared result and always-visible calculation provenance.|
|3|R:/Code/BU-GWA Calculator/src/components/simulator/SimulatorInfoModal.tsx|Concise help matching actual horizon, scope, inputs and numerical limits.|
|3|R:/Code/BU-GWA Calculator/src/css/simulator-v2.css|Scoped light/dark desktop/mobile layout and input/result states.|
|4|R:/Code/BU-GWA Calculator/src/components/charts/AcademicTrendChart.tsx|Neutral historical labels and complete grade-range plotting.|
|4|R:/Code/BU-GWA Calculator/docs/redesign/v2/08-simulator.md|Refresh the implementation checkpoint after verification.|

Dependencies: pure math/report→draft store/controller→controlled UI→history/help verification. SimulatorView, SubjectTargetAllocator, SimulatorInfoModal and scoped CSS require substantial rewrites; this is part of the proposed approval scope. No files are deleted. Existing mascots and unrelated page components are retained.

## Acceptance and verification

- Reproduce the synthetic1.7800 example and show all contributing numbers; changing1.50 to1.40 produces1.7100 with explanation updating from the same scenario.
- Quick and equivalent course-by-course scenarios give identical totals and cumulative GWA. Selecting a goal updates the main result; editing a fixed course changes the required remaining average.
- Semester goals include known grades from an imported unfinished semester, while cumulative points count them only once. Newly saved numeric grades cannot remain duplicated future assumptions.
- Test empty/no baseline, partial courses, zero/fractional units, all-fixed goal met/missed, impossible targets, passing-sufficient targets,4.00/5.00 assumptions, invalid entries, unnamed rows, boundary rounding and values just above/below1.25/1.45/1.75.
- Test navigation/reload draft retention, separate horizon drafts, Reset scenario, missing/deleted source rows, record changes, malformed storage and storage exceptions. Saved-grade store contents must remain unchanged throughout scenario editing/reset.
- Manually check that every number is explainable from visible inputs and that numerical references do not look like awarded honors. Ask students to explain where the baseline, future units and displayed result came from.
- Run npm test, npm run build and npm run lint. Inspect Chrome in both themes at375/390,768/1024 and the user's current desktop/short-window dimensions; check focus,48px targets,13px helpers, no overflow/launcher overlap, sticky behavior and reduced motion. Capture before/after evidence.
- Chrome access previously failed its automatic approval review due a usage limit. Do not bypass that check or claim browser validation without a successful later inspection.
- Implementation completion includes a user review of the connected flow, updated research/checkpoint and project memory. No commit, push or deployment is included in this UI approval.

## Implementation review additions
- Live Chrome confirmed the original 1.7800 inputs: 21.9 recorded points / 9 units plus 21 hypothetical units at 1.50. Their source is now visible in the result.
- Only semesters with blank-grade courses appear in the import selector. Blank course names remain valid. Import refresh requires confirmation after record changes; newly recorded grades leave future assumptions.
- The starting record is a compact desktop strip; the guide launcher is compact on this page. Mobile helper text is at least 13px, editable numeric fields 16px, and controls at least 48px.
- Help topics use a compact 620px dialog, independently scrolling body, trapped/restored focus and mobile height below 85% of the viewport.
- Review artifacts added: docs/reviews/2026-11-23-simulator-redesign-verification.md and docs/reviews/assets/2026-11-23-simulator-{light,dark}.jpg.
- No new dependencies, grade-store schema changes, mascot edits, commit or push.
