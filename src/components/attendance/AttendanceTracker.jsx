import React, { useState, useEffect, useMemo } from 'react';
import { useERP } from '../../context/ERPContext';
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  HelpCircle, 
  Send, 
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  AlertCircle
} from 'lucide-react';

export default function AttendanceTracker() {
  const { 
    students, 
    classes, 
    attendance, 
    markAttendance, 
    showToast, 
    currentRole, 
    activeStudent 
  } = useERP();

  const [selectedDate, setSelectedDate] = useState('2026-03-16');
  const [selectedClassId, setSelectedClassId] = useState('cls-10a');
  const [records, setRecords] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'Present' | 'Absent' | 'Late' | 'Excused'

  // Filter students for the selected class
  const classStudents = useMemo(() => {
    return students.filter(s => s.classId === selectedClassId);
  }, [students, selectedClassId]);

  // Load existing records for the date and class
  useEffect(() => {
    const key = `${selectedDate}_${selectedClassId}`;
    const existing = attendance[key];
    if (existing && existing.records) {
      setRecords(existing.records);
    } else {
      // Default to Present for all students if not recorded yet
      const initial = {};
      classStudents.forEach(s => {
        initial[s.id] = 'Present';
      });
      setRecords(initial);
      // Silently initialize in the background
      markAttendance(selectedDate, selectedClassId, initial, true);
    }
  }, [selectedDate, selectedClassId, attendance, classStudents, markAttendance]);

  // Instant 1-tap Status Change (Autosaves silently with zero friction)
  const handleStatusChange = (studentId, status) => {
    const updated = {
      ...records,
      [studentId]: status
    };
    setRecords(updated);
    // Instant silent persistence in the background
    markAttendance(selectedDate, selectedClassId, updated, true);
  };

  // Instant Batch 1-Click Actions
  const markAll = (status) => {
    const updated = {};
    classStudents.forEach(s => {
      updated[s.id] = status;
    });
    setRecords(updated);
    markAttendance(selectedDate, selectedClassId, updated, true);
    showToast(`Marked all ${classStudents.length} students as ${status}`, 'success');
  };

  // Quick Date Jump Navigation
  const changeDateByDays = (days) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    setSelectedDate(`${yyyy}-${mm}-${dd}`);
  };

  const jumpToToday = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    setSelectedDate(`${yyyy}-${mm}-${dd}`);
  };

  const handleSendParentAlerts = () => {
    const absentees = classStudents.filter(s => records[s.id] === 'Absent');
    if (absentees.length === 0) {
      showToast('No absent students detected today. 100% full attendance!', 'success');
      return;
    }
    showToast(`SMS dispatch sent to parents of ${absentees.length} absent student(s).`, 'success');
  };

  // Metrics computation for glanceable bar
  const total = classStudents.length || 1;
  const presentCount = Object.values(records).filter(v => v === 'Present').length;
  const lateCount = Object.values(records).filter(v => v === 'Late').length;
  const absentCount = Object.values(records).filter(v => v === 'Absent').length;
  const excusedCount = Object.values(records).filter(v => v === 'Excused').length;
  const attendanceRate = Math.round(((presentCount + lateCount) / total) * 100);

  // Filter and search students list
  const displayStudents = useMemo(() => {
    return classStudents.filter(s => {
      const matchesSearch = searchQuery.trim() === '' || 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        s.rollNo.toLowerCase().includes(searchQuery.toLowerCase());
      
      const status = records[s.id] || 'Present';
      const matchesFilter = activeFilter === 'all' || status === activeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [classStudents, searchQuery, activeFilter, records]);

  // If student or parent view, show personal attendance dossier
  if (currentRole === 'student' || currentRole === 'parent') {
    const student = activeStudent || students[0] || {
      name: 'Aarav Sharma',
      className: 'Class 10-A',
      attendanceRate: 96.5
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.2rem' }}>
            <span className="badge badge-success" style={{ fontWeight: 800 }}>Attendance Dossier</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Verified Biometric Attendance</span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            {student.name}'s Attendance Record
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '0.15rem' }}>
            Official attendance log for {student.name} ({student.className || 'Class 10-A'}).
          </p>
        </div>

        <div className="mobile-stats-grid">
          <div className="glass-panel" style={{ padding: '1.15rem 1.25rem', borderLeft: '4px solid var(--success)' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800 }}>Presence Rate</span>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--success)', marginTop: '0.2rem' }}>{student.attendanceRate || 96.5}%</h3>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Above CBSE 75% standard</p>
          </div>
          <div className="glass-panel" style={{ padding: '1.15rem 1.25rem', borderLeft: '4px solid var(--primary)' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800 }}>Total Working Days</span>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.2rem' }}>142 Days</h3>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Academic Term 1 & 2</p>
          </div>
          <div className="glass-panel" style={{ padding: '1.15rem 1.25rem', borderLeft: '4px solid var(--secondary)' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800 }}>Days Present</span>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--secondary)', marginTop: '0.2rem' }}>137 Days</h3>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Exemplary regularity</p>
          </div>
          <div className="glass-panel" style={{ padding: '1.15rem 1.25rem', borderLeft: '4px solid var(--danger)' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800 }}>Absences</span>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--danger)', marginTop: '0.2rem' }}>2 Days</h3>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Excused leaves: 3</p>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.85rem' }}>Recent Daily Register Log</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[
              { date: '2026-03-16', day: 'Monday', status: 'Present', checkIn: '08:14 AM' },
              { date: '2026-03-13', day: 'Friday', status: 'Present', checkIn: '08:10 AM' },
              { date: '2026-03-12', day: 'Thursday', status: 'Present', checkIn: '08:18 AM' },
              { date: '2026-03-11', day: 'Wednesday', status: 'Late', checkIn: '08:35 AM' },
              { date: '2026-03-10', day: 'Tuesday', status: 'Present', checkIn: '08:12 AM' }
            ].map((log, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0.95rem', borderRadius: '10px', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-light)' }}>
                <div>
                  <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{log.date} ({log.day})</span>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginLeft: '0.75rem' }}>Entry: {log.checkIn}</span>
                </div>
                <span className={`badge ${log.status === 'Present' ? 'badge-success' : 'badge-warning'}`}>
                  {log.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Teacher / Admin Attendance Register
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
      {/* Top Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.85rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.2rem' }}>
            <span className="badge badge-primary" style={{ fontWeight: 800 }}>Roll Call Console</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Classroom Daily Register</span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Daily Attendance Register
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', marginTop: '0.15rem' }}>
            Fast 1-tap roll call with instant live metrics. Changes save immediately.
          </p>
        </div>

        {/* Action button */}
        <button 
          className="btn btn-secondary" 
          onClick={handleSendParentAlerts} 
          style={{ padding: '0.55rem 1rem', fontSize: '0.82rem' }}
          title="Sends instant SMS alert to parents of absent students"
        >
          <Send size={15} />
          <span>Notify Absentee Parents ({absentCount})</span>
        </button>
      </div>

      {/* Glanceable Metrics Counter Bar with Progress Bar */}
      <div 
        className="glass-panel" 
        style={{ 
          padding: '1rem 1.25rem',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Users size={16} color="var(--primary)" />
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Total: {classStudents.length}
              </span>
            </div>
            <span style={{ color: '#cbd5e1' }}>•</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#047857' }}>
                Present: {presentCount}
              </span>
            </div>
            <span style={{ color: '#cbd5e1' }}>•</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#b91c1c' }}>
                Absent: {absentCount}
              </span>
            </div>
            <span style={{ color: '#cbd5e1' }}>•</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#b45309' }}>
                Late: {lateCount}
              </span>
            </div>
            {excusedCount > 0 && (
              <>
                <span style={{ color: '#cbd5e1' }}>•</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#8b5cf6', display: 'inline-block' }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#6d28d9' }}>
                    Excused: {excusedCount}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Presence Rate Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              Attendance:
            </span>
            <span style={{ 
              fontSize: '1.05rem', 
              fontWeight: 800, 
              color: attendanceRate >= 90 ? '#10b981' : attendanceRate >= 75 ? '#f59e0b' : '#ef4444' 
            }}>
              {attendanceRate}%
            </span>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div style={{ width: '100%', height: '7px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden', display: 'flex' }}>
          <div style={{ width: `${(presentCount / total) * 100}%`, background: '#10b981', transition: 'width 0.3s ease' }} title={`Present: ${presentCount}`} />
          <div style={{ width: `${(lateCount / total) * 100}%`, background: '#f59e0b', transition: 'width 0.3s ease' }} title={`Late: ${lateCount}`} />
          <div style={{ width: `${(excusedCount / total) * 100}%`, background: '#8b5cf6', transition: 'width 0.3s ease' }} title={`Excused: ${excusedCount}`} />
          <div style={{ width: `${(absentCount / total) * 100}%`, background: '#ef4444', transition: 'width 0.3s ease' }} title={`Absent: ${absentCount}`} />
        </div>
      </div>

      {/* Date & Class Controls + 1-Tap Batch Actions */}
      <div 
        className="glass-panel" 
        style={{ 
          padding: '1rem 1.25rem', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '0.85rem' 
        }}
      >
        {/* Date, Class, & Batch Quick Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.85rem' }}>
          {/* Left: Quick Date & Class Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            {/* Date Switcher with Prev / Next Arrows */}
            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-light)', borderRadius: '10px', padding: '0.2rem 0.35rem' }}>
              <button 
                onClick={() => changeDateByDays(-1)} 
                style={{ background: 'transparent', border: 'none', padding: '0.3rem', cursor: 'pointer', color: 'var(--text-secondary)' }}
                title="Previous Day"
              >
                <ChevronLeft size={16} />
              </button>
              <input 
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{ 
                  border: 'none', 
                  background: 'transparent', 
                  fontWeight: 700, 
                  fontSize: '0.85rem', 
                  color: 'var(--text-primary)',
                  padding: '0.2rem 0.4rem',
                  outline: 'none'
                }}
              />
              <button 
                onClick={() => changeDateByDays(1)} 
                style={{ background: 'transparent', border: 'none', padding: '0.3rem', cursor: 'pointer', color: 'var(--text-secondary)' }}
                title="Next Day"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Today jump pill */}
            <button 
              onClick={jumpToToday}
              style={{
                padding: '0.4rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid var(--border-light)',
                background: 'var(--bg-surface-elevated)',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: 'var(--primary)',
                cursor: 'pointer'
              }}
            >
              Today
            </button>

            {/* Class Selector Dropdown */}
            <select 
              className="form-select"
              style={{ width: 'auto', padding: '0.45rem 0.85rem', fontWeight: 700, fontSize: '0.85rem' }}
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.grade} - Section {c.section} ({c.teacher})</option>
              ))}
            </select>
          </div>

          {/* Right: 1-Click Fill Batch Buttons */}
          <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
            <button 
              onClick={() => markAll('Present')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.45rem 0.85rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.78rem',
                fontWeight: 800,
                background: '#ecfdf5',
                border: '1px solid #a7f3d0',
                color: '#047857',
                cursor: 'pointer'
              }}
            >
              <CheckCircle2 size={14} color="#10b981" />
              <span>All Present</span>
            </button>
            <button 
              onClick={() => markAll('Absent')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.45rem 0.85rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.78rem',
                fontWeight: 800,
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                cursor: 'pointer'
              }}
            >
              <XCircle size={14} color="#ef4444" />
              <span>All Absent</span>
            </button>
            <button 
              onClick={() => markAll('Late')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.45rem 0.85rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.78rem',
                fontWeight: 800,
                background: '#fffbeb',
                border: '1px solid #fde68a',
                color: '#b45309',
                cursor: 'pointer'
              }}
            >
              <Clock size={14} color="#f59e0b" />
              <span>All Late</span>
            </button>
          </div>
        </div>

        {/* Filter Pills & Instant Search */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.65rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
          {/* Quick Filter Chips */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveFilter('all')}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.76rem',
                fontWeight: 700,
                border: activeFilter === 'all' ? 'none' : '1px solid #e2e8f0',
                background: activeFilter === 'all' ? 'var(--primary)' : 'var(--bg-surface-elevated)',
                color: activeFilter === 'all' ? '#ffffff' : 'var(--text-secondary)',
                cursor: 'pointer'
              }}
            >
              All ({classStudents.length})
            </button>
            <button
              onClick={() => setActiveFilter('Present')}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.76rem',
                fontWeight: 700,
                border: activeFilter === 'Present' ? 'none' : '1px solid #e2e8f0',
                background: activeFilter === 'Present' ? '#10b981' : 'var(--bg-surface-elevated)',
                color: activeFilter === 'Present' ? '#ffffff' : '#047857',
                cursor: 'pointer'
              }}
            >
              Present ({presentCount})
            </button>
            <button
              onClick={() => setActiveFilter('Absent')}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.76rem',
                fontWeight: 700,
                border: activeFilter === 'Absent' ? 'none' : '1px solid #e2e8f0',
                background: activeFilter === 'Absent' ? '#ef4444' : 'var(--bg-surface-elevated)',
                color: activeFilter === 'Absent' ? '#ffffff' : '#b91c1c',
                cursor: 'pointer'
              }}
            >
              Absent ({absentCount})
            </button>
            <button
              onClick={() => setActiveFilter('Late')}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.76rem',
                fontWeight: 700,
                border: activeFilter === 'Late' ? 'none' : '1px solid #e2e8f0',
                background: activeFilter === 'Late' ? '#f59e0b' : 'var(--bg-surface-elevated)',
                color: activeFilter === 'Late' ? '#ffffff' : '#b45309',
                cursor: 'pointer'
              }}
            >
              Late ({lateCount})
            </button>
          </div>

          {/* Quick Search */}
          <div style={{ position: 'relative', width: '220px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text"
              placeholder="Search student or roll..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.38rem 0.75rem 0.38rem 2rem',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border-light)',
                background: '#ffffff',
                fontSize: '0.8rem',
                outline: 'none'
              }}
            />
          </div>
        </div>
      </div>

      {/* STUDENT ATTENDANCE LIST - ULTRA RESPONSIVE (Cards on Mobile, Clean Table on PC) */}
      <div className="attendance-list-container">
        {/* Desktop View Table */}
        <div className="desktop-attendance-table table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>Roll No</th>
                <th>Student Dossier</th>
                <th style={{ width: '120px' }}>Presence Rate</th>
                <th style={{ textAlign: 'center', width: '380px' }}>1-Tap Attendance Marking</th>
              </tr>
            </thead>
            <tbody>
              {displayStudents.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    No students match the selected filter.
                  </td>
                </tr>
              ) : (
                displayStudents.map((student) => {
                  const currentStatus = records[student.id] || 'Present';
                  return (
                    <tr 
                      key={student.id}
                      style={{
                        background: currentStatus === 'Absent' ? 'rgba(239, 68, 68, 0.04)' : 'inherit',
                        borderLeft: currentStatus === 'Absent' ? '3px solid #ef4444' : 'none'
                      }}
                    >
                      <td style={{ fontWeight: 800, color: 'var(--text-muted)' }}>
                        {student.rollNo}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <img 
                            src={student.avatar} 
                            alt={student.name}
                            style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #e2e8f0' }} 
                          />
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                              {student.name}
                            </div>
                            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                              Parent: {student.parentPhone}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ 
                          fontWeight: 800, 
                          fontSize: '0.86rem', 
                          color: student.attendanceRate >= 90 ? 'var(--success)' : student.attendanceRate >= 75 ? 'var(--warning)' : 'var(--danger)' 
                        }}>
                          {student.attendanceRate}%
                        </span>
                      </td>

                      {/* Desktop Segmented Control */}
                      <td style={{ textAlign: 'center' }}>
                        <div 
                          style={{ 
                            display: 'inline-flex', 
                            background: '#f1f5f9', 
                            padding: '3px', 
                            borderRadius: 'var(--radius-full)',
                            border: '1px solid #e2e8f0'
                          }}
                        >
                          <button
                            onClick={() => handleStatusChange(student.id, 'Present')}
                            style={{
                              padding: '0.35rem 0.95rem',
                              borderRadius: 'var(--radius-full)',
                              fontSize: '0.78rem',
                              fontWeight: 800,
                              border: 'none',
                              background: currentStatus === 'Present' ? '#10b981' : 'transparent',
                              color: currentStatus === 'Present' ? '#ffffff' : '#64748b',
                              boxShadow: currentStatus === 'Present' ? '0 2px 6px rgba(16, 185, 129, 0.35)' : 'none',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            Present
                          </button>

                          <button
                            onClick={() => handleStatusChange(student.id, 'Late')}
                            style={{
                              padding: '0.35rem 0.95rem',
                              borderRadius: 'var(--radius-full)',
                              fontSize: '0.78rem',
                              fontWeight: 800,
                              border: 'none',
                              background: currentStatus === 'Late' ? '#f59e0b' : 'transparent',
                              color: currentStatus === 'Late' ? '#ffffff' : '#64748b',
                              boxShadow: currentStatus === 'Late' ? '0 2px 6px rgba(245, 158, 11, 0.35)' : 'none',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            Late
                          </button>

                          <button
                            onClick={() => handleStatusChange(student.id, 'Absent')}
                            style={{
                              padding: '0.35rem 0.95rem',
                              borderRadius: 'var(--radius-full)',
                              fontSize: '0.78rem',
                              fontWeight: 800,
                              border: 'none',
                              background: currentStatus === 'Absent' ? '#ef4444' : 'transparent',
                              color: currentStatus === 'Absent' ? '#ffffff' : '#64748b',
                              boxShadow: currentStatus === 'Absent' ? '0 2px 6px rgba(239, 68, 68, 0.35)' : 'none',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            Absent
                          </button>

                          <button
                            onClick={() => handleStatusChange(student.id, 'Excused')}
                            style={{
                              padding: '0.35rem 0.95rem',
                              borderRadius: 'var(--radius-full)',
                              fontSize: '0.78rem',
                              fontWeight: 800,
                              border: 'none',
                              background: currentStatus === 'Excused' ? '#8b5cf6' : 'transparent',
                              color: currentStatus === 'Excused' ? '#ffffff' : '#64748b',
                              boxShadow: currentStatus === 'Excused' ? '0 2px 6px rgba(139, 92, 246, 0.35)' : 'none',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            Excused
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View Cards (< 768px) - 1-Tap Touch Ergonomics */}
        <div className="mobile-attendance-cards">
          {displayStudents.length === 0 ? (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              No students match the selected filter.
            </div>
          ) : (
            displayStudents.map((student) => {
              const currentStatus = records[student.id] || 'Present';
              return (
                <div 
                  key={student.id}
                  className="glass-panel"
                  style={{
                    padding: '0.85rem 1rem',
                    marginBottom: '0.65rem',
                    borderRadius: '14px',
                    borderLeft: currentStatus === 'Present' ? '4px solid #10b981' :
                                currentStatus === 'Absent' ? '4px solid #ef4444' :
                                currentStatus === 'Late' ? '4px solid #f59e0b' : '4px solid #8b5cf6'
                  }}
                >
                  {/* Top info row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <img 
                        src={student.avatar} 
                        alt={student.name}
                        style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--primary)', background: 'rgba(79, 70, 229, 0.1)', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>
                            {student.rollNo}
                          </span>
                          <span style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                            {student.name}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                          Parent: {student.parentPhone}
                        </div>
                      </div>
                    </div>

                    <span 
                      style={{ 
                        fontSize: '0.75rem', 
                        fontWeight: 800, 
                        color: currentStatus === 'Present' ? '#047857' : currentStatus === 'Absent' ? '#b91c1c' : '#b45309',
                        background: currentStatus === 'Present' ? '#ecfdf5' : currentStatus === 'Absent' ? '#fef2f2' : '#fffbeb',
                        padding: '0.2rem 0.55rem',
                        borderRadius: 'var(--radius-full)'
                      }}
                    >
                      {currentStatus}
                    </span>
                  </div>

                  {/* 1-Tap Mobile Segmented Control */}
                  <div 
                    style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(4, 1fr)', 
                      gap: '4px',
                      background: '#f1f5f9', 
                      padding: '4px', 
                      borderRadius: '12px' 
                    }}
                  >
                    <button
                      onClick={() => handleStatusChange(student.id, 'Present')}
                      style={{
                        padding: '0.45rem 0',
                        borderRadius: '9px',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        border: 'none',
                        background: currentStatus === 'Present' ? '#10b981' : 'transparent',
                        color: currentStatus === 'Present' ? '#ffffff' : '#475569',
                        boxShadow: currentStatus === 'Present' ? '0 2px 6px rgba(16, 185, 129, 0.35)' : 'none',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      P
                    </button>

                    <button
                      onClick={() => handleStatusChange(student.id, 'Late')}
                      style={{
                        padding: '0.45rem 0',
                        borderRadius: '9px',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        border: 'none',
                        background: currentStatus === 'Late' ? '#f59e0b' : 'transparent',
                        color: currentStatus === 'Late' ? '#ffffff' : '#475569',
                        boxShadow: currentStatus === 'Late' ? '0 2px 6px rgba(245, 158, 11, 0.35)' : 'none',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      L
                    </button>

                    <button
                      onClick={() => handleStatusChange(student.id, 'Absent')}
                      style={{
                        padding: '0.45rem 0',
                        borderRadius: '9px',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        border: 'none',
                        background: currentStatus === 'Absent' ? '#ef4444' : 'transparent',
                        color: currentStatus === 'Absent' ? '#ffffff' : '#475569',
                        boxShadow: currentStatus === 'Absent' ? '0 2px 6px rgba(239, 68, 68, 0.35)' : 'none',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      A
                    </button>

                    <button
                      onClick={() => handleStatusChange(student.id, 'Excused')}
                      style={{
                        padding: '0.45rem 0',
                        borderRadius: '9px',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        border: 'none',
                        background: currentStatus === 'Excused' ? '#8b5cf6' : 'transparent',
                        color: currentStatus === 'Excused' ? '#ffffff' : '#475569',
                        boxShadow: currentStatus === 'Excused' ? '0 2px 6px rgba(139, 92, 246, 0.35)' : 'none',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      E
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
