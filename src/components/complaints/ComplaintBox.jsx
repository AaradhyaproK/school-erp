import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import Modal from '../common/Modal';
import { 
  MessageSquareWarning, 
  Send, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ShieldAlert, 
  Filter, 
  Search, 
  UserCheck, 
  UserX, 
  Check, 
  FileText, 
  Sparkles, 
  Building2, 
  Bus, 
  GraduationCap, 
  HeartHandshake, 
  Layers 
} from 'lucide-react';

export default function ComplaintBox() {
  const { complaints, fileComplaint, resolveComplaint, currentRole, activeStudent, activeTeacher, schoolInfo } = useERP();

  const [activeTab, setActiveTab] = useState(currentRole === 'admin' ? 'all-complaints' : 'file-complaint');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Triage Modal state for Admin
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [triageStatus, setTriageStatus] = useState('Under Investigation');
  const [triageOfficer, setTriageOfficer] = useState('');
  const [triageRemarks, setTriageRemarks] = useState('');

  // Form State for Lodging a Complaint
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [category, setCategory] = useState('Academics & Teaching');
  const [priority, setPriority] = useState('Medium');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contactNumber, setContactNumber] = useState('');

  // Current user's identity details
  const getComplainantDetails = () => {
    if (isAnonymous) {
      return {
        name: 'Confidential (Anonymous Complainant)',
        role: currentRole,
        studentName: 'Confidential',
        className: 'Confidential',
        contact: null
      };
    }
    if (currentRole === 'student') {
      return {
        name: activeStudent?.name || 'Aarav Sharma',
        role: 'student',
        studentName: activeStudent?.name,
        className: activeStudent?.className,
        contact: contactNumber || '+91 98101 23456'
      };
    }
    if (currentRole === 'parent') {
      return {
        name: `Parent of ${activeStudent?.name || 'Student'}`,
        role: 'parent',
        studentName: activeStudent?.name,
        className: activeStudent?.className,
        contact: contactNumber || '+91 98112 98765'
      };
    }
    if (currentRole === 'teacher') {
      return {
        name: activeTeacher?.name || 'Faculty Member',
        role: 'teacher',
        studentName: null,
        className: activeTeacher?.department,
        contact: contactNumber || '+91 98123 45678'
      };
    }
    return {
      name: 'School Staff Member',
      role: currentRole,
      studentName: null,
      className: 'Staff Directorate',
      contact: contactNumber || '+91 98765 43210'
    };
  };

  const handleLodgeComplaint = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      alert('Please provide a title and detailed description.');
      return;
    }

    const complainant = getComplainantDetails();

    await fileComplaint({
      title,
      category,
      priority,
      filedByRole: currentRole,
      complainantName: complainant.name,
      studentName: complainant.studentName,
      className: complainant.className,
      isAnonymous,
      contactNumber: complainant.contact,
      description
    });

    // Reset Form
    setTitle('');
    setDescription('');
    setContactNumber('');
    setIsAnonymous(false);
    setActiveTab('my-complaints');
  };

  const handleOpenTriage = (ticket) => {
    setSelectedTicket(ticket);
    setTriageStatus(ticket.status || 'Under Investigation');
    setTriageOfficer(ticket.assignedOfficer || 'Dr. Rajeshwar Sharma (Principal)');
    setTriageRemarks(ticket.adminRemarks || '');
  };

  const handleSaveTriage = async (e) => {
    e.preventDefault();
    if (!selectedTicket) return;

    await resolveComplaint(selectedTicket.id, {
      status: triageStatus,
      assignedOfficer: triageOfficer,
      adminRemarks: triageRemarks
    });

    setSelectedTicket(null);
  };

  // Filter complaints
  const filteredComplaints = complaints.filter(c => {
    if (filterStatus !== 'all' && c.status !== filterStatus) return false;
    if (filterCategory !== 'all' && c.category !== filterCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = c.title.toLowerCase().includes(q);
      const matchNo = (c.ticketNo || '').toLowerCase().includes(q);
      const matchDesc = c.description.toLowerCase().includes(q);
      const matchName = (c.complainantName || '').toLowerCase().includes(q);
      return matchTitle || matchNo || matchDesc || matchName;
    }
    return true;
  });

  const myComplaints = complaints.filter(c => {
    if (currentRole === 'student') return c.studentName === activeStudent?.name;
    if (currentRole === 'parent') return c.studentName === activeStudent?.name || c.filedByRole === 'parent';
    if (currentRole === 'teacher') return c.filedByRole === 'teacher';
    return true;
  });

  // KPI Metrics
  const totalTickets = complaints.length;
  const openTickets = complaints.filter(c => c.status === 'Open').length;
  const investigatingTickets = complaints.filter(c => c.status === 'Under Investigation').length;
  const resolvedTickets = complaints.filter(c => c.status === 'Resolved').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <MessageSquareWarning color="var(--danger)" size={28} />
            <span>Central Grievance & Complaint Redressal Cell</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            CBSE Ombudsman compliant grievance system for students, parents, faculty, and administrative staff.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="tab-group" style={{ display: 'flex', gap: '0.5rem' }}>
          {currentRole === 'admin' ? (
            <button 
              className={`tab-btn ${activeTab === 'all-complaints' ? 'active' : ''}`}
              onClick={() => setActiveTab('all-complaints')}
            >
              <Layers size={15} />
              <span>Admin Triage Console ({complaints.length})</span>
            </button>
          ) : (
            <>
              <button 
                className={`tab-btn ${activeTab === 'file-complaint' ? 'active' : ''}`}
                onClick={() => setActiveTab('file-complaint')}
              >
                <Send size={15} />
                <span>Lodge New Grievance</span>
              </button>
              <button 
                className={`tab-btn ${activeTab === 'my-complaints' ? 'active' : ''}`}
                onClick={() => setActiveTab('my-complaints')}
              >
                <FileText size={15} />
                <span>My Submitted Tickets ({myComplaints.length})</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Total Registered</span>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '0.25rem' }}>{totalTickets} Tickets</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Academic Session 2025-26</p>
        </div>
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Pending Initial Review</span>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: openTickets > 0 ? 'var(--danger)' : 'var(--success)', marginTop: '0.25rem' }}>
            {openTickets} Open
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Immediate Ombudsman Attention</p>
        </div>
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Under Active Investigation</span>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--warning)', marginTop: '0.25rem' }}>
            {investigatingTickets} Active
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Dispatched to Committee</p>
        </div>
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Resolved & Closed</span>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--success)', marginTop: '0.25rem' }}>
            {resolvedTickets} Closed
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {Math.round((resolvedTickets / (totalTickets || 1)) * 100)}% Redressal Rate
          </p>
        </div>
      </div>

      {/* Mode A: LODGE NEW COMPLAINT (Student / Parent / Faculty) */}
      {activeTab === 'file-complaint' && (
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <div style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Submit an Official Grievance</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Your submission will be registered in the confidential registry and reviewed by the Principal and the School Redressal Committee.
            </p>
          </div>

          <form onSubmit={handleLodgeComplaint} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Category & Priority */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Grievance Category *</label>
                <select 
                  className="form-select"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                >
                  <option value="Academics & Teaching">Academics & Curriculum Delivery</option>
                  <option value="Transport & Bus">School Bus Fleet & Transit Timings</option>
                  <option value="Infrastructure & IT">Smartboards, Electricity & Campus Infrastructure</option>
                  <option value="Health & Sanitation">Drinking Water, Washroom Sanitation & Hygiene</option>
                  <option value="Canteen & Nutrition">Cafeteria Food Quality & Cleanliness</option>
                  <option value="Fee & Accounts">Fee Receipts, Discrepancies & Accounts</option>
                  <option value="Library & Academics">Library Resources & Books Availability</option>
                  <option value="Discipline & Safety">Student Safety, Anti-Bullying & Discipline</option>
                  <option value="Other">Other Institutional Matter</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Urgency & Priority Level *</label>
                <select 
                  className="form-select"
                  value={priority}
                  onChange={e => setPriority(e.target.value)}
                >
                  <option value="Routine">Routine (Resolution within 5 working days)</option>
                  <option value="Medium">Medium Priority (Resolution within 48 hours)</option>
                  <option value="High">High / Urgent (Action within 24 hours)</option>
                </select>
              </div>
            </div>

            {/* Title */}
            <div className="form-group">
              <label className="form-label">Subject / Issue Summary *</label>
              <input 
                type="text" 
                className="form-input" 
                required
                placeholder="e.g., School Bus Route 2 delayed at Noida Sec 62, or Lab microscope adjustment"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">Detailed Description of Incident / Grievance *</label>
              <textarea 
                className="form-input" 
                rows={4}
                required
                placeholder="Kindly describe what happened, relevant room numbers, bus stop, dates, and any mentors or supervisors involved..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                style={{ resize: 'vertical' }}
              />
            </div>

            {/* Anonymity & Contact Information */}
            <div style={{ padding: '1.1rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-glass)', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  {isAnonymous ? <UserX size={20} color="var(--warning)" /> : <UserCheck size={20} color="var(--success)" />}
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                      {isAnonymous ? 'Lodging Anonymously (Whistleblower Mode)' : 'Standard Disclosure (Identity Shared with Committee)'}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      {isAnonymous 
                        ? 'Your name and contact details will be completely hidden from the administration.' 
                        : `Logged under: ${getComplainantDetails().name} (${getComplainantDetails().className || currentRole})`}
                    </div>
                  </div>
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}>
                  <input 
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={e => setIsAnonymous(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                  />
                  <span>Keep My Identity Anonymous</span>
                </label>
              </div>

              {!isAnonymous && (
                <div className="form-group" style={{ marginBottom: 0, marginTop: '0.35rem' }}>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Contact Mobile Number for Resolution Updates (Optional)</label>
                  <input 
                    type="tel"
                    className="form-input"
                    placeholder="+91 98XXX XXXXX"
                    value={contactNumber}
                    onChange={e => setContactNumber(e.target.value)}
                  />
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button type="submit" className="btn btn-primary" style={{ padding: '0.65rem 1.5rem', fontSize: '0.9rem' }}>
                <Send size={16} />
                <span>Submit Grievance to Ombudsman Cell</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Mode B: ALL COMPLAINTS TABLE (Super Admin & Triage View) */}
      {(activeTab === 'all-complaints' || currentRole === 'admin') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Filters Bar */}
          <div className="glass-panel" style={{ padding: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.85rem', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '280px' }}>
              <div style={{ position: 'relative', width: '100%' }}>
                <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text"
                  className="form-input"
                  placeholder="Search grievance tickets by ticket #, subject, student name..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ paddingLeft: '2.4rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <select 
                className="form-select"
                style={{ width: 'auto', fontSize: '0.82rem' }}
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="Open">Open</option>
                <option value="Under Investigation">Under Investigation</option>
                <option value="Resolved">Resolved</option>
              </select>

              <select 
                className="form-select"
                style={{ width: 'auto', fontSize: '0.82rem' }}
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="Academics & Teaching">Academics</option>
                <option value="Transport & Bus">Transport</option>
                <option value="Infrastructure & IT">Infrastructure</option>
                <option value="Health & Sanitation">Health & Sanitation</option>
                <option value="Library & Academics">Library</option>
                <option value="Fee & Accounts">Fee & Accounts</option>
              </select>
            </div>
          </div>

          {/* Grievance Ledger Table */}
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ticket #</th>
                  <th>Category & Priority</th>
                  <th>Subject & Description</th>
                  <th>Complainant</th>
                  <th>Assigned Redressal Officer</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredComplaints.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No grievance tickets found matching the specified criteria.
                    </td>
                  </tr>
                ) : (
                  filteredComplaints.map(ticket => {
                    const isUrgent = ticket.priority === 'High' || ticket.priority === 'Urgent';
                    return (
                      <tr key={ticket.id}>
                        <td>
                          <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>{ticket.ticketNo}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{ticket.date}</div>
                        </td>
                        <td>
                          <span className="badge badge-primary">{ticket.category}</span>
                          <div style={{ marginTop: '0.25rem' }}>
                            <span className={`badge ${isUrgent ? 'badge-danger' : ticket.priority === 'Medium' ? 'badge-warning' : 'badge-secondary'}`} style={{ fontSize: '0.68rem' }}>
                              {ticket.priority} Priority
                            </span>
                          </div>
                        </td>
                        <td style={{ maxWidth: '300px' }}>
                          <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{ticket.title}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {ticket.description}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: '0.84rem' }}>{ticket.complainantName}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            {ticket.isAnonymous ? 'Confidential Identity' : `Role: ${ticket.filedByRole.toUpperCase()}`}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{ticket.assignedOfficer || 'Principal Cell'}</div>
                          {ticket.resolutionDate && (
                            <div style={{ fontSize: '0.7rem', color: 'var(--success)' }}>Closed: {ticket.resolutionDate}</div>
                          )}
                        </td>
                        <td>
                          <span className={`badge ${
                            ticket.status === 'Resolved' ? 'badge-success' :
                            ticket.status === 'Under Investigation' ? 'badge-warning' : 'badge-danger'
                          }`}>
                            {ticket.status === 'Resolved' ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                            <span>{ticket.status}</span>
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button 
                            className="btn btn-secondary"
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.76rem' }}
                            onClick={() => handleOpenTriage(ticket)}
                          >
                            <FileText size={13} />
                            <span>Triage & Resolve</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mode C: MY SUBMITTED COMPLAINTS (Non-Admin View) */}
      {activeTab === 'my-complaints' && currentRole !== 'admin' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {myComplaints.length === 0 ? (
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <CheckCircle2 size={36} color="var(--success)" style={{ margin: '0 auto 1rem auto' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>No Active Grievances Registered</h3>
              <p style={{ fontSize: '0.85rem', marginTop: '0.35rem' }}>
                You haven't lodged any complaints yet. Click "Lodge New Grievance" above if you encounter any issue on campus.
              </p>
            </div>
          ) : (
            myComplaints.map(t => (
              <div key={t.id} className="glass-panel" style={{ padding: '1.25rem', border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--primary-light)' }}>{t.ticketNo}</span>
                      <span className="badge badge-primary">{t.category}</span>
                      <span className={`badge ${t.status === 'Resolved' ? 'badge-success' : t.status === 'Under Investigation' ? 'badge-warning' : 'badge-danger'}`}>
                        {t.status}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: '0.4rem' }}>{t.title}</h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                      {t.description}
                    </p>
                  </div>

                  <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <div>Filed on: <strong>{t.date}</strong></div>
                    <div>Assigned To: <strong>{t.assignedOfficer || 'Ombudsman Cell'}</strong></div>
                  </div>
                </div>

                {/* Admin Resolution Remarks */}
                {t.adminRemarks && (
                  <div style={{ marginTop: '1rem', padding: '0.85rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-glass-subtle)', fontSize: '0.8rem' }}>
                    <div style={{ fontWeight: 700, color: 'var(--primary-light)', marginBottom: '0.2rem' }}>
                      Administrative Action Taken & Remarks:
                    </div>
                    <p style={{ color: 'var(--text-primary)' }}>{t.adminRemarks}</p>
                    {t.resolutionDate && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--success)', marginTop: '0.35rem', fontWeight: 600 }}>
                        Resolved on {t.resolutionDate}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Admin Grievance Triage Modal */}
      {selectedTicket && (
        <Modal
          isOpen={!!selectedTicket}
          onClose={() => setSelectedTicket(null)}
          title={`Grievance Triage: #${selectedTicket.ticketNo}`}
          subtitle={`Lodged on ${selectedTicket.date} • ${selectedTicket.category}`}
          maxWidth="640px"
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setSelectedTicket(null)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSaveTriage}>
                <CheckCircle2 size={16} />
                <span>Save Action & Update Complainant</span>
              </button>
            </>
          }
        >
          <form onSubmit={handleSaveTriage} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
            {/* Incident Summary Card */}
            <div style={{ padding: '0.95rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-glass)', fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <span className="badge badge-primary">{selectedTicket.category}</span>
                <span className="badge badge-danger">{selectedTicket.priority} Priority</span>
              </div>
              <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.35rem' }}>{selectedTicket.title}</h4>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>{selectedTicket.description}</p>
              <div style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-glass-subtle)', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span>Complainant: <strong>{selectedTicket.complainantName}</strong></span>
                {selectedTicket.contactNumber && <span>Contact: <strong>{selectedTicket.contactNumber}</strong></span>}
              </div>
            </div>

            {/* Action Status */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Triage Status *</label>
                <select 
                  className="form-select"
                  value={triageStatus}
                  onChange={e => setTriageStatus(e.target.value)}
                >
                  <option value="Open">Open (Pending Action)</option>
                  <option value="Under Investigation">Under Investigation</option>
                  <option value="Resolved">Resolved & Remedied</option>
                  <option value="Dismissed">Dismissed / Inapplicable</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Assign Redressal Officer *</label>
                <select 
                  className="form-select"
                  value={triageOfficer}
                  onChange={e => setTriageOfficer(e.target.value)}
                >
                  <option value="Dr. Rajeshwar Sharma (Principal)">Dr. Rajeshwar Sharma (Principal)</option>
                  <option value="Shri Harish Rawat (Transport Supervisor)">Shri Harish Rawat (Transport Supervisor)</option>
                  <option value="R. K. Malhotra (Chief Accounts Officer)">R. K. Malhotra (Chief Accounts Officer)</option>
                  <option value="Mrs. Meenakshi Sundaram (Head Librarian)">Mrs. Meenakshi Sundaram (Head Librarian)</option>
                  <option value="Estate & Sanitation Supervisor">Estate & Sanitation Supervisor</option>
                  <option value="Internal POSH & Anti-Bullying Committee">Internal POSH & Anti-Bullying Committee</option>
                </select>
              </div>
            </div>

            {/* Resolution Remarks */}
            <div className="form-group">
              <label className="form-label">Administrative Action Log & Resolution Remarks *</label>
              <textarea 
                className="form-input" 
                rows={3}
                required
                placeholder="Detail what concrete steps were taken to resolve the issue (e.g. equipment replaced, driver cautioned, etc.)..."
                value={triageRemarks}
                onChange={e => setTriageRemarks(e.target.value)}
                style={{ resize: 'vertical' }}
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
