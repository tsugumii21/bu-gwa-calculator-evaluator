// Bicol University GWA Calculator — Pure Utility Helpers

function escapeHtml(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function showUnderloadInfo() {
    const modal = document.getElementById("underload-info-modal");
    const body = document.getElementById("underload-modal-body");
    const quote = typeof getHonorMessage === "function" ? getHonorMessage("NOT_LAUDE") : "\"Keep pushing your limits!\"";
    
    if (body) {
        body.innerHTML = `
            <div class="achieve-section" style="margin-bottom: 0;">
                <div style="display: flex; align-items: center; gap: 8px; padding: 8px 14px; background: rgba(234,88,12,0.1); border: 1px solid rgba(234,88,12,0.3); border-radius: var(--radius-sm); font-size: 0.82rem; color: var(--bu-orange); font-weight: 700; margin-bottom: 14px;">
                    <i class="fa-solid fa-book"></i> BU Student Handbook Reference: Article VIII, Section 30 (Page 36)
                </div>

                <div class="about-hero-box" style="padding: 16px 20px; background: var(--card-bg); border: 1px solid var(--border-color); border-radius: var(--radius-md); margin-bottom: 16px;">
                    <p style="font-size: 0.92rem; line-height: 1.6; color: var(--text-primary); margin: 0;">
                        An <strong>underloaded term</strong> means enrolling in fewer credit units than the regular required academic load prescribed in your curriculum for that specific semester.
                    </p>
                </div>

                <div class="achieve-card alert-card-danger" style="margin-bottom: 16px;">
                    <div class="achieve-icon"><i class="fa-solid fa-triangle-exclamation text-danger" style="font-size: 1.8rem;"></i></div>
                    <div class="achieve-details">
                        <strong style="font-size: 1rem; color: var(--color-danger);">📌 Official Disqualification Rule (Art. VIII, Sec. 30):</strong>
                        <span class="achieve-subtext" style="display: block; margin-top: 4px; line-height: 1.55; color: var(--text-primary);">
                            Carrying an underloaded term officially <strong>disqualifies</strong> a student candidate from <strong>Graduation Latin Honors</strong> (Summa, Magna, or Cum Laude) and <strong>Semester Academic Recognition</strong> (President's Lister or Dean's Lister).
                        </span>
                    </div>
                </div>

                <div class="quote-box" style="margin-top: 0;">
                    <i class="fa-solid fa-quote-left quote-icon"></i>
                    <div class="quote-text">💡 <strong>Motivational Reminder:</strong><br>${quote}</div>
                </div>
            </div>
        `;
    }

    if (modal) {
        modal.style.display = "flex";
    }
}

function closeUnderloadInfoModal() {
    const modal = document.getElementById("underload-info-modal");
    if (modal) modal.style.display = "none";
}

function showInfoModal(type) {
    const modal = document.getElementById("card-info-modal");
    const titleElem = document.getElementById("card-info-title");
    const bodyElem = document.getElementById("card-info-body");

    if (!modal || !bodyElem || !titleElem) return;

    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    const clrBlue = isDark ? "#60a5fa" : "var(--bu-blue)";
    const clrAzure = isDark ? "#38bdf8" : "var(--bu-azure)";
    const clrGold = isDark ? "#fbbf24" : "#b45309";
    const clrOrange = isDark ? "#fb923c" : "#c2410c";
    const clrDanger = isDark ? "#f87171" : "var(--color-danger)";
    const clrSuccess = isDark ? "#34d399" : "var(--color-success)";
    const clrDeanBlue = isDark ? "#60a5fa" : "#1d4ed8";
    const clrText = isDark ? "#cbd5e1" : "var(--text-secondary)";
    const clrWarnText = isDark ? "#fbbf24" : "#b45309";

    if (type === "gwa") {
        titleElem.innerHTML = `<i class="fa-solid fa-chart-line text-primary"></i> Cumulative General Weighted Average (GWA)`;
        bodyElem.innerHTML = `
            <div class="achieve-section" style="margin-bottom:0;">
                <div style="display: flex; align-items: center; gap: 8px; padding: 8px 14px; background: rgba(37,99,235,0.1); border: 1px solid rgba(37,99,235,0.25); border-radius: var(--radius-sm); font-size: 0.82rem; color: ${clrAzure}; font-weight: 700; margin-bottom: 14px;">
                    <i class="fa-solid fa-book"></i> Bicol University Student Handbook: Article VI, Section 13–15 (Page 28)
                </div>
                <p style="font-size:0.92rem; line-height:1.6; color:var(--text-primary); margin-bottom:14px;">
                    The <strong>Cumulative GWA</strong> represents your overall weighted academic average across all courses taken at Bicol University per official academic policies (BOR Res. 89 s. 2006).
                </p>
                <div style="padding:14px; background:var(--card-header-bg); border: 1px solid var(--border-color); border-radius:var(--radius-md); font-family:var(--font-display); font-size:0.88rem; margin-bottom:14px;">
                    <strong style="color: ${clrBlue};">🧮 Weighted Math Formula:</strong><br>
                    <code style="display: block; margin-top: 6px; padding: 6px 10px; background: var(--card-bg); border-radius: 4px; border: 1px solid var(--border-color); color: var(--text-primary);">GWA = ∑ (Grade Rating × Credit Units) / ∑ (Credit Units)</code>
                </div>
                <ul style="font-size:0.86rem; color:${clrText}; line-height:1.6; padding-left:18px; margin:0;">
                    <li>Calculated and rounded to <strong>4 decimal places</strong> per official university policy.</li>
                    <li>Excludes non-numerical marks such as <strong>INC</strong> (Incomplete) and <strong>DRP</strong> (Dropped).</li>
                    <li>Serves as the primary evaluation metric for graduation Latin Honors and academic honors.</li>
                </ul>
            </div>
        `;
    } else if (type === "honor") {
        titleElem.innerHTML = `<i class="fa-solid fa-medal text-gold"></i> Semester Honor Qualification (PL & DL)`;
        bodyElem.innerHTML = `
            <div class="achieve-section" style="margin-bottom:0;">
                <div style="display: flex; align-items: center; gap: 8px; padding: 8px 14px; background: rgba(245,158,11,0.12); border: 1px solid rgba(245,158,11,0.3); border-radius: var(--radius-sm); font-size: 0.82rem; color: ${clrGold}; font-weight: 700; margin-bottom: 14px;">
                    <i class="fa-solid fa-book"></i> Bicol University Student Handbook: Article VIII, Section 28–29 (Page 34–35)
                </div>
                <p style="font-size:0.92rem; line-height:1.6; color:var(--text-primary); margin-bottom:14px;">
                    Evaluates your term eligibility for semester academic recognition per Bicol University academic policies:
                </p>
                <div class="table-responsive" style="margin-bottom:14px;">
                    <table style="width:100%; border-collapse:collapse; font-size:0.84rem;">
                        <thead>
                            <tr style="background:var(--card-header-bg); border-bottom:2px solid var(--border-color); text-align:left;">
                                <th style="padding:8px 10px; color:${clrText};">Honor Level</th>
                                <th style="padding:8px 10px; color:${clrText};">GPA Cutoff</th>
                                <th style="padding:8px 10px; color:${clrText};">Individual Grade Cap</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style="border-bottom:1px solid var(--border-color);">
                                <td style="padding:8px 10px; font-weight:700; color:${clrGold}; white-space:nowrap;">🏆 President's Lister (PL)</td>
                                <td style="padding:8px 10px; color:var(--text-primary);"><strong>1.0000 – 1.4500</strong></td>
                                <td style="padding:8px 10px; color:var(--text-primary);"><strong>Max 1.75</strong> (No grade below 1.75)</td>
                            </tr>
                            <tr style="border-bottom:1px solid var(--border-color);">
                                <td style="padding:8px 10px; font-weight:700; color:${clrDeanBlue}; white-space:nowrap;">🌟 Dean's Lister (DL)</td>
                                <td style="padding:8px 10px; color:var(--text-primary);"><strong>1.4600 – 1.7500</strong></td>
                                <td style="padding:8px 10px; color:var(--text-primary);"><strong>Max 2.50</strong> (No grade below 2.50)</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div style="padding: 10px 14px; background: rgba(234,88,12,0.06); border-left: 4px solid var(--bu-orange); border-radius: 4px; font-size: 0.84rem; color: var(--text-primary);">
                    <strong>📌 Essential Requirement (Art. VIII, Sec. 30):</strong> Candidate must carry a full regular academic load with zero failing marks (5.0) or unresolved INC grades.
                </div>
            </div>
        `;
    } else if (type === "standing") {
        titleElem.innerHTML = `<i class="fa-solid fa-shield-halved text-success"></i> Scholastic Academic Standing`;
        bodyElem.innerHTML = `
            <div class="achieve-section" style="margin-bottom:0;">
                <div style="display: flex; align-items: center; gap: 8px; padding: 8px 14px; background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.25); border-radius: var(--radius-sm); font-size: 0.82rem; color: ${clrSuccess}; font-weight: 700; margin-bottom: 14px;">
                    <i class="fa-solid fa-book"></i> Bicol University Student Handbook: Article VII, Section 21–24 (Page 31–32)
                </div>
                <p style="font-size:0.92rem; line-height:1.6; color:var(--text-primary); margin-bottom:14px;">
                    Monitors official scholastic standing at Bicol University based on accumulated academic deficiencies (failing grades <strong>5.0</strong> or unresolved <strong>INC</strong> marks):
                </p>
                <div style="display:flex; flex-direction:column; gap:10px; font-size:0.86rem;">
                    <div style="padding:12px; background:rgba(16,185,129,0.08); border-left:4px solid var(--color-success); border-radius:6px;">
                        <strong style="color:${clrSuccess}; font-size: 0.92rem;">🟢 Good Standing (0 Deficiencies):</strong><br>
                        <span style="display:block; margin-top:3px; color:var(--text-primary);">100% clean academic record. Full regular unit loading permitted.</span>
                    </div>
                    <div style="padding:12px; background:rgba(245,158,11,0.08); border-left:4px solid var(--bu-gold); border-radius:6px;">
                        <strong style="color:${clrWarnText}; font-size: 0.92rem;">🟡 Academic Warning (1 Deficiency):</strong><br>
                        <span style="display:block; margin-top:3px; color:var(--text-primary);">Carrying 1 failing mark. Academic load advisory applied for subsequent semester.</span>
                    </div>
                    <div style="padding:12px; background:rgba(239,68,68,0.08); border-left:4px solid var(--color-danger); border-radius:6px;">
                        <strong style="color:${clrDanger}; font-size: 0.92rem;">🔴 Academic Probation (2 Deficiencies):</strong><br>
                        <span style="display:block; margin-top:3px; color:var(--text-primary);">Carrying 2 failing marks. Maximum allowable academic load reduced to 75% per Bicol University rules.</span>
                    </div>
                </div>
            </div>
        `;
    } else if (type === "units") {
        titleElem.innerHTML = `<i class="fa-solid fa-layer-group text-primary"></i> Total Academic Credit Units`;
        bodyElem.innerHTML = `
            <div class="achieve-section" style="margin-bottom:0;">
                <div style="display: flex; align-items: center; gap: 8px; padding: 8px 14px; background: rgba(37,99,235,0.1); border: 1px solid rgba(37,99,235,0.25); border-radius: var(--radius-sm); font-size: 0.82rem; color: ${clrAzure}; font-weight: 700; margin-bottom: 14px;">
                    <i class="fa-solid fa-book"></i> Bicol University Student Handbook: Article V, Section 8–10 (Page 22–24)
                </div>
                <p style="font-size:0.92rem; line-height:1.6; color:var(--text-primary); margin-bottom:12px;">
                    The <strong>Total Units</strong> metric tracks the cumulative sum of credit units earned across all recorded academic semesters.
                </p>
                <ul style="font-size:0.86rem; color:${clrText}; line-height:1.6; padding-left:18px; margin:0;">
                    <li>Monitors curriculum degree completion progress toward graduation requirements.</li>
                    <li>Verifies regular full-time student status each academic year per university standards.</li>
                </ul>
            </div>
        `;
    }

    modal.style.display = "flex";
}

function closeCardInfoModal() {
    const modal = document.getElementById("card-info-modal");
    if (modal) modal.style.display = "none";
}

function submitSuggestion(e) {
    e.preventDefault();
    const nameInput = document.getElementById("sug-name");
    const categoryInput = document.getElementById("sug-category");
    const messageInput = document.getElementById("sug-message");
    const statusMsg = document.getElementById("sug-status-msg");

    const name = (nameInput && nameInput.value.trim()) ? nameInput.value.trim() : "BU Student";
    const category = categoryInput ? categoryInput.value : "General Feedback";
    const message = messageInput ? messageInput.value.trim() : "";

    if (!message) return;

    const subject = encodeURIComponent(`[BU GWA Calculator Suggestion] ${category} from ${name}`);
    const body = encodeURIComponent(`Sender: ${name}\nCategory: ${category}\n\nSuggestion / Message:\n${message}\n\n---\nSent via Bicol University GWA Calculator & Academic Evaluator`);

    const mailtoUrl = `mailto:allendelvalle04@gmail.com?subject=${subject}&body=${body}`;

    window.location.href = mailtoUrl;

    if (statusMsg) {
        statusMsg.style.display = "inline-block";
        statusMsg.style.color = "var(--color-success)";
        statusMsg.innerHTML = `<i class="fa-solid fa-circle-check"></i> Mail client opened! Thank you for your suggestion.`;
        setTimeout(() => {
            if (messageInput) messageInput.value = "";
            statusMsg.style.display = "none";
        }, 5000);
    }
}
