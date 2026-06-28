// Bicol University GWA Calculator — Academic Achievements & Term/Latin Honors Evaluator

function openAchievementsModal() {
    const modal = document.getElementById("achievement-modal");
    if (modal) {
        evaluateAcademicAchievements();
        modal.style.display = "flex";
    }
}

function closeAchievementsModal() {
    const modal = document.getElementById("achievement-modal");
    if (modal) modal.style.display = "none";
}

function openLatinHonorsModal() {
    const modal = document.getElementById("latin-honors-modal");
    if (modal) {
        evaluateLatinHonorsModal();
        modal.style.display = "flex";
    }
}

function closeLatinHonorsModal() {
    const modal = document.getElementById("latin-honors-modal");
    if (modal) modal.style.display = "none";
}

function openTermHonorModal() {
    const modal = document.getElementById("term-honor-modal");
    if (modal) {
        evaluateTermHonorModal();
        modal.style.display = "flex";
    }
}

function closeTermHonorModal() {
    const modal = document.getElementById("term-honor-modal");
    if (modal) modal.style.display = "none";
}

function computeAllSemesters() {
    if (!semesters || semesters.length === 0) return;
    semesters.forEach(sem => {
        sem.computed = true;
    });
    isHonorEvaluated = true;
    saveData();
    renderSemesters();
    updateGlobalSummary();

    const achModal = document.getElementById("achievement-modal");
    if (achModal && achModal.style.display === "flex") {
        evaluateAcademicAchievements();
    }
    const latinModal = document.getElementById("latin-honors-modal");
    if (latinModal && latinModal.style.display === "flex") {
        evaluateLatinHonorsModal();
    }
    const termModal = document.getElementById("term-honor-modal");
    if (termModal && termModal.style.display === "flex") {
        evaluateTermHonorModal();
    }
}

function openSemesterComputeModal(semIndex) {
    if (semesters && semesters[semIndex]) {
        semesters[semIndex].computed = true;
    }
    isHonorEvaluated = true;
    saveData();
    renderSemesters();
    updateGlobalSummary();
    const modal = document.getElementById("term-honor-modal");
    if (modal) {
        evaluateSemesterComputeModal(semIndex);
        modal.style.display = "flex";
    }
}

// Per-Semester GPA & Honor Compute Popup Modal
function evaluateSemesterComputeModal(semIndex) {
    const container = document.getElementById("term-modal-content");
    if (!container) return;

    if (!semesters || !semesters[semIndex]) {
        container.innerHTML = `<p class="text-muted">Semester data not found.</p>`;
        return;
    }

    const sem = semesters[semIndex];
    const semGWA = calculateSemesterGWA(sem);
    const semUnits = calculateSemesterUnits(sem);

    let lowestGradeInSem = 1.0;
    let hasFailOrInc = false;

    if (sem && sem.subjects) {
        sem.subjects.forEach(sub => {
            const num = parseFloat(sub.grade);
            if (sub.grade === "5.0" || sub.grade === "5.00" || num === 5.0 || sub.grade === "INC") hasFailOrInc = true;
            if (!isNaN(num) && num > lowestGradeInSem) lowestGradeInSem = num;
        });
    }

    let category = "NOT_PL_DL";
    let title = "Keep Striving 🎯";
    let badgeClass = "card-neutral";
    let icon = "fa-bullseye";
    let subtext = "";

    if (semUnits > 0 && !hasFailOrInc && !sem.underload) {
        if (semGWA <= 1.4500 && lowestGradeInSem <= 1.75) {
            category = "PL";
            title = "President's Lister 🏆";
            badgeClass = "card-gold";
            icon = "fa-crown";
            subtext = `${escapeHtml(sem.title)} — Semester GPA: <strong>${semGWA.toFixed(4)}</strong>`;
        } else if (semGWA <= 1.7500 && lowestGradeInSem <= 2.50) {
            category = "DL";
            title = "Dean's Lister 🌟";
            badgeClass = "card-gold";
            icon = "fa-medal";
            subtext = `${escapeHtml(sem.title)} — Semester GPA: <strong>${semGWA.toFixed(4)}</strong>`;
        }
    }

    if (category === "NOT_PL_DL") {
        if (sem.underload) {
            subtext = `${escapeHtml(sem.title)} (GPA: <strong>${semGWA.toFixed(4)}</strong>) — Disqualified due to Underloaded Term`;
            icon = "fa-circle-xmark";
            badgeClass = "alert-card-danger";
        } else if (hasFailOrInc) {
            subtext = `${escapeHtml(sem.title)} (GPA: <strong>${semGWA.toFixed(4)}</strong>) — Disqualified due to 5.0 / INC grade`;
            icon = "fa-circle-xmark";
            badgeClass = "alert-card-danger";
        } else {
            subtext = `${escapeHtml(sem.title)} — Semester GPA: <strong>${semGWA.toFixed(4)}</strong> (Keep striving!)`;
        }
    }

    const message = typeof getHonorMessage === "function" ? getHonorMessage(category) : "\"Keep aiming high!\"";

    container.innerHTML = `
        <div class="achieve-section">
            <div class="achieve-card ${badgeClass}">
                <div class="achieve-icon"><i class="fa-solid ${icon}"></i></div>
                <div class="achieve-details">
                    <strong class="achieve-title">${title}</strong>
                    <span class="achieve-subtext">${subtext}</span>
                </div>
            </div>
            <div class="quote-box">
                <i class="fa-solid fa-quote-left quote-icon"></i>
                <div class="quote-text">${message}</div>
            </div>
        </div>
    `;
}

