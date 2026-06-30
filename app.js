// Bicol University GWA Calculator & Academic Evaluator JavaScript Core

/* ==========================================================================
   SECTION 1: CONSTANTS
   ========================================================================== */

const VALID_GRADES = [
    { val: "1.00", label: "1.00 — Outstanding (99-100%)" },
    { val: "1.25", label: "1.25 — (96-98%)" },
    { val: "1.50", label: "1.50 — Superior (93-95%)" },
    { val: "1.75", label: "1.75 — (91-92%)" },
    { val: "2.00", label: "2.00 — Very Satisfactory (89-90%)" },
    { val: "2.25", label: "2.25 — (87-88%)" },
    { val: "2.50", label: "2.50 — (84-86%)" },
    { val: "2.75", label: "2.75 — Satisfactory (82-83%)" },
    { val: "3.00", label: "3.00 — Passing (75-81%)" },
    { val: "5.00", label: "5.00 — Failure (Below 75%)" },
    { val: "INC", label: "INC — Incomplete (Excluded)" },
    { val: "DRP", label: "DRP — Dropped (Excluded)" }
];

const HONOR_THRESHOLDS = {
    SUMMA: { maxGWA: 1.2500, label: "Summa Cum Laude" },
    MAGNA: { maxGWA: 1.4500, label: "Magna Cum Laude" },
    CUM:   { maxGWA: 1.7500, label: "Cum Laude" }
};

const SCHOLARSHIP_PRESETS = {
    dost:        { name: "DOST-SEI Merit",      maxGWA: 2.50, lowestGrade: 3.0, noInc: true,  noFail: true  },
    ched_full:   { name: "CHED Full Merit",      maxGWA: 1.75, lowestGrade: 2.5, noInc: true,  noFail: true  },
    ched_half:   { name: "CHED Half Merit",      maxGWA: 2.50, lowestGrade: 3.0, noInc: true,  noFail: true  },
    tes:         { name: "TES (Tertiary Ed)",    maxGWA: 3.00, lowestGrade: 3.0, noInc: false, noFail: false },
    bu_athletic: { name: "BU Athletic Scholar",  maxGWA: 3.00, lowestGrade: 3.0, noInc: true,  noFail: true  }
};

const COLLEGE_PRESETS = {
    BUCS: [
        { title: "1st Year - 1st Semester", underload: false, subjects: [
            { code: "GEC 11", name: "Understanding the Self", grade: "1.25", units: 3 },
            { code: "GEC 12", name: "Readings in Philippine History", grade: "1.50", units: 3 },
            { code: "CS 111", name: "Introduction to Computing", grade: "1.25", units: 3 },
            { code: "CS 112", name: "Computer Programming 1", grade: "1.50", units: 3 },
            { code: "MATH 111", name: "Calculus 1", grade: "1.75", units: 4 },
            { code: "NSTP 1", name: "National Service Training Program 1", grade: "1.25", units: 3 }
        ]},
        { title: "1st Year - 2nd Semester", underload: false, subjects: [
            { code: "GEC 13", name: "The Contemporary World", grade: "1.50", units: 3 },
            { code: "GEC 14", name: "Mathematics in the Modern World", grade: "1.25", units: 3 },
            { code: "CS 121", name: "Computer Programming 2", grade: "1.50", units: 3 },
            { code: "CS 122", name: "Discrete Structures", grade: "1.75", units: 3 },
            { code: "NSTP 2", name: "National Service Training Program 2", grade: "1.25", units: 3 }
        ]}
    ],
    BUCENG: [
        { title: "1st Year - 1st Semester", underload: false, subjects: [
            { code: "MATH 101", name: "Calculus for Engineers 1", grade: "1.75", units: 4 },
            { code: "CHEM 101", name: "Chemistry for Engineers", grade: "1.50", units: 4 },
            { code: "ENG 101", name: "Engineering Graphics", grade: "1.50", units: 3 },
            { code: "GEC 11", name: "Understanding the Self", grade: "1.25", units: 3 },
            { code: "NSTP 1", name: "CWTS / ROTC 1", grade: "1.25", units: 3 }
        ]}
    ],
    BUCBEM: [
        { title: "1st Year - 1st Semester", underload: false, subjects: [
            { code: "BM 101", name: "Principles of Management", grade: "1.50", units: 3 },
            { code: "ECON 101", name: "Basic Microeconomics", grade: "1.25", units: 3 },
            { code: "ACT 101", name: "Financial Accounting 1", grade: "1.75", units: 3 },
            { code: "GEC 11", name: "Understanding the Self", grade: "1.25", units: 3 }
        ]}
    ],
    BUCE: [
        { title: "1st Year - 1st Semester", underload: false, subjects: [
            { code: "EDUC 101", name: "The Child and Adolescent Learners", grade: "1.25", units: 3 },
            { code: "EDUC 102", name: "The Teaching Profession", grade: "1.50", units: 3 },
            { code: "GEC 11", name: "Understanding the Self", grade: "1.25", units: 3 }
        ]}
    ],
    BUCN: [
        { title: "1st Year - 1st Semester", underload: false, subjects: [
            { code: "NURS 101", name: "Anatomy and Physiology", grade: "1.50", units: 5 },
            { code: "NURS 102", name: "Theoretical Foundations in Nursing", grade: "1.25", units: 3 },
            { code: "GEC 11", name: "Understanding the Self", grade: "1.25", units: 3 }
        ]}
    ],
    BUCIT: [
        { title: "1st Year - 1st Semester", underload: false, subjects: [
            { code: "IT 101", name: "Introduction to IT", grade: "1.25", units: 3 },
            { code: "IT 102", name: "Computer Hardware Fundamentals", grade: "1.50", units: 3 },
            { code: "GEC 11", name: "Understanding the Self", grade: "1.25", units: 3 }
        ]}
    ]
};

