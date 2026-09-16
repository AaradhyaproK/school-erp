import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Helper SVG icons (Clean, professional, zero emojis)
const ICONS = {
  school: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  check: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  shield: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  book: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6 6h10"/><path d="M6 10h10"/></svg>`,
  wallet: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/></svg>`,
  users: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  calendar: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>`,
  award: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>`,
  bus: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.6-.3-1.1-.8-1.4L19 11V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v5l-1.2 1.6c-.5.3-.8.8-.8 1.4 0 .4.1.8.2 1.2.3 1.1.8 2.8.8 2.8h3"/><circle cx="7" cy="18" r="2"/><circle cx="15" cy="18" r="2"/></svg>`,
  mail: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>`,
  globe: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>`,
  fileText: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>`,
  zap: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  sparkle: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>`
};

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>CampusFlow — Complete School ERP & Management System Proposal</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');

    @page {
      size: A4 portrait;
      margin: 10mm 12mm 12mm 12mm;
    }

    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      margin: 0;
      padding: 0;
      font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      color: #1e293b;
      background: #ffffff;
      font-size: 9.3pt;
      line-height: 1.5;
    }

    /* Page container */
    .page {
      page-break-after: always;
      break-after: page;
      height: 272mm;
      max-height: 272mm;
      box-sizing: border-box;
      position: relative;
      overflow: hidden;
    }

    .page:last-child {
      page-break-after: auto;
      break-after: auto;
    }

    /* Fresh Day Mode Cover Page */
    .cover-page {
      height: 270mm;
      max-height: 270mm;
      background: linear-gradient(180deg, #ffffff 0%, #f8fafc 60%, #f1f5f9 100%);
      padding: 8mm 10mm 10mm 10mm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      border: 1.5px solid #cbd5e1;
      border-radius: 12px;
      position: relative;
      box-sizing: border-box;
    }

    .cover-top-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      color: #1d4ed8;
      padding: 5px 12px;
      border-radius: 999px;
      font-size: 8pt;
      font-weight: 700;
      letter-spacing: 0.3px;
      text-transform: uppercase;
    }

    .snab-top-brand {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;
      padding-bottom: 14px;
      border-bottom: 1px solid #e2e8f0;
    }

    .brand-logo-wrap {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .brand-square {
      width: 40px;
      height: 40px;
      background: #2563eb;
      color: #ffffff;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 16pt;
    }

    .brand-name-group h2 {
      margin: 0;
      font-size: 16pt;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.5px;
    }

    .brand-name-group p {
      margin: 0;
      font-size: 8pt;
      color: #64748b;
      font-weight: 600;
    }

    .snab-partner-pill {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 8pt;
      font-weight: 700;
      color: #334155;
      text-align: right;
    }

    .snab-partner-pill span {
      color: #2563eb;
      font-weight: 800;
    }

    .cover-main-title {
      font-size: 27pt;
      font-weight: 800;
      line-height: 1.2;
      color: #0f172a;
      letter-spacing: -0.5px;
      margin: 16px 0 10px 0;
    }

    .cover-main-title span {
      color: #2563eb;
    }

    .cover-lead-desc {
      font-size: 11pt;
      color: #475569;
      line-height: 1.6;
      max-width: 620px;
      margin-bottom: 22px;
    }

    /* Key Benefits Grid on Cover */
    .cover-highlights-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin: 18px 0;
    }

    .highlight-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 12px 14px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.02);
    }

    .highlight-card-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 9.5pt;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 4px;
    }

    .highlight-card p {
      font-size: 8.5pt;
      color: #64748b;
      margin: 0;
      line-height: 1.45;
    }

    .icon-box-blue { color: #2563eb; }
    .icon-box-green { color: #059669; }
    .icon-box-purple { color: #7c3aed; }
    .icon-box-amber { color: #d97706; }

    /* Cover Meta Box */
    .cover-meta-box {
      background: #ffffff;
      border: 1.5px solid #cbd5e1;
      border-radius: 10px;
      padding: 14px 18px;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-top: 15px;
    }

    .cover-meta-item small {
      display: block;
      font-size: 7.5pt;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #64748b;
      font-weight: 700;
      margin-bottom: 2px;
    }

    .cover-meta-item strong {
      display: block;
      font-size: 9pt;
      color: #0f172a;
      font-weight: 700;
    }

    .cover-meta-item span.link-text {
      color: #2563eb;
      font-weight: 700;
    }

    /* Running Header & Footer */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 8px;
      border-bottom: 1.5px solid #e2e8f0;
      margin-bottom: 14px;
      font-size: 7.5pt;
      color: #64748b;
      font-weight: 600;
    }

    .page-header .brand-tag {
      color: #2563eb;
      font-weight: 800;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .page-footer {
      position: absolute;
      bottom: 1mm;
      left: 0;
      right: 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 8px;
      border-top: 1px solid #e2e8f0;
      font-size: 7.5pt;
      color: #64748b;
    }

    .page-footer a {
      color: #2563eb;
      text-decoration: none;
      font-weight: 700;
    }

    /* Headings & Text */
    h1 {
      font-size: 16pt;
      font-weight: 800;
      margin: 0 0 8px 0;
      color: #0f172a;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    h1 .section-tag {
      background: #eff6ff;
      color: #2563eb;
      font-size: 9pt;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 6px;
      border: 1px solid #bfdbfe;
    }

    h2 {
      font-size: 11.5pt;
      font-weight: 700;
      margin: 12px 0 6px 0;
      color: #0f172a;
    }

    p {
      margin: 0 0 8px 0;
      color: #334155;
      line-height: 1.5;
    }

    .subhead-text {
      font-size: 9.5pt;
      color: #475569;
      margin-bottom: 12px;
      line-height: 1.55;
    }

    /* Clean Card Layouts */
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin: 10px 0;
    }

    .grid-3 {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin: 10px 0;
    }

    .grid-4 {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      margin: 10px 0;
    }

    .card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px 12px;
    }

    .card-title {
      font-size: 9pt;
      font-weight: 700;
      color: #0f172a;
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 4px;
    }

    .card p {
      font-size: 8.3pt;
      color: #475569;
      margin: 0;
      line-height: 1.45;
    }

    /* Crisp Tables */
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0;
      font-size: 8.5pt;
    }

    table.data-table th {
      background: #f8fafc;
      color: #0f172a;
      font-weight: 700;
      text-align: left;
      padding: 7px 9px;
      border-bottom: 2px solid #cbd5e1;
      border-top: 1px solid #e2e8f0;
      font-size: 8pt;
    }

    table.data-table td {
      padding: 7px 9px;
      border-bottom: 1px solid #e2e8f0;
      color: #334155;
      vertical-align: top;
    }

    table.data-table tr:nth-child(even) td {
      background: #fafafa;
    }

    /* Lists */
    ul.check-list {
      list-style: none;
      padding: 0;
      margin: 4px 0 0 0;
    }

    ul.check-list li {
      position: relative;
      padding-left: 18px;
      margin-bottom: 4px;
      font-size: 8.4pt;
      color: #334155;
    }

    ul.check-list li .icon-check {
      position: absolute;
      left: 0;
      top: 2px;
    }

    /* Badges */
    .badge {
      display: inline-block;
      padding: 2px 7px;
      border-radius: 6px;
      font-size: 7.5pt;
      font-weight: 700;
      white-space: nowrap;
    }

    .badge-blue { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }
    .badge-green { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }
    .badge-amber { background: #fffbeb; color: #b45309; border: 1px solid #fde68a; }
    .badge-gray { background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; }

    /* Highlights */
    .callout {
      background: #f8fafc;
      border-left: 3.5px solid #2563eb;
      padding: 10px 12px;
      border-radius: 0 8px 8px 0;
      margin: 10px 0;
      font-size: 8.6pt;
    }

    .callout.green {
      border-left-color: #16a34a;
      background: #f0fdf4;
    }

    .callout.amber {
      border-left-color: #d97706;
      background: #fffbeb;
    }

    /* Metric counter row */
    .metric-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin: 10px 0;
    }

    .metric-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px 8px;
      text-align: center;
    }

    .metric-box .number {
      font-size: 16pt;
      font-weight: 800;
      color: #2563eb;
      margin-bottom: 2px;
    }

    .metric-box .label {
      font-size: 7.5pt;
      color: #64748b;
      font-weight: 600;
      text-transform: uppercase;
    }

    /* Sign-off box */
    .signoff-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-top: 14px;
    }

    .signoff-card {
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 12px 14px;
      background: #ffffff;
    }
  </style>
