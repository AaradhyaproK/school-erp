import React, { useState, useEffect } from 'react';
import { useERP } from '../../context/ERPContext';
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  HelpCircle, 
  Save, 
  Send, 
  Sparkles,
  Users,
  ShieldCheck
} from 'lucide-react';

export default function AttendanceTracker() {
  const { students, classes, attendance, markAttendance, showToast, currentRole, activeStudent } = useERP();

  const [selectedDate, setSelectedDate] = useState('2026-03-16');
  const [selectedClassId, setSelectedClassId] = useState('cls-10a');
  const [records, setRecords] = useState({});

  // Filter students for the selected class
  const classStudents = students.filter(s => s.classId === selectedClassId);

  // Load existing records for the date and class
  useEffect(() => {
    const key = `${selectedDate}_${selectedClassId}`;
    const existing = attendance[key];
    if (existing && existing.records) {
      setRecords(existing.records);
    } else {
      // Default to Present for all
      const initial = {};
      classStudents.forEach(s => {
        initial[s.id] = 'Present';
      });
      setRecords(initial);
    }
  }, [selectedDate, selectedClassId, attendance, students]);

  const handleStatusChange = (studentId, status) => {
    setRecords(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const markAll = (status) => {
    const updated = {};
    classStudents.forEach(s => {
      updated[s.id] = status;
    });
    setRecords(updated);
    showToast(`Marked all ${classStudents.length} students as ${status}`);
  };

  const handleSave = async () => {
    await markAttendance(selectedDate, selectedClassId, records);
  };

  const handleSendParentAlerts = () => {
    const absentees = classStudents.filter(s => records[s.id] === 'Absent');
    if (absentees.length === 0) {
      showToast('No absent students detected today. Great attendance!', 'success');
      return;
    }
    showToast(`Instant SMS alert dispatched to parents of ${absentees.length} absent students.`);
  };

  // Metrics computation
  const total = classStudents.length || 1;
  const presentCount = Object.values(records).filter(v => v === 'Present').length;
  const lateCount = Object.values(records).filter(v => v === 'Late').length;
  const absentCount = Object.values(records).filter(v => v === 'Absent').length;
  const excusedCount = Object.values(records).filter(v => v === 'Excused').length;
  const attendanceRate = Math.round(((presentCount + lateCount) / total) * 100);

  // If student or parent view, show their personal attendance record
  if (currentRole === 'student' || currentRole === 'parent') {
    const student = activeStudent;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Attendance Dossier</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Official attendance log for {student.name} ({student.className}).
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Presence Rate</span>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--success)', marginTop: '0.25rem' }}>{student.attendanceRate}%</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Above CBSE / State 75% norm</p>
          </div>
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Total Working Days</span>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '0.25rem' }}>142 Days</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Academic Term 1 & 2</p>
          </div>
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Days Present</span>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary-light)', marginTop: '0.25rem' }}>137 Days</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Full attendance badge</p>
          </div>
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Unexcused Absences</span>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--danger)', marginTop: '0.25rem' }}>2 Days</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sick leaves excused: 3</p>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Recent Daily Log</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {[
              { date: '2026-03-16', day: 'Monday', status: 'Present', checkIn: '08:14 AM' },
              { date: '2026-03-13', day: 'Friday', status: 'Present', checkIn: '08:10 AM' },
              { date: '2026-03-12', day: 'Thursday', status: 'Present', checkIn: '08:18 AM' },
              { date: '2026-03-11', day: 'Wednesday', status: 'Late', checkIn: '08:35 AM' },
              { date: '2026-03-10', day: 'Tuesday', status: 'Present', checkIn: '08:12 AM' }
            ].map((log, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface-elevated)' }}>
                <div>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{log.date} ({log.day})</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.75rem' }}>Check-in: {log.checkIn}</span>
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Daily Attendance Register</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Multi-period attendance recording, automated absence alert dispatch, and live cloud synchronization.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={handleSendParentAlerts} title="Simulates dispatching SMS alert to parents of absent students">
            <Send size={16} />
            <span>Notify Absentee Parents</span>
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            <Save size={16} />
            <span>Save & Sync to Firestore</span>
          </button>
        </div>
      </div>

      {/* Selector & Quick Mark Controls */}
      <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={18} color="var(--primary-light)" />
            <input 
              type="date"
              className="form-input"
              style={{ width: 'auto' }}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          <select 
            className="form-select"
            style={{ width: 'auto' }}
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
          >
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.grade} - Section {c.section} ({c.teacher})</option>
            ))}
          </select>
        </div>

        {/* 1-Click Batch Actions */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }} onClick={() => markAll('Present')}>
            <CheckCircle2 size={15} color="var(--success)" />
            <span>Mark All Present</span>
          </button>
          <button className="btn btn-secondary" style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }} onClick={() => markAll('Late')}>
            <Clock size={15} color="var(--warning)" />
            <span>All Late</span>
          </button>
          <button className="btn btn-secondary" style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }} onClick={() => markAll('Absent')}>
            <XCircle size={15} color="var(--danger)" />
            <span>All Absent</span>
          </button>
        </div>
      </div>

      {/* Real-time Attendance Metrics Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
        <div className="glass-panel" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-sm)', background: 'var(--success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)' }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Present</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--success)' }}>{presentCount}</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-sm)', background: 'var(--warning-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--warning)' }}>
            <Clock size={22} />
          </div>
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Late</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--warning)' }}>{lateCount}</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-sm)', background: 'var(--danger-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--danger)' }}>
            <XCircle size={22} />
          </div>
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Absent</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--danger)' }}>{absentCount}</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-sm)', background: 'var(--purple-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--purple)' }}>
            <HelpCircle size={22} />
          </div>
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Excused</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--purple)' }}>{excusedCount}</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-sm)', background: 'rgba(99, 102, 241, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-light)' }}>
            <ShieldCheck size={22} />
          </div>
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Presence %</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary-light)' }}>{attendanceRate}%</div>
          </div>
        </div>
      </div>

      {/* Attendance Roster Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Roll No</th>
              <th>Student</th>
              <th>Overall %</th>
              <th style={{ textAlign: 'center' }}>Present</th>
              <th style={{ textAlign: 'center' }}>Late</th>
              <th style={{ textAlign: 'center' }}>Absent</th>
              <th style={{ textAlign: 'center' }}>Excused</th>
            </tr>
          </thead>
          <tbody>
            {classStudents.map((student) => {
              const currentStatus = records[student.id] || 'Present';
              return (
                <tr key={student.id}>
                  <td style={{ fontWeight: 700, width: '100px' }}>
                    {student.rollNo}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img 
                        src={student.avatar} 
                        alt={student.name}
                        style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} 
                      />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{student.name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Emergency: {student.parentPhone}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: student.attendanceRate >= 90 ? 'var(--success)' : 'var(--warning)' }}>
                      {student.attendanceRate}%
                    </span>
                  </td>
                  
                  {/* Status Selection Buttons */}
                  <td style={{ textAlign: 'center' }}>
                    <button
                      onClick={() => handleStatusChange(student.id, 'Present')}
                      style={{
                        padding: '0.35rem 0.75rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        border: '1px solid',
                        borderColor: currentStatus === 'Present' ? 'var(--success)' : 'var(--border-glass)',
                        background: currentStatus === 'Present' ? 'var(--success-bg)' : 'transparent',
                        color: currentStatus === 'Present' ? 'var(--success)' : 'var(--text-muted)',
                        cursor: 'pointer'
                      }}
                    >
                      Present
                    </button>
                  </td>

                  <td style={{ textAlign: 'center' }}>
                    <button
                      onClick={() => handleStatusChange(student.id, 'Late')}
                      style={{
                        padding: '0.35rem 0.75rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        border: '1px solid',
                        borderColor: currentStatus === 'Late' ? 'var(--warning)' : 'var(--border-glass)',
                        background: currentStatus === 'Late' ? 'var(--warning-bg)' : 'transparent',
                        color: currentStatus === 'Late' ? 'var(--warning)' : 'var(--text-muted)',
                        cursor: 'pointer'
                      }}
                    >
                      Late
                    </button>
                  </td>

                  <td style={{ textAlign: 'center' }}>
                    <button
                      onClick={() => handleStatusChange(student.id, 'Absent')}
                      style={{
                        padding: '0.35rem 0.75rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        border: '1px solid',
                        borderColor: currentStatus === 'Absent' ? 'var(--danger)' : 'var(--border-glass)',
                        background: currentStatus === 'Absent' ? 'var(--danger-bg)' : 'transparent',
                        color: currentStatus === 'Absent' ? 'var(--danger)' : 'var(--text-muted)',
                        cursor: 'pointer'
                      }}
                    >
                      Absent
                    </button>
                  </td>

                  <td style={{ textAlign: 'center' }}>
                    <button
                      onClick={() => handleStatusChange(student.id, 'Excused')}
                      style={{
                        padding: '0.35rem 0.75rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        border: '1px solid',
                        borderColor: currentStatus === 'Excused' ? 'var(--purple)' : 'var(--border-glass)',
                        background: currentStatus === 'Excused' ? 'var(--purple-bg)' : 'transparent',
                        color: currentStatus === 'Excused' ? 'var(--purple)' : 'var(--text-muted)',
                        cursor: 'pointer'
                      }}
                    >
                      Excused
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
