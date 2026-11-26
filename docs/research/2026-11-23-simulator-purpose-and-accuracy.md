# Simulator purpose, accuracy and student workflow

Date: 2026-11-23. Research only: no application code, UI, grades or scenario settings changed.

## Verdict

Keep the planning capability. It answers a useful question: **What grades would I need next, and how would they affect my overall average?** The current page mixes a cumulative forecast, two independent reverse calculations and a historical chart. Arithmetic can be correct while students misunderstand what it represents. It is a conditional calculator, not a prediction of actual future performance or an honors certification.

## Current data flow, verified from source

| Tool | Inputs and scope | Connection to other tools |
|---|---|---|
| Starting point | Numeric grades with positive units from all saved semesters, including uncomputed terms; blank/INC/DRP excluded from numeric average | Same all-record numeric basis used by Latin Honors, not the selected single-semester GWA |
| Projected cumulative GWA | All-record weighted points plus one hypothetical block of future units at an assumed average | Changes with future-unit input and anticipated-grade slider only |
| Work toward a target | Same baseline and future-unit count; Summa/Magna/Cum numeric cutoff | Solves the required future average; selecting a target does not set the slider or change the headline projection |
| Course allocator | One selected saved semester, independent target term GPA and locally locked expected grades | Local scenario only; does not update the headline, chart or saved grades |
| Academic trend | Saved semesters sorted into chronological order; term or cumulative weighted averages | Historical only; no forecast or allocator data is passed into it |

The top forecast and target finder share the future-unit count. The allocator and chart receive only a help callback from SimulatorView and independently read saved semesters. SimulatorView does not read the degree-requirement targets from Review record, so it does not automatically calculate curriculum units remaining. Scenario inputs are local component state and reset when the Simulator unmounts during tab changes.

## Where 1.7800 can come from

Defaults in `src/core/simulation.ts`: 21 future units and an anticipated average of 1.50. Neither is inferred from the student's curriculum or predicted performance.

Formula: `(saved weighted grade points + future units × assumed future average) ÷ (saved graded units + future units)`.

Synthetic example, executed against the existing `projectGWA` function:

- Saved points: 21.9 across 9 units, equivalent to current cumulative GWA 2.433333…
- Future assumption: 21 units at 1.50, contributing 31.5 points.
- Result: `(21.9 + 31.5) ÷ (9 + 21) = 53.4 ÷ 30 = 1.7800`.
- Changing the assumed future average to 1.40 would give 1.7100.
- With those same synthetic starting values and 21 future units, the Cum Laude numeric cutoff requires an average at most 1.457142857…; the Summa cutoff would require 0.742857… and is mathematically unreachable over that particular horizon.

This reproduces the reported number mathematically. It does **not** establish which values were in the user's Chrome tab: browser inspection was blocked by an automatic approval-review usage limit.

The output means the cumulative average **after the entered future units**. It represents graduation only if the record and entered future units cover the relevant degree coursework. Lower numerical values are better on the app's BU scale.

## Accuracy and comprehension findings

1. **Defaults look personal.** A four-decimal result appears immediately from the 21-unit/1.50 example. There is no evidence that 1.50 predicts a student's future performance.
2. **The time horizon conflicts.** The page introduction says next semester; help text calls the result a four-year graduation projection; the input says remaining future units. These can describe different calculations.
3. **Controls have different destinations.** A student can change course allocations or select an honors target and expect the headline to update, although those states are independent.
4. **Term and cumulative scope are mixed.** The baseline covers all saved semesters; allocator PL/DL presets apply to one selected semester; Summa/Magna/Cum buttons are cumulative numeric thresholds. The same number, such as 1.45, has different roles.
5. **Honors labels exceed the evidence.** Top “pace” labels inspect GWA alone. They do not model future subject deficiencies, prescribed loads, residence, degree completion or institutional review. “Regular Academic Standing Pace” for GWA above 1.75 also conflates an honors bracket with academic standing.
6. **The allocator solves an average, not a valid course-by-course assignment.** With all courses unlocked and target 1.45 it displays 1.45 on each course, although the app accepts individual numeric marks in tenths. An average of 1.45 can be possible without any course receiving 1.45. Rounded required averages should not be presented as exact individual marks.
7. **Unnamed courses disappear from the allocator.** It filters out subjects lacking both code and description, even though the Calculator can compute valid grades and units without those names.
8. **Locks need a clear meaning.** All allocator rows initially unlock, including recorded final grades. Only locked values constrain the solution; other values are replaced visually by the required average. Blank/non-numeric entries receive a hypothetical 1.50 locally.
9. **PL/DL presets do not verify eligibility.** For example, equal-credit 2.50 and 1.00 grades average 1.75, but a subject above the app's 2.40 cap prevents term honors. The allocator only solves the average.
10. **Forecast coverage is limited.** Future averages are restricted to 1.00–3.00; the slider steps by 0.05, and future units are truncated to whole numbers and capped at 200. It is a passing-grade scenario tool, not a general failure/conditional-grade or fractional-unit planner.
11. **Past and future credits can be misunderstood.** The baseline already includes every entered numeric grade, including an unfinished term. Future units must exclude credits already included there. The app does not identify a planning term or automatically prevent conceptual double counting.
12. **The chart compresses worse outcomes.** Values above 3.25 are clamped to the same plotted boundary. Tooltips retain numbers, but the line can conceal differences between 4.00 and 5.00 averages.
13. **History is not a forecast.** A chronological line does not infer likely future grades. Semesters with no numeric graded units are omitted.
14. **Evidence is uneven.** Basic projection has five existing focused tests. The allocator's solver lives inside its React component; no dedicated allocator test was found. Prior full-suite success is not proof of usable scenario design or official eligibility accuracy.

