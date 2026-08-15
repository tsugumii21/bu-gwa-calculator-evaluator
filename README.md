

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

- 🧮 **Dynamic GWA Math Engine**: Computes exact semester GPA and Cumulative GWA (separating total units from graded units to handle ungraded draft semesters, and calculating partial stats for computed terms so far).
- 📄 **Digital COR PDF Scanner**: Instant client-side parsing and text extraction of Bicol University Certificate of Registration (COR) files, importing classes with blank grade ratings to wait for student input.
- 🏆 **Academic Honors Lister**: Automatically evaluates semester academic standings (President's Lister or Dean's Lister eligibility) in strict compliance with the Bicol University Student Handbook criteria.
- 🏅 **Graduation Honor Proximity Radar**: Live analysis showing candidacy status for **Summa Cum Laude**, **Magna Cum Laude**, or **Cum Laude**, including the exact point gap needed to reach the next honor level.
- ⚠️ **Underload & Deficiency Safeguards**: Detects academic anomalies like underloaded terms or carrying failing/incomplete grades (`5.0` or `INC`) and flags their impact on lister and graduation honors eligibility.
- 📋 **Bulk Paste Parser**: Rapidly populates semester classes by parsing copied raw schedule or text blocks directly.
- 🧪 **What-If Scenario Simulator**: Projects future GWA outcomes based on simulated grades for remaining course units.
- 🎓 **Scholarship Retention Tracker**: Custom guidelines compliance monitor for DOST, CHED, TES, and BU Athletic scholarship programs.

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

## 📜 License

Copyright © 2026 **Allen Del Valle**. All Rights Reserved.  
This software is provided for personal academic use only. Unauthorized copying, cloning, redistribution, or modification of the source code, stylesheets, or calculation engines is strictly prohibited. See [LICENSE](LICENSE) for details.

