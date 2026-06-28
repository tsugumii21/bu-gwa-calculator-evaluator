// Bicol University GWA Calculator — Pure PDF Document Scanner & PDF Exporter

// Export Academic Summary as PDF (triggers print / save as PDF dialog)
function exportToPDF() {
    const stats = typeof calculateCumulativeStats === "function" ? calculateCumulativeStats() : null;
    const gwaElem = document.getElementById("print-gwa-val");
    const unitsElem = document.getElementById("print-units-val");
    const dateElem = document.getElementById("print-date-val");

    if (gwaElem && stats) gwaElem.innerText = stats.cumulativeGWA.toFixed(4);
    if (unitsElem && stats) unitsElem.innerText = stats.totalUnits.toFixed(1);
    if (dateElem) dateElem.innerText = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

    window.print();
}

// Trigger PDF file picker for COR Document Scanning (PDF only)
function importDocument() {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".pdf";
    
    fileInput.onchange = async e => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
            alert("Please select a valid PDF document (.pdf). Image scanning is not supported.");
            return;
        }

        showScanLoading(true, `Reading ${file.name}...`);

        try {
            await processPDFDocument(file);
        } catch (err) {
            alert("Could not read PDF document. Please ensure it is a valid Bicol University Certificate of Registration (COR) PDF file.");
        } finally {
            showScanLoading(false);
        }
    };

    fileInput.click();
}

// Process PDF files using PDF.js text extraction
async function processPDFDocument(file) {
    showScanLoading(true, "Parsing PDF Document...");

    const arrayBuffer = await file.arrayBuffer();
    
    if (typeof pdfjsLib === "undefined") {
        throw new Error("PDF.js library not loaded");
    }

    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let extractedText = "";

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        showScanLoading(true, `Extracting Page ${pageNum} of ${pdf.numPages}...`);
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        let lastY = null;
        let pageText = "";
        textContent.items.forEach(item => {
            if (lastY !== null && Math.abs(item.transform[5] - lastY) > 5) {
                pageText += "\n";
            } else if (pageText.length > 0 && !pageText.endsWith("\n") && !pageText.endsWith(" ")) {
                pageText += " ";
            }
            pageText += item.str;
            lastY = item.transform[5];
        });

        extractedText += pageText + "\n";
    }

    parseExtractedText(extractedText, file.name);
}

