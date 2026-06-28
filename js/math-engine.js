// Bicol University GWA Calculator — Math Computation Engine

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

                if (sub.grade === "5.0" || sub.grade === "5.00" || numGrade === 5.0) {
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
