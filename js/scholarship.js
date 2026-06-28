// Bicol University GWA Calculator — Scholarship Monitor

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
        const isDark = document.documentElement.getAttribute("data-theme") === "dark";

        if (isCompliant && stats.totalUnits > 0) {
            containerElem.style.background = isDark ? "rgba(16, 185, 129, 0.12)" : "#ecfdf5";
            containerElem.style.borderColor = isDark ? "rgba(16, 185, 129, 0.3)" : "#a7f3d0";
            titleElem.style.color = isDark ? "#34d399" : "#065f46";
            descElem.style.color = isDark ? "#94a3b8" : "#475569";
            iconElem.innerHTML = `<i class="fa-solid fa-circle-check text-success"></i>`;
            titleElem.innerText = "Eligible & Compliant";
            descElem.innerText = `Your current performance meets all specified retention criteria.`;
        } else if (stats.totalUnits === 0) {
            containerElem.style.background = isDark ? "rgba(148, 163, 184, 0.08)" : "#f8fafc";
            containerElem.style.borderColor = isDark ? "rgba(148, 163, 184, 0.2)" : "#cbd5e1";
            titleElem.style.color = isDark ? "#fbbf24" : "#92400e";
            descElem.style.color = isDark ? "#94a3b8" : "#475569";
            iconElem.innerHTML = `<i class="fa-solid fa-circle-info text-gold"></i>`;
            titleElem.innerText = "Awaiting Data";
            descElem.innerText = "Add your subject grades in the Calculator tab to evaluate compliance.";
        } else {
            containerElem.style.background = isDark ? "rgba(239, 68, 68, 0.1)" : "#fef2f2";
            containerElem.style.borderColor = isDark ? "rgba(239, 68, 68, 0.3)" : "#fecaca";
            titleElem.style.color = isDark ? "#f87171" : "#991b1b";
            descElem.style.color = isDark ? "#94a3b8" : "#475569";
            iconElem.innerHTML = `<i class="fa-solid fa-triangle-exclamation text-danger"></i>`;
            titleElem.innerText = "Retention Risk Warning";
            descElem.innerText = `One or more scholarship criteria are currently unmet. Review the checklist below.`;
        }
    }
}
