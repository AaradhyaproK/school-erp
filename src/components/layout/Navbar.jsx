import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { 
  ShieldCheck, 
  GraduationCap, 
  UserCheck, 
  HeartHandshake, 
  Calculator,
  BookOpen,
  ArrowLeftRight,
  X,
  Check
} from 'lucide-react';

export default function Navbar() {
  const { 
    currentRole, 
    setCurrentRole, 
    setActiveTab,
    activeStudent
  } = useERP();

  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  const roleConfigs = [
    { id: 'admin', label: 'Super Admin', short: 'Admin', icon: ShieldCheck, color: 'var(--primary)', badge: 'Admin Portal' },
    { id: 'teacher', label: 'Faculty', short: 'Faculty', icon: UserCheck, color: 'var(--secondary)', badge: 'Faculty App' },
    { id: 'student', label: 'Student', short: 'Student', icon: GraduationCap, color: 'var(--success)', badge: 'Student App' },
    { id: 'parent', label: 'Parent', short: 'Parent', icon: HeartHandshake, color: 'var(--purple)', badge: 'Parent App' },
    { id: 'accountant', label: 'Accountant', short: 'Accountant', icon: Calculator, color: 'var(--warning)', badge: 'Accounts App' },
    { id: 'librarian', label: 'Librarian', short: 'Librarian', icon: BookOpen, color: '#38bdf8', badge: 'Library App' }
  ];

  const currentRoleConfig = roleConfigs.find(r => r.id === currentRole) || roleConfigs[0];
  const CurrentIcon = currentRoleConfig.icon;

  return (
    <>
      <header 
        className="glass-panel main-navbar" 
        style={{
          height: 'var(--header-height)',
          borderRadius: 0,
          borderLeft: 'none',
          borderRight: 'none',
          borderTop: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1.5rem',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'var(--bg-glass)'
        }}
      >
        {/* Mobile-Only Left Persona Badge */}
        <div className="mobile-app-header-left">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div 
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                background: currentRole === 'teacher' ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)'
                  : currentRole === 'student' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                  : currentRole === 'parent' ? 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)'
                  : 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)'
              }}
            >
              <CurrentIcon size={18} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {currentRoleConfig.badge}
                </span>
                <span 
                  style={{ 
                    width: '6px', 
                    height: '6px', 
                    borderRadius: '50%', 
                    background: '#10b981', 
                    display: 'inline-block' 
                  }} 
                />
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                {currentRole === 'teacher' ? 'Prof. Sunita Rao (Science)'
                  : currentRole === 'student' ? `${activeStudent?.name || 'Aarav Sharma'} (10-A)`
                  : currentRole === 'parent' ? `Guardian of ${activeStudent?.name || 'Aarav Sharma'}`
                  : 'CampusFlow Central'}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Switch Persona Button */}
        <div className="mobile-app-header-right">
          <button
            onClick={() => setIsRoleModalOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.4rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.78rem',
              fontWeight: 700,
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-light)',
              color: 'var(--primary)',
              cursor: 'pointer'
            }}
          >
            <ArrowLeftRight size={13} />
            <span>Switch Role</span>
          </button>
        </div>

        {/* Desktop Role Switcher Bar */}
        <div className="desktop-role-switcher" style={{ marginLeft: 'auto' }}>
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-glass)',
              padding: '0.25rem',
              borderRadius: 'var(--radius-full)'
            }}
          >
            {roleConfigs.map((role) => {
              const Icon = role.icon;
              const isActive = currentRole === role.id;
              return (
                <button
                  key={role.id}
                  onClick={() => {
                    setCurrentRole(role.id);
                    setActiveTab('dashboard');
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.4rem 0.85rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    transition: 'all var(--transition-fast)',
                    color: isActive ? '#ffffff' : 'var(--text-secondary)',
                    background: isActive ? 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)' : 'transparent',
                    boxShadow: isActive ? '0 2px 10px rgba(99, 102, 241, 0.4)' : 'none'
                  }}
                >
                  <Icon size={14} />
                  <span>{role.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Role Picker Modal for Mobile */}
      {isRoleModalOpen && (
        <div className="mobile-sheet-backdrop" onClick={() => setIsRoleModalOpen(false)}>
          <div 
            className="mobile-sheet-modal"
            style={{ maxHeight: '80vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mobile-sheet-handle-bar">
              <div className="mobile-sheet-handle" />
            </div>

            <div className="mobile-sheet-header">
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  User Persona Switcher
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Choose Portal Access</h3>
              </div>
              <button 
                className="mobile-sheet-close-btn"
                onClick={() => setIsRoleModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '1rem 1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {roleConfigs.map((role) => {
                const Icon = role.icon;
                const isSelected = currentRole === role.id;
                return (
                  <div
                    key={role.id}
                    onClick={() => {
                      setCurrentRole(role.id);
                      setActiveTab('dashboard');
                      setIsRoleModalOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.85rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      background: isSelected ? 'rgba(79, 70, 229, 0.08)' : 'var(--bg-surface-elevated)',
                      border: isSelected ? '1.5px solid var(--primary)' : '1px solid var(--border-light)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <div 
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '10px',
                          background: isSelected ? 'var(--primary)' : 'rgba(0,0,0,0.05)',
                          color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Icon size={20} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                          {role.label}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          {role.id === 'teacher' ? 'Lectures, homework grading & marks entry'
                            : role.id === 'student' ? 'Interactive quizzes, report card & library'
                            : role.id === 'parent' ? 'Child progress, fee receipts & bus tracker'
                            : role.id === 'admin' ? 'Full school administration'
                            : role.id === 'accountant' ? 'Student fees & employee payroll'
                            : 'Library repository and book circulation'}
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--primary)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Check size={14} strokeWidth={3} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
