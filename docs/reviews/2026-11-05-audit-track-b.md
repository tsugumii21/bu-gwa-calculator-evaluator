# Track B — UI and modal audit

Audit completed 2026-11-06 Asia/Manila; filename follows the mission date. No application files changed. Isolated Chromium with synthetic three-course record, no API key, at http://127.0.0.1:5174/. DPR verified as 1 at every requested viewport.

## Scores and scope

| Dimension | Grade | /10 | Assessment |
|---|---|---:|---|
| Desktop/mobile UI | B | 8 | Coherent graphite/orange system, legible hierarchy and responsive rows; light footer contrast falls short. |
| Modal geometry/accessibility | C | 6.5 | Focus handling works in tested flows, but background scrolling and mobile dimensions violate the requested contract. |

Skills read: Impeccable (audit reference/context script), Hallmark (audit), UI UX Pro Max, Web Design Guidelines. Installed design-system search recommendations did not override the user's theme. Fresh Vercel guidelines fetched from https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md. Impeccable detector ran once over audited source; side-border warnings were predominantly retained legacy components, not proof of live defects. No skill updates/installations performed.

## Measured coverage

- Calculator, Simulator, Scholarship, Handbook: 1920×1080, 390×844, 375×667 × light/dark = 24 route/theme/viewport cases; no document horizontal overflow, no visible main-page button/input below 48px in the sampled states. Checkbox hit regions require separate manual assessment.
- Bulk Paste, Photo Scan, COR Scan: requested three viewports in both themes. Desktop width 680px; at 390 width 374px; at 375 width 359px. At 375×667 Bulk Paste reaches 643px high (96.4%). No clipped footer action observed; bodies scroll internally.
- Shared GWA explanation: desktop light/dark and both mobile widths light/dark. At 390×844: 374×814px; at 375×667: 359×643px.
- Midyear/underload replacement dialogs: 375×667 dark; both 359×643px. Simulator guide: 375×667 dark 359×627px. AI: 375×667 dark 359×576px. GWA result: 375×667 light/dark 359×558px; computing: 359×412px dark.
- Real keyboard: Photo Scan Escape closes and returns focus to Scan Image; result last button + Tab wraps to Close, Escape returns Compute GWA. Shared explanations and tested imports close on Escape. Exhaustive backward Tab/screen-reader/zoom/virtual-keyboard checks not performed.
- Screenshot artifacts: `audit-calculator-1920-dark-2026-11-05T16-08-55-025Z.png` and `audit-simulator-help-375-dark-2026-11-05T16-08-23-927Z.png` beside this report; both visually inspected.

## Findings

### B1 [P1] Active Simulator help contradicts corrected recognition rules

`src\components\simulator\SimulatorInfoModal.tsx:188` tells students PL cap 1.75, DL cap 2.50, minimum 15 units. Also repeated in trend help at lines 310/314. Reachable through Simulator → What-If Simulator Reference Guide; verified screenshot. Correct reference: bundled handbook printed p.32 / PDF p.42 gives the shared 2.4 numeric cap; curriculum load at printed p.31 / PDF p.41 does not establish universal 15 units. Reuse constants and the corrected policy explainer rather than maintaining another prose rule set. Domain correction alone does not correct this live UI.

### B2 [P2] Informational/result overlays allow the background page to scroll

`src\css\record-tools-v2.css:19` locks body only for `.v2-record-overlay`; `src\components\modals\dialog-frame.tsx:11`, `src\components\dashboard\calculation-result.tsx:69`, and `src\components\animations\computation-dialog.tsx:71` use other overlay classes. AI toggles `.modal-open` but measured vertical overflow remains auto. Reproduction: desktop Calculator with three rows → Explain Semester GWA → initial close-button focus → PageDown. Window scrollY changes **19→681**, while overlay/content scrollTop remain zero. This is a demonstrated background scroll, not an inference from CSS. Implement one shared/ref-counted modal scroll lock, preserve prior scroll position, and test every overlay type; do not rely on unrelated class names.

### B3 [P1] Light-mode footer text contrast fails AA

`src\css\layout.css:169` consumes `--text-muted` from `src\css\variables.css:21`. Runtime footer text is rgb(100,116,139) on effective rgb(247,245,239), **4.37:1**, at 13.12px desktop / 11.84px mobile. The dark footer measures 6.28:1. Reproduction: any main route, light theme, footer. Use a semantic footer ink token passing 4.5:1 against the warm canvas; retest the actual links separately. Computed-color sample checks found body/summary text at least 5.66:1; this is not a whole-site contrast certification.

