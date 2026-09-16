import { db, isFirebaseConnected } from './config';
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { 
  initialSchoolInfo, 
  initialStudents, 
  initialClasses, 
  initialStaff, 
  initialTimetable, 
  initialExams, 
  initialFees, 
  initialNotices, 
  initialLibrary, 
  initialTransport,
  initialUsers,
  initialPayroll,
  initialComplaints,
  initialLibraryLoans,
  initialLibraryHistory,
  initialAssignments
} from '../data/mockSeedData';


// Local storage keys for resilient offline-first caching
const STORAGE_PREFIX = 'campusflow_';

function getLocalData(key, fallback) {
  try {
    const saved = localStorage.getItem(STORAGE_PREFIX + key);
    return saved ? JSON.parse(saved) : fallback;
  } catch (e) {
    return fallback;
  }
}

function setLocalData(key, data) {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
  } catch (e) {
    console.warn('Could not cache to local storage', e);
  }
}

export const DataService = {
  // Check connection
  isOnline() {
    return isFirebaseConnected && !!db;
  },

  // Initialize or fetch all school modules
  async getInitialState() {
    return {
      schoolInfo: getLocalData('schoolInfo', initialSchoolInfo),
      students: getLocalData('students', initialStudents),
      classes: getLocalData('classes', initialClasses),
      staff: (() => {
        const raw = getLocalData('staff', initialStaff);
        if (!Array.isArray(raw) || raw.length < initialStaff.length) {
          setLocalData('staff', initialStaff);
          return initialStaff;
        }
        return raw;
      })(),
      timetable: getLocalData('timetable', initialTimetable),
      exams: getLocalData('exams', initialExams),
      fees: getLocalData('fees', initialFees),
      notices: getLocalData('notices', initialNotices),
      library: getLocalData('library', initialLibrary),
      libraryLoans: getLocalData('libraryLoans', initialLibraryLoans),
      libraryHistory: getLocalData('libraryHistory', initialLibraryHistory),
      complaints: getLocalData('complaints', initialComplaints),
      assignments: getLocalData('assignments', initialAssignments),
      transport: getLocalData('transport', initialTransport),
      users: getLocalData('users', initialUsers),
      payroll: (() => {
        const raw = getLocalData('payroll', initialPayroll);
        if (!Array.isArray(raw) || raw.length < initialPayroll.length || !raw[0]?.totalWorkingDays) {
          setLocalData('payroll', initialPayroll);
          return initialPayroll;
        }
        return raw;
      })(),
      attendance: getLocalData('attendance', {
        '2026-03-16_cls-10a': {
          date: '2026-03-16',
          classId: 'cls-10a',
          records: {
            'std-1001': 'Present',
            'std-1002': 'Present',
            'std-1003': 'Late',
            'std-1004': 'Present',
            'std-1005': 'Excused'
          }
        }
      })
    };
  },

  // Save/Create User (RBAC)
  async saveUser(user, allUsers) {
    const updated = [user, ...allUsers.filter(u => u.id !== user.id)];
    setLocalData('users', updated);
    if (this.isOnline()) {
      try {
        await setDoc(doc(db, 'users', user.id), user);
      } catch (e) {
        console.warn('User saved to local cache:', e.message);
      }
    }
    return updated;
  },

  // Process/Update Payroll
  async savePayroll(payrollRecord, allPayroll) {
    const updated = allPayroll.map(p => p.staffId === payrollRecord.staffId ? payrollRecord : p);
    setLocalData('payroll', updated);
    if (this.isOnline()) {
      try {
        await setDoc(doc(db, 'payroll', payrollRecord.staffId), payrollRecord);
      } catch (e) {
        console.warn('Payroll saved to local cache:', e.message);
      }
    }
    return updated;
  },

  // Create Fee Demand / Invoice
  async saveInvoice(invoice, allFees) {
    const updated = [invoice, ...allFees];
    setLocalData('fees', updated);
    if (this.isOnline()) {
      try {
        await setDoc(doc(db, 'fees', invoice.invoiceNo), invoice);
      } catch (e) {
        console.warn('Invoice saved to local cache:', e.message);
      }
    }
    return updated;
  },

  // Save / Update Examination Records and Schedule
  async saveExam(exam, allExams) {
    const updated = allExams.map(e => e.id === exam.id ? exam : e);
    setLocalData('exams', updated);
    if (this.isOnline()) {
      try {
        await setDoc(doc(db, 'exams', exam.id), exam);
      } catch (e) {
        console.warn('Exam saved to local cache:', e.message);
      }
    }
    return updated;
  },



  // Sync / save student
  async saveStudent(student, allStudents) {
    const updated = allStudents.some(s => s.id === student.id)
      ? allStudents.map(s => s.id === student.id ? student : s)
      : [student, ...allStudents];
    
    setLocalData('students', updated);

    if (this.isOnline()) {
      try {
        await setDoc(doc(db, 'students', student.id), student);
        console.log('[Firestore] Student synced:', student.id);
      } catch (err) {
        console.warn('[Firestore] Sync fallback to local cache:', err.message);
      }
    }
    return updated;
  },

  // Mark attendance
  async saveAttendance(date, classId, records, allAttendance) {
    const key = `${date}_${classId}`;
    const newEntry = { date, classId, records, timestamp: new Date().toISOString() };
    const updated = { ...allAttendance, [key]: newEntry };
    
    setLocalData('attendance', updated);

    if (this.isOnline()) {
      try {
        await setDoc(doc(db, 'attendance', key), newEntry);
        console.log('[Firestore] Attendance synced for:', key);
      } catch (err) {
        console.warn('[Firestore] Attendance saved to local state:', err.message);
      }
    }
    return updated;
  },

  // Record fee payment
  async recordFeePayment(invoiceNo, paymentData, allFees) {
    const updated = allFees.map(inv => {
      if (inv.invoiceNo === invoiceNo) {
        const newPaid = inv.paidAmount + paymentData.amount;
        const balance = Math.max(0, inv.totalAmount - newPaid);
        return {
          ...inv,
          paidAmount: newPaid,
          balance: balance,
          status: balance === 0 ? 'Paid' : 'Partial',
          paidDate: new Date().toISOString().split('T')[0],
          paymentMethod: paymentData.paymentMethod,
          transactionId: `TXN-${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString().slice(-4)}`
        };
      }
      return inv;
    });

    setLocalData('fees', updated);

    if (this.isOnline()) {
      try {
        const invoice = updated.find(i => i.invoiceNo === invoiceNo);
        if (invoice) {
          await setDoc(doc(db, 'fees', invoiceNo), invoice);
        }
      } catch (err) {
        console.warn('[Firestore] Fee record saved to local cache:', err.message);
      }
    }
    return updated;
  },

  // Save notice
  async saveNotice(notice, allNotices) {
    const updated = [notice, ...allNotices];
    setLocalData('notices', updated);

    if (this.isOnline()) {
      try {
        await setDoc(doc(db, 'notices', notice.id), notice);
      } catch (err) {
        console.warn('[Firestore] Notice saved to local cache:', err.message);
      }
    }
    return updated;
  },

  // Update book availability
  async updateBook(book, allBooks) {
    const updated = allBooks.map(b => b.id === book.id ? book : b);
    setLocalData('library', updated);
    return updated;
  },

  // Save/Update Library Loans
  async saveLibraryLoans(loans) {
    setLocalData('libraryLoans', loans);
    return loans;
  },

  // Save/Update Complaint
  async saveComplaint(complaint, allComplaints) {
    const exists = allComplaints.some(c => c.id === complaint.id);
    const updated = exists
      ? allComplaints.map(c => c.id === complaint.id ? complaint : c)
      : [complaint, ...allComplaints];
    setLocalData('complaints', updated);

    if (this.isOnline()) {
      try {
        await setDoc(doc(db, 'complaints', complaint.id), complaint);
      } catch (err) {
        console.warn('[Firestore] Complaint saved to local cache:', err.message);
      }
    }
    return updated;
  },

  // Save/Update Library History
  async saveLibraryHistory(history) {
    setLocalData('libraryHistory', history);
    return history;
  },

  // Save/Update Assignments
  async saveAssignments(assignments) {
    setLocalData('assignments', assignments);
    return assignments;
  },

  // Seed sample database
  seedDefaults() {
    setLocalData('schoolInfo', initialSchoolInfo);
    setLocalData('students', initialStudents);
    setLocalData('classes', initialClasses);
    setLocalData('staff', initialStaff);
    setLocalData('timetable', initialTimetable);
    setLocalData('exams', initialExams);
    setLocalData('fees', initialFees);
    setLocalData('notices', initialNotices);
    setLocalData('library', initialLibrary);
    setLocalData('libraryLoans', initialLibraryLoans);
    setLocalData('libraryHistory', initialLibraryHistory);
    setLocalData('complaints', initialComplaints);
    setLocalData('assignments', initialAssignments);
    setLocalData('transport', initialTransport);
    setLocalData('users', initialUsers);
    setLocalData('payroll', initialPayroll);
  }
};
