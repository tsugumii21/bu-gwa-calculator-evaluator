// Bicol University GWA Calculator — Main Initialization Entry Point

function initWelcomeScreen() {
    const welcomeScreen = document.getElementById("welcome-screen");
    if (!welcomeScreen) return;
    if (localStorage.getItem("bu_welcome_dismissed") === "true") {
        welcomeScreen.style.display = "none";
        return;
    }
    welcomeScreen.style.display = "flex";
}

function dismissWelcomeScreen() {
    const welcomeScreen = document.getElementById("welcome-screen");
    const welcomeCard = welcomeScreen ? welcomeScreen.querySelector(".welcome-card") : null;

    localStorage.setItem("bu_welcome_dismissed", "true");

    if (welcomeCard) {
        welcomeCard.classList.add("animate__animated", "animate__zoomOut", "animate__faster");
    }

    if (welcomeScreen) {
        welcomeScreen.classList.add("animate__animated", "animate__fadeOut", "animate__faster");
        setTimeout(() => {
            welcomeScreen.style.display = "none";
        }, 400);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    initWelcomeScreen();
    initTheme();
    initTabs();
    initSimulator();
    initScholarshipMonitor();
    loadSavedData();
});
