// Bicol University GWA Calculator — Evaluators & Dashboard Updates

let isHonorEvaluated = false;

function updateGlobalSummary() {
    const stats = calculateCumulativeStats();
    const computedStats = typeof calculateComputedCumulativeStats === "function" ? calculateComputedCumulativeStats() : stats;
    const computedCount = semesters.filter(s => s.computed).length;
    const totalCount = semesters.length;

    const gwaElem = document.getElementById("overall-gwa");
    const gwaSubtextElem = document.getElementById("gwa-subtext");
    const unitsElem = document.getElementById("total-units");
    const unitsSubtextElem = document.getElementById("units-subtext");

    const allComputed = semesters && semesters.length > 0 && semesters.every(s => s.computed);

    if (gwaElem) {
        if (totalCount === 0) {
            gwaElem.innerText = "0.0000";
            if (gwaSubtextElem) gwaSubtextElem.innerText = "Weighted Grade Average";
        } else if (allComputed) {
            gwaElem.innerText = computedStats.cumulativeGWA.toFixed(4);
            if (gwaSubtextElem) gwaSubtextElem.innerText = "Weighted Grade Average";
        } else if (computedCount > 0) {
            gwaElem.innerText = computedStats.cumulativeGWA.toFixed(4);
            if (gwaSubtextElem) gwaSubtextElem.innerText = `Partial: ${computedCount} of ${totalCount} terms computed`;
        } else {
            gwaElem.innerText = "Pending";
            if (gwaSubtextElem) gwaSubtextElem.innerText = "Awaiting term computation";
        }
    }
    if (unitsElem) unitsElem.innerText = Math.round(stats.totalUnits);
    if (unitsSubtextElem) unitsSubtextElem.innerText = `${stats.totalCourses} Courses Recorded`;

    evaluateTermHonorStanding();
    evaluateAcademicStanding(stats);
}

// 2nd Summary Card on Calculator Dashboard: Evaluates President's Lister, Dean's Lister, or Better Next Time
function evaluateTermHonorStanding() {
    const honorElem = document.getElementById("honor-status");
    const honorSubtext = document.getElementById("honor-subtext");

    if (!honorElem || !honorSubtext) return;

    if (!semesters || semesters.length === 0) {
        honorElem.innerText = "No Courses Added";
        honorElem.className = "summary-value honor-badge text-black-white";
        honorSubtext.innerText = "Add subjects to evaluate honor status";
        return;
    }

    const computedSemesters = semesters.filter(s => s.computed);

    if (computedSemesters.length === 0) {
        honorElem.innerText = "Pending Computation";
        honorElem.className = "summary-value honor-badge text-muted";
        honorSubtext.innerText = "Click 'Compute GPA' on card to evaluate";
        return;
    }

    const latestSem = computedSemesters[computedSemesters.length - 1];
    const isPartial = computedSemesters.length < semesters.length;
    const suffix = isPartial ? " (Latest Computed)" : "";
    const semGWA = calculateSemesterGWA(latestSem);
    const semUnits = calculateSemesterUnits(latestSem);

    let lowestGradeInSem = 1.0;
    let hasFailOrInc = false;

    if (latestSem && latestSem.subjects) {
        latestSem.subjects.forEach(sub => {
            const num = parseFloat(sub.grade);
            if (sub.grade === "5.0" || sub.grade === "5.00" || num === 5.0 || sub.grade === "INC") hasFailOrInc = true;
            if (!isNaN(num) && num > lowestGradeInSem) lowestGradeInSem = num;
        });
    }

    if (semUnits > 0 && !hasFailOrInc && !latestSem.underload) {
        // PL: Semester GPA <= 1.4500 and no grade > 1.75
        if (semGWA <= 1.4500 && lowestGradeInSem <= 1.75) {
            honorElem.innerText = "President's Lister";
            honorElem.className = "summary-value honor-badge text-gold";
            honorSubtext.innerText = `${escapeHtml(latestSem.title)} (GPA: ${semGWA.toFixed(4)})${suffix}`;
            return;
        } 
        // DL: Semester GPA <= 1.7500 and no grade > 2.50
        else if (semGWA <= 1.7500 && lowestGradeInSem <= 2.50) {
            honorElem.innerText = "Dean's Lister";
            honorElem.className = "summary-value honor-badge text-blue";
            honorSubtext.innerText = `${escapeHtml(latestSem.title)} (GPA: ${semGWA.toFixed(4)})${suffix}`;
            return;
        }
    }

    if (latestSem.underload) {
        honorElem.innerText = "Balanced Pace Bueño";
        honorElem.className = "summary-value honor-badge text-orange";
        honorSubtext.innerText = `${escapeHtml(latestSem.title)} (GPA: ${semGWA.toFixed(4)}) — Custom Load${suffix}`;
    } else if (hasFailOrInc) {
        honorElem.innerText = "Dedicated Bueño";
        honorElem.className = "summary-value honor-badge text-success";
        honorSubtext.innerText = `${escapeHtml(latestSem.title)}: Disqualified due to 5.0 / INC grade${suffix}`;
    } else if (semUnits > 0) {
        honorElem.innerText = "Dedicated Bueño";
        honorElem.className = "summary-value honor-badge text-success";
        honorSubtext.innerText = `${escapeHtml(latestSem.title)} (GPA: ${semGWA.toFixed(4)})${suffix}`;
    } else {
        honorElem.innerText = "Dedicated Bueño";
        honorElem.className = "summary-value honor-badge text-success";
        honorSubtext.innerText = "Add subjects to evaluate term honors";
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
