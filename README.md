<div align="center">

# 🎓 Bicol University GWA Calculator & Academic Evaluator
### Academic planning tools for Bicol University students

Calculate your General Weighted Average (GWA), review your progress toward Latin honors, and explore future grade scenarios using your saved semester record.

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Vitest](https://img.shields.io/badge/Vitest-5.0-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)](https://vitest.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Zustand](https://img.shields.io/badge/Zustand-5-443e38?style=for-the-badge)](https://github.com/pmndrs/zustand)
[![Tesseract.js](https://img.shields.io/badge/Tesseract.js-7.0-5c2d91?style=for-the-badge)](https://tesseract.projectnaptha.com/)
[![PDF.js](https://img.shields.io/badge/PDF.js-6.5-e65100?style=for-the-badge)](https://mozilla.github.io/pdf.js/)

<p align="center">
  <a href="https://tsugumii21.github.io/bu-gwa-calculator-evaluator/"><strong>🌐 Launch Live Web App</strong></a> •
  <a href="#-key-platform-capabilities"><strong>✨ Explore Features</strong></a> •
  <a href="#-handbook-and-academic-rules"><strong>📖 Handbook Policies</strong></a> •
  <a href="#-technical-architecture--tech-stack"><strong>🛠️ Architecture</strong></a> •
  <a href="#privacy-and-academic-disclaimer"><strong>Privacy & Academic Disclaimer</strong></a>
</p>

</div>

---

> [!IMPORTANT]
> **Independent student project**
> Use results for personal planning. Bicol University confirms official grades, academic standing, and honors. Check scholarship decisions with the relevant scholarship office.

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Key Platform Capabilities](#-key-platform-capabilities)
- [Handbook and academic rules](#-handbook-and-academic-rules)
- [Technical Architecture & Tech Stack](#-technical-architecture--tech-stack)
- [Run locally](#run-locally)
- [Codebase Structure](#-codebase-structure)
- [Privacy and academic disclaimer](#privacy-and-academic-disclaimer)
- [Author & Academic Credits](#-author--academic-credits)
- [License & Intellectual Property](#-license--intellectual-property)

---

## 💡 Overview

Enter grades manually, paste rows, or review imported courses before saving them. The same browser-local record drives the Calculator, Simulator, and Scholarship pages.

### Start with your record

1. Open **Calculator** and add a semester. Mark Midyear and Underloaded where applicable.
2. Enter your courses and units or use **Scan COR (PDF)**, **Scan Image**, or **Bulk Paste**. Review the import before saving.
3. Use **GWA** for a single semester or **Latin Honors** for the cumulative record. In **Review record**, enter the required regular semesters and credit units from your own curriculum.

---

## ✨ Key Platform Capabilities

| Feature | What you can do |
|---|---|
| **Semester GWA** | Compute a credit-weighted average for the selected term and review estimated semester recognition, academic standing, and recorded units. |
| **Latin Honors** | Review cumulative GWA and honors progress. After six completed regular semesters, the app can show unofficial eligibility. It shows a graduation estimate when the saved record also meets both curriculum targets and has no outstanding eligibility flags. |
| **Grade imports** | Stage multiple Certificate of Registration (COR) PDFs, review course rows extracted from images, or paste tabular grades. Correct scan results before committing them to your record. |
| **Simulator** | Project cumulative GWA from future units and grades, estimate grades needed to reach a target, and inspect semester trends. |
| **Scholarship** | Compare saved grades with requirements from your scholarship agreement. Editable presets are starting points to review before confirming. |
| **Handbook** | Browse academic policy summaries with printed and PDF page references and open the bundled handbook. |
| **Gabay BU** | Look up curated handbook guidance and review your saved grades locally. The app can also use Gemini when an existing browser key is present. |

---

## 📖 Handbook and academic rules

The app references the bundled [Bicol University Student Handbook](public/BU-Student-Handbook.pdf), Reprinted Version 2019. Page pairs below give the printed page followed by the PDF viewer page.

| Topic | How the app handles it | Handbook pages |
|---|---|---|
| **Weighted GWA** | Divides the sum of grade × units by the graded units. Valid numeric grades with positive units count, including Midyear courses in cumulative GWA. Blank grades, INC, and DRP are excluded from the average. The display uses four decimal places. | p. 18 / PDF p. 28 |
| **Semester recognition** | President’s Lister uses a maximum GWA of 1.4500. Dean’s Lister covers above 1.4500 through 1.7500. Both use a maximum numeric subject grade of 2.4 and consider the prescribed curriculum load and grade status. | pp. 31–32 / PDF pp. 41–42 |
| **Latin honors** | Summa goes through 1.2500, Magna above 1.2500 through 1.4500, and Cum Laude above 1.4500 through 1.7500. The app uses the unrounded weighted result and reviews grade and load conditions. BU verifies curriculum completion and residency. | pp. 20–21 / PDF pp. 30–31 |
| **Underload** | Compare the actual term load with the load prescribed by your curriculum. A flagged underload prompts review of recognition or honors eligibility. | pp. 21, 31–32 / PDF pp. 31, 41–42 |
| **Incomplete (INC)** | The handbook provides one school year to complete an INC. Your record keeps the grade you enter until you update it. | p. 20 / PDF p. 30 |

---

## 🛠️ Technical Architecture & Tech Stack

| Layer | Technologies |
|---|---|
| **Application** | React 19, React DOM, TypeScript 5.6 |
| **Build and deployment** | Node.js, npm, Vite 6 with Rollup, GitHub Actions and GitHub Pages |
| **State and storage** | Zustand 5 with persisted stores backed by browser localStorage |
| **Styling and visuals** | Tailwind CSS 4, CSS theme tokens, Outfit and Inter, Lucide React icons, SVG illustrations, Lottie React animations |
| **PDF imports** | PDF.js 6.5.438 (pdfjs-dist) for text extraction in a bundled browser worker |
| **Image imports** | Tesseract.js 7.0.0 with WebAssembly and a browser worker, plus Canvas 2D for preprocessing |
| **Handbook assistant** | Local handbook search and grade review, with an optional Gemini API path |
| **Code checks** | Vitest 5, ESLint 9, typescript-eslint, and the TypeScript compiler |

React views use shared stores and pure functions in `src/core/` for grade calculations and policy checks. PDF and image import processing runs in browser workers.

## Run locally

Use npm with **Node.js 22.13.0 or later in the 22.x line** (matching the deployment workflow) or **Node.js 24**.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. The calculator, local imports, and local Gabay BU guide require no environment variables or API key. OCR may download its engine and language data on first use.

| Command | Purpose |
|---|---|
| `npm test` | Run the Vitest suite. |
| `npm run lint` | Check the code with ESLint. |
| `npm run build` | Type-check and build the static app into `dist/`. |
| `npm run preview` | Serve the production build locally after building. |

The [GitHub Pages workflow](.github/workflows/deploy.yml) builds and deploys `dist/` on pushes to `main`.

---

## 📂 Codebase Structure

```
BU-GWA Calculator/
├── public/
│   ├── BU-Student-Handbook.pdf       # Official Bicol University Student Handbook
│   └── images/                       # University seals, emblems & logos
├── src/
│   ├── main.tsx                      # Application bootstrap & DOM root
│   ├── App.tsx                       # Mounts the app shell
│   ├── index.css                     # Global stylesheet entry point
│   ├── hooks/
│   │   └── useAccessibleDialog.ts    # Accessible modal focus trap & Escape listener
│   ├── core/
│   │   ├── constants.ts              # Grading scales, honor criteria & scholarship presets
│   │   ├── gwa-engine.ts             # Weighted GWA and credit-unit calculations
│   │   ├── honor-rules.ts            # Honors, academic standing, and target grades
│   │   ├── handbook-knowledge.ts     # Curated handbook search and page references
│   │   └── __tests__/                # Vitest automated test suites
│   │       ├── gwa-engine.test.ts    # Arithmetic & bounds validation tests
│   │       └── honor-rules.test.ts   # Honors and academic standing tests
│   ├── store/
│   │   └── index.ts                  # Zustand state persistence for semesters & settings
│   ├── types/
│   │   └── index.ts                  # Strict TypeScript domain interfaces
│   ├── components/
│   │   ├── layout/                   # Welcome, navigation, theme controls, and footer
│   │   ├── dashboard/                # Calculator, summary cards, and results
│   │   ├── semester/                 # SemesterCard (Collapsible), SubjectRow (Debounced)
│   │   ├── scanner/                  # CorScanModal, PhotoScanModal, ocr-engine, pdf-parser
│   │   ├── simulator/                # SimulatorView, SubjectTargetAllocator
│   │   ├── charts/                   # SVG semester trends
│   │   ├── modals/                   # LatinHonorsModal, AchievementsModal, ConfirmModal
│   │   ├── ai/                       # Gabay BU and optional Gemini transport
│   │   ├── scholarship/              # Editable scholarship requirements and results
│   │   ├── handbook/                 # Handbook, policy references, usage guide, and about
│   │   └── illustrations/            # Shared illustrations and theme-specific mascot artwork
│   └── css/
│       ├── base.css                  # Global resets, :focus-visible, reduced-motion
│       ├── variables.css             # CSS design variables
│       ├── dark-theme.css            # Dark theme overrides
│       ├── components.css            # Shared component styles
│       ├── mobile.css                # Breakpoint-specific mobile ergonomics
│       └── print.css                 # Styles for personal planning printouts
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## Privacy and academic disclaimer

BU GWA Calculator is an independent student project. For official grades, standing, honors, or records, contact the Bicol University Office of the University Registrar or your college. Use app results and any printouts as personal planning aids.

Semester records and settings are stored in this browser. Clearing site data also clears your saved records. PDF and screenshot imports are processed in the browser. The app may fetch public font and OCR resources.

Gabay BU searches handbook excerpts and reviews your saved grades locally. If an existing browser key enables Gemini, online questions send the entered text, relevant handbook excerpts, and recent online conversation to Google. Keep student identifiers and grades out of online prompts. You can clear a previously saved key in the guide to use local mode.

To see how the app handles your data, follow the code for [PDF parsing](src/components/scanner/pdf-parser.ts), [image OCR](src/components/scanner/scan-service.ts), [bulk paste](src/components/modals/BulkPasteModal.tsx), and [browser storage](src/store/index.ts). For Gabay BU, see [local grade review and handbook replies](src/components/ai/BuenoAiDrawer.tsx) and [the request sent to Gemini](src/components/ai/gemini-chat.ts).

---

## 👨‍💻 Author & Academic Credits

**Allen Del Valle**  
*BSIT Student, Bicol University Polangui Campus*  
*Creator & Maintainer*  

- **GitHub**: [@tsugumii21](https://github.com/tsugumii21)
- **Project Repository**: [bu-gwa-calculator-evaluator](https://github.com/tsugumii21/bu-gwa-calculator-evaluator)
- **Email**: [allendelvalle016@gmail.com](mailto:allendelvalle016@gmail.com)

Built for Bicol University students to review grades and plan their next semester.

---

## 📜 License & Intellectual Property

Copyright © 2026 **Allen Del Valle**. All Rights Reserved.

See the [LICENSE](LICENSE) for the project’s terms of use.