/* ==========================================================================
   SECTION 2: STATE
   ========================================================================== */

let semesters = [];
const STORAGE_KEY = "bu_gwa_semesters";
const THEME_KEY = "bu_gwa_theme";

function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(semesters));
    updateGlobalSummary();
}

function loadSavedData() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        try {
            semesters = JSON.parse(saved);
        } catch (e) {
            semesters = [];
        }
    }
    
    if (!semesters || !Array.isArray(semesters) || semesters.length === 0) {
        loadCollegePreset('BUCS', false);
    } else {
        renderSemesters();
        updateGlobalSummary();
    }
}

/* ==========================================================================
   SECTION 3: INITIALIZATION
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initTabs();
    initSimulator();
    initScholarshipMonitor();
    loadSavedData();
});

/* ==========================================================================
   SECTION 4: THEME MANAGEMENT
   ========================================================================== */

function initTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY);
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    const activeTheme = savedTheme ? savedTheme : (prefersDark ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", activeTheme);
    updateThemeIcon(activeTheme);

    const toggleBtn = document.getElementById("btn-theme-toggle");
    if (toggleBtn) {
        toggleBtn.addEventListener("click", toggleTheme);
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const icon = document.querySelector("#btn-theme-toggle i");
    if (icon) {
        if (theme === "dark") {
            icon.className = "fa-solid fa-sun";
            icon.style.color = "#fbbf24";
        } else {
            icon.className = "fa-solid fa-moon";
            icon.style.color = "#ffffff";
        }
    }
}

/* ==========================================================================
   SECTION 5: TAB CONTROLLER
   ========================================================================== */

function initTabs() {
    const tabs = document.querySelectorAll(".nav-tab");
    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            tabs.forEach(t => t.classList.remove("active"));
            document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
            
            tab.classList.add("active");
            const target = tab.getAttribute("data-tab");
            const targetElem = document.getElementById(target);
            if (targetElem) targetElem.classList.add("active");

            if (target === "tab-simulator") updateSimulator();
            if (target === "tab-scholarship") evaluateScholarship();
        });
    });
}

/* ==========================================================================
   SECTION 6: MATH ENGINE
   ========================================================================== */

