# Handbook and native result verification

Date: 2026-11-05 (Asia/Manila). Synthetic browser records only; user grades were not edited.

## Automated evidence
- 132 tests pass across 13 suites, including exact handbook average/subject boundaries, zero-unit subject cap, load confirmation/persistence, per-term standing, all fifteen native scene renders, outcome selection and five-animation shuffle cycles.
- Production build passes; Lottie-web and PDF.js dependency eval warnings remain.
- ESLint: zero errors, four pre-existing warnings in BuenoAiDrawer, AcademicTrendChart (two), and ocr-engine.test.
- Impeccable detector over changed result/motion/mascot/CSS surfaces returns an empty findings array. Removed the old honor-evidence side accent; diff whitespace check passes (normal Windows line-ending notices).

## Isolated browser evidence
- Twenty result cases: GWA/Latin × light/dark × 320/375/768/1024/1440px. Dialogs remain contained; no horizontal overflow; native SVG renders; result actions meet 48px.
- Five real JSON scenes visually inspected in both themes, with no filters/JSON modifications. StrictMode cycles cover all five scenes without adjacent repeats; completion fires once.
- Shared 2700ms reveal clock: ready-to-callback measured about 2.75–2.91s including headless scheduling. Skip/Escape complete immediately; reduced motion bypasses scene playback.
- Controlled HTTP failure uses fallback; hung artwork falls back after about 4.03s, then completes once after the viewing interval. Test overrides restored.
- Native PL dark/light, DL dark and Good Academic Standing light screenshots reviewed against the reference composition; the latest user direction preserves existing website mascot geometry/theme.
- Four short-viewport cases (375×480, both modes/themes) remain contained, with one scroll region and no horizontal overflow.
- Tab/Shift+Tab wrap within the result; Enter expands details; Escape closes and returns focus to Compute GWA.
- A real synthetic record starts unconfirmed; confirming enables PL. Editing units clears confirmation and suppresses the open stale average with “— / Awaiting recomputation”.
- Contrast ratios: light body 16.10:1, muted 7.39:1, PL badge 6.08:1; dark body 12.82:1, muted 7.76:1, PL badge 8.44:1; orange primary action 6.22:1 in both themes.

## Sources and limits
- Approved plan: docs/superpowers/plans/2026-11-05-result-policy-correction.md; implementation/source index: docs/research/2026-11-05-result-policy-correction.md.
- Native pose review: docs/research/2026-11-05-result-mascot-contact-sheet.html.
- Browser contact sheet confirms all fifteen SVG poses in light/dark. Final screenshots live outside the repository in the existing Codex visualizations directory; use result-native-contact-sheet-light-verified and result-native-contact-sheet-dark files (2026-11-05).
- Isolated browser closed after checks; synthetic overrides removed. Vite remains available at http://127.0.0.1:5173/.
- User stopped ImageGen; production results render native SVG directly. Prior generated drafts remain unused; existing assets were not deleted.
- No commit, push, deployment, or new provider call. Local synthetic checks do not establish University certification, real-device behavior, OCR accuracy, or production health.
