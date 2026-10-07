<div align="center">

# 🎓 Bicol University GWA Calculator & Academic Evaluator
### Official Academic Governance & Planning Suite for Bueño Students

An independent, client-side academic evaluation platform engineered exclusively for Bicol University students across all colleges and campuses. Governed strictly by the **Bicol University Student Handbook (BOR Res. No. 89, s. 2006)**.

[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Zustand](https://img.shields.io/badge/Zustand-5.0-443e38?style=for-the-badge)](https://github.com/pmndrs/zustand)
[![Tesseract.js](https://img.shields.io/badge/Tesseract.js-OCR-5c2d91?style=for-the-badge)](https://tesseract.projectnaptha.com/)
[![PDF.js](https://img.shields.io/badge/PDF.js-Client--Side-e65100?style=for-the-badge)](https://mozilla.github.io/pdf.js/)
[![BOR Res. 89](https://img.shields.io/badge/BOR_Res._89,_s._2006-Compliant-059669?style=for-the-badge)](public/BU-Student-Handbook.pdf)
[![Data Privacy](https://img.shields.io/badge/RA_10173-Zero_Telemetry-0284c7?style=for-the-badge)](https://privacy.gov.ph/)

<p align="center">
  <a href="https://tsugumii21.github.io/bu-gwa-calculator-evaluator/"><strong>🌐 Launch Live Web App</strong></a> •
  <a href="#-key-platform-capabilities"><strong>✨ Explore Features</strong></a> •
  <a href="#-official-academic-policy-governance"><strong>📖 Handbook Policies</strong></a> •
  <a href="#-statutory--institutional-governance-disclaimer"><strong>⚖️ Official Disclaimer</strong></a> •
  <a href="#-local-development--setup"><strong>🚀 Local Setup</strong></a>
</p>

</div>

---

> [!IMPORTANT]
> **OFFICIAL ACADEMIC DISCLAIMER & GOVERNANCE NOTICE**  
> The **BU GWA Calculator & Academic Evaluator** is an independent, non-commercial software project engineered by student software developers. It is **not officially affiliated with, endorsed, sponsored, administered, or operated by Bicol University, the Board of Regents (BOR), or university administration**. All calculations, classifications, and predictions remain **strictly advisory simulations for personal student reference**. The sole legal and institutional body empowered to certify grades, confer graduation honors, and issue official documents is the **Bicol University Office of the University Registrar (OUR)** in concurrence with respective College Deans.

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Key Platform Capabilities](#-key-platform-capabilities)
- [Official Academic Policy Governance (BOR Res. 89, s. 2006)](#-official-academic-policy-governance)
- [Technical Architecture & Tech Stack](#-technical-architecture--tech-stack)
- [Codebase Structure](#-codebase-structure)
- [Statutory & Institutional Governance Disclaimer](#-statutory--institutional-governance-disclaimer)
- [Local Development & Setup](#-local-development--setup)
- [Author & Academic Credits](#-author--academic-credits)
- [License & Intellectual Property](#-license--intellectual-property)

---

## 💡 Overview

The **Bicol University GWA Calculator & Academic Evaluator** bridges the gap between raw grades and actionable graduation roadmaps for Bueño students. Unlike generic GPA calculators, this platform is deeply codified with the specific administrative resolutions of Bicol University, including 4-decimal precision arithmetic, President's and Dean's Lister semester honor thresholds, Latin graduation honor brackets, unexcused underload disqualifications, and the 1-year Incomplete (INC) expiration rule.

### Core Highlights:
- **100% Client-Side & Zero-Knowledge**: No student credentials, course marks, or PDF transcripts ever leave the user's browser. Zero remote tracking, zero databases.
- **Multi-Modal Document Ingestion**: Ingests multi-term Certificate of Registration (COR) PDFs concurrently or scans iBU grade sheets via in-browser Tesseract.js OCR.
- **Scenario Simulation Engine**: Predicts future cumulative standing with 0.05 step precision and reverse-solves required target grades across remaining major courses.
- **Embedded AI Handbook Advisor**: Offers offline Student Handbook search, one-click transcript audits, and conversational academic counseling.

---

## ✨ Key Platform Capabilities

| Capability | Module | Key Features & Implementation |
|---|---|---|
| **Dynamic 4-Decimal GWA Engine** | Core Math | Computes exact semestral GPA and Cumulative GWA to 4 decimal places per BOR Res. 89 s. 2006. Strict mathematical boundary separation isolates draft loads and non-numerical marks (`INC`, `DRP`). |
| **Multi-COR PDF Staging Queue** | Client Ingestion | Concurrent multi-file PDF queue with text extraction via `pdfjs-dist`. Allows inline term renaming, course unit audit, and single-click batch ingestion into individual semesters. |
| **Multi-Semester Screenshot Bucket OCR** | In-Browser Vision | Upload up to 3 images per semester bucket for tall grade sheets. Employs adaptive bilinear Canvas scaling, automatic dark-mode inversion, and Tesseract.js optical character recognition. |
| **Term Honors & Latin Proximity Radar** | Honor Evaluation | Evaluates President's Lister ($\le 1.4500$) and Dean's Lister ($\le 1.7500$) semester standing with individual grade ceilings ($1.75$ and $2.50$), alongside live Latin Honor point gap distance tracking. |
| **Underload & Deficiency Safeguards** | Policy Guards | Automatically detects underloaded semesters ($<15$ units), unremoved `INC` marks nearing the 1-year calendar deadline, and failing grades (`5.00`) that void Latin Honor eligibility. |
| **Simulator & Subject Target Allocator** | Reverse-Solver | Projects future cumulative GWA with a 0.05 step precision slider. Features an intelligent reverse-solver: lock expected grades in GE/PE courses to dynamically solve required marks in remaining majors. |
| **Academic Trend Visualizer** | Analytics | Lightweight zero-dependency SVG trajectory chart graphing semestral GPAs against running cumulative GWA alongside official Summa, Magna, and Cum Laude benchmark horizons. |
| **Bueño AI Handbook Advisor** | AI Assistant | Trained on the complete BU Student Handbook. Features on-device handbook search index, 1-click "Analyze My Grades" academic diagnostics, and optional rate-limited Google Gemini API integration. |
| **Scholarship Retention Monitor** | Compliance Engine | Automated compliance engine benchmarking student standing against official maintenance criteria for DOST-SEI Merit, CHED Merit, UniFAST TES, and BU Athletic grants. |

---

## 📖 Official Academic Policy Governance

Every formula, honor threshold, and warning condition in this platform is directly codified from the official **Bicol University Student Handbook (BOR Res. No. 89, s. 2006)**:

### 1. Official BU Grading Scale (Article IX)
| Grade Point | Description | Percentage Equivalent | Remarks |
|:---:|:---:|:---:|:---|
| **1.00** | Excellent | 98 – 100% | Highest Academic Honor |
| **1.25** | Superior | 95 – 97% | Honors Qualifying |
| **1.50** | Very Satisfactory | 92 – 94% | Honors Qualifying |
| **1.75** | Satisfactory | 89 – 91% | Dean's Lister Baseline Limit |
| **2.00 – 2.75** | Fair to Good | 77 – 88% | Credited Passing Range |
| **3.00** | Passing | 75 – 76% | Minimum Passing Mark |
| **4.00** | Conditional Failure | 70 – 74% | Subject to Removal Exam |
| **5.00** | Failed | Below 70% | Permanent Honor Disqualification |
| **INC** | Incomplete | — | Must be completed within 1 calendar year or becomes 5.00 |
| **DRP** | Officially Dropped | — | Dropped with Dean approval before midterm exam |

### 2. Semestral Term Honors (Article VIII, Sec. 28–29)
* **President's Lister (PL)**: Semestral GPA $\le 1.4500$, carried at least 15 academic units, no single grade below $1.75$, and zero `INC` or `DRP` marks.
* **Dean's Lister (DL)**: Semestral GPA $\le 1.7500$, carried at least 15 academic units, no single grade below $2.50$, and zero `INC` or `DRP` marks.

### 3. Graduation Latin Honors (Article VIII, Sec. 30)
* **Summa Cum Laude**: Cumulative GWA of **1.0000 – 1.2500** (no grade lower than $2.00$).
* **Magna Cum Laude**: Cumulative GWA of **1.2501 – 1.4500** (no grade lower than $2.25$).
* **Cum Laude**: Cumulative GWA of **1.4501 – 1.7500** (no grade lower than $2.50$).
* **Mandatory Prerequisites**: At least 75% residency in Bicol University, completed degree within prescribed regular years, zero failing marks (`5.00`), and zero unexcused underloading across all semesters enrolled.

---

## 🛠️ Technical Architecture & Tech Stack

```
                                  ┌─────────────────────────────────────────┐
                                  │           User Web Browser              │
                                  └────────────────────┬────────────────────┘
                                                       │
                           ┌───────────────────────────┴───────────────────────────┐
                           ▼                                                       ▼
        ┌─────────────────────────────────────┐                 ┌─────────────────────────────────────┐
        │        Document & Image OCR         │                 │         Client-Side Engine          │
        ├─────────────────────────────────────┤                 ├─────────────────────────────────────┤
        │ • pdfjs-dist (COR PDF Parsing)      │                 │ • React 19 + TypeScript 5.8         │
        │ • Tesseract.js (Screenshot OCR)     │                 │ • Zustand 5 (Local Persistence)     │
        │ • Canvas 2D (Bilinear Preprocessing)│                 │ • Tailwind CSS v4 + Design Tokens   │
        └──────────────────┬──────────────────┘                 └──────────────────┬──────────────────┘
                           │                                                       │
                           └───────────────────────────┬───────────────────────────┘
                                                       ▼
                                      ┌─────────────────────────────────┐
                                      │     Pure Mathematical Core      │
                                      ├─────────────────────────────────┤
                                      │ • gwa-engine.ts (4-Decimal GWA) │
                                      │ • honor-rules.ts (Latin Radar)  │
                                      │ • handbook-knowledge.ts (RAG)   │
                                      └─────────────────────────────────┘
```

| Layer | Technologies |
|---|---|
| **Core Framework** | React 19, TypeScript 5.8, Node.js |
| **Build & Bundler** | Vite 6, Rollup Code Splitting |
| **State Management** | Zustand 5 with `persist` middleware (`localStorage`) |
| **Styling & Theming** | Tailwind CSS v4, Custom Semantic CSS Variables, Dual Light/Dark Modes |
| **Document Processing** | `pdfjs-dist` (Client-side WebWorker PDF Text Extraction) |
| **Computer Vision / OCR** | `tesseract.js` (WebAssembly OCR Engine), HTML5 Canvas 2D Bilinear Filters |
| **Typography & Icons** | Google Fonts (*Outfit*, *Inter*, *Playfair Display*, *Space Mono*), Font Awesome 6 Pro |
| **Animations** | `lottie-web` JSON Vector Animations |
| **AI Advisor (Optional)** | Built-in Offline Search Index + Google Gemini 1.5 Flash API (Rate-Limited) |

---

## 📂 Codebase Structure

```
BU-GWA Calculator/
├── public/
│   ├── BU-Student-Handbook.pdf       # Official Bicol University Student Handbook
│   ├── animations/                   # Lottie compute & loader animations
│   └── images/                       # University seals, emblems & logos
├── src/
│   ├── main.tsx                      # Application bootstrap & DOM root
│   ├── App.tsx                       # AppShell controller & tab routing
│   ├── index.css                     # Global reset, typography & design tokens
│   ├── mobile.css                    # Responsive layouts & mobile overrides
│   ├── core/
│   │   ├── constants.ts              # Grading scales, honor criteria & scholarship presets
│   │   ├── gwa-engine.ts             # Pure mathematical functions for GPA, GWA & units
│   │   ├── honor-rules.ts            # Latin honor solvers & target grade reverse-solver
│   │   └── handbook-knowledge.ts     # Curated BU Student Handbook RAG search index
│   ├── store/
│   │   └── index.ts                  # Zustand state persistence for semesters & settings
│   ├── types/
│   │   └── index.ts                  # Strict TypeScript domain interfaces
│   ├── components/
│   │   ├── layout/                   # AppHeader, DesktopNav, WelcomeScreen, ThemeToggle
│   │   ├── dashboard/                # MetricCard, DashboardStrip, CalculatorView
│   │   ├── semester/                 # SemesterCard (Collapsible), SubjectRow, GradeSelect
│   │   ├── scanner/                  # CorScanModal, PhotoScanModal, ocr-engine, pdf-parser
│   │   ├── simulator/                # SimulatorView, SubjectTargetAllocator
│   │   ├── charts/                   # AcademicTrendChart (Pure SVG)
│   │   ├── modals/                   # LatinHonorsModal, AchievementsModal, ConfirmModal
│   │   ├── ai/                       # BuenoAiDrawer (Handbook Advisor & Diagnostic)
│   │   ├── scholarship/              # ScholarshipView (DOST, CHED, TES monitor)
│   │   ├── policies/                 # PoliciesView (Grading table & handbook articles)
│   │   └── about/                    # AboutView (Overview, Guide, Policies, Developer)
│   └── css/
│       ├── components.css            # Component styles & Linear-style bento grid
│       └── print.css                 # Clean printable transcript stylesheet
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## ⚖️ Statutory & Institutional Governance Disclaimer

This software enforces five strict governance clauses to guarantee student protection, data privacy, and compliance with Philippine institutional laws:

### Clause I — Institutional Independence & Non-Affiliation
The **Bicol University GWA Calculator & Academic Evaluator** is an independent, non-commercial software project engineered by student software developers. It is **not officially affiliated with, endorsed, sponsored, administered, or operated by Bicol University, the Board of Regents (BOR), or university administration**. Any reference to "Bicol University", "BU", "iBU", campus names, or heraldic emblems is made strictly for nominative identification, educational reference, and student community public service.

### Clause II — Sole Certification Authority of the University Registrar (OUR)
All numeric GWA calculations, President's Lister and Dean's Lister classifications, Latin graduation honor forecasts, and scholarship retention evaluations generated by this platform remain **strictly advisory simulations for self-monitoring only**. The sole, authoritative legal and institutional body empowered to certify academic grades, confer graduation honors, and issue official documents is the **Bicol University Office of the University Registrar (OUR)** in concurrence with respective College Deans. This web application does not replace, supersede, or modify official student records.

### Clause III — Anti-Falsification Policy & Prohibition of Document Misrepresentation
All generated outputs—including exported PDF academic worksheets and printable grade rosters—are personal planning aids and educational reference worksheets. **Presenting, altering, submitting, or utilizing any graphic or output generated by this software as an Official Transcript of Records (OTR), certified Certificate of Registration (COR), or verified institutional document before scholarship boards, employers, government agencies, or university committees is strictly prohibited** and constitutes academic dishonesty and falsification punishable under the Bicol University Student Code of Conduct (Art. XII), the Cybercrime Prevention Act of 2012 (RA 10175), and the Revised Penal Code of the Philippines.

### Clause IV — Absolute Limitation of Liability
Under no circumstances shall the developer, contributors, or hosting platforms be held legally or academically liable for any academic disqualifications, scholarship forfeitures, grade contestations, course load disputes, or curriculum misinterpretations arising from the use of or reliance on this calculator. Students maintain personal responsibility to review their official curriculum checklist and confirm all graduation requirements directly with their respective Department Chairperson and College Registrar.

### Clause V — Zero-Knowledge Privacy Architecture & Philippine Data Privacy Act (RA 10173)
This application operates on a **100% client-side, zero-telemetry architecture**. Uploaded Certificate of Registration (COR) PDF files, mobile screenshots, student names, course titles, and numeric grades are parsed entirely inside your browser's sandboxed local memory via client-side WebAssembly, Canvas, and Tesseract.js. No student credentials, portal passwords, or scholastic data are ever transmitted across external networks, saved to remote databases, or collected. The platform fully complies with Republic Act 10173 (Data Privacy Act of 2012).

---

## 🚀 Local Development & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (Version 18.0 or later recommended)
- [npm](https://www.npmjs.com/) (Version 9.0 or later)

### Steps

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/tsugumii21/bu-gwa-calculator-evaluator.git
   cd bu-gwa-calculator-evaluator
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start Local Development Server**:
   ```bash
   npm run dev
   ```
   *Vite will launch the local development server (typically at `http://localhost:5173/`).*

4. **Build for Production**:
   ```bash
   npm run build
   ```
   *Compiles TypeScript and creates optimized minified assets inside the `dist/` directory.*

5. **Preview Production Build**:
   ```bash
   npm run preview
   ```

---

## 👨‍💻 Author & Academic Credits

**Allen Del Valle**  
*BSIT Student, Bicol University Polangui Campus*  
*Creator & Maintainer*  

- **GitHub**: [@tsugumii21](https://github.com/tsugumii21)
- **Project Repository**: [bu-gwa-calculator-evaluator](https://github.com/tsugumii21/bu-gwa-calculator-evaluator)
- **Email**: [allendelvalle016@gmail.com](mailto:allendelvalle016@gmail.com)

Designed and developed as an open-source contribution to empower Bicol University students across Albay and Sorsogon with modern, transparent, and legally sound academic tracking utilities.

---

## 📜 License & Intellectual Property

Copyright © 2026 **Allen Del Valle**. All Rights Reserved.

This software is provided exclusively for personal academic reference and non-commercial educational use under Section 185 (Fair Use) of the **Intellectual Property Code of the Philippines (Republic Act No. 8293)**. Unauthorized commercial exploitation, unauthorized closed-source re-licensing, or malicious misrepresentation of university branding is strictly prohibited. For details, consult the [LICENSE](LICENSE) file.
