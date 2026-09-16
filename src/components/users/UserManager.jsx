import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import Modal from '../common/Modal';
import { 
  UserCog, 
  UserPlus, 
  Search, 
  ShieldCheck, 
  UserCheck, 
  GraduationCap, 
  HeartHandshake, 
  Calculator, 
  BookOpen, 
  Mail, 
  Key, 
  CheckCircle2, 
  Sparkles,
  Lock
} from 'lucide-react';

export default function UserManager() {
  const { users, createUser } = useERP();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'teacher',
    designation: '',
    department: 'Secondary Wing',
    password: ''
  });

  const rolesList = [
    { id: 'all', label: 'All Roles' },
    { id: 'admin', label: 'Super Admin', icon: ShieldCheck, color: 'var(--primary)' },
    { id: 'teacher', label: 'Faculty / Teacher', icon: UserCheck, color: 'var(--secondary)' },
    { id: 'student', label: 'Student', icon: GraduationCap, color: 'var(--success)' },
    { id: 'parent', label: 'Parent / Guardian', icon: HeartHandshake, color: 'var(--purple)' },
    { id: 'accountant', label: 'Accountant / Bursar', icon: Calculator, color: 'var(--warning)' },
    { id: 'librarian', label: 'Librarian / Media Officer', icon: BookOpen, color: '#38bdf8' }
  ];

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.designation?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      alert('Please fill out user name, email, and password.');
      return;
    }
    await createUser(formData);
    setIsCreateModalOpen(false);
    setFormData({
      name: '',
      email: '',
      role: 'teacher',
      designation: '',
      department: 'Secondary Wing',
      password: ''
    });
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return <span className="badge badge-primary"><ShieldCheck size={12} /> Super Admin</span>;
      case 'teacher':
        return <span className="badge" style={{ background: 'rgba(14, 165, 233, 0.15)', color: 'var(--secondary)', border: '1px solid rgba(14, 165, 233, 0.3)' }}><UserCheck size={12} /> Faculty</span>;
      case 'student':
        return <span className="badge badge-success"><GraduationCap size={12} /> Student</span>;
      case 'parent':
        return <span className="badge badge-purple"><HeartHandshake size={12} /> Parent</span>;
      case 'accountant':
        return <span className="badge badge-warning"><Calculator size={12} /> Accountant</span>;
      case 'librarian':
        return <span className="badge" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)' }}><BookOpen size={12} /> Librarian</span>;
      default:
        return <span className="badge">{role}</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>User Management & Role Access Control (RBAC)</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Provision and audit system accounts for Super Admins, Teachers, Students, Parents, Accountants, and Librarians.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setIsCreateModalOpen(true)}>
          <UserPlus size={16} />
          <span>Provision New User</span>
        </button>
      </div>

      {/* Role Counts Summary Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
        {[
          { role: 'Super Admins', count: users.filter(u => u.role === 'admin').length, color: 'var(--primary-light)', bg: 'rgba(99, 102, 241, 0.12)' },
          { role: 'Faculty / Staff', count: users.filter(u => u.role === 'teacher').length, color: 'var(--secondary)', bg: 'rgba(14, 165, 233, 0.12)' },
          { role: 'Students', count: users.filter(u => u.role === 'student').length, color: 'var(--success)', bg: 'var(--success-bg)' },
          { role: 'Parents', count: users.filter(u => u.role === 'parent').length, color: 'var(--purple)', bg: 'var(--purple-bg)' },
          { role: 'Finance / Bursar', count: users.filter(u => u.role === 'accountant').length, color: 'var(--warning)', bg: 'var(--warning-bg)' },
          { role: 'Library Desk', count: users.filter(u => u.role === 'librarian').length, color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.12)' }
        ].map((item, idx) => (
          <div key={idx} className="glass-panel" style={{ padding: '1rem', borderLeft: `3px solid ${item.color}` }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>{item.role}</span>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: item.color, marginTop: '0.2rem' }}>{item.count} Accounts</div>
          </div>
        ))}
      </div>

      {/* Search & Role Filter Tabs */}
      <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '280px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text"
              className="form-input"
              placeholder="Search user accounts by name, email, or designation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.4rem' }}
            />
          </div>
        </div>

        <select 
          className="form-select"
          style={{ width: 'auto' }}
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
        >
          {rolesList.map(r => (
            <option key={r.id} value={r.id}>{r.label}</option>
          ))}
        </select>
      </div>

      {/* User Directory Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>User Persona</th>
              <th>System Role</th>
              <th>Designation / Function</th>
              <th>Department / Wing</th>
              <th>Status</th>
              <th>Last Active</th>
              <th style={{ textAlign: 'right' }}>Security Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <img 
                      src={user.avatar} 
                      alt={user.name} 
                      style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border-glass)' }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{user.name}</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{user.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  {getRoleBadge(user.role)}
                </td>
                <td style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                  {user.designation || 'Staff Member'}
                </td>
                <td>
                  <span className="badge">{user.department || 'General'}</span>
                </td>
                <td>
                  <span className="badge badge-success">
                    <CheckCircle2 size={11} /> {user.status}
                  </span>
                </td>
                <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {user.lastLogin}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <span className="badge badge-primary" style={{ fontSize: '0.72rem' }}>
                    <Lock size={10} /> 2FA Active
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Provision New User Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Provision New School User & Assign Role"
        subtitle="Generates user credentials and syncs permissions into Cloud Firestore"
        maxWidth="620px"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleCreateUser}>
              <UserPlus size={16} />
              <span>Provision User Account</span>
            </button>
          </>
        }
      >
        <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. Jordan Mitchell"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input 
                type="email" 
                className="form-input" 
                placeholder="staff.name@dpga.edu.in"
                required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">System Role (RBAC) *</label>
              <select 
                className="form-select"
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="admin">Super Admin (Full Administrative Authority)</option>
                <option value="accountant">Accountant / Bursar (Billing & Payroll)</option>
                <option value="librarian">Librarian (Library Circulation Desk)</option>
                <option value="teacher">Faculty / Teacher (Classes & Grades)</option>
                <option value="student">Student (Learning Portal)</option>
                <option value="parent">Parent / Guardian (Child Progress)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Initial Password / PIN *</label>
              <input 
                type="password" 
                className="form-input" 
                placeholder="Temporary access code"
                required
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Designation Title</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. Senior Accountant / Head Librarian"
                value={formData.designation}
                onChange={e => setFormData({ ...formData, designation: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Department / Wing</label>
              <select 
                className="form-select"
                value={formData.department}
                onChange={e => setFormData({ ...formData, department: e.target.value })}
              >
                <option value="Finance & Accounts Bureau">Finance & Accounts Bureau</option>
                <option value="Learning Resources Center">Learning Resources Center</option>
                <option value="Executive Board">Executive Board</option>
                <option value="Science & Mathematics">Science & Mathematics</option>
                <option value="Humanities & Arts">Humanities & Arts</option>
                <option value="Physical Education">Physical Education</option>
                <option value="Secondary Wing">Secondary Wing</option>
              </select>
            </div>
          </div>

          <div style={{ padding: '0.85rem', borderRadius: 'var(--radius-sm)', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(14, 165, 233, 0.08) 100%)', border: '1px solid rgba(99, 102, 241, 0.25)', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Sparkles size={18} color="var(--primary-light)" />
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Assigning a role automatically updates navigation visibility and permissions in the portal navbar and sidebar.
            </span>
          </div>
        </form>
      </Modal>
    </div>
  );
}
