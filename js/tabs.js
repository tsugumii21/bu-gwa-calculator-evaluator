// Bicol University GWA Calculator — Tab Navigation Controller

function initTabs() {
    const tabs = document.querySelectorAll(".nav-tab");
    const menuBtn = document.getElementById("btn-mobile-menu");
    const navbarInner = document.querySelector(".navbar-inner");

    if (menuBtn && navbarInner) {
        menuBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            navbarInner.classList.toggle("mobile-menu-open");
        });

        // Close menu when clicking outside
        document.addEventListener("click", (e) => {
            if (!navbarInner.contains(e.target)) {
                navbarInner.classList.remove("mobile-menu-open");
            }
        });
    }

    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            const target = tab.getAttribute("data-tab");
            activateTab(target);
            if (navbarInner) navbarInner.classList.remove("mobile-menu-open");
        });
    });

    // On refresh, restore the active tab from sessionStorage if available
    const savedTab = sessionStorage.getItem("bu_gwa_active_tab");
    if (savedTab && document.getElementById(savedTab)) {
        activateTab(savedTab);
    }
}

function activateTab(targetTabId) {
    const tabs = document.querySelectorAll(".nav-tab");
    const contents = document.querySelectorAll(".tab-content");

    tabs.forEach(t => {
        if (t.getAttribute("data-tab") === targetTabId) {
            t.classList.add("active");
        } else {
            t.classList.remove("active");
        }
    });

    contents.forEach(c => {
        if (c.id === targetTabId) {
            c.classList.add("active");
        } else {
            c.classList.remove("active");
        }
    });

    sessionStorage.setItem("bu_gwa_active_tab", targetTabId);

    if (targetTabId === "tab-simulator" && typeof updateSimulator === "function") {
        updateSimulator();
    }
    if (targetTabId === "tab-scholarship" && typeof evaluateScholarship === "function") {
        evaluateScholarship();
    }
}

function switchAboutSubtab(subtabId, btnElem) {
    const btns = document.querySelectorAll(".subtab-btn");
    btns.forEach(b => b.classList.remove("active"));
    
    const subtabContents = document.querySelectorAll(".about-subtab-content");
    subtabContents.forEach(c => c.classList.remove("active"));

    if (btnElem) btnElem.classList.add("active");
    const targetElem = document.getElementById(subtabId);
    if (targetElem) targetElem.classList.add("active");
}