</head>
<body>

  <!-- ========================================================================= -->
  <!-- PAGE 1: FRESH DAY-MODE COVER PAGE                                        -->
  <!-- ========================================================================= -->
  <div class="page">
    <div class="cover-page">
      <div>
        <div class="snab-top-brand">
          <div class="brand-logo-wrap">
            <div class="brand-square">C</div>
            <div class="brand-name-group">
              <h2>CampusFlow</h2>
              <p>Next-Gen School ERP & Academic Intelligence</p>
            </div>
          </div>
          <div class="snab-partner-pill">
            Powered by <span>Snab</span> • <a href="https://snab.co.in" style="color: #2563eb; text-decoration: none;">snab.co.in</a>
          </div>
        </div>

        <div class="cover-top-badge">
          Institutional Product Proposal • Academic Year 2026-2027
        </div>

        <div class="cover-main-title">
          Complete School ERP &<br>
          <span>Academic Management</span> System
        </div>

        <div class="cover-lead-desc">
          A modern, easy-to-use software platform built specifically for Indian schools and colleges. Manage fee counters with instant 80G receipts, run automated biometric staff payroll, track student attendance, formulate quizzes with AI, and give parents a transparent window into their child's progress.
        </div>

        <div class="cover-highlights-grid">
          <div class="highlight-card">
            <div class="highlight-card-header">
              <span class="icon-box-blue">${ICONS.wallet}</span>
              <span>Fee Counter & 80G Receipts</span>
            </div>
            <p>Fast fee billing for cash, UPI, or cheques. Generates official tax-deductible receipts with total amount in Indian Rupee words.</p>
          </div>

          <div class="highlight-card">
            <div class="highlight-card-header">
              <span class="icon-box-green">${ICONS.shield}</span>
              <span>Online Proctored Exam Portal</span>
            </div>
            <p>Anti-cheating exam engine with fullscreen lock and automated tab-switch warnings to ensure fair testing for all students.</p>
          </div>

          <div class="highlight-card">
            <div class="highlight-card-header">
              <span class="icon-box-purple">${ICONS.sparkle}</span>
              <span>AI Quiz & Question Generator</span>
            </div>
            <p>Teachers can upload lesson notes or PDFs to create syllabus-aligned MCQs, assertion-reason, and numerical questions in seconds.</p>
          </div>

          <div class="highlight-card">
            <div class="highlight-card-header">
              <span class="icon-box-amber">${ICONS.award}</span>
              <span>7th Pay Commission Payroll</span>
            </div>
            <p>Calculates teacher and staff salaries automatically using biometric attendance, EPF 12%, Professional Tax, and generates pay slips.</p>
          </div>
        </div>
      </div>

      <div class="cover-meta-box">
        <div class="cover-meta-item">
          <small>Technology Provider</small>
          <strong>Snab Solutions</strong>
          <span class="link-text">snab.co.in</span>
        </div>
        <div class="cover-meta-item">
          <small>Official Contact Email</small>
          <strong>hello@snab.co.in</strong>
          <span style="font-size: 8pt; color: #64748b;">Direct Business Line</span>
        </div>
        <div class="cover-meta-item">
          <small>Document Purpose</small>
          <strong>Complete Product Proposal</strong>
          <span style="font-size: 8pt; color: #16a34a; font-weight: 700;">Ready for Demonstration</span>
        </div>
      </div>
    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- PAGE 2: EXECUTIVE SUMMARY & WHAT THE SCHOOL GETS                          -->
  <!-- ========================================================================= -->
  <div class="page">
    <div class="page-header">
      <span class="brand-tag">${ICONS.school} CampusFlow ERP • Proposal</span>
      <span>Powered by Snab (snab.co.in)</span>
    </div>

    <h1><span class="section-tag">Section 1</span> Executive Summary & Key Results</h1>

    <p class="subhead-text">
      Running a school involves handling hundreds of daily tasks: tracking fee dues, paying teachers on time, organizing exams, keeping buses on schedule, and answering parent queries. CampusFlow brings all of this under one simple login.
    </p>

    <div class="metric-row">
      <div class="metric-box">
        <div class="number">100%</div>
        <div class="label">Digital Fee Receipts</div>
      </div>
      <div class="metric-box">
        <div class="number">0</div>
        <div class="label">Salary Calculation Errors</div>
      </div>
      <div class="metric-box">
        <div class="number">3 Sec</div>
        <div class="label">AI Quiz Generation</div>
      </div>
      <div class="metric-box">
        <div class="number">1 Click</div>
        <div class="label">Report Card Printing</div>
      </div>
    </div>

    <h2>Why Schools Choose CampusFlow</h2>

    <div class="grid-3">
      <div class="card">
        <div class="card-title"><span class="icon-box-blue">${ICONS.check}</span> No Software Installation</div>
        <p>Works directly inside Google Chrome, Microsoft Edge, or Safari on any computer, laptop, tablet, or phone without needing expensive servers.</p>
      </div>
      <div class="card">
        <div class="card-title"><span class="icon-box-green">${ICONS.check}</span> CBSE & ICSE Aligned</div>
        <p>Pre-configured with standard grading scales (A1 to E), scholastic and co-scholastic marksheets, and official board formats.</p>
      </div>
      <div class="card">
        <div class="card-title"><span class="icon-box-purple">${ICONS.check}</span> Complete Parent Trust</div>
        <p>Parents can see daily attendance, download fee receipts, review homework, and inspect exam scores right from their phones.</p>
      </div>
    </div>

    <h2>Core System Architecture</h2>
    <table class="data-table">
      <thead>
        <tr>
          <th style="width: 25%;">Component</th>
          <th style="width: 45%;">What It Does For Your School</th>
          <th style="width: 30%;">Benefit</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Fee Counter & Accounts</strong></td>
          <td>Collects school fees, creates installment plans, tracks defaulters, and prints 80G tax-exempt receipts.</td>
          <td><span class="badge badge-green">Stops revenue leakage</span></td>
        </tr>
        <tr>
          <td><strong>Academic & Quiz Engine</strong></td>
          <td>Allows teachers to set homework, create MCQs with AI, and review student answers question-by-question.</td>
          <td><span class="badge badge-blue">Saves 10+ hours per week</span></td>
        </tr>
        <tr>
          <td><strong>Anti-Cheat Exam Portal</strong></td>
          <td>Runs online tests in fullscreen mode and auto-submits tests if a student switches tabs more than 3 times.</td>
          <td><span class="badge badge-amber">Protects test honesty</span></td>
        </tr>
        <tr>
          <td><strong>Staff Payroll & Biometrics</strong></td>
          <td>Calculates monthly salary based on biometric attendance, deducting leaves, EPF, and professional tax.</td>
          <td><span class="badge badge-blue">100% legal compliance</span></td>
        </tr>
        <tr>
          <td><strong>Student & Parent Portals</strong></td>
          <td>Students take quizzes and view library books; parents view marks, attendance, and pay pending fees.</td>
          <td><span class="badge badge-green">Fewer front-desk inquiries</span></td>
        </tr>
      </tbody>
    </table>

    <div class="callout green">
      <strong>Simple For Teachers To Use:</strong> Even teachers with basic computer skills can start taking attendance, creating AI quizzes, and grading students within 30 minutes of training.
    </div>

    <div class="page-footer">
      <span>CampusFlow School ERP • Powered by <strong>Snab</strong> (snab.co.in)</span>
      <span>Page 2 of 6 • Contact: <a href="mailto:hello@snab.co.in">hello@snab.co.in</a></span>
    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- PAGE 3: THE 7 USER ROLES & PORTALS                                       -->
  <!-- ========================================================================= -->
  <div class="page">
    <div class="page-header">
      <span class="brand-tag">${ICONS.school} CampusFlow ERP • Proposal</span>
      <span>Powered by Snab (snab.co.in)</span>
    </div>

    <h1><span class="section-tag">Section 2</span> 7 Dedicated Portals for Every Role</h1>

    <p class="subhead-text">
      CampusFlow gives each staff member, student, and parent their own clean, distraction-free portal with clear permissions so sensitive data stays safe:
    </p>

    <div class="grid-2" style="gap: 8px; margin: 8px 0;">
      <div class="card" style="border-left: 3.5px solid #2563eb; padding: 7px 10px;">
        <div class="card-title" style="margin-bottom: 2px;"><span class="icon-box-blue">${ICONS.school}</span> Principal & Administrator</div>
        <p style="font-size: 8pt; margin-bottom: 4px;">Complete school operations in one dashboard:</p>
        <ul class="check-list">
          <li><span class="icon-check">${ICONS.check}</span> Daily fee collection totals and pending dues tracking</li>
          <li><span class="icon-check">${ICONS.check}</span> Student and staff daily attendance percentages</li>
          <li><span class="icon-check">${ICONS.check}</span> Broadcast school-wide circulars and emergency alerts</li>
        </ul>
      </div>

      <div class="card" style="border-left: 3.5px solid #059669; padding: 7px 10px;">
        <div class="card-title" style="margin-bottom: 2px;"><span class="icon-box-green">${ICONS.book}</span> Teacher & Faculty Desk</div>
        <p style="font-size: 8pt; margin-bottom: 4px;">Designed to eliminate teacher paperwork:</p>
        <ul class="check-list">
          <li><span class="icon-check">${ICONS.check}</span> One-click daily class attendance marking</li>
          <li><span class="icon-check">${ICONS.check}</span> Create quizzes using Gemini AI from lesson notes or PDFs</li>
          <li><span class="icon-check">${ICONS.check}</span> Fast grading queue and report card marks entry</li>
        </ul>
      </div>

      <div class="card" style="border-left: 3.5px solid #7c3aed; padding: 7px 10px;">
        <div class="card-title" style="margin-bottom: 2px;"><span class="icon-box-purple">${ICONS.users}</span> Student Learning Desk</div>
        <p style="font-size: 8pt; margin-bottom: 4px;">Clean, focused learning tools for students:</p>
        <ul class="check-list">
          <li><span class="icon-check">${ICONS.check}</span> Online quizzes with proctoring and instant scoring</li>
          <li><span class="icon-check">${ICONS.check}</span> Step-by-step explanations to learn from mistakes</li>
          <li><span class="icon-check">${ICONS.check}</span> Class timetable, homework tasks, and issued library books</li>
        </ul>
      </div>

      <div class="card" style="border-left: 3.5px solid #d97706; padding: 7px 10px;">
        <div class="card-title" style="margin-bottom: 2px;"><span class="icon-box-amber">${ICONS.shield}</span> Parent Supervision Window</div>
        <p style="font-size: 8pt; margin-bottom: 4px;">Builds trust between school and families:</p>
        <ul class="check-list">
          <li><span class="icon-check">${ICONS.check}</span> Real-time absence alert if child misses morning roll call</li>
          <li><span class="icon-check">${ICONS.check}</span> Upcoming homework, exam dates, and teacher remarks</li>
          <li><span class="icon-check">${ICONS.check}</span> Printable 80G fee receipts and online fee payment</li>
        </ul>
      </div>

      <div class="card" style="border-left: 3.5px solid #0284c7; padding: 7px 10px;">
        <div class="card-title" style="margin-bottom: 2px;"><span class="icon-box-blue">${ICONS.wallet}</span> Accountant & Fee Cashier</div>
        <p style="font-size: 8pt; margin-bottom: 4px;">Fast counter billing with zero calculation errors:</p>
        <ul class="check-list">
          <li><span class="icon-check">${ICONS.check}</span> Instant billing for Cash, UPI, Cheques, and Cards</li>
          <li><span class="icon-check">${ICONS.check}</span> Automated late fine calculation and installment ledger</li>
          <li><span class="icon-check">${ICONS.check}</span> Class-wise fee defaulter reports with SMS alerts</li>
        </ul>
      </div>

      <div class="card" style="border-left: 3.5px solid #475569; padding: 7px 10px;">
        <div class="card-title" style="margin-bottom: 2px;"><span class="icon-box-purple">${ICONS.bus}</span> Librarian & Transport Desk</div>
        <p style="font-size: 8pt; margin-bottom: 4px;">Organizes campus books and bus fleet:</p>
        <ul class="check-list">
          <li><span class="icon-check">${ICONS.check}</span> Barcode book checkout, return, and overdue fine recovery</li>
          <li><span class="icon-check">${ICONS.check}</span> Bus routes, pickup stops, driver verification, and bus passes</li>
          <li><span class="icon-check">${ICONS.check}</span> Complete library catalog search by title, author, or subject</li>
        </ul>
      </div>
    </div>

    <div class="callout amber" style="margin: 8px 0; padding: 8px 12px; font-size: 8.4pt;">
      <strong>Data Privacy & Security:</strong> Students cannot view answer keys before submission, parents only see their own children's records, and teachers only access their assigned classes.
    </div>

    <div class="page-footer">
      <span>CampusFlow School ERP • Powered by <strong>Snab</strong> (snab.co.in)</span>
      <span>Page 3 of 6 • Contact: <a href="mailto:hello@snab.co.in">hello@snab.co.in</a></span>
    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- PAGE 4: AI QUIZ CREATOR & ANTI-CHEAT EXAMS                               -->
  <!-- ========================================================================= -->
  <div class="page">
    <div class="page-header">
      <span class="brand-tag">${ICONS.school} CampusFlow ERP • Proposal</span>
      <span>Powered by Snab (snab.co.in)</span>
    </div>

    <h1><span class="section-tag">Section 3</span> AI Quiz Creator & Anti-Cheat Exam Portal</h1>

    <p class="subhead-text">
      CampusFlow takes the stress out of making test papers and conducting online exams. Teachers save hours of typing, and schools get an honest assessment environment.
    </p>

    <div class="grid-2">
      <div class="card">
        <div class="card-title"><span class="icon-box-purple">${ICONS.sparkle}</span> Gemini AI Question Generator</div>
        <p style="margin-bottom: 8px;">Teachers no longer need to spend hours searching the internet for questions:</p>
        <ul class="check-list">
          <li><span class="icon-check">${ICONS.check}</span> <strong>Upload Notes or Chapter PDFs:</strong> The AI reads the teacher's lesson notes or PDF pages and asks questions strictly from that text.</li>
          <li><span class="icon-check">${ICONS.check}</span> <strong>CBSE Standard Question Types:</strong> Choose from standard MCQs, Assertion & Reason, and Numerical Word Problems.</li>
          <li><span class="icon-check">${ICONS.check}</span> <strong>Difficulty Adjustment:</strong> Pick Easy, Medium, Hard, or Competitive level based on the class standard.</li>
          <li><span class="icon-check">${ICONS.check}</span> <strong>Clear Explanations:</strong> Every question comes with a step-by-step reason explaining why the answer is correct.</li>
          <li><span class="icon-check">${ICONS.check}</span> <strong>One-Click Add:</strong> Review the questions, change marks or options if desired, and publish to students in 1 click.</li>
        </ul>
      </div>

      <div class="card">
        <div class="card-title"><span class="icon-box-blue">${ICONS.shield}</span> Anti-Cheating Exam Room</div>
        <p style="margin-bottom: 8px;">Ensures students do not browse other tabs or consult answers online during tests:</p>
        <ul class="check-list">
          <li><span class="icon-check">${ICONS.check}</span> <strong>Mandatory Fullscreen:</strong> Test runs full screen so students cannot open side windows or chat apps.</li>
          <li><span class="icon-check">${ICONS.check}</span> <strong>Tab-Switch Warning System:</strong> If a student opens another browser tab or minimizes the screen, a loud visual warning stops the test immediately.</li>
          <li><span class="icon-check">${ICONS.check}</span> <strong>3-Strike Rule:</strong> After 3 warnings, the exam locks automatically and submits with a "Tab Switch Disqualification" alert.</li>
          <li><span class="icon-check">${ICONS.check}</span> <strong>Clear Question Palette:</strong> Green for answered, red for skipped, purple for marked for review.</li>
          <li><span class="icon-check">${ICONS.check}</span> <strong>Detailed Teacher Audit:</strong> Teachers can see exactly how many times a student switched tabs before grading.</li>
        </ul>
      </div>
    </div>

    <h2>How the Examination Cycle Works</h2>
    <table class="data-table">
      <thead>
        <tr>
          <th>Step</th>
          <th>What Happens</th>
          <th>Who Does It</th>
          <th>Time Taken</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>1. Create Quiz</strong></td>
          <td>Teacher enters topic or uploads chapter notes; AI drafts 5 to 20 MCQs with answers.</td>
          <td>Subject Teacher</td>
          <td>Under 1 minute</td>
        </tr>
        <tr>
          <td><strong>2. Student Takes Exam</strong></td>
          <td>Student opens portal in fullscreen, answers questions with countdown timer running.</td>
          <td>Student</td>
          <td>Scheduled exam slot</td>
        </tr>
        <tr>
          <td><strong>3. Instant Evaluation</strong></td>
          <td>Software scores objective questions automatically and flags any proctoring violations.</td>
          <td>Automated System</td>
          <td>Instant (0 seconds)</td>
        </tr>
        <tr>
          <td><strong>4. Teacher Verification</strong></td>
          <td>Teacher reviews student answers in the "Pending Review Queue" and adds feedback.</td>
          <td>Teacher</td>
          <td>2 minutes per class</td>
        </tr>
        <tr>
          <td><strong>5. Parent Result View</strong></td>
          <td>Results and explanations become visible on the parent portal; marks update in report card.</td>
          <td>Parent / Student</td>
          <td>Immediately available</td>
        </tr>
      </tbody>
    </table>

    <div class="callout green">
      <strong>Fast & Reliable:</strong> Powered by Google's fast AI models, question creation takes less than 4 seconds and never slows down during exam days.
    </div>

    <div class="page-footer">
      <span>CampusFlow School ERP • Powered by <strong>Snab</strong> (snab.co.in)</span>
      <span>Page 4 of 6 • Contact: <a href="mailto:hello@snab.co.in">hello@snab.co.in</a></span>
    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- PAGE 5: FEE MANAGEMENT, PAYROLL & REPORT CARDS                           -->
  <!-- ========================================================================= -->
  <div class="page">
    <div class="page-header">
      <span class="brand-tag">${ICONS.school} CampusFlow ERP • Proposal</span>
      <span>Powered by Snab (snab.co.in)</span>
    </div>

    <h1><span class="section-tag">Section 4</span> Fees, Staff Payroll & Report Cards</h1>

    <p class="subhead-text">
      CampusFlow handles the most critical financial and academic paperwork for your school with 100% legal accuracy:
    </p>

    <div class="grid-2">
      <div>
        <h2>Smart Fee Counter & 80G Receipts</h2>
        <p>Make fee collection fast and avoid cashier mistakes:</p>
        <ul class="check-list">
          <li><span class="icon-check">${ICONS.check}</span> <strong>Multiple Fee Heads:</strong> Tuition Fee, Computer Lab, Science Lab, Annual Sports, Library, and Transport charges.</li>
          <li><span class="icon-check">${ICONS.check}</span> <strong>Official 80G Tax Receipts:</strong> Prints branded receipts with school logo, receipt number, parent name, and the exact amount spelled out in Indian Rupee words (e.g., <em>Rupees Fourteen Thousand Five Hundred Only</em>).</li>
          <li><span class="icon-check">${ICONS.check}</span> <strong>Defaulter Tracking:</strong> One click shows all students with overdue fees; filter by class or section to follow up with parents.</li>
          <li><span class="icon-check">${ICONS.check}</span> <strong>Flexible Installments:</strong> Set up quarterly, monthly, or one-time annual payment options.</li>
        </ul>
      </div>

      <div>
        <h2>7th CPC Staff Payroll & Salary Slips</h2>
        <p>Pay your teachers and staff accurately without Excel headaches:</p>
        <ul class="check-list">
          <li><span class="icon-check">${ICONS.check}</span> <strong>Biometric Attendance Linked:</strong> Calculates pay according to days worked, approved casual leaves, and Loss of Pay (LOP) for unexcused absences.</li>
          <li><span class="icon-check">${ICONS.check}</span> <strong>Full Salary Structure:</strong> Basic Pay, Dearness Allowance (DA), HRA, Transport Allowance, and Medical Allowance.</li>
          <li><span class="icon-check">${ICONS.check}</span> <strong>Statutory Deductions:</strong> Automatically calculates EPF (12%), Professional Tax (PT), and TDS Section 192 deductions.</li>
          <li><span class="icon-check">${ICONS.check}</span> <strong>Certified Pay Slips:</strong> Generates official printable salary slips with bank account details, PF numbers, and authorized signature lines.</li>
        </ul>
      </div>
    </div>

    <h2>Printable Documents Generated by CampusFlow</h2>
    <table class="data-table">
      <thead>
        <tr>
          <th>Document</th>
          <th>Format</th>
          <th>Features</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>CBSE Report Card</strong></td>
          <td>A4 Printable PDF</td>
          <td>Term marks, grades, attendance percentage, class rank, teacher remarks, and school crest.</td>
        </tr>
        <tr>
          <td><strong>Fee Receipt & Tax Slip</strong></td>
          <td>Printable Slip</td>
          <td>Itemized fee heads, payment mode (Cash/UPI/Cheque), transaction ID, and Rupee words.</td>
        </tr>
        <tr>
          <td><strong>Staff Salary Pay Slip</strong></td>
          <td>Bank-Format Slip</td>
          <td>Working days, LOP deductions, earnings stack, PF/PT deductions, and net payable.</td>
        </tr>
        <tr>
          <td><strong>Student Bus Pass</strong></td>
          <td>Identity Card Format</td>
          <td>Student photo, route number, pickup stop, parent contact number, and validity dates.</td>
        </tr>
      </tbody>
    </table>

    <div class="callout green">
      <strong>Zero Human Calculation Errors:</strong> All totals, taxes, deductions, and word conversions are calculated automatically, protecting your school during annual financial audits.
    </div>

    <div class="page-footer">
      <span>CampusFlow School ERP • Powered by <strong>Snab</strong> (snab.co.in)</span>
      <span>Page 5 of 6 • Contact: <a href="mailto:hello@snab.co.in">hello@snab.co.in</a></span>
    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- PAGE 6: ONBOARDING, PRICING & SIGN-OFF                                   -->
  <!-- ========================================================================= -->
  <div class="page">
    <div class="page-header">
      <span class="brand-tag">${ICONS.school} CampusFlow ERP • Proposal</span>
      <span>Powered by Snab (snab.co.in)</span>
    </div>

    <h1><span class="section-tag">Section 5</span> 4-Week Setup Plan & Commercial Sign-Off</h1>

    <p class="subhead-text">
      We make switching to CampusFlow smooth and easy. Our team assists with data import, staff training, and live support so your academic year continues without interruption.
    </p>

    <div class="grid-4">
      <div class="card" style="border-top: 3px solid #2563eb;">
        <div class="card-title">Week 1</div>
        <p style="font-size: 8pt;"><strong>Data Import:</strong> We import your existing student lists, staff records, and fee structures from Excel or existing software.</p>
      </div>
      <div class="card" style="border-top: 3px solid #059669;">
        <div class="card-title">Week 2</div>
        <p style="font-size: 8pt;"><strong>School Setup:</strong> Configure your fee heads, class divisions, timetable schedules, and grading scales.</p>
      </div>
      <div class="card" style="border-top: 3px solid #d97706;">
        <div class="card-title">Week 3</div>
        <p style="font-size: 8pt;"><strong>Staff Training:</strong> Hands-on training sessions for teachers, accountants, and office staff. Simple step-by-step guides provided.</p>
      </div>
      <div class="card" style="border-top: 3px solid #7c3aed;">
        <div class="card-title">Week 4</div>
        <p style="font-size: 8pt;"><strong>Campus Launch:</strong> Go live across all departments. Dedicated Snab support team on standby for any questions.</p>
      </div>
    </div>

    <h2>Everything Included in Your Institutional License</h2>
    <table class="data-table">
      <thead>
        <tr>
          <th>Feature / Service</th>
          <th>What is Included</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>All 14 School Modules</strong></td>
          <td>Fees, Admissions, AI Quizzes, Proctoring, Payroll, Library, Transport, Attendance & Notices.</td>
          <td><span class="badge badge-green">Included</span></td>
        </tr>
        <tr>
          <td><strong>User Accounts</strong></td>
          <td>Unlimited Students, Unlimited Teachers, Office Staff, Administrators, and Parents.</td>
          <td><span class="badge badge-green">Unlimited</span></td>
        </tr>
        <tr>
          <td><strong>AI Quiz Generation</strong></td>
          <td>Full access to Google Gemini AI question builder with lesson notes and PDF extraction.</td>
          <td><span class="badge badge-green">Included</span></td>
        </tr>
        <tr>
          <td><strong>Cloud Hosting & Daily Backups</strong></td>
          <td>Fast cloud hosting with automatic daily backups so school data is never lost.</td>
          <td><span class="badge badge-green">Included</span></td>
        </tr>
        <tr>
          <td><strong>Customer Support & Training</strong></td>
          <td>Phone, WhatsApp, and email support with dedicated account manager from Snab.</td>
          <td><span class="badge badge-blue">Priority</span></td>
        </tr>
      </tbody>
    </table>

    <div class="signoff-grid">
      <div class="signoff-card">
        <h4 style="margin: 0 0 2px 0; font-size: 8.8pt; color: #0f172a;">Prepared & Presented By</h4>
        <p style="font-size: 8pt; color: #64748b; margin-bottom: 22px;">Snab Solutions • <a href="https://snab.co.in" style="color: #2563eb; text-decoration: none;">snab.co.in</a></p>
        <div style="border-top: 1px dashed #cbd5e1; padding-top: 6px; font-size: 8pt; color: #475569;">
          <strong>Authorized Signatory:</strong> Snab Enterprise Team<br>
          <strong>Email:</strong> hello@snab.co.in
        </div>
      </div>

      <div class="signoff-card">
        <h4 style="margin: 0 0 2px 0; font-size: 8.8pt; color: #0f172a;">Accepted on Behalf of School</h4>
        <p style="font-size: 8pt; color: #64748b; margin-bottom: 22px;">Principal / Chairman / Authorized School Trustee</p>
        <div style="border-top: 1px dashed #cbd5e1; padding-top: 6px; font-size: 8pt; color: #475569;">
          <strong>Signature & School Seal:</strong> ___________________________<br>
          <strong>Date:</strong> ___________________________
        </div>
      </div>
    </div>

    <div class="callout green" style="margin-top: 10px;">
      <strong>Book a Live Demonstration:</strong> Contact our team directly at <strong>hello@snab.co.in</strong> or visit <strong>snab.co.in</strong> to schedule a walk-through for your school management board.
    </div>

    <div class="page-footer">
      <span>CampusFlow School ERP • Powered by <strong>Snab</strong> (snab.co.in)</span>
      <span>Page 6 of 6 • Contact: <a href="mailto:hello@snab.co.in">hello@snab.co.in</a></span>
    </div>
  </div>

