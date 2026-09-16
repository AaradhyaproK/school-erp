import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { Briefcase, Mail, Phone, GraduationCap, CheckCircle2, Search, Filter } from 'lucide-react';

export default function StaffDirectory() {
  const { staff } = useERP();
  const [selectedDept, setSelectedDept] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const departments = ['all', 'Physics & Chemistry', 'Mathematics', 'Computer Science & Robotics', 'English & World Literature', 'Physical Education & Wellness'];

  const filteredStaff = staff.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) || member.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === 'all' || member.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Faculty & Staff HR Roster</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Academic faculty profiles, department credentials, assigned lecture wings, and status.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '280px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text"
              className="form-input"
              placeholder="Search faculty by name or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.4rem' }}
            />
          </div>
        </div>

        <select 
          className="form-select"
          style={{ width: 'auto' }}
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
        >
          {departments.map(d => (
            <option key={d} value={d}>{d === 'all' ? 'All Departments' : d}</option>
          ))}
        </select>
      </div>

      {/* Staff Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {filteredStaff.map((faculty) => (
          <div 
            key={faculty.id} 
            className="glass-panel glass-panel-hover"
            style={{ padding: '1.35rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <img 
                  src={faculty.avatar} 
                  alt={faculty.name} 
                  style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary-light)' }} 
                />
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{faculty.name}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--primary-light)', fontWeight: 600 }}>{faculty.role}</p>
                  <span className="badge badge-success" style={{ marginTop: '0.35rem' }}>
                    <CheckCircle2 size={11} /> {faculty.status}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.82rem', padding: '0.85rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface-elevated)', marginBottom: '1rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Department: </span>
                  <strong style={{ color: 'var(--text-primary)' }}>{faculty.department}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Qualifications: </span>
                  <span>{faculty.qualification}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Experience: </span>
                  <span>{faculty.experience}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.2rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Assigned: </span>
                  {faculty.assignedClasses.map((ac, idx) => (
                    <span key={idx} className="badge badge-primary" style={{ fontSize: '0.7rem' }}>{ac}</span>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.65rem', borderTop: '1px solid var(--border-glass)', paddingTop: '0.85rem' }}>
              <a 
                href={`mailto:${faculty.email}`} 
                className="btn btn-secondary" 
                style={{ flex: 1, padding: '0.4rem', fontSize: '0.78rem' }}
              >
                <Mail size={13} />
                <span>Email</span>
              </a>
              <a 
                href={`tel:${faculty.phone}`} 
                className="btn btn-secondary" 
                style={{ flex: 1, padding: '0.4rem', fontSize: '0.78rem' }}
              >
                <Phone size={13} />
                <span>Contact</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
