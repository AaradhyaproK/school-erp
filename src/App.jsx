import React from 'react';
import { ERPProvider, useERP } from './context/ERPContext';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import ExecutiveDashboard from './components/dashboard/ExecutiveDashboard';
import StudentDirectory from './components/students/StudentDirectory';
import AttendanceTracker from './components/attendance/AttendanceTracker';
import TimetableSchedule from './components/academics/TimetableSchedule';
import ExamManager from './components/examinations/ExamManager';
import FeeManagement from './components/fees/FeeManagement';
import StaffDirectory from './components/staff/StaffDirectory';
import NoticeBoard from './components/notices/NoticeBoard';
import LibraryDesk from './components/library/LibraryDesk';
import FleetTracker from './components/transport/FleetTracker';
import SettingsView from './components/settings/SettingsView';
import UserManager from './components/users/UserManager';
import PayrollManager from './components/payroll/PayrollManager';
import ComplaintBox from './components/complaints/ComplaintBox';
import AssignmentQuizHub from './components/academics/AssignmentQuizHub';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

function ERPContent() {
  const { activeTab, setActiveTab, currentRole, toast, loading } = useERP();

  // Guard against navigating to unauthorized tabs for specific roles (e.g. librarian/accountant)
  React.useEffect(() => {
    const roleAllowedTabs = {
      admin: ['dashboard', 'users', 'fees', 'payroll', 'assignments', 'students', 'attendance', 'timetable', 'exams', 'complaints', 'staff', 'notices', 'library', 'transport', 'settings'],
      teacher: ['dashboard', 'assignments', 'students', 'attendance', 'timetable', 'exams', 'complaints', 'staff', 'notices', 'library'],
      student: ['dashboard', 'assignments', 'attendance', 'timetable', 'exams', 'complaints', 'notices', 'library', 'transport'],
      parent: ['dashboard', 'fees', 'assignments', 'attendance', 'timetable', 'exams', 'complaints', 'notices', 'transport'],
      accountant: ['dashboard', 'fees', 'payroll', 'complaints', 'staff', 'notices'],
      librarian: ['dashboard', 'complaints', 'notices', 'library']
    };

    if (roleAllowedTabs[currentRole] && !roleAllowedTabs[currentRole].includes(activeTab)) {
      setActiveTab('dashboard');
    }
  }, [currentRole, activeTab, setActiveTab]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', border: '3px solid var(--border-glass)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            Initializing CampusFlow ERP Core...
          </span>
        </div>
      </div>
    );
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <ExecutiveDashboard />;
      case 'users':
        return <UserManager />;
      case 'payroll':
        return <PayrollManager />;
      case 'assignments':
        return <AssignmentQuizHub />;
      case 'students':
        return <StudentDirectory />;
      case 'attendance':
        return <AttendanceTracker />;
      case 'timetable':
        return <TimetableSchedule />;
      case 'exams':
        return <ExamManager />;
      case 'fees':
        return <FeeManagement />;
      case 'complaints':
        return <ComplaintBox />;
      case 'staff':
        return <StaffDirectory />;
      case 'notices':
        return <NoticeBoard />;
      case 'library':
        return <LibraryDesk />;
      case 'transport':
        return <FleetTracker />;
      case 'settings':
        return <SettingsView />;
      default:
        return <ExecutiveDashboard />;
    }
  };


  return (
    <div className="app-container">
      {/* Toast Notification */}
      {toast && (
        <div 
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 9999,
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-glass)',
            padding: '0.85rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            animation: 'modalFadeIn 0.25s ease-out'
          }}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 size={18} color="var(--success)" />
          ) : toast.type === 'warning' ? (
            <AlertCircle size={18} color="var(--warning)" />
          ) : (
            <Info size={18} color="var(--primary-light)" />
          )}
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {toast.message}
          </span>
        </div>
      )}

      <Sidebar />
      
      <div className="main-content-wrapper">
        <Navbar />
        <main className="page-body">
          {renderActiveTab()}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ERPProvider>
      <ERPContent />
    </ERPProvider>
  );
}