function calculateSemesterGWA(sem) {
    let totalGradePoints = 0;
    let totalUnits = 0;

    if (!sem || !sem.subjects) return 0;

    sem.subjects.forEach(sub => {
        const numGrade = parseFloat(sub.grade);
        const units = parseFloat(sub.units) || 0;
        if (!isNaN(numGrade) && units > 0) {
            totalGradePoints += numGrade * units;
            totalUnits += units;
        }
    });

    return totalUnits > 0 ? (totalGradePoints / totalUnits) : 0;
}

function calculateSemesterUnits(sem) {
    if (!sem || !sem.subjects) return 0;
    return sem.subjects.reduce((sum, sub) => sum + (parseFloat(sub.units) || 0), 0);
}

function calculateCumulativeStats() {
    let totalPoints = 0;
    let totalUnits = 0;
    let totalCourses = 0;
    let hasUnderload = false;
    let hasFailingGrade = false;
    let hasInc = false;
    let failingCount = 0;

    semesters.forEach(sem => {
        if (sem.underload) hasUnderload = true;

        if (sem.subjects) {
            sem.subjects.forEach(sub => {
                totalCourses++;
                const numGrade = parseFloat(sub.grade);
                const units = parseFloat(sub.units) || 0;

                if (sub.grade === "5.00") {
                    hasFailingGrade = true;
                    failingCount++;
                }
                if (sub.grade === "INC") {
                    hasInc = true;
                }

                if (!isNaN(numGrade) && units > 0) {
                    totalPoints += numGrade * units;
                    totalUnits += units;
                }
            });
        }
    });

    const cumulativeGWA = totalUnits > 0 ? (totalPoints / totalUnits) : 0;

    return {
        totalPoints,
        totalUnits,
        totalCourses,
        hasUnderload,
        hasFailingGrade,
        hasInc,
        failingCount,
        cumulativeGWA
    };
}

/* ==========================================================================
   SECTION 7: EVALUATORS & DASHBOARD UPDATER
   ========================================================================== */

function updateGlobalSummary() {
    const stats = calculateCumulativeStats();

    const gwaElem = document.getElementById("overall-gwa");
    const unitsElem = document.getElementById("total-units");
    const unitsSubtextElem = document.getElementById("units-subtext");

    if (gwaElem) gwaElem.innerText = stats.cumulativeGWA.toFixed(4);
    if (unitsElem) unitsElem.innerText = stats.totalUnits.toFixed(1);
    if (unitsSubtextElem) unitsSubtextElem.innerText = `${stats.totalCourses} Courses Recorded`;

    evaluateHonorStanding(stats);
    evaluateAcademicStanding(stats);
}

function evaluateHonorStanding(stats) {
    const honorElem = document.getElementById("honor-status");
    const honorSubtext = document.getElementById("honor-subtext");

    if (!honorElem || !honorSubtext) return;

    if (stats.totalUnits === 0) {
        honorElem.innerText = "No Courses Added";
        honorElem.className = "summary-value honor-badge text-muted";
        honorSubtext.innerText = "Add subjects to evaluate honor status";
    } else if (stats.hasFailingGrade || stats.hasInc) {
        honorElem.innerText = "Not Eligible";
        honorElem.className = "summary-value honor-badge text-danger";
        honorSubtext.innerText = "Disqualified: Has failing grade (5.0) or unresolved INC";
    } else if (stats.hasUnderload) {
        honorElem.innerText = "Not Eligible";
        honorElem.className = "summary-value honor-badge text-danger";
        honorSubtext.innerText = "Disqualified: Student carried underloaded term(s)";
    } else if (stats.cumulativeGWA > 0 && stats.cumulativeGWA <= 1.2500) {
        honorElem.innerText = "Summa Cum Laude";
        honorElem.className = "summary-value honor-badge text-gold";
        honorSubtext.innerText = "Complies with GWA ≤ 1.2500 & Full Load";
    } else if (stats.cumulativeGWA > 1.2500 && stats.cumulativeGWA <= 1.4500) {
        honorElem.innerText = "Magna Cum Laude";
        honorElem.className = "summary-value honor-badge text-gold";
        honorSubtext.innerText = "Complies with 1.2500 < GWA ≤ 1.4500";
    } else if (stats.cumulativeGWA > 1.4500 && stats.cumulativeGWA <= 1.7500) {
        honorElem.innerText = "Cum Laude";
        honorElem.className = "summary-value honor-badge text-gold";
        honorSubtext.innerText = "Complies with 1.4500 < GWA ≤ 1.7500";
    } else {
        honorElem.innerText = "Regular Candidate";
        honorElem.className = "summary-value honor-badge text-primary";
        honorSubtext.innerText = "Does not meet honor threshold (GWA > 1.7500)";
    }
}

