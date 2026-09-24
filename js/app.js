// Bicol University GWA Calculator — Main Initialization Entry Point

function initWelcomeScreen() {
    const welcomeScreen = document.getElementById("welcome-screen");
    if (!welcomeScreen) return;
    if (localStorage.getItem("bu_welcome_dismissed") === "true") {
        welcomeScreen.classList.add("hidden");
        welcomeScreen.style.setProperty("display", "none", "important");
        welcomeScreen.style.pointerEvents = "none";
        return;
    }
    welcomeScreen.classList.remove("hidden");
    welcomeScreen.style.setProperty("display", "flex", "important");
    welcomeScreen.style.pointerEvents = "auto";
}

function dismissWelcomeScreen() {
    const welcomeScreen = document.getElementById("welcome-screen");
    const welcomeCard = welcomeScreen ? welcomeScreen.querySelector(".welcome-card") : null;

    localStorage.setItem("bu_welcome_dismissed", "true");

    if (welcomeCard) {
        welcomeCard.classList.add("animate__animated", "animate__zoomOut", "animate__faster");
    }

    if (welcomeScreen) {
        welcomeScreen.style.pointerEvents = "none";
        welcomeScreen.classList.add("animate__animated", "animate__fadeOut", "animate__faster");
        setTimeout(() => {
            welcomeScreen.classList.add("hidden");
            welcomeScreen.style.setProperty("display", "none", "important");
            welcomeScreen.style.visibility = "hidden";
        }, 350);
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
