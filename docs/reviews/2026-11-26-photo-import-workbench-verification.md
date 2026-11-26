# Photo import workbench verification — 2026-11-26

Implemented under user approval of [the Design Council plan](../redesign/v2/23-photo-import-workbench.md), including the confirmed preference that every review semester initially starts collapsed.

## Implemented behavior
- Semester groups accept file drops and picker selections through shared20-image/10MiB-per-file/100MiB-batch validation. Internal drag and Move to transfer ownership without recreating/revoking previews; affected indexed observations are invalidated.
- Compact filename/thumbnail rows, aligned folder/title controls and accessible48px actions replace large nested file cards. No new package or cloud service.
- Backdrop does not dismiss. Explicit close requests protect drafts with inline confirmation; Keep working restores previous fields and focus. Actual discard/import/unmount stops jobs and releases previews; late callbacks are guarded.
- Initial review has every semester collapsed; one expands at a time. Correction counts/actions reveal the blocked group and focus its invalid field. Course name replaces Description within this flow; decimal-keyboard fields preserve pending/zero units and existing validation.
- Numeric-only course names warn without automatic grade inference. Retrying a source retains completed overlapping evidence from other images and unrelated review edits; conflicting retry evidence remains explicit.
- Stop scan preserves selected images and completed results. Real progress remains while processing; completion uses compact status and per-image outcome/retry disclosures. Reduced motion disables presentation transitions.

## Automated checks
- `npm test`:241 tests across18 suites pass. Added bucket ownership/preview/limit/rejection/invalidation checks, numeric-name handling and overlapping-source retry preservation/conflict cases.
- `npm run build`: production compilation passed; existing lottie-web eval warning remains.
- `npm run lint`:0 errors,1 pre-existing unused-import warning in ocr-engine.test.ts. New scanner warning was corrected.

## Chrome observations
- Tested only the local site, using separate localhost origin and synthetic draft titles; original127.0.0.1 user records were not edited.
- Light/dark widths375,390,768,1280,1536px; mobile/tablet height667px, desktop695px. Dialog width≤660px, measured height≤85% of viewport, visible footer, no horizontal page overflow. Actual upload helper13px/input16px; visible actions≥48px.
- One/two/six empty semester groups, title edits, empty-scan feedback, Add focus, body scroll lock, retained draft on backdrop, confirmation and Keep working, Escape confirmation/cancel, Shift+Tab wrap and trigger-focus restoration checked.
- Corrected desktop inherited height specificity by defining the local dialog-height limit. Corrected return focus after conditional footer controls remount. No console errors/warnings captured in final inspected tab.
- Restored viewport overrides and closed temporary test tabs. Existing user tabs and dev server5174 remain available.

## Verification limits
- The attempted synthetic PNG upload was rejected by Chrome integration because the extension lacks Allow access to file URLs. Browser settings were left unchanged, respecting the user's site-only scope.
- Therefore populated thumbnail/review layout, native file drop/internal drag, Move to interaction, live OCR, Stop/retry and final synthetic import were **not** verified end to end in Chrome. Bucket/domain behavior has automated coverage; source/UI wiring inspection does not replace these pending live checks.
- Synthetic fixture: assets/2026-11-26-synthetic-scan-table.png. It contains generated TEST courses, not personal records. No current recognition-accuracy claim is made.
- No Git commit, push, deployment, dependency or secret change in this task. Prior unrelated working-tree changes retained.

## Screenshots
- [Light desktop, six empty semesters](assets/2026-11-26-photo-import-light-desktop.jpg)
- [Dark desktop, two empty semesters](assets/2026-11-26-photo-import-dark-desktop.jpg)
- [Dark mobile, two empty semesters](assets/2026-11-26-photo-import-dark-mobile.jpg)