function evaluateAcademicStanding(stats) {
    const standingElem = document.getElementById("academic-standing");
    const standingSubtext = document.getElementById("standing-subtext");

    if (!standingElem || !standingSubtext) return;

    if (stats.failingCount === 0) {
        standingElem.innerText = "Good Standing";
        standingElem.className = "summary-value standing-badge text-success";
        standingSubtext.innerText = "0 Academic Deficiencies Detected";
    } else if (stats.failingCount === 1) {
        standingElem.innerText = "Academic Warning";
        standingElem.className = "summary-value standing-badge text-gold";
        standingSubtext.innerText = "1 Failure: Subject load reduced next term";
    } else if (stats.failingCount === 2) {
        standingElem.innerText = "Academic Probation";
        standingElem.className = "summary-value standing-badge text-danger";
        standingSubtext.innerText = "2 Failures: Placed on Probation (Max 75% load)";
    } else {
        standingElem.innerText = "Academic Dismissal Risk";
        standingElem.className = "summary-value standing-badge text-danger";
        standingSubtext.innerText = "3+ Failures: Dropped from rolls per handbook";
    }
}

/* ==========================================================================
   SECTION 8: RENDERER
   ========================================================================== */

function renderSemesters() {
    const container = document.getElementById("semesters-container");
    const emptyState = document.getElementById("empty-state");

    if (!container) return;

    container.innerHTML = "";

    if (!semesters || semesters.length === 0) {
        if (emptyState) emptyState.style.display = "block";
        return;
    }

    if (emptyState) emptyState.style.display = "none";

    semesters.forEach((sem, semIndex) => {
        const semCard = document.createElement("div");
        semCard.className = "semester-card";

        const semGWA = calculateSemesterGWA(sem);
        const semUnits = calculateSemesterUnits(sem);

        semCard.innerHTML = `
            <div class="sem-header">
                <div class="sem-title-group">
                    <input type="text" class="sem-title-select" value="${escapeHtml(sem.title)}" onchange="updateSemTitle(${semIndex}, this.value)" aria-label="Semester Title">
                    <span class="sem-gwa-pill">GPA: ${semGWA.toFixed(4)}</span>
                </div>
                <div class="sem-actions">
                    <label class="underload-toggle" title="Check if student carried less than regular load this semester (disqualifies from graduation honors per handbook)">
                        <input type="checkbox" ${sem.underload ? "checked" : ""} onchange="toggleUnderload(${semIndex}, this.checked)"> Underloaded Term
                    </label>
                    <button class="btn btn-danger btn-sm" onclick="removeSemester(${semIndex})" title="Remove Semester">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            </div>
            <div class="table-responsive">
                <table class="subject-table">
                    <thead>
                        <tr>
                            <th style="width: 22%;">Course Code (Optional)</th>
                            <th style="width: 43%;">Course Description</th>
                            <th style="width: 17%;">Grade Rating</th>
                            <th style="width: 10%;">Credit Units</th>
                            <th style="width: 8%; text-align: center;">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${sem.subjects ? sem.subjects.map((sub, subIndex) => `
                            <tr>
                                <td><input type="text" class="form-control-sm" value="${escapeHtml(sub.code)}" placeholder="e.g. CS 111 (Optional)" onchange="updateSubject(${semIndex}, ${subIndex}, 'code', this.value)" autocomplete="off" aria-label="Course Code (Optional)"></td>
                                <td><input type="text" class="form-control-sm" value="${escapeHtml(sub.name)}" placeholder="e.g. Computer Programming" onchange="updateSubject(${semIndex}, ${subIndex}, 'name', this.value)" aria-label="Course Description"></td>
                                <td><input type="number" class="form-control-sm" value="${sub.grade !== undefined && sub.grade !== null ? sub.grade : ''}" min="1.0" max="5.0" step="0.1" inputmode="decimal" placeholder="e.g. 1.5" onchange="updateSubject(${semIndex}, ${subIndex}, 'grade', this.value)" aria-label="Grade Rating"></td>
                                <td><input type="number" class="form-control-sm" value="${sub.units !== undefined && sub.units !== null ? sub.units : ''}" min="0" max="12" step="0.5" inputmode="decimal" placeholder="e.g. 3" onchange="updateSubject(${semIndex}, ${subIndex}, 'units', this.value)" aria-label="Credit Units"></td>
                                <td style="text-align: center;">
                                    <button class="btn btn-danger btn-sm" onclick="removeSubject(${semIndex}, ${subIndex})" title="Remove Subject"><i class="fa-solid fa-xmark"></i></button>
                                </td>
                            </tr>
                        `).join("") : ""}
                    </tbody>
                </table>
            </div>
            <div class="sem-footer">
                <button class="btn btn-secondary btn-sm" onclick="addSubject(${semIndex})">
                    <i class="fa-solid fa-plus"></i> Add Course Row
                </button>
                <span class="sem-total-units text-muted" style="font-size: 0.82rem;">Total Units: ${Math.round(semUnits)}</span>
            </div>
        `;
        container.appendChild(semCard);
    });
}

