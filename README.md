

# 🎓 BU GWA Calculator & Academic Evaluator

An unofficial, modern web application designed for Bicol University students to compute General Weighted Average (GWA), monitor semester GPAs, evaluate honor qualification standings, simulate future academic performance, and track scholarship retention per official BU Student Handbook guidelines.

<p align="center">
  <img src="https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5" />
  <img src="https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3" />
  <img src="https://img.shields.io/badge/javascript-%23F7DF1E.svg?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" />
  <img src="https://img.shields.io/badge/font%20awesome-%23528DD7.svg?style=for-the-badge&logo=fontawesome&logoColor=white" alt="FontAwesome" />
  <img src="https://img.shields.io/badge/pdf.js-%23FF0000.svg?style=for-the-badge&logo=adobeacrobatreader&logoColor=white" alt="PDF.js" />
</p>

👉 **Live Website**: [https://tsugumii21.github.io/bu-gwa-calculator-evaluator/](https://tsugumii21.github.io/bu-gwa-calculator-evaluator/)

---

> [!IMPORTANT]
> **Official Academic Disclaimer**: This application is an independent, open-source student utility built for self-monitoring and simulation. It is **not** officially affiliated with or endorsed by Bicol University administration. For official academic transcripts, Dean's Lister certificates, and graduation honors verification, please consult the Bicol University Office of the Registrar and respective College Deans.

---

## ✨ Main Features

- 🧮 **4-Decimal Precision Engine**: Computes real-time cumulative and semester GWAs using exact weighted grade point math rounded to 4 decimal places per official university policy.
- 📄 **Digital COR PDF Scanner**: Instant client-side extraction of course codes, descriptions, and credit units directly from official BU Certificate of Registration (COR) PDF documents via `PDF.js` worker.
- 📋 **Bulk Paste Parser**: Parses copied schedule text directly to rapidly populate semester classes.
- 🏆 **Honor Qualification Radar**: Automatically checks semester criteria for **President's Lister (PL)** and **Dean's Lister (DL)** eligibility, as well as graduation Latin Honors (Summa, Magna, Cum Laude) while showing exact point proximity gaps.
- 🧪 **Scenario Simulator**: Simulate future grade outcomes across remaining units and reverse-calculate exact required average grades to achieve target graduation honors.
- 🎓 **Scholarship Retention Monitor**: Track whether your current academic performance meets retention criteria across **DOST-SEI**, **CHED Merit**, **TES**, and **BU Athletic** scholarships.
- 🖨️ **Unofficial Print & PDF Transcript Export**: Automatically generates formal, printable transcript documents complete with an unofficial student planning tool disclaimer.
- 💼 **Safe Client-Side Storage**: Browser `localStorage` ensures 100% client-side privacy with zero server storage.

---

## 🎴 Dashboard Card Display Logic

The main dashboard features three critical metric cards that dynamically update to guide Bicol University students:

### 1. Cumulative GWA Card
- **No Semesters Added**: Shows `0.0000`.
- **Some Semesters Computed**: Displays the cumulative GWA of computed semesters only. Subtext shows: `Partial: X of Y terms computed` (where $X$ is computed semesters and $Y$ is total semesters).
- **All Semesters Computed**: Displays the total Cumulative GWA. Subtext shows: `Weighted Grade Average`.
- **No Semesters Computed**: Displays `Pending`. Subtext shows: `Awaiting term computation`.

### 2. Honor Qualification Card
- **No Semesters Added**: Shows `No Courses Added`. Subtext shows: `Add subjects to evaluate honor status`.
- **No Semesters Computed**: Shows `Pending Computation` in grey. Subtext shows: `Click 'Compute GPA' on card to evaluate`.
- **Computed Semesters (Mix or Complete)**: Evaluates academic standing based on the **most recently computed** semester card:
  - **President's Lister** (Gold text): Semester GPA $\le 1.4500$, no single grade $> 1.75$, and no underload.
  - **Dean's Lister** (Blue text): Semester GPA $\le 1.7500$, no single grade $> 2.50$, and no underload.
  - **Balanced Pace Bueño** (Orange text): Semester is flagged as underloaded.
  - **Dedicated Bueño** (Green text): Did not qualify for PL/DL or had deficiencies (`5.0` / `INC`).
  - *Note: If some semesters are still uncomputed, it appends a `(Latest Computed)` tag to the term title subtext.*

### 3. Academic Standing Card
- **Good Standing** (Green text): $0$ deficiencies.
- **Academic Warning** (Gold text): Exactly $1$ deficiency (`5.00` or `INC`).
- **Academic Probation** (Red text): Exactly $2$ deficiencies.
- **Academic Dismissal Risk** (Red text): $3$ or more deficiencies.

---

## 🛠️ Tech Stack

<p align="left">
  <img src="https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5" />
  <img src="https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3" />
  <img src="https://img.shields.io/badge/javascript-%23F7DF1E.svg?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" />
  <img src="https://img.shields.io/badge/font%20awesome-%23528DD7.svg?style=for-the-badge&logo=fontawesome&logoColor=white" alt="FontAwesome" />
  <img src="https://img.shields.io/badge/pdf.js-%23FF0000.svg?style=for-the-badge&logo=adobeacrobatreader&logoColor=white" alt="PDF.js" />
</p>

- **Frontend**: HTML5, Vanilla CSS3 (Custom Tokens, Flexbox, Grid), JavaScript ES6+
- **Document Processing**: `PDF.js` (client-side worker PDF text parser)
- **Icons, Fonts & FX**: Font Awesome 6, Google Fonts (`Outfit` & `Inter`), Animate.css
- **Storage**: Browser `localStorage` (100% client-side privacy, zero server storage)

---

## 🚀 Local Setup

1. Clone this repository:
   ```bash
   git clone https://github.com/tsugumii21/bu-gwa-calculator-evaluator.git
   ```
2. Navigate to the project directory:
   ```bash
   cd bu-gwa-calculator-evaluator
   ```
3. Open `index.html` in any modern web browser.

---

## 👨‍💻 Author & Contact

**Allen Del Valle**
- BSIT Student at Bicol University Polangui Campus
- GitHub: [@tsugumii21](https://github.com/tsugumii21)
- Email: [allendelvalle016@gmail.com](mailto:allendelvalle016@gmail.com)

---
