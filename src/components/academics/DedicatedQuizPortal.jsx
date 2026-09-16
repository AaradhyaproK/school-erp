import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Maximize2, 
  Minimize2, 
  Flag, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Lock, 
  EyeOff, 
  HelpCircle,
  FileCheck,
  Award,
  ArrowRight,
  Sparkles,
  School,
  LayoutGrid,
  X
} from 'lucide-react';

export default function DedicatedQuizPortal({
  quiz,
  student,
  onClose,
  onSubmit,
  submittedResult,
  onReturnHub
}) {
  const questions = quiz?.questions || [];
  const totalQuestions = questions.length;

  // Question navigation and answer states
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState(new Set());
  const [visited, setVisited] = useState(new Set([0]));

  // Proctoring and anti-cheat states
  const [tabSwitchViolations, setTabSwitchViolations] = useState(0);
  const [showViolationModal, setShowViolationModal] = useState(false);
  const [securityToast, setSecurityToast] = useState(null);
  const [isWindowFocused, setIsWindowFocused] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSubmitConfirmModal, setShowSubmitConfirmModal] = useState(false);
  const [mobilePaletteOpen, setMobilePaletteOpen] = useState(false);
  const [isAutoSubmitting, setIsAutoSubmitting] = useState(false);

  // Timer countdown: 3 minutes per question (minimum 15 mins, max 60 mins)
  const initialDuration = Math.min(Math.max(totalQuestions * 180, 900), 3600);
  const [timeLeft, setTimeLeft] = useState(initialDuration);

  const containerRef = useRef(null);
  const toastTimeoutRef = useRef(null);

  // Trigger temporary security warning toast
  const triggerSecurityWarning = (msg) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setSecurityToast(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setSecurityToast(null);
    }, 3500);
  };

  // Fullscreen controller
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Request fullscreen automatically on initial mount for true exam simulation
  useEffect(() => {
    try {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {
          // Browser may require user gesture on first load, handle gracefully
        });
      }
    } catch {
      // Ignored
    }

    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
    };
  }, []);

  // 1. ANTI-CHEAT: TAB SWITCHING BAN & VISIBILITY DETECTOR
  useEffect(() => {
    if (submittedResult) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        handleViolationDetected('Tab switched or minimized');
      } else {
        setIsWindowFocused(true);
      }
    };

    const handleWindowBlur = () => {
      setIsWindowFocused(false);
      handleViolationDetected('Window focus lost / application switch');
    };

    const handleWindowFocus = () => {
      setIsWindowFocused(true);
    };

    const handleViolationDetected = (reason) => {
      setTabSwitchViolations((prev) => {
        const next = prev + 1;
        if (next >= 3) {
          // Disqualify and force submit
          setIsAutoSubmitting(true);
          setTimeout(() => {
            handleFinalSubmit(next, 'AUTO_SUBMITTED_TAB_SWITCH_VIOLATIONS');
          }, 800);
        } else {
          setShowViolationModal(true);
        }
        return next;
      });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [submittedResult]);

  // 2. ANTI-SCREENSHOT, COPY, PRINT & DEVTOOLS KEYBOARD INTERCEPTOR
  useEffect(() => {
    if (submittedResult) return;

    const handleKeyDown = (e) => {
      // Block PrintScreen (Windows)
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        triggerSecurityWarning('📸 Screenshot attempt blocked! Screen capture is strictly prohibited during exams.');
        try {
          if (navigator.clipboard) navigator.clipboard.writeText('');
        } catch {}
        return;
      }

      // Block Mac Screenshot shortcuts (Cmd+Shift+3, Cmd+Shift+4, Cmd+Shift+5)
      if (e.metaKey && e.shiftKey && ['3', '4', '5'].includes(e.key)) {
        e.preventDefault();
        triggerSecurityWarning('📸 Screen capture shortcut blocked! Prohibited under examination rules.');
        return;
      }

      // Block Ctrl+P / Cmd+P (Print to PDF)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        triggerSecurityWarning('🖨️ Printing examination materials is restricted.');
        return;
      }

      // Block Ctrl+C / Cmd+C (Copy)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        triggerSecurityWarning('📋 Copying exam questions is strictly prohibited.');
        return;
      }

      // Block Ctrl+S / Cmd+S (Save webpage)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        return;
      }

      // Block F12 / Inspect shortcuts
      if (e.key === 'F12' || ((e.ctrlKey || e.metaKey) && e.shiftKey && ['i', 'j', 'c'].includes(e.key.toLowerCase()))) {
        e.preventDefault();
        triggerSecurityWarning('🔒 Developer tools inspection is locked.');
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [submittedResult]);

  // 3. LIVE COUNTDOWN TIMER
  useEffect(() => {
    if (submittedResult || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          // Auto submit when time runs out
          handleFinalSubmit(tabSwitchViolations, 'AUTO_SUBMITTED_TIME_EXPIRED');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [submittedResult, timeLeft, tabSwitchViolations]);

  // Format seconds to MM:SS
  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Question navigation helpers
  const handleSelectQuestion = (idx) => {
    setCurrentIdx(idx);
    setVisited((prev) => new Set([...prev, idx]));
  };

  const handleSelectOption = (optIdx) => {
    setAnswers((prev) => ({
      ...prev,
      [currentIdx]: optIdx
    }));
  };

  const handleClearResponse = () => {
    setAnswers((prev) => {
      const copy = { ...prev };
      delete copy[currentIdx];
      return copy;
    });
  };

  const handleToggleReview = () => {
    setMarkedForReview((prev) => {
      const next = new Set(prev);
      if (next.has(currentIdx)) {
        next.delete(currentIdx);
      } else {
        next.add(currentIdx);
      }
      return next;
    });
  };

  const handleSaveAndNext = () => {
    if (currentIdx < totalQuestions - 1) {
      handleSelectQuestion(currentIdx + 1);
    } else {
      setShowSubmitConfirmModal(true);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      handleSelectQuestion(currentIdx - 1);
    }
  };

  // Submit test calculation and handler
  const handleFinalSubmit = (violations = tabSwitchViolations, flag = 'Clean') => {
    let score = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] === q.correctIndex) {
        score += (q.marks || 5);
      }
    });

    const proctoringLog = {
      violations,
      flag: violations >= 3 ? 'Disqualified (3 Tab Switches)' : violations > 0 ? `${violations} Tab Switches` : 'Clean Exam Session',
      timeSpent: initialDuration - timeLeft,
      notes: violations >= 3 
        ? 'Paper automatically submitted by system due to 3 consecutive tab-switching violations.' 
        : 'Official computer-based proctored assessment.'
    };

    onSubmit(answers, score, proctoringLog);
    setShowSubmitConfirmModal(false);
  };

  // Current question data
  const currentQ = questions[currentIdx] || {};
  const currentSelectedOpt = answers[currentIdx];
  const isCurrentReviewed = markedForReview.has(currentIdx);

  // Statistics
  const answeredCount = Object.keys(answers).length;
  const reviewedCount = markedForReview.size;
  const unansweredCount = totalQuestions - answeredCount;

  // =========================================================================
  // RENDER: POST-SUBMISSION SUCCESS VIEW
  // =========================================================================
  if (submittedResult) {
    return (
      <div 
        className="quiz-proctored-portal"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 999999,
          background: '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem'
        }}
      >
        <div 
          className="glass-panel"
          style={{
            maxWidth: '640px',
            width: '100%',
            background: '#ffffff',
            padding: '2.5rem',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            textAlign: 'center',
            boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)'
          }}
        >
          <div 
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: '#ecfdf5',
              border: '2px solid #a7f3d0',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#059669',
              marginBottom: '1.25rem'
            }}
          >
            <CheckCircle2 size={40} />
          </div>

          <span 
            className="badge badge-warning" 
            style={{ 
              fontSize: '0.8rem', 
              padding: '0.3rem 0.85rem', 
              fontWeight: 800,
              borderRadius: '6px',
              marginBottom: '0.75rem',
              display: 'inline-block'
            }}
          >
            Status: Under Teacher Checking & Evaluation
          </span>

          <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', margin: '0.4rem 0 0.75rem' }}>
            Assessment Successfully Submitted!
          </h2>

          <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.6, maxWidth: '520px', margin: '0 auto 1.5rem' }}>
            Your responses to all <strong>{totalQuestions} questions</strong> have been cryptographically sealed and saved to the examination server.
          </p>

          {/* Audit Metrics Box */}
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.75rem',
              background: '#f8fafc',
              padding: '1.25rem',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              marginBottom: '1.75rem',
              textAlign: 'center'
            }}
          >
            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>QUESTIONS</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>{totalQuestions}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>ANSWERED</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#10b981' }}>{answeredCount}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>TAB SWITCHES</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: tabSwitchViolations > 0 ? '#ef4444' : '#10b981' }}>
                {tabSwitchViolations}
              </div>
            </div>
          </div>

          <div style={{ padding: '0.85rem', borderRadius: '6px', background: '#f0fdf4', border: '1px solid #bbf7d0', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.6rem', textAlign: 'left' }}>
            <Sparkles size={18} color="#16a34a" style={{ flexShrink: 0 }} />
            <div style={{ fontSize: '0.8rem', color: '#166534', lineHeight: 1.4 }}>
              <strong>Official CBSE Policy:</strong> Scores and answer keys remain withheld until the educator reviews and verifies student responses.
            </div>
          </div>

          <button 
            className="btn btn-primary"
            onClick={onReturnHub}
            style={{
              width: '100%',
              padding: '0.75rem',
              fontSize: '0.92rem',
              fontWeight: 800,
              borderRadius: '6px'
            }}
          >
            <span>Return to Coursework Hub</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // RENDER: DEDICATED FULL-PAGE EXAM PORTAL
  // =========================================================================
  return (
    <div 
      ref={containerRef}
      className="quiz-proctored-portal"
      onContextMenu={(e) => {
        e.preventDefault();
        triggerSecurityWarning('🔒 Right-click context menu is locked in exam mode.');
      }}
      onCopy={(e) => {
        e.preventDefault();
        triggerSecurityWarning('📋 Copying text is strictly disabled.');
      }}
      onCut={(e) => e.preventDefault()}
      onPaste={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        background: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none'
      }}
    >
      <style>{`
        @media print {
          body, .quiz-proctored-portal {
            display: none !important;
            visibility: hidden !important;
          }
        }
        .quiz-proctored-portal {
          -webkit-touch-callout: none !important;
          -webkit-user-select: none !important;
          -khtml-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
        }
        .quiz-proctored-portal * {
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          user-select: none !important;
        }

        /* Responsive Mobile Breakpoint rules */
        @media (max-width: 768px) {
          .quiz-desktop-sidebar {
            display: none !important;
          }
          .quiz-desktop-only {
            display: none !important;
          }
          .quiz-mobile-only {
            display: flex !important;
          }
          .quiz-mobile-strip {
            display: flex !important;
          }
          .quiz-main-stage {
            padding: 1rem 0.85rem 1.25rem !important;
          }
          .quiz-header-bar {
            height: 54px !important;
            padding: 0 0.65rem !important;
          }
          .quiz-header-title {
            max-width: 140px !important;
          }
          .quiz-option-card {
            padding: 0.85rem 0.95rem !important;
          }
          .quiz-bottom-toolbar {
            padding-top: 1.25rem !important;
            gap: 0.4rem !important;
          }
          .quiz-btn-nav {
            padding: 0.5rem 0.75rem !important;
            font-size: 0.78rem !important;
          }
        }

        @media (min-width: 769px) {
          .quiz-desktop-sidebar {
            display: flex !important;
          }
          .quiz-desktop-only {
            display: flex !important;
          }
          .quiz-mobile-only {
            display: none !important;
          }
          .quiz-mobile-strip {
            display: none !important;
          }
        }
      `}</style>

      {/* SECURITY SHIELD BLUR OVERLAY (TRIGGERS WHEN USER BLURS WINDOW OR ATTEMPTS SCREENSHOT TOOL) */}
      {!isWindowFocused && (
        <div 
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 99999,
            background: 'rgba(15, 23, 42, 0.88)',
            backdropFilter: 'blur(20px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            padding: '2rem',
            textAlign: 'center'
          }}
        >
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', border: '2px solid #ef4444' }}>
            <EyeOff size={32} color="#ef4444" />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.4rem' }}>
            Window Focus Lost • Screen Shielded
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#cbd5e1', maxWidth: '440px', lineHeight: 1.5 }}>
            Examination contents are blurred to prevent external capture or multitasking. Click anywhere inside this window to return to your active exam.
          </p>
          <button 
            onClick={() => setIsWindowFocused(true)}
            style={{
              marginTop: '1.25rem',
              padding: '0.6rem 1.4rem',
              borderRadius: '6px',
              border: 'none',
              background: '#4f46e5',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            Resume Examination
          </button>
        </div>
      )}

      {/* TOP PROCTORING HEADER BAR */}
      <header 
        className="quiz-header-bar"
        style={{
          height: '62px',
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          padding: '0 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
        }}
      >
        {/* Left: School Crest & Exam Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
          <div 
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              background: '#eef2ff',
              border: '1px solid #c7d2fe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#4f46e5',
              flexShrink: 0
            }}
          >
            <School size={19} />
          </div>
          <div className="quiz-header-title" style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', background: '#eef2ff', color: '#4338ca', padding: '0.08rem 0.35rem', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                {quiz.subject || 'CBT'}
              </span>
              <span style={{ fontSize: '0.7rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                Class {quiz.className || '10-A'}
              </span>
            </div>
            <h1 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {quiz.title}
            </h1>
          </div>
        </div>

        {/* Center: Live Timer Countdown Clock */}
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.35rem 0.75rem',
            borderRadius: '8px',
            background: timeLeft < 300 ? '#fef2f2' : '#f8fafc',
            border: timeLeft < 300 ? '1.5px solid #fca5a5' : '1px solid #e2e8f0',
            color: timeLeft < 300 ? '#b91c1c' : '#0f172a',
            flexShrink: 0
          }}
        >
          <Clock size={15} color={timeLeft < 300 ? '#ef4444' : '#4f46e5'} />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span className="quiz-desktop-only" style={{ fontSize: '0.58rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Time Left</span>
            <span style={{ fontSize: '1rem', fontWeight: 800, fontFamily: 'monospace', letterSpacing: '0.04em' }}>
              {formatTimer(timeLeft)}
            </span>
          </div>
        </div>

        {/* Right: Security Badge & Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexShrink: 0 }}>
          {/* Tab Switch Counter Badge */}
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              padding: '0.3rem 0.55rem',
              borderRadius: '6px',
              background: tabSwitchViolations > 0 ? '#fef2f2' : '#f0fdf4',
              border: `1px solid ${tabSwitchViolations > 0 ? '#fecaca' : '#bbf7d0'}`,
              color: tabSwitchViolations > 0 ? '#b91c1c' : '#15803d',
              fontSize: '0.72rem',
              fontWeight: 800
            }}
            title="Tab switches are strictly monitored"
          >
            <ShieldAlert size={13} />
            <span className="quiz-desktop-only">Tab Switches: </span>
            <span>{tabSwitchViolations}/3</span>
          </div>

          {/* Mobile Palette Drawer Toggle Button */}
          <button 
            className="quiz-mobile-only"
            onClick={() => setMobilePaletteOpen(true)}
            style={{
              background: '#eef2ff',
              border: '1px solid #c7d2fe',
              borderRadius: '6px',
              padding: '0.3rem 0.55rem',
              cursor: 'pointer',
              color: '#4338ca',
              fontWeight: 800,
              fontSize: '0.74rem',
              alignItems: 'center',
              gap: '0.25rem'
            }}
            title="Open Question Palette"
          >
            <LayoutGrid size={14} />
            <span>{answeredCount}/{totalQuestions}</span>
          </button>

          {/* Desktop Fullscreen Toggle */}
          <button 
            className="quiz-desktop-only"
            onClick={toggleFullscreen}
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              padding: '0.4rem',
              cursor: 'pointer',
              color: '#64748b',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>

          {/* Final Submit Button */}
          <button 
            onClick={() => setShowSubmitConfirmModal(true)}
            style={{
              background: '#10b981',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '0.35rem 0.75rem',
              fontSize: '0.78rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              boxShadow: '0 2px 6px rgba(16, 185, 129, 0.3)'
            }}
          >
            <Check size={14} />
            <span className="quiz-desktop-only">Submit Exam</span>
            <span className="quiz-mobile-only">Submit</span>
          </button>
        </div>
      </header>

      {/* MOBILE HORIZONTAL QUICK-JUMP QUESTION STRIP */}
      <div 
        className="quiz-mobile-strip"
        style={{
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          padding: '0.4rem 0.65rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          flexShrink: 0
        }}
      >
        <button 
          onClick={() => setMobilePaletteOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            padding: '0.3rem 0.55rem',
            borderRadius: '6px',
            background: '#0f172a',
            color: '#ffffff',
            border: 'none',
            fontSize: '0.72rem',
            fontWeight: 800,
            cursor: 'pointer',
            flexShrink: 0
          }}
        >
          <LayoutGrid size={13} />
          <span>Grid</span>
        </button>

        <div style={{ width: '1px', height: '18px', background: '#e2e8f0', margin: '0 0.1rem', flexShrink: 0 }} />

        {questions.map((_, idx) => {
          const isAnswered = answers[idx] !== undefined;
          const isReview = markedForReview.has(idx);
          const isCurrent = idx === currentIdx;
          const isVisited = visited.has(idx);

          let bg = '#ffffff';
          let color = '#475569';
          let border = '1px solid #cbd5e1';

          if (isReview) {
            bg = '#8b5cf6';
            color = '#ffffff';
            border = '1px solid #7c3aed';
          } else if (isAnswered) {
            bg = '#10b981';
            color = '#ffffff';
            border = '1px solid #059669';
          } else if (isVisited) {
            bg = '#fee2e2';
            color = '#b91c1c';
            border = '1px solid #fca5a5';
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelectQuestion(idx)}
              style={{
                minWidth: '34px',
                height: '30px',
                padding: '0 0.35rem',
                borderRadius: '6px',
                background: bg,
                color: color,
                border: isCurrent ? '2px solid #0f172a' : border,
                fontWeight: 800,
                fontSize: '0.78rem',
                cursor: 'pointer',
                outline: isCurrent ? '2px solid #6366f1' : 'none',
                flexShrink: 0
              }}
            >
              {idx + 1}
              {isReview && ' ★'}
            </button>
          );
        })}
      </div>

      {/* SECURITY BANNER WARNING TOAST (TRANSIENT) */}
      {securityToast && (
        <div 
          style={{
            background: '#ef4444',
            color: '#ffffff',
            padding: '0.5rem 1rem',
            textAlign: 'center',
            fontSize: '0.82rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
          }}
        >
          <AlertTriangle size={16} color="#ffffff" />
          <span>{securityToast}</span>
        </div>
      )}

      {/* MAIN EXAM STAGE & QUESTION PALETTE */}
      <div 
        style={{
          flex: 1,
          display: 'flex',
          overflow: 'hidden',
          width: '100%'
        }}
      >
        {/* ================================================================= */}
        {/* LEFT / CENTER: ACTIVE QUESTION PRESENTATION STAGE                */}
        {/* ================================================================= */}
        <main 
          className="quiz-main-stage"
          style={{
            flex: 1,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            padding: '1.5rem 2rem',
            background: '#ffffff'
          }}
        >
          {/* Question Breadcrumb & Marks Header */}
          <div 
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid #f1f5f9',
              paddingBottom: '0.85rem',
              marginBottom: '1.25rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <span 
                style={{ 
                  background: '#0f172a', 
                  color: '#ffffff', 
                  fontSize: '0.78rem', 
                  fontWeight: 800, 
                  padding: '0.25rem 0.65rem', 
                  borderRadius: '6px' 
                }}
              >
                Question {currentIdx + 1} of {totalQuestions}
              </span>

              {isCurrentReviewed && (
                <span 
                  style={{ 
                    background: '#f5f3ff', 
                    color: '#7c3aed', 
                    fontSize: '0.74rem', 
                    fontWeight: 800, 
                    padding: '0.2rem 0.55rem', 
                    borderRadius: '6px',
                    border: '1px solid #ddd6fe',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}
                >
                  <Flag size={12} /> Marked for Review
                </span>
              )}
            </div>

            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#047857', background: '#ecfdf5', padding: '0.2rem 0.55rem', borderRadius: '6px', border: '1px solid #a7f3d0' }}>
              Marks: +{currentQ.marks || 5} / -0
            </span>
          </div>

          {/* Question Prompt Text */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.6 }}>
              {currentQ.prompt || `Question ${currentIdx + 1}`}
            </h2>
          </div>

          {/* Option Choices A, B, C, D */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', width: '100%', maxWidth: '780px' }}>
            {(currentQ.options || []).map((optText, optIdx) => {
              const isSelected = currentSelectedOpt === optIdx;
              return (
                <div
                  key={optIdx}
                  className="quiz-option-card"
                  onClick={() => handleSelectOption(optIdx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.85rem',
                    padding: '1rem 1.15rem',
                    borderRadius: '8px',
                    background: isSelected ? '#f5f3ff' : '#ffffff',
                    border: isSelected ? '2px solid #6366f1' : '1px solid #cbd5e1',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: isSelected ? '0 2px 8px rgba(99, 102, 241, 0.15)' : 'none',
                    width: '100%'
                  }}
                >
                  {/* Letter badge (A, B, C, D) */}
                  <span 
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '6px',
                      background: isSelected ? '#6366f1' : '#f1f5f9',
                      color: isSelected ? '#ffffff' : '#475569',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.85rem',
                      fontWeight: 800,
                      flexShrink: 0
                    }}
                  >
                    {String.fromCharCode(65 + optIdx)}
                  </span>

                  <span style={{ fontSize: '0.94rem', color: '#1e293b', fontWeight: isSelected ? 700 : 500, flex: 1, lineHeight: 1.45 }}>
                    {optText}
                  </span>

                  {isSelected && (
                    <CheckCircle2 size={20} color="#6366f1" style={{ flexShrink: 0 }} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom Stage Action Toolbar */}
          <div 
            className="quiz-bottom-toolbar"
            style={{
              marginTop: 'auto',
              paddingTop: '2rem',
              borderTop: '1px solid #f1f5f9',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.75rem'
            }}
          >
            {/* Left Controls: Previous & Clear */}
            <div style={{ display: 'flex', gap: '0.45rem' }}>
              <button 
                className="quiz-btn-nav"
                onClick={handlePrev}
                disabled={currentIdx === 0}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.5rem 0.95rem',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  background: currentIdx === 0 ? '#f8fafc' : '#ffffff',
                  color: currentIdx === 0 ? '#94a3b8' : '#334155',
                  cursor: currentIdx === 0 ? 'not-allowed' : 'pointer',
                  fontWeight: 700,
                  fontSize: '0.82rem'
                }}
              >
                <ChevronLeft size={16} />
                <span>Previous</span>
              </button>

              {currentSelectedOpt !== undefined && (
                <button 
                  className="quiz-btn-nav"
                  onClick={handleClearResponse}
                  style={{
                    padding: '0.5rem 0.85rem',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#64748b',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: '0.82rem'
                  }}
                >
                  Clear
                </button>
              )}
            </div>

            {/* Right Controls: Mark for Review & Save & Next */}
            <div style={{ display: 'flex', gap: '0.45rem' }}>
              <button 
                className="quiz-btn-nav"
                onClick={handleToggleReview}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.5rem 0.95rem',
                  borderRadius: '6px',
                  border: isCurrentReviewed ? '1.5px solid #a855f7' : '1px solid #ddd6fe',
                  background: isCurrentReviewed ? '#f5f3ff' : '#ffffff',
                  color: '#7c3aed',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                <Flag size={14} />
                <span className="quiz-desktop-only">{isCurrentReviewed ? 'Unmark Review' : 'Mark for Review'}</span>
                <span className="quiz-mobile-only">{isCurrentReviewed ? 'Unmark' : 'Review'}</span>
              </button>

              <button 
                className="quiz-btn-nav"
                onClick={handleSaveAndNext}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.5rem 1.15rem',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#4f46e5',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(79, 70, 229, 0.3)'
                }}
              >
                <span>{currentIdx === totalQuestions - 1 ? 'Save & Review' : 'Save & Next'}</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </main>

        {/* ================================================================= */}
        {/* RIGHT SIDEBAR: QUESTION PALETTE & CANDIDATE DOSSIER (DESKTOP)     */}
        {/* ================================================================= */}
        <aside 
          className="quiz-desktop-sidebar"
          style={{
            width: '320px',
            borderLeft: '1px solid #e2e8f0',
            background: '#f8fafc',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            padding: '1.25rem',
            flexShrink: 0
          }}
        >
          {/* Candidate Profile Strip */}
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.85rem 1rem',
              background: '#ffffff',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              marginBottom: '1.25rem'
            }}
          >
            <img 
              src={student?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"}
              alt={student?.name}
              style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #4f46e5' }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {student?.name || 'Aarav Sharma'}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                Roll #{student?.rollNo || '10A-01'} • Candidate
              </div>
            </div>
          </div>

          {/* Palette Legend */}
          <div style={{ marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Question Status Legend
            </span>
            <div 
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '0.45rem',
                marginTop: '0.5rem',
                fontSize: '0.74rem',
                color: '#475569'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: '14px', height: '14px', borderRadius: '4px', background: '#10b981', display: 'inline-block' }} />
                <span>Answered ({answeredCount})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: '14px', height: '14px', borderRadius: '4px', background: '#ef4444', display: 'inline-block' }} />
                <span>Not Answered ({unansweredCount})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: '14px', height: '14px', borderRadius: '4px', background: '#8b5cf6', display: 'inline-block' }} />
                <span>Review ({reviewedCount})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: '14px', height: '14px', borderRadius: '4px', background: '#e2e8f0', display: 'inline-block' }} />
                <span>Not Visited</span>
              </div>
            </div>
          </div>

          {/* Interactive Question Jump Grid */}
          <div style={{ marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Question Palette ({totalQuestions})
            </span>
            <div 
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '0.45rem',
                marginTop: '0.6rem'
              }}
            >
              {questions.map((_, idx) => {
                const isAnswered = answers[idx] !== undefined;
                const isReview = markedForReview.has(idx);
                const isCurrent = idx === currentIdx;
                const isVisited = visited.has(idx);

                let bg = '#ffffff';
                let color = '#475569';
                let border = '1px solid #cbd5e1';

                if (isReview) {
                  bg = '#8b5cf6';
                  color = '#ffffff';
                  border = '1px solid #7c3aed';
                } else if (isAnswered) {
                  bg = '#10b981';
                  color = '#ffffff';
                  border = '1px solid #059669';
                } else if (isVisited) {
                  bg = '#fee2e2';
                  color = '#b91c1c';
                  border = '1px solid #fca5a5';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectQuestion(idx)}
                    style={{
                      height: '38px',
                      borderRadius: '6px',
                      background: bg,
                      color: color,
                      border: isCurrent ? '2px solid #0f172a' : border,
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      outline: isCurrent ? '2px solid #6366f1' : 'none',
                      transition: 'all 0.12s ease'
                    }}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Proctoring Information Notice */}
          <div 
            style={{
              marginTop: 'auto',
              padding: '0.85rem',
              borderRadius: '6px',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              fontSize: '0.72rem',
              color: '#64748b',
              lineHeight: 1.5
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.2rem' }}>
              <Lock size={12} color="#4f46e5" />
              <span>Proctoring Security Rules</span>
            </div>
            <div>• Tab switching is logged automatically.</div>
            <div>• 3 violations triggers immediate disqualification.</div>
            <div>• Screenshots & copying are restricted.</div>
          </div>
        </aside>
      </div>

      {/* ========================================================================= */}
      {/* MOBILE BOTTOM SHEET: QUESTION PALETTE & TEST PROGRESS                     */}
      {/* ========================================================================= */}
      {mobilePaletteOpen && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999999,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end'
          }}
          onClick={() => setMobilePaletteOpen(false)}
        >
          <div 
            style={{
              background: '#ffffff',
              borderTopLeftRadius: '16px',
              borderTopRightRadius: '16px',
              padding: '1.25rem 1.25rem 2rem',
              maxHeight: '85vh',
              overflowY: 'auto',
              boxShadow: '0 -10px 30px rgba(0,0,0,0.2)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Drag Bar */}
            <div style={{ width: '40px', height: '4px', background: '#cbd5e1', borderRadius: '2px', margin: '0 auto 1rem' }} />

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Question Palette ({totalQuestions})
                </h3>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Tap any number to jump directly
                </div>
              </div>
              <button 
                onClick={() => setMobilePaletteOpen(false)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#475569'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Candidate Info Chip */}
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                padding: '0.65rem 0.85rem',
                background: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                marginBottom: '1rem'
              }}
            >
              <img 
                src={student?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"}
                alt={student?.name}
                style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #4f46e5' }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#0f172a' }}>{student?.name || 'Aarav Sharma'}</div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Roll #{student?.rollNo || '10A-01'} • Candidate</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#4f46e5' }}>{formatTimer(timeLeft)}</div>
                <div style={{ fontSize: '0.68rem', color: '#64748b' }}>remaining</div>
              </div>
            </div>

            {/* Status Legend */}
            <div 
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '0.4rem',
                background: '#f8fafc',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                marginBottom: '1.25rem',
                fontSize: '0.75rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#10b981', display: 'inline-block' }} />
                <span>Answered ({answeredCount})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#ef4444', display: 'inline-block' }} />
                <span>Not Answered ({unansweredCount})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#8b5cf6', display: 'inline-block' }} />
                <span>Review ({reviewedCount})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#e2e8f0', display: 'inline-block' }} />
                <span>Not Visited</span>
              </div>
            </div>

            {/* Question Buttons Grid (Mobile size 46x46px) */}
            <div 
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '0.6rem',
                marginBottom: '1.5rem'
              }}
            >
              {questions.map((_, idx) => {
                const isAnswered = answers[idx] !== undefined;
                const isReview = markedForReview.has(idx);
                const isCurrent = idx === currentIdx;
                const isVisited = visited.has(idx);

                let bg = '#ffffff';
                let color = '#475569';
                let border = '1px solid #cbd5e1';

                if (isReview) {
                  bg = '#8b5cf6';
                  color = '#ffffff';
                  border = '1px solid #7c3aed';
                } else if (isAnswered) {
                  bg = '#10b981';
                  color = '#ffffff';
                  border = '1px solid #059669';
                } else if (isVisited) {
                  bg = '#fee2e2';
                  color = '#b91c1c';
                  border = '1px solid #fca5a5';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => {
                      handleSelectQuestion(idx);
                      setMobilePaletteOpen(false);
                    }}
                    style={{
                      height: '46px',
                      borderRadius: '8px',
                      background: bg,
                      color: color,
                      border: isCurrent ? '2.5px solid #0f172a' : border,
                      fontWeight: 800,
                      fontSize: '0.92rem',
                      cursor: 'pointer',
                      outline: isCurrent ? '2px solid #6366f1' : 'none',
                      boxShadow: isCurrent ? '0 2px 8px rgba(99, 102, 241, 0.25)' : 'none'
                    }}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Actions: Close & Submit */}
            <div style={{ display: 'flex', gap: '0.65rem' }}>
              <button 
                onClick={() => setMobilePaletteOpen(false)}
                className="btn btn-secondary"
                style={{ flex: 1, padding: '0.65rem', borderRadius: '6px', fontSize: '0.84rem' }}
              >
                Back to Exam
              </button>
              <button 
                onClick={() => {
                  setMobilePaletteOpen(false);
                  setShowSubmitConfirmModal(true);
                }}
                className="btn btn-primary"
                style={{ flex: 1, padding: '0.65rem', borderRadius: '6px', fontSize: '0.84rem', background: '#10b981', border: 'none' }}
              >
                <Check size={16} />
                <span>Submit Exam</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: TAB SWITCH VIOLATION WARNING                                       */}
      {/* ========================================================================= */}
      {showViolationModal && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999999,
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem'
          }}
        >
          <div 
            style={{
              maxWidth: '460px',
              width: '100%',
              background: '#ffffff',
              borderRadius: '12px',
              border: '2px solid #ef4444',
              padding: '2rem',
              textAlign: 'center',
              boxShadow: '0 25px 50px -12px rgba(239, 68, 68, 0.25)'
            }}
          >
            <div 
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#fee2e2',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#dc2626',
                marginBottom: '1rem',
                border: '2px solid #f87171'
              }}
            >
              <AlertTriangle size={34} />
            </div>

            <span 
              style={{
                background: '#fef2f2',
                color: '#b91c1c',
                border: '1px solid #fecaca',
                fontSize: '0.76rem',
                fontWeight: 800,
                padding: '0.25rem 0.75rem',
                borderRadius: '6px',
                textTransform: 'uppercase'
              }}
            >
              Proctoring Security Violation {tabSwitchViolations} of 3
            </span>

            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '0.75rem 0 0.4rem' }}>
              Tab Switch Detected!
            </h3>

            <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              You navigated away from the exam portal. Examination guidelines strictly prohibit browsing external websites, consulting unauthorized materials, or opening other apps.
            </p>

            <div 
              style={{
                background: '#f8fafc',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontSize: '0.78rem',
                color: '#64748b',
                textAlign: 'left',
                marginBottom: '1.5rem'
              }}
            >
              <div style={{ color: '#b91c1c', fontWeight: 700 }}>
                ⚠️ Remaining Warnings: {Math.max(3 - tabSwitchViolations, 0)}
              </div>
              <div style={{ marginTop: '0.2rem' }}>
                If you reach 3 violations, your examination will be locked and auto-submitted with a Disqualification notice.
              </div>
            </div>

            <button 
              onClick={() => setShowViolationModal(false)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '6px',
                border: 'none',
                background: '#0f172a',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.88rem',
                cursor: 'pointer'
              }}
            >
              I Understand • Return to Examination
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: FINAL SUBMISSION CONFIRMATION DIALOG                               */}
      {/* ========================================================================= */}
      {showSubmitConfirmModal && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999999,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem'
          }}
        >
          <div 
            style={{
              maxWidth: '460px',
              width: '100%',
              background: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #cbd5e1',
              padding: '1.75rem',
              boxShadow: '0 20px 40px -10px rgba(0,0,0,0.2)'
            }}
          >
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem' }}>
              Confirm Final Examination Submission
            </h3>
            <p style={{ fontSize: '0.84rem', color: '#64748b', marginBottom: '1.25rem', lineHeight: 1.5 }}>
              Please review your test progress summary before final sign-off:
            </p>

            {/* Breakdown table */}
            <div 
              style={{
                background: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                padding: '0.85rem 1rem',
                marginBottom: '1.5rem',
                fontSize: '0.82rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', borderBottom: '1px solid #e2e8f0' }}>
                <span style={{ color: '#64748b' }}>Total Questions:</span>
                <span style={{ fontWeight: 800, color: '#0f172a' }}>{totalQuestions}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', borderBottom: '1px solid #e2e8f0' }}>
                <span style={{ color: '#047857', fontWeight: 700 }}>Answered:</span>
                <span style={{ fontWeight: 800, color: '#047857' }}>{answeredCount}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', borderBottom: '1px solid #e2e8f0' }}>
                <span style={{ color: '#b91c1c', fontWeight: 700 }}>Unanswered:</span>
                <span style={{ fontWeight: 800, color: '#b91c1c' }}>{unansweredCount}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', borderBottom: '1px solid #e2e8f0' }}>
                <span style={{ color: '#7c3aed', fontWeight: 700 }}>Marked for Review:</span>
                <span style={{ fontWeight: 800, color: '#7c3aed' }}>{reviewedCount}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0' }}>
                <span style={{ color: '#64748b' }}>Tab Switch Violations:</span>
                <span style={{ fontWeight: 800, color: tabSwitchViolations > 0 ? '#ef4444' : '#10b981' }}>{tabSwitchViolations}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button 
                className="btn btn-secondary"
                onClick={() => setShowSubmitConfirmModal(false)}
                style={{ borderRadius: '6px', padding: '0.55rem 1rem', fontSize: '0.85rem' }}
              >
                Continue Test
              </button>
              <button 
                onClick={() => handleFinalSubmit()}
                style={{
                  background: '#10b981',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.55rem 1.25rem',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                }}
              >
                Yes, Submit Paper
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
