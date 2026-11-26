# Simulator refinement: compact courses and record evidence

Status: approved and implemented. Final Chrome verification completed 2026-11-26; see ../../reviews/2026-11-26-simulator-course-workbench-verification.md.

## Brief and evidence
- Student task: enter many future courses, keep the shared result in view, and inspect the saved grades behind the starting GWA.
- Supplied screenshots show large repeated fieldsets, repeated labels and an empty right column after scrolling. Source confirms every course renders at once; the result becomes sticky only at >=1100px width and >=900px height.
- Current Included grades & units is a native inline disclosure. Expanding it changes the page layout above the working inputs.
- Current authority is the approved connected Simulator plan in 21-simulator-planner.md. Keep its exact math, source guards, separate drafts, grading scale and unofficial status. Older generic results-first layout notes do not override that approved workflow.
- Keep the existing 1280px frame, Outfit/Inter fonts, approved mascots, light cream/white and dark graphite surfaces, orange accent and shared footer.

## Design Council synthesis
| Group | Perspective and vote | Commands |
|---|---|---|
| A — Direction | An academic planning ledger: aligned compact rows, quiet separators and one clearly dominant result. Replace the repeated large course cards. | /critique, /distill |
| B — Student workflow | Bounded pages, visible course/unit counts, predictable Add focus and a compact result beside the current work. Keep editing directly connected to the result. | /layout, /clarify |
| C — Trust/accessibility | All pages participate in math. Hidden-page errors remain discoverable. Read-only saved-record evidence belongs in an accessible modal with explicit exclusions. | /harden, /clarify |
| D — Interaction | Immediate updates, focused newly added row and reversible removal. Restrained 100–150ms press/focus feedback; 150ms dialog entry; reduced-motion fallback. | /polish, /adapt |
| E — Engineering | Pagination is presentation state, not a sliced scenario. Reuse exact domain totals, source fingerprints, existing draft actions and accessible-dialog hook. No new package or store migration. | /harden, /verify |

Direction: friendly working tool, compact ledger rather than a stack of forms. Use explicit controls and a bounded course list; no height animation, row staggering or decorative status pills. Existing palette tokens remain #F7F5EF/#FFFFFF/#202124 light, #202124/#2B2C2E/#F7F5EF dark, accent #F48242; secondary text and focus contrast require verification.

## 1. Compact course workspace
- Desktop columns: Course (optional name), Units, Expected grade, Remove. One header row replaces repeated visible field labels; every control retains a unique programmatic label.
- Target row height 64–72px with >=48px controls. Long names stay editable without forcing every row into a tall card. Unnamed rows remain valid.
- Toolbar: **Future courses** plus live counts, **Add course**, and **Import from saved semester** when eligible blank-grade rows exist. Import controls reveal inline on request; retain existing replacement confirmation and blank-only import safeguards.
- Show up to **6 rows per desktop page**, **4 compact two-line rows per mobile page**. These are proposed presentation constants, to be checked with actual course loads.
- Pagination appears only when needed: **Courses 1–6 of 18 · All 18 included in the calculation** plus Previous/Next and current page. Page changes preserve inputs immediately; the engine receives the entire scenario.
- Mobile rows: optional course name and Remove on the first line; Units and Grade on the second. Avoid a horizontally scrolling editable table and avoid nested scroll containers on the main page.
- Live counters distinguish total courses, additional units, assumed grades and grades left to solve. They describe future assumptions, never recorded final grades or verified honors.

### Interaction details
- Add course opens the page containing the new row, focuses its Units input, and announces its course number. Naming is optional, so typing can start with useful data immediately.
- Removal updates totals and offers one-level **Undo** in the course toolbar. Focus moves to the nearest remaining row; deleting the last row on a page moves to the last valid page.
- Undo belongs only to the active scenario and is cleared by reset, import replacement, record refresh or horizon change. Existing source validation still applies if the saved record changed.
- A visible **Go to first unfinished course** action takes students to required missing inputs. Invalid entries on other pages show a count and an action to reveal/focus the first error; pagination must not conceal why a result is unavailable.
- Imported units remain read-only. Recorded numeric courses stay outside the future editor. Existing continuous-average versus discrete-course-grade rules remain intact.

### Sketch (illustrative content only)
```
Future courses     18 courses · 54 units             + Add course
12 assumed · 6 to solve                        Import from saved

Course                         Units   Expected grade    Remove
Course 1                       [ 3 ]   [ 1.50       v ]   [ x ]
Course 2                       [ 3 ]   [ To solve   v ]   [ x ]
Course 3                       [ 3 ]   [ To solve   v ]   [ x ]
...up to 6 compact rows...

Courses 1–6 of 18       All 18 included       Previous  1/3  Next
```

## 2. Result stays connected to the work
- In Plan by course, use a compact right-hand result card: main forecast/required average, assigned/unassigned units, short status and a visible substituted formula.
- Keep the full calculation accessible through **Calculation details**, using the same evidence dialog shell as the saved-record view. Quick estimate keeps its current full inline explanation.
- Sticky positioning depends on the compact card fitting the actual available height, rather than requiring a 900px-tall viewport. If it cannot fit, use normal document flow; never clip controls or give the page a second scrolling result panel.
- On mobile, place a short inline live result summary before the bounded course list, with the full explained result reachable immediately after the list. These are views of one derived report, not independently calculated outputs. No fixed overlay covering fields or keyboard.
- Detailed formula content is shared between inline and dialog presentations. No duplicated formulas or rounded intermediate math.

