# CampusFlow — Next-Gen School ERP & Academic Intelligence

CampusFlow is an enterprise-grade School Enterprise Resource Planning (ERP) platform built with React, Vite, and Cloud Firestore. Designed specifically for CBSE/ICSE curriculum institutions, it features role-based access control (RBAC), fee counters, automated report card merit boards, teacher grading consoles, biometric staff payroll with official pay slips, and student/parent portals.

---

## 🌟 Key Features

### 1. Multi-Role Institutional Portals
- **Super Administrator**: Executive KPI analytics, CBSE enrollment metrics, financial collections, audit logs, and user RBAC management.
- **Faculty / Teacher**: Coursework & MCQ quiz assignments, question-by-question grading desk, 8-Pending student review queue, and attendance tracking.
- **Student Portal**: Interactive MCQ examination platform, issued library book tracker, homework submissions, and automated merit board report cards.
- **Parent Supervision Desk**: Real-time child academic dossier, pending task alerts, exam report cards with PDF download, and online fee payment.
- **Accountant**: Fee counter cash billing, 80G tax receipts, defaulter tracking, and staff payroll ledger with attendance auditing & certified pay slips.
- **Librarian**: Book circulation desk, barcode issue/return counter, overdue fines calculation, and student reading logs.

### 2. Staff Payroll & Biometric Attendance
- Full staff roster across teaching and non-teaching departments.
- Biometric attendance reconciliation (Total Working Days, Days Worked, Paid Leaves, Loss of Pay Days, Effective Attendance %).
- Real-world 7th Pay Commission Salary Stack: Basic Pay, DA, HRA, Transport Allowance, Medical Allowance, Special Allowance.
- Statutory Deductions: EPF (12%), Professional Tax (PT), TDS u/s 192, and automated LOP (Loss of Pay) deductions.
- Certified printable salary pay slips with institutional letterhead, Indian Rupee words conversion, and dual authorized signatures.

### 3. Academics & Formative Assessments
- Interactive MCQ quiz engine with auto-evaluation and teacher sign-off.
- Dedicated **Pending Student List** queue for teacher marking and instant grade release.
- Solution inspector for parents and students with concept references.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/)

### Installation
```bash
# Clone the repository
git clone https://github.com/AaradhyaproK/school-erp.git

# Navigate to project directory
cd school-erp

# Install dependencies
npm install

# Start local development server
npm run dev
```

### Production Build
```bash
npm run build
```

---

## 🛠️ Tech Stack
- **Frontend**: React 18, Vite
- **Styling**: Vanilla CSS (Tailored Design System, Day Mode, Glassmorphism)
- **Icons**: Lucide React
- **Cloud Backend & Cache**: Google Cloud Firestore with local offline-first fallback
- **Printing**: High-resolution print stylesheets for Fee Receipts, Report Cards, and Salary Pay Slips

---

## 📄 License
MIT License
