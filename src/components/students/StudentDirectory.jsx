import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import Modal from '../common/Modal';
import { 
  Search, 
  Filter, 
  UserPlus, 
  Eye, 
  GraduationCap, 
  Phone, 
  Mail, 
  Heart, 
  MapPin, 
  AlertCircle,
  CheckCircle2,
  Calendar,
  Sparkles
} from 'lucide-react';

export default function StudentDirectory() {
  const { students, classes, addStudent, currentRole } = useERP();

  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals state
  const [viewingStudent, setViewingStudent] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Student Form State
  const [formData, setFormData] = useState({
    name: '',
    gender: 'Male',
    dob: '2009-01-01',
    bloodGroup: 'O+',
    classId: 'cls-10a',
    className: 'Grade 10-A',
    parentName: '',
    parentEmail: '',
    parentPhone: '',
    address: '',
    medicalNotes: 'None'
  });

  // Filtered students
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.admissionNo.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesClass = selectedClass === 'all' || student.classId === selectedClass;
    const matchesStatus = selectedStatus === 'all' || student.feeStatus === selectedStatus;

    return matchesSearch && matchesClass && matchesStatus;
  });

  const handleClassChange = (e) => {
    const cid = e.target.value;
    const cls = classes.find(c => c.id === cid);
    setFormData(prev => ({
      ...prev,
      classId: cid,
      className: cls ? `${cls.grade}-${cls.section}` : 'Grade 10-A'
    }));
  };

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.parentName) {
      alert('Please fill out the student name and guardian details.');
      return;
    }
    await addStudent({
      ...formData,
      rollNo: `10A-${Math.floor(10 + Math.random() * 89)}`
    });
    setIsAddModalOpen(false);
    setFormData({
      name: '',
      gender: 'Male',
      dob: '2009-01-01',
      bloodGroup: 'O+',
      classId: 'cls-10a',
      className: 'Grade 10-A',
      parentName: '',
      parentEmail: '',
      parentPhone: '',
      address: '',
      medicalNotes: 'None'
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Student Information System (SIS)</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Comprehensive directory, enrollment rosters, academic dossiers, and admission management.
          </p>
        </div>

        {currentRole === 'admin' && (
          <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
            <UserPlus size={16} />
            <span>Admit New Student</span>
          </button>
        )}
      </div>

      {/* Filter and Search Controls Bar */}
      <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '280px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text"
              className="form-input"
              placeholder="Search by student name, roll number, or admission ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.4rem' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <select 
            className="form-select" 
            style={{ width: 'auto' }}
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="all">All Classes & Wings</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.grade} - Section {c.section} ({c.room})</option>
            ))}
          </select>

          <select 
            className="form-select" 
            style={{ width: 'auto' }}
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">All Fee Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Partial">Partial Due</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>
      </div>

      {/* Student Directory Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Student Dossier</th>
              <th>Class / Section</th>
              <th>Guardian / Emergency</th>
              <th>CGPA (10.0)</th>
              <th>Attendance</th>
              <th>Fee Ledger</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No student records match your query.
                </td>
              </tr>
            ) : (
              filteredStudents.map((student) => (
                <tr key={student.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <img 
                        src={student.avatar} 
                        alt={student.name}
                        style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border-glass)' }}
                      />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{student.name}</div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                          Roll: <strong>{student.rollNo}</strong> • {student.admissionNo}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-primary">{student.className}</span>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{student.parentName}</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{student.parentPhone}</div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 800, fontSize: '0.95rem', color: student.gpa >= 9.0 ? 'var(--primary-light)' : 'var(--text-primary)' }}>
                      {student.gpa.toFixed(2)} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/ 10</span>
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '65px', height: '6px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                        <div 
                          style={{ 
                            width: `${student.attendanceRate}%`, 
                            height: '100%', 
                            background: student.attendanceRate >= 90 ? 'var(--success)' : student.attendanceRate >= 75 ? 'var(--warning)' : 'var(--danger)' 
                          }} 
                        />
                      </div>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{student.attendanceRate}%</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${
                      student.feeStatus === 'Paid' ? 'badge-success' :
                      student.feeStatus === 'Partial' ? 'badge-warning' : 'badge-danger'
                    }`}>
                      {student.feeStatus}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button 
                      className="btn btn-secondary" 
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.78rem' }}
                      onClick={() => setViewingStudent(student)}
                    >
                      <Eye size={14} />
                      <span>View Dossier</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Student Dossier Modal */}
      {viewingStudent && (
        <Modal
          isOpen={!!viewingStudent}
          onClose={() => setViewingStudent(null)}
          title="Student Academic & Health Dossier"
          subtitle={`Official Record #${viewingStudent.admissionNo}`}
          maxWidth="680px"
          footer={
            <button className="btn btn-secondary" onClick={() => setViewingStudent(null)}>
              Close Dossier
            </button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Top Profile Card */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.25rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)' }}>
              <img 
                src={viewingStudent.avatar} 
                alt={viewingStudent.name}
                style={{ width: '72px', height: '72px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary-light)' }} 
              />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: '1.35rem', fontWeight: 800 }}>{viewingStudent.name}</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Enrolled in {viewingStudent.className} • Roll {viewingStudent.rollNo}
                    </p>
                  </div>
                  <span className="badge badge-success">{viewingStudent.status}</span>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.65rem' }}>
                  <span className="badge badge-primary">Blood Group: {viewingStudent.bloodGroup}</span>
                  <span className="badge badge-purple">CGPA: {viewingStudent.gpa.toFixed(2)} / 10</span>
                  <span className="badge badge-warning">DOB: {viewingStudent.dob}</span>
                </div>
              </div>
            </div>

            {/* Guardian & Contact Information */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ padding: '1rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface-elevated)' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                  Parent / Guardian
                </h4>
                <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{viewingStudent.parentName}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                  <Phone size={13} /> {viewingStudent.parentPhone}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  <Mail size={13} /> {viewingStudent.parentEmail}
                </div>
              </div>

              <div style={{ padding: '1rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface-elevated)' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                  Residential Address
                </h4>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem', fontSize: '0.85rem' }}>
                  <MapPin size={16} color="var(--primary-light)" style={{ marginTop: '0.2rem', flexShrink: 0 }} />
                  <span>{viewingStudent.address}</span>
                </div>
              </div>
            </div>

            {/* Health & Clinical Notes */}
            <div style={{ padding: '1rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-light)' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--secondary)', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Heart size={14} /> Medical & Nurse Clinic Observations
              </h4>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-primary)' }}>
                {viewingStudent.medicalNotes}
              </p>
            </div>
          </div>
        </Modal>
      )}

      {/* New Student Admission Form Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Student Admission & Enrollment Form"
        subtitle="Registers student into SIS with automatic Cloud Firestore synchronization"
        maxWidth="680px"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleCreateStudent}>
              <CheckCircle2 size={16} />
              <span>Complete Admission</span>
            </button>
          </>
        }
      >
        <form onSubmit={handleCreateStudent} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Full Name of Student *</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. Liam Benjamin" 
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Assign Class & Section *</label>
              <select 
                className="form-select" 
                value={formData.classId}
                onChange={handleClassChange}
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.grade} - Section {c.section}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Gender</label>
              <select 
                className="form-select" 
                value={formData.gender}
                onChange={e => setFormData({ ...formData, gender: e.target.value })}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Date of Birth</label>
              <input 
                type="date" 
                className="form-input" 
                value={formData.dob}
                onChange={e => setFormData({ ...formData, dob: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Blood Group</label>
              <select 
                className="form-select" 
                value={formData.bloodGroup}
                onChange={e => setFormData({ ...formData, bloodGroup: e.target.value })}
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '0.85rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary-light)', textTransform: 'uppercase' }}>
              Guardian & Emergency Contact
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Guardian Full Name *</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Parent or Guardian Name" 
                required
                value={formData.parentName}
                onChange={e => setFormData({ ...formData, parentName: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contact Phone Number *</label>
              <input 
                type="tel" 
                className="form-input" 
                placeholder="+1 (555) 000-0000" 
                required
                value={formData.parentPhone}
                onChange={e => setFormData({ ...formData, parentPhone: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Guardian Email Address</label>
            <input 
              type="email" 
              className="form-input" 
              placeholder="guardian@example.com" 
              value={formData.parentEmail}
              onChange={e => setFormData({ ...formData, parentEmail: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Home Residential Address</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Street address, city, sector" 
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Medical & Dietary Allergies (Optional)</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. Peanut allergy, Asthma inhaler required" 
              value={formData.medicalNotes}
              onChange={e => setFormData({ ...formData, medicalNotes: e.target.value })}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