## 3. Saved-record modal
- Replace the disclosure with a normal outlined **View included grades** button and a small list/document icon; aria-haspopup=dialog. The button opens **Your saved grade record** and does not expand the main layout.
- Compact desktop width about620px; mobile within viewport gutters and <=min(85vh,85svh), including borders. Header/Close and footer stay visible, one scrolling body.
- Top evidence strip: starting GWA, graded units, weighted points and semester count, using the same baseline as the planner.
- Below: semester groups with included units and points. Open one group at a time to see Course, Grade, Units and Weighted points. Empty names have Course N fallbacks.
- Show excluded rows with explicit reasons: blank/pending, INC, DRP, zero-credit or invalid entry. Do not hide a 4.00/5.00 numeric grade from weighted evidence merely because it affects award eligibility.
- Invalid saved data displays a record-needs-review notice and clearly labels any valid-entry subtotal; do not imply a verified complete GWA. No saved numeric grades produces a meaningful empty state.
- Footer: **Open Calculator** and **Back to planning**. Close restores focus to the trigger and preserves current page, unfinished edits and draft. This modal is read-only.
- Calculation details opens this same shell with the existing three-step calculation and assigned-course point breakdown. Its title and initial focus match that context; do not stack evidence dialogs over help dialogs.

## Dependencies, files and responsibilities
Paths below are relative to R:/Code/BU-GWA Calculator.
| Step | File | Responsibility |
|---|---|---|
|1/4|src/core/calculation-report.ts|Provide typed read-only semester/course evidence using the existing weighted engine and exclusion rules.|
|1/4|src/core/__tests__/calculation-report.test.ts|Verify evidence totals agree with the existing baseline and explain every excluded row.|
|2/4|src/components/simulator/use-simulator-plan.ts|Expose evidence and reversible course actions while preserving source guards and entire-draft math.|
|2/4|src/components/simulator/SubjectTargetAllocator.tsx|Compact responsive rows, bounded paging, import toolbar, Add focus and removal/Undo.|
|2/4|src/components/simulator/simulator-inputs.tsx|Place the course workspace and compact live summary within the current question/goal controls.|
|3/4|src/components/simulator/simulator-evidence-dialog.tsx (new)|Accessible saved-record/calculation dialog and reusable calculation-evidence rendering.|
|3/4|src/components/simulator/simulator-result.tsx|Compact course-mode result with visible formula and a full-evidence trigger; retain quick-mode explanation.|
|3/4|src/components/simulator/SimulatorView.tsx|Record-modal trigger, one-at-a-time dialog orchestration and course-mode layout.|
|3/4|src/css/simulator-v2.css|Rows, paging, sticky-card fit, modal layout, both themes and responsive/readability rules.|
|4/4|docs/redesign/v2/08-simulator.md|Update the implementation checkpoint after verification.|
|4/4|docs/reviews/2026-11-23-simulator-course-workbench-verification.md (new)|Record actual checks and before/after screenshots after implementation.|

Dependency order: existing exact domain engine -> read-only evidence -> controller/draft actions -> controlled course/result/dialog views -> scoped styling and browser checks. The course component, result presentation and their CSS require substantial restructuring if this plan is approved; no files are deleted. Existing stored input schema and saved academic records remain compatible.

## Risks and verification
- Test 0,1,6,7,12,24 and200 courses: page bounds, all-course totals, imports, Add/removal focus and hidden errors. No page operation may write only the visible slice into the draft.
- Verify desktop/mobile page-size changes keep the active course visible and do not lose field edits. Clamp page after deletion, reset, import, refresh and horizon changes.
- Confirm Undo cannot restore an assumption into another horizon or bypass a stale source warning.
- Compare record evidence with exact existing totals for fractional units, unnamed courses, pending/INC/DRP, zero credits, 4.00/5.00 and invalid entries. No official eligibility rules or rounding rules change.
- Check short laptop views around1536x695, desktop1280x900, tablets768/1024 and mobile375/390, both themes. No empty result column caused by an oversized sticky card, no page overflow, no obscured inputs or actions.
- Modal: <=85vh mobile outer height, one scrolling body, visible Close/footer, focus trap, Escape, restored trigger focus and preserved input/page state. Test long names and many semesters.
- Controls >=48px; helpers >=13px; mobile numeric fields16px; body contrast >=4.5:1; reduced motion. No height/width/position animation.
- Run npm test, npm run build and npm run lint after implementation. Current209-test success belongs to the earlier implementation, not this proposed refinement.

## Research and boundaries
- GOV.UK table guidance supports aligned comparable data: https://design-system.service.gov.uk/components/table/.
- GOV.UK pagination provides explicit previous/next/current-page conventions: https://design-system.service.gov.uk/components/pagination/. Applying six/four-row paging to this editable planner is a design proposal, not a source-mandated page size.
- W3C dialog guidance informs focus containment, Escape and focus return: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/.
- No fresh Chrome inspection or screenshot measurements were performed in this planning turn. Findings come from the supplied screenshots and current source. No application files, assets, records or behavior were changed. No commit/push.

## Implementation checkpoint — 2026-11-26
- The preceding planning evidence describes the original proposal. The approved implementation now uses six/four-row pages, Add focus, one-level Undo, hidden-entry navigation, read-only record evidence and shared calculation details.
- Expanded the manifest to src/core/scenario-planner.ts and its existing tests: a manual-only future plan no longer reuses a completed source semester solely because its old import ID remains stored.
- Browser-tested up to24 courses; domain regression cases include200. All227 tests/17 suites and build pass; lint retains one existing OCR-test warning. No commit/push.