function generateGradeOptions(selectedGrade) {
    return VALID_GRADES.map(g => `<option value="${g.val}" ${g.val === selectedGrade ? "selected" : ""}>${g.label}</option>`).join("");
}

/* ==========================================================================
   SECTION 9: CRUD ACTIONS
   ========================================================================== */

function addNewSemester() {
    const semNumber = semesters.length + 1;
    const year = Math.ceil(semNumber / 2);
    const term = semNumber % 2 === 1 ? "1st Semester" : "2nd Semester";
    
    semesters.push({
        title: `Year ${year} - ${term}`,
        underload: false,
        subjects: [
            { code: "", name: "", grade: "", units: "" },
            { code: "", name: "", grade: "", units: "" },
            { code: "", name: "", grade: "", units: "" }
        ]
    });
    renderSemesters();
    saveData();
}

function removeSemester(index) {
    if (confirm("Are you sure you want to remove this semester and all its courses?")) {
        semesters.splice(index, 1);
        renderSemesters();
        saveData();
    }
}

function updateSemTitle(index, val) {
    if (semesters[index]) {
        semesters[index].title = val;
        saveData();
    }
}

function toggleUnderload(index, checked) {
    if (semesters[index]) {
        semesters[index].underload = checked;
        saveData();
    }
}

function addSubject(semIndex) {
    if (semesters[semIndex]) {
        if (!semesters[semIndex].subjects) semesters[semIndex].subjects = [];
        semesters[semIndex].subjects.push({ code: "", name: "", grade: "", units: "" });
        renderSemesters();
        saveData();
    }
}

function removeSubject(semIndex, subIndex) {
    if (semesters[semIndex] && semesters[semIndex].subjects) {
        semesters[semIndex].subjects.splice(subIndex, 1);
        renderSemesters();
        saveData();
    }
}

function updateSubject(semIndex, subIndex, field, val) {
    if (semesters[semIndex] && semesters[semIndex].subjects && semesters[semIndex].subjects[subIndex]) {
        semesters[semIndex].subjects[subIndex][field] = val;
        saveData();
        if (typeof updateSemesterUnitsDisplay === "function") {
            updateSemesterUnitsDisplay(semIndex);
        }
    }
}

function loadCollegePreset(presetKey, confirmUser = true) {
    if (confirmUser && semesters.length > 0 && !confirm("Loading a preset will replace your current entries. Continue?")) {
        return;
    }
    const preset = COLLEGE_PRESETS[presetKey];
    if (preset) {
        semesters = JSON.parse(JSON.stringify(preset));
        renderSemesters();
        saveData();
    }
}

function confirmResetAll() {
    if (confirm("Are you sure you want to clear all semesters and courses? This cannot be undone.")) {
        semesters = [];
        renderSemesters();
        saveData();
    }
}

