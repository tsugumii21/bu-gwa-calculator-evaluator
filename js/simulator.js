// Bicol University GWA Calculator — Simulator & Target Finder

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
    if (curUnitsElem) curUnitsElem.value = Math.round(stats.totalUnits);

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
