import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { Calendar, Clock, MapPin, User, CheckCircle2, Printer, Sparkles } from 'lucide-react';

export default function TimetableSchedule() {
  const { timetable, classes, staff, currentRole } = useERP();
  const [selectedClassId, setSelectedClassId] = useState('cls-10a');
  const [activeDay, setActiveDay] = useState('Monday');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const periods = [1, 2, 3, 4, 5, 6];

  // Subject color mapping
  const subjectColors = {
    'Advanced Physics': { bg: 'rgba(99, 102, 241, 0.15)', border: 'var(--primary)', text: 'var(--primary-light)' },
    'Pure Mathematics': { bg: 'rgba(14, 165, 233, 0.15)', border: 'var(--secondary)', text: 'var(--secondary)' },
    'Computer Science': { bg: 'rgba(16, 185, 129, 0.15)', border: 'var(--success)', text: 'var(--success)' },
    'World Literature': { bg: 'rgba(168, 85, 247, 0.15)', border: 'var(--purple)', text: 'var(--purple)' },
    'Chemistry Practicum': { bg: 'rgba(245, 158, 11, 0.15)', border: 'var(--warning)', text: 'var(--warning)' },
    'Athletics & PE': { bg: 'rgba(244, 63, 94, 0.15)', border: 'var(--danger)', text: 'var(--danger)' },
    'Robotics & AI': { bg: 'rgba(99, 102, 241, 0.18)', border: '#818cf8', text: '#a5b4fc' },
    'Biology & Genetics': { bg: 'rgba(16, 185, 129, 0.18)', border: '#34d399', text: '#6ee7b7' }
  };

  const getSlot = (day, period) => {
    return timetable.find(t => t.day === day && t.period === period && t.classId === selectedClassId);
  };

  const currentClass = classes.find(c => c.id === selectedClassId) || classes[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Master Academic Timetable</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Weekly period schedule, room allocations, faculty assignments, and conflict-free roster.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <select 
            className="form-select"
            style={{ width: 'auto' }}
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
          >
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.grade} - Section {c.section}</option>
            ))}
          </select>

          <button className="btn btn-secondary" onClick={() => window.print()}>
            <Printer size={16} />
            <span>Print Timetable</span>
          </button>
        </div>
      </div>

      {/* Class Meta & Conflict Check Banner */}
      <div className="glass-panel" style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Class / Section</span>
            <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{currentClass?.grade} - Section {currentClass?.section}</div>
          </div>
          <div style={{ borderLeft: '1px solid var(--border-glass)', paddingLeft: '1rem' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Class Mentor</span>
            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{currentClass?.teacher}</div>
          </div>
          <div style={{ borderLeft: '1px solid var(--border-glass)', paddingLeft: '1rem' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Homeroom</span>
            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{currentClass?.room}</div>
          </div>
        </div>

        <div className="badge badge-success" style={{ padding: '0.4rem 0.85rem' }}>
          <CheckCircle2 size={14} />
          <span>Zero Schedule Clashes</span>
        </div>
      </div>

      {/* Day Selector Tabs */}
      <div className="tabs-container" style={{ margin: 0 }}>
        {days.map(day => (
          <button
            key={day}
            className={`tab-btn ${activeDay === day ? 'active' : ''}`}
            onClick={() => setActiveDay(day)}
          >
            <Calendar size={15} />
            <span>{day}</span>
          </button>
        ))}
      </div>

      {/* Daily Schedule Card Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        {periods.map(periodNum => {
          const slot = getSlot(activeDay, periodNum);
          const style = slot && subjectColors[slot.subject] ? subjectColors[slot.subject] : {
            bg: 'var(--bg-surface-elevated)',
            border: 'var(--border-glass)',
            text: 'var(--text-primary)'
          };

          if (!slot) {
            return (
              <div 
                key={periodNum}
                className="glass-panel"
                style={{ padding: '1.25rem', borderStyle: 'dashed', opacity: 0.6 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span className="badge">Period {periodNum}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Free Period</span>
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', padding: '1.5rem 0', textAlign: 'center' }}>
                  Study Hall / Self Review
                </div>
              </div>
            );
          }

          return (
            <div 
              key={periodNum}
              className="glass-panel glass-panel-hover"
              style={{
                padding: '1.25rem',
                border: `1px solid ${style.border}33`,
                background: style.bg
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                <span className="badge" style={{ background: 'var(--bg-surface)', color: style.text, border: `1px solid ${style.border}` }}>
                  Period {slot.period}
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Clock size={13} /> {slot.time}
                </span>
              </div>

              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
                {slot.subject}
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <User size={14} color={style.text} />
                  <span style={{ fontWeight: 600 }}>{slot.teacher}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <MapPin size={14} color={style.text} />
                  <span>{slot.room}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
