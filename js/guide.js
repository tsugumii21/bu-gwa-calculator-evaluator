// Bicol University GWA Calculator — Guide Tab & Capabilities Interactive Logic

// 1. Mobile Accordion Toggle for Core Platform Capabilities
function toggleCapabilitiesAccordion(headerElem) {
    const item = headerElem.parentElement;
    const isActive = item.classList.contains("active");

    // Close all accordion items
    const allItems = document.querySelectorAll(".accordion-item");
    allItems.forEach(i => {
        i.classList.remove("active");
        const panel = i.querySelector(".accordion-panel");
        if (panel) panel.style.maxHeight = null;
    });

    // Toggle clicked item
    if (!isActive) {
        item.classList.add("active");
        const panel = item.querySelector(".accordion-panel");
        if (panel) {
            panel.style.maxHeight = panel.scrollHeight + "px";
        }
    }
}

// 2. Desktop Guide Step Switcher
function setDesktopGuideStep(stepIndex) {
    // Update active button state
    const btns = document.querySelectorAll(".guide-step-btn");
    btns.forEach((btn, idx) => {
        if (idx === stepIndex) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    });

    // Update active mockup canvas preview with slide transition
    const previews = document.querySelectorAll(".guide-mockup-slide");
    previews.forEach((slide, idx) => {
        if (idx === stepIndex) {
            slide.classList.add("active");
        } else {
            slide.classList.remove("active");
        }
    });
}

// 3. Mobile Guide Step Carousel Navigation
let currentMobileStep = 0;

function moveMobileGuideStep(direction) {
    const slides = document.querySelectorAll(".mobile-carousel-slide");
    if (slides.length === 0) return;

    currentMobileStep += direction;

    if (currentMobileStep < 0) {
        currentMobileStep = 0;
    } else if (currentMobileStep >= slides.length) {
        currentMobileStep = slides.length - 1;
    }

    updateMobileCarouselUI();
}

function setMobileGuideStep(stepIndex) {
    currentMobileStep = stepIndex;
    updateMobileCarouselUI();
}

function updateMobileCarouselUI() {
    const track = document.querySelector(".mobile-carousel-track");
    const slides = document.querySelectorAll(".mobile-carousel-slide");
    const dots = document.querySelectorAll(".carousel-dot");
    const prevBtn = document.getElementById("carousel-prev");
    const nextBtn = document.getElementById("carousel-next");

    if (!track || slides.length === 0) return;

    // Apply translation to container track
    const offset = -currentMobileStep * 100;
    track.style.transform = `translateX(${offset}%)`;

    // Update active slide class
    slides.forEach((slide, idx) => {
        if (idx === currentMobileStep) {
            slide.classList.add("active");
        } else {
            slide.classList.remove("active");
        }
    });

    // Update pagination dots
    dots.forEach((dot, idx) => {
        if (idx === currentMobileStep) {
            dot.classList.add("active");
        } else {
            dot.classList.remove("active");
        }
    });

    // Enable/disable navigation buttons
    if (prevBtn) prevBtn.disabled = currentMobileStep === 0;
    if (nextBtn) nextBtn.disabled = currentMobileStep === slides.length - 1;
}

// Initialize on DOM Load if needed
document.addEventListener("DOMContentLoaded", () => {
    // Ensure mobile carousel is centered
    updateMobileCarouselUI();
});
