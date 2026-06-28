// Bicol University GWA Calculator — Main Initialization Entry Point

function initWelcomeScreen() {
    const welcomeScreen = document.getElementById("welcome-screen");
    if (!welcomeScreen) return;
    const seen = sessionStorage.getItem("bu_gwa_welcome_seen");
    if (seen === "true") {
        welcomeScreen.style.display = "none";
    } else {
        welcomeScreen.style.display = "flex";
    }
}

function dismissWelcomeScreen() {
    const welcomeScreen = document.getElementById("welcome-screen");
    const welcomeCard = welcomeScreen ? welcomeScreen.querySelector(".welcome-card") : null;
    const mainContainer = document.querySelector(".main-container");

    if (welcomeCard) {
        welcomeCard.classList.add("animate__animated", "animate__zoomOut", "animate__faster");
    }

    if (welcomeScreen) {
        welcomeScreen.classList.add("animate__animated", "animate__fadeOut", "animate__faster");
        setTimeout(() => {
            welcomeScreen.style.display = "none";
            if (mainContainer) {
                mainContainer.classList.add("animate__animated", "animate__fadeInUp", "animate__faster");
            }
        }, 400);
    }
    sessionStorage.setItem("bu_gwa_welcome_seen", "true");
}

document.addEventListener("DOMContentLoaded", () => {
    initWelcomeScreen();
    initTheme();
    initTabs();
    initSimulator();
    initScholarshipMonitor();
    loadSavedData();
});
