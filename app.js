// Bicol University GWA Calculator & Academic Evaluator JavaScript Core

// Global State
let semesters = [];

// College Curriculum Presets
const COLLEGE_PRESETS = {
    BUCS: [
        { title: "1st Year - 1st Semester", subjects: [
            { code: "GEC 11", name: "Understanding the Self", grade: "1.25", units: 3 },
            { code: "GEC 12", name: "Readings in Philippine History", grade: "1.50", units: 3 },
            { code: "CS 111", name: "Introduction to Computing", grade: "1.25", units: 3 },
            { code: "CS 112", name: "Computer Programming 1", grade: "1.50", units: 3 },
            { code: "MATH 111", name: "Calculus 1", grade: "1.75", units: 4 },
            { code: "NSTP 1", name: "National Service Training Program 1", grade: "1.25", units: 3 }
        ]},
        { title: "1st Year - 2nd Semester", subjects: [
            { code: "GEC 13", name: "The Contemporary World", grade: "1.50", units: 3 },
            { code: "GEC 14", name: "Mathematics in the Modern World", grade: "1.25", units: 3 },
            { code: "CS 121", name: "Computer Programming 2", grade: "1.50", units: 3 },
            { code: "CS 122", name: "Discrete Structures", grade: "1.75", units: 3 },
            { code: "NSTP 2", name: "National Service Training Program 2", grade: "1.25", units: 3 }
        ]}
    ],
    BUCENG: [
        { title: "1st Year - 1st Semester", subjects: [
            { code: "MATH 101", name: "Calculus for Engineers 1", grade: "1.75", units: 4 },
            { code: "CHEM 101", name: "Chemistry for Engineers", grade: "1.50", units: 4 },
            { code: "ENG 101", name: "Engineering Graphics", grade: "1.50", units: 3 },
            { code: "GEC 11", name: "Understanding the Self", grade: "1.25", units: 3 },
            { code: "NSTP 1", name: "CWTS / ROTC 1", grade: "1.25", units: 3 }
        ]}
    ],
    BUCBEM: [
        { title: "1st Year - 1st Semester", subjects: [
            { code: "BM 101", name: "Principles of Management", grade: "1.50", units: 3 },
            { code: "ECON 101", name: "Basic Microeconomics", grade: "1.25", units: 3 },
            { code: "ACT 101", name: "Financial Accounting 1", grade: "1.75", units: 3 },
            { code: "GEC 11", name: "Understanding the Self", grade: "1.25", units: 3 }
        ]}
    ],
    BUCE: [
        { title: "1st Year - 1st Semester", subjects: [
            { code: "EDUC 101", name: "The Child and Adolescent Learners", grade: "1.25", units: 3 },
            { code: "EDUC 102", name: "The Teaching Profession", grade: "1.50", units: 3 },
            { code: "GEC 11", name: "Understanding the Self", grade: "1.25", units: 3 }
        ]}
    ],
    BUCN: [
        { title: "1st Year - 1st Semester", subjects: [
            { code: "NURS 101", name: "Anatomy and Physiology", grade: "1.50", units: 5 },
            { code: "NURS 102", name: "Theoretical Foundations in Nursing", grade: "1.25", units: 3 },
            { code: "GEC 11", name: "Understanding the Self", grade: "1.25", units: 3 }
        ]}
    ],
    BUCIT: [
        { title: "1st Year - 1st Semester", subjects: [
            { code: "IT 101", name: "Introduction to IT", grade: "1.25", units: 3 },
            { code: "IT 102", name: "Computer Hardware Fundamentals", grade: "1.50", units: 3 },
            { code: "GEC 11", name: "Understanding the Self", grade: "1.25", units: 3 }
        ]}
    ]
};

// Initialize App
document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initTabs();
    initSimulator();
    initScholarshipMonitor();
    loadSavedData();
});