/* ==========================================================================
   SECTION 10: WHAT-IF SIMULATOR
   ========================================================================== */

function initSimulator() {
    const slider = document.getElementById("sim-grade-slider");
    const futureUnits = document.getElementById("sim-future-units");

    if (slider) {
        slider.addEventListener("input", () => {
            const valElem = document.getElementById("sim-slider-val");
            if (valElem) valElem.innerText = parseFloat(slider.value).toFixed(2);
            updateSimulator();
        });
    }

    if (futureUnits) {
        futureUnits.addEventListener("input", updateSimulator);
    }
}

function updateSimulator() {
    const stats = calculateCumulativeStats();

    const curGwaElem = document.getElementById("sim-current-gwa");
    const curUnitsElem = document.getElementById("sim-current-units");
    
    if (curGwaElem) curGwaElem.value = stats.cumulativeGWA.toFixed(4);
    if (curUnitsElem) curUnitsElem.value = stats.totalUnits.toFixed(1);

    const futureUnitsVal = parseFloat(document.getElementById("sim-future-units")?.value) || 0;
    const futureGradeVal = parseFloat(document.getElementById("sim-grade-slider")?.value) || 1.50;

    const projectedPoints = stats.totalPoints + (futureUnitsVal * futureGradeVal);
    const projectedTotalUnits = stats.totalUnits + futureUnitsVal;
    const projectedGWA = projectedTotalUnits > 0 ? (projectedPoints / projectedTotalUnits) : 0;

    const resElem = document.getElementById("proj-gwa-result");
    if (resElem) resElem.innerText = projectedGWA.toFixed(4);

    const projHonor = document.getElementById("proj-honor-result");
    if (projHonor) {
        if (projectedTotalUnits === 0) {
            projHonor.innerText = "Add future units to simulate";
        } else if (projectedGWA <= 1.2500) {
            projHonor.innerText = "Projected: Summa Cum Laude";
        } else if (projectedGWA <= 1.4500) {
            projHonor.innerText = "Projected: Magna Cum Laude";
        } else if (projectedGWA <= 1.7500) {
            projHonor.innerText = "Projected: Cum Laude";
        } else {
            projHonor.innerText = "Projected: Regular Graduate";
        }
    }
}

function calculateTargetRequired(targetGWA) {
    const stats = calculateCumulativeStats();
    const futureUnitsVal = parseFloat(document.getElementById("sim-future-units")?.value) || 0;
    const outputElem = document.getElementById("target-result-output");

    if (!outputElem) return;

    if (futureUnitsVal <= 0) {
        outputElem.innerHTML = "<i class='fa-solid fa-triangle-exclamation text-gold'></i> Please specify remaining future units above to calculate.";
        return;
    }

    const requiredTotalPoints = targetGWA * (stats.totalUnits + futureUnitsVal);
    const neededFuturePoints = requiredTotalPoints - stats.totalPoints;
    const requiredAverageGrade = neededFuturePoints / futureUnitsVal;

    if (requiredAverageGrade < 1.00) {
        outputElem.innerHTML = `<i class='fa-solid fa-circle-check text-success'></i> <strong>Goal Achieved!</strong> You already qualify even with grades lower than 1.00 (Math required average: ${requiredAverageGrade.toFixed(2)}).`;
    } else if (requiredAverageGrade > 3.00) {
        outputElem.innerHTML = `<i class='fa-solid fa-circle-xmark text-danger'></i> <strong>Mathematically Unattainable.</strong> You would need an average grade of ${requiredAverageGrade.toFixed(2)} across remaining units.`;
    } else {
        outputElem.innerHTML = `<i class='fa-solid fa-bullseye text-primary'></i> To achieve cumulative GWA ≤ ${targetGWA.toFixed(2)}, you must average at least <strong>${requiredAverageGrade.toFixed(4)}</strong> across your remaining ${futureUnitsVal} units.`;
    }
}

/* ==========================================================================
   SECTION 11: SCHOLARSHIP MONITOR
   ========================================================================== */

function initScholarshipMonitor() {
    ["sch-max-gwa", "sch-lowest-grade", "sch-no-inc", "sch-no-fail"].forEach(id => {
        const elem = document.getElementById(id);
        if (elem) elem.addEventListener("change", evaluateScholarship);
    });
}