// Pure BU COR PDF Text Parser using Unit Anchor Backwards Search
function parseExtractedText(text, filename) {
    if (!text || text.trim().length === 0) {
        alert("No readable text could be extracted from the PDF file.");
        return;
    }

    const newSubjects = [];
    let semesterTitle = "Scanned COR";

    // 1. Extract Semester Title (e.g., "AY 2025-2026 2nd Semester")
    const syMatch = text.match(/School Year:\s*(AY\s*[\d-]+\s*[\d\w\s]+Semester)/i) || text.match(/(AY\s*\d{4}-\d{4}\s*\d(?:st|nd|rd|th)?\s*Semester)/i);
    if (syMatch) {
        semesterTitle = syMatch[1].trim();
    }

    // 2. Isolate SCHEDULE section text and collapse line breaks into spaces
    let scheduleText = text;
    const schedStart = text.search(/SCHEDULE/i);
    const schedEnd = text.search(/TOTALS:|ASSESSED FEES/i);

    if (schedStart !== -1) {
        if (schedEnd !== -1 && schedEnd > schedStart) {
            scheduleText = text.substring(schedStart, schedEnd);
        } else {
            scheduleText = text.substring(schedStart);
        }
    }

    const cleanSchedule = scheduleText.replace(/\r?\n|\r/g, " ");

    // Known BU Course prefix codes
    const knownPrefixes = ["IT ELECT", "GE ELECT", "FREE ELECT", "IT", "GEC", "CS", "MATH", "CHEM", "ENG", "NURS", "EDUC", "BM", "ACT", "NSTP", "PE", "PHYS"];

    // 3. Locate each subject row by finding unit anchors: "3.0 2.0 1.0 BSIT-P-3A" or "3.0 3.0 0.0 BSIT-P-3A"
    const anchorRegex = /(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s+([A-Z]{2,6}-[A-Z0-9-]+)/gi;

    let aMatch;
    while ((aMatch = anchorRegex.exec(cleanSchedule)) !== null) {
        const creditUnits = parseFloat(aMatch[1]) || 3;
        const anchorIndex = aMatch.index;

        // Inspect text leading up to this unit anchor
        const textBeforeAnchor = cleanSchedule.substring(0, anchorIndex);

        // Search backwards for the last occurrence of a course code matching BU prefixes
        const codeRegex = /(?:IT\s+Elect|GE\s+Elect|FREE\s+Elect|[A-Z]{2,6})\s+\d+[A-Z]?/gi;
        let lastCodeMatch = null;
        let cMatch;
        
        while ((cMatch = codeRegex.exec(textBeforeAnchor)) !== null) {
            const upper = cMatch[0].toUpperCase();
            if (knownPrefixes.some(p => upper.startsWith(p))) {
                lastCodeMatch = {
                    code: cMatch[0].trim().toUpperCase(),
                    index: cMatch.index,
                    endIndex: cMatch.index + cMatch[0].length
                };
            }
        }

        if (lastCodeMatch) {
            // Course description is the exact text between the code end index and unit anchor start index
            let name = textBeforeAnchor.substring(lastCodeMatch.endIndex, anchorIndex).trim();
            
            // Clean up unwanted artifacts
            name = name.replace(/^Subject\s+/i, "").replace(/^Code\s+/i, "").trim();

            newSubjects.push({
                code: lastCodeMatch.code,
                name: name || "Scanned Course",
                grade: "1.5",
                units: creditUnits
            });
        }
    }

    // 4. Fallback if anchors were not detected
    if (newSubjects.length === 0) {
        const lines = text.split("\n");
        lines.forEach(line => {
            const trimmed = line.trim();
            if (!trimmed) return;
            const lMatch = trimmed.match(/([A-Z]{2,6}(?:\s+[A-Z0-9]+)?)\s+(.+?)\s+(\d+(?:\.\d+)?)/i);
            if (lMatch && lMatch[1].length <= 10 && !lMatch[1].includes("ROOM") && !lMatch[1].includes("CLASS")) {
                newSubjects.push({
                    code: lMatch[1].trim().toUpperCase(),
                    name: lMatch[2].trim(),
                    grade: "1.5",
                    units: parseFloat(lMatch[3]) || 3
                });
            }
        });
    }

    // 5. Commit extracted subjects to state
    if (newSubjects.length > 0) {
        semesters.push({
            title: semesterTitle,
            underload: false,
            subjects: newSubjects
        });
        renderSemesters();
        saveData();
        showImportSuccessModal(newSubjects.length, semesterTitle);
    } else {
        alert("Could not automatically parse course schedule from PDF. You can also use the 'Bulk Paste' option.");
    }
}

function showImportSuccessModal(count, title) {
    const modal = document.getElementById("import-success-modal");
    const desc = document.getElementById("import-success-desc");
    if (desc) {
        desc.innerText = `Successfully imported ${count} courses from PDF for "${title}"!`;
    }
    if (modal) {
        modal.style.display = "flex";
    }
}

function closeImportSuccessModal() {
    const modal = document.getElementById("import-success-modal");
    if (modal) {
        modal.style.display = "none";
    }
}

// Show/Hide Scan Progress Spinner overlay
function showScanLoading(show, message = "Processing PDF...") {
    let loadingOverlay = document.getElementById("scan-loading-overlay");
    
    if (!loadingOverlay) {
        loadingOverlay = document.createElement("div");
        loadingOverlay.id = "scan-loading-overlay";
        loadingOverlay.className = "modal-overlay";
        loadingOverlay.style.zIndex = "300";
        loadingOverlay.innerHTML = `
            <div class="modal-content" style="max-width: 360px; text-align: center; padding: 24px;">
                <i class="fa-solid fa-circle-notch fa-spin text-primary" style="font-size: 2.5rem; margin-bottom: 16px;"></i>
                <h4 id="scan-loading-msg" style="font-family: var(--font-display); font-size: 1.1rem; font-weight: 700;">Processing PDF...</h4>
                <p style="font-size: 0.82rem; color: var(--text-secondary); margin-top: 8px;">Parsing BU COR Certificate of Registration</p>
            </div>
        `;
        document.body.appendChild(loadingOverlay);
    }

    const msgElem = document.getElementById("scan-loading-msg");
    if (msgElem) msgElem.innerText = message;

    loadingOverlay.style.display = show ? "flex" : "none";
}

// Bulk Schedule Text Paste Importer
function openBulkPasteModal() {
    const modal = document.getElementById("bulk-paste-modal");
    if (modal) modal.style.display = "flex";
}

function closeBulkPasteModal() {
    const modal = document.getElementById("bulk-paste-modal");
    if (modal) modal.style.display = "none";
}

function insertDummyBulkPaste() {
    const textElem = document.getElementById("bulk-paste-textarea");
    if (!textElem) return;
    textElem.value = `CS 111 - Introduction to Computing - 3 - 1.2\nGEC 11 - Understanding the Self - 3 - 1.5\nGEC 14 - Mathematics in the Modern World - 3 - 1.0\nMATH 111 - Calculus 1 - 4 - 1.7\nNSTP 1 - National Service Training Program 1 - 3 - 1.2\nPE 1 - Physical Fitness and Wellness - 2 - 1.0`;
}

function processBulkPaste() {
    const textElem = document.getElementById("bulk-paste-textarea");
    if (!textElem) return;

    const rawText = textElem.value.trim();
    if (!rawText) {
        closeBulkPasteModal();
        return;
    }

    const lines = rawText.split("\n");
    const newSubjects = [];
    const validGrades = ["1.0", "1.1", "1.2", "1.3", "1.4", "1.5", "1.6", "1.7", "1.8", "1.9", "2.0", "2.1", "2.2", "2.3", "2.4", "2.5", "2.6", "2.7", "2.8", "2.9", "3.0", "4.0", "5.0", "INC", "DRP"];

    lines.forEach(line => {
        const trimmed = line.trim();
        if (!trimmed) return;

        let code = "", name = "", grade = "1.5", units = 3;
        let parts = [];

        if (trimmed.includes("-")) {
            parts = trimmed.split("-").map(p => p.trim());
        } else if (trimmed.includes("\t")) {
            parts = trimmed.split("\t").map(p => p.trim());
        } else if (trimmed.includes(",")) {
            parts = trimmed.split(",").map(p => p.trim());
        } else {
            parts = [trimmed];
        }

        if (parts.length >= 1) code = parts[0];
        if (parts.length >= 2) name = parts[1];

        if (parts.length === 3) {
            const p2 = parts[2].toUpperCase();
            if (validGrades.includes(p2)) {
                grade = p2;
            } else {
                units = parseFloat(parts[2]) || 3;
            }
        } else if (parts.length >= 4) {
            const p2 = parts[2].toUpperCase();
            const p3 = parts[3].toUpperCase();

            if (validGrades.includes(p2)) {
                grade = p2;
                units = parseFloat(parts[3]) || 3;
            } else if (validGrades.includes(p3)) {
                units = parseFloat(parts[2]) || 3;
                grade = p3;
            } else {
                units = parseFloat(parts[2]) || 3;
                grade = parts[3];
            }
        }

        newSubjects.push({ code, name, grade, units });
    });

    if (newSubjects.length > 0) {
        semesters.push({
            title: `Bulk Imported (${newSubjects.length} Courses)`,
            underload: false,
            subjects: newSubjects
        });
        renderSemesters();
        saveData();
    }

    textElem.value = "";
    closeBulkPasteModal();
}
