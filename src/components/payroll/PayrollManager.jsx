import React, { useState, useMemo } from 'react';
import { useERP } from '../../context/ERPContext';
import Modal from '../common/Modal';
import { numberToIndianRupeesWords } from '../../utils/indianCurrencyWords';
import { 
  Banknote, 
  Printer, 
  CheckCircle2, 
  Clock, 
  IndianRupee, 
  FileText, 
  Building, 
  ShieldCheck, 
  School, 
  Sparkles, 
  Send, 
  Search, 
  Filter, 
  AlertCircle, 
  Edit3, 
  UserCheck, 
  Calendar, 
  ArrowRight, 
  Download, 
  Check,
  Percent,
  CalendarCheck,
  TrendingUp
} from 'lucide-react';

export default function PayrollManager() {
  const { payroll = [], updatePayrollRecord, disburseSalary, schoolInfo, currentRole } = useERP();

  // Active filters and views
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'review', 'verified', 'paid'
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [auditStaff, setAuditStaff] = useState(null);
  const [disbursingStaff, setDisbursingStaff] = useState(null);
  const [paymentMode, setPaymentMode] = useState('Corporate Direct Bank Transfer (NEFT/RTGS)');

  // Form state for Accountant Audit & Salary Stack adjustment
  const [auditForm, setAuditForm] = useState({
    totalWorkingDays: 26,
    presentDays: 24,
    paidLeaveDays: 2,
    absentDays: 0,
    basicSalary: 60000,
    daAllowance: 18000,
    hraAllowance: 14400,
    transportAllowance: 5000,
    medicalAllowance: 3500,
    specialAllowance: 3000,
    pfDeduction: 7200,
    esicDeduction: 0,
    profTax: 200,
    taxDeduction: 7500,
    lopDeduction: 0
  });

  // Calculate live dynamic metrics for accountant modal
  const liveGrossSalary = useMemo(() => {
    return (
      Number(auditForm.basicSalary || 0) +
      Number(auditForm.daAllowance || 0) +
      Number(auditForm.hraAllowance || 0) +
      Number(auditForm.transportAllowance || 0) +
      Number(auditForm.medicalAllowance || 0) +
      Number(auditForm.specialAllowance || 0)
    );
  }, [auditForm]);

  const liveLopDeduction = useMemo(() => {
    const workingDays = Number(auditForm.totalWorkingDays || 26);
    const absent = Number(auditForm.absentDays || 0);
    if (workingDays <= 0 || absent <= 0) return 0;
    return Math.round((liveGrossSalary / workingDays) * absent);
  }, [liveGrossSalary, auditForm.totalWorkingDays, auditForm.absentDays]);

  const liveTotalDeductions = useMemo(() => {
    return (
      Number(auditForm.pfDeduction || 0) +
      Number(auditForm.esicDeduction || 0) +
      Number(auditForm.profTax || 0) +
      Number(auditForm.taxDeduction || 0) +
      liveLopDeduction
    );
  }, [auditForm, liveLopDeduction]);

  const liveNetSalary = useMemo(() => {
    return Math.max(0, liveGrossSalary - liveTotalDeductions);
  }, [liveGrossSalary, liveTotalDeductions]);

  const liveAttendanceRate = useMemo(() => {
    const total = Number(auditForm.totalWorkingDays || 26);
    const present = Number(auditForm.presentDays || 0);
    const leave = Number(auditForm.paidLeaveDays || 0);
    if (total <= 0) return 0;
    return Math.min(100, Math.round(((present + leave) / total) * 1000) / 10);
  }, [auditForm.totalWorkingDays, auditForm.presentDays, auditForm.paidLeaveDays]);

  // Open Accountant Audit Modal for a staff member
  const handleOpenAuditModal = (item) => {
    setAuditStaff(item);
    const totalWorking = item.totalWorkingDays || 26;
    const present = item.presentDays !== undefined ? item.presentDays : 24;
    const paidLeave = item.paidLeaveDays !== undefined ? item.paidLeaveDays : 2;
    const absent = item.absentDays !== undefined ? item.absentDays : 0;
    const basic = item.basicSalary || 50000;
    const da = item.daAllowance !== undefined ? item.daAllowance : Math.round(basic * 0.3);
    const hra = item.hraAllowance !== undefined ? item.hraAllowance : Math.round(basic * 0.24);
    const transport = item.transportAllowance !== undefined ? item.transportAllowance : 5000;
    const medical = item.medicalAllowance !== undefined ? item.medicalAllowance : 3500;
    const special = item.specialAllowance !== undefined ? item.specialAllowance : 3000;
    const pf = item.pfDeduction !== undefined ? item.pfDeduction : Math.round(basic * 0.12);
    const esic = item.esicDeduction !== undefined ? item.esicDeduction : 0;
    const pt = item.profTax !== undefined ? item.profTax : 200;
    const tax = item.taxDeduction !== undefined ? item.taxDeduction : 6500;

    const gross = basic + da + hra + transport + medical + special;
    const lop = Math.round((gross / totalWorking) * absent);

    setAuditForm({
      totalWorkingDays: totalWorking,
      presentDays: present,
      paidLeaveDays: paidLeave,
      absentDays: absent,
      basicSalary: basic,
      daAllowance: da,
      hraAllowance: hra,
      transportAllowance: transport,
      medicalAllowance: medical,
      specialAllowance: special,
      pfDeduction: pf,
      esicDeduction: esic,
      profTax: pt,
      taxDeduction: tax,
      lopDeduction: lop
    });
  };

  // Save changes & mark as Verified by Accountant
  const handleConfirmAndVerify = async () => {
    if (!auditStaff) return;
    const updated = {
      ...auditForm,
      grossSalary: liveGrossSalary,
      lopDeduction: liveLopDeduction,
      totalDeductions: liveTotalDeductions,
      netSalary: liveNetSalary,
      attendanceRate: liveAttendanceRate,
      status: auditStaff.status === 'Paid' ? 'Paid' : 'Verified',
      verifiedBy: 'CA R. K. Malhotra (Chief Bursar & Accountant)',
      verifiedDate: new Date().toISOString().split('T')[0]
    };

    await updatePayrollRecord(auditStaff.staffId, updated);
    setAuditStaff(null);
  };

  // Direct Disburse after confirmation
  const handleProcessDisbursement = async (e) => {
    e.preventDefault();
    if (!disbursingStaff) return;

    const res = await disburseSalary(disbursingStaff.staffId, {
      paymentMode,
      disbursedBy: 'CA R. K. Malhotra (Chief Bursar)'
    });

    setDisbursingStaff(null);
    if (res) {
      setSelectedPayslip(res);
    }
  };

  // KPIs
  const totalPayroll = payroll.reduce((sum, p) => sum + (p.netSalary || 0), 0);
  const totalGross = payroll.reduce((sum, p) => sum + (p.grossSalary || (p.basicSalary + (p.hraAllowance || 0))), 0);
  const totalPaid = payroll.filter(p => p.status === 'Paid').reduce((sum, p) => sum + (p.netSalary || 0), 0);
  const totalPending = totalPayroll - totalPaid;
  const paidCount = payroll.filter(p => p.status === 'Paid').length;
  const verifiedCount = payroll.filter(p => p.status === 'Verified').length;
  const reviewCount = payroll.filter(p => p.status === 'Under Review' || p.status === 'Pending').length;

  // Filtered staff records
  const departments = useMemo(() => {
    const set = new Set(payroll.map(p => p.department));
    return ['all', ...Array.from(set)];
  }, [payroll]);

  const filteredPayroll = useMemo(() => {
    return payroll.filter(p => {
      const matchesDept = departmentFilter === 'all' || p.department === departmentFilter;
      const matchesStatus = 
        statusFilter === 'all' ? true :
        statusFilter === 'paid' ? p.status === 'Paid' :
        statusFilter === 'verified' ? p.status === 'Verified' :
        statusFilter === 'review' ? (p.status === 'Under Review' || p.status === 'Pending') : true;

      const matchesSearch = 
        p.staffName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.staffId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.role.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesDept && matchesStatus && matchesSearch;
    });
  }, [payroll, statusFilter, departmentFilter, searchQuery]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
            <span className="badge badge-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Banknote size={14} />
              <span>Bursary & Accounts Directorate</span>
            </span>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              CBSE 7th Pay Commission Remuneration Matrix • Pay Cycle: March 2026
            </span>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Staff Payroll & Remuneration Directorate
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Biometric attendance reconciliation, statutory deductions (EPF, ESIC, PT, TDS), LOP audit, and certified salary pay slip generation.
          </p>
        </div>

        {/* Quick Cycle Tag */}
        <div className="glass-panel" style={{ padding: '0.65rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 8px var(--success)' }} />
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>Pay Cycle: March 2026</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>26 Working Days • Standard CBSE Calendar</div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <div 
          className="glass-panel" 
          style={{ padding: '1.25rem', cursor: 'pointer', border: statusFilter === 'all' ? '2px solid var(--primary)' : undefined }}
          onClick={() => setStatusFilter('all')}
        >
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Total Net Payroll</span>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '0.25rem', color: 'var(--primary)' }}>₹{totalPayroll.toLocaleString('en-IN')}</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Gross CTC: ₹{totalGross.toLocaleString('en-IN')}</p>
        </div>

        <div 
          className="glass-panel" 
          style={{ padding: '1.25rem', cursor: 'pointer', border: statusFilter === 'paid' ? '2px solid var(--success)' : undefined }}
          onClick={() => setStatusFilter('paid')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Disbursed Volume</span>
            <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>{paidCount} Paid</span>
          </div>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--success)', marginTop: '0.25rem' }}>₹{totalPaid.toLocaleString('en-IN')}</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Bank credits processed</p>
        </div>

        <div 
          className="glass-panel" 
          style={{ padding: '1.25rem', cursor: 'pointer', border: statusFilter === 'verified' ? '2px solid var(--secondary)' : undefined }}
          onClick={() => setStatusFilter('verified')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Verified & Ready</span>
            <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>{verifiedCount} Ready</span>
          </div>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--secondary)', marginTop: '0.25rem' }}>
            ₹{payroll.filter(p => p.status === 'Verified').reduce((sum, p) => sum + p.netSalary, 0).toLocaleString('en-IN')}
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Accountant confirmed • Ready to transfer</p>
        </div>

        <div 
          className="glass-panel" 
          style={{ padding: '1.25rem', cursor: 'pointer', border: statusFilter === 'review' ? '2px solid var(--warning)' : undefined }}
          onClick={() => setStatusFilter('review')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Under Review</span>
            <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>{reviewCount} Pending</span>
          </div>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--warning)', marginTop: '0.25rem' }}>
            ₹{payroll.filter(p => p.status === 'Under Review' || p.status === 'Pending').reduce((sum, p) => sum + p.netSalary, 0).toLocaleString('en-IN')}
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Awaiting attendance & salary audit</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel" style={{ padding: '1rem 1.25rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '240px' }}>
          <Search size={16} color="var(--text-muted)" />
          <input 
            type="text" 
            placeholder="Search staff by name, role, or staff ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontSize: '0.86rem' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {/* Department Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Department:</span>
            <select 
              value={departmentFilter} 
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="input-field" 
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.82rem', width: 'auto' }}
            >
              {departments.map(d => (
                <option key={d} value={d}>{d === 'all' ? 'All Departments' : d}</option>
              ))}
            </select>
          </div>

          {/* Status Switcher Tabs */}
          <div style={{ display: 'flex', gap: '0.35rem', background: 'var(--bg-surface-elevated)', padding: '0.25rem', borderRadius: 'var(--radius-sm)' }}>
            {[
              { id: 'all', label: `All (${payroll.length})` },
              { id: 'review', label: `Under Review (${reviewCount})` },
              { id: 'verified', label: `Verified (${verifiedCount})` },
              { id: 'paid', label: `Paid (${paidCount})` }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                style={{
                  border: 'none',
                  padding: '0.3rem 0.75rem',
                  fontSize: '0.78rem',
                  fontWeight: statusFilter === tab.id ? 700 : 500,
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  background: statusFilter === tab.id ? 'var(--primary)' : 'transparent',
                  color: statusFilter === tab.id ? '#ffffff' : 'var(--text-secondary)'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Master Staff Attendance & Salary Ledger Table */}
      <div className="table-container">
        <table className="data-table" style={{ fontSize: '0.86rem' }}>
          <thead>
            <tr>
              <th style={{ minWidth: '190px' }}>Staff Details & Department</th>
              <th style={{ minWidth: '150px' }}>Attendance Days (Mar 2026)</th>
              <th style={{ minWidth: '150px' }}>Salary Stack (Earnings)</th>
              <th style={{ minWidth: '140px' }}>Deductions & LOP</th>
              <th style={{ minWidth: '120px' }}>Net Take-Home</th>
              <th style={{ minWidth: '130px' }}>Accountant Status</th>
              <th style={{ textAlign: 'right', minWidth: '170px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayroll.map((item) => {
              const totalDays = item.totalWorkingDays || 26;
              const presentDays = item.presentDays !== undefined ? item.presentDays : 24;
              const paidLeaves = item.paidLeaveDays !== undefined ? item.paidLeaveDays : 2;
              const absentDays = item.absentDays !== undefined ? item.absentDays : 0;
              const attendanceRate = item.attendanceRate !== undefined ? item.attendanceRate : Math.round(((presentDays + paidLeaves) / totalDays) * 100);

              const basic = item.basicSalary;
              const da = item.daAllowance || Math.round(basic * 0.3);
              const hra = item.hraAllowance || Math.round(basic * 0.24);
              const allowancesSum = (item.daAllowance || 0) + (item.hraAllowance || 0) + (item.transportAllowance || 0) + (item.medicalAllowance || 0) + (item.specialAllowance || 0);
              const gross = item.grossSalary || (basic + allowancesSum);
              const deductionsSum = item.totalDeductions || ((item.pfDeduction || 0) + (item.taxDeduction || 0) + (item.profTax || 200) + (item.lopDeduction || 0));

              const isPaid = item.status === 'Paid';
              const isVerified = item.status === 'Verified';
              const isReview = !isPaid && !isVerified;

              return (
                <tr key={item.staffId} style={{ transition: 'background 0.15s' }}>
                  {/* Staff Info */}
                  <td>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>{item.staffName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                      {item.role} • <strong>ID: {item.staffId}</strong>
                    </div>
                    <div style={{ marginTop: '0.3rem' }}>
                      <span className="badge" style={{ fontSize: '0.7rem' }}>{item.department}</span>
                    </div>
                  </td>

                  {/* Attendance Days in Month */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.95rem', color: attendanceRate >= 95 ? 'var(--success)' : 'var(--warning)' }}>
                        {attendanceRate}%
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        ({presentDays + paidLeaves}/{totalDays} Days)
                      </span>
                    </div>

                    <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', lineHeight: 1.35 }}>
                      <div>Present: <strong>{presentDays}d</strong> • Leave: <strong>{paidLeaves}d</strong></div>
                      {absentDays > 0 ? (
                        <div style={{ color: 'var(--danger)', fontWeight: 700 }}>
                          ⚠️ LOP / Absent: {absentDays} day(s)
                        </div>
                      ) : (
                        <div style={{ color: 'var(--success)' }}>✓ 0 LOP Days</div>
                      )}
                    </div>
                  </td>

                  {/* Salary Stack (Earnings) */}
                  <td>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                      Gross: ₹{gross.toLocaleString('en-IN')}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                      Basic: ₹{basic.toLocaleString('en-IN')}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      DA: ₹{da.toLocaleString('en-IN')} • HRA: ₹{hra.toLocaleString('en-IN')}
                    </div>
                  </td>

                  {/* Deductions */}
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--danger)' }}>
                      -₹{deductionsSum.toLocaleString('en-IN')}
                    </div>
                    <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      PF: ₹{(item.pfDeduction || 0).toLocaleString('en-IN')} • TDS: ₹{(item.taxDeduction || 0).toLocaleString('en-IN')}
                    </div>
                    {item.lopDeduction > 0 && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--danger)', fontWeight: 600 }}>
                        LOP Deduct: -₹{item.lopDeduction.toLocaleString('en-IN')}
                      </div>
                    )}
                  </td>

                  {/* Net Take-Home */}
                  <td>
                    <div style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--success)' }}>
                      ₹{item.netSalary.toLocaleString('en-IN')}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      Net Remuneration
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td>
                    {isPaid ? (
                      <div>
                        <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                          <CheckCircle2 size={12} />
                          <span>Disbursed & Paid</span>
                        </span>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                          Ref: {item.transactionRef || 'NEFT-COMPLETED'}
                        </div>
                      </div>
                    ) : isVerified ? (
                      <div>
                        <span className="badge badge-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                          <ShieldCheck size={12} />
                          <span>Verified & Approved</span>
                        </span>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                          Ready for bank transfer
                        </div>
                      </div>
                    ) : (
                      <div>
                        <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Clock size={12} />
                          <span>Under Review</span>
                        </span>
                        <div style={{ fontSize: '0.7rem', color: '#b45309', marginTop: '0.2rem' }}>
                          Needs attendance audit
                        </div>
                      </div>
                    )}
                  </td>

                  {/* Actions */}
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.45rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                      {/* Audit & Edit Button */}
                      <button 
                        className="btn btn-secondary"
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                        onClick={() => handleOpenAuditModal(item)}
                        title="Audit Attendance & Salary Stack"
                      >
                        <Edit3 size={13} />
                        <span>Audit / Stack</span>
                      </button>

                      {/* Disburse Button */}
                      {!isPaid && (
                        <button 
                          className={`btn ${isVerified ? 'btn-primary' : 'btn-secondary'}`}
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                          onClick={() => setDisbursingStaff(item)}
                          title="Authorize Bank Disbursement"
                        >
                          <Send size={13} />
                          <span>Disburse</span>
                        </button>
                      )}

                      {/* Pay Slip Button (Available for verified and paid) */}
                      {(isPaid || isVerified) && (
                        <button 
                          className="btn btn-secondary"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                          onClick={() => setSelectedPayslip(item)}
                          title="Generate Certified Pay Slip"
                        >
                          <FileText size={13} />
                          <span>Pay Slip</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ========================================================================= */}
      {/* 1. ACCOUNTANT AUDIT & SALARY STACK ADJUSTMENT MODAL                       */}
      {/* ========================================================================= */}
      {auditStaff && (
        <Modal
          isOpen={!!auditStaff}
          onClose={() => setAuditStaff(null)}
          title="Accountant Remuneration & Attendance Audit"
          subtitle={`March 2026 Payroll Audit for ${auditStaff.staffName} (${auditStaff.role})`}
          maxWidth="840px"
          footer={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ fontSize: '0.85rem' }}>
                Audited Net Payable: <strong style={{ color: 'var(--success)', fontSize: '1.1rem' }}>₹{liveNetSalary.toLocaleString('en-IN')}</strong>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-secondary" onClick={() => setAuditStaff(null)}>
                  Cancel
                </button>
                <button 
                  className="btn btn-primary" 
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
                  onClick={handleConfirmAndVerify}
                >
                  <CheckCircle2 size={16} />
                  <span>Confirm & Verify Payroll</span>
                </button>
              </div>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Staff Bio & Bank Banner */}
            <div style={{ padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-glass)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', fontSize: '0.82rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>EMPLOYEE</span>
                <div style={{ fontWeight: 700 }}>{auditStaff.staffName}</div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>ID: {auditStaff.staffId} • {auditStaff.department}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>BANK & IFSC</span>
                <div style={{ fontWeight: 600 }}>{auditStaff.bankName}</div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>A/C: {auditStaff.accountNumber} • IFSC: {auditStaff.ifscCode || 'SBIN0001234'}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>STATUTORY IDENTIFIERS</span>
                <div style={{ fontWeight: 600 }}>PAN: {auditStaff.panNumber || 'AMTPS8821F'}</div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>UAN / EPF: {auditStaff.uanNumber || '100904528192'}</div>
              </div>
            </div>

            {/* Attendance Days Reconciliation */}
            <div style={{ border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)', padding: '1rem', background: 'rgba(59, 130, 246, 0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <CalendarCheck size={16} color="var(--primary)" />
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Monthly Biometric Attendance Reconciliation</span>
                </div>
                <span className="badge badge-primary">
                  Effective Attendance: {liveAttendanceRate}%
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.85rem' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Total Month Days</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="31" 
                    className="form-input" 
                    value={auditForm.totalWorkingDays} 
                    onChange={e => setAuditForm({ ...auditForm, totalWorkingDays: Number(e.target.value) })}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Days Present</label>
                  <input 
                    type="number" 
                    min="0" 
                    max={auditForm.totalWorkingDays} 
                    className="form-input" 
                    value={auditForm.presentDays} 
                    onChange={e => setAuditForm({ ...auditForm, presentDays: Number(e.target.value) })}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Approved Paid Leave</label>
                  <input 
                    type="number" 
                    min="0" 
                    max="15" 
                    className="form-input" 
                    value={auditForm.paidLeaveDays} 
                    onChange={e => setAuditForm({ ...auditForm, paidLeaveDays: Number(e.target.value) })}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem', color: auditForm.absentDays > 0 ? 'var(--danger)' : undefined }}>
                    Absent / LOP Days *
                  </label>
                  <input 
                    type="number" 
                    min="0" 
                    max="31" 
                    className="form-input" 
                    style={{ borderColor: auditForm.absentDays > 0 ? 'var(--danger)' : undefined, fontWeight: 700 }}
                    value={auditForm.absentDays} 
                    onChange={e => setAuditForm({ ...auditForm, absentDays: Number(e.target.value) })}
                  />
                </div>
              </div>

              {liveLopDeduction > 0 && (
                <div style={{ marginTop: '0.75rem', fontSize: '0.78rem', color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <AlertCircle size={14} />
                  <span>
                    Auto LOP Applied: <strong>{auditForm.absentDays} unpaid absent day(s)</strong> results in deduction of <strong>₹{liveLopDeduction.toLocaleString('en-IN')}</strong>.
                  </span>
                </div>
              )}
            </div>

            {/* Salary Stack: Earnings vs Deductions Breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              {/* Earnings Column */}
              <div style={{ border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)', padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.86rem' }}>Remuneration Stack (Earnings)</span>
                  <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '0.9rem' }}>₹{liveGrossSalary.toLocaleString('en-IN')}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.72rem' }}>Basic Pay (7th Pay Commission)</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      value={auditForm.basicSalary} 
                      onChange={e => setAuditForm({ ...auditForm, basicSalary: Number(e.target.value) })}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.72rem' }}>Dearness Allowance (DA)</label>
                      <input 
                        type="number" 
                        className="form-input" 
                        value={auditForm.daAllowance} 
                        onChange={e => setAuditForm({ ...auditForm, daAllowance: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.72rem' }}>House Rent (HRA)</label>
                      <input 
                        type="number" 
                        className="form-input" 
                        value={auditForm.hraAllowance} 
                        onChange={e => setAuditForm({ ...auditForm, hraAllowance: Number(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.72rem' }}>Conveyance / Transport</label>
                      <input 
                        type="number" 
                        className="form-input" 
                        value={auditForm.transportAllowance} 
                        onChange={e => setAuditForm({ ...auditForm, transportAllowance: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.72rem' }}>Medical Allowance</label>
                      <input 
                        type="number" 
                        className="form-input" 
                        value={auditForm.medicalAllowance} 
                        onChange={e => setAuditForm({ ...auditForm, medicalAllowance: Number(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '0.72rem' }}>Special / Academic Allowance</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      value={auditForm.specialAllowance} 
                      onChange={e => setAuditForm({ ...auditForm, specialAllowance: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </div>

              {/* Deductions Column */}
              <div style={{ border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)', padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.86rem' }}>Statutory Deductions Stack</span>
                  <span style={{ fontWeight: 800, color: 'var(--danger)', fontSize: '0.9rem' }}>-₹{liveTotalDeductions.toLocaleString('en-IN')}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.72rem' }}>Employees' Provident Fund (EPF - 12%)</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      value={auditForm.pfDeduction} 
                      onChange={e => setAuditForm({ ...auditForm, pfDeduction: Number(e.target.value) })}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.72rem' }}>Income Tax (TDS u/s 192)</label>
                      <input 
                        type="number" 
                        className="form-input" 
                        value={auditForm.taxDeduction} 
                        onChange={e => setAuditForm({ ...auditForm, taxDeduction: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.72rem' }}>Professional Tax (PT)</label>
                      <input 
                        type="number" 
                        className="form-input" 
                        value={auditForm.profTax} 
                        onChange={e => setAuditForm({ ...auditForm, profTax: Number(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '0.72rem' }}>Loss of Pay (LOP Deduction - Auto)</label>
                    <div style={{ padding: '0.45rem 0.75rem', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', fontWeight: 700, color: liveLopDeduction > 0 ? 'var(--danger)' : 'var(--text-muted)' }}>
                      ₹{liveLopDeduction.toLocaleString('en-IN')} ({auditForm.absentDays} day(s))
                    </div>
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '0.72rem' }}>ESIC / Health Contribution</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      value={auditForm.esicDeduction} 
                      onChange={e => setAuditForm({ ...auditForm, esicDeduction: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Live Net Summary Box */}
            <div style={{ padding: '1rem 1.25rem', borderRadius: 'var(--radius-sm)', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(99, 102, 241, 0.05) 100%)', border: '1.5px solid rgba(16, 185, 129, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Audited Net Payable Remuneration
                </span>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--success)', marginTop: '0.1rem' }}>
                  ₹{liveNetSalary.toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic', marginTop: '0.15rem' }}>
                  {numberToIndianRupeesWords(liveNetSalary)}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span className="badge badge-success">Audit Complete</span>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                  Clicking "Confirm & Verify" will lock calculations & generate pay slip.
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* 2. DISBURSEMENT AUTHORIZATION MODAL                                       */}
      {/* ========================================================================= */}
      {disbursingStaff && (
        <Modal
          isOpen={!!disbursingStaff}
          onClose={() => setDisbursingStaff(null)}
          title="Authorize Salary Disbursement"
          subtitle={`March 2026 Remuneration for ${disbursingStaff.staffName}`}
          maxWidth="580px"
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setDisbursingStaff(null)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleProcessDisbursement}>
                <CheckCircle2 size={16} />
                <span>Authorize & Transfer ₹{disbursingStaff.netSalary.toLocaleString('en-IN')}</span>
              </button>
            </>
          }
        >
          <form onSubmit={handleProcessDisbursement} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ padding: '1rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface-elevated)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Net Take-Home Payable</span>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--success)' }}>
                  ₹{disbursingStaff.netSalary.toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                  {numberToIndianRupeesWords(disbursingStaff.netSalary)}
                </div>
              </div>
              <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <div>Bank: <strong>{disbursingStaff.bankName}</strong></div>
                <div>Account: <strong>{disbursingStaff.accountNumber}</strong></div>
                <div>IFSC: <strong>{disbursingStaff.ifscCode || 'SBIN0001234'}</strong></div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Disbursement Payment Channel</label>
              <select 
                className="form-select"
                value={paymentMode}
                onChange={e => setPaymentMode(e.target.value)}
              >
                <option value="Corporate Direct Bank Transfer (NEFT/RTGS)">Corporate Direct Bank Transfer (NEFT/RTGS)</option>
                <option value="SBI Corporate Payroll CMS Portal">SBI Corporate Payroll CMS Portal</option>
                <option value="IMPS 24x7 Instant Remittance">IMPS 24x7 Instant Remittance</option>
                <option value="Official School Banker's Cheque">Official School Banker's Cheque</option>
                <option value="Counter Cash Voucher (INR Notes)">Counter Cash Voucher (INR Notes)</option>
              </select>
            </div>

            <div style={{ padding: '0.85rem', borderRadius: 'var(--radius-sm)', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%)', border: '1px solid rgba(16, 185, 129, 0.25)', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <ShieldCheck size={20} color="var(--success)" />
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Certified and approved by Chief Financial Officer & Bursar. Official digital salary pay slip is automatically generated with bank transaction reference upon transfer.
              </span>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* 3. OFFICIAL CERTIFIED SALARY PAYSLIP MODAL (PRINT & DOWNLOAD READY)       */}
      {/* ========================================================================= */}
      {selectedPayslip && (
        <Modal
          isOpen={!!selectedPayslip}
          onClose={() => setSelectedPayslip(null)}
          title="Certified Official Salary Payslip"
          subtitle={`Pay Period: March 2026 • Ref #${selectedPayslip.transactionRef || 'NEFT-PENDING'}`}
          maxWidth="780px"
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setSelectedPayslip(null)}>
                Close
              </button>
              <button className="btn btn-primary" onClick={() => window.print()}>
                <Printer size={16} />
                <span>Print Official Payslip</span>
              </button>
            </>
          }
        >
          <div className="printable-document" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '0.5rem' }}>
            {/* Payslip Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--border-glass)', paddingBottom: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <School size={26} color="var(--primary)" />
                  <div>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>{schoolInfo?.name || 'Delhi Public Global Academy'}</h3>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Affiliated to CBSE, New Delhi • School Code: 20184</div>
                  </div>
                </div>
                <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                  Institutional Payroll & Human Resources Directorate • {schoolInfo?.address || 'Sector 14, Institutional Area, New Delhi'}
                </p>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span className="badge badge-success" style={{ fontSize: '0.82rem', padding: '0.3rem 0.75rem' }}>
                  {selectedPayslip.status === 'Paid' ? 'SALARY DISBURSED' : 'VERIFIED & APPROVED'}
                </span>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                  Disbursement: {selectedPayslip.disbursedDate || 'Scheduled March 2026'}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                  Txn Ref: {selectedPayslip.transactionRef || 'NEFT-CORP-CMS-PENDING'}
                </div>
              </div>
            </div>

            {/* Employee Dossier */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface-elevated)', fontSize: '0.82rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>EMPLOYEE NAME</span>
                <strong>{selectedPayslip.staffName}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>ROLE & DEPARTMENT</span>
                <strong>{selectedPayslip.role}</strong>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{selectedPayslip.department}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>PAN & UAN / PF NO.</span>
                <strong>{selectedPayslip.panNumber || 'AMTPS8821F'}</strong>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>UAN: {selectedPayslip.uanNumber || '100904528192'}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>BANK CREDITED</span>
                <strong>{selectedPayslip.bankName}</strong>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{selectedPayslip.accountNumber} ({selectedPayslip.ifscCode || 'SBIN0001234'})</div>
              </div>
            </div>

            {/* Attendance Days Summary Box */}
            <div style={{ padding: '0.65rem 1rem', borderRadius: 'var(--radius-sm)', background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                Total Working Days: <strong>{selectedPayslip.totalWorkingDays || 26}</strong>
              </div>
              <div>
                Days Worked: <strong>{selectedPayslip.presentDays !== undefined ? selectedPayslip.presentDays : 24}</strong>
              </div>
              <div>
                Paid Leaves: <strong>{selectedPayslip.paidLeaveDays !== undefined ? selectedPayslip.paidLeaveDays : 2}</strong>
              </div>
              <div>
                Loss of Pay (LOP) Days: <strong>{selectedPayslip.absentDays !== undefined ? selectedPayslip.absentDays : 0}</strong>
              </div>
              <div>
                Effective Attendance: <strong style={{ color: 'var(--success)' }}>{selectedPayslip.attendanceRate || 100}%</strong>
              </div>
            </div>

            {/* Earnings & Deductions Split Tables */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {/* Earnings */}
              <div style={{ border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                <div style={{ background: 'var(--bg-surface-elevated)', padding: '0.6rem 0.85rem', fontWeight: 700, fontSize: '0.82rem', borderBottom: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Gross Remuneration Stack (INR)</span>
                  <span>Amount</span>
                </div>
                <table style={{ width: '100%', fontSize: '0.82rem', borderCollapse: 'collapse' }}>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid var(--border-glass-subtle)' }}>
                      <td style={{ padding: '0.5rem 0.85rem' }}>Basic Instructional Pay</td>
                      <td style={{ padding: '0.5rem 0.85rem', textAlign: 'right', fontWeight: 600 }}>₹{selectedPayslip.basicSalary.toLocaleString('en-IN')}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border-glass-subtle)' }}>
                      <td style={{ padding: '0.5rem 0.85rem' }}>Dearness Allowance (DA)</td>
                      <td style={{ padding: '0.5rem 0.85rem', textAlign: 'right', fontWeight: 600 }}>₹{(selectedPayslip.daAllowance || Math.round(selectedPayslip.basicSalary * 0.3)).toLocaleString('en-IN')}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border-glass-subtle)' }}>
                      <td style={{ padding: '0.5rem 0.85rem' }}>House Rent Allowance (HRA)</td>
                      <td style={{ padding: '0.5rem 0.85rem', textAlign: 'right', fontWeight: 600 }}>₹{(selectedPayslip.hraAllowance || Math.round(selectedPayslip.basicSalary * 0.24)).toLocaleString('en-IN')}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border-glass-subtle)' }}>
                      <td style={{ padding: '0.5rem 0.85rem' }}>Conveyance & Transport Allowance</td>
                      <td style={{ padding: '0.5rem 0.85rem', textAlign: 'right', fontWeight: 600 }}>₹{(selectedPayslip.transportAllowance || 5000).toLocaleString('en-IN')}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border-glass-subtle)' }}>
                      <td style={{ padding: '0.5rem 0.85rem' }}>Medical & Health Allowance</td>
                      <td style={{ padding: '0.5rem 0.85rem', textAlign: 'right', fontWeight: 600 }}>₹{(selectedPayslip.medicalAllowance || 3500).toLocaleString('en-IN')}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '0.5rem 0.85rem' }}>Special / Academic Allowance</td>
                      <td style={{ padding: '0.5rem 0.85rem', textAlign: 'right', fontWeight: 600 }}>₹{(selectedPayslip.specialAllowance || 3000).toLocaleString('en-IN')}</td>
                    </tr>
                    <tr style={{ borderTop: '2px solid var(--border-glass)', background: 'var(--bg-surface-elevated)', fontWeight: 800 }}>
                      <td style={{ padding: '0.6rem 0.85rem' }}>Gross Earnings Total (A)</td>
                      <td style={{ padding: '0.6rem 0.85rem', textAlign: 'right', color: 'var(--primary)' }}>
                        ₹{(selectedPayslip.grossSalary || (selectedPayslip.basicSalary + 45000)).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Deductions */}
              <div style={{ border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                <div style={{ background: 'var(--bg-surface-elevated)', padding: '0.6rem 0.85rem', fontWeight: 700, fontSize: '0.82rem', borderBottom: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Statutory Deductions (INR)</span>
                  <span>Amount</span>
                </div>
                <table style={{ width: '100%', fontSize: '0.82rem', borderCollapse: 'collapse' }}>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid var(--border-glass-subtle)' }}>
                      <td style={{ padding: '0.5rem 0.85rem' }}>Employees' Provident Fund (EPF 12%)</td>
                      <td style={{ padding: '0.5rem 0.85rem', textAlign: 'right', fontWeight: 600, color: 'var(--danger)' }}>-₹{(selectedPayslip.pfDeduction || Math.round(selectedPayslip.basicSalary * 0.12)).toLocaleString('en-IN')}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border-glass-subtle)' }}>
                      <td style={{ padding: '0.5rem 0.85rem' }}>Income Tax Withholding (TDS u/s 192)</td>
                      <td style={{ padding: '0.5rem 0.85rem', textAlign: 'right', fontWeight: 600, color: 'var(--danger)' }}>-₹{(selectedPayslip.taxDeduction || 7500).toLocaleString('en-IN')}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border-glass-subtle)' }}>
                      <td style={{ padding: '0.5rem 0.85rem' }}>Professional Tax (PT)</td>
                      <td style={{ padding: '0.5rem 0.85rem', textAlign: 'right', fontWeight: 600, color: 'var(--danger)' }}>-₹{(selectedPayslip.profTax || 200).toLocaleString('en-IN')}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border-glass-subtle)' }}>
                      <td style={{ padding: '0.5rem 0.85rem' }}>Loss of Pay (LOP Deductions)</td>
                      <td style={{ padding: '0.5rem 0.85rem', textAlign: 'right', fontWeight: 600, color: selectedPayslip.lopDeduction > 0 ? 'var(--danger)' : 'var(--text-muted)' }}>
                        {selectedPayslip.lopDeduction > 0 ? `-₹${selectedPayslip.lopDeduction.toLocaleString('en-IN')}` : '₹0'}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '0.5rem 0.85rem', color: 'var(--text-muted)' }}>ESIC Health Scheme</td>
                      <td style={{ padding: '0.5rem 0.85rem', textAlign: 'right', color: 'var(--text-muted)' }}>₹0</td>
                    </tr>
                    <tr style={{ borderTop: '2px solid var(--border-glass)', background: 'var(--bg-surface-elevated)', fontWeight: 800 }}>
                      <td style={{ padding: '0.6rem 0.85rem' }}>Total Deductions (B)</td>
                      <td style={{ padding: '0.6rem 0.85rem', textAlign: 'right', color: 'var(--danger)' }}>
                        -₹{(selectedPayslip.totalDeductions || ((selectedPayslip.pfDeduction || 0) + (selectedPayslip.taxDeduction || 0) + (selectedPayslip.profTax || 200) + (selectedPayslip.lopDeduction || 0))).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Net Take-Home Salary Box */}
            <div style={{ padding: '1rem 1.25rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface-elevated)', border: '2px solid var(--success)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Net Payable Remuneration (A - B)
                </span>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--success)' }}>
                  ₹{selectedPayslip.netSalary.toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic', marginTop: '0.15rem' }}>
                  {numberToIndianRupeesWords(selectedPayslip.netSalary)}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span className="badge badge-success">Official Digital Seal</span>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Mode: {selectedPayslip.paymentMode || 'Corporate NEFT'}
                </div>
              </div>
            </div>

            {/* Official Dual Signatures */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-glass)' }}>
              <div style={{ textAlign: 'center', minWidth: '190px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, fontFamily: 'cursive', color: 'var(--primary)', marginBottom: '0.2rem' }}>
                  CA R. K. Malhotra, FCA
                </div>
                <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '0.35rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Chief Bursar / Senior Accountant
                </div>
              </div>

              <div style={{ textAlign: 'center', minWidth: '190px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, fontFamily: 'cursive', color: 'var(--primary)', marginBottom: '0.2rem' }}>
                  Dr. Rajeshwar Prasad, Ph.D.
                </div>
                <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '0.35rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Principal & Authorized Signatory
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