function applyScholarshipPreset() {
    const presetKey = document.getElementById("scholarship-preset")?.value;
    const preset = SCHOLARSHIP_PRESETS[presetKey];

    if (preset) {
        const maxGwa = document.getElementById("sch-max-gwa");
        const lowest = document.getElementById("sch-lowest-grade");
        const noInc = document.getElementById("sch-no-inc");
        const noFail = document.getElementById("sch-no-fail");

        if (maxGwa) maxGwa.value = preset.maxGWA.toFixed(2);
        if (lowest) lowest.value = preset.lowestGrade.toFixed(1);
        if (noInc) noInc.checked = preset.noInc;
        if (noFail) noFail.checked = preset.noFail;

        evaluateScholarship();
    }
}

function evaluateScholarship() {
    const maxGWAAllowed = parseFloat(document.getElementById("sch-max-gwa")?.value) || 3.0;
    const lowestGradeAllowed = parseFloat(document.getElementById("sch-lowest-grade")?.value) || 3.0;
    const disallowInc = document.getElementById("sch-no-inc")?.checked;
    const disallowFail = document.getElementById("sch-no-fail")?.checked;

    const stats = calculateCumulativeStats();

    let exceededLowestGrade = false;

    semesters.forEach(sem => {
        if (sem.subjects) {
            sem.subjects.forEach(sub => {
                const numGrade = parseFloat(sub.grade);
                if (!isNaN(numGrade) && numGrade > lowestGradeAllowed) {
                    exceededLowestGrade = true;
                }
            });
        }
    });

    const chkGwa = document.getElementById("chk-gwa");
    const chkGrade = document.getElementById("chk-grade");
    const chkInc = document.getElementById("chk-inc");
    const chkFail = document.getElementById("chk-fail");

    let isCompliant = true;

    if (chkGwa) {
        if (stats.cumulativeGWA <= maxGWAAllowed && stats.totalUnits > 0) {
            chkGwa.innerHTML = `<i class="fa-solid fa-check text-success"></i> GWA Check Passed (${stats.cumulativeGWA.toFixed(4)} ≤ ${maxGWAAllowed.toFixed(2)})`;
        } else {
            chkGwa.innerHTML = `<i class="fa-solid fa-xmark text-danger"></i> GWA Check Failed (${stats.cumulativeGWA.toFixed(4)} > ${maxGWAAllowed.toFixed(2)})`;
            if (stats.totalUnits > 0) isCompliant = false;
        }
    }

    if (chkGrade) {
        if (!exceededLowestGrade) {
            chkGrade.innerHTML = `<i class="fa-solid fa-check text-success"></i> Individual Grade Cap Passed (All ≤ ${lowestGradeAllowed.toFixed(1)})`;
        } else {
            chkGrade.innerHTML = `<i class="fa-solid fa-xmark text-danger"></i> Grade Cap Exceeded (Some grades > ${lowestGradeAllowed.toFixed(1)})`;
            isCompliant = false;
        }
    }

    if (chkInc) {
        if (!disallowInc || !stats.hasInc) {
            chkInc.innerHTML = `<i class="fa-solid fa-check text-success"></i> Incomplete (INC) Check Passed`;
        } else {
            chkInc.innerHTML = `<i class="fa-solid fa-xmark text-danger"></i> Disqualified: Unresolved INC Grade Found`;
            isCompliant = false;
        }
    }

    if (chkFail) {
        if (!disallowFail || !stats.hasFailingGrade) {
            chkFail.innerHTML = `<i class="fa-solid fa-check text-success"></i> No Failing Mark Check Passed`;
        } else {
            chkFail.innerHTML = `<i class="fa-solid fa-xmark text-danger"></i> Disqualified: Failing Mark (5.0) Found`;
            isCompliant = false;
        }
    }

    const titleElem = document.getElementById("sch-status-title");
    const descElem = document.getElementById("sch-status-desc");
    const iconElem = document.getElementById("sch-icon");
    const containerElem = document.getElementById("sch-status-container");

    if (containerElem && iconElem && titleElem && descElem) {
        if (isCompliant && stats.totalUnits > 0) {
            containerElem.style.background = "#ecfdf5";
            containerElem.style.borderColor = "#a7f3d0";
            iconElem.innerHTML = `<i class="fa-solid fa-circle-check text-success"></i>`;
            titleElem.innerText = "Eligible & Compliant";
            descElem.innerText = `Your current performance meets all specified retention criteria.`;
        } else if (stats.totalUnits === 0) {
            containerElem.style.background = "#f8fafc";
            containerElem.style.borderColor = "#cbd5e1";
            iconElem.innerHTML = `<i class="fa-solid fa-circle-info text-gold"></i>`;
            titleElem.innerText = "Awaiting Data";
            descElem.innerText = "Add your subject grades in the Calculator tab to evaluate compliance.";
        } else {
            containerElem.style.background = "#fef2f2";
            containerElem.style.borderColor = "#fecaca";
            iconElem.innerHTML = `<i class="fa-solid fa-triangle-exclamation text-danger"></i>`;
            titleElem.innerText = "Retention Risk Warning";
            descElem.innerText = `One or more scholarship criteria are currently unmet. Review the checklist below.`;
        }
    }
}

