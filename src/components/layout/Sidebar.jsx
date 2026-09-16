import React from 'react';
import { useERP } from '../../context/ERPContext';
import { 
  LayoutDashboard, 
  Users, 
  CalendarDays, 
  UserCheck, 
  Award, 
  CreditCard, 
  Briefcase, 
  BellRing, 
  BookOpen, 
  Bus, 
  Settings, 
  School,
  UserCog,
  Banknote,
  MessageSquareWarning
} from 'lucide-react';

export default function Sidebar() {
  const { activeTab, setActiveTab, currentRole, schoolInfo, complaints, assignments, activeStudent } = useERP();

  const openComplaintsCount = complaints ? complaints.filter(c => c.status === 'Open').length : 0;
  const pendingAsgCount = (assignments || []).filter(a => {
    const sub = a.submissions && a.submissions[activeStudent?.id];
    return !sub || sub.status === 'Incomplete' || sub.status === 'Pending';
  }).length;

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'teacher', 'student', 'parent', 'accountant', 'librarian'] },
    { id: 'users', label: 'User & Role RBAC', icon: UserCog, roles: ['admin'] },
    { id: 'fees', label: 'Fee Billing & Counter', icon: CreditCard, roles: ['admin', 'accountant', 'parent'] },
    { id: 'payroll', label: 'Staff Payroll & Salaries', icon: Banknote, roles: ['admin', 'accountant'] },
    { id: 'assignments', label: 'Homework & MCQs', icon: BookOpen, badge: (currentRole === 'parent' || currentRole === 'student') && pendingAsgCount > 0 ? `${pendingAsgCount} Pending` : null, roles: ['admin', 'teacher', 'student', 'parent'] },
    { id: 'students', label: 'Student SIS & Admission', icon: Users, roles: ['admin', 'teacher'] },
    { id: 'attendance', label: 'Attendance Tracker', icon: UserCheck, roles: ['admin', 'teacher', 'student', 'parent'] },
    { id: 'timetable', label: 'Class Timetable', icon: CalendarDays, roles: ['admin', 'teacher', 'student', 'parent'] },
    { id: 'exams', label: 'Exams & Report Cards', icon: Award, roles: ['admin', 'teacher', 'student', 'parent'] },
    { id: 'complaints', label: 'Grievance Box', icon: MessageSquareWarning, badge: currentRole === 'admin' && openComplaintsCount > 0 ? `${openComplaintsCount}` : null, roles: ['admin', 'teacher', 'student', 'parent', 'accountant', 'librarian'] },
    { id: 'staff', label: 'Staff & Faculty HR', icon: Briefcase, roles: ['admin', 'teacher', 'accountant'] },
    { id: 'notices', label: 'Notice Board', icon: BellRing, roles: ['admin', 'teacher', 'student', 'parent', 'accountant', 'librarian'] },
    { id: 'library', label: 'Library Circulation', icon: BookOpen, roles: ['admin', 'librarian', 'teacher', 'student'] },
    { id: 'transport', label: 'Transport & Fleet', icon: Bus, roles: ['admin', 'parent', 'student'] },
    { id: 'settings', label: 'Settings & Cloud DB', icon: Settings, roles: ['admin'] }
  ];

  // Filter items visible to current role
  const visibleItems = navigationItems.filter(item => item.roles.includes(currentRole));

  return (
    <aside 
      className="sidebar glass-panel"
      style={{
        width: 'var(--sidebar-width)',
        height: '100vh',
        borderRadius: 0,
        borderLeft: 'none',
        borderTop: 'none',
        borderBottom: 'none',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 60,
        background: 'var(--bg-surface)',
        overflow: 'hidden',
        userSelect: 'none'
      }}
    >
      {/* Brand Header */}
      <div 
        style={{
          padding: '0.85rem 1.15rem',
          borderBottom: '1px solid var(--border-glass)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.65rem',
          flexShrink: 0
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div 
            style={{
              width: '34px',
              height: '34px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--primary) 0%, #4338ca 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 3px 10px rgba(99, 102, 241, 0.4)'
            }}
          >
            <School size={19} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.08rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.15, margin: 0, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              Campus<span style={{ color: 'var(--primary-light)' }}>Flow</span>
            </h2>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Enterprise ERP
            </span>
          </div>
        </div>

        <span className="badge badge-primary" style={{ textTransform: 'capitalize', fontSize: '0.68rem', padding: '0.12rem 0.5rem', fontWeight: 700 }}>
          {currentRole}
        </span>
      </div>

      {/* Navigation Links: Compact, Fully Visible & Completely Unscrollable */}
      <nav 
        style={{ 
          flex: 1, 
          padding: '0.45rem 0.65rem', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '0.12rem', 
          overflow: 'hidden',
          justifyContent: 'flex-start'
        }}
      >
        {visibleItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                padding: '0.42rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.82rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                background: isActive ? 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)' : 'transparent',
                boxShadow: isActive ? '0 3px 10px rgba(79, 70, 229, 0.25)' : 'none',
                transition: 'all var(--transition-fast)',
                textAlign: 'left',
                width: '100%',
                lineHeight: 1.2,
                border: 'none',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = '#f1f5f9'; }}
              onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
            >
              <Icon size={16} strokeWidth={isActive ? 2.4 : 2} style={{ color: isActive ? '#ffffff' : '#64748b', flexShrink: 0 }} />
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</span>
              {item.badge && (
                <span style={{
                  background: isActive ? '#ffffff' : 'var(--danger)',
                  color: isActive ? 'var(--primary-dark)' : '#ffffff',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  padding: '0.1rem 0.4rem',
                  borderRadius: '10px',
                  flexShrink: 0
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* School Info Footer */}
      <div 
        style={{
          padding: '0.55rem 1rem',
          borderTop: '1px solid var(--border-glass)',
          background: 'var(--bg-surface-elevated)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 6px var(--success)' }} />
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            {schoolInfo?.academicYear || '2025–2026'}
          </div>
        </div>
        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
          {schoolInfo?.currentTerm || 'Term 2'}
        </span>
      </div>
    </aside>
  );
}
