// Bicol University GWA Calculator — DOM Renderer

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

        const semUnits = calculateSemesterUnits(sem);

        semCard.innerHTML = `
            <div class="sem-header">
                <div class="sem-title-group">
                    <input type="text" class="sem-title-select" value="${escapeHtml(sem.title)}" onchange="updateSemTitle(${semIndex}, this.value)" aria-label="Semester Title">
                    <button class="btn btn-gold btn-sm" onclick="openSemesterComputeModal(${semIndex})" title="Compute GPA and Honor Qualification for this semester">
                        <i class="fa-solid fa-calculator"></i> Compute GPA
                    </button>
                    ${getSemesterHonorBadge(sem)}
                </div>
                <div class="sem-actions">
                    <div style="display: flex; align-items: center; gap: 4px;">
                        <label class="underload-toggle" title="Check if student carried less than regular load this semester">
                            <input type="checkbox" ${sem.underload ? "checked" : ""} onchange="toggleUnderload(${semIndex}, this.checked)"> Underloaded Term
                        </label>
                        <button class="underload-info-btn" type="button" onclick="event.stopPropagation(); showUnderloadInfo();" title="What is an Underloaded Term?" aria-label="Underload Info">
                            <i class="fa-solid fa-circle-question"></i>
                        </button>
                    </div>
                    <button class="btn btn-danger btn-sm" onclick="removeSemester(${semIndex})" title="Remove Semester">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            </div>
            <div class="table-responsive">
                <table class="subject-table">
                    <thead>
                        <tr>
                            <th style="width: 22%;">Course Code</th>
                            <th style="width: 43%;">Course Description</th>
                            <th style="width: 17%;">Grade Rating</th>
                            <th style="width: 10%;">Credit Units</th>
                            <th style="width: 8%; text-align: center;">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${sem.subjects ? sem.subjects.map((sub, subIndex) => `
                            <tr>
                                <td><input type="text" list="subject-suggestions" class="form-control-sm" value="${escapeHtml(sub.code)}" placeholder="e.g. CS 111" onchange="updateSubject(${semIndex}, ${subIndex}, 'code', this.value)" aria-label="Course Code"></td>
                                <td><input type="text" class="form-control-sm" value="${escapeHtml(sub.name)}" placeholder="e.g. Computer Programming" onchange="updateSubject(${semIndex}, ${subIndex}, 'name', this.value)" aria-label="Course Description"></td>
                                <td><input type="number" class="form-control-sm" value="${sub.grade}" min="1.0" max="5.0" step="0.1" inputmode="decimal" placeholder="1.0" onchange="updateSubject(${semIndex}, ${subIndex}, 'grade', this.value)" aria-label="Grade Rating"></td>
                                <td><input type="number" class="form-control-sm" value="${sub.units}" min="1" max="12" step="1" inputmode="numeric" onchange="updateSubject(${semIndex}, ${subIndex}, 'units', parseInt(this.value, 10) || 0)" aria-label="Credit Units"></td>
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
                <span class="text-muted" style="font-size: 0.82rem;">Total Units: ${Math.round(semUnits)}</span>
            </div>
        `;
        container.appendChild(semCard);
    });
}

function generateGradeOptions(selectedGrade) {
    return VALID_GRADES.map(g => `<option value="${g.val}" ${g.val === selectedGrade ? "selected" : ""}>${g.label}</option>`).join("");
}

function getSemesterHonorBadge(sem) {
    if (!sem.computed) return "";

    const semGWA = calculateSemesterGWA(sem);
    const semUnits = calculateSemesterUnits(sem);

    if (semUnits === 0) {
        return `<span class="sem-result-pill sem-pill-regular animate__animated animate__fadeIn"><i class="fa-solid fa-calculator"></i> GPA: 0.0000 | No Courses</span>`;
    }

    let lowestGradeInSem = 1.0;
    let hasFailOrInc = false;

    if (sem && sem.subjects) {
        sem.subjects.forEach(sub => {
            const num = parseFloat(sub.grade);
            if (sub.grade === "5.0" || sub.grade === "5.00" || num === 5.0 || sub.grade === "INC") hasFailOrInc = true;
            if (!isNaN(num) && num > lowestGradeInSem) lowestGradeInSem = num;
        });
    }

    let honorCode = "Regular";
    let honorIcon = "fa-user-graduate";
    let pillClass = "sem-pill-regular";

    if (!hasFailOrInc && !sem.underload) {
        if (semGWA <= 1.4500 && lowestGradeInSem <= 1.75) {
            honorCode = "President's Lister 🏆";
            honorIcon = "fa-crown";
            pillClass = "sem-pill-pl";
        } else if (semGWA <= 1.7500 && lowestGradeInSem <= 2.50) {
            honorCode = "Dean's Lister 🌟";
            honorIcon = "fa-medal";
            pillClass = "sem-pill-dl";
        }
    } else if (sem.underload) {
        honorCode = "Underloaded";
        honorIcon = "fa-triangle-exclamation";
        pillClass = "sem-pill-warning";
    } else if (hasFailOrInc) {
        honorCode = "Not Eligible";
        honorIcon = "fa-circle-xmark";
        pillClass = "sem-pill-danger";
    }

    return `
        <span class="sem-result-pill ${pillClass} animate__animated animate__fadeIn">
            <i class="fa-solid ${honorIcon}"></i> GPA: <strong>${semGWA.toFixed(4)}</strong> &nbsp;•&nbsp; <strong>${honorCode}</strong>
        </span>
    `;
}