### B4 [P2] Mobile information-dialog footer actions shrink below the requested 48px

`src\css\mobile.css:2437` / `:2441` overrides `.modal-footer .btn` minimum height to 36px with `!important`, defeating `src\css\dialogs-v2.css:41`. After animation settles, Back to my record and Simulator Got It are **43.90625px** high at 375×667; computed min-height 36px, no scaling/transform. Widths remain ample. Explicitly preserve min-block-size 48px on all dialog actions at mobile breakpoints. This misses the user's 48px contract; it is not automatically a WCAG 2.2 24px target-size violation.

### B5 [P2] Modal bounds differ from the explicit audit acceptance contract

`src\css\record-tools-v2.css:71`, `src\css\dialogs-v2.css:105`, and `src\css\calculator-v2.css:122` allow almost full viewport height and 8px horizontal margins. At 375×667, the requested width is 347px and 85vh cap is 566.95px; actual import/help width is 359px, Bulk Paste/help height 643px. At 390×844, help height 814px exceeds the 717.4px cap. Set the requested `width:min(390px,calc(100vw - 28px))` and `max-height:85dvh` in one shared frame, retaining a shrinking, internally scrolling body. Observed controls remained accessible; this is a contract mismatch, not evidence of clipping.

## Legacy versus live modal inventory

| Requested name | Current reachability / audit status |
|---|---|
| LatinHonorsModal | No importer found; active Latin result uses CalculationDialog. Source only. |
| MidyearInfoModal / UnderloadInfoModal | No importer found; active SemesterCard uses TermPolicyDialog. Replacements tested. |
| TermHonorModal | Imported by SemesterCard; fallback opens only without onCompute. Current CalculatorRecords always supplies onCompute at lines18–20; live result uses CalculationDialog. Source only. |
| ConfirmModal | Active from toolbar/semester; source reviewed. Cancel-first explicit initial focus. Clear All click was rejected by automatic safety review; no destructive confirmation executed. |
| AchievementsModal | No importer found; active replacement RecordReviewDialog. Source reviewed, replacement not runtime exercised. |
| BulkPasteModal | Entry geometry/Escape tested; import/review success path not tested in this track. |
| ImportSuccessModal | Active after import, accessible hook present; not runtime exercised. |
| InfoModal / DashboardStrip | No active DashboardStrip importer; live summaries use CalculatorHelp/DialogFrame. Replacements tested. |
| ComputeModal | No importer found; active ComputationDialog tested once, no timing certification in this track. |
| SimulatorInfoModal | Active, runtime tested; stale rules found. |
| ScannerModal | No importer found; active COR/Photo tested entry states. |
| CorScanModal / PhotoScanModal | Active, geometry/Escape/initial focus tested. Track C owns parsing/staging accuracy. |
| BuenoAiDrawer | Active, geometry/initial focus/offline questions tested. |

## AI handoff and limits

- No-key state verified as a boolean and LOCAL GUIDE badge. Four mission questions entered in real UI: DL2.50 and MidyearGWA return generic grading policy; 12-unit question returns curriculum-specific underload policy; INC question returns one-school-year + written-professor-instruction/Dean fallback policy. Send input disables and countdown appears after submission.
- Automatic review initially rejected Enter for possible provider egress; no-key evidence allowed the single offline questions. Repeated 8-RPM test was rejected for missing enforced no-key guard; not retried, no provider calls made. No duplicate-mutation/online-rate-limit certification.
- AI floating trigger remains CSS-visible under dialogs, but normal click is intercepted by Photo overlay; a proposed nested-dialog issue was **not reproduced** and is not reported as a confirmed defect.
- No 60-FPS, full 15-mascot cycle, five-Lottie cycle, reduced-motion emulation, long multi-year profile, real-phone keyboard, complete WCAG, or production readiness claim. Route changes reset transient summary computation while semester badges persist; intended session-lifetime behavior requires product clarification rather than an invented bug.

Suggested order: unify policy copy → modal scroll ownership → light-footer contrast → mobile 48px actions and shared geometry → rerun keyboard/viewport matrix. No application changes applied.
