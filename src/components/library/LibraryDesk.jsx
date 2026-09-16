import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import Modal from '../common/Modal';
import { 
  BookOpen, 
  Search, 
  CheckCircle2, 
  BookmarkCheck, 
  CornerDownLeft, 
  ShieldCheck, 
  Filter, 
  User, 
  Clock, 
  AlertTriangle, 
  Check, 
  IndianRupee, 
  Printer, 
  QrCode, 
  School, 
  Layers, 
  Send 
} from 'lucide-react';

export default function LibraryDesk() {
  const { 
    library, 
    libraryLoans, 
    libraryHistory = [],
    students, 
    issueBookToStudent, 
    returnBookFromStudent, 
    toggleBookIssue, 
    currentRole,
    activeStudent,
    schoolInfo 
  } = useERP();

  const isStudent = currentRole === 'student';
  const [activeTab, setActiveTab] = useState(isStudent ? 'student-issued' : 'whom-to-give'); // 'whom-to-give' | 'whom-to-receive' | 'student-issued' | 'student-history' | 'catalog'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const myCurrentStudent = activeStudent || students[0];
  const myCurrentlyIssuedBooks = (libraryLoans || []).filter(l => 
    l.studentId === myCurrentStudent?.id || 
    l.rollNo === myCurrentStudent?.rollNo ||
    (l.studentName && l.studentName.toLowerCase() === myCurrentStudent?.name.toLowerCase())
  );
  const myPreviousReturnedBooks = (libraryHistory || []).filter(l => 
    l.studentId === myCurrentStudent?.id || 
    l.rollNo === myCurrentStudent?.rollNo ||
    (l.studentName && l.studentName.toLowerCase() === myCurrentStudent?.name.toLowerCase())
  );

  // "Whom to Give" (Issue) State
  const [issueClassFilter, setIssueClassFilter] = useState('all');
  const [issueDivFilter, setIssueDivFilter] = useState('all');
  const [studentSearch, setStudentSearch] = useState('');
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('std-1001'); // Aarav Sharma
  const [selectedBookId, setSelectedBookId] = useState('lib-01');
  const [loanDays, setLoanDays] = useState('14');
  const [issuedSlip, setIssuedSlip] = useState(null);

  // "Whom to Receive" (Return) Filter State
  const [returnSearch, setReturnSearch] = useState('');
  const [returnClassFilter, setReturnClassFilter] = useState('all');
  const [receivingLoan, setReceivingLoan] = useState(null);
  const [fineWaiver, setFineWaiver] = useState(false);

  const categories = ['all', 'Computer Science', 'Physics', 'Mathematics', 'Chemistry', 'Biography & Science'];

  // Students matching issue filters
  const eligibleStudents = students.filter(s => {
    if (issueClassFilter !== 'all' && !s.className.toLowerCase().includes(issueClassFilter.toLowerCase())) return false;
    if (issueDivFilter !== 'all' && !s.className.toLowerCase().includes(issueDivFilter.toLowerCase())) return false;
    if (studentSearch.trim()) {
      const q = studentSearch.toLowerCase();
      const matchName = s.name.toLowerCase().includes(q);
      const matchRoll = (s.rollNo || '').toLowerCase().includes(q);
      return matchName || matchRoll;
    }
    return true;
  });

  const activeIssueStudent = students.find(s => s.id === selectedStudentId) || students[0];
  const activeIssueBook = library.find(b => b.id === selectedBookId) || library[0];
  const studentActiveLoans = (libraryLoans || []).filter(l => l.studentId === activeIssueStudent?.id);

  // Filter for Active Loans ("Whom to Receive")
  const filteredActiveLoans = (libraryLoans || []).filter(loan => {
    if (returnClassFilter !== 'all' && !loan.className.toLowerCase().includes(returnClassFilter.toLowerCase())) return false;
    if (returnSearch.trim()) {
      const q = returnSearch.toLowerCase();
      const matchStudent = loan.studentName.toLowerCase().includes(q);
      const matchBook = loan.bookTitle.toLowerCase().includes(q);
      const matchRoll = (loan.rollNo || '').toLowerCase().includes(q);
      const matchIsbn = (loan.isbn || '').includes(q);
      return matchStudent || matchBook || matchRoll || matchIsbn;
    }
    return true;
  });

  // Filter catalogue books
  const filteredBooks = library.filter(book => {
    const matchesSearch = 
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.isbn.includes(searchTerm);
    const matchesCategory = selectedCategory === 'all' || book.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSelectStudentForIssue = (student) => {
    setSelectedStudentId(student.id);
    setStudentSearch(student.name);
    setShowStudentDropdown(false);
  };

  const handleProcessIssue = async (e) => {
    e.preventDefault();
    if (!activeIssueStudent || !activeIssueBook) return;

    if (activeIssueBook.availableCopies <= 0) {
      alert('Selected book currently has 0 copies available on shelf.');
      return;
    }

    if (studentActiveLoans.length >= 3) {
      alert(`${activeIssueStudent.name} has already reached the maximum lending limit of 3 books.`);
      return;
    }

    await issueBookToStudent(activeIssueBook.id, activeIssueStudent.id, Number(loanDays));

    const dueDateObj = new Date();
    dueDateObj.setDate(dueDateObj.getDate() + Number(loanDays));

    // Show Printable Issue Slip
    setIssuedSlip({
      loanRef: `ISSUE-${Date.now().toString().slice(-6)}`,
      student: activeIssueStudent,
      book: activeIssueBook,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: dueDateObj.toISOString().split('T')[0],
      loanDays
    });
  };

  const handleOpenReceiveModal = (loan) => {
    setReceivingLoan(loan);
    setFineWaiver(false);
  };

  const handleConfirmReturn = async () => {
    if (!receivingLoan) return;
    const finalFine = fineWaiver ? 0 : (receivingLoan.fineAmount || 0);
    await returnBookFromStudent(receivingLoan.loanId, finalFine);
    setReceivingLoan(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <BookOpen color="var(--primary-light)" size={28} />
            <span>Digital Library & Smart Circulation Desk</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Intelligent student lookup, Class & Section allocation, automated ₹5/day overdue fines, and return vouchers.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="tab-group" style={{ display: 'flex', gap: '0.5rem' }}>
          {isStudent ? (
            <>
              <button 
                className={`tab-btn ${activeTab === 'student-issued' ? 'active' : ''}`}
                onClick={() => setActiveTab('student-issued')}
              >
                <BookmarkCheck size={15} />
                <span>Currently Issued Books ({myCurrentlyIssuedBooks.length})</span>
              </button>
              <button 
                className={`tab-btn ${activeTab === 'student-history' ? 'active' : ''}`}
                onClick={() => setActiveTab('student-history')}
              >
                <Clock size={15} />
                <span>Previous Books History ({myPreviousReturnedBooks.length})</span>
              </button>
              <button 
                className={`tab-btn ${activeTab === 'catalog' ? 'active' : ''}`}
                onClick={() => setActiveTab('catalog')}
              >
                <Layers size={15} />
                <span>Library Catalogue ({library.length})</span>
              </button>
            </>
          ) : (
            <>
              <button 
                className={`tab-btn ${activeTab === 'whom-to-give' ? 'active' : ''}`}
                onClick={() => setActiveTab('whom-to-give')}
              >
                <BookmarkCheck size={15} />
                <span>Whom to Give (Issue Desk)</span>
              </button>
              <button 
                className={`tab-btn ${activeTab === 'whom-to-receive' ? 'active' : ''}`}
                onClick={() => setActiveTab('whom-to-receive')}
              >
                <CornerDownLeft size={15} />
                <span>Whom to Receive (Active Loans: {libraryLoans?.length || 0})</span>
              </button>
              <button 
                className={`tab-btn ${activeTab === 'catalog' ? 'active' : ''}`}
                onClick={() => setActiveTab('catalog')}
              >
                <Layers size={15} />
                <span>Library Catalogue ({library.length})</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Circulation Policy KPI Banner */}
      <div className="glass-panel" style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-light)' }}>
            <School size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>
              {isStudent ? `Student Lending Quota: ${myCurrentStudent.name} (${myCurrentStudent.className})` : 'Central Secondary Library Rules & Lending Quota'}
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Standard loan: 14 Days • Student quota: Max 3 Books • Overdue penalty: <strong>₹5 / day</strong> • Barcode check active
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <span className="badge badge-success">Digital Barcode Scanner Ready</span>
          <span className="badge badge-primary">
            {isStudent ? `${myCurrentlyIssuedBooks.length} Books in Possession` : `${libraryLoans?.length || 0} Books on Loan`}
          </span>
        </div>
      </div>

      {/* STUDENT TAB 1: CURRENTLY ISSUED BOOKS */}
      {isStudent && activeTab === 'student-issued' && (
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <div style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.85rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>My Currently Issued Books</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                Active library loans issued to <strong>{myCurrentStudent.name}</strong> (Roll No: {myCurrentStudent.rollNo}). Please return or renew on or before due date.
              </p>
            </div>
            <span className="badge badge-primary" style={{ fontSize: '0.82rem', padding: '0.35rem 0.75rem' }}>
              {myCurrentlyIssuedBooks.length} / 3 Books Lent
            </span>
          </div>

          {myCurrentlyIssuedBooks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
              <BookOpen size={48} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>No Books Currently Issued</h4>
              <p style={{ fontSize: '0.85rem', marginTop: '0.3rem' }}>
                You have not borrowed any books from the secondary library currently.
              </p>
              <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => setActiveTab('catalog')}>
                <Search size={16} />
                <span>Browse Library Catalogue</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
              {myCurrentlyIssuedBooks.map((loan) => {
                const isOverdue = loan.status === 'Overdue' || (loan.overdueDays && loan.overdueDays > 0);
                const fine = loan.fineAmount || (isOverdue ? (loan.overdueDays || 5) * 5 : 0);

                return (
                  <div 
                    key={loan.loanId} 
                    style={{ 
                      padding: '1.25rem', 
                      borderRadius: 'var(--radius-md)', 
                      background: 'var(--bg-surface-elevated)', 
                      border: isOverdue ? '2px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--border-light)',
                      display: 'flex', 
                      flexDirection: 'column', 
                      justifyContent: 'space-between' 
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <span className={`badge ${isOverdue ? 'badge-danger' : 'badge-primary'}`}>
                          {isOverdue ? `Overdue (${loan.overdueDays || 5} Days)` : 'Active Loan'}
                        </span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          Ref: <strong>{loan.loanId}</strong>
                        </span>
                      </div>

                      <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
                        {loan.bookTitle}
                      </h4>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                        ISBN: <code>{loan.isbn}</code>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', background: '#ffffff', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', marginBottom: '1rem', fontSize: '0.8rem' }}>
                        <div>
                          <div style={{ color: 'var(--text-muted)' }}>Issue Date</div>
                          <div style={{ fontWeight: 700 }}>{loan.issueDate}</div>
                        </div>
                        <div>
                          <div style={{ color: 'var(--text-muted)' }}>Return Due Date</div>
                          <div style={{ fontWeight: 700, color: isOverdue ? 'var(--danger)' : 'var(--text-primary)' }}>
                            {loan.dueDate}
                          </div>
                        </div>
                      </div>

                      {isOverdue && (
                        <div style={{ padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', fontSize: '0.8rem', color: 'var(--danger)', marginBottom: '1rem' }}>
                          ⚠️ Overdue Fine Calculated: <strong>₹{fine}</strong> (at ₹5/day rate)
                        </div>
                      )}
                    </div>

                    <button 
                      className="btn btn-secondary" 
                      style={{ width: '100%', fontSize: '0.82rem' }}
                      onClick={() => {
                        const book = library.find(b => b.id === loan.bookId) || { title: loan.bookTitle, isbn: loan.isbn, author: 'Central Secondary Library' };
                        setIssuedSlip({
                          loanRef: loan.loanId,
                          student: myCurrentStudent,
                          book: book,
                          issueDate: loan.issueDate,
                          dueDate: loan.dueDate,
                          fineRate: 5
                        });
                      }}
                    >
                      <QrCode size={16} />
                      <span>View Digital Borrower Pass & QR</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* STUDENT TAB 2: PREVIOUS BOOKS HISTORY */}
      {isStudent && activeTab === 'student-history' && (
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <div style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.85rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Previous Books Borrowing History</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                Complete archive of library books previously borrowed, returned, and cleared by <strong>{myCurrentStudent.name}</strong>.
              </p>
            </div>
            <span className="badge badge-success" style={{ fontSize: '0.82rem', padding: '0.35rem 0.75rem' }}>
              {myPreviousReturnedBooks.length} Returned Titles
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-surface-elevated)', borderBottom: '2px solid var(--border-light)' }}>
                  <th style={{ padding: '0.85rem', textAlign: 'left' }}>Book Title & Author</th>
                  <th style={{ padding: '0.85rem', textAlign: 'left' }}>Borrow Date</th>
                  <th style={{ padding: '0.85rem', textAlign: 'left' }}>Return Date</th>
                  <th style={{ padding: '0.85rem', textAlign: 'left' }}>Clearance Status</th>
                  <th style={{ padding: '0.85rem', textAlign: 'left' }}>Clearance Receipt</th>
                  <th style={{ padding: '0.85rem', textAlign: 'right' }}>Librarian Seal</th>
                </tr>
              </thead>
              <tbody>
                {myPreviousReturnedBooks.map((hist, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '0.85rem' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{hist.bookTitle}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{hist.author || 'CBSE Recommended Reading'}</div>
                    </td>
                    <td style={{ padding: '0.85rem', color: 'var(--text-secondary)' }}>{hist.issueDate}</td>
                    <td style={{ padding: '0.85rem', fontWeight: 600 }}>{hist.returnDate}</td>
                    <td style={{ padding: '0.85rem' }}>
                      <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Check size={12} />
                        <span>{hist.status || 'Returned & Cleared'}</span>
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem', fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary)' }}>
                      {hist.clearanceSlipNo || hist.loanId}
                    </td>
                    <td style={{ padding: '0.85rem', textAlign: 'right', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {hist.librarianSign || 'Mrs. Meenakshi Sundaram'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 1: WHOM TO GIVE (Smart Issue Desk - For Librarian / Admin) */}
      {!isStudent && activeTab === 'whom-to-give' && (
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <div style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.85rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Issue Book: Student Recommendation & Book Checkout</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Select student by typing name or filtering by class/section, then allocate books from the available shelf catalog.
            </p>
          </div>

          <form onSubmit={handleProcessIssue} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Step 1: Class & Division Filtering */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', background: 'var(--bg-surface-elevated)', padding: '0.85rem', borderRadius: 'var(--radius-sm)' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Filter size={12} /> Target Class
                </label>
                <select 
                  className="form-select"
                  style={{ padding: '0.45rem 0.65rem', fontSize: '0.82rem' }}
                  value={issueClassFilter}
                  onChange={e => setIssueClassFilter(e.target.value)}
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
                  <Filter size={12} /> Target Section / Division
                </label>
                <select 
                  className="form-select"
                  style={{ padding: '0.45rem 0.65rem', fontSize: '0.82rem' }}
                  value={issueDivFilter}
                  onChange={e => setIssueDivFilter(e.target.value)}
                >
                  <option value="all">All Sections (A, B, C)</option>
                  <option value="-A">Section A</option>
                  <option value="-B">Section B</option>
                  <option value="-C">Section C</option>
                </select>
              </div>
            </div>

            {/* Step 2: Student Recommendation Auto-Suggest */}
            <div className="form-group" style={{ position: 'relative' }}>
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Type Student Name (Recommendation Auto-Suggest) *</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {eligibleStudents.length} Students Available
                </span>
              </label>

              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Type student name (e.g. Aarav, Aditi, Rohan, Diya) or roll number..."
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
                  {eligibleStudents.length === 0 ? (
                    <div style={{ padding: '0.85rem', fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                      No students found matching your filters.
                    </div>
                  ) : (
                    eligibleStudents.map(s => {
                      const loans = (libraryLoans || []).filter(l => l.studentId === s.id);
                      const isSelected = s.id === selectedStudentId;
                      return (
                        <div 
                          key={s.id}
                          onClick={() => handleSelectStudentForIssue(s)}
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
                            <span className={`badge ${loans.length >= 3 ? 'badge-danger' : 'badge-primary'}`} style={{ fontSize: '0.7rem' }}>
                              {loans.length} / 3 Books Borrowed
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* Selected Student Active Card */}
            {activeIssueStudent && (
              <div style={{ border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface-elevated)', padding: '0.85rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <User size={20} color="var(--primary-light)" />
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.92rem' }}>{activeIssueStudent.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {activeIssueStudent.className} • Roll No: {activeIssueStudent.rollNo} • Admission No: {activeIssueStudent.admissionNo || 'ADM-2026-101'}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span className={`badge ${studentActiveLoans.length >= 3 ? 'badge-danger' : 'badge-success'}`}>
                    {studentActiveLoans.length >= 3 ? 'Quota Exhausted (3/3)' : `Quota Available (${3 - studentActiveLoans.length} slots left)`}
                  </span>
                </div>
              </div>
            )}

            {/* Step 3: Select Book from Catalogue */}
            <div className="form-group">
              <label className="form-label">Select Book from Shelf Inventory *</label>
              <select 
                className="form-select"
                value={selectedBookId}
                onChange={e => setSelectedBookId(e.target.value)}
              >
                {library.map(b => (
                  <option key={b.id} value={b.id} disabled={b.availableCopies <= 0}>
                    {b.title} — {b.author} ({b.availableCopies} available on shelf {b.shelf}) {b.availableCopies <= 0 ? '[OUT OF STOCK]' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Step 4: Loan Period */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Loan Duration *</label>
                <select 
                  className="form-select"
                  value={loanDays}
                  onChange={e => setLoanDays(e.target.value)}
                >
                  <option value="14">14 Days (Standard CBSE Library Term)</option>
                  <option value="7">7 Days (Short Term Reference Loan)</option>
                  <option value="21">21 Days (Exam Prep / Extended Research)</option>
                  <option value="30">30 Days (Faculty / Master Scholar Loan)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Book Location Shelf</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={`${activeIssueBook?.shelf || 'STACK-101'} • ISBN: ${activeIssueBook?.isbn || '978-XXXX'}`}
                  readOnly
                  style={{ background: 'var(--bg-surface-elevated)', color: 'var(--text-secondary)' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button 
                type="submit" 
                className="btn btn-primary"
                style={{ padding: '0.65rem 1.5rem', fontSize: '0.92rem' }}
                disabled={!activeIssueBook || activeIssueBook.availableCopies <= 0 || studentActiveLoans.length >= 3}
              >
                <BookmarkCheck size={16} />
                <span>Authorize & Issue to {activeIssueStudent?.name}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: WHOM TO RECEIVE (Active Loans & Return Desk) */}
      {activeTab === 'whom-to-receive' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Filters Bar */}
          <div className="glass-panel" style={{ padding: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.85rem', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '280px' }}>
              <div style={{ position: 'relative', width: '100%' }}>
                <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text"
                  className="form-input"
                  placeholder="Search borrowers by student name, book title, or roll number..."
                  value={returnSearch}
                  onChange={e => setReturnSearch(e.target.value)}
                  style={{ paddingLeft: '2.4rem' }}
                />
              </div>
            </div>

            <select 
              className="form-select"
              style={{ width: 'auto', fontSize: '0.82rem' }}
              value={returnClassFilter}
              onChange={e => setReturnClassFilter(e.target.value)}
            >
              <option value="all">All Classes</option>
              <option value="Class 9">Class 9</option>
              <option value="Class 10">Class 10</option>
              <option value="Class 11">Class 11</option>
              <option value="Class 12">Class 12</option>
            </select>
          </div>

          {/* Active Borrowers Roster Table */}
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student Borrower</th>
                  <th>Class & Roll No</th>
                  <th>Borrowed Book Title</th>
                  <th>Issue Date</th>
                  <th>Due Date</th>
                  <th>Status & Late Fine</th>
                  <th style={{ textAlign: 'right' }}>Receive Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredActiveLoans.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                      No active book loans found. All borrowed copies are returned!
                    </td>
                  </tr>
                ) : (
                  filteredActiveLoans.map(loan => {
                    const isOverdue = loan.status === 'Overdue' || (loan.fineAmount && loan.fineAmount > 0);
                    return (
                      <tr key={loan.loanId}>
                        <td>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{loan.studentName}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>ID: {loan.studentId}</div>
                        </td>
                        <td>
                          <span className="badge badge-primary">{loan.className}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.35rem' }}>
                            Roll {loan.rollNo}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{loan.bookTitle}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                            ISBN: {loan.isbn}
                          </div>
                        </td>
                        <td style={{ fontSize: '0.82rem' }}>{loan.issueDate}</td>
                        <td style={{ fontSize: '0.82rem', fontWeight: 600 }}>{loan.dueDate}</td>
                        <td>
                          {isOverdue ? (
                            <div>
                              <span className="badge badge-danger">
                                <AlertTriangle size={11} /> Overdue by {loan.overdueDays || 10} Days
                              </span>
                              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--danger)', marginTop: '0.2rem' }}>
                                Fine: ₹{loan.fineAmount || (loan.overdueDays || 10) * 5} (@ ₹5/day)
                              </div>
                            </div>
                          ) : (
                            <span className="badge badge-success">
                              <CheckCircle2 size={11} /> Active (Due on schedule)
                            </span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button 
                            className="btn btn-primary"
                            style={{ padding: '0.35rem 0.85rem', fontSize: '0.76rem' }}
                            onClick={() => handleOpenReceiveModal(loan)}
                          >
                            <CornerDownLeft size={13} />
                            <span>Receive Return</span>
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

      {/* TAB 3: FULL INVENTORY CATALOGUE */}
      {activeTab === 'catalog' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Search & Filter */}
          <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '280px' }}>
              <div style={{ position: 'relative', width: '100%' }}>
                <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text"
                  className="form-input"
                  placeholder="Search by book title, author, or ISBN barcode..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ paddingLeft: '2.4rem' }}
                />
              </div>
            </div>

            <select 
              className="form-select"
              style={{ width: 'auto' }}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(c => (
                <option key={c} value={c}>{c === 'all' ? 'All Genres & Subjects' : c}</option>
              ))}
            </select>
          </div>

          {/* Books Table */}
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Book Title & Author</th>
                  <th>Category</th>
                  <th>ISBN Code</th>
                  <th>Shelf Location</th>
                  <th>Available / Total Copies</th>
                  <th style={{ textAlign: 'right' }}>Direct Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredBooks.map((book) => {
                  const hasCopies = book.availableCopies > 0;
                  return (
                    <tr key={book.id}>
                      <td>
                        <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{book.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>By: {book.author}</div>
                      </td>
                      <td>
                        <span className="badge badge-primary">{book.category}</span>
                      </td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>
                        {book.isbn}
                      </td>
                      <td>
                        <span className="badge">{book.shelf}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 800, color: hasCopies ? 'var(--success)' : 'var(--danger)' }}>
                            {book.availableCopies}
                          </span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>/ {book.totalCopies} copies</span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button 
                          className="btn btn-secondary"
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.76rem' }}
                          onClick={() => {
                            setSelectedBookId(book.id);
                            setActiveTab('whom-to-give');
                          }}
                        >
                          <BookmarkCheck size={14} color="var(--primary-light)" />
                          <span>Issue to Student</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Return Confirmation & Late Fine Settlement Modal */}
      {receivingLoan && (
        <Modal
          isOpen={!!receivingLoan}
          onClose={() => setReceivingLoan(null)}
          title="Receive Book Return & Clear Dues"
          subtitle={`Inward checkout for ${receivingLoan.bookTitle}`}
          maxWidth="560px"
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setReceivingLoan(null)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleConfirmReturn}>
                <CheckCircle2 size={16} />
                <span>Confirm Return & Shelve Book</span>
              </button>
            </>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ padding: '1rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-glass)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>STUDENT BORROWER</span>
                  <div style={{ fontSize: '1rem', fontWeight: 800 }}>{receivingLoan.studentName}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {receivingLoan.className} • Roll {receivingLoan.rollNo}
                  </div>
                </div>
                <span className="badge badge-primary">Loan Ref #{receivingLoan.loanId}</span>
              </div>

              <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-glass-subtle)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>BOOK TITLE</span>
                  <strong>{receivingLoan.bookTitle}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>LOAN PERIOD</span>
                  <span>{receivingLoan.issueDate} to {receivingLoan.dueDate}</span>
                </div>
              </div>
            </div>

            {/* Overdue Fine Box */}
            {(receivingLoan.fineAmount > 0 || receivingLoan.status === 'Overdue') && (
              <div style={{ padding: '1rem', borderRadius: 'var(--radius-sm)', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--danger)', fontWeight: 700, textTransform: 'uppercase' }}>
                      Overdue Fine Payable (@ ₹5/day)
                    </span>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--danger)' }}>
                      ₹{fineWaiver ? 0 : (receivingLoan.fineAmount || 50)}
                    </div>
                  </div>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600 }}>
                    <input 
                      type="checkbox"
                      checked={fineWaiver}
                      onChange={e => setFineWaiver(e.target.checked)}
                      style={{ width: '15px', height: '15px', accentColor: 'var(--primary)' }}
                    />
                    <span>Waive Fine (Special Exemption)</span>
                  </label>
                </div>
              </div>
            )}

            <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface-elevated)', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Upon confirmation, the book copy will be immediately replenished to inventory shelf and available for subsequent borrowers.
            </div>
          </div>
        </Modal>
      )}

      {/* Official Certified Book Issue Slip Modal */}
      {issuedSlip && (
        <Modal
          isOpen={!!issuedSlip}
          onClose={() => setIssuedSlip(null)}
          title="Digital Library Circulation Slip"
          subtitle={`Transaction Ref #${issuedSlip.loanRef}`}
          maxWidth="560px"
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setIssuedSlip(null)}>
                Close
              </button>
              <button className="btn btn-primary" onClick={() => window.print()}>
                <Printer size={16} />
                <span>Print Borrower Slip</span>
              </button>
            </>
          }
        >
          <div className="printable-document" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.5rem' }}>
            <div style={{ textAlign: 'center', borderBottom: '2px solid var(--border-glass)', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                <School size={22} color="var(--primary-light)" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{schoolInfo?.name || 'Delhi Public Global Academy'}</h3>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Secondary Library & Resource Center • Loan Voucher
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', padding: '0.85rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface-elevated)', fontSize: '0.82rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>BORROWER</span>
                <strong>{issuedSlip.student.name}</strong> ({issuedSlip.student.className})
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>ROLL NUMBER</span>
                <strong>{issuedSlip.student.rollNo}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>DATE OF ISSUE</span>
                <strong>{issuedSlip.issueDate}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>RETURN DUE DATE</span>
                <strong style={{ color: 'var(--primary-light)' }}>{issuedSlip.dueDate}</strong>
              </div>
            </div>

            <div style={{ padding: '0.85rem', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem' }}>
              <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{issuedSlip.book.title}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>Author: {issuedSlip.book.author} • Shelf: {issuedSlip.book.shelf}</div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>ISBN: {issuedSlip.book.isbn}</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid var(--border-glass)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <QrCode size={42} />
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Scan at security gate to verify authorized book loan.</div>
              </div>
              <div style={{ textAlign: 'right', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                <div style={{ fontFamily: 'cursive', fontSize: '0.85rem', color: 'var(--primary-light)', fontWeight: 700 }}>Mrs. M. Sundaram</div>
                <div>Head Librarian Signature</div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
