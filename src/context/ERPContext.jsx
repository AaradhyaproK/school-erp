import React, { createContext, useContext, useState, useEffect } from 'react';
import { DataService } from '../firebase/dataService';
import { isFirebaseConnected } from '../firebase/config';

const ERPContext = createContext(null);

export function ERPProvider({ children }) {
  const theme = 'light';
  const [currentRole, setCurrentRole] = useState('admin'); // 'admin' | 'teacher' | 'student' | 'parent' | 'accountant' | 'librarian'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState(null);

  // Core Data States
  const [loading, setLoading] = useState(true);
  const [schoolInfo, setSchoolInfo] = useState(null);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [staff, setStaff] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [exams, setExams] = useState([]);
  const [fees, setFees] = useState([]);
  const [notices, setNotices] = useState([]);
  const [library, setLibrary] = useState([]);
  const [transport, setTransport] = useState([]);
  const [users, setUsers] = useState([]);
  const [payroll, setPayroll] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [complaints, setComplaints] = useState([]);
  const [libraryLoans, setLibraryLoans] = useState([]);
  const [libraryHistory, setLibraryHistory] = useState([]);
  const [assignments, setAssignments] = useState([]);

  // Active perspective targets
  const [activeStudentId, setActiveStudentId] = useState('std-1001'); // Aarav Sharma
  const [activeTeacherId, setActiveTeacherId] = useState('stf-03'); // Prof. Vikram Malhotra

  // Enforce Day Mode on document root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.setItem('campusflow_theme', 'light');
  }, []);


  // Load Initial State
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const state = await DataService.getInitialState();
        setSchoolInfo(state.schoolInfo);
        setStudents(state.students);
        setClasses(state.classes);
        setStaff(state.staff);
        setTimetable(state.timetable);
        setExams(state.exams);
        setFees(state.fees);
        setNotices(state.notices);
        setLibrary(state.library);
        setLibraryLoans(state.libraryLoans || []);
        setLibraryHistory(state.libraryHistory || []);
        setComplaints(state.complaints || []);
        setAssignments(state.assignments || []);
        setTransport(state.transport);
        setUsers(state.users || []);
        setPayroll(state.payroll || []);
        setAttendance(state.attendance);
      } catch (err) {
        console.error('Failed to load ERP state:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 4000);
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Actions
  const addStudent = async (studentData) => {
    const newStudent = {
      ...studentData,
      id: `std-${Date.now()}`,
      admissionNo: `ADM-2026-${Math.floor(100 + Math.random() * 900)}`,
      gpa: 10.0,
      attendanceRate: 100,
      feeStatus: 'Unpaid',
      status: 'Active',
      avatar: studentData.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
    };
    const updated = await DataService.saveStudent(newStudent, students);
    setStudents(updated);
    showToast(`New student ${newStudent.name} admitted successfully!`);
    return newStudent;
  };

  // User Management & RBAC Action
  const createUser = async (userData) => {
    const newUser = {
      ...userData,
      id: `usr-${Date.now()}`,
      status: 'Active',
      lastLogin: 'Never',
      avatar: userData.avatar || (
        userData.role === 'admin' ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' :
        userData.role === 'accountant' ? 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80' :
        userData.role === 'librarian' ? 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80' :
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
      )
    };
    const updated = await DataService.saveUser(newUser, users);
    setUsers(updated);
    showToast(`User account created for ${newUser.name} with role [${newUser.role.toUpperCase()}]!`);
    return newUser;
  };

  // Staff Salary Structure / Attendance Verification Action
  const updatePayrollRecord = async (staffId, updatedFields = {}) => {
    const record = payroll.find(p => p.staffId === staffId);
    if (!record) return;

    const updatedRecord = {
      ...record,
      ...updatedFields
    };

    const updated = await DataService.savePayroll(updatedRecord, payroll);
    setPayroll(updated);
    showToast(`Payroll for ${record.staffName} updated & verified!`);
    return updatedRecord;
  };

  // Staff Salary Disbursement Action
  const disburseSalary = async (staffId, details = {}) => {
    const record = payroll.find(p => p.staffId === staffId);
    if (!record) return;

    const updatedRecord = {
      ...record,
      ...details,
      status: 'Paid',
      disbursedDate: new Date().toISOString().split('T')[0],
      transactionRef: details.transactionRef || `SAL-${new Date().toISOString().slice(0, 7).replace('-', '')}-${Math.floor(100 + Math.random() * 900)}`,
      paymentMode: details.paymentMode || 'Corporate Direct Bank Transfer (NEFT/RTGS)'
    };

    const updated = await DataService.savePayroll(updatedRecord, payroll);
    setPayroll(updated);
    showToast(`Salary of ₹${Number(updatedRecord.netSalary).toLocaleString('en-IN')} disbursed to ${record.staffName}!`);
    return updatedRecord;
  };

  // Custom Fee Demand / Invoice Generation
  const createInvoice = async (invoiceData) => {
    const newInvoice = {
      ...invoiceData,
      invoiceNo: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      paidAmount: 0,
      balance: invoiceData.totalAmount,
      status: 'Overdue',
      paidDate: null,
      transactionId: null
    };
    const updated = await DataService.saveInvoice(newInvoice, fees);
    setFees(updated);
    showToast(`Fee Demand ${newInvoice.invoiceNo} issued to ${newInvoice.studentName}!`);
    return newInvoice;
  };

  // Super Admin Counter Fee Collection (Cash / POS / Cheque / UPI)
  const collectCounterPayment = async (invoiceNo, paymentData) => {
    const receiptNo = `REC-DPGA-${Math.floor(10000 + Math.random() * 90000)}`;
    const updatedPaymentData = {
      ...paymentData,
      receiptNo,
      publishedToParent: true,
      publishedDate: new Date().toISOString().split('T')[0]
    };
    await payFeeInvoice(invoiceNo, updatedPaymentData);
    showToast(`Counter receipt #${receiptNo} issued for ₹${Number(paymentData.amount).toLocaleString('en-IN')} via ${paymentData.paymentMethod}! Published to Parent App.`);
    return receiptNo;
  };

  // Grievance / Complaint Box Actions
  const fileComplaint = async (complaintData) => {
    const newComplaint = {
      ...complaintData,
      id: `CMP-${Date.now()}`,
      ticketNo: `TKT-GRV-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split('T')[0],
      status: 'Open',
      assignedOfficer: complaintData.assignedOfficer || 'Principal & Grievance Cell',
      adminRemarks: 'Ticket logged in central registry. Under initial administrative triage.',
      resolutionDate: null
    };

    const updated = await DataService.saveComplaint(newComplaint, complaints);
    setComplaints(updated);
    showToast(`Grievance #${newComplaint.ticketNo} registered. Tracking ID dispatched!`);
    return newComplaint;
  };

  const resolveComplaint = async (complaintId, resolutionDetails) => {
    const complaint = complaints.find(c => c.id === complaintId);
    if (!complaint) return;

    const updatedComplaint = {
      ...complaint,
      ...resolutionDetails,
      resolutionDate: resolutionDetails.status === 'Resolved' ? new Date().toISOString().split('T')[0] : complaint.resolutionDate
    };

    const updated = await DataService.saveComplaint(updatedComplaint, complaints);
    setComplaints(updated);
    showToast(`Grievance #${complaint.ticketNo} marked as [${resolutionDetails.status.toUpperCase()}]!`);
  };

  // Library Circulation Desk (Whom to Give & Whom to Receive)
  const issueBookToStudent = async (bookId, studentId, loanDays = 14) => {
    const book = library.find(b => b.id === bookId);
    const student = students.find(s => s.id === studentId);
    if (!book || !student) return;

    if (book.availableCopies <= 0) {
      showToast('All copies of this book are currently on loan!', 'warning');
      return;
    }

    const dueDateObj = new Date();
    dueDateObj.setDate(dueDateObj.getDate() + Number(loanDays));
    const dueDate = dueDateObj.toISOString().split('T')[0];

    const newLoan = {
      loanId: `LN-${Date.now().toString().slice(-6)}`,
      bookId: book.id,
      bookTitle: book.title,
      isbn: book.isbn,
      studentId: student.id,
      studentName: student.name,
      className: student.className,
      rollNo: student.rollNo,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate,
      status: 'Active',
      fineAmount: 0
    };

    const updatedLoans = [newLoan, ...libraryLoans];
    await DataService.saveLibraryLoans(updatedLoans);
    setLibraryLoans(updatedLoans);

    // Decrement available copies
    const updatedBook = { ...book, availableCopies: book.availableCopies - 1 };
    const updatedLibrary = await DataService.updateBook(updatedBook, library);
    setLibrary(updatedLibrary);

    showToast(`"${book.title}" issued to ${student.name} (${student.className})! Due: ${dueDate}`);
  };

  const returnBookFromStudent = async (loanId, fineCollected = 0, remarks = 'Returned in good condition') => {
    const loan = libraryLoans.find(l => l.loanId === loanId);
    if (!loan) return;

    const updatedLoans = libraryLoans.filter(l => l.loanId !== loanId);
    await DataService.saveLibraryLoans(updatedLoans);
    setLibraryLoans(updatedLoans);

    // Increment available copies
    const book = library.find(b => b.id === loan.bookId);
    if (book) {
      const updatedBook = { ...book, availableCopies: book.availableCopies + 1 };
      const updatedLibrary = await DataService.updateBook(updatedBook, library);
      setLibrary(updatedLibrary);
    }

    // Prepend to library history
    const historyEntry = {
      ...loan,
      returnDate: new Date().toISOString().split('T')[0],
      status: 'Returned On Time',
      finePaid: fineCollected,
      librarianRemarks: remarks,
      clearanceSlipNo: `RET-${Date.now().toString().slice(-6)}`
    };
    const updatedHistory = [historyEntry, ...libraryHistory];
    await DataService.saveLibraryHistory(updatedHistory);
    setLibraryHistory(updatedHistory);

    showToast(`Book "${loan.bookTitle}" returned by ${loan.studentName}! Clearance Ref: ${historyEntry.clearanceSlipNo}`);
  };

  // Teacher Subject Marks Entry Action
  const updateStudentMarks = async (examId, subject, marksEntryList) => {
    const exam = exams.find(e => e.id === examId);
    if (!exam) return;

    // Recalculate each student's score for the subject
    const updatedRecords = exam.records.map(record => {
      const entry = marksEntryList.find(m => m.studentId === record.studentId);
      if (!entry) return record;

      const marks = Number(entry.marks) || 0;
      const grade = marks >= 95 ? 'A+' : marks >= 85 ? 'A' : marks >= 75 ? 'B+' : marks >= 65 ? 'B' : marks >= 50 ? 'C' : 'F';

      const scores = record.scores.some(s => s.subject === subject)
        ? record.scores.map(s => s.subject === subject ? { ...s, marks, grade } : s)
        : [...record.scores, { subject, marks, maxMarks: 100, grade }];

      const totalMarks = scores.reduce((sum, s) => sum + s.marks, 0);
      const maxTotal = scores.length * 100;
      const percentage = parseFloat(((totalMarks / (maxTotal || 1)) * 100).toFixed(1));
      const gpa = parseFloat(Math.min(10.0, (percentage / 10)).toFixed(2));

      return {
        ...record,
        scores,
        totalMarks,
        maxTotal,
        percentage,
        gpa
      };
    });

    // Re-rank students based on percentage descending
    updatedRecords.sort((a, b) => b.percentage - a.percentage);
    updatedRecords.forEach((rec, idx) => {
      rec.classRank = idx + 1;
    });

    const updatedExam = {
      ...exam,
      records: updatedRecords,
      status: 'Grading Completed'
    };

    const updated = await DataService.saveExam(updatedExam, exams);
    setExams(updated);
    showToast(`Marks for ${subject} submitted successfully! Toppers & rankings recomputed.`);
  };

  // Admin Result Publication Scheduler Action
  const scheduleExamResult = async (examId, config) => {
    const exam = exams.find(e => e.id === examId);
    if (!exam) return;

    const updatedExam = {
      ...exam,
      publishStatus: config.publishStatus,
      scheduledPublishTime: config.scheduledPublishTime
    };

    const updated = await DataService.saveExam(updatedExam, exams);
    setExams(updated);
    showToast(
      config.publishStatus === 'published' 
        ? 'Result published live! Unlocked for all students and parents.' 
        : `Result scheduled for release at ${config.scheduledPublishTime}. Grades embargoed.`
    );
  };



  const markAttendance = async (date, classId, records, silent = false) => {
    const updated = await DataService.saveAttendance(date, classId, records, attendance);
    setAttendance(updated);
    if (!silent) {
      showToast(`Attendance recorded for ${classId.toUpperCase()} on ${date}!`);
    }
  };

  const payFeeInvoice = async (invoiceNo, paymentDetails) => {
    const updated = await DataService.recordFeePayment(invoiceNo, paymentDetails, fees);
    setFees(updated);
    showToast(`Payment of ₹${Number(paymentDetails.amount).toLocaleString('en-IN')} processed successfully!`);
  };

  const postNotice = async (noticeData) => {
    const newNotice = {
      ...noticeData,
      id: `not-${Date.now()}`,
      date: new Date().toISOString().split('T')[0]
    };
    const updated = await DataService.saveNotice(newNotice, notices);
    setNotices(updated);
    showToast('New circular announcement broadcasted to campus!');
  };

  const toggleBookIssue = async (bookId, isIssuing) => {
    const book = library.find(b => b.id === bookId);
    if (!book) return;
    if (isIssuing && book.availableCopies <= 0) {
      showToast('No copies available for issue', 'warning');
      return;
    }
    const updatedBook = {
      ...book,
      availableCopies: isIssuing ? book.availableCopies - 1 : book.availableCopies + 1
    };
    const updated = await DataService.updateBook(updatedBook, library);
    setLibrary(updated);
    showToast(isIssuing ? `Book "${book.title}" issued!` : `Book "${book.title}" returned!`);
  };

  const createAssignment = async (assignmentData) => {
    const newAsg = {
      id: `asg-${Date.now()}`,
      ...assignmentData,
      submissions: assignmentData.submissions || {}
    };
    const updated = [newAsg, ...assignments];
    setAssignments(updated);
    await DataService.saveAssignments(updated);
    showToast(`Published: "${newAsg.title}" for ${newAsg.className}`, 'success');
    return newAsg;
  };

  const submitStudentQuiz = async (assignmentId, studentId, studentAnswers, calculatedScore, totalMarks) => {
    const target = assignments.find(a => a.id === assignmentId);
    if (!target) return;
    const student = students.find(s => s.id === studentId);
    const updatedSubmissions = {
      ...(target.submissions || {}),
      [studentId]: {
        studentId,
        studentName: student ? student.name : 'Student',
        rollNo: student ? student.rollNo : '1001',
        className: target.className,
        hasGivenTest: true,
        checkedByTeacher: false, // Remains hidden from student until checked by teacher!
        testStatus: 'Submitted',
        status: 'Submitted',
        score: null, // Hidden from student until teacher checks
        rawCalculatedScore: calculatedScore,
        totalMarks: totalMarks || target.totalMarks,
        submittedDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        studentAnswers,
        teacherRemarks: 'Submitted by student. Awaiting teacher evaluation and checking.',
        reviewedByTeacher: false
      }
    };
    const updated = assignments.map(a => a.id === assignmentId ? { ...a, submissions: updatedSubmissions } : a);
    setAssignments(updated);
    await DataService.saveAssignments(updated);
    showToast('Test submitted! Status: Under Teacher Checking. Result will unlock after teacher evaluation.', 'info');
  };

  const checkStudentTest = async (assignmentId, studentId, verifiedScore, remarks) => {
    const target = assignments.find(a => a.id === assignmentId);
    if (!target) return;
    const student = students.find(s => s.id === studentId);
    const prevSub = (target.submissions && target.submissions[studentId]) || {};
    const updatedSubmissions = {
      ...(target.submissions || {}),
      [studentId]: {
        ...prevSub,
        studentId,
        studentName: student ? student.name : prevSub.studentName || 'Student',
        rollNo: student ? student.rollNo : prevSub.rollNo || '1001',
        className: target.className,
        hasGivenTest: true,
        checkedByTeacher: true, // Checked! Now score and remarks unlocked for student & parent
        testStatus: 'Checked',
        status: 'Completed',
        score: verifiedScore !== undefined && verifiedScore !== null ? Number(verifiedScore) : (prevSub.rawCalculatedScore ?? target.totalMarks),
        totalMarks: target.totalMarks,
        checkedAt: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        teacherRemarks: remarks || 'Checked by teacher. Verified and approved.',
        reviewedByTeacher: true
      }
    };
    const updated = assignments.map(a => a.id === assignmentId ? { ...a, submissions: updatedSubmissions } : a);
    setAssignments(updated);
    await DataService.saveAssignments(updated);
    showToast(`Test checked for ${student?.name || 'student'}! Result released to student & parent.`, 'success');
  };

  const markAssignmentStatus = async (assignmentId, studentId, status, score, remarks) => {
    const target = assignments.find(a => a.id === assignmentId);
    if (!target) return;
    const student = students.find(s => s.id === studentId);
    const prevSub = (target.submissions && target.submissions[studentId]) || {};
    const isCompleted = status === 'Completed';
    const updatedSubmissions = {
      ...(target.submissions || {}),
      [studentId]: {
        ...prevSub,
        studentId,
        studentName: student ? student.name : prevSub.studentName || 'Student',
        rollNo: student ? student.rollNo : prevSub.rollNo || '1001',
        className: target.className,
        status, // 'Completed' or 'Incomplete'
        hasGivenTest: isCompleted || prevSub.hasGivenTest || false,
        checkedByTeacher: isCompleted,
        testStatus: isCompleted ? 'Checked' : (prevSub.hasGivenTest ? 'Submitted' : 'Not Attempted'),
        score: score !== undefined && score !== null ? Number(score) : prevSub.score,
        totalMarks: target.totalMarks,
        submittedDate: isCompleted ? (prevSub.submittedDate || new Date().toISOString().split('T')[0]) : prevSub.submittedDate,
        teacherRemarks: remarks || (status === 'Incomplete' ? '⚠️ Homework marked incomplete by teacher. Please submit revised work.' : 'Submission verified and approved.'),
        reviewedByTeacher: true
      }
    };
    const updated = assignments.map(a => a.id === assignmentId ? { ...a, submissions: updatedSubmissions } : a);
    setAssignments(updated);
    await DataService.saveAssignments(updated);
    showToast(`Updated ${student?.name || 'student'}'s status to ${status}`, 'success');
  };

  const resetToFactorySeed = () => {
    DataService.seedDefaults();
    window.location.reload();
  };

  const activeStudent = students.find(s => s.id === activeStudentId) || students[0];
  const activeTeacher = staff.find(s => s.id === activeTeacherId) || staff[0];

  return (
    <ERPContext.Provider
      value={{
        theme,
        toggleTheme,
        currentRole,
        setCurrentRole,
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        toast,
        showToast,
        loading,
        schoolInfo,
        students,
        classes,
        staff,
        timetable,
        exams,
        fees,
        notices,
        library,
        transport,
        users,
        payroll,
        attendance,
        complaints,
        libraryLoans,
        libraryHistory,
        assignments,
        activeStudent,
        activeStudentId,
        setActiveStudentId,
        activeTeacher,
        activeTeacherId,
        setActiveTeacherId,
        addStudent,
        createUser,
        updatePayrollRecord,
        disburseSalary,
        createInvoice,
        collectCounterPayment,
        fileComplaint,
        resolveComplaint,
        issueBookToStudent,
        returnBookFromStudent,
        updateStudentMarks,
        scheduleExamResult,
        markAttendance,
        payFeeInvoice,
        postNotice,
        toggleBookIssue,
        createAssignment,
        submitStudentQuiz,
        checkStudentTest,
        markAssignmentStatus,
        resetToFactorySeed,
        isFirebaseConnected
      }}


    >
      {children}
    </ERPContext.Provider>
  );
}

export function useERP() {
  const context = useContext(ERPContext);
  if (!context) throw new Error('useERP must be used within an ERPProvider');
  return context;
}
