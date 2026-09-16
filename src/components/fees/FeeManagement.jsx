import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import Modal from '../common/Modal';
import { 
  CreditCard, 
  Receipt, 
  Printer, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  DollarSign, 
  IndianRupee,
  ShieldCheck,
  QrCode,
  School,
  Sparkles,
  FilePlus,
  HandCoins,
  BadgePercent,
  Search,
  Filter,
  Check,
  User,
  FileCheck
} from 'lucide-react';

export default function FeeManagement() {
  const { fees, payFeeInvoice, createInvoice, collectCounterPayment, students, schoolInfo, currentRole } = useERP();

  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [payingInvoice, setPayingInvoice] = useState(null);
  const [isCounterCollectOpen, setIsCounterCollectOpen] = useState(false);
  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false);

  // Counter payment state with Class/Div filtering & Recommendation search
  const [counterStudentId, setCounterStudentId] = useState('std-1003');
  const [counterAmount, setCounterAmount] = useState('41000');
  const [counterMode, setCounterMode] = useState('UPI Direct Scan (BHIM / PhonePe / GPay)');
  const [classFilter, setClassFilter] = useState('all');
  const [divFilter, setDivFilter] = useState('all');
  const [studentSearch, setStudentSearch] = useState('');
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);

  // New invoice state
  const [invoiceForm, setInvoiceForm] = useState({
    studentId: 'std-1001',
    term: 'Quarter 4 (Jan - Mar 2026)',
    tuitionFee: 28500,
    labFee: 4500,
    transportFee: 6000,
    libraryFee: 2000,
    scholarshipDiscount: 0,
    dueDate: '2026-03-31'
  });

  // Payment form state
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI / QR Code Instant Pay (GPay / PhonePe / Paytm)');

  const totalBilled = fees.reduce((sum, f) => sum + (f.totalAmount || 0), 0);
  const totalCollected = fees.reduce((sum, f) => sum + (f.paidAmount || 0), 0);
  const totalOutstanding = totalBilled - totalCollected;
  const defaultersCount = fees.filter(f => f.status === 'Overdue').length;

  const filteredInvoices = fees.filter(inv => {
    if (filterStatus === 'all') return true;
    return inv.status === filterStatus;
  });

  // Filter students based on class, section/division, and recommendation search query
  const recommendedStudents = students.filter(s => {
    if (classFilter !== 'all' && !s.className.toLowerCase().includes(classFilter.toLowerCase())) return false;
    if (divFilter !== 'all' && !s.className.toLowerCase().includes(divFilter.toLowerCase())) return false;
    if (studentSearch.trim()) {
      const q = studentSearch.toLowerCase();
      const matchName = s.name.toLowerCase().includes(q);
      const matchRoll = (s.rollNo || '').toLowerCase().includes(q);
      return matchName || matchRoll;
    }
    return true;
  });

  const activeCounterStudent = students.find(s => s.id === counterStudentId) || students[0];
  const activeCounterInvoice = fees.find(f => f.studentId === activeCounterStudent?.id && f.balance > 0) || fees.find(f => f.studentId === activeCounterStudent?.id);

  const handleSelectRecommendedStudent = (student) => {
    setCounterStudentId(student.id);
    setStudentSearch(student.name);
    setShowStudentDropdown(false);
    const inv = fees.find(f => f.studentId === student.id && f.balance > 0) || fees.find(f => f.studentId === student.id);
    if (inv) {
      setCounterAmount(inv.balance > 0 ? inv.balance.toString() : '0');
    }
  };

  const handleOpenPayModal = (inv) => {
    setPayingInvoice(inv);
    setPaymentAmount(inv.balance.toString());
  };

  const handleProcessPayment = async (e) => {
    e.preventDefault();
    const amt = parseFloat(paymentAmount);
    if (!amt || amt <= 0 || amt > payingInvoice.balance) {
      alert('Please enter a valid payment amount not exceeding balance.');
      return;
    }
    await payFeeInvoice(payingInvoice.invoiceNo, {
      amount: amt,
      paymentMethod
    });
    setPayingInvoice(null);
  };

  const handleCounterCollection = async (e) => {
    e.preventDefault();
    const invoice = activeCounterInvoice;
    if (!invoice) {
      alert('No fee ledger record found for this student.');
      return;
    }
    const amt = parseFloat(counterAmount);
    if (!amt || amt <= 0) {
      alert('Please enter a valid payment amount.');
      return;
    }

    const receiptNo = await collectCounterPayment(invoice.invoiceNo, {
      amount: amt,
      paymentMethod: counterMode
    });
    setIsCounterCollectOpen(false);

    // Auto open official certified printable receipt with QR
    const refreshedInvoice = {
      ...invoice,
      paidAmount: (invoice.paidAmount || 0) + amt,
      balance: Math.max(0, invoice.balance - amt),
      status: (invoice.balance - amt <= 0) ? 'Paid' : 'Partial',
      paidDate: new Date().toISOString().split('T')[0],
      transactionId: receiptNo,
      paymentMethod: counterMode,
      publishedToParent: true
    };
    setSelectedInvoice(refreshedInvoice);
  };

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    const student = students.find(s => s.id === invoiceForm.studentId);
    const subtotal = Number(invoiceForm.tuitionFee) + Number(invoiceForm.labFee) + Number(invoiceForm.transportFee) + Number(invoiceForm.libraryFee);
    const total = Math.max(0, subtotal - Number(invoiceForm.scholarshipDiscount));

    await createInvoice({
      studentId: student.id,
      studentName: student.name,
      className: student.className,
      term: invoiceForm.term,
      tuitionFee: Number(invoiceForm.tuitionFee),
      labFee: Number(invoiceForm.labFee),
      transportFee: Number(invoiceForm.transportFee),
      libraryFee: Number(invoiceForm.libraryFee),
      totalAmount: total,
      dueDate: invoiceForm.dueDate
    });
    setIsCreateInvoiceOpen(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Fee Billing & Counter Collection</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            In-person cash/cheque counter desk, online student payments, scholarship waivers, and official fee vouchers.
          </p>
        </div>

        {(currentRole === 'admin' || currentRole === 'accountant') && (
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button className="btn btn-secondary" onClick={() => setIsCreateInvoiceOpen(true)}>
              <FilePlus size={16} />
              <span>Issue Fee Demand</span>
            </button>
            <button className="btn btn-primary" onClick={() => setIsCounterCollectOpen(true)}>
              <HandCoins size={16} />
              <span>Collect Counter Fee</span>
            </button>
          </div>
        )}
      </div>


      {/* Financial Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Total Billed</span>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '0.25rem' }}>₹{totalBilled.toLocaleString('en-IN')}</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Academic Year 2025-26</p>
        </div>
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Total Collected</span>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--success)', marginTop: '0.25rem' }}>₹{totalCollected.toLocaleString('en-IN')}</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{Math.round((totalCollected / (totalBilled || 1)) * 100)}% Collection Rate</p>
        </div>
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Outstanding Balance</span>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--danger)', marginTop: '0.25rem' }}>₹{totalOutstanding.toLocaleString('en-IN')}</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pending settlements</p>
        </div>
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Defaulters List</span>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--warning)', marginTop: '0.25rem' }}>{defaultersCount} Students</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Overdue past Feb 15</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="glass-panel" style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {['all', 'Paid', 'Partial', 'Overdue'].map(status => (
            <button
              key={status}
              className={`tab-btn ${filterStatus === status ? 'active' : ''}`}
              style={{ padding: '0.45rem 0.95rem', fontSize: '0.82rem' }}
              onClick={() => setFilterStatus(status)}
            >
              {status === 'all' ? 'All Invoices' : status}
            </button>
          ))}
        </div>

        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Showing {filteredInvoices.length} invoices
        </span>
      </div>

      {/* Invoices Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Student</th>
              <th>Class</th>
              <th>Total Fee</th>
              <th>Paid</th>
              <th>Balance</th>
              <th>Due Date</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.map((inv) => (
              <tr key={inv.invoiceNo}>
                <td style={{ fontWeight: 700, fontSize: '0.85rem' }}>{inv.invoiceNo}</td>
                <td>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{inv.studentName}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{inv.term}</div>
                </td>
                <td>
                  <span className="badge badge-primary">{inv.className}</span>
                </td>
                <td>
                  <span style={{ fontWeight: 700 }}>₹{Number(inv.totalAmount).toLocaleString('en-IN')}</span>
                </td>
                <td>
                  <span style={{ fontWeight: 700, color: 'var(--success)' }}>₹{Number(inv.paidAmount).toLocaleString('en-IN')}</span>
                </td>
                <td>
                  <span style={{ fontWeight: 800, color: inv.balance > 0 ? 'var(--danger)' : 'var(--text-muted)' }}>
                    ₹{Number(inv.balance).toLocaleString('en-IN')}
                  </span>
                </td>
                <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{inv.dueDate}</td>
                <td>
                  <span className={`badge ${
                    inv.status === 'Paid' ? 'badge-success' :
                    inv.status === 'Partial' ? 'badge-warning' : 'badge-danger'
                  }`}>
                    {inv.status}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    {inv.balance > 0 && (
                      <button 
                        className="btn btn-primary"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.76rem' }}
                        onClick={() => handleOpenPayModal(inv)}
                      >
                        <IndianRupee size={13} />
                        <span>Pay Online</span>
                      </button>
                    )}
                    {inv.paidAmount > 0 && (
                      <button 
                        className="btn btn-secondary"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.76rem' }}
                        onClick={() => handleOpenReceipt(inv)}
                      >
                        <Receipt size={13} />
                        <span>Receipt</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Online Payment Simulator Modal */}
      {payingInvoice && (
        <Modal
          isOpen={!!payingInvoice}
          onClose={() => setPayingInvoice(null)}
          title="Online Fee Checkout Simulator"
          subtitle={`Settling Invoice ${payingInvoice.invoiceNo} for ${payingInvoice.studentName}`}
          maxWidth="580px"
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setPayingInvoice(null)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleProcessPayment}>
                <CheckCircle2 size={16} />
                <span>Authorize & Pay ₹{Number(paymentAmount || 0).toLocaleString('en-IN')}</span>
              </button>
            </>
          }
        >
          <form onSubmit={handleProcessPayment} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ padding: '1rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface-elevated)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Current Balance Due</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--danger)' }}>
                  ₹{Number(payingInvoice.balance).toLocaleString('en-IN')}
                </div>
              </div>
              <span className="badge badge-warning">Due: {payingInvoice.dueDate}</span>
            </div>

            <div className="form-group">
              <label className="form-label">Payment Amount (₹) *</label>
              <input 
                type="number" 
                className="form-input" 
                required
                min="1"
                max={payingInvoice.balance}
                value={paymentAmount}
                onChange={e => setPaymentAmount(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Select Payment Method</label>
              <select 
                className="form-select"
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value)}
              >
                <option value="UPI / QR Code Instant Pay (GPay / PhonePe / Paytm)">UPI / QR Code Instant (GPay / PhonePe / Paytm)</option>
                <option value="NetBanking (SBI / HDFC / ICICI / PNB)">NetBanking (SBI / HDFC / ICICI / Axis / PNB)</option>
                <option value="RuPay / Debit / Credit Card">RuPay / Debit / Credit Card</option>
                <option value="NEFT / RTGS Bank Transfer">NEFT / RTGS Bank Transfer</option>
                <option value="Cash Tender Received at Desk">Cash Tender Received at Desk</option>
              </select>
            </div>

            <div style={{ padding: '0.85rem', borderRadius: 'var(--radius-sm)', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%)', border: '1px solid rgba(16, 185, 129, 0.25)', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <ShieldCheck size={20} color="var(--success)" />
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                256-bit encrypted school payment gateway simulation. Receipts are instantly logged to Firestore and available for print.
              </span>
            </div>
          </form>
        </Modal>
      )}

      {/* Official Printable Fee Receipt Modal */}
      {selectedInvoice && (
        <Modal
          isOpen={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          title="Official Fee Receipt Voucher"
          subtitle={`Receipt Reference #${selectedInvoice.invoiceNo}`}
          maxWidth="700px"
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setSelectedInvoice(null)}>
                Close
              </button>
              <button className="btn btn-primary" onClick={() => window.print()}>
                <Printer size={16} />
                <span>Print Official Receipt</span>
              </button>
            </>
          }
        >
          <div className="printable-document" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '0.5rem' }}>
            {/* Header with crest */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--border-glass)', paddingBottom: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <School size={24} color="var(--primary-light)" />
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{schoolInfo?.name || 'Delhi Public Global Academy'}</h3>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  Accounts & Finance Bureau • Tel: {schoolInfo?.phone}
                </p>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                  <span className="badge badge-success" style={{ fontSize: '0.78rem' }}>PAID RECEIPT</span>
                  <span className="badge" style={{ fontSize: '0.74rem', background: 'rgba(16, 185, 129, 0.12)', color: 'var(--success)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                    <CheckCircle2 size={11} /> Published to Parent
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, marginTop: '0.35rem' }}>Date: {selectedInvoice.paidDate || '2026-02-10'}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>TXN: {selectedInvoice.transactionId || 'TXN-9482-9901'}</div>
              </div>
            </div>

            {/* Student details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '0.85rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface-elevated)', fontSize: '0.82rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>STUDENT</span>
                <strong>{selectedInvoice.studentName}</strong> ({selectedInvoice.className})
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>ACADEMIC TERM</span>
                <strong>{selectedInvoice.term}</strong>
              </div>
            </div>

            {/* Fee Itemized Breakdown */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-surface-elevated)', borderBottom: '1px solid var(--border-glass)', textAlign: 'left' }}>
                  <th style={{ padding: '0.65rem 0.85rem' }}>Fee Description</th>
                  <th style={{ padding: '0.65rem 0.85rem', textAlign: 'right' }}>Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border-glass-subtle)' }}>
                  <td style={{ padding: '0.65rem 0.85rem' }}>Tuition & Academic Instruction Fee</td>
                  <td style={{ padding: '0.65rem 0.85rem', textAlign: 'right', fontWeight: 600 }}>₹{Number(selectedInvoice.tuitionFee || 0).toLocaleString('en-IN')}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-glass-subtle)' }}>
                  <td style={{ padding: '0.65rem 0.85rem' }}>Advanced Science & Robotics Lab Fee</td>
                  <td style={{ padding: '0.65rem 0.85rem', textAlign: 'right', fontWeight: 600 }}>₹{Number(selectedInvoice.labFee || 0).toLocaleString('en-IN')}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-glass-subtle)' }}>
                  <td style={{ padding: '0.65rem 0.85rem' }}>Digital Library & Media Center Levy</td>
                  <td style={{ padding: '0.65rem 0.85rem', textAlign: 'right', fontWeight: 600 }}>₹{Number(selectedInvoice.libraryFee || 0).toLocaleString('en-IN')}</td>
                </tr>
                {selectedInvoice.transportFee > 0 && (
                  <tr style={{ borderBottom: '1px solid var(--border-glass-subtle)' }}>
                    <td style={{ padding: '0.65rem 0.85rem' }}>Bus Fleet Transit & Safety Fee</td>
                    <td style={{ padding: '0.65rem 0.85rem', textAlign: 'right', fontWeight: 600 }}>₹{Number(selectedInvoice.transportFee).toLocaleString('en-IN')}</td>
                  </tr>
                )}
                <tr style={{ background: 'var(--bg-surface-elevated)', fontWeight: 800 }}>
                  <td style={{ padding: '0.75rem 0.85rem' }}>Total Amount Paid</td>
                  <td style={{ padding: '0.75rem 0.85rem', textAlign: 'right', color: 'var(--success)', fontSize: '1.05rem' }}>
                    ₹{Number(selectedInvoice.paidAmount || 0).toLocaleString('en-IN')}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Verification QR & Signature */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-glass)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div style={{ width: '56px', height: '56px', background: '#ffffff', padding: '4px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <QrCode size={48} color="#000000" />
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Scan QR to verify authentic receipt against school ledger records.
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, fontFamily: 'cursive', color: 'var(--primary-light)' }}>
                  R. K. Malhotra (CAO & Bursar)
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>School Accounts & Finance Officer Signature</div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Counter Fee Collection Modal (Admin / Accountant Desk) */}
      {isCounterCollectOpen && (
        <Modal
          isOpen={isCounterCollectOpen}
          onClose={() => setIsCounterCollectOpen(false)}
          title="Accounts Desk: Counter Fee Collection & Receipting"
          subtitle="Real-time collection, automated parent notification, and official QR-certified voucher generation"
          maxWidth="680px"
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setIsCounterCollectOpen(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleCounterCollection}>
                <HandCoins size={16} />
                <span>Collect ₹{Number(counterAmount || 0).toLocaleString('en-IN')} & Print Receipt</span>
              </button>
            </>
          }
        >
          <form onSubmit={handleCounterCollection} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
            {/* Step 1: Class & Division Filtering */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', background: 'var(--bg-surface-elevated)', padding: '0.85rem', borderRadius: 'var(--radius-sm)' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Filter size={12} /> Filter by Class
                </label>
                <select 
                  className="form-select"
                  style={{ padding: '0.45rem 0.65rem', fontSize: '0.82rem' }}
                  value={classFilter}
                  onChange={e => setClassFilter(e.target.value)}
                >
                  <option value="all">All Classes (9 to 12)</option>
                  <option value="Class 9">Class 9</option>
                  <option value="Class 10">Class 10</option>
                  <option value="Class 11">Class 11</option>
                  <option value="Class 12">Class 12</option>
                </select>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Filter size={12} /> Filter by Division / Section
                </label>
                <select 
                  className="form-select"
                  style={{ padding: '0.45rem 0.65rem', fontSize: '0.82rem' }}
                  value={divFilter}
                  onChange={e => setDivFilter(e.target.value)}
                >
                  <option value="all">All Sections (A, B, C)</option>
                  <option value="-A">Section A</option>
                  <option value="-B">Section B</option>
                  <option value="-C">Section C</option>
                </select>
              </div>
            </div>

            {/* Step 2: Interactive Student Recommendation Typeahead */}
            <div className="form-group" style={{ position: 'relative' }}>
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Type Student Name (Auto-Suggest Recommended) *</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {recommendedStudents.length} Students Matching
                </span>
              </label>

              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Type student name (e.g. Aarav, Rohan, Diya) or roll number..."
                  value={studentSearch}
                  onFocus={() => setShowStudentDropdown(true)}
                  onChange={e => {
                    setStudentSearch(e.target.value);
                    setShowStudentDropdown(true);
                  }}
                  style={{ paddingLeft: '2.4rem' }}
                />
              </div>

              {/* Recommendation Dropdown */}
              {showStudentDropdown && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  zIndex: 50,
                  background: '#ffffff',
                  border: '1px solid var(--border-glass)',
                  borderRadius: 'var(--radius-sm)',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                  maxHeight: '220px',
                  overflowY: 'auto',
                  marginTop: '0.35rem'
                }}>
                  {recommendedStudents.length === 0 ? (
                    <div style={{ padding: '0.85rem', fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                      No students found matching your criteria.
                    </div>
                  ) : (
                    recommendedStudents.map(s => {
                      const inv = fees.find(f => f.studentId === s.id && f.balance > 0) || fees.find(f => f.studentId === s.id);
                      const isSelected = s.id === counterStudentId;
                      return (
                        <div 
                          key={s.id}
                          onClick={() => handleSelectRecommendedStudent(s)}
                          style={{
                            padding: '0.65rem 0.85rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            cursor: 'pointer',
                            borderBottom: '1px solid var(--border-glass-subtle)',
                            background: isSelected ? 'var(--bg-surface-elevated)' : 'transparent'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--primary-bg)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem' }}>
                              {s.name.charAt(0)}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{s.name}</div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                {s.className} • Roll {s.rollNo}
                              </div>
                            </div>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: (inv?.balance || 0) > 0 ? 'var(--danger)' : 'var(--success)' }}>
                              {(inv?.balance || 0) > 0 ? `₹${(inv?.balance || 0).toLocaleString('en-IN')} Due` : 'All Cleared'}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* Step 3: Selected Student Intelligence Dossier & Pending Fee Breakdown */}
            {activeCounterStudent && (
              <div style={{ border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                <div style={{ background: 'var(--bg-surface-elevated)', padding: '0.65rem 0.95rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <User size={15} color="var(--primary-light)" />
                    <strong style={{ fontSize: '0.88rem' }}>{activeCounterStudent.name}</strong>
                    <span className="badge badge-primary">{activeCounterStudent.className}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Roll: {activeCounterStudent.rollNo}</span>
                  </div>
                  <span className={`badge ${activeCounterInvoice?.balance > 0 ? 'badge-danger' : 'badge-success'}`}>
                    {activeCounterInvoice?.balance > 0 ? 'Payment Pending' : 'Paid in Full'}
                  </span>
                </div>

                {/* Pending ledger items */}
                <div style={{ padding: '0.85rem', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', fontSize: '0.78rem', background: '#ffffff' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.68rem' }}>TUITION FEE</span>
                    <strong>₹{Number(activeCounterInvoice?.tuitionFee || 28500).toLocaleString('en-IN')}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.68rem' }}>LAB & ROBOTICS</span>
                    <strong>₹{Number(activeCounterInvoice?.labFee || 4500).toLocaleString('en-IN')}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.68rem' }}>BUS TRANSPORT</span>
                    <strong>₹{Number(activeCounterInvoice?.transportFee || 6000).toLocaleString('en-IN')}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.68rem' }}>LIBRARY LEVY</span>
                    <strong>₹{Number(activeCounterInvoice?.libraryFee || 2000).toLocaleString('en-IN')}</strong>
                  </div>
                </div>

                <div style={{ padding: '0.75rem 0.95rem', background: 'var(--bg-surface-elevated)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-glass-subtle)' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>Total Current Outstanding Balance:</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--danger)' }}>
                    ₹{Number(activeCounterInvoice?.balance || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            )}

            {/* Step 4: Payment Presets and Custom Amount */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Amount Received at Desk (₹) *</label>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    style={{ padding: '0.2rem 0.55rem', fontSize: '0.72rem' }}
                    onClick={() => setCounterAmount(String(activeCounterInvoice?.balance || 0))}
                  >
                    Full Due (₹{Number(activeCounterInvoice?.balance || 0).toLocaleString('en-IN')})
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    style={{ padding: '0.2rem 0.55rem', fontSize: '0.72rem' }}
                    onClick={() => setCounterAmount(String(Math.round((activeCounterInvoice?.balance || 0) / 2)))}
                  >
                    50% Installment
                  </button>
                </div>
              </div>
              <input 
                type="number" 
                className="form-input" 
                required
                min="1"
                max={activeCounterInvoice?.balance || 100000}
                value={counterAmount}
                onChange={e => setCounterAmount(e.target.value)}
                style={{ fontSize: '1.1rem', fontWeight: 700 }}
              />
            </div>

            {/* Step 5: Mode of Payment */}
            <div className="form-group">
              <label className="form-label">Tender / Collection Payment Mode *</label>
              <select 
                className="form-select"
                value={counterMode}
                onChange={e => setCounterMode(e.target.value)}
              >
                <option value="UPI Direct Scan (BHIM / PhonePe / GPay)">UPI Instant Scan (BHIM / PhonePe / Google Pay / Paytm)</option>
                <option value="Cash Tender Received at Counter">Cash Tender (Currency Notes Handed at Desk)</option>
                <option value="Bank Cheque / Demand Draft (DD)">Bank Cheque / Official Demand Draft (DD)</option>
                <option value="Counter POS Debit/Credit Card Swipe">Counter POS Card Swipe (RuPay / Visa / MasterCard)</option>
                <option value="NEFT / RTGS Direct Bank Transfer">NEFT / RTGS Direct Bank Challan</option>
              </select>
            </div>

            {/* Real-time Parent Portal Sync Guarantee Banner */}
            <div style={{ padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(99, 102, 241, 0.08) 100%)', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <CheckCircle2 size={20} color="var(--success)" style={{ flexShrink: 0 }} />
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                <strong>Instant Parent App Sync Active:</strong> Upon receiving payment, this digital receipt will be automatically stamped, published, and viewable in real-time by the parent on their portal.
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* Issue Custom Fee Demand / Invoice Modal */}
      {isCreateInvoiceOpen && (
        <Modal
          isOpen={isCreateInvoiceOpen}
          onClose={() => setIsCreateInvoiceOpen(false)}
          title="Issue Custom Fee Demand / Invoice"
          subtitle="Generate itemized billing and scholarship waivers for any student"
          maxWidth="640px"
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setIsCreateInvoiceOpen(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleCreateInvoice}>
                <FilePlus size={16} />
                <span>Issue Invoice & Notify</span>
              </button>
            </>
          }
        >
          <form onSubmit={handleCreateInvoice} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            <div className="form-group">
              <label className="form-label">Target Student *</label>
              <select 
                className="form-select"
                value={invoiceForm.studentId}
                onChange={e => setInvoiceForm({ ...invoiceForm, studentId: e.target.value })}
              >
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.className}) • Roll {s.rollNo}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Academic Term</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={invoiceForm.term}
                  onChange={e => setInvoiceForm({ ...invoiceForm, term: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Payment Due Date</label>
                <input 
                  type="date" 
                  className="form-input" 
                  value={invoiceForm.dueDate}
                  onChange={e => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Tuition (₹)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={invoiceForm.tuitionFee}
                  onChange={e => setInvoiceForm({ ...invoiceForm, tuitionFee: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Lab Fee (₹)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={invoiceForm.labFee}
                  onChange={e => setInvoiceForm({ ...invoiceForm, labFee: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Transport (₹)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={invoiceForm.transportFee}
                  onChange={e => setInvoiceForm({ ...invoiceForm, transportFee: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Library (₹)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={invoiceForm.libraryFee}
                  onChange={e => setInvoiceForm({ ...invoiceForm, libraryFee: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <BadgePercent size={15} /> Scholarship / Financial Aid Waiver Deduction (₹)
              </label>
              <input 
                type="number" 
                className="form-input" 
                placeholder="0"
                value={invoiceForm.scholarshipDiscount}
                onChange={e => setInvoiceForm({ ...invoiceForm, scholarshipDiscount: e.target.value })}
              />
            </div>

            <div style={{ padding: '0.85rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface-elevated)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>Net Total Demand Amount:</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-light)' }}>
                ₹{Math.max(0, (Number(invoiceForm.tuitionFee) + Number(invoiceForm.labFee) + Number(invoiceForm.transportFee) + Number(invoiceForm.libraryFee)) - Number(invoiceForm.scholarshipDiscount)).toLocaleString('en-IN')}
              </span>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

