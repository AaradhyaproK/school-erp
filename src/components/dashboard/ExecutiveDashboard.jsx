import React from 'react';
import { useERP } from '../../context/ERPContext';
import StatsCard from '../common/StatsCard';
import { 
  Users, 
  UserCheck, 
  CreditCard, 
  Briefcase, 
  Calendar, 
  Award, 
  Bell, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Sparkles,
  BookOpen,
  Send,
  Receipt,
  MessageSquareWarning,
  IndianRupee,
  Eye,
  Trophy,
  Download,
  BookOpenCheck,
  Bus
} from 'lucide-react';

export default function ExecutiveDashboard() {
  const {
    students,
    staff,
    fees,
    notices,
    currentRole,
    timetable,
    activeStudent, 
    activeTeacher, 
    setActiveTab,
    library = [],
    libraryLoans = [],
    libraryHistory = [],
    complaints = [],
    assignments = []
  } = useERP();

  // Computations
  const totalStudents = students.length;
  const totalStaff = staff.length;
  const totalFeeCollected = fees.reduce((sum, f) => sum + (f.paidAmount || 0), 0);
  const totalFeeExpected = fees.reduce((sum, f) => sum + (f.totalAmount || 0), 0);
  const feeCollectionRate = Math.round((totalFeeCollected / (totalFeeExpected || 1)) * 100);

  // Filter urgent notices
  const urgentNotices = notices.slice(0, 3);

  // Fallback safe student data
  const currentStudent = activeStudent || (students && students[0]) || {
    id: 'std-1001',
    name: 'Aarav Sharma',
    rollNo: '1001',
    className: 'Class 10-A',
    percentage: 94.8,
    attendanceRate: 96.5,
    feeStatus: 'Paid'
  };

  // Student specific data
  const studentFeeRecord = fees.find(f => f.studentId === currentStudent.id) || fees[0];
  const studentLoans = libraryLoans.filter(l => l.studentId === currentStudent.id || l.studentRoll === currentStudent.rollNo);
  const studentComplaints = complaints.filter(c => c.submittedBy === currentStudent.name);
  const studentNotGivenTests = (assignments || []).filter(a => {
    const sub = a.submissions && a.submissions[currentStudent.id];
    return !sub || !sub.hasGivenTest;
  });
  const studentUnderCheckingTests = (assignments || []).filter(a => {
    const sub = a.submissions && a.submissions[currentStudent.id];
    return sub && sub.hasGivenTest && !sub.checkedByTeacher;
  });
  const studentCheckededTests = (assignments || []).filter(a => {
    const sub = a.submissions && a.submissions[currentStudent.id];
    return sub && sub.checkedByTeacher;
  });
  const studentIncompleteAssignments = studentNotGivenTests;

  // Admin View
  if (currentRole === 'admin') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        {/* Welcome Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Institutional Analytics & Academic Control
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              Real-time operational health, CBSE enrollment metrics, and fee collections for Delhi Public Global Academy.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-secondary" onClick={() => setActiveTab('fees')}>
              <CreditCard size={16} />
              <span>Counter Fee Collection</span>
            </button>
            <button className="btn btn-primary" onClick={() => setActiveTab('complaints')}>
              <MessageSquareWarning size={16} />
              <span>Grievance Triage Console</span>
            </button>
          </div>
        </div>

        {/* Top KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
          <StatsCard
            title="Total CBSE Enrollment"
            value={totalStudents.toLocaleString('en-IN')}
            subtext="Class 9 to 12 Active"
            icon={Users}
            trend="+12% YoY"
            color="primary"
          />
          <StatsCard
            title="Academic & Support Staff"
            value={totalStaff.toLocaleString('en-IN')}
            subtext="Biometric Present: 98%"
            icon={Briefcase}
            trend="100% Payroll Disbursed"
            color="secondary"
          />
          <StatsCard
            title="Total Fee Realized"
            value={`₹${totalFeeCollected.toLocaleString('en-IN')}`}
            subtext={`${feeCollectionRate}% of ₹${totalFeeExpected.toLocaleString('en-IN')} expected`}
            icon={IndianRupee}
            trend="+8.4% this week"
            color="success"
          />
          <StatsCard
            title="Active Grievances"
            value={complaints.filter(c => c.status !== 'Resolved').length.toString()}
            subtext="Open redressal tickets"
            icon={MessageSquareWarning}
            trend="Avg SLA: 24 hrs"
            color="purple"
          />
        </div>

        {/* Quick Functional Modules */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {/* Fee & Counter Shortcut */}
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                <div style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', background: 'var(--primary-subtle)', color: 'var(--primary)' }}>
                  <Receipt size={20} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Smart Counter Fee Collection</h3>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Filter by Class & Division, auto-recommend students with typeahead search, collect custom or full dues, and publish official receipts to Parent portal in real time.
              </p>
            </div>
            <button className="btn btn-primary" style={{ marginTop: '1.25rem' }} onClick={() => setActiveTab('fees')}>
              <span>Launch Collection Window</span>
              <ArrowUpRight size={16} />
            </button>
          </div>

          {/* Library Circulation Shortcut */}
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                <div style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
                  <BookOpen size={20} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Library Circulation Desk</h3>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Manage "Whom to Give" (loan issuance with typeahead search) and "Whom to Receive" (live overdue tracking with automated ₹5/day fine calculator and receipt clearance).
              </p>
            </div>
            <button className="btn btn-secondary" style={{ marginTop: '1.25rem' }} onClick={() => setActiveTab('library')}>
              <span>Open Circulation Desk</span>
              <ArrowUpRight size={16} />
            </button>
          </div>

          {/* Grievance Redressal */}
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                <div style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }}>
                  <MessageSquareWarning size={20} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Grievance & Redressal Box</h3>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Review incoming grievances from Students, Parents, Teachers, and Staff. Assign priority, update status, and communicate official school resolution remarks.
              </p>
            </div>
            <button className="btn btn-secondary" style={{ marginTop: '1.25rem' }} onClick={() => setActiveTab('complaints')}>
              <span>Open Grievance Console</span>
              <ArrowUpRight size={16} />
            </button>
          </div>
        </div>

        {/* Notices & Announcements */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Published Official Circulars</h3>
            <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => setActiveTab('notices')}>
              <span>Broadcast New Notice</span>
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {urgentNotices.map((n) => (
              <div key={n.id} style={{ padding: '1rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span className={`badge ${n.priority === 'Urgent' ? 'badge-danger' : 'badge-primary'}`}>{n.priority}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{n.date}</span>
                </div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.4rem' }}>{n.title}</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{n.content.slice(0, 110)}...</p>
                <div style={{ marginTop: '0.6rem', fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>Target: {n.targetAudience}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Teacher View
  if (currentRole === 'teacher') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Header with persona & live date */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <span className="badge badge-primary" style={{ fontWeight: 800 }}>Faculty Console</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Class 10-A Mentor & CS Dept</span>
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Educator Academic Workspace
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '0.15rem' }}>
              Welcome back, {activeTeacher.name} ({activeTeacher.department}). Here is your teaching schedule and class overview.
            </p>
          </div>
        </div>

        {/* Mobile Quick Action Chips */}
        <div className="mobile-quick-chips">
          <button className="mobile-chip-btn highlight" onClick={() => setActiveTab('attendance')}>
            <UserCheck size={14} />
            <span>Mark Attendance</span>
          </button>
          <button className="mobile-chip-btn warning" onClick={() => setActiveTab('assignments')}>
            <BookOpenCheck size={14} />
            <span>8 Tests to Grade</span>
          </button>
          <button className="mobile-chip-btn" onClick={() => setActiveTab('timetable')}>
            <Clock size={14} />
            <span>Today's Periods</span>
          </button>
          <button className="mobile-chip-btn" onClick={() => setActiveTab('exams')}>
            <Award size={14} />
            <span>Pre-Board Marks</span>
          </button>
          <button className="mobile-chip-btn" onClick={() => setActiveTab('complaints')}>
            <MessageSquareWarning size={14} />
            <span>Staff Grievance</span>
          </button>
        </div>

        {/* Live Period Banner (App-like hero card) */}
        <div 
          className="glass-panel"
          style={{
            padding: '1.15rem 1.35rem',
            background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.08) 0%, rgba(14, 165, 233, 0.06) 100%)',
            border: '1.5px solid rgba(79, 70, 229, 0.25)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--primary) 0%, #3730a3 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 2px 8px rgba(79, 70, 229, 0.25)',
              flexShrink: 0
            }}>
              <Clock size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.2rem' }}>
                <span className="badge badge-primary" style={{ fontSize: '0.68rem', fontWeight: 800 }}>Next Up: Period 2</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>09:55 AM – 10:40 AM</span>
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Computer Science & Python Algorithms
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Assigned: <strong>Class 10-A</strong> • Location: <strong>Lab 3 / Room 204</strong>
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" style={{ padding: '0.55rem 1rem', fontSize: '0.82rem' }} onClick={() => setActiveTab('attendance')}>
              <UserCheck size={15} />
              <span>Mark Roll Call</span>
            </button>
            <button className="btn btn-secondary" style={{ padding: '0.55rem 1rem', fontSize: '0.82rem' }} onClick={() => setActiveTab('assignments')}>
              <BookOpen size={15} />
              <span>Coursework Desk</span>
            </button>
          </div>
        </div>

        <div className="mobile-stats-grid">
          <StatsCard title="Assigned Classes" value="2 Sections" subtext="Class 10-A & Class 12-A" icon={Users} color="primary" />
          <StatsCard title="Today's Periods" value="4 Lectures" subtext="Next: Computer Science @ 09:55 AM" icon={Clock} color="secondary" />
          <StatsCard title="Class Attendance" value="96.5%" subtext="Recorded for today" icon={UserCheck} color="success" />
          <StatsCard title="Grading Queue" value="8 Pending" subtext="CBSE Pre-Board Evaluation" icon={Award} color="warning" />
        </div>

        {/* Quick Grievance Link */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem' }}>Today's Teaching Schedule (Monday)</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.75rem' }}>
              {timetable.slice(0, 4).map((slot, idx) => (
                <div key={idx} style={{ padding: '0.85rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-light)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <span className="badge badge-primary">Period {slot.period}</span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{slot.time}</span>
                  </div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginTop: '0.4rem' }}>{slot.subject}</h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>
                    <span>{slot.room}</span>
                    <span style={{ fontWeight: 600 }}>Class 10-A</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>Staff Grievance & Facility Requests</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Report classroom infrastructure needs (smartboards, lab equipment), submit scheduling concerns, or request HR clarifications confidentially.
              </p>
            </div>
            <button className="btn btn-secondary" style={{ marginTop: '1rem', width: '100%' }} onClick={() => setActiveTab('complaints')}>
              <MessageSquareWarning size={16} />
              <span>Submit Staff Request or Grievance</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Student View
  if (currentRole === 'student') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <span className="badge badge-success" style={{ fontWeight: 800 }}>Student Portal</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Roll #1001 • Class 10-A</span>
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Student Learning Dashboard
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '0.15rem' }}>
              Namaste {currentStudent.name}! Here is your current academic performance, attendance dossier, and schedule.
            </p>
          </div>
        </div>

        {/* Mobile Quick Action Chips */}
        <div className="mobile-quick-chips">
          <button className="mobile-chip-btn highlight" onClick={() => setActiveTab('assignments')}>
            <Sparkles size={14} />
            <span>Attempt MCQ Quiz</span>
          </button>
          <button className="mobile-chip-btn" onClick={() => setActiveTab('exams')}>
            <Award size={14} />
            <span>CBSE Marksheet</span>
          </button>
          <button className="mobile-chip-btn" onClick={() => setActiveTab('library')}>
            <BookOpen size={14} />
            <span>My Books ({studentLoans.length})</span>
          </button>
          <button className="mobile-chip-btn" onClick={() => setActiveTab('transport')}>
            <Bus size={14} />
            <span>Bus Route #4</span>
          </button>
          <button className="mobile-chip-btn" onClick={() => setActiveTab('timetable')}>
            <Clock size={14} />
            <span>Weekly Timetable</span>
          </button>
        </div>

        {/* Student Academic Distinction Banner */}
        <div 
          className="glass-panel" 
          style={{ 
            padding: '1.15rem 1.35rem', 
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(79, 70, 229, 0.06) 100%)', 
            border: '1.5px solid rgba(16, 185, 129, 0.3)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ 
              width: '42px', 
              height: '42px', 
              borderRadius: '12px', 
              background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: '#ffffff',
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.25)',
              flexShrink: 0
            }}>
              <Trophy size={20} color="#fef08a" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.2rem' }}>
                <span className="badge badge-success" style={{ fontWeight: 800 }}>Term 2 Aggregate: 94.8%</span>
                <span className="badge badge-primary" style={{ fontWeight: 800 }}>Class Rank #2</span>
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Passed with Academic Distinction
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Total 474/500 Marks • CGPA Pointer: 9.48 / 10.00 • Attendance: 96.5% (Exemplary)
              </p>
            </div>
          </div>

          <button className="btn btn-primary" style={{ padding: '0.55rem 1rem', fontSize: '0.82rem' }} onClick={() => setActiveTab('exams')}>
            <Award size={15} />
            <span>View Full Marksheet</span>
          </button>
        </div>

        {/* Responsive Stats Grid */}
        <div className="mobile-stats-grid">
          <StatsCard title="CBSE Aggregate %" value={`${currentStudent.percentage || 94.8}%`} subtext="Overall Term Aggregate" icon={Award} trend="Rank #2" color="primary" />
          <StatsCard title="Attendance Rate" value={`${currentStudent.attendanceRate || 96.5}%`} subtext="Above CBSE 75% requirement" icon={UserCheck} trend="+1.5%" color="success" />
          <StatsCard title="Current Class" value={currentStudent.className || 'Class 10-A'} subtext={`Roll No: ${currentStudent.rollNo || '1001'}`} icon={Users} color="secondary" />
          <StatsCard title="Quarterly Fee" value={currentStudent.feeStatus || 'Paid'} subtext="Quarter 4 (Jan-Mar 2026)" icon={CreditCard} color={(currentStudent.feeStatus || 'Paid') === 'Paid' ? 'success' : 'warning'} />
        </div>

        {/* Student actions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {/* Active Homework & MCQ Quizzes */}
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Coursework & MCQ Quizzes</h3>
                <span className={`badge ${studentIncompleteAssignments.length > 0 ? 'badge-warning' : 'badge-success'}`}>
                  {studentIncompleteAssignments.length} Pending
                </span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '1rem' }}>
                Attempt your interactive multiple-choice tests, review teacher grading feedback, and submit assignments on time.
              </p>
              {studentIncompleteAssignments.slice(0, 2).map((asg) => (
                <div key={asg.id} style={{ padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface-elevated)', marginBottom: '0.5rem', border: '1px solid var(--border-light)' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{asg.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between', marginTop: '0.2rem' }}>
                    <span>{asg.subject}</span>
                    <span style={{ color: 'var(--warning)', fontWeight: 600 }}>Due: {asg.dueDate}</span>
                  </div>
                </div>
              ))}
            </div>
            <button className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} onClick={() => setActiveTab('assignments')}>
              <Sparkles size={16} />
              <span>Launch Interactive MCQ Quiz Desk</span>
            </button>
          </div>

          {/* Library Books Issued */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>My Borrowed Library Books</h3>
              <span className="badge badge-primary">{studentLoans.length} Issued</span>
            </div>
            {studentLoans.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 0', color: 'var(--text-secondary)' }}>
                <BookOpen size={32} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                <p style={{ fontSize: '0.85rem' }}>No active library loans currently issued to you.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {studentLoans.map((loan) => (
                  <div key={loan.id} style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-light)' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{loan.bookTitle}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      <span>Due Date: {loan.dueDate}</span>
                      <span className={`badge ${loan.status === 'Overdue' ? 'badge-danger' : 'badge-primary'}`}>
                        {loan.status === 'Overdue' ? `Overdue (${loan.overdueDays}d • ₹${loan.calculatedFine})` : 'Active'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button className="btn btn-secondary" style={{ width: '100%', marginTop: '1rem' }} onClick={() => setActiveTab('library')}>
              <BookOpen size={16} />
              <span>Browse School Library Catalogue</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // Librarian Dashboard View
  // ==========================================
  if (currentRole === 'librarian') {
    const totalVolumes = (library || []).reduce((sum, b) => sum + (b.totalCopies || 1), 0);
    const availableVolumes = (library || []).reduce((sum, b) => sum + (b.availableCopies !== undefined ? b.availableCopies : 1), 0);
    const totalLoansCount = (libraryLoans || []).length;
    const overdueLoans = (libraryLoans || []).filter(l => l.status === 'Overdue' || (l.overdueDays && l.overdueDays > 0));
    const totalOverdueFines = overdueLoans.reduce((sum, l) => sum + (l.fineAmount || (l.overdueDays || 0) * 5), 0);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        {/* Welcome Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
              <span className="badge badge-primary">Central Library Circulation & Repository</span>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Delhi Public Global Academy</span>
            </div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Library & Circulation Desk Dashboard
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              Real-time book lending control, active student borrowings, overdue fine collections, and shelf catalogue inventory.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => setActiveTab('library')}>
              <BookOpen size={16} />
              <span>Open Circulation Desk (Issue & Receive)</span>
            </button>
            <button className="btn btn-secondary" onClick={() => setActiveTab('complaints')}>
              <MessageSquareWarning size={16} />
              <span>Library Facilities Grievance</span>
            </button>
          </div>
        </div>

        {/* Top KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
          <StatsCard
            title="Total Shelf Repository"
            value={`${totalVolumes} Copies`}
            subtext={`${(library || []).length} Titles Catalogued`}
            icon={BookOpen}
            color="primary"
          />
          <StatsCard
            title="Active Student Loans"
            value={`${totalLoansCount} Borrowed`}
            subtext="Currently with students"
            icon={Clock}
            color="secondary"
          />
          <StatsCard
            title="Overdue Books"
            value={`${overdueLoans.length} Loans`}
            subtext={`₹${totalOverdueFines.toLocaleString('en-IN')} Fine Accrued (@ ₹5/day)`}
            icon={AlertCircle}
            color={overdueLoans.length > 0 ? 'danger' : 'success'}
          />
          <StatsCard
            title="Returned & Cleared"
            value={`${(libraryHistory || []).length} Clearance Slips`}
            subtext="Archived with librarian seal"
            icon={CheckCircle2}
            color="success"
          />
        </div>

        {/* Quick Action Circulation Panels */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {/* Active Borrowers Quick Desk */}
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Active Student Borrowers</h3>
                <span className="badge badge-primary">{totalLoansCount} On Loan</span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Quick roster of books currently lent to students. Process returns or issue new books via circulation desk.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {(libraryLoans || []).slice(0, 3).map((loan) => {
                  const isOverdue = loan.status === 'Overdue' || (loan.overdueDays && loan.overdueDays > 0);
                  return (
                    <div 
                      key={loan.loanId} 
                      style={{ 
                        padding: '0.75rem 1rem', 
                        borderRadius: 'var(--radius-sm)', 
                        background: 'var(--bg-surface-elevated)', 
                        border: '1px solid var(--border-light)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{loan.studentName}</span>
                        <span className={`badge ${isOverdue ? 'badge-danger' : 'badge-primary'}`} style={{ fontSize: '0.72rem' }}>
                          {isOverdue ? `Overdue (${loan.overdueDays}d)` : `Due: ${loan.dueDate}`}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                        {loan.bookTitle} • Roll No: {loan.rollNo || '1001'} ({loan.className || 'Class 10-A'})
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <button className="btn btn-primary" style={{ width: '100%', marginTop: '1.25rem' }} onClick={() => setActiveTab('library')}>
              <BookOpen size={16} />
              <span>Manage "Whom to Give" & "Whom to Receive"</span>
            </button>
          </div>

          {/* Shelf Categories Inventory */}
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Departmental Shelf Inventory</h3>
                <span className="badge badge-success">{availableVolumes} Available</span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Current availability of textbook copies and references across secondary academic departments.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  { cat: 'Computer Science & AI', available: 18, total: 24, progress: 75 },
                  { cat: 'Science & Physics', available: 22, total: 30, progress: 73 },
                  { cat: 'Mathematics & Statistics', available: 16, total: 25, progress: 64 },
                  { cat: 'Chemistry & Biology', available: 14, total: 20, progress: 70 }
                ].map((dept, i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 600 }}>{dept.cat}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{dept.available} / {dept.total} on shelf</span>
                    </div>
                    <div className="progress-bar" style={{ height: '6px' }}>
                      <div className="progress-fill" style={{ width: `${dept.progress}%`, background: 'var(--primary)' }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button className="btn btn-secondary" style={{ width: '100%', marginTop: '1.25rem' }} onClick={() => setActiveTab('library')}>
              <span>View Full Library Catalogue</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // Accountant Dashboard View
  // ==========================================
  if (currentRole === 'accountant') {
    const totalPayroll = (staff || []).reduce((sum, s) => sum + (s.salary || 45000), 0);
    const paidInvoicesCount = (fees || []).filter(f => f.status === 'Paid').length;
    const pendingInvoicesCount = (fees || []).filter(f => f.balance > 0).length;
    const totalPendingDues = (fees || []).reduce((sum, f) => sum + (f.balance || 0), 0);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        {/* Welcome Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
              <span className="badge badge-primary">Bursary, Accounts & Payroll Division</span>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Fiscal Year 2025-26</span>
            </div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Bursar & Accounts Management Dashboard
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              School tuition fees realization, counter cash collection, defaulter ledger, and staff payroll disbursement.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => setActiveTab('fees')}>
              <CreditCard size={16} />
              <span>Counter Fee Collection Desk</span>
            </button>
            <button className="btn btn-secondary" onClick={() => setActiveTab('payroll')}>
              <IndianRupee size={16} />
              <span>Staff Salaries & Payroll</span>
            </button>
          </div>
        </div>

        {/* Top Financial KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
          <StatsCard
            title="Total Fee Realized"
            value={`₹${totalFeeCollected.toLocaleString('en-IN')}`}
            subtext={`Collection Efficiency: ${feeCollectionRate}%`}
            icon={CreditCard}
            trend={`${paidInvoicesCount} Cleared`}
            color="success"
          />
          <StatsCard
            title="Outstanding Dues"
            value={`₹${totalPendingDues.toLocaleString('en-IN')}`}
            subtext={`${pendingInvoicesCount} Pending Student Dues`}
            icon={AlertCircle}
            trend="Action Required"
            color={totalPendingDues > 0 ? 'warning' : 'success'}
          />
          <StatsCard
            title="Monthly Staff Payroll"
            value={`₹${totalPayroll.toLocaleString('en-IN')}`}
            subtext={`${(staff || []).length} Active Teaching & Admin Staff`}
            icon={IndianRupee}
            color="primary"
          />
          <StatsCard
            title="Collection Rate"
            value={`${feeCollectionRate}%`}
            subtext="Quarter 4 Target: 95%"
            icon={CheckCircle2}
            trend="+3.8%"
            color="secondary"
          />
        </div>

        {/* Financial Action Panels */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {/* Recent Counter Invoices */}
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Recent Student Fee Records</h3>
                <span className="badge badge-primary">{fees.length} Invoices</span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Live billing ledger across CBSE sections. Quick receipt printing and instant counter recording enabled.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {(fees || []).slice(0, 3).map((f) => {
                  const isPaid = f.status === 'Paid';
                  return (
                    <div 
                      key={f.invoiceNo} 
                      style={{ 
                        padding: '0.75rem 1rem', 
                        borderRadius: 'var(--radius-sm)', 
                        background: 'var(--bg-surface-elevated)', 
                        border: '1px solid var(--border-light)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{f.studentName}</span>
                        <span className={`badge ${isPaid ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.72rem' }}>
                          {isPaid ? 'Cleared' : `₹${(f.balance || 0).toLocaleString('en-IN')} Due`}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between', marginTop: '0.2rem' }}>
                        <span>Roll: {f.rollNo} • {f.className}</span>
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>₹{(f.totalAmount || 0).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <button className="btn btn-primary" style={{ width: '100%', marginTop: '1.25rem' }} onClick={() => setActiveTab('fees')}>
              <CreditCard size={16} />
              <span>Open Counter Fee Desk & Recommendation</span>
            </button>
          </div>

          {/* Staff Payroll Summary */}
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Staff Payroll & Salary Ledger</h3>
                <span className="badge badge-success">Direct Bank Transfer</span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Monthly salary disbursements, EPF deductions, and allowances for teaching and non-teaching personnel.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {(staff || []).slice(0, 3).map((st) => (
                  <div 
                    key={st.id} 
                    style={{ 
                      padding: '0.75rem 1rem', 
                      borderRadius: 'var(--radius-sm)', 
                      background: 'var(--bg-surface-elevated)', 
                      border: '1px solid var(--border-light)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{st.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{st.designation} • {st.department}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, color: 'var(--primary)' }}>₹{(st.salary || 45000).toLocaleString('en-IN')}</div>
                      <span className="badge badge-success" style={{ fontSize: '0.68rem' }}>Disbursed</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button className="btn btn-secondary" style={{ width: '100%', marginTop: '1.25rem' }} onClick={() => setActiveTab('payroll')}>
              <IndianRupee size={16} />
              <span>Manage Full Staff Payroll & Salaries</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Parent View
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
            <span className="badge badge-primary" style={{ fontWeight: 800 }}>Guardian & Parent Portal</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Real-Time Child Safety & Academics</span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            {currentStudent.name}'s Family Desk
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '0.15rem' }}>
            Supervising academic progress, daily bus transit, homework submissions, and fee clearances for: <strong>{currentStudent.name}</strong> ({currentStudent.className || 'Class 10-A'}).
          </p>
        </div>
      </div>

      {/* Mobile Quick Action Chips */}
      <div className="mobile-quick-chips">
        <button 
          className={`mobile-chip-btn ${studentNotGivenTests.length > 0 ? 'danger' : 'highlight'}`} 
          onClick={() => setActiveTab('assignments')}
        >
          <AlertCircle size={14} />
          <span>{studentNotGivenTests.length > 0 ? `${studentNotGivenTests.length} Pending Test` : 'Coursework Hub'}</span>
        </button>
        <button className="mobile-chip-btn" onClick={() => setActiveTab('exams')}>
          <Award size={14} />
          <span>Term 2 Marksheet</span>
        </button>
        <button className="mobile-chip-btn" onClick={() => setActiveTab('fees')}>
          <CreditCard size={14} />
          <span>Fee Ledger</span>
        </button>
        <button className="mobile-chip-btn" onClick={() => setActiveTab('transport')}>
          <Bus size={14} />
          <span>Track School Bus</span>
        </button>
        <button className="mobile-chip-btn" onClick={() => setActiveTab('complaints')}>
          <MessageSquareWarning size={14} />
          <span>Lodge Grievance</span>
        </button>
      </div>

      {/* Responsive Stats Grid */}
      <div className="mobile-stats-grid">
        <StatsCard title="Morning Check-In" value="Present" subtext="Bus Arrival at 07:45 AM" icon={CheckCircle2} color="success" />
        <StatsCard title="Term Aggregate" value={`${currentStudent.percentage || 94.8}%`} subtext="Class Rank #2" icon={Award} color="primary" />
        <StatsCard 
          title="Quarter 4 Fee" 
          value={studentFeeRecord?.status || currentStudent.feeStatus || 'Paid'} 
          subtext={studentFeeRecord?.balance === 0 ? "Fully Cleared" : `₹${(studentFeeRecord?.balance || 0).toLocaleString('en-IN')} Pending`} 
          icon={CreditCard} 
          color={studentFeeRecord?.balance === 0 ? 'success' : 'warning'} 
        />
        <StatsCard 
          title="Tests & Coursework" 
          value={
            studentNotGivenTests.length > 0 
              ? `${studentNotGivenTests.length} Not Given` 
              : studentUnderCheckingTests.length > 0 
                ? `${studentUnderCheckingTests.length} In Review` 
                : "All Evaluated"
          } 
          subtext={
            studentNotGivenTests.length > 0 
              ? "Action Required by Parent" 
              : studentUnderCheckingTests.length > 0 
                ? "Teacher Checking Answers" 
                : "100% Graded by Teacher"
          } 
          icon={BookOpen} 
          color={studentNotGivenTests.length > 0 ? 'danger' : studentUnderCheckingTests.length > 0 ? 'warning' : 'success'} 
        />
      </div>

      {/* PARENT EXAMINATION & MERIT BOARD QUICK ACCESS BANNER */}
      <div 
        className="glass-panel" 
        style={{ 
          padding: '1.25rem 1.5rem', 
          background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.08) 0%, rgba(245, 158, 11, 0.06) 100%)', 
          border: '1.5px solid rgba(79, 70, 229, 0.3)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ 
            width: '46px', 
            height: '46px', 
            borderRadius: '50%', 
            background: 'linear-gradient(135deg, var(--primary) 0%, #312e81 100%)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: '#ffffff',
            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)',
            flexShrink: 0
          }}>
            <Trophy size={22} color="#fde68a" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem', flexWrap: 'wrap' }}>
              <span className="badge badge-success" style={{ fontWeight: 800 }}>CBSE Results Published</span>
              <span className="badge badge-primary" style={{ fontWeight: 800 }}>Class Rank #2 • Silver Medalist</span>
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {currentStudent.name}'s Term 2 Examination Marksheet & Automated Merit Board Live
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Overall Aggregate: <strong>94.8%</strong> (474/500 Marks) • CGPA Pointer: <strong>9.48 / 10.00</strong> • Result: <strong>Passed with Distinction</strong>
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button 
            className="btn btn-primary"
            style={{ padding: '0.6rem 1.25rem', fontWeight: 700 }}
            onClick={() => setActiveTab('exams')}
          >
            <Award size={16} />
            <span>View Marksheet & Merit Board</span>
          </button>
        </div>
      </div>
      {studentNotGivenTests.length > 0 && (
        <div 
          className="glass-panel" 
          style={{ 
            padding: '1.5rem', 
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(245, 158, 11, 0.06) 100%)', 
            border: '2px solid rgba(239, 68, 68, 0.4)',
            borderRadius: 'var(--radius-md)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ 
                width: '44px', 
                height: '44px', 
                borderRadius: '50%', 
                background: 'rgba(239, 68, 68, 0.15)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: 'var(--danger)',
                flexShrink: 0
              }}>
                <AlertCircle size={24} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span className="badge badge-danger">Student Test Notice</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Immediate Attention Required
                  </span>
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--danger)' }}>
                  {studentNotGivenTests.length} Test(s) Not Given by {currentStudent.name}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem', lineHeight: 1.4 }}>
                  Your child has <strong>not yet given or submitted</strong> these assessments. Please encourage your child to complete them before the due date.
                </p>

                {/* List unattempted tasks */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.85rem' }}>
                  {studentNotGivenTests.map(asg => {
                    return (
                      <div key={asg.id} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem' }}>
                        <span style={{ color: 'var(--danger)', fontWeight: 700 }}>•</span>
                        <strong>{asg.title}</strong>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>({asg.subject} • Due: {asg.dueDate})</span>
                        <span className="badge badge-danger" style={{ fontSize: '0.7rem' }}>Not Given</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignSelf: 'center' }}>
              <button className="btn btn-primary" onClick={() => setActiveTab('assignments')}>
                <Eye size={16} />
                <span>Open Tests Hub & Remind Child</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PARENT REAL-TIME STATUS: GIVEN & UNDER TEACHER CHECKING */}
      {studentUnderCheckingTests.length > 0 && (
        <div 
          className="glass-panel" 
          style={{ 
            padding: '1.25rem 1.5rem', 
            background: 'rgba(245, 158, 11, 0.08)', 
            border: '1.5px solid rgba(245, 158, 11, 0.35)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '50%', 
              background: 'rgba(245, 158, 11, 0.2)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: '#b45309' 
            }}>
              <Clock size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#92400e' }}>
                {studentUnderCheckingTests.length} Test(s) Given by {currentStudent.name} (Under Teacher Checking)
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                {currentStudent.name} gave and submitted tests. The subject teacher is currently reviewing answers. Results unlock once checked.
              </p>
            </div>
          </div>

          <button className="btn btn-secondary" onClick={() => setActiveTab('assignments')}>
            <span>Track Evaluation Status</span>
          </button>
        </div>
      )}

      {/* Official Counter Fee Receipt Banner Published to Parent */}
      {studentFeeRecord && (
        <div 
          className="glass-panel" 
          style={{ 
            padding: '1.5rem', 
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.07) 0%, rgba(59, 130, 246, 0.04) 100%)', 
            border: '1px solid rgba(16, 185, 129, 0.25)',
            position: 'relative'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                  <CheckCircle2 size={12} />
                  <span>Published to Parent Portal</span>
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Receipt Ref: <strong>{studentFeeRecord.receiptNo || 'REC-DPGA-2026-0081'}</strong>
                </span>
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Official Counter Fee Receipt • Delhi Public Global Academy
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Student: <strong>{currentStudent.name}</strong> • Class: <strong>{currentStudent.className || 'Class 10-A'}</strong> • Roll No: <strong>{currentStudent.rollNo || '1001'}</strong>
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Amount Paid</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--success)' }}>
                ₹{(studentFeeRecord.paidAmount || 41000).toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Balance Due: <strong>₹{(studentFeeRecord.balance || 0).toLocaleString('en-IN')}</strong>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => setActiveTab('fees')}>
              <Receipt size={16} />
              <span>View & Print Official Signed Receipt</span>
            </button>
            <button className="btn btn-secondary" onClick={() => setActiveTab('complaints')}>
              <MessageSquareWarning size={16} />
              <span>Lodge Parent Grievance</span>
            </button>
          </div>
        </div>
      )}

      {/* Quick Action Panels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Homework & MCQ Quiz Center</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Review teacher feedback on homework, view incomplete tasks, and inspect MCQ test questions.
          </p>
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setActiveTab('assignments')}>
            <BookOpen size={16} />
            <span>Open Homework & MCQ Console</span>
          </button>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Online School Fee Payment</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Instant digital receipts via UPI (Google Pay / PhonePe), SBI NetBanking, or Debit/Credit Card.
          </p>
          <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => setActiveTab('fees')}>
            <CreditCard size={16} />
            <span>Open Fee Ledger & Make Payment</span>
          </button>
        </div>
      </div>
    </div>
  );
}