// Theme Management (Light / Dark Mode)
function initTheme() {
    const savedTheme = localStorage.getItem("bu_gwa_theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
        document.documentElement.setAttribute("data-theme", "dark");
        updateThemeIcon("dark");
    } else {
        document.documentElement.setAttribute("data-theme", "light");
        updateThemeIcon("light");
    }

    const toggleBtn = document.getElementById("btn-theme-toggle");
    if (toggleBtn) {
        toggleBtn.addEventListener("click", toggleTheme);
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("bu_gwa_theme", newTheme);
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

// Tab Navigation
function initTabs() {
    const tabs = document.querySelectorAll(".nav-tab");
    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            tabs.forEach(t => t.classList.remove("active"));
            document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
            
            tab.classList.add("active");
            const target = tab.getAttribute("data-tab");
            document.getElementById(target).classList.add("active");

            // Refresh simulations when switching tabs
            if (target === "tab-simulator") updateSimulator();
            if (target === "tab-scholarship") evaluateScholarship();
        });
    });
}

// Load Saved Data or Initial Defaults
function loadSavedData() {
    const saved = localStorage.getItem("bu_gwa_semesters");
    if (saved) {
        try {
            semesters = JSON.parse(saved);
        } catch (e) {
            semesters = [];
        }
    }
    
    if (!semesters || semesters.length === 0) {
        loadCollegePreset('BUCS');
    } else {
        renderSemesters();
        updateGlobalSummary();
    }
}

function saveData() {
    localStorage.setItem("bu_gwa_semesters", JSON.stringify(semesters));
    updateGlobalSummary();
}

