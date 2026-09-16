import React from 'react';
import { useERP } from '../../context/ERPContext';
import { Settings, Cloud, Database, RefreshCw, ShieldCheck, School, CheckCircle2, Sparkles } from 'lucide-react';

export default function SettingsView() {
  const { schoolInfo, isFirebaseConnected, resetToFactorySeed, showToast } = useERP();

  const handleReset = () => {
    if (window.confirm('Reset all ERP database collections to pristine default state?')) {
      resetToFactorySeed();
      showToast('Database reset to factory demonstration data!');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Institutional Settings & Cloud Infrastructure</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            System configuration, Firebase Firestore backend sync status, and school metadata.
          </p>
        </div>

        <button className="btn btn-secondary" onClick={handleReset}>
          <RefreshCw size={15} />
          <span>Reset Sample Database</span>
        </button>
      </div>

      {/* Cloud Status Panel */}
      <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--success)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'var(--success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)' }}>
              <Cloud size={26} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Firebase Cloud Backend</h3>
                <span className="badge badge-success">
                  <CheckCircle2 size={12} /> Connected
                </span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                Real-time Firestore sync & Authentication is active.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginTop: '1.25rem', padding: '1rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface-elevated)', fontSize: '0.82rem' }}>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem', textTransform: 'uppercase' }}>Project ID</span>
            <strong>campussim-9muwd</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem', textTransform: 'uppercase' }}>Database Engine</span>
            <strong>Firestore Native (STANDARD)</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem', textTransform: 'uppercase' }}>Web App ID</span>
            <strong>1:415956203794:web:7377ab...</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem', textTransform: 'uppercase' }}>Resilience Mode</span>
            <strong style={{ color: 'var(--success)' }}>Hybrid Local & Cloud Sync</strong>
          </div>
        </div>
      </div>

      {/* School Configuration Panel */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <School size={18} color="var(--primary-light)" />
          <span>School Institutional Profile</span>
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
          <div className="form-group">
            <label className="form-label">School / Academy Legal Name</label>
            <input type="text" className="form-input" defaultValue={schoolInfo?.name} readOnly />
          </div>

          <div className="form-group">
            <label className="form-label">Accreditation & Affiliation</label>
            <input type="text" className="form-input" defaultValue={schoolInfo?.affiliation} readOnly />
          </div>

          <div className="form-group">
            <label className="form-label">Principal / Head of Institution</label>
            <input type="text" className="form-input" defaultValue={schoolInfo?.principal} readOnly />
          </div>

          <div className="form-group">
            <label className="form-label">Current Academic Session</label>
            <input type="text" className="form-input" defaultValue={schoolInfo?.academicYear} readOnly />
          </div>

          <div className="form-group">
            <label className="form-label">Institutional Contact Email</label>
            <input type="email" className="form-input" defaultValue={schoolInfo?.email} readOnly />
          </div>

          <div className="form-group">
            <label className="form-label">Campus Phone Line</label>
            <input type="text" className="form-input" defaultValue={schoolInfo?.phone} readOnly />
          </div>
        </div>
      </div>

      {/* Role Switcher Architecture Guide */}
      <div className="glass-panel" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(14, 165, 233, 0.06) 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <Sparkles size={18} color="var(--primary-light)" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Multi-Role Architecture Overview</h3>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          CampusFlow implements an instantaneous role-switching engine. Selecting <strong>Super Admin</strong> grants full control over admissions, attendance registers, fee invoices, and system settings. Selecting <strong>Teacher</strong> simulates a faculty workspace with timetable periods and grading rosters. Selecting <strong>Student</strong> presents coursework, GPA standing, and attendance history. Selecting <strong>Parent</strong> enables guardian oversight, online fee payments, and downloadable certified report cards.
        </p>
      </div>
    </div>
  );
}
