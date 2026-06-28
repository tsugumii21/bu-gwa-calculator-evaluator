// Bicol University GWA Calculator — Theme Controller

function initTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY);
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    const activeTheme = savedTheme ? savedTheme : "light";
    document.documentElement.setAttribute("data-theme", activeTheme);
    updateThemeIcon(activeTheme);

    const toggleBtn = document.getElementById("btn-theme-toggle");
    if (toggleBtn) {
        toggleBtn.addEventListener("click", toggleTheme);
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";

    // Enable smooth transition animation
    document.documentElement.classList.add("theme-transitioning");

    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
    updateThemeIcon(newTheme);

    // Re-evaluate scholarship status colors for the new theme
    if (typeof evaluateScholarship === "function") {
        evaluateScholarship();
    }

    // Remove transition class after animation completes
    setTimeout(() => {
        document.documentElement.classList.remove("theme-transitioning");
    }, 350);
}

function updateThemeIcon(theme) {
    const icon = document.querySelector("#btn-theme-toggle i");
    if (icon) {
        if (theme === "dark") {
            icon.className = "fa-solid fa-sun";
            icon.style.color = "#fbbf24";
        } else {
            icon.className = "fa-solid fa-moon";
            icon.style.color = "#ffffff";
        }
    }
}