// Term Honor Qualification Popup Computation Modal (Latest Semester)
function evaluateTermHonorModal() {
    if (semesters && semesters.length > 0) {
        evaluateSemesterComputeModal(semesters.length - 1);
    } else {
        const container = document.getElementById("term-modal-content");
        if (container) {
            container.innerHTML = `
                <div class="achieve-card card-neutral">
                    <div class="achieve-icon"><i class="fa-solid fa-folder-open text-primary" style="font-size:2rem;"></i></div>
                    <div class="achieve-details">
                        <strong>No Semesters Recorded</strong>
                        <span class="achieve-subtext">Add subjects to evaluate your semester honor qualification.</span>
                    </div>
                </div>
            `;
        }
    }
}

// Latin Honors Popup Computation, Exact Cutoffs Table, & Dynamic Motivational Quotes
function evaluateLatinHonorsModal() {
    const stats = calculateCumulativeStats();
    const container = document.getElementById("latin-modal-content");
    if (!container) return;

    let html = "";
    html += `<div class="achieve-section">`;

    const allComputed = semesters && semesters.length > 0 && semesters.every(s => s.computed);

    if (stats.totalUnits === 0) {
        const quote = typeof getHonorMessage === "function" ? getHonorMessage("NOT_LAUDE") : "\"Keep pushing your limits!\"";
        html += `
            <div class="achieve-card card-neutral">
                <div class="achieve-icon"><i class="fa-solid fa-folder-open text-primary" style="font-size:2rem;"></i></div>
                <div class="achieve-details">
                    <strong>No Courses Added Yet</strong>
                    <span class="achieve-subtext">Add your subjects and grades in the calculator to evaluate Latin Graduation Honors.</span>
                </div>
            </div>
            <div class="quote-box">
                <i class="fa-solid fa-quote-left quote-icon"></i>
                <div class="quote-text">${quote}</div>
            </div>
        `;
    } else if (!allComputed) {
        html += `
            <div class="achieve-card card-neutral" style="border-left: 4px solid var(--bu-gold); padding: 18px;">
                <div class="achieve-icon"><i class="fa-solid fa-clock-rotate-left text-gold" style="font-size:1.8rem;"></i></div>
                <div class="achieve-details">
                    <strong style="font-size:1.05rem; color:var(--text-primary);">Awaiting Full Computation</strong>
                    <span class="achieve-subtext" style="display:block; margin-top:4px; line-height:1.5;">
                        Graduation Honor candidacy & proximity gap analysis require all semester GPAs to be computed first. Please compute each semester or click below.
                    </span>
                    <div style="margin-top:12px;">
                        <button class="btn btn-gold btn-sm" onclick="computeAllSemesters()">
                            <i class="fa-solid fa-calculator"></i> Compute All Terms Now
                        </button>
                    </div>
                </div>
            </div>
        `;
    } else if (stats.hasFailingGrade || stats.hasInc || stats.hasUnderload) {
        let reasons = [];
        if (stats.hasFailingGrade) reasons.push("Failing mark (5.0)");
        if (stats.hasInc) reasons.push("Unresolved INC mark");
        if (stats.hasUnderload) reasons.push("Underloaded term");

        const quote = typeof getHonorMessage === "function" ? getHonorMessage("NOT_LAUDE") : "\"Keep your head held high!\"";

        html += `
            <div class="achieve-card alert-card-danger">
                <div class="achieve-icon"><i class="fa-solid fa-circle-xmark text-danger"></i></div>
                <div class="achieve-details">
                    <strong style="font-size:1.05rem;">Not Eligible for Latin Graduation Honors</strong>
                    <span class="achieve-subtext" style="line-height:1.4; margin-top:4px;">
                        Per the Bicol University Student Handbook (Art. VIII, Sec. 30), candidates must carry full regular load with zero academic deficiencies. Disqualified due to: <strong>${reasons.join(", ")}</strong>.
                    </span>
                </div>
            </div>
            <div class="quote-box" style="border-left-color: var(--color-danger); background: rgba(239, 68, 68, 0.06);">
                <i class="fa-solid fa-quote-left quote-icon" style="color: var(--color-danger);"></i>
                <div class="quote-text">${quote}</div>
            </div>
        `;
    } else {
        const gwa = stats.cumulativeGWA;

        if (gwa <= 1.2500) {
            const quote = typeof getHonorMessage === "function" ? getHonorMessage("SUMMA") : "\"Academic perfection!\"";
            html += `
                <div class="achieve-card card-gold">
                    <div class="achieve-icon"><i class="fa-solid fa-crown text-gold"></i></div>
                    <div class="achieve-details">
                        <strong class="achieve-title" style="color:#b45309;">Candidate for Summa Cum Laude! 🎉</strong>
                        <span class="achieve-subtext">Your cumulative GWA is <strong>${gwa.toFixed(4)}</strong> (≤ 1.2500). You are at the absolute pinnacle of academic excellence!</span>
                    </div>
                </div>
                <div class="quote-box">
                    <i class="fa-solid fa-quote-left quote-icon"></i>
                    <div class="quote-text">${quote}</div>
                </div>
            `;
        } else if (gwa <= 1.4500) {
            const gapToSumma = gwa - 1.2500;
            const quote = typeof getHonorMessage === "function" ? getHonorMessage("MAGNA") : "\"Strive higher!\"";
            html += `
                <div class="achieve-card card-orange">
                    <div class="achieve-icon"><i class="fa-solid fa-medal text-orange"></i></div>
                    <div class="achieve-details">
                        <strong class="achieve-title" style="color:#c2410c;">Candidate for Magna Cum Laude! 🌟</strong>
                        <span class="achieve-subtext">Your cumulative GWA is <strong>${gwa.toFixed(4)}</strong> (1.2500 < GWA ≤ 1.4500).</span>
                        <span class="gap-pill" style="margin-top:8px;">🔥 So Close! You are only <strong>${gapToSumma.toFixed(4)}</strong> points away from Summa Cum Laude!</span>
                    </div>
                </div>
                <div class="quote-box" style="border-left-color: var(--bu-orange); background: rgba(234, 88, 12, 0.06);">
                    <i class="fa-solid fa-quote-left quote-icon" style="color: var(--bu-orange);"></i>
                    <div class="quote-text">${quote}</div>
                </div>
            `;
        } else if (gwa <= 1.7500) {
            const gapToMagna = gwa - 1.4500;
            const quote = typeof getHonorMessage === "function" ? getHonorMessage("CUM") : "\"Great work!\"";
            html += `
                <div class="achieve-card card-blue">
                    <div class="achieve-icon"><i class="fa-solid fa-award text-primary"></i></div>
                    <div class="achieve-details">
                        <strong class="achieve-title" style="color:#1d4ed8;">Candidate for Cum Laude! 🏅</strong>
                        <span class="achieve-subtext">Your cumulative GWA is <strong>${gwa.toFixed(4)}</strong> (1.4500 < GWA ≤ 1.7500).</span>
                        <span class="gap-pill" style="margin-top:8px;">⚡ So Close! You are only <strong>${gapToMagna.toFixed(4)}</strong> points away from Magna Cum Laude!</span>
                    </div>
                </div>
                <div class="quote-box" style="border-left-color: var(--bu-azure); background: rgba(37, 99, 235, 0.06);">
                    <i class="fa-solid fa-quote-left quote-icon" style="color: var(--bu-azure);"></i>
                    <div class="quote-text">${quote}</div>
                </div>
            `;
        } else {
            const gapToCum = gwa - 1.7500;
            const quote = typeof getHonorMessage === "function" ? getHonorMessage("NOT_LAUDE") : "\"Keep aiming high!\"";
            html += `
                <div class="achieve-card card-neutral">
                    <div class="achieve-icon"><i class="fa-solid fa-bullseye text-primary"></i></div>
                    <div class="achieve-details">
                        <strong class="achieve-title">Regular Graduate Candidate</strong>
                        <span class="achieve-subtext">Your current cumulative GWA is <strong>${gwa.toFixed(4)}</strong>.</span>
                        <span class="gap-pill" style="margin-top:8px;">🎯 Goal Gap: You are <strong>${gapToCum.toFixed(4)}</strong> points away from Cum Laude cutoff (1.7500).</span>
                    </div>
                </div>
                <div class="quote-box">
                    <i class="fa-solid fa-quote-left quote-icon"></i>
                    <div class="quote-text">${quote}</div>
                </div>
            `;
        }
    }

    // Exact Cutoffs Breakdown Table inside Popup
    html += `
        <div style="margin-top:20px; padding-top:16px; border-top:1px solid var(--border-color);">
            <h4 style="font-family:var(--font-display); font-size:0.95rem; font-weight:700; margin-bottom:10px;">
                <i class="fa-solid fa-list-check text-primary"></i> Exact Bicol University Graduation Honor Criteria
            </h4>
            <div class="table-responsive">
                <table style="width:100%; border-collapse:collapse; font-size:0.82rem; text-align:left;">
                    <thead>
                        <tr style="background:var(--card-header-bg); border-bottom:1px solid var(--border-color);">
                            <th style="padding:6px 10px;">Honor Level</th>
                            <th style="padding:6px 10px;">Exact GWA Cutoff</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style="border-bottom:1px solid var(--border-color);">
                            <td style="padding:6px 10px; font-weight:700; color:#b45309;">👑 Summa Cum Laude</td>
                            <td style="padding:6px 10px;">1.0000 – 1.2500</td>
                        </tr>
                        <tr style="border-bottom:1px solid var(--border-color);">
                            <td style="padding:6px 10px; font-weight:700; color:#c2410c;">🌟 Magna Cum Laude</td>
                            <td style="padding:6px 10px;">1.2501 – 1.4500</td>
                        </tr>
                        <tr style="border-bottom:1px solid var(--border-color);">
                            <td style="padding:6px 10px; font-weight:700; color:#1d4ed8;">🏅 Cum Laude</td>
                            <td style="padding:6px 10px;">1.4501 – 1.7500</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <p style="font-size:0.78rem; color:var(--text-secondary); margin-top:8px; line-height:1.4;">
                *Rules: Must carry full regular load every term with zero 5.0 or INC marks (Art. VIII, Sec. 30).
            </p>
        </div>
    `;

    html += `</div>`;
    container.innerHTML = html;
}