// Render Semester Cards
function renderSemesters() {
    const container = document.getElementById("semesters-container");
    container.innerHTML = "";

    semesters.forEach((sem, semIndex) => {
        const semCard = document.createElement("div");
        semCard.className = "semester-card";

        const semGWA = calculateSemesterGWA(sem);

        semCard.innerHTML = `
            <div class="sem-header">
                <div class="sem-title-group">
                    <input type="text" class="sem-title-select" value="${escapeHtml(sem.title)}" onchange="updateSemTitle(${semIndex}, this.value)">
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
                            <th style="width: 20%;">Course Code</th>
                            <th style="width: 45%;">Course Description</th>
                            <th style="width: 15%;">Grade Rating</th>
                            <th style="width: 12%;">Credit Units</th>
                            <th style="width: 8%; text-align: center;">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${sem.subjects.map((sub, subIndex) => `
                            <tr>
                                <td><input type="text" class="form-control-sm" value="${escapeHtml(sub.code)}" placeholder="e.g. CS 111" onchange="updateSubject(${semIndex}, ${subIndex}, 'code', this.value)"></td>
                                <td><input type="text" class="form-control-sm" value="${escapeHtml(sub.name)}" placeholder="e.g. Computer Programming" onchange="updateSubject(${semIndex}, ${subIndex}, 'name', this.value)"></td>
                                <td>
                                    <select class="form-control-sm" onchange="updateSubject(${semIndex}, ${subIndex}, 'grade', this.value)">
                                        ${generateGradeOptions(sub.grade)}
                                    </select>
                                </td>
                                <td><input type="number" class="form-control-sm" value="${sub.units}" min="0" max="12" step="0.5" onchange="updateSubject(${semIndex}, ${subIndex}, 'units', parseFloat(this.value) || 0)"></td>
                                <td style="text-align: center;">
                                    <button class="btn btn-danger btn-sm" onclick="removeSubject(${semIndex}, ${subIndex})"><i class="fa-solid fa-xmark"></i></button>
                                </td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>
            <div class="sem-footer">
                <button class="btn btn-secondary btn-sm" onclick="addSubject(${semIndex})">
                    <i class="fa-solid fa-plus"></i> Add Course Row
                </button>
                <span class="text-muted" style="font-size: 0.82rem;">Total Units: ${calculateSemesterUnits(sem).toFixed(1)}</span>
            </div>
        `;
        container.appendChild(semCard);
    });
}

function generateGradeOptions(selectedGrade) {
    const validGrades = [
        { val: "1.00", label: "1.00 (99-100% Outstanding)" },
        { val: "1.10", label: "1.10 (98%)" },
        { val: "1.20", label: "1.20 (97%)" },
        { val: "1.30", label: "1.30 (96%)" },
        { val: "1.40", label: "1.40 (95%)" },
        { val: "1.50", label: "1.50 (94% Superior)" },
        { val: "1.60", label: "1.60 (93%)" },
        { val: "1.70", label: "1.70 (92%)" },
        { val: "1.80", label: "1.80 (91% Very Satisfactory)" },
        { val: "1.90", label: "1.90 (90%)" },
        { val: "2.00", label: "2.00 (89%)" },
        { val: "2.10", label: "2.10 (88%)" },
        { val: "2.20", label: "2.20 (87%)" },
        { val: "2.30", label: "2.30 (86%)" },
        { val: "2.40", label: "2.40 (85%)" },
        { val: "2.50", label: "2.50 (84%)" },
        { val: "2.60", label: "2.60 (82-83% Satisfactory)" },
        { val: "2.70", label: "2.70 (80-81%)" },
        { val: "2.80", label: "2.80 (78-79%)" },
        { val: "2.90", label: "2.90 (76-77% Fair)" },
        { val: "3.00", label: "3.00 (75% Passing)" },
        { val: "5.00", label: "5.00 (Failure)" },
        { val: "INC", label: "INC (Incomplete - Excluded)" },
        { val: "DRP", label: "DRP (Dropped - Excluded)" }
    ];

    return validGrades.map(g => `<option value="${g.val}" ${g.val === selectedGrade ? "selected" : ""}>${g.label}</option>`).join("");
}

// Semester Management Actions
function addNewSemester() {
    const semNumber = semesters.length + 1;
    let year = Math.ceil(semNumber / 2);
    let term = semNumber % 2 === 1 ? "1st Semester" : "2nd Semester";
    
    semesters.push({
        title: `Year ${year} - ${term}`,
        underload: false,
        subjects: [
            { code: "", name: "", grade: "1.50", units: 3 },
            { code: "", name: "", grade: "1.50", units: 3 },
            { code: "", name: "", grade: "1.50", units: 3 }
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
    semesters[index].title = val;
    saveData();
}

function toggleUnderload(index, checked) {
    semesters[index].underload = checked;
    saveData();
}

function addSubject(semIndex) {
    semesters[semIndex].subjects.push({ code: "", name: "", grade: "1.50", units: 3 });
    renderSemesters();
    saveData();
}

function removeSubject(semIndex, subIndex) {
    semesters[semIndex].subjects.splice(subIndex, 1);
    renderSemesters();
    saveData();
}

function updateSubject(semIndex, subIndex, field, val) {
    semesters[semIndex].subjects[subIndex][field] = val;
    saveData();
    // Update live GPA pill without full re-render
    renderSemesters();
}

function loadCollegePreset(presetKey) {
    if (semesters.length > 0 && !confirm("Loading a preset will replace your current entries. Continue?")) {
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

// Math Computation Engine
function calculateSemesterGWA(sem) {
    let totalGradePoints = 0;
    let totalUnits = 0;

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
    return sem.subjects.reduce((sum, sub) => sum + (parseFloat(sub.units) || 0), 0);
}

function updateGlobalSummary() {
    let totalPoints = 0;
    let totalUnits = 0;
    let totalCourses = 0;
    let hasUnderload = false;
    let hasFailingGrade = false;
    let hasInc = false;
    let failingCount = 0;

    semesters.forEach(sem => {
        if (sem.underload) hasUnderload = true;

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
    });

    const cumulativeGWA = totalUnits > 0 ? (totalPoints / totalUnits) : 0;

    // Update UI Elements
    document.getElementById("overall-gwa").innerText = cumulativeGWA.toFixed(4);
    document.getElementById("total-units").innerText = totalUnits.toFixed(1);
    document.getElementById("units-subtext").innerText = `${totalCourses} Courses Recorded`;

    // Honor Standing Evaluation
    const honorElem = document.getElementById("honor-status");
    const honorSubtext = document.getElementById("honor-subtext");

    if (totalUnits === 0) {
        honorElem.innerText = "No Courses Added";
        honorElem.className = "summary-value honor-badge text-muted";
        honorSubtext.innerText = "Add subjects to evaluate honor status";
    } else if (hasFailingGrade || hasInc) {
        honorElem.innerText = "Not Eligible";
        honorElem.className = "summary-value honor-badge text-danger";
        honorSubtext.innerText = "Disqualified: Has failing grade (5.0) or unresolved INC";
    } else if (hasUnderload) {
        honorElem.innerText = "Not Eligible";
        honorElem.className = "summary-value honor-badge text-danger";
        honorSubtext.innerText = "Disqualified: Student carried underloaded term(s)";
    } else if (cumulativeGWA > 0 && cumulativeGWA <= 1.25) {
        honorElem.innerText = "Summa Cum Laude";
        honorElem.className = "summary-value honor-badge text-gold";
        honorSubtext.innerText = "Complies with GWA ≤ 1.2500 & Full Load";
    } else if (cumulativeGWA > 1.25 && cumulativeGWA <= 1.45) {
        honorElem.innerText = "Magna Cum Laude";
        honorElem.className = "summary-value honor-badge text-gold";
        honorSubtext.innerText = "Complies with 1.2500 < GWA ≤ 1.4500";
    } else if (cumulativeGWA > 1.45 && cumulativeGWA <= 1.75) {
        honorElem.innerText = "Cum Laude";
        honorElem.className = "summary-value honor-badge text-gold";
        honorSubtext.innerText = "Complies with 1.4500 < GWA ≤ 1.7500";
    } else {
        honorElem.innerText = "Regular Candidate";
        honorElem.className = "summary-value honor-badge text-primary";
        honorSubtext.innerText = "Does not meet honor threshold (GWA > 1.7500)";
    }

    // Academic Standing Radar
    const standingElem = document.getElementById("academic-standing");
    const standingSubtext = document.getElementById("standing-subtext");

    if (failingCount === 0) {
        standingElem.innerText = "Good Standing";
        standingElem.className = "summary-value standing-badge text-success";
        standingSubtext.innerText = "0 Academic Deficiencies Detected";
    } else if (failingCount === 1) {
        standingElem.innerText = "Academic Warning";
        standingElem.className = "summary-value standing-badge text-gold";
        standingSubtext.innerText = "1 Failure: Subject load reduced next term";
    } else if (failingCount === 2) {
        standingElem.innerText = "Academic Probation";
        standingElem.className = "summary-value standing-badge text-danger";
        standingSubtext.innerText = "2 Failures: Placed on Probation (Max 75% load)";
    } else {
        standingElem.innerText = "Academic Dismissal Risk";
        standingElem.className = "summary-value standing-badge text-danger";
        standingSubtext.innerText = "3+ Failures: Dropped from rolls per handbook";
    }
}

// "WHAT-IF" SIMULATOR LOGIC
function initSimulator() {
    const slider = document.getElementById("sim-grade-slider");
    const futureUnits = document.getElementById("sim-future-units");

    if (slider) {
        slider.addEventListener("input", () => {
            document.getElementById("sim-slider-val").innerText = parseFloat(slider.value).toFixed(2);
            updateSimulator();
        });
    }

    if (futureUnits) {
        futureUnits.addEventListener("input", updateSimulator);
    }
}

function updateSimulator() {
    let totalPoints = 0;
    let totalUnits = 0;

    semesters.forEach(sem => {
        sem.subjects.forEach(sub => {
            const numGrade = parseFloat(sub.grade);
            const units = parseFloat(sub.units) || 0;
            if (!isNaN(numGrade) && units > 0) {
                totalPoints += numGrade * units;
                totalUnits += units;
            }
        });
    });

    const currentGWA = totalUnits > 0 ? (totalPoints / totalUnits) : 0;
    document.getElementById("sim-current-gwa").value = currentGWA.toFixed(4);
    document.getElementById("sim-current-units").value = totalUnits.toFixed(1);

    const futureUnitsVal = parseFloat(document.getElementById("sim-future-units").value) || 0;
    const futureGradeVal = parseFloat(document.getElementById("sim-grade-slider").value) || 1.50;

    const projectedPoints = totalPoints + (futureUnitsVal * futureGradeVal);
    const projectedTotalUnits = totalUnits + futureUnitsVal;
    const projectedGWA = projectedTotalUnits > 0 ? (projectedPoints / projectedTotalUnits) : 0;

    document.getElementById("proj-gwa-result").innerText = projectedGWA.toFixed(4);

    const projHonor = document.getElementById("proj-honor-result");
    if (projectedGWA <= 1.25) {
        projHonor.innerText = "Projected: Summa Cum Laude";
    } else if (projectedGWA <= 1.45) {
        projHonor.innerText = "Projected: Magna Cum Laude";
    } else if (projectedGWA <= 1.75) {
        projHonor.innerText = "Projected: Cum Laude";
    } else {
        projHonor.innerText = "Projected: Regular Graduate";
    }
}

function calculateTargetRequired(targetGWA) {
    let totalPoints = 0;
    let totalUnits = 0;

    semesters.forEach(sem => {
        sem.subjects.forEach(sub => {
            const numGrade = parseFloat(sub.grade);
            const units = parseFloat(sub.units) || 0;
            if (!isNaN(numGrade) && units > 0) {
                totalPoints += numGrade * units;
                totalUnits += units;
            }
        });
    });

    const futureUnitsVal = parseFloat(document.getElementById("sim-future-units").value) || 0;
    if (futureUnitsVal === 0) {
        document.getElementById("target-result-output").innerText = "Please specify remaining future units to calculate.";
        return;
    }

    const requiredTotalPoints = targetGWA * (totalUnits + futureUnitsVal);
    const neededFuturePoints = requiredTotalPoints - totalPoints;
    const requiredAverageGrade = neededFuturePoints / futureUnitsVal;

    const outputElem = document.getElementById("target-result-output");
    if (requiredAverageGrade < 1.00) {
        outputElem.innerText = `Goal Achieved! You already qualify even with grades lower than 1.00 (Math average: ${requiredAverageGrade.toFixed(2)}).`;
    } else if (requiredAverageGrade > 3.00) {
        outputElem.innerText = `Mathematically Unattainable. You would need an average grade of ${requiredAverageGrade.toFixed(2)} in remaining units.`;
    } else {
        outputElem.innerText = `To achieve GWA ≤ ${targetGWA.toFixed(2)}, you must average at least ${requiredAverageGrade.toFixed(4)} across your remaining ${futureUnitsVal} units.`;
    }
}

// SCHOLARSHIP MONITOR LOGIC
function initScholarshipMonitor() {
    ["sch-max-gwa", "sch-lowest-grade", "sch-no-inc", "sch-no-fail"].forEach(id => {
        const elem = document.getElementById(id);
        if (elem) elem.addEventListener("change", evaluateScholarship);
    });
}

function applyScholarshipPreset() {
    const preset = document.getElementById("scholarship-preset").value;
    const maxGwa = document.getElementById("sch-max-gwa");
    const lowest = document.getElementById("sch-lowest-grade");
    const noInc = document.getElementById("sch-no-inc");
    const noFail = document.getElementById("sch-no-fail");

    if (preset === "dost") {
        maxGwa.value = "2.50"; lowest.value = "3.0"; noInc.checked = true; noFail.checked = true;
    } else if (preset === "ched_full") {
        maxGwa.value = "1.75"; lowest.value = "2.5"; noInc.checked = true; noFail.checked = true;
    } else if (preset === "ched_half") {
        maxGwa.value = "2.50"; lowest.value = "3.0"; noInc.checked = true; noFail.checked = true;
    } else if (preset === "tes") {
        maxGwa.value = "3.00"; lowest.value = "3.0"; noInc.checked = false; noFail.checked = false;
    } else if (preset === "bu_athletic") {
        maxGwa.value = "3.00"; lowest.value = "3.0"; noInc.checked = true; noFail.checked = true;
    }
    evaluateScholarship();
}

function evaluateScholarship() {
    const maxGWAAllowed = parseFloat(document.getElementById("sch-max-gwa").value) || 3.0;
    const lowestGradeAllowed = parseFloat(document.getElementById("sch-lowest-grade").value) || 3.0;
    const disallowInc = document.getElementById("sch-no-inc").checked;
    const disallowFail = document.getElementById("sch-no-fail").checked;

    let totalPoints = 0;
    let totalUnits = 0;
    let hasFail = false;
    let hasInc = false;
    let exceededLowestGrade = false;

    semesters.forEach(sem => {
        sem.subjects.forEach(sub => {
            const numGrade = parseFloat(sub.grade);
            const units = parseFloat(sub.units) || 0;

            if (sub.grade === "5.00") hasFail = true;
            if (sub.grade === "INC") hasInc = true;

            if (!isNaN(numGrade)) {
                if (numGrade > lowestGradeAllowed) exceededLowestGrade = true;
                if (units > 0) {
                    totalPoints += numGrade * units;
                    totalUnits += units;
                }
            }
        });
    });

    const currentGWA = totalUnits > 0 ? (totalPoints / totalUnits) : 0;

    const chkGwa = document.getElementById("chk-gwa");
    const chkGrade = document.getElementById("chk-grade");
    const chkInc = document.getElementById("chk-inc");
    const chkFail = document.getElementById("chk-fail");

    let isCompliant = true;

    if (currentGWA <= maxGWAAllowed && totalUnits > 0) {
        chkGwa.innerHTML = `<i class="fa-solid fa-check text-success"></i> GWA Check Passed (${currentGWA.toFixed(4)} ≤ ${maxGWAAllowed.toFixed(2)})`;
    } else {
        chkGwa.innerHTML = `<i class="fa-solid fa-xmark text-danger"></i> GWA Check Failed (${currentGWA.toFixed(4)} > ${maxGWAAllowed.toFixed(2)})`;
        if (totalUnits > 0) isCompliant = false;
    }

    if (!exceededLowestGrade) {
        chkGrade.innerHTML = `<i class="fa-solid fa-check text-success"></i> Individual Grade Cap Passed (All ≤ ${lowestGradeAllowed.toFixed(1)})`;
    } else {
        chkGrade.innerHTML = `<i class="fa-solid fa-xmark text-danger"></i> Grade Cap Exceeded (Some grades > ${lowestGradeAllowed.toFixed(1)})`;
        isCompliant = false;
    }

    if (!disallowInc || !hasInc) {
        chkInc.innerHTML = `<i class="fa-solid fa-check text-success"></i> Incomplete (INC) Check Passed`;
    } else {
        chkInc.innerHTML = `<i class="fa-solid fa-xmark text-danger"></i> Disqualified: Unresolved INC Grade Found`;
        isCompliant = false;
    }

    if (!disallowFail || !hasFail) {
        chkFail.innerHTML = `<i class="fa-solid fa-check text-success"></i> No Failing Mark Check Passed`;
    } else {
        chkFail.innerHTML = `<i class="fa-solid fa-xmark text-danger"></i> Disqualified: Failing Mark (5.0) Found`;
        isCompliant = false;
    }

    const titleElem = document.getElementById("sch-status-title");
    const descElem = document.getElementById("sch-status-desc");
    const iconElem = document.getElementById("sch-icon");
    const containerElem = document.getElementById("sch-status-container");

    if (isCompliant && totalUnits > 0) {
        containerElem.style.background = "#ecfdf5";
        containerElem.style.borderColor = "#a7f3d0";
        iconElem.innerHTML = `<i class="fa-solid fa-circle-check text-success"></i>`;
        titleElem.innerText = "Eligible & Compliant";
        descElem.innerText = `Your current performance meets all specified retention criteria.`;
    } else if (totalUnits === 0) {
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

// Export / Print
function exportAcademicSummary() {
    window.print();
}

// Utility Helpers
function escapeHtml(str) {
    if (!str) return "";
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
