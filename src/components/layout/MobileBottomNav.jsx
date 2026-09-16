import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { 
  LayoutDashboard, 
  BookOpenCheck, 
  UserCheck, 
  Users, 
  Menu, 
  Sparkles, 
  Award, 
  BookOpen, 
  HeartHandshake, 
  CreditCard, 
  AlertCircle,
  CalendarDays,
  Bus,
  MessageSquareWarning,
  BellRing,
  Banknote,
  UserCog,
  Settings,
  X,
  ShieldCheck,
  Calculator,
  ChevronRight
} from 'lucide-react';

export default function MobileBottomNav() {
  const { 
    currentRole, 
    setCurrentRole, 
    activeTab, 
    setActiveTab, 
    assignments, 
    activeStudent,
    complaints,
    fees
  } = useERP();

  const [isMoreOpen, setIsMoreOpen] = useState(false);

  // Calculate pending counts
  const studentPendingCount = (assignments || []).filter(a => {
    const sub = a.submissions && a.submissions[activeStudent?.id];
    return !sub || sub.status === 'Incomplete' || sub.status === 'Pending';
  }).length;

  // Teacher pending review count
  const teacherPendingGradingCount = 8; // standardized 8 pending evaluations in console

  // Parent unpaid fee balance check
  const studentFeeRecord = (fees || []).find(f => f.studentId === (activeStudent?.id || 'std-1001'));
  const hasFeePending = studentFeeRecord && studentFeeRecord.balance > 0;

  // Role Configurations for Switcher
  const roleConfigs = [
    { id: 'teacher', label: 'Faculty', icon: UserCheck, color: 'var(--secondary)' },
    { id: 'student', label: 'Student', icon: Sparkles, color: 'var(--success)' },
    { id: 'parent', label: 'Parent', icon: HeartHandshake, color: 'var(--purple)' },
    { id: 'admin', label: 'Admin', icon: ShieldCheck, color: 'var(--primary)' },
    { id: 'accountant', label: 'Accountant', icon: Calculator, color: 'var(--warning)' },
    { id: 'librarian', label: 'Librarian', icon: BookOpen, color: '#0284c7' }
  ];

  // Role-specific bottom navigation tabs
  const getNavItems = () => {
    switch (currentRole) {
      case 'teacher':
        return [
          { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
          { 
            id: 'assignments', 
            label: 'Coursework', 
            icon: BookOpenCheck,
            badge: teacherPendingGradingCount > 0 ? `${teacherPendingGradingCount}` : null,
            badgeColor: 'var(--warning)'
          },
          { id: 'attendance', label: 'Attendance', icon: UserCheck },
          { id: 'students', label: 'Students', icon: Users },
          { id: '__more__', label: 'More', icon: Menu }
        ];

      case 'student':
        return [
          { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
          { 
            id: 'assignments', 
            label: 'Quizzes', 
            icon: Sparkles,
            badge: studentPendingCount > 0 ? `${studentPendingCount}` : null,
            badgeColor: 'var(--danger)'
          },
          { id: 'exams', label: 'Marks', icon: Award },
          { id: 'library', label: 'Library', icon: BookOpen },
          { id: '__more__', label: 'More', icon: Menu }
        ];

      case 'parent':
        return [
          { id: 'dashboard', label: 'Child Desk', icon: HeartHandshake },
          { 
            id: 'assignments', 
            label: 'Tests', 
            icon: AlertCircle,
            badge: studentPendingCount > 0 ? `${studentPendingCount}` : null,
            badgeColor: 'var(--danger)'
          },
          { 
            id: 'fees', 
            label: 'Fee Pay', 
            icon: CreditCard,
            badge: hasFeePending ? 'Due' : null,
            badgeColor: 'var(--warning)'
          },
          { id: 'exams', label: 'Marksheet', icon: Award },
          { id: '__more__', label: 'More', icon: Menu }
        ];

      case 'accountant':
        return [
          { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
          { id: 'fees', label: 'Fee Desk', icon: CreditCard },
          { id: 'payroll', label: 'Payroll', icon: Banknote },
          { id: 'staff', label: 'Staff HR', icon: Users },
          { id: '__more__', label: 'More', icon: Menu }
        ];

      case 'librarian':
        return [
          { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
          { id: 'library', label: 'Circulation', icon: BookOpen },
          { id: 'notices', label: 'Notices', icon: BellRing },
          { id: 'complaints', label: 'Grievance', icon: MessageSquareWarning },
          { id: '__more__', label: 'More', icon: Menu }
        ];

      case 'admin':
      default:
        return [
          { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
          { id: 'students', label: 'Students', icon: Users },
          { id: 'fees', label: 'Fees', icon: CreditCard },
          { id: 'payroll', label: 'Payroll', icon: Banknote },
          { id: '__more__', label: 'More', icon: Menu }
        ];
    }
  };

  // Additional secondary items to display in the "More" Action Sheet
  const getMoreItems = () => {
    const allModules = [
      { id: 'timetable', label: 'Class Timetable', desc: 'Period routines & schedules', icon: CalendarDays, roles: ['admin', 'teacher', 'student', 'parent'] },
      { id: 'exams', label: 'Exams & Merit Board', desc: 'CBSE marks & rank dossiers', icon: Award, roles: ['teacher', 'accountant'] },
      { id: 'attendance', label: 'Attendance Dossier', desc: 'Daily presence & leave log', icon: UserCheck, roles: ['student', 'parent'] },
      { id: 'transport', label: 'School Bus GPS Fleet', desc: 'Real-time student bus tracking', icon: Bus, roles: ['admin', 'student', 'parent'] },
      { id: 'complaints', label: 'Grievance & Helpdesk', desc: 'Lodge academic & facility tickets', icon: MessageSquareWarning, roles: ['admin', 'teacher', 'student', 'parent', 'accountant', 'librarian'] },
      { id: 'notices', label: 'School Notice Board', desc: 'Official circulars & alerts', icon: BellRing, roles: ['admin', 'teacher', 'student', 'parent', 'accountant', 'librarian'] },
      { id: 'library', label: 'Library Circulation', desc: 'Books, issues & overdue fines', icon: BookOpen, roles: ['teacher', 'parent'] },
      { id: 'staff', label: 'Faculty & Staff Roster', desc: 'Teacher profiles & departments', icon: Users, roles: ['teacher'] },
      { id: 'users', label: 'User Roles & RBAC', desc: 'System security & permissions', icon: UserCog, roles: ['admin'] },
      { id: 'settings', label: 'System Settings', desc: 'ERP Cloud sync & backups', icon: Settings, roles: ['admin'] }
    ];

    return allModules.filter(m => m.roles.includes(currentRole));
  };

  const navItems = getNavItems();
  const moreItems = getMoreItems();

  const handleNavClick = (id) => {
    if (id === '__more__') {
      setIsMoreOpen(true);
    } else {
      setActiveTab(id);
      setIsMoreOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Bottom Dock Bar */}
      <nav 
        className="mobile-bottom-bar"
        aria-label="Mobile Navigation"
      >
        <div className="mobile-bottom-inner">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isMore = item.id === '__more__';
            const isActive = isMore ? isMoreOpen : activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`mobile-nav-btn ${isActive ? 'active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                <div className="mobile-icon-wrapper">
                  <Icon size={21} strokeWidth={isActive ? 2.4 : 1.9} />
                  {item.badge && (
                    <span 
                      className="mobile-badge"
                      style={{ background: item.badgeColor || 'var(--danger)' }}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="mobile-nav-label">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile "More" Slide-up Drawer / Action Sheet */}
      {isMoreOpen && (
        <div className="mobile-sheet-backdrop" onClick={() => setIsMoreOpen(false)}>
          <div 
            className="mobile-sheet-modal"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sheet Handle */}
            <div className="mobile-sheet-handle-bar">
              <div className="mobile-sheet-handle" />
            </div>

            {/* Sheet Header */}
            <div className="mobile-sheet-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <span className="badge badge-primary" style={{ textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 800 }}>
                    {currentRole} Console
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    CampusFlow Mobile
                  </span>
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginTop: '0.2rem' }}>
                  All App Features & Modules
                </h3>
              </div>
              <button 
                className="mobile-sheet-close-btn"
                onClick={() => setIsMoreOpen(false)}
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick Switch Role Drawer Section */}
            <div style={{ padding: '0 1.25rem 0.75rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                Switch Mobile Role Persona
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.35rem', scrollbarWidth: 'none' }}>
                {roleConfigs.map((role) => {
                  const Icon = role.icon;
                  const isCur = currentRole === role.id;
                  return (
                    <button
                      key={role.id}
                      onClick={() => {
                        setCurrentRole(role.id);
                        setActiveTab('dashboard');
                        setIsMoreOpen(false);
                      }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.45rem 0.85rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                        border: isCur ? 'none' : '1px solid var(--border-light)',
                        background: isCur ? 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)' : 'var(--bg-surface-elevated)',
                        color: isCur ? '#ffffff' : 'var(--text-primary)',
                        boxShadow: isCur ? '0 2px 8px rgba(79, 70, 229, 0.3)' : 'none',
                        flexShrink: 0
                      }}
                    >
                      <Icon size={14} />
                      <span>{role.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Grid of Secondary Modules */}
            <div className="mobile-sheet-body">
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.65rem' }}>
                Additional Academic & Support Services
              </div>
              <div className="mobile-modules-list">
                {moreItems.map((item) => {
                  const Icon = item.icon;
                  const isCurrent = activeTab === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsMoreOpen(false);
                      }}
                      className={`mobile-module-row ${isCurrent ? 'selected' : ''}`}
                    >
                      <div className="mobile-module-icon-box">
                        <Icon size={19} color="var(--primary)" />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                          {item.label}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.desc}
                        </div>
                      </div>
                      <ChevronRight size={16} color="var(--text-muted)" />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
