import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import Modal from '../common/Modal';
import { Bell, Send, Plus, Calendar, User, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

export default function NoticeBoard() {
  const { notices, postNotice, currentRole } = useERP();
  const [filterPriority, setFilterPriority] = useState('all');
  const [isNewNoticeOpen, setIsNewNoticeOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Academic Event',
    priority: 'Normal',
    targetAudience: 'All School',
    author: 'Office of the Principal',
    content: ''
  });

  const filteredNotices = notices.filter(n => {
    if (filterPriority === 'all') return true;
    return n.priority === filterPriority;
  });

  const handlePostNotice = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      alert('Please provide a title and notice announcement body.');
      return;
    }
    await postNotice(formData);
    setIsNewNoticeOpen(false);
    setFormData({
      title: '',
      category: 'Academic Event',
      priority: 'Normal',
      targetAudience: 'All School',
      author: 'Office of the Principal',
      content: ''
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Institutional Notice Board</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Official school circulars, academic calendar milestones, and campus-wide alerts.
          </p>
        </div>

        {(currentRole === 'admin' || currentRole === 'teacher') && (
          <button className="btn btn-primary" onClick={() => setIsNewNoticeOpen(true)}>
            <Plus size={16} />
            <span>Publish Circular</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="glass-panel" style={{ padding: '0.85rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {['all', 'Urgent', 'High', 'Normal'].map(p => (
            <button
              key={p}
              className={`tab-btn ${filterPriority === p ? 'active' : ''}`}
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
              onClick={() => setFilterPriority(p)}
            >
              {p === 'all' ? 'All Bulletins' : `${p} Priority`}
            </button>
          ))}
        </div>

        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {filteredNotices.length} Announcements Published
        </span>
      </div>

      {/* Notices Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredNotices.map((notice) => (
          <div 
            key={notice.id} 
            className="glass-panel" 
            style={{ 
              padding: '1.5rem', 
              borderLeft: `5px solid ${notice.priority === 'Urgent' ? 'var(--danger)' : notice.priority === 'High' ? 'var(--warning)' : 'var(--primary)'}` 
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.65rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
                  <span className={`badge ${
                    notice.priority === 'Urgent' ? 'badge-danger' : 
                    notice.priority === 'High' ? 'badge-warning' : 'badge-primary'
                  }`}>
                    {notice.priority} Priority
                  </span>
                  <span className="badge badge-purple">{notice.category}</span>
                  <span className="badge">{notice.targetAudience}</span>
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{notice.title}</h2>
              </div>

              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Calendar size={13} /> {notice.date}
              </div>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0.85rem 0' }}>
              {notice.content}
            </p>

            <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <User size={13} /> Published by: <strong>{notice.author}</strong>
              </span>
              <span>DPGA Central Communication Bureau</span>
            </div>
          </div>
        ))}
      </div>

      {/* Broadcast Notice Modal */}
      <Modal
        isOpen={isNewNoticeOpen}
        onClose={() => setIsNewNoticeOpen(false)}
        title="Broadcast New Campus Circular"
        subtitle="Dispatches notifications to all relevant portal dashboards"
        maxWidth="620px"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsNewNoticeOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handlePostNotice}>
              <Send size={15} />
              <span>Broadcast Now</span>
            </button>
          </>
        }
      >
        <form onSubmit={handlePostNotice} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Circular Title *</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. Science Olympiad Registrations Open"
              required
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.85rem' }}>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select 
                className="form-select"
                value={formData.priority}
                onChange={e => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="Normal">Normal</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select 
                className="form-select"
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="Academic Event">Academic Event</option>
                <option value="Administrative">Administrative</option>
                <option value="Sports & Athletics">Sports & Athletics</option>
                <option value="Holiday & Breaks">Holiday & Breaks</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Audience</label>
              <select 
                className="form-select"
                value={formData.targetAudience}
                onChange={e => setFormData({ ...formData, targetAudience: e.target.value })}
              >
                <option value="All School">All School</option>
                <option value="Parents">Parents Only</option>
                <option value="Students">Students Only</option>
                <option value="Teachers">Teachers Only</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Notice Body & Details *</label>
            <textarea 
              className="form-textarea"
              rows={4}
              placeholder="Provide complete announcement guidelines, dates, and instructions..."
              required
              value={formData.content}
              onChange={e => setFormData({ ...formData, content: e.target.value })}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
