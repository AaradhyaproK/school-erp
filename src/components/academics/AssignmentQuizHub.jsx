import React, { useState, useEffect, useMemo } from 'react';
import { useERP } from '../../context/ERPContext';
import DedicatedQuizPortal from './DedicatedQuizPortal';
import { generateQuizQuestionsWithAI } from '../../services/geminiQuizService';
import { extractTextFromFile } from '../../utils/fileTextExtractor';
import { 
  BookOpen, 
  HelpCircle, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Plus, 
  Search, 
  Filter, 
  Award, 
  Eye, 
  Send, 
  FileText, 
  X, 
  Check, 
  Sparkles, 
  AlertTriangle,
  UserCheck,
  ChevronRight,
  BookMarked,
  Printer,
  Calendar,
  Layers,
  CheckSquare,
  Trash2,
  Bot,
  Wand2,
  Loader2,
  UploadCloud,
  FileUp,
  FileType,
  Languages,
  Target,
  GraduationCap,
  FileCheck,
  SlidersHorizontal,
  Paperclip
} from 'lucide-react';

const CBSE_SUBJECT_PRESETS = [
  'Mathematics',
  'Science',
  'Science (Physics)',
  'Science (Chemistry)',
  'Science (Biology)',
  'Computer Science & IT',
  'Social Science (History & Civics)',
  'Social Science (Geography & Economics)',
  'English (Language & Literature)',
  'Hindi (Course A/B)',
  'Economics & Commerce'
];

const CBSE_TOPIC_PRESETS = {
  'Mathematics': [
    'Real Numbers & Polynomials',
    'Quadratic Equations',
    'Arithmetic Progressions',
    'Coordinate Geometry & Lines',
    'Introduction to Trigonometry',
    'Applications of Trigonometry',
    'Circles & Tangents',
    'Surface Areas & Volumes',
    'Statistics & Central Tendency',
    'Probability & Sample Space'
  ],
  'Science': [
    'Chemical Reactions & Equations',
    'Acids, Bases & Salts',
    'Metals & Non-metals',
    'Carbon & its Compounds',
    'Life Processes & Nutrition',
    'Control & Coordination',
    'How do Organisms Reproduce?',
    'Heredity & Evolution',
    'Light: Reflection & Refraction',
    'Electricity & Ohm\'s Law',
    'Magnetic Effects of Current',
    'Our Environment & Ecosystem'
  ],
  'Science (Physics)': [
    'Light: Reflection & Refraction',
    'Human Eye & Colourful World',
    'Electricity & Ohm\'s Law',
    'Heating Effects of Current',
    'Magnetic Effects & Solenoid',
    'Sources of Energy'
  ],
  'Science (Chemistry)': [
    'Chemical Reactions & Types',
    'Acids, Bases & Indicators',
    'Metals & Reactivity Series',
    'Carbon Compounds & Bonding',
    'Periodic Classification Concepts'
  ],
  'Science (Biology)': [
    'Life Processes (Nutrition & Respiration)',
    'Transportation & Excretion in Humans',
    'Control & Nervous Coordination',
    'Reproduction in Flowering Plants',
    'Heredity & Mendelian Genetics',
    'Ecosystem & Food Chains'
  ],
  'Computer Science & IT': [
    'Python Basics & Syntax',
    'Conditional Statements & Loops',
    'Strings, Lists & Dictionaries',
    'Functions & Scope in Python',
    'SQL Queries & SELECT Statements',
    'Relational Database Keys & Tables',
    'Computer Networks & Protocols',
    'Cyber Safety & Digital Ethics'
  ],
  'Social Science (History & Civics)': [
    'The Rise of Nationalism in Europe',
    'Nationalism in India & Movements',
    'Making of a Global World',
    'Power Sharing in Democracy',
    'Federalism in India',
    'Gender, Religion and Caste',
    'Political Parties & Functions'
  ],
  'Social Science (Geography & Economics)': [
    'Resources and Development',
    'Forest and Wildlife Resources',
    'Water Resources & Multipurpose Projects',
    'Agriculture & Major Crops of India',
    'Minerals and Energy Resources',
    'Development & Per Capita Income',
    'Sectors of the Indian Economy',
    'Money and Credit & Banking'
  ],
  'English (Language & Literature)': [
    'Reading Comprehension & Inferences',
    'Tenses & Subject-Verb Agreement',
    'Modals & Determiners',
    'Reported Speech & Dialogue Writing',
    'Poetic Devices & Figures of Speech',
    'Vocabulary, Synonyms & Antonyms'
  ],
  'Hindi (Course A/B)': [
    'संधि और उसके भेद',
    'समास और विग्रह',
    'मुहावरे और लोकोक्तियाँ',
    'वाक्य रूपांतरण (सरल, संयुक्त, मिश्र)',
    'पद परिचय',
    'अपठित गद्यांश व काव्यांश'
  ],
  'Economics & Commerce': [
    'Development Goals & Indicators',
    'Organized vs Unorganized Sectors',
    'Formal & Informal Credit Sources',
    'Globalisation & MNC Operations',
    'Consumer Rights & COPRA'
  ]
};

