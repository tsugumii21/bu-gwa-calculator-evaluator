// Bicol University GWA Calculator — Central State & Persistence

let semesters = [];
const STORAGE_KEY = "bu_gwa_semesters";
const THEME_KEY = "bu_gwa_theme";

function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(semesters));
    updateGlobalSummary();
}

function loadSavedData() {
    const saved = localStorage.getItem(STORAGE_KEY);
    const cleared = localStorage.getItem("bu_gwa_cleared");
    if (saved) {
        try {
            semesters = JSON.parse(saved);
            if (Array.isArray(semesters)) {
                semesters.forEach(sem => {
                    if (sem.computed === undefined) {
                        sem.computed = false;
                    }
                });
            }
        } catch (e) {
            semesters = [];
        }
    }
    
    if ((!semesters || !Array.isArray(semesters) || semesters.length === 0) && cleared !== "true") {
        loadCollegePreset('BUCS', false);
    } else {
        renderSemesters();
        updateGlobalSummary();
    }
}