/* ==========================================================================
   SECTION 12: IMPORT / EXPORT & PRINT
   ========================================================================== */

function exportAcademicSummary() {
    window.print();
}

function exportToJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(semesters, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "bu_gwa_backup.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}

function importFromJSON() {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".json";
    
    fileInput.onchange = e => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = event => {
            try {
                const imported = JSON.parse(event.target.result);
                if (Array.isArray(imported)) {
                    if (confirm("Importing JSON will replace your current entries. Continue?")) {
                        semesters = imported;
                        renderSemesters();
                        saveData();
                        alert("Data imported successfully!");
                    }
                } else {
                    alert("Invalid JSON file format.");
                }
            } catch (err) {
                alert("Error reading JSON file.");
            }
        };
        reader.readAsText(file);
    };

    fileInput.click();
}

function openBulkPasteModal() {
    const modal = document.getElementById("bulk-paste-modal");
    if (modal) modal.style.display = "flex";
}

function closeBulkPasteModal() {
    const modal = document.getElementById("bulk-paste-modal");
    if (modal) modal.style.display = "none";
}

function processBulkPaste() {
    const textElem = document.getElementById("bulk-paste-textarea");
    if (!textElem) return;

    const rawText = textElem.value.trim();
    if (!rawText) {
        closeBulkPasteModal();
        return;
    }

    const lines = rawText.split("\n");
    const newSubjects = [];

    lines.forEach(line => {
        const trimmed = line.trim();
        if (!trimmed) return;

        let code = "", name = "", units = 3;

        if (trimmed.includes("-")) {
            const parts = trimmed.split("-");
            code = parts[0] ? parts[0].trim() : "";
            name = parts[1] ? parts[1].trim() : "";
            if (parts[2]) units = parseFloat(parts[2].trim()) || 3;
        } else if (trimmed.includes("\t")) {
            const parts = trimmed.split("\t");
            code = parts[0] ? parts[0].trim() : "";
            name = parts[1] ? parts[1].trim() : "";
            if (parts[2]) units = parseFloat(parts[2].trim()) || 3;
        } else if (trimmed.includes(",")) {
            const parts = trimmed.split(",");
            code = parts[0] ? parts[0].trim() : "";
            name = parts[1] ? parts[1].trim() : "";
            if (parts[2]) units = parseFloat(parts[2].trim()) || 3;
        } else {
            code = trimmed;
            name = "Imported Course";
        }

        newSubjects.push({ code, name, grade: "1.50", units });
    });

    if (newSubjects.length > 0) {
        semesters.push({
            title: `Bulk Imported (${newSubjects.length} Courses)`,
            underload: false,
            subjects: newSubjects
        });
        renderSemesters();
        saveData();
    }

    textElem.value = "";
    closeBulkPasteModal();
}

/* ==========================================================================
   SECTION 13: UTILITIES
   ========================================================================== */

function escapeHtml(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
