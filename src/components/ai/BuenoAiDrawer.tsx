import React, { useState, useEffect, useRef } from 'react';
import { useSemesterStore } from '../../store';
import { calculateCumulativeStats } from '../../core/gwa-engine';
import { evaluateHonorStanding } from '../../core/honor-rules';
import { BU_HANDBOOK_KNOWLEDGE } from '../../core/handbook-knowledge';

// Rate Limiter constants
const COOLDOWN_SECONDS = 4;
const MAX_REQUESTS_PER_MINUTE = 8;

export const BuenoAiDrawer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');

  // API Key read securely from environment or system config
  const geminiApiKey =
    (import.meta.env.VITE_GEMINI_API_KEY as string) ||
    localStorage.getItem('bu_gemini_api_key') ||
    '';

  const [aiChatMessages, setAiChatMessages] = useState<{ sender: 'user' | 'ai'; text: string }[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Rate Limiting States
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);
  const [requestTimestamps, setRequestTimestamps] = useState<number[]>([]);
  const [rateLimitWarning, setRateLimitWarning] = useState<string>('');

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const semesters = useSemesterStore((s) => s.semesters);
  const stats = calculateCumulativeStats(semesters);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiChatMessages, isAiLoading]);

  // Lock body scroll and set modal-open class when AI drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldownRemaining <= 0) return;
    const timer = setInterval(() => {
      setCooldownRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownRemaining]);

  // System prompt containing full handbook knowledge and student profile
  const buildSystemInstruction = () => {
    const handbookText = BU_HANDBOOK_KNOWLEDGE.map(
      (p) =>
        `[ARTICLE/POLICY: ${p.title}]\nOfficial Reference: ${p.handbookReference}\nSummary: ${p.summary}\nFull Handbook Rule: ${p.details}`
    ).join('\n\n');

    const latin = evaluateHonorStanding(stats);
    const studentContext =
      semesters.length > 0
        ? `Student Current Live Record:
- Cumulative GWA: ${stats.cumulativeGWA.toFixed(4)}
- Graded Units: ${stats.gradedUnits}
- Completed Courses: ${stats.totalCourses}
- Academic Deficiencies: ${stats.hasFailingGrade ? `${stats.failingCount} failing grades (5.00)` : 'None (Zero deficiencies)'}
- Incompletes: ${stats.hasInc ? 'Has INC' : 'None'}
- Underload Status: ${stats.hasUnderload ? 'Has underload in record' : 'Full regular load maintained'}
- Projected Latin Honor: ${latin.label}`
        : 'Student Current Live Record: No semesters recorded yet in calculator.';

    return `You are Bueño AI, the official Academic Advisor and Student Handbook AI Consultant for Bicol University (BU). You are fully online and equipped with the complete official BU Student Handbook.

=== COMPLETE BICOL UNIVERSITY STUDENT HANDBOOK POLICIES ===
${handbookText}

=== CURRENT BUEÑO STUDENT PROFILE ===
${studentContext}

=== STRICT GUARDRAILS & SYSTEM RULES ===
1. IDENTITY & GREETING: Always address the student warmly and respectfully as "Bueño Student". Maintain an encouraging, dignified academic tone reflecting BU's core values: "Scholarship, Leadership, Service, Character".
2. EXCLUSIVE SCOPE: Answer ONLY questions related to Bicol University academic policies, grading system, GWA computation, Latin graduation honors, President's & Dean's Lister, retention & scholastic delinquency, dropping, removal of INC/4.00, course shifting, scholarships, and campus academic life.
3. OFF-TOPIC REFUSAL: If asked about topics outside Bicol University academic life (general programming, gaming, celebrity gossip, creative writing, politics, or unrelated trivia), politely and firmly refuse: "As Bueño AI, I specialize exclusively in Bicol University academic policies, handbook guidelines, and student advising. How can I assist you with your BU academic standing?"
4. ZERO HALLUCINATION: Never invent university resolutions or non-existent rules. Cite specific Handbook articles (e.g., Article IX for Grading, Article X for Term Honors, Article XI for Latin Honors).
5. STRUCTURE & CONCISENESS: Format responses with clean bullet points and bold headers. Keep answers focused, practical, and under 160 words.`;
  };

  const handleAnalyzeGrades = () => {
    if (semesters.length === 0) {
      setAiChatMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'No semesters detected yet! Add your courses in the Calculator tab or scan your COR/grades to receive a personalized academic diagnostic.',
        },
      ]);
      return;
    }

    const latin = evaluateHonorStanding(stats);
    let diagnostics = `📊 **Academic Standing Diagnostic for Bueño Student**:\n\n`;
    diagnostics += `• **Cumulative GWA**: ${stats.cumulativeGWA.toFixed(4)} across ${stats.gradedUnits} graded units (${stats.totalCourses} courses).\n`;
    diagnostics += `• **Latin Honor Standing**: ${latin.label}.\n`;

    if (stats.hasUnderload) {
      diagnostics += `⚠️ **Underloading Risk**: At least one semester carried underloaded units. Per Article XI, unexcused underloading disqualifies from Latin Honors.\n`;
    } else {
      diagnostics += `✅ **Course Load**: Full regular semestral load maintained (minimum 15 units).\n`;
    }

    if (stats.hasFailingGrade) {
      diagnostics += `❌ **Academic Deficiency**: Detected ${stats.failingCount} failing grade(s) (5.00). Per BU Handbook, candidates for honors must have no failing marks.\n`;
    } else if (stats.hasInc) {
      diagnostics += `⚠️ **Incomplete Mark**: Detected INC grade. Remember that INC marks must be completed within 1 calendar year, or they lapse to 5.00!\n`;
    } else {
      diagnostics += `🛡️ **Zero Academic Deficiencies**: Clean record with no failing grades or unremoved INC marks.\n`;
    }

    setAiChatMessages((prev) => [
      ...prev,
      { sender: 'user', text: 'Analyze my current grades and Latin Honor eligibility.' },
      { sender: 'ai', text: diagnostics },
    ]);
  };

  const executeSendPrompt = async (promptText: string) => {
    const trimmed = promptText.trim();
    if (!trimmed || isAiLoading) return;

    // Rate Limiting Check 1: Cooldown
    if (cooldownRemaining > 0) {
      setRateLimitWarning(`Please wait ${cooldownRemaining}s before sending another question.`);
      return;
    }

    // Rate Limiting Check 2: Max requests per minute
    const now = Date.now();
    const recentRequests = requestTimestamps.filter((t) => now - t < 60000);
    if (recentRequests.length >= MAX_REQUESTS_PER_MINUTE) {
      setRateLimitWarning('Rate limit reached: Maximum 8 questions per minute. Please pause for a moment.');
      return;
    }

    setRateLimitWarning('');
    setRequestTimestamps([...recentRequests, now]);
    setCooldownRemaining(COOLDOWN_SECONDS);
    setQuery('');

    // Append user message
    setAiChatMessages((prev) => [...prev, { sender: 'user', text: trimmed }]);

    // Online Gemini API check
    if (!geminiApiKey) {
      setAiChatMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `Bueño AI is configured for full online consultation. Please supply the Gemini API key in the environment to begin live handbook reasoning.`,
        },
      ]);
      return;
    }

    setIsAiLoading(true);
    try {
      const systemInstruction = buildSystemInstruction();

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: systemInstruction }],
            },
            contents: [
              {
                role: 'user',
                parts: [{ text: trimmed }],
              },
            ],
            generationConfig: {
              maxOutputTokens: 500,
              temperature: 0.25, // Strict adherence to handbook
              topP: 0.8,
            },
          }),
        }
      );

      const data = await response.json();

      if (data.error) {
        setAiChatMessages((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: `⚠️ Online Advisor Notice: ${data.error.message || 'API request error. Please verify key quota.'}`,
          },
        ]);
        return;
      }

      const reply =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        'I could not generate an answer. Please rephrase your question.';

      setAiChatMessages((prev) => [...prev, { sender: 'ai', text: reply }]);
    } catch (err) {
      setAiChatMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'Unable to connect to the online AI server. Please verify your internet connection.',
        },
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button (Hidden when modal open) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bueno-ai-floating-btn"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 90,
            display: 'flex',
            alignItems: 'center',
            gap: '9px',
            padding: '11px 18px',
            borderRadius: '26px',
            background: 'linear-gradient(135deg, #0f1a4a 0%, #1b2a6f 100%)',
            color: '#ffffff',
            border: '1.5px solid var(--bu-gold, #f59e0b)',
            boxShadow: '0 4px 16px rgba(245, 158, 11, 0.25), 0 8px 24px rgba(15, 26, 74, 0.45)',
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: '0.85rem',
            transition: 'all 0.2s ease',
          }}
          title="Ask Bueño AI — Online BU Handbook Advisor"
        >
          {/* Pulsing Green Online Indicator Dot */}
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#10b981',
              boxShadow: '0 0 8px #10b981',
              display: 'inline-block',
            }}
          />
          <i className="fa-solid fa-robot" style={{ color: 'var(--bu-gold, #f59e0b)', fontSize: '1.05rem' }}></i>
          <span>Ask Bueño AI</span>
        </button>
      )}

      {/* Modal Overlay & Drawer */}
      {isOpen && (
        <div
          className="modal-overlay"
          onClick={() => setIsOpen(false)}
          style={{ display: 'flex', zIndex: 1000 }}
        >
          <div
            className="modal-content bueno-ai-modal animate__animated animate__fadeInUp animate__faster"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '560px',
              width: '92%',
              maxHeight: '86vh',
              display: 'flex',
              flexDirection: 'column',
              padding: 0,
              borderRadius: '16px',
              overflow: 'hidden',
              background: 'var(--card-bg, #ffffff)',
              border: '1px solid var(--border-color, #e2e8f0)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '14px 18px',
                borderBottom: '1px solid var(--border-color, #e2e8f0)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'var(--card-header-bg, #f1f5f9)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'var(--bu-blue, #1b2a6f)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                  }}
                >
                  <i className="fa-solid fa-graduation-cap" style={{ color: 'var(--bu-gold, #f59e0b)', fontSize: '1.1rem' }}></i>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary, #0f172a)' }}>
                      Bueño AI Advisor
                    </h3>
                    <span
                      style={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        padding: '2px 7px',
                        borderRadius: '10px',
                        background: 'rgba(16, 185, 129, 0.15)',
                        color: '#059669',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#10b981' }} />
                      ONLINE
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-secondary, #475569)' }}>
                    Powered by the Complete Bicol University Student Handbook
                  </p>
                </div>
              </div>

              {/* Close Button Only (API Key settings removed per user directive) */}
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsOpen(false)}
                aria-label="Close modal"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>

            </div>

            {/* Quick Action Chips Bar */}
            <div
              style={{
                padding: '10px 18px',
                background: 'var(--card-bg, #ffffff)',
                borderBottom: '1px solid var(--border-color, #e2e8f0)',
                display: 'flex',
                gap: '8px',
                overflowX: 'auto',
                scrollbarWidth: 'none',
              }}
            >
              <button
                type="button"
                className="btn btn-sm btn-gold"
                onClick={handleAnalyzeGrades}
                style={{ fontSize: '0.75rem', padding: '5px 12px', whiteSpace: 'nowrap', borderRadius: '14px' }}
              >
                <i className="fa-solid fa-stethoscope" style={{ marginRight: '5px' }}></i>
                Analyze My Grades
              </button>
              <button
                type="button"
                className="btn btn-sm btn-secondary"
                onClick={() => executeSendPrompt('What is the deadline and rule for removing an INC grade in BU?')}
                style={{ fontSize: '0.75rem', padding: '5px 12px', whiteSpace: 'nowrap', borderRadius: '14px' }}
              >
                INC 1-Year Rule
              </button>
              <button
                type="button"
                className="btn btn-sm btn-secondary"
                onClick={() => executeSendPrompt('What are the rules on underloading and does it disqualify from Latin honors?')}
                style={{ fontSize: '0.75rem', padding: '5px 12px', whiteSpace: 'nowrap', borderRadius: '14px' }}
              >
                Underloading
              </button>
              <button
                type="button"
                className="btn btn-sm btn-secondary"
                onClick={() => executeSendPrompt('What are the cutoffs and criteria for Latin graduation honors in BU?')}
                style={{ fontSize: '0.75rem', padding: '5px 12px', whiteSpace: 'nowrap', borderRadius: '14px' }}
              >
                Latin Honors
              </button>
            </div>

            {/* Rate Limit Warning Banner */}
            {rateLimitWarning && (
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: 'var(--color-danger, #ef4444)',
                  padding: '8px 16px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  borderBottom: '1px solid rgba(239, 68, 68, 0.2)',
                }}
              >
                <i className="fa-solid fa-triangle-exclamation"></i>
                <span>{rateLimitWarning}</span>
              </div>
            )}

            {/* Chat Messages Container */}
            <div
              style={{
                flex: '1 1 auto',
                overflowY: 'auto',
                minHeight: '260px',
                maxHeight: '440px',
                padding: '16px 18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                background: 'var(--bg-main, #f8fafc)',
              }}
            >
              {aiChatMessages.length === 0 && (
                <div style={{ textAlign: 'center', margin: 'auto', maxWidth: '380px' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: 'rgba(27, 42, 111, 0.1)',
                      color: 'var(--bu-blue, #1b2a6f)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.4rem',
                      margin: '0 auto 10px auto',
                    }}
                  >
                    <i className="fa-solid fa-book-bookmark"></i>
                  </div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', color: 'var(--text-primary, #0f172a)' }}>
                    Welcome Bueño Student!
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary, #475569)' }}>
                    Ask about BU grading scales, removal exams, Latin honors criteria, or tap <strong>&quot;Analyze My Grades&quot;</strong>.
                  </p>
                </div>
              )}

              {/* Chat Message Bubbles */}
              {aiChatMessages.map((msg, idx) => {
                const isUser = msg.sender === 'user';
                return (
                  <div
                    key={idx}
                    style={{
                      alignSelf: isUser ? 'flex-end' : 'flex-start',
                      maxWidth: '88%',
                      padding: '10px 14px',
                      borderRadius: '14px',
                      background: isUser ? 'var(--bu-blue, #1b2a6f)' : 'var(--card-bg, #ffffff)',
                      color: isUser ? '#ffffff' : 'var(--text-primary, #0f172a)',
                      fontSize: '0.82rem',
                      lineHeight: '1.5',
                      whiteSpace: 'pre-line',
                      border: isUser ? 'none' : '1px solid var(--border-color, #e2e8f0)',
                      boxShadow: isUser
                        ? '0 2px 8px rgba(27, 42, 111, 0.25)'
                        : '0 2px 6px rgba(0, 0, 0, 0.05)',
                    }}
                  >
                    {msg.text.split(/(\*\*.*?\*\*)/g).map((part, i) =>
                      part.startsWith('**') && part.endsWith('**') ? (
                        <strong
                          key={i}
                          style={{
                            color: isUser ? 'var(--bu-gold, #f59e0b)' : 'var(--bu-blue, #1b2a6f)',
                          }}
                        >
                          {part.slice(2, -2)}
                        </strong>
                      ) : (
                        part
                      )
                    )}
                  </div>
                );
              })}

              {isAiLoading && (
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary, #475569)', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <i className="fa-solid fa-spinner fa-spin" style={{ color: 'var(--bu-azure, #2563eb)' }}></i>
                  <span>Bueño AI is consulting the BU Student Handbook online...</span>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Input Bar */}
            <div
              style={{
                padding: '12px 16px',
                borderTop: '1px solid var(--border-color, #e2e8f0)',
                background: 'var(--card-bg, #ffffff)',
                display: 'flex',
                gap: '8px',
                alignItems: 'center',
              }}
            >
              <input
                type="text"
                className="form-control"
                placeholder={
                  cooldownRemaining > 0
                    ? `Please wait ${cooldownRemaining}s...`
                    : 'Ask Bueño AI about BU academic policies...'
                }
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') executeSendPrompt(query);
                }}
                disabled={isAiLoading || cooldownRemaining > 0}
                style={{ fontSize: '0.85rem', height: '40px' }}
              />
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => executeSendPrompt(query)}
                disabled={isAiLoading || !query.trim() || cooldownRemaining > 0}
                style={{
                  height: '40px',
                  width: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  borderRadius: '8px',
                  background: cooldownRemaining > 0 ? 'var(--text-muted, #94a3b8)' : 'var(--bu-blue, #1b2a6f)',
                  cursor: cooldownRemaining > 0 ? 'not-allowed' : 'pointer',
                }}
                title={cooldownRemaining > 0 ? `Cooldown active (${cooldownRemaining}s)` : 'Send Question'}
              >
                {cooldownRemaining > 0 ? (
                  <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{cooldownRemaining}s</span>
                ) : (
                  <i className="fa-solid fa-paper-plane"></i>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
