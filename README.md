<p align="center">
  <img src="assets/logo.png" alt="BU GWA Calculator Logo" width="120" />
</p>

# 🎓 BU GWA Calculator & Academic Evaluator

An unofficial, modern web application designed for Bicol University students to compute General Weighted Average (GWA), monitor semester GPAs, evaluate honor qualification standings, simulate future academic performance, and track scholarship retention per official BU Student Handbook guidelines.

<p align="center">
  <img src="https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5" />
  <img src="https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3" />
  <img src="https://img.shields.io/badge/javascript-%23F7DF1E.svg?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" />
  <img src="https://img.shields.io/badge/font%20awesome-%23528DD7.svg?style=for-the-badge&logo=fontawesome&logoColor=white" alt="FontAwesome" />
  <img src="https://img.shields.io/badge/pdf.js-%23FF0000.svg?style=for-the-badge&logo=adobeacrobatreader&logoColor=white" alt="PDF.js" />
</p>

👉 **Live Repository**: [https://github.com/tsugumii21/bu-gwa-calculator-evaluator](https://github.com/tsugumii21/bu-gwa-calculator-evaluator)

---

> [!IMPORTANT]
> **Official Academic Disclaimer**: This application is an independent, open-source student utility built for self-monitoring and simulation. It is **not** officially affiliated with or endorsed by Bicol University administration. For official academic transcripts, Dean's Lister certificates, and graduation honors verification, please consult the Bicol University Office of the Registrar and respective College Deans.

---

## ✨ Features

- 🧮 **4-Decimal Precision Engine**: Computes real-time cumulative and semester GWAs using exact weighted grade point math rounded to 4 decimal places, excluding incomplete (`INC`) and dropped (`DRP`) grades.
- 📄 **Digital COR PDF Scanner**: In-browser client-side extraction of course codes, descriptions, and credit units directly from official BU Certificate of Registration (COR) PDF documents using `PDF.js`.
- 🏆 **Per-Semester Honor Evaluation Radar**: Evaluates President's Lister (1.00 - 1.45) and Dean's Lister (1.46 - 1.75) eligibility per semester upon pressing 'Compute GPA', displaying 1 of 140 unique motivational achievement quotes.
- 👑 **Latin Graduation Honors Proximity Radar**: Computes *Summa Cum Laude* (≤ 1.2500), *Magna Cum Laude* (≤ 1.4500), and *Cum Laude* (≤ 1.7500) candidacy while providing exact point proximity gaps to target honors.
- 🧪 **"What-If" Scenario Simulator**: Simulate future grade outcomes across remaining units and reverse-calculate exact required averages for target graduation honors.
- 🎓 **Scholarship Retention Monitor**: Check retention compliance against built-in presets for **DOST-SEI**, **CHED Merit**, **TES**, and **BU Athletic** scholarships.
- 📋 **Smart Bulk Paste Importer**: Multi-format schedule text parser supporting course codes, descriptions, units, and grades with a 1-click sample data magic loader.
- 🎭 **Animated Deletion & Modals**: Glassmorphism visual design with Animate.css warning shakes and smooth card exit transitions upon item removal.
- 📱 **Interactive Pill Sub-Tabs System**: Organized sub-navigation dividing Overview, Handbook Grading Scales, and Academic Honor Criteria.
- 🌙 **Persistent Dark / Light Theme**: Dynamic theme switcher tailored for comfortable late-night study sessions with automatic local preference saving.

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
- Email: [allendelvalle04@gmail.com](mailto:allendelvalle04@gmail.com)

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