</body>
</html>
`;

// Output file paths
const htmlFilePath = path.join(projectRoot, 'scripts', 'proposal_preview.html');
const pdfOutputPath = path.join(projectRoot, 'CampusFlow_Enterprise_School_ERP_Proposal.pdf');
const artifactDir = '/Users/aaradhyapathak/.gemini/antigravity-ide/brain/f55a47ee-d4f9-49fa-97dc-ff61e218acc1';
const artifactPdfPath = path.join(artifactDir, 'CampusFlow_Enterprise_School_ERP_Proposal.pdf');

console.log('1. Writing fresh day-mode proposal HTML document...');
fs.writeFileSync(htmlFilePath, htmlContent, 'utf8');
console.log('   Saved HTML template to:', htmlFilePath);

console.log('2. Rendering high-definition vector PDF using Headless Chrome...');
const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const cmd = `"${chromePath}" --headless --disable-gpu --no-pdf-header-footer --print-to-pdf="${pdfOutputPath}" "file://${htmlFilePath}"`;
execSync(cmd, { stdio: 'inherit' });

console.log('3. PDF successfully compiled to:', pdfOutputPath);

// Copy to artifact directory for easy download & IDE linking
if (fs.existsSync(artifactDir)) {
  fs.copyFileSync(pdfOutputPath, artifactPdfPath);
  console.log('4. Copied PDF to IDE artifacts directory:', artifactPdfPath);
}

const stats = fs.statSync(pdfOutputPath);
console.log('Finished! Proposal PDF Size: ' + (stats.size / 1024).toFixed(1) + ' KB');