export default function AssignmentQuizHub() {
  const { 
    currentRole, 
    assignments = [], 
    students = [], 
    classes = [], 
    activeStudent, 
    activeTeacher, 
    createAssignment, 
    submitStudentQuiz, 
    checkStudentTest,
    markAssignmentStatus,
    showToast 
  } = useERP();

  // Active view tabs
  const [activeTab, setActiveTab] = useState(
    currentRole === 'parent' ? 'parent' : currentRole === 'student' ? 'student' : 'teacher'
  );

  // Sync tab with role changes
  useEffect(() => {
    if (currentRole === 'student') {
      setActiveTab('student');
    } else if (currentRole === 'parent') {
      setActiveTab('parent');
    } else if (currentRole === 'teacher') {
      setActiveTab('teacher');
    }
  }, [currentRole]);

  // When logged in as student, strictly force child section ('student')
  const effectiveTab = currentRole === 'student' 
    ? 'student' 
    : currentRole === 'parent' 
      ? 'parent' 
      : activeTab;

  // Filters
  const [selectedClass, setSelectedClass] = useState('Class 10-A');
  const [selectedType, setSelectedType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Assignment for detailed grading / inspection / taking
  const [activeAsgDetail, setActiveAsgDetail] = useState(null);
  
  // MCQ Quiz Taking State for Student
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [takingQuiz, setTakingQuiz] = useState(null);
  const [studentAnswers, setStudentAnswers] = useState({});
  const [quizSubmittedResult, setQuizSubmittedResult] = useState(null);

  // Parent MCQ Inspector State
  const [parentInspectModalOpen, setParentInspectModalOpen] = useState(false);
  const [inspectingQuiz, setInspectingQuiz] = useState(null);

  // Teacher Create Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState('quiz'); // 'quiz' (MCQ) or 'assignment'
  const [newSubject, setNewSubject] = useState('Mathematics');
  const [newClass, setNewClass] = useState('Class 10-A');
  const [newDueDate, setNewDueDate] = useState('2026-03-25');
  const [newTotalMarks, setNewTotalMarks] = useState(20);
  const [newDesc, setNewDesc] = useState('');
  const [newQuestions, setNewQuestions] = useState([
    {
      id: 'q1',
      prompt: '',
      options: ['', '', '', ''],
      correctIndex: 0,
      marks: 5,
      hint: ''
    }
  ]);

  // Gemini AI Question Studio State
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiSubject, setAiSubject] = useState('Science');
  const [aiClass, setAiClass] = useState('Class 10-A');
  const [aiTopic, setAiTopic] = useState('');
  const [aiNumQuestions, setAiNumQuestions] = useState(5);
  const [aiDifficulty, setAiDifficulty] = useState('Medium'); // 'Easy' | 'Medium' | 'Hard' | 'Competitive'
  const [aiQuestionStyle, setAiQuestionStyle] = useState('balanced'); // 'balanced' | 'assertion_reason' | 'numerical' | 'conceptual' | 'case_study'
  const [aiLanguage, setAiLanguage] = useState('English'); // 'English' | 'Hindi' | 'Bilingual'
  const [aiMarkingScheme, setAiMarkingScheme] = useState('+5 / -0'); // '+5 / -0' | '+4 / -1' | '+1 / -0'
  const [aiBloomLevel, setAiBloomLevel] = useState('balanced'); // 'balanced' | 'recall' | 'analytical'
  const [aiUseNotesOnly, setAiUseNotesOnly] = useState(false);
  const [aiNotesText, setAiNotesText] = useState('');
  const [aiUploadedFile, setAiUploadedFile] = useState(null);
  const [aiIsReadingFile, setAiIsReadingFile] = useState(false);
  const [aiShowNotesPreview, setAiShowNotesPreview] = useState(false);
  const [aiIsGenerating, setAiIsGenerating] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [aiGeneratedQuestions, setAiGeneratedQuestions] = useState(null);

  // Grading Drawer State for Teacher
  const [gradingModalOpen, setGradingModalOpen] = useState(false);
  const [gradingAsg, setGradingAsg] = useState(null);
  const [checkingStudent, setCheckingStudent] = useState(null);
  const [verifiedScoreInput, setVerifiedScoreInput] = useState('');
  const [teacherRemarksInput, setTeacherRemarksInput] = useState('');

  // Teacher View Mode: 'all' (Coursework items), 'pending' (Pending Student List), 'completed' (Complete Student List)
  const [teacherViewMode, setTeacherViewMode] = useState('all');
  const [modalRosterFilter, setModalRosterFilter] = useState('all'); // 'all', 'pending', 'completed', 'not_attempted'

  // Aggregated submissions across all coursework items for Teacher Dashboard
  const allTeacherSubmissions = useMemo(() => {
    const list = [];
    assignments.forEach(asg => {
      const subs = asg.submissions || {};
      const classStudents = students.filter(s => !asg.className || s.className === asg.className);
      const targetStudents = classStudents.length > 0 ? classStudents : students;

      targetStudents.forEach(st => {
        const sub = subs[st.id] || {
          hasGivenTest: false,
          checkedByTeacher: false,
          status: 'Incomplete',
          score: null,
          teacherRemarks: 'Awaiting student test submission'
        };

        const hasGiven = Boolean(sub.hasGivenTest || sub.status === 'Submitted' || sub.status === 'Completed');
        const isChecked = Boolean(sub.checkedByTeacher || (sub.status === 'Completed' && sub.score !== null));
        const isPending = hasGiven && !isChecked;

        list.push({
          assignmentId: asg.id,
          assignmentTitle: asg.title,
          assignmentType: asg.type,
          subject: asg.subject,
          className: asg.className,
          dueDate: asg.dueDate,
          totalMarks: asg.totalMarks,
          student: st,
          studentId: st.id,
          studentName: st.name,
          rollNo: st.rollNo,
          studentAvatar: st.avatar,
          submission: sub,
          hasGiven,
          isChecked,
          isPending,
          score: sub.score,
          rawCalculatedScore: sub.rawCalculatedScore !== undefined && sub.rawCalculatedScore !== null 
            ? sub.rawCalculatedScore 
            : (sub.score !== null ? sub.score : Math.round(asg.totalMarks * 0.8)),
          submittedDate: sub.submittedDate || '15-Mar-2026',
          teacherRemarks: sub.teacherRemarks,
          asgObj: asg
        });
      });
    });
    return list;
  }, [assignments, students]);

  const pendingTeacherSubmissions = allTeacherSubmissions.filter(item => item.isPending);
  const completedTeacherSubmissions = allTeacherSubmissions.filter(item => item.isChecked);

  // Filtered assignments
  const filteredAssignments = assignments.filter(asg => {
    const matchesClass = selectedClass === 'all' || asg.className === selectedClass;
    const matchesType = selectedType === 'all' || asg.type === selectedType;
    const matchesSearch = asg.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          asg.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesClass && matchesType && matchesSearch;
  });

  // Target student for Student & Parent views
  const currentStudent = activeStudent || (students && students[0]) || {
    id: 'std-1001',
    name: 'Aarav Sharma',
    rollNo: '1001',
    className: 'Class 10-A',
    percentage: 94.8,
    attendanceRate: 96.5
  };

  // 3-State Task Categorization for Student & Parent visibility:
  // 1) Test Not Given / Pending
  const studentNotGivenTasks = assignments.filter(asg => {
    const sub = asg.submissions && asg.submissions[currentStudent.id];
    return !sub || !sub.hasGivenTest;
  });

  // 2) Test Given by Student, Under Teacher Checking
  const studentUnderCheckingTasks = assignments.filter(asg => {
    const sub = asg.submissions && asg.submissions[currentStudent.id];
    return sub && sub.hasGivenTest && !sub.checkedByTeacher;
  });

  // 3) Test Checked & Graded by Teacher
  const studentCheckedTasks = assignments.filter(asg => {
    const sub = asg.submissions && asg.submissions[currentStudent.id];
    return sub && sub.checkedByTeacher;
  });

  const studentIncompleteTasks = studentNotGivenTasks;

  // Handle MCQ Question Builder in Create Modal
  const addQuestionField = () => {
    setNewQuestions([
      ...newQuestions,
      {
        id: `q${newQuestions.length + 1}`,
        prompt: '',
        options: ['', '', '', ''],
        correctIndex: 0,
        marks: 5,
        hint: ''
      }
    ]);
  };

  const removeQuestionField = (qIdx) => {
    if (newQuestions.length <= 1) return;
    setNewQuestions(newQuestions.filter((_, i) => i !== qIdx));
  };

  const updateQuestion = (qIdx, field, val) => {
    const updated = [...newQuestions];
    updated[qIdx][field] = val;
    setNewQuestions(updated);
  };

  const updateOption = (qIdx, optIdx, val) => {
    const updated = [...newQuestions];
    updated[qIdx].options[optIdx] = val;
    setNewQuestions(updated);
  };

  const loadSampleQuestions = () => {
    setNewTitle('CBSE Science: Chemical Reactions & Equations MCQ Quiz');
    setNewSubject('Science (Chemistry)');
    setNewClass('Class 10-A');
    setNewType('quiz');
    setNewTotalMarks(15);
    setNewDesc('Mandatory formative assessment for Class 10 Board preparation covering balanced chemical equations and oxidation-reduction.');
    setNewQuestions([
      {
        id: 'q1',
        prompt: 'Which of the following is a displacement reaction?',
        options: [
          'Fe + CuSO₄ → FeSO₄ + Cu',
          'CaO + H₂O → Ca(OH)₂',
          '2KClO₃ → 2KCl + 3O₂',
          'NaOH + HCl → NaCl + H₂O'
        ],
        correctIndex: 0,
        marks: 5,
        hint: 'A more reactive metal displaces a less reactive metal from its salt solution.'
      },
      {
        id: 'q2',
        prompt: 'The chemical formula of rust on iron is:',
        options: ['Fe₂O₃·xH₂O', 'FeO', 'Fe₃O₄', 'FeCO₃'],
        correctIndex: 0,
        marks: 5,
        hint: 'Hydrated ferric oxide is formed in presence of oxygen and moisture.'
      },
      {
        id: 'q3',
        prompt: 'Respiration is an example of which type of chemical process?',
        options: ['Exothermic process', 'Endothermic process', 'Decomposition only', 'Photochemical process'],
        correctIndex: 0,
        marks: 5,
        hint: 'Energy is released in the form of ATP during respiration.'
      }
    ]);
  };

  const handleOpenAiStudio = () => {
    setAiSubject(newSubject || 'Science');
    setAiClass(newClass || 'Class 10-A');
    setAiTopic(newTitle || '');
    setAiError(null);
    setAiGeneratedQuestions(null);
    setAiModalOpen(true);
  };

  const handleNotesFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAiIsReadingFile(true);
    setAiError(null);
    try {
      const result = await extractTextFromFile(file);
      if (!result.text || result.text.trim().length === 0) {
        throw new Error('No readable text could be extracted from this file. Please ensure it contains selectable text.');
      }
      setAiUploadedFile(result.fileInfo);
      setAiNotesText(result.text);
      setAiUseNotesOnly(true);
      showToast(`Loaded "${result.fileInfo.name}" (${(result.fileInfo.size / 1024).toFixed(1)} KB${result.fileInfo.pageCount ? `, ${result.fileInfo.pageCount} pages` : ''})!`, 'success');
    } catch (err) {
      console.error('Notes File Extract Error:', err);
      setAiError(err.message || 'Failed to read uploaded file');
      showToast('File read error: ' + err.message, 'error');
    } finally {
      setAiIsReadingFile(false);
      e.target.value = '';
    }
  };

  const handleRemoveUploadedNotes = () => {
    setAiUploadedFile(null);
    setAiNotesText('');
    setAiUseNotesOnly(false);
    showToast('Uploaded notes removed', 'info');
  };

  const handleGenerateAiQuestions = async () => {
    if (!aiTopic.trim() && (!aiUseNotesOnly || !aiNotesText.trim())) {
      showToast('Please specify a Topic or provide/upload Notes for AI question generation.', 'warning');
      return;
    }

    setAiIsGenerating(true);
    setAiError(null);
    setAiGeneratedQuestions(null);

    try {
      const generated = await generateQuizQuestionsWithAI({
        topic: aiTopic.trim(),
        numQuestions: Number(aiNumQuestions) || 5,
        difficulty: aiDifficulty,
        subject: aiSubject || newSubject || 'Science',
        className: aiClass || newClass || 'Class 10',
        notes: aiUseNotesOnly ? aiNotesText : '',
        questionStyle: aiQuestionStyle,
        language: aiLanguage,
        markingScheme: aiMarkingScheme,
        bloomLevel: aiBloomLevel
      });

      setAiGeneratedQuestions(generated);
      showToast(`Gemini AI successfully formulated ${generated.length} questions!`, 'success');
    } catch (err) {
      console.error('AI Question Generation Error:', err);
      setAiError(err.message || 'Failed to generate questions. Please try again.');
      showToast('AI Error: ' + err.message, 'error');
    } finally {
      setAiIsGenerating(false);
    }
  };

  const handleApplyAiQuestions = (mode = 'replace') => {
    if (!aiGeneratedQuestions || aiGeneratedQuestions.length === 0) return;

    const formatted = aiGeneratedQuestions.map((q, idx) => ({
      id: `q_ai_${Date.now()}_${idx}`,
      prompt: q.prompt,
      options: q.options,
      correctIndex: q.correctIndex,
      marks: Number(q.marks) || 5,
      hint: q.explanation || ''
    }));

    if (mode === 'replace') {
      setNewQuestions(formatted);
      const totalM = formatted.reduce((sum, q) => sum + q.marks, 0);
      setNewTotalMarks(totalM);
    } else {
      setNewQuestions(prev => {
        if (prev.length === 1 && !prev[0].prompt) {
          return formatted;
        }
        return [...prev, ...formatted];
      });
      const totalM = formatted.reduce((sum, q) => sum + q.marks, 0);
      setNewTotalMarks(prev => prev + totalM);
    }

    setAiModalOpen(false);
    setAiGeneratedQuestions(null);
    showToast(`Added ${formatted.length} questions to your quiz!`, 'success');
  };

  const handleCreateAssignmentSubmit = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      showToast('Please enter an assignment/quiz title', 'warning');
      return;
    }

    // Auto-seed pending submissions for all students in that class
    const classStudents = students.filter(s => s.className === newClass);
    const initialSubmissions = {};
    classStudents.forEach(st => {
      initialSubmissions[st.id] = {
        studentId: st.id,
        studentName: st.name,
        rollNo: st.rollNo,
        className: newClass,
        status: 'Incomplete',
        score: null,
        totalMarks: Number(newTotalMarks),
        submittedDate: null,
        studentAnswers: {},
        teacherRemarks: '⚠️ Homework Pending: Newly published task awaiting student submission.',
        reviewedByTeacher: true
      };
    });

    createAssignment({
      title: newTitle,
      type: newType,
      subject: newSubject,
      className: newClass,
      teacherId: activeTeacher.id,
      teacherName: activeTeacher.name,
      dueDate: newDueDate,
      totalMarks: Number(newTotalMarks),
      description: newDesc || 'Solve all questions carefully and submit before due date.',
      questions: newType === 'quiz' ? newQuestions : [
        { id: 'q1', prompt: newDesc || 'Answer all chapter revision questions in school notebook.', options: [], correctIndex: null, marks: Number(newTotalMarks) }
      ],
      submissions: initialSubmissions
    });

    setCreateModalOpen(false);
    // Reset form
    setNewTitle('');
    setNewDesc('');
  };

  // Launch MCQ Quiz for Student (Student can only give test)
  const handleStartQuiz = (asg) => {
    setTakingQuiz(asg);
    setStudentAnswers({});
    setQuizSubmittedResult(null);
    setQuizModalOpen(true);
  };

  // Submit Student Quiz (Withholds score & answers until checked by teacher)
  const handleSubmitQuizAnswers = () => {
    if (!takingQuiz) return;
    let score = 0;
    const questions = takingQuiz.questions || [];
    
    questions.forEach((q, idx) => {
      if (studentAnswers[idx] === q.correctIndex) {
        score += (q.marks || 5);
      }
    });

    // submitStudentQuiz sets hasGivenTest: true, checkedByTeacher: false, score: null
    submitStudentQuiz(takingQuiz.id, currentStudent.id, studentAnswers, score, takingQuiz.totalMarks);
    setQuizSubmittedResult({
      submitted: true,
      totalQuestions: questions.length,
      totalMarks: takingQuiz.totalMarks
    });
  };

  // Open Solution Inspector for checked tests
  const handleOpenParentInspect = (asg) => {
    setInspectingQuiz(asg);
    setParentInspectModalOpen(true);
  };

  // Open Teacher Checking Modal for an Assignment (Teacher can only assign & check tests)
  const handleOpenGrading = (asg) => {
    setGradingAsg(asg);
    setCheckingStudent(null);
    setGradingModalOpen(true);
  };

  // Select student to check in teacher evaluation panel
  const handleSelectStudentForCheck = (st, sub, asgOverride) => {
    setCheckingStudent(st);
    const activeAsg = asgOverride || gradingAsg;
    const initialScore = sub?.checkedByTeacher 
      ? sub?.score 
      : (sub?.rawCalculatedScore !== undefined && sub?.rawCalculatedScore !== null ? sub.rawCalculatedScore : activeAsg?.totalMarks);
    setVerifiedScoreInput(initialScore !== undefined && initialScore !== null ? String(initialScore) : String(activeAsg?.totalMarks || 15));
    setTeacherRemarksInput(
      sub?.teacherRemarks && !sub.teacherRemarks.includes('Awaiting teacher')
        ? sub.teacherRemarks 
        : 'Checked by subject teacher. Well attempted with accurate conceptual responses.'
    );
  };

  // Directly open grading modal for a specific student submission (from pending/complete list)
  const handleOpenGradingForStudent = (asg, student, sub) => {
    setGradingAsg(asg);
    setGradingModalOpen(true);
    handleSelectStudentForCheck(student, sub, asg);
  };

  // Teacher marks test as checked & releases result to student and parent
  const handleConfirmTeacherCheck = async () => {
    if (!gradingAsg || !checkingStudent) return;
    await checkStudentTest(
      gradingAsg.id,
      checkingStudent.id,
      verifiedScoreInput !== '' ? Number(verifiedScoreInput) : gradingAsg.totalMarks,
      teacherRemarksInput
    );
    setCheckingStudent(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
            <span className="badge badge-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <BookMarked size={14} />
              <span>CBSE Coursework & Formative Assessments</span>
            </span>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Delhi Public Global Academy • Academic Term 2
            </span>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Assignments, Quizzes & Examinations Hub
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Empowering educators to assign interactive MCQs, track homework completion, and flag pending tasks to parents in real time.
          </p>
        </div>

        {/* Action Button for Teachers / Admins */}
        {(currentRole === 'teacher' || currentRole === 'admin') && (
          <button className="btn btn-primary" onClick={() => setCreateModalOpen(true)}>
            <Plus size={16} />
            <span>Create New Assignment / Quiz</span>
          </button>
        )}
      </div>

      {/* Role View Mode Switcher: Only visible for Admin (Faculty/Teacher goes straight to Teacher Dashboard) */}
      {currentRole === 'admin' && (
        <div style={{ display: 'flex', gap: '0.75rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem', flexWrap: 'wrap' }}>
          <button 
            className={`btn ${effectiveTab === 'teacher' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
            onClick={() => setActiveTab('teacher')}
          >
            <UserCheck size={16} />
            <span>Teacher Grading & Assignment Console</span>
          </button>
          <button 
            className={`btn ${effectiveTab === 'student' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
            onClick={() => setActiveTab('student')}
          >
            <CheckSquare size={16} />
            <span>Student Portal ({currentStudent.name})</span>
          </button>
          <button 
            className={`btn ${effectiveTab === 'parent' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
            onClick={() => setActiveTab('parent')}
          >
            <AlertCircle size={16} />
            <span>Parent Supervision Desk {studentIncompleteTasks.length > 0 && `(${studentIncompleteTasks.length} Pending)`}</span>
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. TEACHER CONSOLE TAB                                                    */}
      {/* ========================================================================= */}
      {effectiveTab === 'teacher' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Top KPI Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div 
              className="glass-panel" 
              style={{ 
                padding: '1.25rem', 
                cursor: 'pointer',
                border: teacherViewMode === 'all' ? '2px solid var(--primary)' : '1px solid var(--border-light)',
                transition: 'all 0.2s'
              }}
              onClick={() => setTeacherViewMode('all')}
            >
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Active Coursework Items</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)', marginTop: '0.3rem' }}>
                {assignments.length}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                {assignments.filter(a => a.type === 'quiz').length} Interactive MCQs • Click to view
              </div>
            </div>

            <div 
              className="glass-panel" 
              style={{ 
                padding: '1.25rem', 
                cursor: 'pointer',
                border: teacherViewMode === 'pending' ? '2px solid var(--warning)' : '1px solid var(--border-light)',
                background: teacherViewMode === 'pending' ? 'rgba(245, 158, 11, 0.05)' : undefined,
                transition: 'all 0.2s'
              }}
              onClick={() => setTeacherViewMode('pending')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Submissions Under Review</div>
                <span className="badge badge-warning" style={{ fontSize: '0.72rem' }}>Needs Check</span>
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--warning)', marginTop: '0.3rem' }}>
                {pendingTeacherSubmissions.length} Pending
              </div>
              <div style={{ fontSize: '0.75rem', color: '#b45309', marginTop: '0.2rem', fontWeight: 600 }}>
                Pending Student List • Click to inspect & grade
              </div>
            </div>

            <div 
              className="glass-panel" 
              style={{ 
                padding: '1.25rem', 
                cursor: 'pointer',
                border: teacherViewMode === 'completed' ? '2px solid var(--success)' : '1px solid var(--border-light)',
                background: teacherViewMode === 'completed' ? 'rgba(16, 185, 129, 0.05)' : undefined,
                transition: 'all 0.2s'
              }}
              onClick={() => setTeacherViewMode('completed')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Complete Submissions</div>
                <span className="badge badge-success" style={{ fontSize: '0.72rem' }}>Evaluated</span>
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--success)', marginTop: '0.3rem' }}>
                {completedTeacherSubmissions.length} Complete
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--success)', marginTop: '0.2rem', fontWeight: 600 }}>
                Complete Student List • Released to parents
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Target Class Enrolled</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--secondary)', marginTop: '0.3rem' }}>
                Class 10-A
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                32 Registered CBSE Candidates
              </div>
            </div>
          </div>

          {/* Sub-Navigation: All Coursework vs 8 Pending vs Complete Student List */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', background: 'var(--bg-surface-elevated)', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
            <button
              className={`btn ${teacherViewMode === 'all' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.85rem', padding: '0.5rem 1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              onClick={() => setTeacherViewMode('all')}
            >
              <BookOpen size={16} />
              <span>All Coursework & Quizzes ({filteredAssignments.length})</span>
            </button>

            <button
              className={`btn ${teacherViewMode === 'pending' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ 
                fontSize: '0.85rem', 
                padding: '0.5rem 1.15rem', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                backgroundColor: teacherViewMode === 'pending' ? '#f59e0b' : undefined,
                borderColor: teacherViewMode === 'pending' ? '#d97706' : undefined,
                color: teacherViewMode === 'pending' ? '#ffffff' : undefined
              }}
              onClick={() => setTeacherViewMode('pending')}
            >
              <Clock size={16} />
              <span>8 Pending (Pending Student List)</span>
              <span style={{ 
                background: teacherViewMode === 'pending' ? 'rgba(0,0,0,0.25)' : 'var(--warning)', 
                color: '#ffffff', 
                padding: '0.1rem 0.5rem', 
                borderRadius: '999px', 
                fontSize: '0.75rem', 
                fontWeight: 700 
              }}>
                {pendingTeacherSubmissions.length}
              </span>
            </button>

            <button
              className={`btn ${teacherViewMode === 'completed' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ 
                fontSize: '0.85rem', 
                padding: '0.5rem 1.15rem', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                backgroundColor: teacherViewMode === 'completed' ? '#10b981' : undefined,
                borderColor: teacherViewMode === 'completed' ? '#059669' : undefined,
                color: teacherViewMode === 'completed' ? '#ffffff' : undefined
              }}
              onClick={() => setTeacherViewMode('completed')}
            >
              <CheckCircle2 size={16} />
              <span>Complete Student List</span>
              <span style={{ 
                background: teacherViewMode === 'completed' ? 'rgba(0,0,0,0.25)' : 'var(--success)', 
                color: '#ffffff', 
                padding: '0.1rem 0.5rem', 
                borderRadius: '999px', 
                fontSize: '0.75rem', 
                fontWeight: 700 
              }}>
                {completedTeacherSubmissions.length}
              </span>
            </button>
          </div>

          {/* VIEW 1: 8 PENDING (PENDING STUDENT LIST) */}
          {teacherViewMode === 'pending' && (
            <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="badge badge-warning" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Clock size={13} />
                      <span>{pendingTeacherSubmissions.length} Pending Student Submissions</span>
                    </span>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Class 10-A • CBSE Academic Term 2</span>
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '0.35rem', color: 'var(--text-primary)' }}>
                    Pending Student Submissions Awaiting Teacher Check
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                    These students have finished taking their MCQ quiz or test. Click <strong>Review & Check Test</strong> to inspect answers, verify marks, sign off, and release scores to parents & students.
                  </p>
                </div>
              </div>

              {pendingTeacherSubmissions.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  <CheckCircle2 size={40} color="var(--success)" style={{ margin: '0 auto 0.75rem' }} />
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>All Caught Up!</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No student submissions are currently pending teacher review.</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-surface-elevated)', borderBottom: '2px solid var(--border-light)' }}>
                        <th style={{ padding: '0.8rem 1rem', textAlign: 'left' }}>Roll No</th>
                        <th style={{ padding: '0.8rem 1rem', textAlign: 'left' }}>Student Name</th>
                        <th style={{ padding: '0.8rem 1rem', textAlign: 'left' }}>Assessment / Test</th>
                        <th style={{ padding: '0.8rem 1rem', textAlign: 'left' }}>Subject</th>
                        <th style={{ padding: '0.8rem 1rem', textAlign: 'left' }}>Submitted Date</th>
                        <th style={{ padding: '0.8rem 1rem', textAlign: 'left' }}>Auto MCQ Score</th>
                        <th style={{ padding: '0.8rem 1rem', textAlign: 'left' }}>Status</th>
                        <th style={{ padding: '0.8rem 1rem', textAlign: 'right' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingTeacherSubmissions.map((item, idx) => (
                        <tr key={`${item.assignmentId}-${item.studentId}-${idx}`} style={{ borderBottom: '1px solid var(--border-light)', transition: 'background 0.15s' }}>
                          <td style={{ padding: '0.8rem 1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {item.rollNo}
                          </td>
                          <td style={{ padding: '0.8rem 1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                              <img 
                                src={item.studentAvatar} 
                                alt={item.studentName} 
                                style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} 
                              />
                              <div>
                                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{item.studentName}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.className}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '0.8rem 1rem' }}>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.assignmentTitle}</div>
                            <span className={`badge ${item.assignmentType === 'quiz' ? 'badge-primary' : 'badge-secondary'}`} style={{ fontSize: '0.7rem', marginTop: '0.2rem' }}>
                              {item.assignmentType === 'quiz' ? 'Interactive MCQ' : 'Assignment'}
                            </span>
                          </td>
                          <td style={{ padding: '0.8rem 1rem', color: 'var(--text-secondary)' }}>
                            {item.subject}
                          </td>
                          <td style={{ padding: '0.8rem 1rem', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              <Clock size={13} color="var(--text-muted)" />
                              <span>{item.submittedDate}</span>
                            </div>
                          </td>
                          <td style={{ padding: '0.8rem 1rem' }}>
                            <div style={{ fontWeight: 700, color: 'var(--primary)' }}>
                              {item.rawCalculatedScore} / {item.totalMarks}
                            </div>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Auto Evaluated</span>
                          </td>
                          <td style={{ padding: '0.8rem 1rem' }}>
                            <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                              <Clock size={12} />
                              <span>8 Pending (Awaiting Check)</span>
                            </span>
                          </td>
                          <td style={{ padding: '0.8rem 1rem', textAlign: 'right' }}>
                            <button
                              className="btn btn-primary"
                              style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                              onClick={() => handleOpenGradingForStudent(item.asgObj, item.student, item.submission)}
                            >
                              <UserCheck size={14} />
                              <span>Review & Check Test</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* VIEW 2: COMPLETE STUDENT LIST */}
          {teacherViewMode === 'completed' && (
            <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <CheckCircle2 size={13} />
                      <span>{completedTeacherSubmissions.length} Complete Submissions</span>
                    </span>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Class 10-A • Verified & Published</span>
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '0.35rem', color: 'var(--text-primary)' }}>
                    Complete Student List (Evaluated & Released)
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                    All student tests that have been checked by the teacher with verified marks and comments released to students and parents.
                  </p>
                </div>
              </div>

              {completedTeacherSubmissions.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  <AlertCircle size={40} color="var(--warning)" style={{ margin: '0 auto 0.75rem' }} />
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>No Completed Submissions Yet</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Switch to the Pending Student List to begin grading student submissions.</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-surface-elevated)', borderBottom: '2px solid var(--border-light)' }}>
                        <th style={{ padding: '0.8rem 1rem', textAlign: 'left' }}>Roll No</th>
                        <th style={{ padding: '0.8rem 1rem', textAlign: 'left' }}>Student Name</th>
                        <th style={{ padding: '0.8rem 1rem', textAlign: 'left' }}>Assessment / Test</th>
                        <th style={{ padding: '0.8rem 1rem', textAlign: 'left' }}>Subject</th>
                        <th style={{ padding: '0.8rem 1rem', textAlign: 'left' }}>Verified Marks</th>
                        <th style={{ padding: '0.8rem 1rem', textAlign: 'left' }}>Teacher Remarks</th>
                        <th style={{ padding: '0.8rem 1rem', textAlign: 'left' }}>Status</th>
                        <th style={{ padding: '0.8rem 1rem', textAlign: 'right' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {completedTeacherSubmissions.map((item, idx) => (
                        <tr key={`${item.assignmentId}-${item.studentId}-${idx}`} style={{ borderBottom: '1px solid var(--border-light)', transition: 'background 0.15s' }}>
                          <td style={{ padding: '0.8rem 1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {item.rollNo}
                          </td>
                          <td style={{ padding: '0.8rem 1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                              <img 
                                src={item.studentAvatar} 
                                alt={item.studentName} 
                                style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} 
                              />
                              <div>
                                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{item.studentName}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.className}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '0.8rem 1rem' }}>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.assignmentTitle}</div>
                            <span className={`badge ${item.assignmentType === 'quiz' ? 'badge-primary' : 'badge-secondary'}`} style={{ fontSize: '0.7rem', marginTop: '0.2rem' }}>
                              {item.assignmentType === 'quiz' ? 'Interactive MCQ' : 'Assignment'}
                            </span>
                          </td>
                          <td style={{ padding: '0.8rem 1rem', color: 'var(--text-secondary)' }}>
                            {item.subject}
                          </td>
                          <td style={{ padding: '0.8rem 1rem' }}>
                            <div style={{ fontWeight: 800, color: 'var(--success)', fontSize: '0.95rem' }}>
                              {item.score} / {item.totalMarks}
                            </div>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                              {Math.round(((item.score || 0) / (item.totalMarks || 1)) * 100)}% Grade
                            </span>
                          </td>
                          <td style={{ padding: '0.8rem 1rem', maxWidth: '280px' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.35 }}>
                              {item.teacherRemarks || 'Checked by subject teacher.'}
                            </div>
                          </td>
                          <td style={{ padding: '0.8rem 1rem' }}>
                            <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                              <CheckCircle2 size={12} />
                              <span>✓ Checked & Released</span>
                            </span>
                          </td>
                          <td style={{ padding: '0.8rem 1rem', textAlign: 'right' }}>
                            <button
                              className="btn btn-secondary"
                              style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                              onClick={() => handleOpenGradingForStudent(item.asgObj, item.student, item.submission)}
                            >
                              <UserCheck size={14} />
                              <span>Re-evaluate</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* VIEW 3: ALL COURSEWORK & QUIZZES */}
          {teacherViewMode === 'all' && (
            <>
              {/* Filter Bar */}
              <div className="glass-panel" style={{ padding: '1rem 1.25rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '220px' }}>
                  <Search size={16} color="var(--text-muted)" />
                  <input 
                    type="text" 
                    placeholder="Search by topic, subject, or chapter..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontSize: '0.85rem' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Class:</span>
                  <select 
                    value={selectedClass} 
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="input-field" 
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.82rem', width: 'auto' }}
                  >
                    <option value="all">All Classes</option>
                    <option value="Class 10-A">Class 10-A</option>
                    <option value="Class 10-B">Class 10-B</option>
                    <option value="Class 12-A">Class 12-A</option>
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Type:</span>
                  <select 
                    value={selectedType} 
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="input-field" 
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.82rem', width: 'auto' }}
                  >
                    <option value="all">All Types</option>
                    <option value="quiz">Interactive MCQ Quizzes</option>
                    <option value="assignment">Homework Assignments</option>
                  </select>
                </div>
              </div>

              {/* Assignments Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
                {filteredAssignments.map((asg) => {
                  const subs = Object.values(asg.submissions || {});
                  const completedCount = subs.filter(s => s.status === 'Completed').length;
                  const incompleteCount = subs.filter(s => s.status === 'Incomplete' || s.status === 'Pending').length;

                  return (
                    <div 
                      key={asg.id} 
                      className="glass-panel" 
                      style={{ 
                        padding: '1.25rem', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        justifyContent: 'space-between',
                        border: '1px solid var(--border-light)'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                          <span className={`badge ${asg.type === 'quiz' ? 'badge-primary' : 'badge-secondary'}`}>
                            {asg.type === 'quiz' ? 'Interactive MCQ Quiz' : 'Homework Assignment'}
                          </span>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Clock size={12} />
                            <span>Due: {asg.dueDate}</span>
                          </span>
                        </div>

                        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.3rem' }}>{asg.title}</h3>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                          <strong>{asg.subject}</strong> • {asg.className} • Max Marks: <strong>{asg.totalMarks}</strong>
                        </div>

                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '1rem' }}>
                          {asg.description}
                        </p>

                        {/* Progress Bar */}
                        <div style={{ marginBottom: '1rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.3rem' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Student Completion</span>
                            <span style={{ fontWeight: 700 }}>
                              {completedCount} Completed / {incompleteCount} Incomplete
                            </span>
                          </div>
                          <div className="progress-bar" style={{ height: '6px' }}>
                            <div 
                              className="progress-fill" 
                              style={{ 
                                width: `${Math.round((completedCount / (subs.length || 1)) * 100)}%`, 
                                background: incompleteCount > 0 ? 'var(--warning)' : 'var(--success)' 
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-light)' }}>
                        <button 
                          className="btn btn-primary" 
                          style={{ flex: 1, padding: '0.45rem', fontSize: '0.82rem' }}
                          onClick={() => handleOpenGrading(asg)}
                        >
                          <UserCheck size={14} />
                          <span>Review & Grade Students</span>
                        </button>
                        {asg.type === 'quiz' && (
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '0.45rem 0.75rem', fontSize: '0.82rem' }}
                            onClick={() => handleOpenParentInspect(asg)}
                            title="Inspect Questions & Answers"
                          >
                            <Eye size={14} />
                            <span>MCQs</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. STUDENT PORTAL TAB                                                     */}
      {/* ========================================================================= */}
      {effectiveTab === 'student' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Welcome Card */}
          <div className="glass-panel" style={{ padding: '1.25rem', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(99, 102, 241, 0.04) 100%)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>
                  Namaste {currentStudent.name}! Here are your coursework tests & assignments.
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  Roll No: <strong>{currentStudent.rollNo}</strong> • Class: <strong>{currentStudent.className}</strong>
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <span className="badge badge-danger" style={{ fontSize: '0.82rem', padding: '0.35rem 0.75rem' }}>
                  {studentNotGivenTasks.length} Tests Not Given
                </span>
                <span className="badge badge-warning" style={{ fontSize: '0.82rem', padding: '0.35rem 0.75rem' }}>
                  {studentUnderCheckingTasks.length} Under Teacher Checking
                </span>
                <span className="badge badge-success" style={{ fontSize: '0.82rem', padding: '0.35rem 0.75rem' }}>
                  {studentCheckedTasks.length} Checked & Graded
                </span>
              </div>
            </div>
          </div>

          {/* Student's Coursework Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
            {assignments.map((asg) => {
              const sub = (asg.submissions && asg.submissions[currentStudent.id]) || {
                hasGivenTest: false,
                checkedByTeacher: false,
                status: 'Incomplete',
                score: null,
                teacherRemarks: 'Awaiting student test submission'
              };

              const hasGiven = Boolean(sub.hasGivenTest || sub.status === 'Submitted' || sub.status === 'Completed');
              const isChecked = Boolean(sub.checkedByTeacher);

              return (
                <div 
                  key={asg.id} 
                  className="glass-panel" 
                  style={{ 
                    padding: '1.25rem', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'space-between',
                    border: isChecked 
                      ? '1px solid rgba(16, 185, 129, 0.35)' 
                      : hasGiven 
                        ? '1px solid rgba(245, 158, 11, 0.4)' 
                        : '1px solid rgba(239, 68, 68, 0.3)',
                    background: isChecked 
                      ? 'var(--bg-surface)' 
                      : hasGiven 
                        ? 'rgba(254, 243, 199, 0.3)' 
                        : 'rgba(254, 242, 242, 0.4)'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <span className={`badge ${asg.type === 'quiz' ? 'badge-primary' : 'badge-secondary'}`}>
                        {asg.type === 'quiz' ? 'Online MCQ Test' : 'Homework Assignment'}
                      </span>
                      
                      {isChecked ? (
                        <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <CheckCircle2 size={12} />
                          <span>Checked & Graded</span>
                        </span>
                      ) : hasGiven ? (
                        <span className="badge badge-warning" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Clock size={12} />
                          <span>Under Teacher Checking</span>
                        </span>
                      ) : (
                        <span className="badge badge-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <AlertTriangle size={12} />
                          <span>Test Not Given</span>
                        </span>
                      )}
                    </div>

                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.3rem' }}>{asg.title}</h3>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.6rem' }}>
                      <strong>{asg.subject}</strong> • Max Marks: <strong>{asg.totalMarks}</strong> • Due: <strong>{asg.dueDate}</strong>
                    </div>

                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '0.75rem' }}>
                      {asg.description}
                    </p>

                    {/* Status & Feedback Card */}
                    <div style={{ 
                      padding: '0.85rem', 
                      borderRadius: 'var(--radius-sm)', 
                      background: isChecked ? 'rgba(16, 185, 129, 0.08)' : hasGiven ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.08)',
                      border: isChecked ? '1px solid rgba(16, 185, 129, 0.25)' : hasGiven ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(239, 68, 68, 0.2)',
                      fontSize: '0.78rem',
                      marginBottom: '1rem'
                    }}>
                      {isChecked ? (
                        <>
                          <div style={{ fontWeight: 700, color: 'var(--success)', marginBottom: '0.2rem' }}>
                            Teacher Evaluation & Remarks:
                          </div>
                          <div style={{ color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                            "{sub.teacherRemarks || 'Checked and verified by subject teacher.'}"
                          </div>
                          <div style={{ fontWeight: 800, color: 'var(--success)', fontSize: '0.88rem' }}>
                            Verified Score: {sub.score} / {asg.totalMarks} ({Math.round((sub.score / asg.totalMarks) * 100)}%)
                          </div>
                          {sub.checkedAt && (
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                              Evaluated on {sub.checkedAt}
                            </div>
                          )}
                        </>
                      ) : hasGiven ? (
                        <>
                          <div style={{ fontWeight: 700, color: '#b45309', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <Clock size={13} />
                            <span>Test Submitted — Under Teacher Checking</span>
                          </div>
                          <div style={{ color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                            You submitted this test on <strong>{sub.submittedDate || 'recently'}</strong>. Your teacher is currently checking your answers. Your marks, percentage, and answer review will be released once checking is finished.
                          </div>
                        </>
                      ) : (
                        <>
                          <div style={{ fontWeight: 700, color: 'var(--danger)', marginBottom: '0.2rem' }}>
                            Pending Action:
                          </div>
                          <div style={{ color: 'var(--text-secondary)' }}>
                            You have not given this test yet. Please complete it before <strong>{asg.dueDate}</strong>.
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div>
                    {/* Student Can ONLY Give Test if not given yet */}
                    {!hasGiven && asg.type === 'quiz' && (
                      <button 
                        className="btn btn-primary" 
                        style={{ width: '100%', padding: '0.55rem', fontSize: '0.85rem' }}
                        onClick={() => handleStartQuiz(asg)}
                      >
                        <Sparkles size={16} />
                        <span>Give Test Now (Online MCQ)</span>
                      </button>
                    )}

                    {!hasGiven && asg.type !== 'quiz' && (
                      <button 
                        className="btn btn-secondary" 
                        style={{ width: '100%', padding: '0.55rem', fontSize: '0.85rem' }}
                        onClick={() => {
                          showToast('Submit written notebook directly to subject teacher for checking', 'info');
                        }}
                      >
                        <Send size={16} />
                        <span>Submit Written Notebook</span>
                      </button>
                    )}

                    {/* If given, but teacher has NOT checked: Student CANNOT see result */}
                    {hasGiven && !isChecked && (
                      <button 
                        className="btn btn-secondary" 
                        disabled
                        style={{ width: '100%', padding: '0.55rem', fontSize: '0.82rem', opacity: 0.8, cursor: 'not-allowed' }}
                      >
                        <Clock size={14} />
                        <span>Awaiting Teacher Evaluation (Results Locked)</span>
                      </button>
                    )}

                    {/* If checked by teacher: Student CAN see result */}
                    {isChecked && asg.type === 'quiz' && (
                      <button 
                        className="btn btn-primary" 
                        style={{ width: '100%', padding: '0.55rem', fontSize: '0.85rem' }}
                        onClick={() => handleOpenParentInspect(asg)}
                      >
                        <Eye size={16} />
                        <span>View Checked Test & Detailed Solutions</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. PARENT SUPERVISION TAB (REAL-TIME TEST GIVING & CHECKING VISIBILITY)    */}
      {/* ========================================================================= */}
      {effectiveTab === 'parent' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Top Parent KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div className="glass-panel" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total Coursework Items</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)', marginTop: '0.3rem' }}>
                {assignments.length}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Assigned to {currentStudent.name}
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.25rem', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--danger)', fontWeight: 600 }}>Tests Not Given Yet</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--danger)', marginTop: '0.3rem' }}>
                {studentNotGivenTasks.length} Pending
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                {studentNotGivenTasks.length > 0 ? 'Action required by guardian' : 'All tests submitted!'}
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.25rem', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.8rem', color: '#b45309', fontWeight: 600 }}>Given & Under Teacher Check</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#b45309', marginTop: '0.3rem' }}>
                {studentUnderCheckingTasks.length} In Review
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Student gave test, teacher evaluating
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.25rem', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: 600 }}>Checked & Graded Tests</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--success)', marginTop: '0.3rem' }}>
                {studentCheckedTasks.length} Evaluated
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Official score & feedback released
              </div>
            </div>
          </div>

          {/* 1. CRITICAL ALERT: TESTS NOT GIVEN BY STUDENT */}
          {studentNotGivenTasks.length > 0 && (
            <div 
              className="glass-panel" 
              style={{ 
                padding: '1.5rem', 
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(245, 158, 11, 0.08) 100%)', 
                border: '2px solid rgba(239, 68, 68, 0.4)',
                borderRadius: 'var(--radius-md)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ 
                  width: '46px', 
                  height: '46px', 
                  borderRadius: '50%', 
                  background: 'rgba(239, 68, 68, 0.15)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: 'var(--danger)'
                }}>
                  <AlertTriangle size={24} />
                </div>
                <div style={{ flex: 1, minWidth: '260px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                    <span className="badge badge-danger">Student Test Notice</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Guardian Notification</span>
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--danger)' }}>
                    {studentNotGivenTasks.length} Test(s) Not Given by {currentStudent.name}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.3rem', lineHeight: 1.5 }}>
                    The school system flags that <strong>{currentStudent.name} has NOT given or submitted</strong> the following tests. Please remind and mentor your child to sit for these assessments before the due date.
                  </p>
                </div>
              </div>

              {/* Unattempted items list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.25rem' }}>
                {studentNotGivenTasks.map(asg => {
                  return (
                    <div 
                      key={asg.id} 
                      style={{ 
                        padding: '1rem', 
                        borderRadius: 'var(--radius-sm)', 
                        background: '#ffffff', 
                        border: '1px solid rgba(239, 68, 68, 0.25)',
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        flexWrap: 'wrap', 
                        gap: '0.75rem' 
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span className="badge badge-danger">Test Not Given</span>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Due Date: {asg.dueDate}</span>
                        </div>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginTop: '0.3rem' }}>{asg.title}</h4>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                          Subject: <strong>{asg.subject}</strong> • Max Marks: <strong>{asg.totalMarks}</strong>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          className="btn btn-primary" 
                          style={{ padding: '0.45rem 0.9rem', fontSize: '0.82rem' }}
                          onClick={() => {
                            showToast(`Reminder alert sent to ${currentStudent.name} to sit for ${asg.title}!`, 'success');
                          }}
                        >
                          <Send size={14} />
                          <span>Send Child Reminder to Give Test</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. NOTICE: TESTS GIVEN BY STUDENT (UNDER TEACHER CHECKING) */}
          {studentUnderCheckingTasks.length > 0 && (
            <div 
              className="glass-panel" 
              style={{ 
                padding: '1.25rem 1.5rem', 
                background: 'rgba(245, 158, 11, 0.08)', 
                border: '1.5px solid rgba(245, 158, 11, 0.35)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                flexWrap: 'wrap'
              }}
            >
              <div style={{ 
                width: '42px', 
                height: '42px', 
                borderRadius: '50%', 
                background: 'rgba(245, 158, 11, 0.2)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: '#b45309'
              }}>
                <Clock size={22} />
              </div>
              <div style={{ flex: 1, minWidth: '240px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="badge badge-warning">Test Given — Under Checking</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Progress Update</span>
                </div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#92400e', marginTop: '0.2rem' }}>
                  {studentUnderCheckingTasks.length} Test(s) Given by {currentStudent.name} (Awaiting Teacher Evaluation)
                </h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  Your child has completed and submitted these tests. The subject teacher is currently reviewing and verifying answers. Official marks will unlock once the teacher completes checking.
                </p>
              </div>
            </div>
          )}

          {/* 3. FULL COURSEWORK & TEST DOSSIER FOR PARENT */}
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem' }}>
              Full Test & Homework Dossier for {currentStudent.name} ({currentStudent.className})
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
              {assignments.map(asg => {
                const sub = (asg.submissions && asg.submissions[currentStudent.id]) || {
                  hasGivenTest: false,
                  checkedByTeacher: false,
                  status: 'Incomplete',
                  score: null
                };
                const hasGiven = Boolean(sub.hasGivenTest || sub.status === 'Submitted' || sub.status === 'Completed');
                const isChecked = Boolean(sub.checkedByTeacher);

                return (
                  <div 
                    key={asg.id} 
                    className="glass-panel" 
                    style={{ 
                      padding: '1.25rem', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      justifyContent: 'space-between',
                      border: isChecked 
                        ? '1px solid rgba(16, 185, 129, 0.3)' 
                        : hasGiven 
                          ? '1px solid rgba(245, 158, 11, 0.35)' 
                          : '1px solid rgba(239, 68, 68, 0.3)',
                      background: isChecked 
                        ? 'var(--bg-surface)' 
                        : hasGiven 
                          ? 'rgba(254, 243, 199, 0.25)' 
                          : 'rgba(254, 242, 242, 0.35)'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                        <span className={`badge ${asg.type === 'quiz' ? 'badge-primary' : 'badge-secondary'}`}>
                          {asg.type === 'quiz' ? 'Online MCQ Test' : 'Homework Assignment'}
                        </span>

                        {isChecked ? (
                          <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <CheckCircle2 size={12} />
                            <span>Checked ({sub.score}/{asg.totalMarks})</span>
                          </span>
                        ) : hasGiven ? (
                          <span className="badge badge-warning" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Clock size={12} />
                            <span>Test Given (Under Check)</span>
                          </span>
                        ) : (
                          <span className="badge badge-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <AlertTriangle size={12} />
                            <span>Test Not Given</span>
                          </span>
                        )}
                      </div>

                      <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{asg.title}</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                        {asg.subject} • Due Date: <strong>{asg.dueDate}</strong>
                      </p>

                      {/* Parent Insight Card */}
                      <div style={{ 
                        fontSize: '0.78rem', 
                        marginTop: '0.75rem', 
                        padding: '0.65rem 0.85rem', 
                        background: isChecked ? 'rgba(16, 185, 129, 0.08)' : hasGiven ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.08)', 
                        borderRadius: 'var(--radius-sm)',
                        border: isChecked ? '1px solid rgba(16, 185, 129, 0.2)' : hasGiven ? '1px solid rgba(245, 158, 11, 0.25)' : '1px solid rgba(239, 68, 68, 0.2)'
                      }}>
                        {isChecked ? (
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--success)' }}>Teacher Evaluation:</div>
                            <div style={{ color: 'var(--text-primary)', marginTop: '0.2rem' }}>"{sub.teacherRemarks}"</div>
                            <div style={{ fontWeight: 800, color: 'var(--success)', marginTop: '0.3rem' }}>
                              Final Verified Score: {sub.score} / {asg.totalMarks} ({Math.round((sub.score / asg.totalMarks) * 100)}%)
                            </div>
                          </div>
                        ) : hasGiven ? (
                          <div>
                            <div style={{ fontWeight: 700, color: '#b45309' }}>Student Completed Test:</div>
                            <div style={{ color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                              {currentStudent.name} gave and submitted this test on <strong>{sub.submittedDate || 'recently'}</strong>. The subject teacher is currently reviewing and checking it.
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--danger)' }}>Status: Test Not Given</div>
                            <div style={{ color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                              {currentStudent.name} has not sat for this test yet. Please ensure completion before deadline.
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                      {isChecked && asg.type === 'quiz' && (
                        <button 
                          className="btn btn-primary" 
                          style={{ width: '100%', fontSize: '0.82rem', padding: '0.45rem' }}
                          onClick={() => handleOpenParentInspect(asg)}
                        >
                          <Eye size={14} />
                          <span>Inspect Checked Test Solutions & Explanations</span>
                        </button>
                      )}

                      {!hasGiven && (
                        <button 
                          className="btn btn-secondary" 
                          style={{ width: '100%', fontSize: '0.82rem', padding: '0.45rem' }}
                          onClick={() => {
                            showToast(`Reminder sent to ${currentStudent.name} for ${asg.title}!`, 'success');
                          }}
                        >
                          <Send size={14} />
                          <span>Send Child Reminder to Give Test</span>
                        </button>
                      )}

                      {hasGiven && !isChecked && (
                        <button 
                          className="btn btn-secondary" 
                          disabled
                          style={{ width: '100%', fontSize: '0.82rem', padding: '0.45rem', opacity: 0.75, cursor: 'not-allowed' }}
                        >
                          <Clock size={14} />
                          <span>Test Given — Teacher Checking in Progress</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. DEDICATED FULL-PAGE PROCTORED EXAM PORTAL                              */}
      {/* ========================================================================= */}
      {quizModalOpen && takingQuiz && (
        <DedicatedQuizPortal
          quiz={takingQuiz}
          student={currentStudent}
          onClose={() => {
            setQuizModalOpen(false);
            setTakingQuiz(null);
            setQuizSubmittedResult(null);
          }}
          onSubmit={(answers, score, proctoringLog) => {
            submitStudentQuiz(takingQuiz.id, currentStudent.id, answers, score, takingQuiz.totalMarks, proctoringLog);
            setQuizSubmittedResult({
              submitted: true,
              totalQuestions: (takingQuiz.questions || []).length,
              totalMarks: takingQuiz.totalMarks,
              proctoringLog
            });
          }}
          submittedResult={quizSubmittedResult}
          onReturnHub={() => {
            setQuizModalOpen(false);
            setQuizSubmittedResult(null);
            setTakingQuiz(null);
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* 5. MODAL: PARENT MCQ INSPECTOR (Allows parent to inspect MCQs & hints)     */}
      {/* ========================================================================= */}
      {parentInspectModalOpen && inspectingQuiz && (
        <div 
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            background: 'rgba(15, 23, 42, 0.7)', 
            backdropFilter: 'blur(6px)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            zIndex: 1000, 
            padding: '1.5rem' 
          }}
        >
          <div 
            className="glass-panel" 
            style={{ 
              width: '100%', 
              maxWidth: '820px', 
              maxHeight: '92vh', 
              overflowY: 'auto', 
              padding: '2rem 2.25rem', 
              background: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid #e2e8f0'
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-light)', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                  <span className="badge badge-primary">Official Checked Test Solutions & Marking Scheme</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{inspectingQuiz.subject}</span>
                </div>
                <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)' }}>{inspectingQuiz.title}</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  Candidate: <strong>{currentStudent.name}</strong> • Class: <strong>{inspectingQuiz.className}</strong> • Total Marks: <strong>{inspectingQuiz.totalMarks}</strong>
                </p>
              </div>
              <button 
                className="btn btn-secondary" 
                style={{ padding: '0.45rem', borderRadius: '50%' }} 
                onClick={() => setParentInspectModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            {/* Teacher Remarks & Score Header */}
            {(() => {
              const inspectSub = (inspectingQuiz.submissions && inspectingQuiz.submissions[currentStudent.id]) || {};
              const isChecked = Boolean(inspectSub.checkedByTeacher);
              const answers = inspectSub.studentAnswers || {};

              return (
                <div>
                  {isChecked && (
                    <div style={{ 
                      padding: '1rem 1.25rem', 
                      borderRadius: 'var(--radius-md)', 
                      background: 'rgba(16, 185, 129, 0.08)', 
                      border: '1.5px solid rgba(16, 185, 129, 0.3)', 
                      marginBottom: '1.5rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '0.75rem'
                    }}>
                      <div>
                        <div style={{ fontWeight: 800, color: 'var(--success)', fontSize: '0.92rem' }}>
                          ✓ Teacher Verified Score & Evaluation
                        </div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                          "{inspectSub.teacherRemarks || 'Checked and verified by subject teacher.'}"
                        </div>
                        {inspectSub.checkedAt && (
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                            Evaluated on: {inspectSub.checkedAt}
                          </div>
                        )}
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Official Score</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--success)' }}>
                          {inspectSub.score} / {inspectingQuiz.totalMarks}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {Math.round((inspectSub.score / inspectingQuiz.totalMarks) * 100)}% Aggregate
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Questions List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {(inspectingQuiz.questions || []).map((q, qIdx) => {
                      const studentPick = answers[qIdx];
                      const isAttempted = studentPick !== undefined && studentPick !== null;
                      const isCorrect = isAttempted && studentPick === q.correctIndex;

                      return (
                        <div 
                          key={q.id || qIdx} 
                          style={{ 
                            padding: '1.25rem', 
                            borderRadius: 'var(--radius-md)', 
                            background: 'var(--bg-surface-elevated)', 
                            border: isCorrect 
                              ? '1.5px solid rgba(16, 185, 129, 0.4)' 
                              : isAttempted 
                                ? '1.5px solid rgba(239, 68, 68, 0.4)' 
                                : '1px solid var(--border-light)' 
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary)' }}>
                              Question {qIdx + 1} ({q.marks || 5} Marks)
                            </span>
                            {isAttempted && (
                              <span className={`badge ${isCorrect ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.72rem' }}>
                                {isCorrect ? `✓ Correct (+${q.marks || 5})` : '✗ Incorrect (0)'}
                              </span>
                            )}
                          </div>

                          <p style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.75rem', lineHeight: 1.4 }}>
                            {q.prompt}
                          </p>

                          {/* Options */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {(q.options || []).map((opt, optIdx) => {
                              const isKey = optIdx === q.correctIndex;
                              const wasPicked = studentPick === optIdx;

                              return (
                                <div 
                                  key={optIdx} 
                                  style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '0.6rem', 
                                    padding: '0.6rem 0.85rem', 
                                    borderRadius: 'var(--radius-sm)', 
                                    background: wasPicked
                                      ? (isKey ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)')
                                      : (isKey ? 'rgba(16, 185, 129, 0.1)' : '#ffffff'), 
                                    border: wasPicked
                                      ? (isKey ? '1.5px solid var(--success)' : '1.5px solid var(--danger)')
                                      : (isKey ? '1.5px solid var(--success)' : '1px solid var(--border-light)') 
                                  }}
                                >
                                  <span style={{ 
                                    width: '20px', 
                                    height: '20px', 
                                    borderRadius: '50%', 
                                    background: isKey ? 'var(--success)' : wasPicked ? 'var(--danger)' : 'var(--bg-surface-elevated)', 
                                    color: (isKey || wasPicked) ? '#ffffff' : 'var(--text-secondary)',
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    fontSize: '0.72rem', 
                                    fontWeight: 700 
                                  }}>
                                    {String.fromCharCode(65 + optIdx)}
                                  </span>
                                  <span style={{ fontSize: '0.85rem', fontWeight: isKey || wasPicked ? 600 : 400, color: 'var(--text-primary)' }}>
                                    {opt}
                                  </span>
                                  
                                  {wasPicked && (
                                    <span className={`badge ${isKey ? 'badge-success' : 'badge-danger'}`} style={{ marginLeft: 'auto', fontSize: '0.7rem' }}>
                                      {isKey ? 'Student Answer (Correct)' : 'Student Answer (Wrong)'}
                                    </span>
                                  )}
                                  {!wasPicked && isKey && (
                                    <span className="badge badge-success" style={{ marginLeft: 'auto', fontSize: '0.7rem' }}>
                                      Correct Key
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {/* Textbook Hint */}
                          {q.hint && (
                            <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)', fontSize: '0.78rem', color: '#92400e' }}>
                              <strong>Textbook Explanation:</strong> {q.hint}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button className="btn btn-secondary" onClick={() => setParentInspectModalOpen(false)}>
                <span>Close Inspector</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. MODAL: TEACHER TEST CHECKING & EVALUATION DESK                         */}
      {/* ========================================================================= */}
      {gradingModalOpen && gradingAsg && (
        <div 
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            background: 'rgba(15, 23, 42, 0.7)', 
            backdropFilter: 'blur(6px)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            zIndex: 1000, 
            padding: '1.5rem' 
          }}
        >
          <div 
            className="glass-panel" 
            style={{ 
              width: '100%', 
              maxWidth: '920px', 
              maxHeight: '92vh', 
              overflowY: 'auto', 
              padding: '2rem 2.25rem', 
              background: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid #e2e8f0'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-light)', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                  <span className="badge badge-primary">Teacher Test Evaluation & Marking Desk</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Class: {gradingAsg.className}</span>
                </div>
                <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)' }}>{gradingAsg.title}</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  Total Questions: <strong>{gradingAsg.questions?.length || 0}</strong> • Total Marks: <strong>{gradingAsg.totalMarks}</strong> • Due Date: <strong>{gradingAsg.dueDate}</strong>
                </p>
              </div>
              <button className="btn btn-secondary" style={{ padding: '0.45rem', borderRadius: '50%' }} onClick={() => setGradingModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            {/* VIEW A: In-depth Student Submission Checking Sheet */}
            {checkingStudent ? (
              <div>
                {/* Back to roster header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-light)' }}>
                  <button 
                    className="btn btn-secondary" 
                    style={{ fontSize: '0.82rem', padding: '0.35rem 0.75rem' }}
                    onClick={() => setCheckingStudent(null)}
                  >
                    <span>← Back to Class Roster</span>
                  </button>
                  <span className="badge badge-warning" style={{ fontSize: '0.8rem' }}>
                    Checking Student: {checkingStudent.name} (Roll: {checkingStudent.rollNo})
                  </span>
                </div>

                {(() => {
                  const studentSub = (gradingAsg.submissions && gradingAsg.submissions[checkingStudent.id]) || {};
                  const answers = studentSub.studentAnswers || {};
                  
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      {/* Submission Summary Banner */}
                      <div style={{ 
                        padding: '1rem 1.25rem', 
                        borderRadius: 'var(--radius-sm)', 
                        background: 'rgba(59, 130, 246, 0.08)', 
                        border: '1px solid rgba(59, 130, 246, 0.2)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '0.75rem'
                      }}>
                        <div>
                          <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary)' }}>
                            Candidate: {checkingStudent.name} (Class {gradingAsg.className})
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                            Submission Registered On: <strong>{studentSub.submittedDate || 'Recent'}</strong>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Raw System Score</div>
                            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary)' }}>
                              {studentSub.rawCalculatedScore !== undefined ? studentSub.rawCalculatedScore : '—'} / {gradingAsg.totalMarks}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Current Status</div>
                            <span className={`badge ${studentSub.checkedByTeacher ? 'badge-success' : 'badge-warning'}`}>
                              {studentSub.checkedByTeacher ? 'Checked & Released' : 'Pending Teacher Signoff'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Question by Question Inspection */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>
                          Student MCQ Responses ({gradingAsg.questions?.length || 0} Questions)
                        </h3>

                        {(gradingAsg.questions || []).map((q, qIdx) => {
                          const studentChoice = answers[qIdx];
                          const isAttempted = studentChoice !== undefined && studentChoice !== null;
                          const isCorrect = isAttempted && studentChoice === q.correctIndex;

                          return (
                            <div 
                              key={q.id || qIdx} 
                              style={{ 
                                padding: '1.15rem', 
                                borderRadius: 'var(--radius-md)', 
                                background: 'var(--bg-surface-elevated)', 
                                border: isCorrect 
                                  ? '1.5px solid rgba(16, 185, 129, 0.4)' 
                                  : isAttempted 
                                    ? '1.5px solid rgba(239, 68, 68, 0.4)' 
                                    : '1px solid var(--border-light)'
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--primary)' }}>
                                  Question {qIdx + 1} ({q.marks || 5} Marks)
                                </span>
                                <span className={`badge ${isCorrect ? 'badge-success' : isAttempted ? 'badge-danger' : 'badge-secondary'}`}>
                                  {isCorrect ? `✓ Correct (+${q.marks || 5})` : isAttempted ? '✗ Incorrect (0)' : 'Unattempted'}
                                </span>
                              </div>

                              <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.75rem', lineHeight: 1.4 }}>
                                {q.prompt}
                              </p>

                              {/* Options */}
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                                {(q.options || []).map((opt, optIdx) => {
                                  const wasChosen = studentChoice === optIdx;
                                  const isKeyAnswer = optIdx === q.correctIndex;

                                  return (
                                    <div 
                                      key={optIdx} 
                                      style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '0.6rem', 
                                        padding: '0.55rem 0.85rem', 
                                        borderRadius: 'var(--radius-sm)', 
                                        background: wasChosen 
                                          ? (isKeyAnswer ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)') 
                                          : (isKeyAnswer ? 'rgba(16, 185, 129, 0.08)' : '#ffffff'),
                                        border: wasChosen 
                                          ? (isKeyAnswer ? '1.5px solid var(--success)' : '1.5px solid var(--danger)') 
                                          : (isKeyAnswer ? '1.5px dashed var(--success)' : '1px solid var(--border-light)')
                                      }}
                                    >
                                      <span style={{ 
                                        width: '20px', 
                                        height: '20px', 
                                        borderRadius: '50%', 
                                        background: wasChosen ? (isKeyAnswer ? 'var(--success)' : 'var(--danger)') : 'var(--bg-surface-elevated)', 
                                        color: wasChosen ? '#ffffff' : 'var(--text-secondary)',
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center', 
                                        fontSize: '0.72rem', 
                                        fontWeight: 700 
                                      }}>
                                        {String.fromCharCode(65 + optIdx)}
                                      </span>
                                      <span style={{ fontSize: '0.85rem', fontWeight: wasChosen || isKeyAnswer ? 600 : 400 }}>
                                        {opt}
                                      </span>
                                      
                                      {wasChosen && (
                                        <span className={`badge ${isKeyAnswer ? 'badge-success' : 'badge-danger'}`} style={{ marginLeft: 'auto', fontSize: '0.7rem' }}>
                                          {isKeyAnswer ? 'Student Answer (Correct)' : 'Student Answer (Wrong)'}
                                        </span>
                                      )}
                                      {!wasChosen && isKeyAnswer && (
                                        <span className="badge badge-success" style={{ marginLeft: 'auto', fontSize: '0.7rem', opacity: 0.8 }}>
                                          Official Correct Key
                                        </span>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>

                              {q.hint && (
                                <div style={{ marginTop: '0.65rem', padding: '0.45rem 0.75rem', borderRadius: 'var(--radius-sm)', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)', fontSize: '0.76rem', color: '#92400e' }}>
                                  <strong>Textbook Concept Reference:</strong> {q.hint}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Teacher Grading & Feedback Action Box */}
                      <div style={{ 
                        padding: '1.25rem', 
                        borderRadius: 'var(--radius-md)', 
                        background: 'var(--bg-surface-elevated)', 
                        border: '2px solid var(--border-light)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <h4 style={{ fontSize: '1rem', fontWeight: 800 }}>Teacher Final Evaluation & Sign-off</h4>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            Releasing this will instantly make marks visible to student & parent.
                          </span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '1.25rem' }}>
                          <div>
                            <label className="input-label">Verified Marks *</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <input 
                                type="number" 
                                min="0" 
                                max={gradingAsg.totalMarks} 
                                value={verifiedScoreInput} 
                                onChange={(e) => setVerifiedScoreInput(e.target.value)}
                                className="form-input" 
                                style={{ fontWeight: 800, fontSize: '1.1rem', textAlign: 'center', color: 'var(--primary)' }}
                              />
                              <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-muted)' }}>
                                / {gradingAsg.totalMarks}
                              </span>
                            </div>
                          </div>

                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                              <label className="input-label" style={{ marginBottom: 0 }}>Teacher Remarks & Guardian Note *</label>
                              {/* Quick snippet templates */}
                              <div style={{ display: 'flex', gap: '0.35rem' }}>
                                {[
                                  '⭐ Outstanding Concept Clarity',
                                  '👍 Well Attempted, Revise Formulas',
                                  '⚠️ Needs Practice on Numerical Problems'
                                ].map((snip, idx) => (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => setTeacherRemarksInput(snip)}
                                    style={{
                                      fontSize: '0.68rem',
                                      padding: '0.2rem 0.45rem',
                                      borderRadius: '4px',
                                      background: 'rgba(99, 102, 241, 0.08)',
                                      color: 'var(--primary)',
                                      border: '1px solid rgba(99, 102, 241, 0.2)',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    {snip}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <textarea 
                              rows={2}
                              value={teacherRemarksInput}
                              onChange={(e) => setTeacherRemarksInput(e.target.value)}
                              placeholder="e.g. Excellent conceptual grasp on chemical equations. Accurate question answering."
                              className="form-textarea"
                              style={{ resize: 'vertical' }}
                            />
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.75rem', borderTop: '1px solid var(--border-light)', paddingTop: '1rem' }}>
                          <button className="btn btn-secondary" onClick={() => setCheckingStudent(null)}>
                            <span>Cancel</span>
                          </button>
                          <button className="btn btn-primary" style={{ padding: '0.65rem 1.4rem' }} onClick={handleConfirmTeacherCheck}>
                            <CheckCircle2 size={16} />
                            <span>Mark as Checked & Release Result to Student & Parent</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              /* VIEW B: Class Roster Table */
              <div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-surface-elevated)', borderBottom: '2px solid var(--border-light)' }}>
                        <th style={{ padding: '0.75rem', textAlign: 'left' }}>Roll No</th>
                        <th style={{ padding: '0.75rem', textAlign: 'left' }}>Student Name</th>
                        <th style={{ padding: '0.75rem', textAlign: 'left' }}>Test Status</th>
                        <th style={{ padding: '0.75rem', textAlign: 'left' }}>Verified Marks</th>
                        <th style={{ padding: '0.75rem', textAlign: 'left' }}>Teacher Remarks</th>
                        <th style={{ padding: '0.75rem', textAlign: 'right' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students
                        .filter(s => s.className === gradingAsg.className)
                        .map((st) => {
                          const sub = (gradingAsg.submissions && gradingAsg.submissions[st.id]) || {
                            hasGivenTest: false,
                            checkedByTeacher: false,
                            status: 'Incomplete',
                            score: null,
                            teacherRemarks: 'Awaiting student test submission'
                          };

                          const hasGiven = Boolean(sub.hasGivenTest || sub.status === 'Submitted' || sub.status === 'Completed');
                          const isChecked = Boolean(sub.checkedByTeacher);

                          return (
                            <tr key={st.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                              <td style={{ padding: '0.75rem', fontWeight: 700 }}>{st.rollNo}</td>
                              <td style={{ padding: '0.75rem', fontWeight: 600 }}>{st.name}</td>
                              
                              {/* Status */}
                              <td style={{ padding: '0.75rem' }}>
                                {isChecked ? (
                                  <span className="badge badge-success">
                                    ✓ Checked & Released
                                  </span>
                                ) : hasGiven ? (
                                  <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                                    <Clock size={12} />
                                    <span>Submitted ({sub.submittedDate || 'Recent'})</span>
                                  </span>
                                ) : (
                                  <span className="badge badge-danger">
                                    Not Attempted
                                  </span>
                                )}
                              </td>

                              {/* Marks */}
                              <td style={{ padding: '0.75rem' }}>
                                {isChecked ? (
                                  <strong style={{ color: 'var(--success)' }}>
                                    {sub.score} / {gradingAsg.totalMarks}
                                  </strong>
                                ) : hasGiven ? (
                                  <span style={{ color: 'var(--warning)', fontSize: '0.8rem' }}>
                                    Auto: {sub.rawCalculatedScore !== undefined ? sub.rawCalculatedScore : '—'} (Unchecked)
                                  </span>
                                ) : (
                                  <span style={{ color: 'var(--text-muted)' }}>—</span>
                                )}
                              </td>

                              {/* Remarks */}
                              <td style={{ padding: '0.75rem', maxWidth: '240px' }}>
                                <span style={{ fontSize: '0.78rem', color: isChecked ? 'var(--text-secondary)' : hasGiven ? '#b45309' : 'var(--danger)' }}>
                                  {sub.teacherRemarks || '—'}
                                </span>
                              </td>

                              {/* Action */}
                              <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                                {hasGiven ? (
                                  <button 
                                    className="btn btn-primary" 
                                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                                    onClick={() => handleSelectStudentForCheck(st, sub)}
                                  >
                                    <CheckSquare size={13} />
                                    <span>{isChecked ? 'Re-evaluate Test' : 'Check Test & Grade'}</span>
                                  </button>
                                ) : (
                                  <button 
                                    className="btn btn-secondary" 
                                    style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                                    onClick={() => {
                                      showToast(`Reminder sent to ${st.name} to sit for ${gradingAsg.title}!`, 'info');
                                    }}
                                  >
                                    <Send size={12} />
                                    <span>Send Reminder</span>
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                  <button className="btn btn-secondary" onClick={() => setGradingModalOpen(false)}>
                    <span>Done</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. MODAL: TEACHER CREATE ASSIGNMENT & MCQ BUILDER                         */}
      {/* ========================================================================= */}
      {createModalOpen && (
        <div 
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            background: 'rgba(15, 23, 42, 0.7)', 
            backdropFilter: 'blur(6px)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            zIndex: 1000, 
            padding: '1.5rem' 
          }}
        >
          <div 
            className="glass-panel" 
            style={{ 
              width: '100%', 
              maxWidth: '880px', 
              maxHeight: '92vh', 
              overflowY: 'auto', 
              padding: '2rem 2.25rem', 
              background: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid #e2e8f0'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-light)', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                  <span className="badge badge-primary">Educator Assessment Authoring Studio</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>CBSE Curriculum Standard</span>
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                  Create New Coursework / MCQ Quiz
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  Assign homework or interactive quizzes for CBSE classes with real-time parent alert integration.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  style={{ 
                    fontSize: '0.8rem', 
                    padding: '0.45rem 0.85rem', 
                    background: 'rgba(99, 102, 241, 0.08)',
                    borderColor: 'rgba(99, 102, 241, 0.3)',
                    color: 'var(--primary)'
                  }}
                  onClick={loadSampleQuestions}
                  title="Auto-fill with sample CBSE Chemistry quiz"
                >
                  <Sparkles size={15} color="var(--primary)" />
                  <span>Load Sample CBSE MCQs</span>
                </button>
                <button 
                  className="btn btn-secondary" 
                  style={{ padding: '0.45rem', borderRadius: '50%' }} 
                  onClick={() => setCreateModalOpen(false)}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateAssignmentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Row 1: Title & Type */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.25rem' }}>
                <div>
                  <label className="input-label">Title / Topic Name *</label>
                  <input 
                    type="text" 
                    required 
                    value={newTitle} 
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. CBSE Chapter 4: Quadratic Equations & Polynomials" 
                    className="form-input" 
                  />
                </div>

                <div>
                  <label className="input-label">Assessment Type *</label>
                  <select 
                    value={newType} 
                    onChange={(e) => setNewType(e.target.value)} 
                    className="form-select"
                  >
                    <option value="quiz">Interactive MCQ Quiz (Online Taker)</option>
                    <option value="assignment">Homework Assignment (Written / Notebook)</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Subject, Class, Due Date, Total Marks */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                <div>
                  <label className="input-label">Subject *</label>
                  <select 
                    value={newSubject} 
                    onChange={(e) => setNewSubject(e.target.value)} 
                    className="form-select"
                  >
                    <option value="Mathematics">Mathematics</option>
                    <option value="Science (Physics)">Science (Physics)</option>
                    <option value="Science (Chemistry)">Science (Chemistry)</option>
                    <option value="Science (Biology)">Science (Biology)</option>
                    <option value="Social Science">Social Science</option>
                    <option value="English Core">English Core</option>
                    <option value="Computer Science & AI">Computer Science & AI</option>
                  </select>
                </div>

                <div>
                  <label className="input-label">Target Class & Division *</label>
                  <select 
                    value={newClass} 
                    onChange={(e) => setNewClass(e.target.value)} 
                    className="form-select"
                  >
                    <option value="Class 10-A">Class 10-A</option>
                    <option value="Class 10-B">Class 10-B</option>
                    <option value="Class 12-A">Class 12-A</option>
                  </select>
                </div>

                <div>
                  <label className="input-label">Submission Due Date *</label>
                  <input 
                    type="date" 
                    required 
                    value={newDueDate} 
                    onChange={(e) => setNewDueDate(e.target.value)} 
                    className="form-input" 
                  />
                </div>

                <div>
                  <label className="input-label">Total Marks *</label>
                  <input 
                    type="number" 
                    min={5}
                    max={100}
                    required 
                    value={newTotalMarks} 
                    onChange={(e) => setNewTotalMarks(e.target.value)} 
                    className="form-input" 
                  />
                </div>
              </div>

              {/* Row 3: Instructions */}
              <div>
                <label className="input-label">Instructions / Syllabus Description</label>
                <textarea 
                  rows={2} 
                  value={newDesc} 
                  onChange={(e) => setNewDesc(e.target.value)} 
                  placeholder="Explain syllabus scope, NCERT chapter references, or submission instructions..."
                  className="form-textarea" 
                  style={{ resize: 'vertical' }}
                />
              </div>

              {/* Dynamic MCQ Builder (if type === 'quiz') */}
              {newType === 'quiz' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '0.5rem', borderTop: '1px solid var(--border-light)', paddingTop: '1.25rem' }}>
                  {/* AI Quick Assistant Banner */}
                  <div 
                    style={{
                      background: 'linear-gradient(135deg, #eef2ff 0%, #faf5ff 100%)',
                      border: '1.5px solid #c7d2fe',
                      borderRadius: '10px',
                      padding: '0.95rem 1.15rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.85rem',
                      boxShadow: '0 2px 8px rgba(99, 102, 241, 0.08)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: '240px', flex: 1 }}>
                      <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 6px rgba(79, 70, 229, 0.3)' }}>
                        <Sparkles size={20} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#1e1b4b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span>Gemini AI Question Generator</span>
                          <span style={{ fontSize: '0.68rem', background: '#e0e7ff', color: '#3730a3', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 800, textTransform: 'uppercase' }}>
                            Flash AI
                          </span>
                        </div>
                        <div style={{ fontSize: '0.76rem', color: '#4338ca', marginTop: '0.15rem', lineHeight: 1.4 }}>
                          Auto-generate curriculum-aligned MCQs by difficulty, topic, or strictly grounded in your own lecture notes / textbook text.
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleOpenAiStudio}
                      style={{
                        padding: '0.5rem 1.15rem',
                        fontSize: '0.82rem',
                        fontWeight: 800,
                        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        boxShadow: '0 2px 8px rgba(79, 70, 229, 0.35)'
                      }}
                    >
                      <Wand2 size={14} />
                      <span>Launch AI Question Studio</span>
                    </button>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.65rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        MCQ Questions ({newQuestions.length})
                      </h3>
                      <span className="badge badge-primary" style={{ fontSize: '0.78rem' }}>
                        Total: {newQuestions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0)} Marks
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <button 
                        type="button" 
                        className="btn" 
                        style={{ 
                          fontSize: '0.82rem', 
                          padding: '0.4rem 0.85rem',
                          background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                          color: '#ffffff',
                          border: 'none',
                          boxShadow: '0 2px 6px rgba(99, 102, 241, 0.3)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          fontWeight: 700,
                          borderRadius: '6px'
                        }}
                        onClick={handleOpenAiStudio}
                      >
                        <Sparkles size={14} />
                        <span>Generate with AI</span>
                      </button>

                      <button 
                        type="button" 
                        className="btn btn-secondary" 
                        style={{ fontSize: '0.82rem', padding: '0.4rem 0.85rem', borderRadius: '6px' }}
                        onClick={addQuestionField}
                      >
                        <Plus size={14} />
                        <span>Add Manually</span>
                      </button>
                    </div>
                  </div>

                  {newQuestions.map((q, qIdx) => (
                    <div 
                      key={q.id || qIdx} 
                      style={{ 
                        padding: '1.35rem 1.5rem', 
                        borderRadius: '12px', 
                        background: '#f8fafc', 
                        border: '1.5px solid #e2e8f0',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.85rem'
                      }}
                    >
                      {/* Top Bar of Question Card */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span className="badge badge-primary" style={{ fontSize: '0.82rem', padding: '0.25rem 0.65rem' }}>
                            Question {qIdx + 1}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Marks:</span>
                            <input 
                              type="number" 
                              min={1}
                              max={50}
                              value={q.marks} 
                              onChange={(e) => updateQuestion(qIdx, 'marks', Number(e.target.value))}
                              className="form-input"
                              style={{ width: '65px', padding: '0.3rem 0.5rem', textAlign: 'center', fontWeight: 700 }}
                            />
                          </div>
                          {newQuestions.length > 1 && (
                            <button 
                              type="button"
                              onClick={() => removeQuestionField(qIdx)}
                              className="btn"
                              style={{ 
                                padding: '0.35rem 0.65rem', 
                                color: 'var(--danger)', 
                                background: 'rgba(239, 68, 68, 0.08)', 
                                border: '1px solid rgba(239, 68, 68, 0.25)', 
                                fontSize: '0.78rem' 
                              }}
                              title="Delete Question"
                            >
                              <Trash2 size={14} />
                              <span>Remove</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Question Prompt */}
                      <div>
                        <label className="input-label" style={{ fontSize: '0.78rem' }}>Question Prompt *</label>
                        <textarea 
                          rows={2} 
                          required 
                          placeholder="Enter question statement or problem (e.g. Which of the following represents a displacement reaction?)..."
                          value={q.prompt} 
                          onChange={(e) => updateQuestion(qIdx, 'prompt', e.target.value)} 
                          className="form-textarea" 
                          style={{ fontSize: '0.9rem', resize: 'vertical' }}
                        />
                      </div>

                      {/* 4 Choices Grid (2x2) */}
                      <div>
                        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                          Answer Choices (Select radio button for the correct key):
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
                          {q.options.map((opt, optIdx) => (
                            <div 
                              key={optIdx} 
                              style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '0.65rem', 
                                padding: '0.5rem 0.75rem', 
                                borderRadius: '8px', 
                                border: q.correctIndex === optIdx ? '2px solid var(--success)' : '1px solid #cbd5e1', 
                                background: q.correctIndex === optIdx ? 'rgba(16, 185, 129, 0.06)' : '#ffffff', 
                                transition: 'all 0.15s ease' 
                              }}
                            >
                              <input 
                                type="radio" 
                                name={`correct_${qIdx}`}
                                checked={q.correctIndex === optIdx}
                                onChange={() => updateQuestion(qIdx, 'correctIndex', optIdx)}
                                title="Mark as correct answer key"
                                style={{ width: '18px', height: '18px', accentColor: 'var(--success)', cursor: 'pointer', flexShrink: 0 }}
                              />
                              <span style={{ 
                                width: '24px', 
                                height: '24px', 
                                borderRadius: '50%', 
                                background: q.correctIndex === optIdx ? 'var(--success)' : '#e2e8f0', 
                                color: q.correctIndex === optIdx ? '#ffffff' : 'var(--text-secondary)', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                fontSize: '0.75rem', 
                                fontWeight: 800, 
                                flexShrink: 0 
                              }}>
                                {String.fromCharCode(65 + optIdx)}
                              </span>
                              <input 
                                type="text" 
                                required 
                                placeholder={`Option ${String.fromCharCode(65 + optIdx)} text...`}
                                value={opt} 
                                onChange={(e) => updateOption(qIdx, optIdx, e.target.value)} 
                                style={{ 
                                  border: 'none', 
                                  background: 'transparent', 
                                  outline: 'none', 
                                  width: '100%', 
                                  fontSize: '0.88rem', 
                                  color: 'var(--text-primary)', 
                                  fontFamily: 'inherit' 
                                }}
                              />
                              {q.correctIndex === optIdx && (
                                <span className="badge badge-success" style={{ fontSize: '0.68rem', padding: '0.2rem 0.45rem', flexShrink: 0 }}>
                                  ✓ Correct Key
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Concept Explanation / Hint */}
                      <div>
                        <label className="input-label" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Parent & Student Concept Explanation / NCERT Reference (Optional):
                        </label>
                        <input 
                          type="text" 
                          placeholder="e.g. NCERT Chapter 1, Section 1.2: A more reactive metal displaces a less reactive metal from its salt."
                          value={q.hint || ''} 
                          onChange={(e) => updateQuestion(qIdx, 'hint', e.target.value)} 
                          className="form-input" 
                          style={{ fontSize: '0.82rem' }}
                        />
                      </div>
                    </div>
                  ))}

                  {/* Add Another Question Wide Button */}
                  <button 
                    type="button" 
                    onClick={addQuestionField} 
                    className="btn btn-secondary" 
                    style={{ 
                      width: '100%', 
                      padding: '0.75rem', 
                      border: '2px dashed #cbd5e1', 
                      background: '#f8fafc', 
                      color: 'var(--primary)', 
                      fontWeight: 700, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      gap: '0.5rem', 
                      borderRadius: '10px' 
                    }}
                  >
                    <Plus size={16} />
                    <span>Add Another Question (Question {newQuestions.length + 1})</span>
                  </button>
                </div>
              )}

              {/* Submit Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem', borderTop: '1px solid var(--border-light)', paddingTop: '1.25rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setCreateModalOpen(false)}>
                  <span>Cancel</span>
                </button>
                <button type="submit" className="btn btn-primary" style={{ padding: '0.65rem 1.4rem' }}>
                  <Check size={16} />
                  <span>Publish Assignment & Alert Parents</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. MODAL: GEMINI AI QUESTION STUDIO (AI MCQ GENERATOR)                    */}
      {/* ========================================================================= */}
      {aiModalOpen && (
        <div 
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            background: 'rgba(15, 23, 42, 0.75)', 
            backdropFilter: 'blur(8px)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            zIndex: 1100, 
            padding: '1rem' 
          }}
        >
          <div 
            className="glass-panel" 
            style={{ 
              width: '100%', 
              maxWidth: '880px', 
              maxHeight: '92vh', 
              overflowY: 'auto', 
              padding: '1.75rem 2rem', 
              background: '#ffffff',
              borderRadius: '12px',
              boxShadow: '0 25px 50px -12px rgba(99, 102, 241, 0.25)',
              border: '1px solid #cbd5e1'
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.35)', flexShrink: 0 }}>
                  <Sparkles size={22} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      Gemini AI Question Studio
                    </h2>
                    <span style={{ fontSize: '0.7rem', background: '#e0e7ff', color: '#3730a3', padding: '0.15rem 0.5rem', borderRadius: '6px', fontWeight: 800, textTransform: 'uppercase' }}>
                      Official Google Gemini
                    </span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0.25rem 0 0' }}>
                    Generate CBSE-aligned multiple choice questions by topic, difficulty, or strictly from your personal lesson notes.
                  </p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => {
                  setAiModalOpen(false);
                  setAiGeneratedQuestions(null);
                  setAiError(null);
                }}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '6px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#475569' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* If Not Generated Yet (Config Form) */}
            {!aiGeneratedQuestions && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Row 1: Academic Scope (Subject & Class) */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label className="input-label" style={{ fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <BookOpen size={14} color="#6366f1" />
                      <span>Curriculum Subject</span>
                    </label>
                    <select
                      value={aiSubject}
                      onChange={(e) => setAiSubject(e.target.value)}
                      className="form-select"
                      style={{ fontSize: '0.88rem', padding: '0.6rem 0.75rem', borderRadius: '8px' }}
                    >
                      {CBSE_SUBJECT_PRESETS.map((sub) => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="input-label" style={{ fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <GraduationCap size={14} color="#6366f1" />
                      <span>Target Grade / Class</span>
                    </label>
                    <select
                      value={aiClass}
                      onChange={(e) => setAiClass(e.target.value)}
                      className="form-select"
                      style={{ fontSize: '0.88rem', padding: '0.6rem 0.75rem', borderRadius: '8px' }}
                    >
                      {classes.length > 0 ? (
                        classes.map((cls) => (
                          <option key={cls.id || cls.name} value={cls.name}>{cls.name}</option>
                        ))
                      ) : (
                        ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10-A', 'Class 10-B', 'Class 11', 'Class 12'].map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))
                      )}
                    </select>
                  </div>
                </div>

                {/* Row 2: Topic / Chapter Name with Dynamic CBSE Presets */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <label className="input-label" style={{ fontWeight: 800, color: '#1e293b', margin: 0 }}>
                      Topic / Unit / Chapter Name {!aiUseNotesOnly && <span style={{ color: 'var(--danger)' }}>*</span>}
                    </label>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                      Or select from recommended CBSE chapters below
                    </span>
                  </div>
                  <input 
                    type="text" 
                    value={aiTopic} 
                    onChange={(e) => setAiTopic(e.target.value)} 
                    placeholder="e.g., Chemical Reactions & Equations, Quadratic Equations, Life Processes..." 
                    className="form-input" 
                    style={{ fontSize: '0.9rem', padding: '0.6rem 0.85rem', borderRadius: '8px' }}
                  />

                  {/* Topic Recommendation Chips */}
                  {CBSE_TOPIC_PRESETS[aiSubject] && CBSE_TOPIC_PRESETS[aiSubject].length > 0 && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, marginBottom: '0.35rem' }}>
                        Suggested CBSE Chapters for {aiSubject}:
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                        {CBSE_TOPIC_PRESETS[aiSubject].map((topicItem) => {
                          const isSelected = aiTopic.toLowerCase() === topicItem.toLowerCase();
                          return (
                            <button
                              key={topicItem}
                              type="button"
                              onClick={() => setAiTopic(topicItem)}
                              style={{
                                padding: '0.25rem 0.65rem',
                                borderRadius: '6px',
                                fontSize: '0.74rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                border: isSelected ? '1px solid #4f46e5' : '1px solid #e2e8f0',
                                background: isSelected ? '#eef2ff' : '#f8fafc',
                                color: isSelected ? '#3730a3' : '#475569',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              {topicItem}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Row 3: Upload Notes in PDF and All Formats (Strict Grounding Section) */}
                <div 
                  style={{ 
                    border: aiUseNotesOnly ? '2px solid #6366f1' : '1px solid #e2e8f0', 
                    borderRadius: '10px', 
                    padding: '1.15rem', 
                    background: aiUseNotesOnly ? 'rgba(99, 102, 241, 0.03)' : '#f8fafc',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <UploadCloud size={18} color="#4f46e5" />
                      <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>
                        Lesson Notes & Textbook Upload
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.68rem', fontWeight: 800, background: '#fee2e2', color: '#991b1b', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>PDF</span>
                      <span style={{ fontSize: '0.68rem', fontWeight: 800, background: '#e0e7ff', color: '#3730a3', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>DOCX</span>
                      <span style={{ fontSize: '0.68rem', fontWeight: 800, background: '#fef3c7', color: '#92400e', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>TXT</span>
                      <span style={{ fontSize: '0.68rem', fontWeight: 800, background: '#dcfce7', color: '#166534', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>MD</span>
                    </div>
                  </div>

                  {/* Strict notes grounding toggle */}
                  <label 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'flex-start', 
                      gap: '0.65rem', 
                      cursor: 'pointer',
                      userSelect: 'none',
                      padding: '0.5rem 0.75rem',
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      marginBottom: '0.85rem'
                    }}
                  >
                    <input 
                      type="checkbox" 
                      checked={aiUseNotesOnly} 
                      onChange={(e) => setAiUseNotesOnly(e.target.checked)}
                      style={{ width: '16px', height: '16px', accentColor: '#4f46e5', cursor: 'pointer', marginTop: '0.15rem' }}
                    />
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.86rem', color: '#0f172a' }}>
                        Strictly Restrict to Uploaded Notes / Textbook Material
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b', lineHeight: 1.35, marginTop: '0.1rem' }}>
                        When enabled, Gemini is strictly forbidden from testing external concepts and will formulate questions <strong>ONLY</strong> from the uploaded document or text below.
                      </div>
                    </div>
                  </label>

                  {/* Hidden Native File Input */}
                  <input
                    type="file"
                    id="ai-notes-file-input"
                    accept=".pdf,.doc,.docx,.txt,.md,.markdown,.csv,.rtf,text/*,application/pdf"
                    onChange={handleNotesFileUpload}
                    style={{ display: 'none' }}
                  />

                  {/* Upload State / Dropzone */}
                  {aiUploadedFile ? (
                    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FileCheck size={20} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '0.86rem', color: '#166534' }}>
                            {aiUploadedFile.name}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#15803d' }}>
                            {(aiUploadedFile.size / 1024).toFixed(1)} KB 
                            {aiUploadedFile.pageCount ? ` • ${aiUploadedFile.pageCount} Pages` : ''} 
                            {` • ${aiNotesText.length.toLocaleString()} characters extracted`}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <button
                          type="button"
                          onClick={() => setAiShowNotesPreview(!aiShowNotesPreview)}
                          style={{
                            padding: '0.35rem 0.65rem',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            background: '#ffffff',
                            color: '#334155',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          {aiShowNotesPreview ? 'Hide Text Preview' : 'Preview Extracted Text'}
                        </button>
                        <button
                          type="button"
                          onClick={handleRemoveUploadedNotes}
                          style={{
                            padding: '0.35rem 0.65rem',
                            borderRadius: '6px',
                            border: '1px solid #fca5a5',
                            background: '#fef2f2',
                            color: '#b91c1c',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}
                        >
                          <Trash2 size={13} />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      onClick={() => document.getElementById('ai-notes-file-input')?.click()}
                      style={{
                        border: '2px dashed #cbd5e1',
                        borderRadius: '8px',
                        padding: '1.1rem',
                        textAlign: 'center',
                        background: '#ffffff',
                        cursor: aiIsReadingFile ? 'wait' : 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = '#6366f1'}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = '#cbd5e1'}
                    >
                      {aiIsReadingFile ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#4f46e5', fontWeight: 700, fontSize: '0.86rem' }}>
                          <Loader2 size={18} className="animate-spin" />
                          <span>Extracting text from document via PDF.js...</span>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem' }}>
                          <FileUp size={24} color="#6366f1" />
                          <div style={{ fontWeight: 800, fontSize: '0.86rem', color: '#1e293b' }}>
                            Upload PDF, DOCX, TXT, or MD Notes
                          </div>
                          <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                            Click to browse or drop your lesson notes file here. Auto-parsed page-by-page.
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Extracted or Manual Textarea */}
                  {(aiShowNotesPreview || (!aiUploadedFile && aiUseNotesOnly)) && (
                    <div style={{ marginTop: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#475569' }}>
                          {aiUploadedFile ? 'Extracted Notes Content:' : 'Or Paste Lesson Notes Directly:'}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                          {aiNotesText.length} Characters • ~{Math.round(aiNotesText.trim().split(/\s+/).filter(Boolean).length)} Words
                        </span>
                      </div>
                      <textarea
                        rows={5}
                        value={aiNotesText}
                        onChange={(e) => setAiNotesText(e.target.value)}
                        placeholder="Paste lecture notes, textbook definitions, formulas, or syllabus text here..."
                        className="form-textarea"
                        style={{ fontSize: '0.82rem', resize: 'vertical', background: '#ffffff', borderRadius: '8px' }}
                      />
                    </div>
                  )}
                </div>

                {/* Row 4: Academic Rubric Grid (Format, Difficulty, Marking, Language, Bloom's, Question Count) */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  {/* Question Format / Style */}
                  <div>
                    <label className="input-label" style={{ fontWeight: 800, color: '#1e293b', fontSize: '0.78rem' }}>
                      Question Format / Style
                    </label>
                    <select
                      value={aiQuestionStyle}
                      onChange={(e) => setAiQuestionStyle(e.target.value)}
                      className="form-select"
                      style={{ fontSize: '0.82rem', padding: '0.45rem 0.65rem', borderRadius: '6px' }}
                    >
                      <option value="balanced">Balanced CBSE Standard</option>
                      <option value="assertion_reason">Assertion & Reason (A&R CBSE)</option>
                      <option value="numerical">Numerical & Problem-Solving</option>
                      <option value="conceptual">Conceptual & Deep Theory</option>
                      <option value="case_study">Case Study / Passage-Based</option>
                    </select>
                  </div>

                  {/* Marking Scheme */}
                  <div>
                    <label className="input-label" style={{ fontWeight: 800, color: '#1e293b', fontSize: '0.78rem' }}>
                      Marking Scheme
                    </label>
                    <select
                      value={aiMarkingScheme}
                      onChange={(e) => setAiMarkingScheme(e.target.value)}
                      className="form-select"
                      style={{ fontSize: '0.82rem', padding: '0.45rem 0.65rem', borderRadius: '6px' }}
                    >
                      <option value="+5 / -0">+5 / 0 Marks (Campus Standard)</option>
                      <option value="+4 / -1">+4 / -1 Marks (Competitive / Negative)</option>
                      <option value="+1 / -0">+1 / 0 Marks (1-Mark Objective)</option>
                      <option value="+2 / -0">+2 / 0 Marks (2-Marks Conceptual)</option>
                    </select>
                  </div>

                  {/* Medium / Language */}
                  <div>
                    <label className="input-label" style={{ fontWeight: 800, color: '#1e293b', fontSize: '0.78rem' }}>
                      Language / Medium
                    </label>
                    <select
                      value={aiLanguage}
                      onChange={(e) => setAiLanguage(e.target.value)}
                      className="form-select"
                      style={{ fontSize: '0.82rem', padding: '0.45rem 0.65rem', borderRadius: '6px' }}
                    >
                      <option value="English">English Medium</option>
                      <option value="Hindi">Hindi Medium (हिंदी)</option>
                      <option value="Bilingual">Bilingual (English + Hindi)</option>
                    </select>
                  </div>

                  {/* Cognitive Level (Bloom's Taxonomy) */}
                  <div>
                    <label className="input-label" style={{ fontWeight: 800, color: '#1e293b', fontSize: '0.78rem' }}>
                      Bloom's Cognitive Level
                    </label>
                    <select
                      value={aiBloomLevel}
                      onChange={(e) => setAiBloomLevel(e.target.value)}
                      className="form-select"
                      style={{ fontSize: '0.82rem', padding: '0.45rem 0.65rem', borderRadius: '6px' }}
                    >
                      <option value="balanced">Balanced Cognitive Mix</option>
                      <option value="recall">Knowledge & Direct Recall</option>
                      <option value="analytical">Analytical & HOTS (High Order)</option>
                    </select>
                  </div>

                  {/* Difficulty Level */}
                  <div>
                    <label className="input-label" style={{ fontWeight: 800, color: '#1e293b', fontSize: '0.78rem' }}>
                      Academic Difficulty
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.3rem' }}>
                      {[
                        { key: 'Easy', label: 'Easy' },
                        { key: 'Medium', label: 'Medium' },
                        { key: 'Hard', label: 'Hard' },
                        { key: 'Competitive', label: 'Olympiad' }
                      ].map((diff) => (
                        <button
                          key={diff.key}
                          type="button"
                          onClick={() => setAiDifficulty(diff.key)}
                          style={{
                            padding: '0.45rem 0.2rem',
                            borderRadius: '6px',
                            border: aiDifficulty === diff.key ? '2px solid #6366f1' : '1px solid #cbd5e1',
                            background: aiDifficulty === diff.key ? '#eef2ff' : '#ffffff',
                            color: aiDifficulty === diff.key ? '#4338ca' : '#475569',
                            fontWeight: 800,
                            fontSize: '0.72rem',
                            cursor: 'pointer',
                            textAlign: 'center'
                          }}
                        >
                          {diff.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Number of Questions */}
                  <div>
                    <label className="input-label" style={{ fontWeight: 800, color: '#1e293b', fontSize: '0.78rem' }}>
                      Questions to Formulate
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.3rem' }}>
                      {[3, 5, 10, 15].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setAiNumQuestions(num)}
                          style={{
                            padding: '0.45rem 0.2rem',
                            borderRadius: '6px',
                            border: aiNumQuestions === num ? '2px solid #6366f1' : '1px solid #cbd5e1',
                            background: aiNumQuestions === num ? '#eef2ff' : '#ffffff',
                            color: aiNumQuestions === num ? '#4338ca' : '#475569',
                            fontWeight: 800,
                            fontSize: '0.76rem',
                            cursor: 'pointer',
                            textAlign: 'center'
                          }}
                        >
                          {num} Qs
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Error Banner if any */}
                {aiError && (
                  <div style={{ padding: '0.85rem 1rem', borderRadius: '8px', background: '#fef2f2', border: '1.5px solid #fca5a5', color: '#b91c1c', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                    <span>{aiError}</span>
                  </div>
                )}

                {/* Generate Action Button */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.25rem' }}>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setAiModalOpen(false)}
                    disabled={aiIsGenerating}
                  >
                    Cancel
                  </button>

                  <button 
                    type="button" 
                    onClick={handleGenerateAiQuestions}
                    disabled={aiIsGenerating || (!aiTopic.trim() && (!aiUseNotesOnly || !aiNotesText.trim()))}
                    style={{
                      padding: '0.65rem 1.4rem',
                      borderRadius: '8px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                      color: '#ffffff',
                      fontWeight: 800,
                      fontSize: '0.88rem',
                      cursor: aiIsGenerating ? 'wait' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      boxShadow: '0 4px 14px rgba(79, 70, 229, 0.4)',
                      opacity: (aiIsGenerating || (!aiTopic.trim() && (!aiUseNotesOnly || !aiNotesText.trim()))) ? 0.7 : 1
                    }}
                  >
                    {aiIsGenerating ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Formulating Questions with Gemini AI...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} />
                        <span>Generate {aiNumQuestions} Questions with Gemini</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Generated Questions Preview & Insertion Screen */}
            {aiGeneratedQuestions && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '0.75rem 1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#166534', fontWeight: 800, fontSize: '0.88rem' }}>
                    <CheckCircle2 size={18} color="#16a34a" />
                    <span>Successfully Formulated {aiGeneratedQuestions.length} Questions</span>
                  </div>
                  <span style={{ fontSize: '0.76rem', color: '#15803d', fontWeight: 700 }}>
                    Subject: {aiSubject} • Difficulty: {aiDifficulty} • Total Marks: {aiGeneratedQuestions.reduce((s, q) => s + (Number(q.marks) || 5), 0)}
                  </span>
                </div>

                {/* Questions Preview List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '55vh', overflowY: 'auto', paddingRight: '0.35rem' }}>
                  {aiGeneratedQuestions.map((q, qIdx) => (
                    <div 
                      key={qIdx}
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '1rem 1.25rem'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.76rem', fontWeight: 800, background: '#0f172a', color: '#fff', padding: '0.2rem 0.55rem', borderRadius: '5px' }}>
                          Question {qIdx + 1}
                        </span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#059669', background: '#ecfdf5', padding: '0.15rem 0.45rem', borderRadius: '5px' }}>
                          +{q.marks || 5} Marks
                        </span>
                      </div>

                      <div style={{ fontSize: '0.94rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                        {q.prompt}
                      </div>

                      {/* Options Grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.5rem' }}>
                        {q.options.map((opt, optIdx) => {
                          const isCorrect = q.correctIndex === optIdx;
                          return (
                            <div 
                              key={optIdx}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.45rem 0.65rem',
                                borderRadius: '6px',
                                background: isCorrect ? '#ecfdf5' : '#ffffff',
                                border: isCorrect ? '1.5px solid #10b981' : '1px solid #cbd5e1',
                                fontSize: '0.82rem',
                                color: isCorrect ? '#065f46' : '#334155',
                                fontWeight: isCorrect ? 700 : 500
                              }}
                            >
                              <span style={{ width: '20px', height: '20px', borderRadius: '4px', background: isCorrect ? '#10b981' : '#f1f5f9', color: isCorrect ? '#fff' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800, flexShrink: 0 }}>
                                {String.fromCharCode(65 + optIdx)}
                              </span>
                              <span style={{ flex: 1 }}>{opt}</span>
                              {isCorrect && <CheckCircle2 size={14} color="#10b981" />}
                            </div>
                          );
                        })}
                      </div>

                      {q.explanation && (
                        <div style={{ marginTop: '0.65rem', fontSize: '0.76rem', color: '#64748b', background: '#ffffff', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                          <strong>Explanation / NCERT Reference:</strong> {q.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Insertion Action Buttons */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem' }}>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setAiGeneratedQuestions(null)}
                    style={{ fontSize: '0.84rem' }}
                  >
                    ← Back to Configure
                  </button>

                  <div style={{ display: 'flex', gap: '0.65rem' }}>
                    {newQuestions.length > 0 && newQuestions[0].prompt && (
                      <button 
                        type="button" 
                        onClick={() => handleApplyAiQuestions('append')}
                        style={{
                          padding: '0.6rem 1.15rem',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          background: '#ffffff',
                          color: '#334155',
                          fontWeight: 700,
                          fontSize: '0.84rem',
                          cursor: 'pointer'
                        }}
                      >
                        Append to Existing Questions
                      </button>
                    )}

                    <button 
                      type="button" 
                      onClick={() => handleApplyAiQuestions('replace')}
                      style={{
                        padding: '0.6rem 1.35rem',
                        borderRadius: '8px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: '#ffffff',
                        fontWeight: 800,
                        fontSize: '0.86rem',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                      }}
                    >
                      <Check size={16} />
                      <span>Use These Questions in Quiz</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