function evaluateAcademicAchievements() {
    const stats = calculateCumulativeStats();
    
    const container = document.getElementById("achievements-content");
    if (!container) return;

    let html = "";

    const allComputed = semesters && semesters.length > 0 && semesters.every(s => s.computed);

    // 1. Current Graduation Honor Status & Proximity Gap Analysis
    html += `<div class="achieve-section">`;
    html += `<h4 class="achieve-heading"><i class="fa-solid fa-graduation-cap text-gold"></i> Graduation Honor Proximity</h4>`;

    if (stats.totalUnits === 0) {
        html += `<p class="text-muted" style="font-size:0.9rem;">Add your subjects and grades to evaluate graduation honors.</p>`;
    } else if (!allComputed) {
        html += `
            <div class="achieve-card card-neutral" style="border-left: 4px solid var(--bu-gold); padding: 16px;">
                <div class="achieve-icon"><i class="fa-solid fa-clock-rotate-left text-gold" style="font-size:1.6rem;"></i></div>
                <div class="achieve-details">
                    <strong style="font-size:1rem; color:var(--text-primary);">Awaiting Full Computation</strong>
                    <span class="achieve-subtext" style="display:block; margin-top:2px; line-height:1.4;">
                        Graduation Honor proximity gap analysis requires all semester GPAs to be computed first.
                    </span>
                    <div style="margin-top:8px;">
                        <button class="btn btn-gold btn-sm" onclick="computeAllSemesters()">
                            <i class="fa-solid fa-calculator"></i> Compute All Terms
                        </button>
                    </div>
                </div>
            </div>
        `;
    } else if (stats.hasFailingGrade || stats.hasInc || stats.hasUnderload) {
        const quote = typeof getHonorMessage === "function" ? getHonorMessage("NOT_LAUDE") : "\"Stay resilient!\"";
        html += `<div class="achieve-card alert-card-danger">`;
        html += `<div class="achieve-icon"><i class="fa-solid fa-circle-xmark text-danger"></i></div>`;
        html += `<div class="achieve-details"><strong>Not Eligible for Graduation Honors</strong><br>`;
        if (stats.hasFailingGrade) html += `<span style="font-size:0.82rem;">Disqualified due to failing grade (5.0).</span><br>`;
        if (stats.hasInc) html += `<span style="font-size:0.82rem;">Disqualified due to unresolved INC grade.</span><br>`;
        if (stats.hasUnderload) html += `<span style="font-size:0.82rem;">Disqualified due to carrying an underloaded term.</span>`;
        html += `</div></div>`;
        html += `<div class="quote-box" style="margin-top:8px;">💪 ${quote}</div>`;
    } else {
        const gwa = stats.cumulativeGWA;
        
        if (gwa <= 1.2500) {
            html += `<div class="achieve-card card-gold">`;
            html += `<div class="achieve-icon"><i class="fa-solid fa-crown text-gold"></i></div>`;
            html += `<div class="achieve-details"><strong>Qualified for Summa Cum Laude! 🎉</strong><br><span style="font-size:0.85rem;">Cumulative GWA ${gwa.toFixed(4)} ≤ 1.2500. You are at the pinnacle of academic excellence!</span></div></div>`;
        } else if (gwa <= 1.4500) {
            const gapToSumma = gwa - 1.2500;
            html += `<div class="achieve-card card-orange">`;
            html += `<div class="achieve-icon"><i class="fa-solid fa-medal text-orange"></i></div>`;
            html += `<div class="achieve-details"><strong>Qualified for Magna Cum Laude! 🌟</strong><br><span style="font-size:0.85rem;">Cumulative GWA ${gwa.toFixed(4)}.</span><br>`;
            html += `<span class="gap-pill">🔥 So Close! You are only <strong>${gapToSumma.toFixed(4)}</strong> points away from Summa Cum Laude!</span></div></div>`;
        } else if (gwa <= 1.7500) {
            const gapToMagna = gwa - 1.4500;
            html += `<div class="achieve-card card-blue">`;
            html += `<div class="achieve-icon"><i class="fa-solid fa-award text-primary"></i></div>`;
            html += `<div class="achieve-details"><strong>Qualified for Cum Laude! 🏅</strong><br><span style="font-size:0.85rem;">Cumulative GWA ${gwa.toFixed(4)}.</span><br>`;
            html += `<span class="gap-pill">⚡ So Close! You are only <strong>${gapToMagna.toFixed(4)}</strong> points away from Magna Cum Laude!</span></div></div>`;
        } else {
            const gapToCum = gwa - 1.7500;
            const quote = typeof getHonorMessage === "function" ? getHonorMessage("NOT_LAUDE") : "\"Keep pushing!\"";
            html += `<div class="achieve-card card-neutral">`;
            html += `<div class="achieve-icon"><i class="fa-solid fa-bullseye text-primary"></i></div>`;
            html += `<div class="achieve-details"><strong>Regular Graduate Candidate</strong><br><span style="font-size:0.85rem;">Current GWA is ${gwa.toFixed(4)}.</span><br>`;
            html += `<span class="gap-pill">🎯 Goal: You are <strong>${gapToCum.toFixed(4)}</strong> points away from Cum Laude threshold (1.7500)!</span></div></div>`;
            html += `<div class="quote-box" style="margin-top:8px;">✨ ${quote}</div>`;
        }
    }
    html += `</div>`;

    // 2. Semester-by-Semester Academic Recognition (President's & Dean's Lister)
    html += `<div class="achieve-section" style="margin-top:20px;">`;
    html += `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-wrap:wrap; gap:8px;">
            <h4 class="achieve-heading" style="margin-bottom:0;"><i class="fa-solid fa-star text-gold"></i> Term Academic Recognition (PL & DL)</h4>
            <button class="btn btn-gold btn-sm" onclick="computeAllSemesters()" title="Compute GPA for all semesters at once">
                <i class="fa-solid fa-calculator"></i> Compute All
            </button>
        </div>
    `;
    
    let totalPL = 0;
    let totalDL = 0;

    if (semesters.length === 0) {
        html += `<p class="text-muted" style="font-size:0.9rem;">No semesters available to evaluate.</p>`;
    } else {
        html += `<div class="term-recog-list">`;
        semesters.forEach((sem, idx) => {
            if (!sem.computed) {
                html += `<div class="term-recog-item">`;
                html += `<div><strong>${escapeHtml(sem.title)}</strong> <span class="term-gpa-tag" style="background:var(--card-header-bg); color:var(--text-secondary);">Awaiting Computation</span></div>`;
                html += `<button class="btn btn-gold btn-sm" style="padding:3px 10px; font-size:0.78rem;" onclick="openSemesterComputeModal(${idx})"><i class="fa-solid fa-calculator"></i> Compute GPA</button>`;
                html += `</div>`;
                return;
            }

            const semGWA = calculateSemesterGWA(sem);
            const semUnits = calculateSemesterUnits(sem);
            
            let lowestGradeInSem = 1.0;
            let hasFailOrInc = false;
            
            if (sem.subjects) {
                sem.subjects.forEach(sub => {
                    const num = parseFloat(sub.grade);
                    if (sub.grade === "5.0" || sub.grade === "5.00" || num === 5.0 || sub.grade === "INC") hasFailOrInc = true;
                    if (!isNaN(num) && num > lowestGradeInSem) lowestGradeInSem = num;
                });
            }

            let statusTitle = "Regular Term";
            let statusBadge = "badge-neutral";
            let icon = "fa-minus";

            if (semUnits > 0 && !hasFailOrInc && !sem.underload) {
                if (semGWA <= 1.4500 && lowestGradeInSem <= 1.75) {
                    statusTitle = "President's Lister (PL) 🏆";
                    statusBadge = "badge-pl";
                    icon = "fa-crown";
                    totalPL++;
                } else if (semGWA <= 1.7500 && lowestGradeInSem <= 2.50) {
                    statusTitle = "Dean's Lister (DL) 🌟";
                    statusBadge = "badge-dl";
                    icon = "fa-medal";
                    totalDL++;
                } else if (semGWA > 1.7500 && semGWA <= 1.8500) {
                    const gapToDL = semGWA - 1.7500;
                    statusTitle = `So Close to DL! (Gap: ${gapToDL.toFixed(4)})`;
                    statusBadge = "badge-close";
                    icon = "fa-bullseye";
                }
            } else if (sem.underload) {
                statusTitle = "Underloaded Term";
                statusBadge = "badge-danger";
            }

            html += `<div class="term-recog-item">`;
            html += `<div><strong>${escapeHtml(sem.title)}</strong> <span class="term-gpa-tag">GPA: ${semGWA.toFixed(4)}</span></div>`;
            html += `<span class="recog-pill ${statusBadge}"><i class="fa-solid ${icon}"></i> ${statusTitle}</span>`;
            html += `</div>`;
        });
        html += `</div>`;
    }
    html += `</div>`;

    // 3. Unlockable Achievement Badges
    html += `<div class="achieve-section" style="margin-top:20px;">`;
    html += `<h4 class="achieve-heading"><i class="fa-solid fa-shield-cat text-primary"></i> Achievement Badges</h4>`;
    html += `<div class="badges-grid">`;

    // Badge 1: Scholar Power
    const isScholar = (totalPL + totalDL) > 0;
    html += `<div class="badge-box ${isScholar ? 'unlocked' : 'locked'}">`;
    html += `<i class="fa-solid fa-graduation-cap badge-icon"></i>`;
    html += `<div class="badge-title">Honor Scholar</div>`;
    html += `<div class="badge-desc">${isScholar ? `Achieved ${totalPL} PL & ${totalDL} DL terms!` : 'Earn at least 1 PL or DL term'}</div></div>`;

    // Badge 2: Perfect Streak
    const isPerfect = stats.cumulativeGWA > 0 && stats.cumulativeGWA <= 1.25;
    html += `<div class="badge-box ${isPerfect ? 'unlocked' : 'locked'}">`;
    html += `<i class="fa-solid fa-fire badge-icon"></i>`;
    html += `<div class="badge-title">Straight A Phenom</div>`;
    html += `<div class="badge-desc">${isPerfect ? 'Maintained GWA ≤ 1.25!' : 'Achieve GWA ≤ 1.25'}</div></div>`;

    // Badge 3: Clean Record
    const isClean = stats.totalUnits > 0 && stats.failingCount === 0 && !stats.hasInc;
    html += `<div class="badge-box ${isClean ? 'unlocked' : 'locked'}">`;
    html += `<i class="fa-solid fa-shield-check badge-icon"></i>`;
    html += `<div class="badge-title">Zero Deficiencies</div>`;
    html += `<div class="badge-desc">${isClean ? '100% clean academic record!' : 'No 5.0 or INC marks'}</div></div>`;

    // Badge 4: Full Load Warrior
    const isFullLoad = stats.totalUnits >= 18 && !stats.hasUnderload;
    html += `<div class="badge-box ${isFullLoad ? 'unlocked' : 'locked'}">`;
    html += `<i class="fa-solid fa-dumbbell badge-icon"></i>`;
    html += `<div class="badge-title">Full Load Warrior</div>`;
    html += `<div class="badge-desc">${isFullLoad ? 'Completed ≥18 units full load!' : 'Complete ≥18 units without underload'}</div></div>`;

    html += `</div></div>`;

    container.innerHTML = html;
}
