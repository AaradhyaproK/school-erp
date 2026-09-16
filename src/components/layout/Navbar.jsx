import React from 'react';
import { useERP } from '../../context/ERPContext';
import { 
  ShieldCheck, 
  GraduationCap, 
  UserCheck, 
  HeartHandshake, 
  Calculator,
  BookOpen
} from 'lucide-react';

export default function Navbar({ onToggleSidebar }) {
  const { 
    currentRole, 
    setCurrentRole, 
    setActiveTab
  } = useERP();

  const roleConfigs = [
    { id: 'admin', label: 'Super Admin', icon: ShieldCheck, color: 'var(--primary)' },
    { id: 'teacher', label: 'Faculty', icon: UserCheck, color: 'var(--secondary)' },
    { id: 'student', label: 'Student', icon: GraduationCap, color: 'var(--success)' },
    { id: 'parent', label: 'Parent', icon: HeartHandshake, color: 'var(--purple)' },
    { id: 'accountant', label: 'Accountant', icon: Calculator, color: 'var(--warning)' },
    { id: 'librarian', label: 'Librarian', icon: BookOpen, color: '#38bdf8' }
  ];

  return (
    <header 
      className="glass-panel" 
      style={{
        height: 'var(--header-height)',
        borderRadius: 0,
        borderLeft: 'none',
        borderRight: 'none',
        borderTop: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '0 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'var(--bg-glass)'
      }}
    >
      {/* Right: Interactive Multi-Role Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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
  );
}
