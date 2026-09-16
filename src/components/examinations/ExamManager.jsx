import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import Modal from '../common/Modal';
import { 
  Award, 
  Printer, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  FileText, 
  TrendingUp, 
  Sparkles,
  School,
  Lock,
  Unlock,
  Check,
  Edit3,
  Save,
  Trophy,
  Medal,
  Timer,
  Download,
  Star,
  User,
  ShieldCheck,
  QrCode,
  ChevronRight,
  BookOpen
} from 'lucide-react';

export default function ExamManager() {
  const { 
    exams, 
    schoolInfo, 
    currentRole, 
    activeStudent, 
    students,
    showToast,
    updateStudentMarks, 
    scheduleExamResult 
  } = useERP();

  const [selectedExamId, setSelectedExamId] = useState('ex-midterm-2026');
  const [reportCardStudent, setReportCardStudent] = useState(null);
  const [isGazetteOpen, setIsGazetteOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  // Teacher marks entry mode state
  const [isTeacherMarksMode, setIsTeacherMarksMode] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('Mathematics');
  const [editableMarks, setEditableMarks] = useState({});

  // Admin schedule form state
  const [scheduleStatus, setScheduleStatus] = useState('published');
  const [scheduleDateTime, setScheduleDateTime] = useState('2026-03-25 10:00 AM');

  const currentExam = exams.find(e => e.id === selectedExamId) || exams[0];
  const isPublished = currentExam.publishStatus === 'published';

  // Initialize teacher marks entry state when entering edit mode
  const handleOpenMarksEntry = () => {
    const marksMap = {};
    currentExam.records.forEach(r => {
      const scoreObj = r.scores.find(s => s.subject === selectedSubject);
      marksMap[r.studentId] = scoreObj ? scoreObj.marks : 85;
    });
    setEditableMarks(marksMap);
    setIsTeacherMarksMode(true);
  };

  const handleSaveMarks = async () => {
    const entryList = Object.entries(editableMarks).map(([studentId, marks]) => ({
      studentId,
      marks: Number(marks)
    }));
    await updateStudentMarks(currentExam.id, selectedSubject, entryList);
    setIsTeacherMarksMode(false);
  };

  const handleSaveSchedule = async (e) => {
    e.preventDefault();
    await scheduleExamResult(currentExam.id, {
      publishStatus: scheduleStatus,
      scheduledPublishTime: scheduleDateTime
    });
    setIsScheduleModalOpen(false);
  };

  // Top 3 Toppers
  const sortedRecords = [...currentExam.records].sort((a, b) => b.percentage - a.percentage);
  const rank1 = sortedRecords[0];
  const rank2 = sortedRecords[1];
  const rank3 = sortedRecords[2];

  // Derive child student record for Parent / Student views
  const currentStudentObj = activeStudent || (students && students.find(s => s.id === 'std-1001')) || (students && students[0]) || {
    id: 'std-1001',
    name: 'Aarav Sharma',
    rollNo: '10A-01',
    className: 'Class 10-A',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    parentName: 'Shri Rajesh Sharma & Smt. Meera Sharma',
    attendanceRate: 96.5
  };

  const childRecord = currentExam.records.find(
    r => r.studentId === currentStudentObj.id || r.studentName?.toLowerCase() === currentStudentObj.name?.toLowerCase()
  ) || currentExam.records.find(r => r.studentId === 'std-1001') || currentExam.records[1] || currentExam.records[0];

  // PDF Download Handler: Prepares certified report card and triggers system save-to-pdf dialog
  const handleDownloadPDF = (record) => {
    const target = record || childRecord;
    setReportCardStudent(target);
    if (showToast) {
      showToast(`Preparing Official CBSE Marksheet PDF for ${target.studentName}... Select "Save as PDF" to download.`, 'success');
    }
    setTimeout(() => {
      window.print();
    }, 450);
  };

  // If Student or Parent view AND result is scheduled/embargoed, show the Embargo Countdown Screen!
  if ((currentRole === 'student' || currentRole === 'parent') && !isPublished) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem' }}>
        <div 
          className="glass-panel" 
          style={{
            maxWidth: '640px',
            width: '100%',
            padding: '2.5rem 2rem',
            textAlign: 'center',
            borderTop: '4px solid var(--warning)'
          }}
        >
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--warning-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--warning)', margin: '0 auto 1.25rem' }}>
            <Lock size={32} />
          </div>

          <span className="badge badge-warning" style={{ fontSize: '0.82rem', padding: '0.35rem 0.85rem' }}>
            CONFIDENTIAL • RESULT EMBARGO ACTIVE
          </span>

          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '1rem 0 0.5rem' }}>
            {currentExam.title} Results Sealed
          </h2>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            The Examination Directorate has scheduled the official announcement of term results. All score dossiers and certified report cards remain sealed until the scheduled publication window.
          </p>

          <div style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-glass)', display: 'inline-flex', alignItems: 'center', gap: '1rem', margin: '0 auto' }}>
            <Timer size={26} color="var(--primary-light)" />
            <div style={{ textAlign: 'left' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Scheduled Release Date & Time</span>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary-light)' }}>
                {currentExam.scheduledPublishTime}
              </div>
            </div>
          </div>

          <div style={{ marginTop: '1.75rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Super Admins can unlock or adjust the publication embargo anytime from the Admin Examination Control panel.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Examinations & Automated Merit Board</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Teacher mark sheets, automated toppers podium, publication embargo scheduler, and certified report cards.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <select 
            className="form-select"
            style={{ width: 'auto' }}
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
          >
            {exams.map(e => (
              <option key={e.id} value={e.id}>{e.title} ({e.term})</option>
            ))}
          </select>

          {currentRole === 'admin' && (
            <button className="btn btn-secondary" onClick={() => setIsScheduleModalOpen(true)}>
              <Clock size={16} />
              <span>Result Scheduler</span>
            </button>
          )}

          {(currentRole === 'teacher' || currentRole === 'admin') && (
            <button 
              className={isTeacherMarksMode ? "btn btn-success" : "btn btn-primary"}
              onClick={() => isTeacherMarksMode ? handleSaveMarks() : handleOpenMarksEntry()}
            >
              {isTeacherMarksMode ? <Save size={16} /> : <Edit3 size={16} />}
              <span>{isTeacherMarksMode ? "Save & Submit Marks" : "Enter Subject Marks"}</span>
            </button>
          )}

          <button className="btn btn-secondary" onClick={() => setIsGazetteOpen(true)}>
            <FileText size={16} />
            <span>Class Result Gazette</span>
          </button>
        </div>
      </div>

      {/* Publication Status & Exam Banner */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
            <span className="badge badge-primary">{currentExam.term}</span>
            <span className={`badge ${isPublished ? 'badge-success' : 'badge-warning'}`}>
              {isPublished ? <Unlock size={11} /> : <Lock size={11} />}
              <span>{isPublished ? 'Published Live' : `Embargoed until ${currentExam.scheduledPublishTime}`}</span>
            </span>
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>{currentExam.title}</h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Academic Session: {currentExam.academicYear} • Cohort: Grade 10-A
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Pass Percentage</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--success)' }}>100%</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Highest Aggregate</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary-light)' }}>
              {rank1?.percentage}%
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. GUARDIAN & PARENT CHILD PERFORMANCE DOSSIER (With PDF Download)        */}
      {/* ========================================================================= */}
      {(currentRole === 'parent' || currentRole === 'student') && childRecord && (
        <div 
          className="glass-panel" 
          style={{ 
            padding: '1.75rem 2rem', 
            borderRadius: 'var(--radius-lg)', 
            border: '2px solid rgba(79, 70, 229, 0.3)', 
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            boxShadow: '0 8px 30px rgba(79, 70, 229, 0.08)'
          }}
        >
          {/* Top Banner */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.15rem' }}>
              <img 
                src={currentStudentObj.avatar || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80"} 
                alt={childRecord.studentName}
                style={{ width: '68px', height: '68px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary)', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)', flexShrink: 0 }}
              />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                  <span className="badge badge-primary" style={{ fontWeight: 800 }}>
                    {currentRole === 'parent' ? "Parent Supervision Desk" : "Student Official Transcript"}
                  </span>
                  <span className="badge badge-success" style={{ fontWeight: 800 }}>
                    <CheckCircle2 size={12} /> Passed with Distinction (Grade A1)
                  </span>
                  <span style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '0.3rem', 
                    background: '#fef3c7', 
                    color: '#92400e', 
                    border: '1px solid #fde68a', 
                    borderRadius: '999px', 
                    padding: '0.15rem 0.55rem', 
                    fontSize: '0.75rem', 
                    fontWeight: 800 
                  }}>
                    <Trophy size={12} color="#d97706" /> Class Rank #{childRecord.classRank} (Silver Medalist)
                  </span>
                </div>
                <h2 style={{ fontSize: '1.55rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {childRecord.studentName}'s Academic Result
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  Roll No: <strong>{childRecord.rollNo}</strong> • Class: <strong>{currentStudentObj.className || 'Class 10-A'}</strong> • Guardian: <strong>{currentStudentObj.parentName || 'Shri Rajesh Sharma'}</strong> • Session: <strong>{currentExam.academicYear}</strong>
                </p>
              </div>
            </div>

            {/* Actions for PDF Download and Print */}
            <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <button 
                className="btn btn-primary" 
                style={{ padding: '0.7rem 1.4rem', fontWeight: 800, fontSize: '0.9rem', boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)' }}
                onClick={() => handleDownloadPDF(childRecord)}
              >
                <Download size={17} />
                <span>Download Official Marksheet (PDF)</span>
              </button>
              <button 
                className="btn btn-secondary" 
                style={{ padding: '0.7rem 1.15rem' }}
                onClick={() => {
                  setReportCardStudent(childRecord);
                  setTimeout(() => window.print(), 350);
                }}
              >
                <Printer size={16} />
                <span>Print Marksheet</span>
              </button>
              <button 
                className="btn btn-secondary" 
                style={{ padding: '0.7rem 1.15rem' }}
                onClick={() => setReportCardStudent(childRecord)}
              >
                <FileText size={16} />
                <span>View Certified Dossier</span>
              </button>
            </div>
          </div>

          {/* Child 4 Key Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ padding: '1rem 1.25rem', borderRadius: '12px', background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Total Aggregate</span>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--primary)', marginTop: '0.2rem' }}>
                {childRecord.totalMarks} <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>/ {childRecord.maxTotal}</span>
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: 700 }}>{childRecord.percentage}% Overall Aggregate</span>
            </div>

            <div style={{ padding: '1rem 1.25rem', borderRadius: '12px', background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Cohort Standing</span>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#d97706', marginTop: '0.2rem' }}>
                Rank #{childRecord.classRank}
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Top 5% of Cohort (Class 10-A)</span>
            </div>

            <div style={{ padding: '1rem 1.25rem', borderRadius: '12px', background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>CGPA Pointer (10-Point Scale)</span>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#7c3aed', marginTop: '0.2rem' }}>
                {childRecord.gpa.toFixed(2)} <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>/ 10.00</span>
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>CBSE Grade: A1 • Distinction</span>
            </div>

            <div style={{ padding: '1rem 1.25rem', borderRadius: '12px', background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Term Attendance</span>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--success)', marginTop: '0.2rem' }}>
                {currentStudentObj.attendanceRate || 96.5}%
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>212 of 220 School Days</span>
            </div>
          </div>

          {/* Subject-Wise Breakdown Cards */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Subject-Wise Marks & CBSE Evaluation Breakdown
              </h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Theory (80) + Internal Practical Assessment (20)
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '0.85rem' }}>
              {childRecord.scores.map((sc, idx) => (
                <div 
                  key={idx}
                  style={{ 
                    padding: '1rem', 
                    borderRadius: '10px', 
                    background: '#ffffff', 
                    border: '1.5px solid #e2e8f0',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {sc.subject}
                    </span>
                    <span className="badge badge-success" style={{ fontWeight: 800, fontSize: '0.78rem' }}>
                      {sc.grade}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {sc.marks}
                    </span>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      / {sc.maxMarks}
                    </span>
                    <span style={{ marginLeft: 'auto', fontSize: '0.75rem', fontWeight: 700, color: sc.marks >= 90 ? 'var(--success)' : 'var(--primary)' }}>
                      {sc.marks >= 90 ? 'Mastery' : 'Proficient'}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div style={{ width: '100%', height: '6px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                    <div 
                      style={{ 
                        width: `${(sc.marks / sc.maxMarks) * 100}%`, 
                        height: '100%', 
                        background: sc.marks >= 95 ? 'var(--success)' : 'var(--primary)',
                        borderRadius: '999px'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Official Teacher & Principal Remarks */}
          <div style={{ 
            padding: '1.15rem 1.35rem', 
            borderRadius: '10px', 
            background: 'rgba(99, 102, 241, 0.05)', 
            borderLeft: '4px solid var(--primary)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.85rem'
          }}>
            <Sparkles size={20} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.04em' }}>
                Class Teacher & Examination Directorate Official Remarks
              </span>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginTop: '0.25rem', fontStyle: 'italic', lineHeight: 1.5 }}>
                "{childRecord.remarks || 'Outstanding conceptual clarity and exceptional problem solving. Commendable performance in Mathematics & AI. Recommended for CBSE Merit Scholar Certificate.'}"
              </p>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginTop: '0.35rem' }}>
                — Prof. Arthur Pendelton (Class Educator) & Dr. Eleanor Vance, Ph.D. (Principal)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. AUTOMATED TOPPERS PODIUM & WALL OF FAME ("Also show toppers and all")   */}
      {/* ========================================================================= */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Trophy size={20} color="#d97706" />
            <span>Class 10-A Merit Board & Cohort Toppers</span>
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Official automated podium calculated across all CBSE subjects for {currentExam.title}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <span className="badge badge-primary" style={{ fontSize: '0.75rem' }}>
            Class Average: 88.5%
          </span>
          <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>
            Cohort Pass Rate: 100%
          </span>
          {childRecord && (
            <span className="badge badge-purple" style={{ fontSize: '0.75rem' }}>
              Your Child: +6.3% Above Avg
            </span>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1.25rem' }}>
        {/* Rank 1 Gold */}
        {rank1 && (
          <div 
            className="glass-panel"
            style={{
              padding: '1.4rem',
              border: '1.5px solid #fde68a',
              borderTop: '5px solid #d97706',
              background: '#fffdfa',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '1.1rem',
              boxShadow: '0 2px 10px rgba(217, 119, 6, 0.08)'
            }}
          >
            <img 
              src={rank1.studentId === 'std-1002' ? "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80" : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
              alt={rank1.studentName}
              style={{ width: '58px', height: '58px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #f59e0b', flexShrink: 0 }} 
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                <span style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '0.35rem', 
                  background: '#fef3c7', 
                  color: '#92400e', 
                  fontSize: '0.74rem', 
                  fontWeight: 800, 
                  padding: '0.2rem 0.65rem',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid #fde68a'
                }}>
                  <Trophy size={13} color="#d97706" /> Rank 1 • Gold Medalist
                </span>
                {rank1.studentId === childRecord?.studentId && (
                  <span style={{ background: 'var(--primary)', color: '#fff', fontSize: '0.68rem', padding: '0.15rem 0.45rem', borderRadius: '999px', fontWeight: 800 }}>
                    ⭐ Your Child
                  </span>
                )}
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0.2rem 0' }}>
                {rank1.studentName}
              </h3>
              <div style={{ fontSize: '0.82rem', color: '#475569' }}>
                Aggregate: <strong style={{ color: '#b45309' }}>{rank1.percentage}%</strong> • CGPA <strong style={{ color: '#0f172a' }}>{rank1.gpa.toFixed(2)}</strong>/10
              </div>
            </div>
          </div>
        )}

        {/* Rank 2 Silver */}
        {rank2 && (
          <div 
            className="glass-panel"
            style={{
              padding: '1.4rem',
              border: rank2.studentId === childRecord?.studentId ? '2px solid var(--primary)' : '1.5px solid #e2e8f0',
              borderTop: '5px solid #64748b',
              background: rank2.studentId === childRecord?.studentId ? 'linear-gradient(135deg, #ffffff 0%, #f5f3ff 100%)' : '#ffffff',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '1.1rem',
              boxShadow: rank2.studentId === childRecord?.studentId ? '0 4px 18px rgba(79, 70, 229, 0.18)' : '0 2px 10px rgba(100, 116, 139, 0.08)'
            }}
          >
            <img 
              src={rank2.studentId === 'std-1001' ? "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80" : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"}
              alt={rank2.studentName}
              style={{ width: '58px', height: '58px', borderRadius: '50%', objectFit: 'cover', border: rank2.studentId === childRecord?.studentId ? '3px solid var(--primary)' : '3px solid #94a3b8', flexShrink: 0 }} 
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                <span style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '0.35rem', 
                  background: '#f1f5f9', 
                  color: '#334155', 
                  fontSize: '0.74rem', 
                  fontWeight: 800, 
                  padding: '0.2rem 0.65rem',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid #cbd5e1'
                }}>
                  <Medal size={13} color="#64748b" /> Rank 2 • Silver Medalist
                </span>
                {rank2.studentId === childRecord?.studentId && (
                  <span style={{ background: 'linear-gradient(135deg, #4f46e5, #4338ca)', color: '#fff', fontSize: '0.68rem', padding: '0.15rem 0.5rem', borderRadius: '999px', fontWeight: 800, boxShadow: '0 2px 6px rgba(79, 70, 229, 0.3)' }}>
                    ⭐ Your Child
                  </span>
                )}
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0.2rem 0' }}>
                {rank2.studentName}
              </h3>
              <div style={{ fontSize: '0.82rem', color: '#475569' }}>
                Aggregate: <strong style={{ color: '#334155' }}>{rank2.percentage}%</strong> • CGPA <strong style={{ color: '#0f172a' }}>{rank2.gpa.toFixed(2)}</strong>/10
              </div>
            </div>
          </div>
        )}

        {/* Rank 3 Bronze */}
        {rank3 && (
          <div 
            className="glass-panel"
            style={{
              padding: '1.4rem',
              border: '1.5px solid #fed7aa',
              borderTop: '5px solid #c2410c',
              background: '#fffbf7',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '1.1rem',
              boxShadow: '0 2px 10px rgba(194, 65, 12, 0.08)'
            }}
          >
            <img 
              src={rank3.studentId === 'std-1004' ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" : "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80"}
              alt={rank3.studentName}
              style={{ width: '58px', height: '58px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #f97316', flexShrink: 0 }} 
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                <span style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '0.35rem', 
                  background: '#ffedd5', 
                  color: '#9a3412', 
                  fontSize: '0.74rem', 
                  fontWeight: 800, 
                  padding: '0.2rem 0.65rem',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid #fed7aa'
                }}>
                  <Medal size={13} color="#c2410c" /> Rank 3 • Bronze Medalist
                </span>
                {rank3.studentId === childRecord?.studentId && (
                  <span style={{ background: 'var(--primary)', color: '#fff', fontSize: '0.68rem', padding: '0.15rem 0.45rem', borderRadius: '999px', fontWeight: 800 }}>
                    ⭐ Your Child
                  </span>
                )}
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0.2rem 0' }}>
                {rank3.studentName}
              </h3>
              <div style={{ fontSize: '0.82rem', color: '#475569' }}>
                Aggregate: <strong style={{ color: '#c2410c' }}>{rank3.percentage}%</strong> • CGPA <strong style={{ color: '#0f172a' }}>{rank3.gpa.toFixed(2)}</strong>/10
              </div>
            </div>
          </div>
        )}
      </div>


      {/* Teacher Marks Entry Mode Toolbar */}
      {isTeacherMarksMode && (
        <div className="glass-panel" style={{ padding: '1rem 1.25rem', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(16, 185, 129, 0.08) 100%)', border: '1px solid var(--primary-light)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <Edit3 size={20} color="var(--primary-light)" />
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Teacher Marks Entry Mode Active</h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Enter marks out of 100. Grades and aggregate rankings recompute dynamically upon submission.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>Select Subject:</span>
              <select 
                className="form-select"
                style={{ width: 'auto' }}
                value={selectedSubject}
                onChange={(e) => {
                  setSelectedSubject(e.target.value);
                  const marksMap = {};
                  currentExam.records.forEach(r => {
                    const scoreObj = r.scores.find(s => s.subject === e.target.value);
                    marksMap[r.studentId] = scoreObj ? scoreObj.marks : 85;
                  });
                  setEditableMarks(marksMap);
                }}
              >
                {currentExam.availableSubjects.map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>

              <button className="btn btn-success" onClick={handleSaveMarks}>
                <CheckCircle2 size={16} />
                <span>Submit {selectedSubject} Marks</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gradebook Table */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', marginBottom: '-0.35rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Cohort Academic Merit Roll & Class Result Tabulation
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Complete Class 10-A score dossier, aggregate percentages, and individual downloadable CBSE report cards
          </p>
        </div>
        <button className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }} onClick={() => setIsGazetteOpen(true)}>
          <FileText size={14} />
          <span>Full Result Gazette</span>
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Student</th>
              {isTeacherMarksMode ? (
                <>
                  <th>{selectedSubject} Score (Max 100)</th>
                  <th>Computed Grade</th>
                </>
              ) : (
                <>
                  <th>Total Marks</th>
                  <th>Percentage</th>
                  <th>CGPA Pointer (10.0)</th>
                  <th>Subject Breakdown</th>
                </>
              )}
              <th style={{ textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentExam.records.map((record) => {
              const currentScore = isTeacherMarksMode ? editableMarks[record.studentId] || 0 : null;
              const letter = isTeacherMarksMode 
                ? (currentScore >= 95 ? 'A+' : currentScore >= 85 ? 'A' : currentScore >= 75 ? 'B+' : currentScore >= 65 ? 'B' : currentScore >= 50 ? 'C' : 'F')
                : null;
              const isChild = record.studentId === childRecord?.studentId;

              return (
                <tr 
                  key={record.studentId}
                  style={{
                    background: isChild ? 'rgba(79, 70, 229, 0.05)' : 'inherit',
                    borderLeft: isChild ? '4px solid var(--primary)' : 'none'
                  }}
                >
                  <td style={{ fontWeight: 800, width: '70px' }}>
                    <span style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      background: record.classRank === 1 ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' :
                                  record.classRank === 2 ? 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)' :
                                  record.classRank === 3 ? 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)' :
                                  '#f1f5f9',
                      color: record.classRank <= 3 ? '#ffffff' : '#334155',
                      border: record.classRank <= 3 ? 'none' : '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.82rem',
                      fontWeight: 800
                    }}>
                      {record.classRank}
                    </span>
                  </td>

                  <td>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <span>{record.studentName}</span>
                      {isChild && (
                        <span style={{ fontSize: '0.68rem', fontWeight: 800, padding: '0.12rem 0.45rem', borderRadius: '999px', background: 'var(--primary)', color: '#ffffff' }}>
                          ⭐ Your Child
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Roll: {record.rollNo}</div>
                  </td>

                  {isTeacherMarksMode ? (
                    <>
                      <td style={{ width: '180px' }}>
                        <input 
                          type="number"
                          className="form-input"
                          style={{ width: '110px', padding: '0.4rem 0.65rem', fontWeight: 800 }}
                          min="0"
                          max="100"
                          value={editableMarks[record.studentId] || ''}
                          onChange={(e) => setEditableMarks({ ...editableMarks, [record.studentId]: e.target.value })}
                        />
                      </td>
                      <td>
                        <span className="badge badge-success" style={{ fontSize: '0.85rem' }}>
                          {letter}
                        </span>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>
                        <span style={{ fontWeight: 700 }}>{record.totalMarks} / {record.maxTotal}</span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 800, color: record.percentage >= 90 ? 'var(--success)' : 'var(--primary-light)' }}>
                          {record.percentage}%
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-purple" style={{ fontSize: '0.82rem' }}>
                          {record.gpa.toFixed(2)} / 10.00
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                          {record.scores.map((sc, i) => (
                            <span key={i} style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem', borderRadius: '4px', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-glass)' }}>
                              {sc.subject.split(' ')[0]}: <strong>{sc.marks}</strong> ({sc.grade})
                            </span>
                          ))}
                        </div>
                      </td>
                    </>
                  )}

                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                      <button 
                        className="btn btn-secondary"
                        style={{ padding: '0.4rem 0.65rem', fontSize: '0.78rem' }}
                        title="Download Official PDF Marksheet"
                        onClick={() => handleDownloadPDF(record)}
                      >
                        <Download size={13} />
                        <span>PDF</span>
                      </button>
                      <button 
                        className="btn btn-primary"
                        style={{ padding: '0.4rem 0.85rem', fontSize: '0.78rem' }}
                        onClick={() => setReportCardStudent(record)}
                      >
                        <FileText size={14} />
                        <span>Report Card</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Admin Result Publication Scheduler Modal */}
      {isScheduleModalOpen && (
        <Modal
          isOpen={isScheduleModalOpen}
          onClose={() => setIsScheduleModalOpen(false)}
          title="Result Publication Scheduler & Embargo"
          subtitle="Configure announcement date and visibility for students and parents"
          maxWidth="580px"
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setIsScheduleModalOpen(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSaveSchedule}>
                <Clock size={16} />
                <span>Save Publication Policy</span>
              </button>
            </>
          }
        >
          <form onSubmit={handleSaveSchedule} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Publication Visibility Mode *</label>
              <select 
                className="form-select"
                value={scheduleStatus}
                onChange={e => setScheduleStatus(e.target.value)}
              >
                <option value="published">Publish Immediately (All Students & Parents Can View)</option>
                <option value="scheduled">Scheduled Embargo (Countdown Timer Active until Date/Time)</option>
                <option value="embargo">Strict Confidential Embargo (Locked for Board Review)</option>
              </select>
            </div>

            {scheduleStatus === 'scheduled' && (
              <div className="form-group">
                <label className="form-label">Scheduled Announcement Date & Time *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. 2026-03-25 10:00 AM"
                  value={scheduleDateTime}
                  onChange={e => setScheduleDateTime(e.target.value)}
                />
              </div>
            )}

            <div style={{ padding: '0.85rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface-elevated)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              When scheduled or under embargo, students and parents see an encrypted countdown clock preventing premature grade leakage.
            </div>
          </form>
        </Modal>
      )}

      {/* Printable Official Class Result Gazette Modal */}
      {isGazetteOpen && (
        <Modal
          isOpen={isGazetteOpen}
          onClose={() => setIsGazetteOpen(false)}
          title="Certified Master Cohort Result Gazette"
          subtitle="Official Tabulation Ledger for School Records & Board Bulletin"
          maxWidth="900px"
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setIsGazetteOpen(false)}>
                Close
              </button>
              <button className="btn btn-primary" onClick={() => window.print()}>
                <Printer size={16} />
                <span>Print Official Gazette</span>
              </button>
            </>
          }
        >
          <div className="printable-document" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '0.5rem' }}>
            {/* School Crest */}
            <div style={{ textAlign: 'center', borderBottom: '2px solid var(--border-glass)', paddingBottom: '1rem' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <School size={26} color="var(--primary-light)" />
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{schoolInfo?.name}</h2>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                OFFICIAL EXAMINATION CELL • MASTER COHORT TABULATION SHEET
              </p>
              <div style={{ display: 'inline-block', marginTop: '0.35rem', padding: '0.2rem 0.75rem', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700 }}>
                {currentExam.title.toUpperCase()} — {currentExam.academicYear}
              </div>
            </div>

            {/* Master Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-surface-elevated)', borderBottom: '2px solid var(--border-glass)', textAlign: 'left' }}>
                  <th style={{ padding: '0.55rem' }}>Rank</th>
                  <th style={{ padding: '0.55rem' }}>Roll No</th>
                  <th style={{ padding: '0.55rem' }}>Student Name</th>
                  <th style={{ padding: '0.55rem', textAlign: 'center' }}>Math</th>
                  <th style={{ padding: '0.55rem', textAlign: 'center' }}>Physics</th>
                  <th style={{ padding: '0.55rem', textAlign: 'center' }}>Chem</th>
                  <th style={{ padding: '0.55rem', textAlign: 'center' }}>CS</th>
                  <th style={{ padding: '0.55rem', textAlign: 'center' }}>Lit</th>
                  <th style={{ padding: '0.55rem', textAlign: 'center' }}>Total (500)</th>
                  <th style={{ padding: '0.55rem', textAlign: 'center' }}>%</th>
                  <th style={{ padding: '0.55rem', textAlign: 'center' }}>CGPA (10.0)</th>
                  <th style={{ padding: '0.55rem', textAlign: 'center' }}>Verdict</th>
                </tr>
              </thead>
              <tbody>
                {sortedRecords.map((rec) => {
                  const getSubScore = (subName) => {
                    const sc = rec.scores.find(s => s.subject.toLowerCase().includes(subName.toLowerCase()));
                    return sc ? sc.marks : '-';
                  };

                  return (
                    <tr key={rec.studentId} style={{ borderBottom: '1px solid var(--border-glass-subtle)' }}>
                      <td style={{ padding: '0.55rem', fontWeight: 800 }}>#{rec.classRank}</td>
                      <td style={{ padding: '0.55rem', fontFamily: 'monospace' }}>{rec.rollNo}</td>
                      <td style={{ padding: '0.55rem', fontWeight: 700 }}>{rec.studentName}</td>
                      <td style={{ padding: '0.55rem', textAlign: 'center' }}>{getSubScore('Math')}</td>
                      <td style={{ padding: '0.55rem', textAlign: 'center' }}>{getSubScore('Physics')}</td>
                      <td style={{ padding: '0.55rem', textAlign: 'center' }}>{getSubScore('Chem')}</td>
                      <td style={{ padding: '0.55rem', textAlign: 'center' }}>{getSubScore('Computer')}</td>
                      <td style={{ padding: '0.55rem', textAlign: 'center' }}>{getSubScore('Lit')}</td>
                      <td style={{ padding: '0.55rem', textAlign: 'center', fontWeight: 800 }}>{rec.totalMarks}</td>
                      <td style={{ padding: '0.55rem', textAlign: 'center', fontWeight: 700 }}>{rec.percentage}%</td>
                      <td style={{ padding: '0.55rem', textAlign: 'center', fontWeight: 700, color: 'var(--primary-light)' }}>{rec.gpa.toFixed(2)}</td>
                      <td style={{ padding: '0.55rem', textAlign: 'center' }}>
                        <span className="badge badge-success" style={{ fontSize: '0.68rem' }}>PASS / DIST</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Gazette Signatures */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-glass)' }}>
              <div style={{ textAlign: 'center', minWidth: '180px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, fontFamily: 'cursive', color: 'var(--primary-light)' }}>
                  Controller of Examinations
                </div>
                <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '0.35rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Exam Board Secretary
                </div>
              </div>

              <div style={{ textAlign: 'center', minWidth: '180px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, fontFamily: 'cursive', color: 'var(--primary-light)' }}>
                  Dr. Eleanor Vance, Ph.D.
                </div>
                <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '0.35rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Principal & Approving Authority
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Official Certified Student Report Card Modal (Print Ready & PDF Export) */}
      {reportCardStudent && (
        <Modal
          isOpen={!!reportCardStudent}
          onClose={() => setReportCardStudent(null)}
          title="Certified Official CBSE Progress Marksheet"
          subtitle="Issued by Directorate of Academics & Examination Cell • Affiliated to CBSE"
          maxWidth="860px"
          footer={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>
                  <CheckCircle2 size={12} /> DigiLocker Verified Record
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  CBSE/2026/SEC-10A{reportCardStudent.rollNo.replace(/\D/g, '')}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.65rem' }}>
                <button className="btn btn-secondary" onClick={() => setReportCardStudent(null)}>
                  Close Preview
                </button>
                <button className="btn btn-secondary" onClick={() => window.print()}>
                  <Printer size={16} />
                  <span>Print Physical Copy</span>
                </button>
                <button className="btn btn-primary" onClick={() => handleDownloadPDF(reportCardStudent)}>
                  <Download size={16} />
                  <span>Download PDF Marksheet</span>
                </button>
              </div>
            </div>
          }
        >
          <div className="printable-document" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '0.75rem' }}>
            {/* School Crest & Letterhead */}
            <div style={{ textAlign: 'center', borderBottom: '2.5px solid #0f172a', paddingBottom: '1.25rem' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary) 0%, #312e81 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                  <School size={24} />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <h2 style={{ fontSize: '1.55rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#0f172a', margin: 0 }}>
                    {schoolInfo?.name || 'Delhi Public Global Academy'}
                  </h2>
                  <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', margin: 0 }}>
                    Senior Secondary Co-Educational Institution • Affiliated to Central Board of Secondary Education (CBSE Affiliation #2130981)
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', marginTop: '0.6rem' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', background: '#0f172a', color: '#ffffff', padding: '0.25rem 0.95rem', borderRadius: 'var(--radius-full)' }}>
                  CBSE SECONDARY SCHOOL EXAMINATION (CLASS X) 2026
                </span>
              </div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary)', marginTop: '0.4rem' }}>
                OFFICIAL ANNUAL PROGRESS REPORT & MARKS TRANSCRIPT • {currentExam.title.toUpperCase()}
              </div>
            </div>

            {/* Student Metadata Dossier */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(4, 1fr)', 
              gap: '0.85rem', 
              padding: '1rem', 
              borderRadius: '8px', 
              background: '#f8fafc', 
              border: '1px solid #e2e8f0', 
              fontSize: '0.82rem' 
            }}>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.68rem', textTransform: 'uppercase', fontWeight: 700 }}>Student Name</span>
                <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{reportCardStudent.studentName}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.68rem', textTransform: 'uppercase', fontWeight: 700 }}>Class & Roll No</span>
                <strong>{currentStudentObj.className || 'Class 10-A'} • Roll: {reportCardStudent.rollNo}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.68rem', textTransform: 'uppercase', fontWeight: 700 }}>Guardian / Parent</span>
                <strong>{currentStudentObj.parentName || 'Shri Rajesh Sharma'}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.68rem', textTransform: 'uppercase', fontWeight: 700 }}>CBSE Registration No</span>
                <strong style={{ fontFamily: 'monospace', color: 'var(--primary)' }}>2026/CBSE/10A{reportCardStudent.rollNo.replace(/\D/g, '')}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.68rem', textTransform: 'uppercase', fontWeight: 700 }}>Date of Birth</span>
                <strong>12-Apr-2009</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.68rem', textTransform: 'uppercase', fontWeight: 700 }}>Academic Session</span>
                <strong>{currentExam.academicYear}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.68rem', textTransform: 'uppercase', fontWeight: 700 }}>Term Attendance</span>
                <strong style={{ color: 'var(--success)' }}>{currentStudentObj.attendanceRate || 96.5}% (212/220 Days)</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.68rem', textTransform: 'uppercase', fontWeight: 700 }}>Cohort Standing</span>
                <strong style={{ color: '#d97706' }}>Rank #{reportCardStudent.classRank} in Cohort</strong>
              </div>
            </div>

            {/* Scholastic Subject Marks Table */}
            <div style={{ border: '1.5px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', textAlign: 'left', borderBottom: '2px solid #cbd5e1' }}>
                    <th style={{ padding: '0.65rem 0.85rem' }}>Subject Code & Title</th>
                    <th style={{ padding: '0.65rem 0.85rem', textAlign: 'center' }}>Theory (80)</th>
                    <th style={{ padding: '0.65rem 0.85rem', textAlign: 'center' }}>Internal/IA (20)</th>
                    <th style={{ padding: '0.65rem 0.85rem', textAlign: 'center' }}>Total (100)</th>
                    <th style={{ padding: '0.65rem 0.85rem', textAlign: 'center' }}>CBSE Grade</th>
                    <th style={{ padding: '0.65rem 0.85rem', textAlign: 'center' }}>Evaluation Verdict</th>
                  </tr>
                </thead>
                <tbody>
                  {reportCardStudent.scores.map((s, idx) => {
                    const theoryMarks = Math.round(s.marks * 0.79);
                    const iaMarks = s.marks - theoryMarks;
                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0', background: idx % 2 === 0 ? '#ffffff' : '#fcfcfd' }}>
                        <td style={{ padding: '0.65rem 0.85rem', fontWeight: 700, color: '#0f172a' }}>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontFamily: 'monospace', marginRight: '0.4rem' }}>
                            {idx === 0 ? '041' : idx === 1 ? '086' : idx === 2 ? '087' : idx === 3 ? '165' : '184'}
                          </span>
                          {s.subject}
                        </td>
                        <td style={{ padding: '0.65rem 0.85rem', textAlign: 'center', color: '#334155' }}>{theoryMarks}</td>
                        <td style={{ padding: '0.65rem 0.85rem', textAlign: 'center', color: '#334155' }}>{iaMarks}</td>
                        <td style={{ padding: '0.65rem 0.85rem', textAlign: 'center', fontWeight: 800, color: 'var(--primary)', fontSize: '0.95rem' }}>{s.marks}</td>
                        <td style={{ padding: '0.65rem 0.85rem', textAlign: 'center' }}>
                          <span className="badge badge-success" style={{ fontWeight: 800 }}>{s.grade}</span>
                        </td>
                        <td style={{ padding: '0.65rem 0.85rem', textAlign: 'center', fontSize: '0.78rem', color: '#475569', fontWeight: 600 }}>
                          {s.marks >= 95 ? 'Outstanding Mastery' : s.marks >= 90 ? 'Advanced Distinction' : s.marks >= 75 ? 'Proficient' : 'Satisfactory'}
                        </td>
                      </tr>
                    );
                  })}
                  <tr style={{ background: '#f8fafc', fontWeight: 800, borderTop: '2px solid #cbd5e1' }}>
                    <td style={{ padding: '0.75rem 0.85rem', color: '#0f172a' }}>GRAND AGGREGATE SUMMARY</td>
                    <td style={{ padding: '0.75rem 0.85rem', textAlign: 'center' }}>—</td>
                    <td style={{ padding: '0.75rem 0.85rem', textAlign: 'center' }}>—</td>
                    <td style={{ padding: '0.75rem 0.85rem', textAlign: 'center', color: 'var(--primary)', fontSize: '1.05rem' }}>
                      {reportCardStudent.totalMarks} / {reportCardStudent.maxTotal}
                    </td>
                    <td style={{ padding: '0.75rem 0.85rem', textAlign: 'center', color: 'var(--success)' }}>
                      {reportCardStudent.percentage}% (A1)
                    </td>
                    <td style={{ padding: '0.75rem 0.85rem', textAlign: 'center', color: 'var(--success)', fontWeight: 800 }}>
                      FIRST DIV • DISTINCTION
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Co-Scholastic & Discipline Assessment */}
            <div style={{ padding: '0.85rem 1rem', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '0.04em' }}>
                Part 2: Co-Scholastic Activities & Discipline Assessment (3-Point Scale A-C)
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.65rem', marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0.65rem', background: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.8rem' }}>
                  <span>Work Education (SUPW)</span>
                  <strong style={{ color: 'var(--success)' }}>Grade A</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0.65rem', background: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.8rem' }}>
                  <span>Art Education</span>
                  <strong style={{ color: 'var(--success)' }}>Grade A</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0.65rem', background: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.8rem' }}>
                  <span>Health & Physical Ed.</span>
                  <strong style={{ color: 'var(--success)' }}>Grade A</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0.65rem', background: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.8rem' }}>
                  <span>Discipline & Conduct</span>
                  <strong style={{ color: 'var(--success)' }}>Grade A (Exemplary)</strong>
                </div>
              </div>
            </div>

            {/* Remarks */}
            <div style={{ padding: '0.9rem 1.15rem', borderRadius: '8px', background: 'rgba(79, 70, 229, 0.04)', borderLeft: '4px solid var(--primary)' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                Class Educator & Board Recommendation
              </span>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-primary)', marginTop: '0.2rem', fontStyle: 'italic', lineHeight: 1.5 }}>
                "{reportCardStudent.remarks || 'Outstanding conceptual clarity and exceptional problem solving. Commendable performance in Mathematics & AI.'}"
              </p>
            </div>

            {/* Certification & Signatures Block */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '1rem', paddingTop: '1rem', borderTop: '1.5px solid #cbd5e1' }}>
              <div style={{ textAlign: 'center', minWidth: '160px' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, fontFamily: 'cursive', color: 'var(--primary)', marginBottom: '0.2rem' }}>
                  Prof. Arthur Pendelton
                </div>
                <div style={{ borderTop: '1px solid #94a3b8', paddingTop: '0.25rem', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Class Teacher Signature
                </div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', border: '2px dashed var(--primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '0 auto', fontSize: '0.62rem', fontWeight: 800, color: 'var(--primary)' }}>
                  <span>OFFICIAL</span>
                  <span>CBSE SEAL</span>
                  <span>2026</span>
                </div>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.2rem' }}>Institution Stamp</span>
              </div>

              <div style={{ textAlign: 'center', minWidth: '160px' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, fontFamily: 'cursive', color: 'var(--primary)', marginBottom: '0.2rem' }}>
                  Dr. Eleanor Vance, Ph.D.
                </div>
                <div style={{ borderTop: '1px solid #94a3b8', paddingTop: '0.25rem', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Principal & Head of School
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
