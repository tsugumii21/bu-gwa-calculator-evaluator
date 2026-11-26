# Simulator course workbench verification

Completed 2026-11-26, Asia/Manila, under the approved Design Council plan in ../redesign/v2/22-simulator-course-workbench.md.

## Delivered
- Six compact desktop rows or four mobile rows per page, with all courses contributing to the shared report.
- Add focuses Units; removal focuses the nearest row and supports one-level Undo. Horizon changes/reset/import refresh clear Undo. Unfinished entries on hidden pages have a reveal/focus action.
- View included grades opens read-only semester/course evidence, including exclusions and weighted points. Calculation details shares the existing three-step explanation. Quick estimate keeps its inline explanation.
- The course result fits a short desktop viewport and becomes sticky only when its measured height fits. Mobile uses an inline preview above the bounded editor.
- Fixed a stale source-semester ID affecting the displayed semester average after imported courses were gone. Actual imported semester scope remains supported.

## Automated checks
- npm test: 227 tests, 17 suites passed. Cases include0/1/6/7/12/24/200-course totals, fractional units, pending/INC/DRP/zero/invalid exclusions, and numeric4.00/5.00 contributions.
- npm run build: passed. Existing lottie-web eval warning remains.
- npm run lint: zero errors; one existing unused mergeMultiScreenshotResults warning in the OCR test.
- Sandbox test discovery failed with Vite realpath EPERM; the authorized outside-sandbox run passed.

## Chrome checks
- Inspected only the local site. The user record on127.0.0.1 was not edited. Synthetic editing/import checks used the separate localhost origin; its temporarily cleared CS112 sample grade was restored.
- Browser course counts0/1/6/7/8/12/24 checked across this implementation session;200-course behavior is domain-tested, not a browser stress-test claim.
- Checked Add focus, page boundaries, last-page removal, Undo, hidden unfinished entries, reset, horizon switching, goal/forecast formulas and imported read-only units. Refresh removes an imported assumption once its saved grade becomes numeric.
- Twelve3-unit assumptions at1.50 combined with the sample's23points/16units produced1.4808;24courses produced1.4886. The per-semester assumption remained1.5000.
- Both themes checked at375x667/390x844,768x900,1024x768,1280x900 and1536x695. No horizontal page overflow observed. Temporary viewport overrides were reset.
- Active Course5 stayed visible through six-to-four-row resizing and retained its edited name. Course controls measured48px high,16px input text; desktop rows measured64.8px.
- The compact forecast card measured550.4px and was sticky at1536x695. Oversized results use normal flow; no nested result scrollbar.
- Mobile record dialog measured565.11px in667px viewport, below566.95px (85%). Close/footer visible, body overflow auto, background locked. Calculation dialog used the same bound. Escape returned focus and preserved the current course page.
- Secondary-text contrast from computed theme tokens: light7.39:1 on white,6.78:1 on canvas; dark7.76:1 on surface,8.94:1 on canvas. Accent-label contrast6.22:1. Helpers13px. Reduced-motion fallback inspected in source; no physical-device motion recording.
- Final user-site console inspection returned no errors. Server remained running at http://127.0.0.1:5174/ with Simulator open in Chrome.

## Screenshots
Synthetic future assumptions only; these are verification examples, not the user's saved grades.
- [Dark course workspace](assets/2026-11-26-simulator-course-dark.jpg)
- [Light course workspace](assets/2026-11-26-simulator-course-light.jpg)
- [Dark mobile evidence](assets/2026-11-26-simulator-evidence-mobile-dark.jpg)

No new dependencies, academic record migration, mascot changes, commit or push.

## Typed-input follow-up
- At the user's request, Units and Expected grade now use decimal-keyboard text inputs: no number spinners or grade dropdown. Imported units remain read-only; blank grades still solve in goal mode.
- Chrome verified typed1.50 with fractional1.25units, rejection of1.45 and negative units, and blank-to-solve. User record and assumptions were preserved; test values used localhost.
- npm test:229tests/17suites passed; production build passed. Proof: assets/2026-11-26-simulator-typed-inputs-dark.jpg.
