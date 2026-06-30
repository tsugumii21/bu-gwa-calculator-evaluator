// Bicol University GWA Calculator — CRUD Actions with Deletion Animations

let pendingDeleteAction = null;

function addNewSemester() {
    localStorage.removeItem("bu_gwa_cleared");
    const semNumber = semesters.length + 1;
    const year = Math.ceil(semNumber / 2);
    const term = semNumber % 2 === 1 ? "1st Semester" : "2nd Semester";
    
    semesters.push({
        title: `Year ${year} - ${term}`,
        underload: false,
        computed: false,
        subjects: [
            { code: "", name: "", grade: "", units: "" },
            { code: "", name: "", grade: "", units: "" },
            { code: "", name: "", grade: "", units: "" }
        ]
    });
    renderSemesters();
    saveData();
    updateGlobalSummary();
}

function showDeleteModal(message, onConfirm) {
    const modal = document.getElementById("delete-confirm-modal");
    const msgElem = document.getElementById("delete-confirm-msg");
    const confirmBtn = document.getElementById("btn-confirm-delete-action");

    if (msgElem) msgElem.innerText = message;
    pendingDeleteAction = onConfirm;

    if (confirmBtn) {
        confirmBtn.onclick = () => {
            if (pendingDeleteAction) pendingDeleteAction();
            closeDeleteModal();
        };
    }

    if (modal) {
        modal.style.display = "flex";
        const content = modal.querySelector(".modal-content");
        if (content) {
            content.classList.remove("animate__zoomOut", "animate__shakeX");
            void content.offsetWidth; // Trigger reflow
            content.classList.add("animate__shakeX");
        }
    }
}

function closeDeleteModal() {
    const modal = document.getElementById("delete-confirm-modal");
    if (modal) {
        modal.style.display = "none";
    }
    pendingDeleteAction = null;
}

function removeSemester(index) {
    showDeleteModal("Are you sure you want to remove this semester and all its courses?", () => {
        const cards = document.querySelectorAll(".semester-card");
        if (cards[index]) {
            cards[index].classList.add("animate__animated", "animate__fadeOutLeft", "animate__faster");
            setTimeout(() => {
                semesters.splice(index, 1);
                renderSemesters();
                saveData();
                updateGlobalSummary();
            }, 300);
        } else {
            semesters.splice(index, 1);
            renderSemesters();
            saveData();
            updateGlobalSummary();
        }
    });
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
        semesters[index].computed = false;
        saveData();
        updateGlobalSummary();
    }
}

function addSubject(semIndex) {
    if (semesters[semIndex]) {
        if (!semesters[semIndex].subjects) semesters[semIndex].subjects = [];
        semesters[semIndex].subjects.push({ code: "", name: "", grade: "", units: "" });
        semesters[semIndex].computed = false;
        renderSemesters();
        saveData();
        updateGlobalSummary();
    }
}

function removeSubject(semIndex, subIndex) {
    if (semesters[semIndex] && semesters[semIndex].subjects) {
        semesters[semIndex].subjects.splice(subIndex, 1);
        semesters[semIndex].computed = false;
        renderSemesters();
        saveData();
        updateGlobalSummary();
    }
}

function updateSubject(semIndex, subIndex, field, val) {
    if (semesters[semIndex] && semesters[semIndex].subjects && semesters[semIndex].subjects[subIndex]) {
        semesters[semIndex].subjects[subIndex][field] = val;
        semesters[semIndex].computed = false;
        saveData();
        updateSemesterUnitsDisplay(semIndex);
        updateGlobalSummary();
    }
}

function updateSemesterUnitsDisplay(semIndex) {
    const cards = document.querySelectorAll(".semester-card");
    if (cards[semIndex]) {
        const sem = semesters[semIndex];
        const semUnits = calculateSemesterUnits(sem);
        const unitsElem = cards[semIndex].querySelector(".sem-total-units");
        if (unitsElem) {
            unitsElem.innerText = `Total Units: ${Math.round(semUnits)}`;
        }
    }
}

function loadCollegePreset(presetKey, confirmUser = true) {
    localStorage.removeItem("bu_gwa_cleared");
    if (confirmUser && semesters.length > 0) {
        showDeleteModal("Loading a preset will replace your current entries. Continue?", () => {
            const preset = COLLEGE_PRESETS[presetKey];
            if (preset) {
                semesters = JSON.parse(JSON.stringify(preset));
                semesters.forEach(s => s.computed = false);
                renderSemesters();
                saveData();
                updateGlobalSummary();
            }
        });
    } else {
        const preset = COLLEGE_PRESETS[presetKey];
        if (preset) {
            semesters = JSON.parse(JSON.stringify(preset));
            semesters.forEach(s => s.computed = false);
            renderSemesters();
            saveData();
            updateGlobalSummary();
        }
    }
}

function confirmResetAll() {
    showDeleteModal("Are you sure you want to clear all semesters and courses? This cannot be undone.", () => {
        localStorage.setItem("bu_gwa_cleared", "true");
        const container = document.getElementById("semesters-container");
        if (container) {
            container.classList.add("animate__animated", "animate__fadeOutDown", "animate__faster");
            setTimeout(() => {
                container.classList.remove("animate__animated", "animate__fadeOutDown", "animate__faster");
                semesters = [];
                renderSemesters();
                saveData();
                updateGlobalSummary();
            }, 300);
        } else {
            semesters = [];
            renderSemesters();
            saveData();
            updateGlobalSummary();
        }
    });
}