## External research

- [University of Washington advising calculator](https://advising.uw.edu/academic-support/gpa-calculator/) separates expected course GPA, cumulative GPA after a quarter, and a target-GPA calculation. It describes results as planning estimates. This supports the use case, not a claim that this app improves student outcomes. UW's 0–4 grading rules are not BU rules.
- [UW–Madison advising calculator](https://gpacalc.advising.wisc.edu/) separates term/cumulative results and GPA improvement questions. It explicitly assumes new credits and warns that repeated courses can behave differently. BU repeat/replacement rules require their own verification.
- [Canvas What-If Grades](https://community.instructure.com/en/instructure/kb/articles/662757-unknown) demonstrates hypothetical scores as a separate student planning exercise. Its assignment-level scope is different from this app's course/semester scope.
- [Nielsen Norman Group heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/) supports showing system state, using familiar student language and avoiding reliance on memory. Applying those principles to the scope confusion is a design inference, not a student usability-test result.
- [Bicol University handbook](https://bicol-u.edu.ph/wp-content/uploads/2024/05/492555631-BU-Student-Handbook.pdf) distinguishes numeric honors ranges from other graduation requirements, including curriculum load and residence. Cached official search text was available; direct PDF/site fetches returned403. Bundled PDF extraction contains repeated background text, so this study does not establish a fresh PDF-page-offset audit or confirm later policy amendments.

## Design Council research synthesis

Brief: a student planning tool in React/TypeScript, using browser-local records, with no authorized UI implementation in this task. Preserve weighted arithmetic, saved grades and the unofficial boundary. Main problems: invisible assumptions and unrelated tools presented as one workflow.

| Perspective | Recommendation |
|---|---|
| A — Purpose and direction | Establish one job: understand the effect of future grades on an overall average. Keep decorative identity secondary. |
| B — Student understanding | Start with a question and a horizon; distinguish semester average from cumulative average. |
| C — Accuracy and trust | Expose included records/units and assumptions; separate numeric targets from honors eligibility; handle pending and repeated coursework explicitly. |
| D — Feedback | Update the result immediately when the inputs that actually drive it change. Make those relationships visible; no extra computing animation is needed for simple scenario arithmetic. |
| E — Engineering | Use a shared validated scenario model for a connected workflow; keep average solving separate from discrete grade allocation and official honors evaluation. |

Research lenses: `/critique`, `/clarify`, `/harden`. No UI commands or implementation executed.

## Recommended future student process — conceptual, not an approved implementation

1. **Choose a question:** “What if I earn these grades?” or “What average do I need to reach this GWA?”
2. **Choose the horizon:** next semester or all remaining degree coursework. Ask for the relevant units; never silently infer the full curriculum from a21-unit default.
3. **Explain the starting point:** which saved semesters and graded units are included, what is pending, and whether the record is complete.
4. **Enter assumptions:** a future average for a quick scenario, or course-by-course grades for a detailed one. Both should feed one consistent future-unit/point total. Do not count the same course twice or change real final grades by default.
5. **Explain the outcome:** before→after cumulative GWA, future-term average, weighted-point calculation, and whether the numeric goal is met. State what inputs produced every number.
6. **Keep honors separate:** optionally compare the scenario to a GWA bracket, with academic requirements checked separately. A passing/achievable average is not an award.
7. **Treat history as context:** keep the trend chart secondary or alongside saved records. Label its term/cumulative scope and show the full supported grade range.

An eventual product name such as **Grade Planner** may be clearer than Simulator. Keep forecasting and target solving; rework or postpone the per-course solver until its grade-scale and scope issues are resolved.

## Evidence and next validation

Inspected SimulatorView, SubjectTargetAllocator, AcademicTrendChart, SimulatorInfoModal, AppShell, simulation, gwa-engine, honor-rules, constants and existing tests. Executed the existing pure projection function on synthetic values; no UI/source implementation or fresh full test-suite run.

Before a UI implementation plan, validate with students: can they identify the baseline, explain1.7800, name which controls affect it, distinguish term/cumulative goals, and understand that scenarios do not overwrite records? Later implementation tests should cover no baseline, partial semesters, target feasibility, invalid/discrete course grades, unnamed courses, future/saved credit separation, retakes policy, chart4.00/5.00 visibility, and honors-vs-GWA distinctions.

## Implementation follow-up
The observations above describe the pre-redesign research checkpoint. The user subsequently approved implementation; current behavior and Chrome/test evidence are recorded in docs/reviews/2026-11-23-simulator-redesign-verification.md and docs/redesign/v2/21-simulator-planner.md.
