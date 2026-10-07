# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Vite + React 19 + TypeScript + Tailwind CSS v4 (migrating from vanilla HTML/CSS/JS)

## Users

Bicol University undergraduate students across all colleges and satellite campuses (BUCS, BUCENG, BUCBEM, BUCE, BUCN, BUCIT, BU Polangui, BU Sorsogon). Primary situation: checking academic standing during enrollment periods, grade release windows, and mid-year planning. Secondary audience: upperclassmen tracking 8+ semesters for graduation honor eligibility and scholarship retention.

## Product Purpose

A fully client-side academic planning tool that computes term GPAs and cumulative General Weighted Average (GWA) with 4-decimal precision, evaluates Dean's Lister and President's Lister qualifications per semester, tracks Latin Graduation Honor proximity (Summa/Magna/Cum Laude), simulates future grade scenarios, monitors scholarship retention compliance, and imports grades from official BU Certificate of Registration PDFs and grade sheet screenshots. Success means a BU student can verify their exact academic standing in under 60 seconds without manual spreadsheet calculations or waiting for official registrar processing.

## Positioning

Unlike generic GPA calculators, this engine is hardcoded to official Bicol University academic policies: 1.00–3.00 grading scale with 0.25 increments, 5.00 failure mark, INC/DRP exclusion rules, minimum unit load thresholds for honor eligibility, zero-deficiency checks, and retention rules per the BU Student Handbook (2019 Revised Edition, BOR Res. 89 s. 2006). No other tool computes BU-specific Latin Honors proximity or DOST/CHED/TES scholarship retention against actual student grades.

## Operating Context

Used on desktop and mobile web browsers (Chrome, Safari, Samsung Internet) during enrollment, grade release periods, and mid-year planning. Must work offline once loaded. Must produce print-ready PDF export summaries. All computation happens client-side with zero server dependency. Deployed as static assets to GitHub Pages via `.nojekyll` bypass.

## Capabilities and Constraints

### Confirmed Capabilities
- 4-decimal GWA math engine (grade points × units / graded units)
- Separate cumulative stats for all semesters vs. only computed semesters
- Per-semester GPA computation with lock/computed state
- Dean's Lister (GPA ≤ 1.75, no subject > 2.50) and President's Lister (GPA ≤ 1.45, no subject > 1.75) evaluation
- Latin Graduation Honors: Summa (≤ 1.2500), Magna (≤ 1.4500), Cum Laude (≤ 1.7500)
- Academic standing escalation: Good → Warning (1 fail) → Probation (2 fails) → Dismissal Risk (3+)
- What-If Simulator: projected GWA with anticipated grade slider (step 0.05, 2dp format)
- Target Honor Finder: minimum grade needed in remaining units for target honor
- Scholarship Monitor: DOST-SEI, CHED Full/Half, TES, BU Athletic presets with compliance checklist
- PDF COR Scanner: client-side pdfjs-dist parsing of Bicol University Certificate of Registration files
- Screenshot Scanner (new): Tesseract.js OCR for mobile grade sheet screenshots (max 3 images, with preprocessing and deduplication)
- Lottie loading animations: 12+ student-themed animations across 5 categories with non-repeating random picker
- Print/export with unofficial disclaimer banner
- College presets: BUCS, BUCENG, BUCBEM, BUCE, BUCN, BUCIT sample curricula

### Constraints
- Zero server calls. All data stays in browser localStorage.
- Grading scale is BU-specific: 1.00, 1.25, 1.50, 1.75, 2.00, 2.25, 2.50, 2.75, 3.00, 5.00, INC, DRP
- INC and DRP grades are excluded from GWA calculation (no numeric value)
- Underloaded terms disqualify from graduation honors
- Dark and light theme support required
- Must deploy to GitHub Pages (static output, no SSR)

## Brand Commitments

- **Student Greeting:** Always "Bueño Student" (never "Bicolano Student")
- **Identity:** Bicol University deep navy (`#0C2340`) as primary brand anchor, refined academic amber/gold (`#D97706`) as accent
- **Icons:** Lucide React SVG icons only. No FontAwesome, no emoji icons.
- **Precision:** All GWA displays use 4 decimal places. Simulator slider uses 0.05 step increments with 2 decimal place formatting.
- **Modals:** Desktop max-width 580–660px centered. Mobile: bottom sheet pattern.
- **Zero Deficiencies Badge:** Uses shield icon (formerly `fa-shield-halved`, now Lucide `ShieldCheck`)
- **Print Disclaimer:** Every exported document carries "unofficial academic planning tool" disclaimer
- **Creator:** Allen Del Valle

## Evidence on Hand

- [BU-Student-Handbook.pdf](BU-Student-Handbook.pdf): Official Bicol University Student Handbook (2019 Revised Edition), 3.9 MB. Article VI Section 13–15 (grading scale), Article VIII Section 28–29 (PL/DL criteria), Section 30 (Latin Honors).
- [images/bu-app-logo.png](images/bu-app-logo.png): Application logo asset.
- Existing production codebase at GitHub Pages: [tsugumii21.github.io/bu-gwa-calculator-evaluator](https://tsugumii21.github.io/bu-gwa-calculator-evaluator/)
- No real student data is stored or available. All demo data uses sample BUCS curriculum with fabricated grades.

## Product Principles

1. **Privacy is non-negotiable.** Every byte of student data stays on the student's device. Zero telemetry, zero server calls, zero tracking.
2. **BU handbook is the source of truth.** Every threshold, cutoff, and eligibility rule maps to a specific article and section number. No approximations.
3. **Instant clarity.** A student should know their exact academic standing within 60 seconds of opening the app, without tutorials or onboarding friction.
4. **Mobile-first, desktop-polished.** The majority of BU students access this on phones during enrollment queues and class breaks. Every interaction must work at 320px width.
5. **Offline-capable.** Once loaded, the app must function without internet. GitHub Pages serves the initial load; everything after is local.

## Accessibility & Inclusion

- Minimum 4.5:1 contrast ratio for all body text, 3:1 for large text
- All interactive elements keyboard-navigable with visible focus indicators
- `prefers-reduced-motion` respected: disable all Lottie animations and CSS transitions
- Grade inputs and tables must support screen readers with proper ARIA labels
- Color is never the sole indicator of status (always paired with icons and text labels)
