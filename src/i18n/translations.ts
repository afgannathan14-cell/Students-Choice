export type LanguageCode = 'en' | 'id' | 'es' | 'fr' | 'zh' | 'ja';

export interface LanguageOption {
  code: LanguageCode;
  nativeLabel: string;
  promptName: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'en', nativeLabel: 'English', promptName: 'English' },
  { code: 'id', nativeLabel: 'Bahasa Indonesia', promptName: 'Indonesian (Bahasa Indonesia)' },
  { code: 'es', nativeLabel: 'Español', promptName: 'Spanish' },
  { code: 'fr', nativeLabel: 'Français', promptName: 'French' },
  { code: 'zh', nativeLabel: '中文', promptName: 'Simplified Chinese' },
  { code: 'ja', nativeLabel: '日本語', promptName: 'Japanese' },
];

export function getLanguagePromptName(code: LanguageCode): string {
  return LANGUAGES.find((l) => l.code === code)?.promptName || 'English';
}

export interface Translations {
  nav: {
    overview: string;
    courses: string;
    studyPlan: string;
    advisor: string;
    appearance: string;
    language: string;
    dark: string;
    light: string;
    targetLabel: string;
  };
  header: {
    addGrade: string;
    openMenu: string;
    closeMenu: string;
  };
  status: {
    strong: string;
    onTrack: string;
    needsFocus: string;
    atRisk: string;
    pending: string;
    highPriority: string;
    mediumFocus: string;
    maintain: string;
  };
  overview: {
    cumulativeGpa: string;
    goalSuffix: string;
    aboveTarget: string;
    toTarget: string;
    weightedAverage: string;
    acrossCourses: string;
    enrolledCredits: string;
    creditsUnit: string;
    studyPlanProgress: string;
    completedUnit: string;
    personalizedActionItems: string;
    gradeTrajectory: string;
    trajectorySubtitle: string;
    logScore: string;
    noMilestones: string;
    noMilestonesHint: string;
    cumAvgLegend: string;
    targetLegend: string;
    courseStanding: string;
    courseStandingHint: string;
    manageAll: string;
    noCoursesYet: string;
    addFirstCourse: string;
    colCourse: string;
    colCurrent: string;
    colTarget: string;
    colStatus: string;
    crUnit: string;
    personalizedFocus: string;
    tailoredToGaps: string;
    refresh: string;
    analyzing: string;
    openFullPlan: string;
    askAdvisor: string;
    addSubject: string;
  };
  courses: {
    emptyTitle: string;
    emptyDesc: string;
    addFirstCourse: string;
    enrolledCourses: string;
    addCourse: string;
    editCourse: string;
    targetLabel: string;
    currentStanding: string;
    gradedWeight: string;
    neededOnRemaining: string;
    complete: string;
    stretch: string;
    secured: string;
    simulatorPrefix: string;
    simulatorMiddle: string;
    simulatorSuffix: string;
    projectedFinal: string;
    filterAll: string;
    filterPlaceholder: string;
    addGrade: string;
    noAssignments: string;
    noMatchingAssignments: string;
    logFirstAssignment: string;
    colAssessment: string;
    colDate: string;
    colWeight: string;
    colScore: string;
    colActions: string;
    review: string;
    generalReview: string;
    unassignedInstructor: string;
    creditsWord: string;
    passShort: string;
  };
  studyPlan: {
    title: string;
    tasksCompleted: string;
    lastUpdated: string;
    addTask: string;
    generateWithGemini: string;
    analyzingGrades: string;
    courseLabel: string;
    generalCourse: string;
    focusTopicLabel: string;
    focusPlaceholder: string;
    notesLabel: string;
    notesPlaceholder: string;
    minsLabel: string;
    save: string;
    allItems: string;
    remaining: string;
    completed: string;
    itemsCount: string;
    noTasks: string;
    minUnit: string;
    timerBtn: string;
    coachMeBtn: string;
    focusTimerTitle: string;
    defaultTimerTask: string;
    pause: string;
    startSession: string;
  };
  advisor: {
    title: string;
    subtitlePrefix: string;
    newThread: string;
    emptyTitle: string;
    emptyDesc: string;
    suggestedPrompts: string;
    advisorLabel: string;
    thinking: string;
    inputPlaceholder: string;
    promptTargetMath: (code: string, target: number) => string;
    promptQuizMe: (topic: string, code: string) => string;
    promptSchedule: (first: string, second: string) => string;
    promptDefault: string;
  };
  modals: {
    cancel: string;
    save: string;
    saveChanges: string;
    addCourse: string;
    editCourseTitle: string;
    codeLabel: string;
    courseTitleLabel: string;
    instructorLabel: string;
    creditsLabel: string;
    targetGradeLabel: string;
    editEntryTitle: string;
    logEntryTitle: string;
    titleLabel: string;
    categoryLabel: string;
    dateLabel: string;
    scoreLabel: string;
    maxPointsLabel: string;
    weightLabel: string;
    topicLabel: string;
    saveGrade: string;
    profileTitle: string;
    fullNameLabel: string;
    majorLabel: string;
    termLabel: string;
    targetGpaLabel: string;
    restoreSample: string;
    geminiReviewTitle: string;
    tryAgain: string;
    coreRefresher: string;
    commonPitfall: string;
    examHeuristic: string;
    practiceCheck: string;
    hintLabel: string;
    hideSolution: string;
    revealSolution: string;
    quickPresetsLabel: string;
    customSubjectHint: string;
    startBlank: string;
    profilePhotoLabel: string;
    uploadPhoto: string;
    removePhoto: string;
    photoUrlPlaceholder: string;
    passingGradeLabel: string;
    passingMinLabel: string;
  };
  files: {
    title: string;
    subtitle: string;
    attachBtn: string;
    subjectSelectLabel: string;
    allSubjects: string;
    supportedFormats: string;
    emptyHint: string;
    activeSummary: (count: number) => string;
    removeFile: string;
    fileTooLarge: string;
    unsupportedType: string;
    maxFilesReached: string;
    promptFromFiles: string;
    topicInputLabel: string;
    topicPlaceholder: string;
    subjectMaterialsTitle: string;
    subjectMaterialsSubtitle: string;
    emptySubjectHint: string;
    attachPdfBtn: string;
    openFile: string;
    downloadFile: string;
    askAdvisorFile: string;
    previewUnavailable: string;
    maxPerSubjectReached: string;
    pdfsCountShort: (count: number) => string;
    promptForSubjectFile: (courseCode: string, topicOrName: string) => string;
  };
  auth: {
    signIn: string;
    signInGoogle: string;
    signingIn: string;
    signOut: string;
    syncedLabel: string;
    localOnlyLabel: string;
    syncErrorTitle: string;
    accountSectionTitle: string;
    accountSignedOutHint: string;
    accountSignedInHint: string;
  };
  semesters: {
    all: string;
    short: (n: number) => string;
    full: (n: number) => string;
    more: string;
    extendedTitle: string;
    semesterLabel: string;
    semesterGpa: string;
    cumulativeGpaShort: string;
    emptySemester: string;
    addInSemester: (n: number) => string;
    gpaChartTitle: string;
    gpaChartSubtitle: string;
    ipsLegend: string;
    ipkLegend: string;
    noGradedSemesters: string;
    coursesUnit: string;
  };
}

const EN: Translations = {
  nav: {
    overview: 'Overview',
    courses: 'Courses & Grades',
    studyPlan: 'Study Plan',
    advisor: 'Academic Advisor',
    appearance: 'Appearance',
    language: 'Language',
    dark: 'Dark',
    light: 'Light',
    targetLabel: 'Target',
  },
  header: {
    addGrade: 'Add Grade',
    openMenu: 'Open navigation menu',
    closeMenu: 'Close navigation menu',
  },
  status: {
    strong: 'Strong',
    onTrack: 'On Track',
    needsFocus: 'Needs Focus',
    atRisk: 'At Risk',
    pending: 'Pending',
    highPriority: 'High Priority',
    mediumFocus: 'Medium Focus',
    maintain: 'Maintain',
  },
  overview: {
    cumulativeGpa: 'Cumulative GPA',
    goalSuffix: 'goal',
    aboveTarget: 'above target',
    toTarget: 'to target',
    weightedAverage: 'Weighted Average',
    acrossCourses: 'active courses',
    enrolledCredits: 'Enrolled Credits',
    creditsUnit: 'credits',
    studyPlanProgress: 'Study Plan Progress',
    completedUnit: 'completed',
    personalizedActionItems: 'Personalized action items',
    gradeTrajectory: 'Grade Trajectory',
    trajectorySubtitle: 'Credit-weighted cumulative performance across graded milestones',
    logScore: 'Log Score',
    noMilestones: 'No graded milestones recorded yet',
    noMilestonesHint: 'Log an assignment or exam score to plot your cumulative trajectory.',
    cumAvgLegend: 'Cumulative Avg',
    targetLegend: 'Target',
    courseStanding: 'Course Standing',
    courseStandingHint: 'Select any course to inspect assignments or simulate final scores',
    manageAll: 'Manage all',
    noCoursesYet: 'No courses added yet.',
    addFirstCourse: 'Add First Course',
    colCourse: 'Course',
    colCurrent: 'Current',
    colTarget: 'Target',
    colStatus: 'Status',
    crUnit: 'cr',
    personalizedFocus: 'Personalized Focus',
    tailoredToGaps: 'Tailored to your current grade gaps',
    refresh: 'Refresh',
    analyzing: 'Analyzing...',
    openFullPlan: 'Open full study plan',
    askAdvisor: 'Ask Advisor',
    addSubject: 'Add Subject',
  },
  courses: {
    emptyTitle: 'No courses in your schedule',
    emptyDesc: 'Add your enrolled courses and target grades to start tracking weighted averages and simulated final scores.',
    addFirstCourse: 'Add First Course',
    enrolledCourses: 'Enrolled Courses',
    addCourse: 'Add Course',
    editCourse: 'Edit Course',
    targetLabel: 'Target',
    currentStanding: 'Current Standing',
    gradedWeight: 'Graded Weight',
    neededOnRemaining: 'Needed on Remaining',
    complete: 'Complete',
    stretch: 'Stretch',
    secured: 'Secured',
    simulatorPrefix: 'Grade Simulator — If you average',
    simulatorMiddle: 'on the remaining',
    simulatorSuffix: 'of coursework:',
    projectedFinal: 'Projected Final',
    filterAll: 'All',
    filterPlaceholder: 'Filter topic or title...',
    addGrade: 'Add Grade',
    noAssignments: 'No assignments logged for this course yet.',
    noMatchingAssignments: 'No assignments match your current filter.',
    logFirstAssignment: 'Log First Assignment',
    colAssessment: 'Assessment & Topic',
    colDate: 'Date',
    colWeight: 'Weight',
    colScore: 'Score',
    colActions: 'Actions',
    review: 'Review',
    generalReview: 'General review',
    unassignedInstructor: 'Instructor unassigned',
    creditsWord: 'credits',
    passShort: 'Pass',
  },
  studyPlan: {
    title: 'Personalized Learning Plan',
    tasksCompleted: 'tasks completed',
    lastUpdated: 'Last updated',
    addTask: 'Add Task',
    generateWithGemini: 'Generate with Gemini',
    analyzingGrades: 'Analyzing Grades...',
    courseLabel: 'Course',
    generalCourse: 'General',
    focusTopicLabel: 'Focus Topic',
    focusPlaceholder: 'e.g. Practice Eigenvalue proofs',
    notesLabel: 'Notes / Method',
    notesPlaceholder: 'Optional action step',
    minsLabel: 'Mins',
    save: 'Save',
    allItems: 'All Items',
    remaining: 'Remaining',
    completed: 'Completed',
    itemsCount: 'items',
    noTasks: 'No study tasks in this view.',
    minUnit: 'min',
    timerBtn: 'Timer',
    coachMeBtn: 'Coach Me',
    focusTimerTitle: 'Study Focus Timer',
    defaultTimerTask: 'Focused Study Session',
    pause: 'Pause',
    startSession: 'Start Session',
  },
  advisor: {
    title: 'Gemini Academic Advisor',
    subtitlePrefix: 'Grounded in your live grade ledger and GPA target',
    newThread: 'New Thread',
    emptyTitle: 'Ask about grade targets, weak topics, or study schedules',
    emptyDesc: 'Every response reads your current assignments, credit weights, and target gaps automatically.',
    suggestedPrompts: 'Suggested starting prompts',
    advisorLabel: 'Students Choice Advisor',
    thinking: 'Thinking...',
    inputPlaceholder: 'Ask for a study strategy, practice quiz, or GPA recovery plan...',
    promptTargetMath: (code, target) =>
      `What exact score do I need on remaining ${code} coursework to reach ${target}%, and how should I study for it?`,
    promptQuizMe: (topic, code) =>
      `Quiz me with 3 practice questions on ${topic} for ${code}.`,
    promptSchedule: (first, second) =>
      `Build a balanced 5-day study schedule prioritizing ${first} and ${second}.`,
    promptDefault: 'How can I structure my weekly study blocks to reach my target GPA?',
  },
  modals: {
    cancel: 'Cancel',
    save: 'Save',
    saveChanges: 'Save Changes',
    addCourse: 'Add Course',
    editCourseTitle: 'Edit',
    codeLabel: 'Code',
    courseTitleLabel: 'Course Title',
    instructorLabel: 'Instructor',
    creditsLabel: 'Credits',
    targetGradeLabel: 'Target Grade (%)',
    editEntryTitle: 'Edit Graded Entry',
    logEntryTitle: 'Log Graded Entry',
    titleLabel: 'Title',
    categoryLabel: 'Category',
    dateLabel: 'Date',
    scoreLabel: 'Score',
    maxPointsLabel: 'Max Points',
    weightLabel: 'Weight (%)',
    topicLabel: 'Key Concept / Topic Covered',
    saveGrade: 'Save Grade',
    profileTitle: 'Student Profile & Goals',
    fullNameLabel: 'Full Name',
    majorLabel: 'Major / Program',
    termLabel: 'Academic Term',
    targetGpaLabel: 'Target GPA (4.0)',
    restoreSample: 'Restore Sample Semester',
    geminiReviewTitle: 'Gemini Concept Review',
    tryAgain: 'Try Again',
    coreRefresher: 'Core Concept Refresher',
    commonPitfall: 'Common Pitfall to Avoid',
    examHeuristic: 'Exam Verification Heuristic',
    practiceCheck: 'Practice Check',
    hintLabel: 'Hint',
    hideSolution: 'Hide Solution',
    revealSolution: 'Reveal Solution',
    quickPresetsLabel: 'Indonesian Curriculum Presets (Optional)',
    customSubjectHint: 'Or type any custom college subject below:',
    startBlank: 'Clear All Subjects',
    profilePhotoLabel: 'Profile Picture',
    uploadPhoto: 'Upload Photo',
    removePhoto: 'Remove',
    photoUrlPlaceholder: 'Or paste an image URL...',
    passingGradeLabel: 'Passing Grade',
    passingMinLabel: 'Min (%)',
  },
  files: {
    title: 'Subject Materials',
    subtitle: 'Upload syllabi, lecture notes, PDFs, or slides so Study Plan and Academic Advisor stay aligned with your course.',
    attachBtn: 'Attach File',
    subjectSelectLabel: 'Subject',
    allSubjects: 'General / All Subjects',
    supportedFormats: 'PDF, TXT, MD, CSV, PNG, JPG (max 1 GB)',
    emptyHint: 'No subject files attached yet.',
    activeSummary: (count) => `${count} file${count === 1 ? '' : 's'} active for Gemini`,
    removeFile: 'Remove file',
    fileTooLarge: 'File exceeds the 1 GB size limit.',
    unsupportedType: 'Unsupported file format. Please upload PDF, TXT, MD, CSV, or an image.',
    maxFilesReached: 'Maximum of 40 total files attached. Remove one to add another.',
    promptFromFiles: 'Summarize the key topics and create practice questions based on my uploaded subject files.',
    topicInputLabel: 'Topic',
    topicPlaceholder: 'Topic label (optional, e.g. Week 3: Eigenvalues)',
    subjectMaterialsTitle: 'Topic PDFs & Study Materials',
    subjectMaterialsSubtitle: 'Store topic PDFs and notes for this subject. Automatically synced with Study Plan, Concept Review, and Academic Advisor.',
    emptySubjectHint: 'No topic PDFs stored for this subject yet.',
    attachPdfBtn: 'Add Topic PDF',
    openFile: 'View',
    downloadFile: 'Download',
    askAdvisorFile: 'Ask Advisor',
    previewUnavailable: 'Large binary PDFs (>500 KB) stay cached on the uploading device. Smaller PDFs (<500 KB) and text notes sync in full across devices.',
    maxPerSubjectReached: 'Maximum of 6 topic files per subject reached. Remove one to add another.',
    pdfsCountShort: (count) => `${count} ${count === 1 ? 'file' : 'files'}`,
    promptForSubjectFile: (courseCode, topicOrName) =>
      `Explain the key concepts and create 3 practice questions from my ${courseCode} material "${topicOrName}".`,
  },
  auth: {
    signIn: 'Sign In',
    signInGoogle: 'Sign in with Google',
    signingIn: 'Signing in...',
    signOut: 'Sign Out',
    syncedLabel: 'Cloud synced',
    localOnlyLabel: 'Local only · Sign in to keep data',
    syncErrorTitle: 'Cloud sync error',
    accountSectionTitle: 'Student Account & Cloud Sync',
    accountSignedOutHint: 'Sign in with Google to save your grades, study plans, and subject files safely across devices.',
    accountSignedInHint: 'Your grades, study plan, advisor history, and materials are automatically saved to your account.',
  },
  semesters: {
    all: 'All Semesters',
    short: (n) => {
      if (n === 1) return '1st';
      if (n === 2) return '2nd';
      if (n === 3) return '3rd';
      return `${n}th`;
    },
    full: (n) => `Semester ${n}`,
    more: 'More',
    extendedTitle: 'Extended Semesters (9+)',
    semesterLabel: 'Semester',
    semesterGpa: 'Semester GPA',
    cumulativeGpaShort: 'Cumulative GPA',
    emptySemester: 'No subjects logged for this semester yet.',
    addInSemester: (n) => `Add Subject to Semester ${n}`,
    gpaChartTitle: 'GPA Across All Semesters',
    gpaChartSubtitle: 'Semester GPA (bars) & cumulative GPA progression (line)',
    ipsLegend: 'Semester GPA',
    ipkLegend: 'Cumulative GPA',
    noGradedSemesters: 'Log a grade in any semester to plot GPA across terms',
    coursesUnit: 'subjects',
  },
};

const ID: Translations = {
  nav: {
    overview: 'Ringkasan',
    courses: 'Mata Kuliah & Nilai',
    studyPlan: 'Rencana Belajar',
    advisor: 'Penasihat Akademik',
    appearance: 'Tampilan',
    language: 'Bahasa',
    dark: 'Gelap',
    light: 'Terang',
    targetLabel: 'Target',
  },
  header: {
    addGrade: 'Tambah Nilai',
    openMenu: 'Buka menu navigasi',
    closeMenu: 'Tutup menu navigasi',
  },
  status: {
    strong: 'Sangat Baik',
    onTrack: 'Sesuai Jalur',
    needsFocus: 'Perlu Fokus',
    atRisk: 'Berisiko',
    pending: 'Menunggu',
    highPriority: 'Prioritas Tinggi',
    mediumFocus: 'Fokus Sedang',
    maintain: 'Pertahankan',
  },
  overview: {
    cumulativeGpa: 'IPK Kumulatif',
    goalSuffix: 'target',
    aboveTarget: 'di atas target',
    toTarget: 'menuju target',
    weightedAverage: 'Rata-rata Tertimbang',
    acrossCourses: 'mata kuliah aktif',
    enrolledCredits: 'Total SKS',
    creditsUnit: 'SKS',
    studyPlanProgress: 'Progres Rencana Belajar',
    completedUnit: 'selesai',
    personalizedActionItems: 'Tugas belajar personal',
    gradeTrajectory: 'Lintasan Nilai',
    trajectorySubtitle: 'Performa kumulatif tertimbang SKS di seluruh tugas yang dinilai',
    logScore: 'Catat Nilai',
    noMilestones: 'Belum ada nilai yang dicatat',
    noMilestonesHint: 'Catat nilai tugas atau ujian untuk melihat grafik lintasan belajar Anda.',
    cumAvgLegend: 'Rata-rata Kumulatif',
    targetLegend: 'Target',
    courseStanding: 'Posisi Mata Kuliah',
    courseStandingHint: 'Pilih mata kuliah untuk melihat detail tugas atau simulasi nilai akhir',
    manageAll: 'Kelola semua',
    noCoursesYet: 'Belum ada mata kuliah.',
    addFirstCourse: 'Tambah Mata Kuliah Pertama',
    colCourse: 'Mata Kuliah',
    colCurrent: 'Saat Ini',
    colTarget: 'Target',
    colStatus: 'Status',
    crUnit: 'SKS',
    personalizedFocus: 'Fokus Personal',
    tailoredToGaps: 'Disesuaikan dengan selisih nilai Anda',
    refresh: 'Perbarui',
    analyzing: 'Menganalisis...',
    openFullPlan: 'Buka rencana lengkap',
    askAdvisor: 'Tanya Penasihat',
    addSubject: 'Tambah Mata Kuliah',
  },
  courses: {
    emptyTitle: 'Belum ada mata kuliah',
    emptyDesc: 'Tambahkan mata kuliah dan target nilai Anda untuk melacak rata-rata tertimbang dan simulasi nilai akhir.',
    addFirstCourse: 'Tambah Mata Kuliah Pertama',
    enrolledCourses: 'Mata Kuliah Aktif',
    addCourse: 'Tambah',
    editCourse: 'Edit Mata Kuliah',
    targetLabel: 'Target',
    currentStanding: 'Nilai Saat Ini',
    gradedWeight: 'Bobot Dinilai',
    neededOnRemaining: 'Dibutuhkan pada Sisa',
    complete: 'Selesai',
    stretch: 'Tantangan',
    secured: 'Tercapai',
    simulatorPrefix: 'Simulator Nilai — Jika rata-rata Anda',
    simulatorMiddle: 'pada sisa',
    simulatorSuffix: 'bobot penilaian:',
    projectedFinal: 'Proyeksi Akhir',
    filterAll: 'Semua',
    filterPlaceholder: 'Cari topik atau judul...',
    addGrade: 'Tambah Nilai',
    noAssignments: 'Belum ada tugas yang dicatat untuk mata kuliah ini.',
    noMatchingAssignments: 'Tidak ada tugas yang sesuai filter.',
    logFirstAssignment: 'Catat Tugas Pertama',
    colAssessment: 'Penilaian & Topik',
    colDate: 'Tanggal',
    colWeight: 'Bobot',
    colScore: 'Skor',
    colActions: 'Aksi',
    review: 'Ulas',
    generalReview: 'Ulasan umum',
    unassignedInstructor: 'Dosen belum diisi',
    creditsWord: 'SKS',
    passShort: 'Lulus',
  },
  studyPlan: {
    title: 'Rencana Belajar Personal',
    tasksCompleted: 'tugas selesai',
    lastUpdated: 'Diperbarui',
    addTask: 'Tambah Tugas',
    generateWithGemini: 'Buat dengan Gemini',
    analyzingGrades: 'Menganalisis Nilai...',
    courseLabel: 'Mata Kuliah',
    generalCourse: 'Umum',
    focusTopicLabel: 'Topik Fokus',
    focusPlaceholder: 'mis. Latihan pembuktian Eigenvalue',
    notesLabel: 'Catatan / Metode',
    notesPlaceholder: 'Langkah belajar opsional',
    minsLabel: 'Menit',
    save: 'Simpan',
    allItems: 'Semua',
    remaining: 'Tersisa',
    completed: 'Selesai',
    itemsCount: 'item',
    noTasks: 'Belum ada tugas belajar di tampilan ini.',
    minUnit: 'mnt',
    timerBtn: 'Timer',
    coachMeBtn: 'Bimbing Saya',
    focusTimerTitle: 'Timer Fokus Belajar',
    defaultTimerTask: 'Sesi Belajar Terfokus',
    pause: 'Jeda',
    startSession: 'Mulai Sesi',
  },
  advisor: {
    title: 'Penasihat Akademik Gemini',
    subtitlePrefix: 'Terhubung langsung dengan catatan nilai dan target IPK Anda',
    newThread: 'Percakapan Baru',
    emptyTitle: 'Tanyakan target nilai, topik sulit, atau jadwal belajar',
    emptyDesc: 'Setiap jawaban membaca tugas, bobot SKS, dan selisih target Anda secara otomatis.',
    suggestedPrompts: 'Saran pertanyaan awal',
    advisorLabel: 'Penasihat Students Choice',
    thinking: 'Sedang berpikir...',
    inputPlaceholder: 'Minta strategi belajar, kuis latihan, atau rencana perbaikan IPK...',
    promptTargetMath: (code, target) =>
      `Berapa skor tepat yang saya butuhkan pada sisa penilaian ${code} untuk mencapai ${target}%, dan bagaimana cara mempelajarinya?`,
    promptQuizMe: (topic, code) =>
      `Beri saya 3 soal latihan tentang ${topic} untuk mata kuliah ${code}.`,
    promptSchedule: (first, second) =>
      `Susun jadwal belajar 5 hari yang seimbang dengan memprioritaskan ${first} dan ${second}.`,
    promptDefault: 'Bagaimana cara menyusun blok belajar mingguan untuk mencapai target IPK saya?',
  },
  modals: {
    cancel: 'Batal',
    save: 'Simpan',
    saveChanges: 'Simpan Perubahan',
    addCourse: 'Tambah Mata Kuliah',
    editCourseTitle: 'Edit',
    codeLabel: 'Kode',
    courseTitleLabel: 'Nama Mata Kuliah',
    instructorLabel: 'Dosen',
    creditsLabel: 'SKS',
    targetGradeLabel: 'Target Nilai (%)',
    editEntryTitle: 'Edit Catatan Nilai',
    logEntryTitle: 'Catat Nilai Baru',
    titleLabel: 'Judul',
    categoryLabel: 'Kategori',
    dateLabel: 'Tanggal',
    scoreLabel: 'Nilai',
    maxPointsLabel: 'Nilai Maksimal',
    weightLabel: 'Bobot (%)',
    topicLabel: 'Konsep / Topik Utama',
    saveGrade: 'Simpan Nilai',
    profileTitle: 'Profil & Target Mahasiswa',
    fullNameLabel: 'Nama Lengkap',
    majorLabel: 'Jurusan / Program',
    termLabel: 'Semester',
    targetGpaLabel: 'Target IPK (4.0)',
    restoreSample: 'Pulihkan Data Contoh',
    geminiReviewTitle: 'Ulasan Konsep Gemini',
    tryAgain: 'Coba Lagi',
    coreRefresher: 'Ringkasan Konsep Inti',
    commonPitfall: 'Kesalahan Umum yang Harus Dihindari',
    examHeuristic: 'Tips Verifikasi Saat Ujian',
    practiceCheck: 'Latihan Pemahaman',
    hintLabel: 'Petunjuk',
    hideSolution: 'Sembunyikan Jawaban',
    revealSolution: 'Lihat Jawaban',
    quickPresetsLabel: 'Template Kurikulum Indonesia (Opsional)',
    customSubjectHint: 'Atau ketik mata kuliah bebas sesuai prodi Anda:',
    startBlank: 'Kosongkan Mata Kuliah',
    profilePhotoLabel: 'Foto Profil',
    uploadPhoto: 'Unggah Foto',
    removePhoto: 'Hapus',
    photoUrlPlaceholder: 'Atau tempel URL gambar...',
    passingGradeLabel: 'Standar Kelulusan',
    passingMinLabel: 'Min (%)',
  },
  files: {
    title: 'Materi Mata Kuliah',
    subtitle: 'Unggah RPS, silabus, catatan kuliah, PDF, atau slide agar Rencana Belajar dan Penasihat Akademik tetap relevan.',
    attachBtn: 'Lampirkan File',
    subjectSelectLabel: 'Mata Kuliah',
    allSubjects: 'Umum / Semua Mata Kuliah',
    supportedFormats: 'PDF, TXT, MD, CSV, PNG, JPG (maks 1 GB)',
    emptyHint: 'Belum ada file materi yang dilampirkan.',
    activeSummary: (count) => `${count} file materi aktif untuk Gemini`,
    removeFile: 'Hapus file',
    fileTooLarge: 'Ukuran file melebihi batas 1 GB.',
    unsupportedType: 'Format file tidak didukung. Gunakan PDF, TXT, MD, CSV, atau gambar.',
    maxFilesReached: 'Maksimal 40 file materi tersimpan. Hapus salah satu untuk menambah lagi.',
    promptFromFiles: 'Ringkas topik utama dan buatkan soal latihan berdasarkan file materi kuliah yang saya unggah.',
    topicInputLabel: 'Topik',
    topicPlaceholder: 'Nama topik (opsional, mis. Bab 3: Pancasila)',
    subjectMaterialsTitle: 'PDF Topik & Materi Mata Kuliah',
    subjectMaterialsSubtitle: 'Simpan PDF topik dan catatan untuk mata kuliah ini. Otomatis terhubung ke Rencana Belajar, Ulasan Konsep, dan Penasihat Akademik.',
    emptySubjectHint: 'Belum ada PDF topik yang disimpan untuk mata kuliah ini.',
    attachPdfBtn: 'Tambah PDF Topik',
    openFile: 'Lihat',
    downloadFile: 'Unduh',
    askAdvisorFile: 'Tanya Penasihat',
    previewUnavailable: 'PDF berukuran besar (>500 KB) tersimpan di perangkat pengunggah. PDF <500 KB dan catatan teks tersinkron penuh lintas perangkat.',
    maxPerSubjectReached: 'Maksimal 6 file topik per mata kuliah. Hapus satu file untuk menambah lagi.',
    pdfsCountShort: (count) => `${count} file`,
    promptForSubjectFile: (courseCode, topicOrName) =>
      `Jelaskan konsep inti dan buatkan 3 soal latihan dari materi ${courseCode} "${topicOrName}".`,
  },
  auth: {
    signIn: 'Masuk',
    signInGoogle: 'Masuk dengan Google',
    signingIn: 'Sedang masuk...',
    signOut: 'Keluar',
    syncedLabel: 'Tersinkron ke cloud',
    localOnlyLabel: 'Lokal saja · Masuk agar data tersimpan',
    syncErrorTitle: 'Gangguan sinkronisasi cloud',
    accountSectionTitle: 'Akun Mahasiswa & Sinkronisasi Cloud',
    accountSignedOutHint: 'Masuk dengan Google agar nilai, rencana belajar, dan file materi Anda tersimpan aman lintas perangkat.',
    accountSignedInHint: 'Nilai, rencana belajar, riwayat penasihat, dan file materi Anda tersimpan otomatis ke akun Anda.',
  },
  semesters: {
    all: 'Semua',
    short: (n) => `Sem ${n}`,
    full: (n) => `Semester ${n}`,
    more: 'Lainnya',
    extendedTitle: 'Semester Lanjutan (9+)',
    semesterLabel: 'Semester',
    semesterGpa: 'IP Semester (IPS)',
    cumulativeGpaShort: 'IPK Kumulatif',
    emptySemester: 'Belum ada mata kuliah di semester ini.',
    addInSemester: (n) => `Tambah Mata Kuliah Semester ${n}`,
    gpaChartTitle: 'Grafik IP per Semester',
    gpaChartSubtitle: 'Perbandingan IP Semester (IPS) dan tren IPK Kumulatif',
    ipsLegend: 'IP Semester (IPS)',
    ipkLegend: 'IPK Kumulatif',
    noGradedSemesters: 'Catat nilai di semester mana pun untuk menampilkan grafik IP',
    coursesUnit: 'matkul',
  },
};

const ES: Translations = {
  nav: {
    overview: 'Resumen',
    courses: 'Cursos y Notas',
    studyPlan: 'Plan de Estudio',
    advisor: 'Asesor Académico',
    appearance: 'Apariencia',
    language: 'Idioma',
    dark: 'Oscuro',
    light: 'Claro',
    targetLabel: 'Meta',
  },
  header: {
    addGrade: 'Añadir Nota',
    openMenu: 'Abrir menú de navegación',
    closeMenu: 'Cerrar menú de navegación',
  },
  status: {
    strong: 'Sobresaliente',
    onTrack: 'En Camino',
    needsFocus: 'Requiere Enfoque',
    atRisk: 'En Riesgo',
    pending: 'Pendiente',
    highPriority: 'Prioridad Alta',
    mediumFocus: 'Enfoque Medio',
    maintain: 'Mantener',
  },
  overview: {
    cumulativeGpa: 'Promedio Acumulado',
    goalSuffix: 'meta',
    aboveTarget: 'sobre la meta',
    toTarget: 'para la meta',
    weightedAverage: 'Media Ponderada',
    acrossCourses: 'cursos activos',
    enrolledCredits: 'Créditos Inscritos',
    creditsUnit: 'créditos',
    studyPlanProgress: 'Progreso del Plan',
    completedUnit: 'completado',
    personalizedActionItems: 'Tareas personalizadas',
    gradeTrajectory: 'Trayectoria Académica',
    trajectorySubtitle: 'Rendimiento acumulado ponderado por créditos en evaluaciones calificadas',
    logScore: 'Registrar Nota',
    noMilestones: 'Aún no hay evaluaciones registradas',
    noMilestonesHint: 'Registra una tarea o examen para visualizar tu trayectoria.',
    cumAvgLegend: 'Promedio Acumulado',
    targetLegend: 'Meta',
    courseStanding: 'Estado por Curso',
    courseStandingHint: 'Selecciona un curso para ver entregas o simular calificaciones finales',
    manageAll: 'Ver todos',
    noCoursesYet: 'Aún no hay cursos.',
    addFirstCourse: 'Añadir Primer Curso',
    colCourse: 'Curso',
    colCurrent: 'Actual',
    colTarget: 'Meta',
    colStatus: 'Estado',
    crUnit: 'cr',
    personalizedFocus: 'Enfoque Personalizado',
    tailoredToGaps: 'Adaptado a tus brechas actuales',
    refresh: 'Actualizar',
    analyzing: 'Analizando...',
    openFullPlan: 'Abrir plan completo',
    askAdvisor: 'Consultar Asesor',
    addSubject: 'Añadir Materia',
  },
  courses: {
    emptyTitle: 'Sin cursos en tu horario',
    emptyDesc: 'Añade tus cursos y metas para calcular medias ponderadas y simular notas finales.',
    addFirstCourse: 'Añadir Primer Curso',
    enrolledCourses: 'Cursos Inscritos',
    addCourse: 'Nuevo Curso',
    editCourse: 'Editar Curso',
    targetLabel: 'Meta',
    currentStanding: 'Nota Actual',
    gradedWeight: 'Peso Calificado',
    neededOnRemaining: 'Necesario en Restante',
    complete: 'Completo',
    stretch: 'Exigente',
    secured: 'Asegurado',
    simulatorPrefix: 'Simulador — Si promedias',
    simulatorMiddle: 'en el',
    simulatorSuffix: 'restante del curso:',
    projectedFinal: 'Proyección Final',
    filterAll: 'Todos',
    filterPlaceholder: 'Filtrar tema o título...',
    addGrade: 'Añadir Nota',
    noAssignments: 'No hay evaluaciones registradas en este curso.',
    noMatchingAssignments: 'Ninguna evaluación coincide con el filtro.',
    logFirstAssignment: 'Registrar Primera Nota',
    colAssessment: 'Evaluación y Tema',
    colDate: 'Fecha',
    colWeight: 'Peso',
    colScore: 'Nota',
    colActions: 'Acciones',
    review: 'Repasar',
    generalReview: 'Repaso general',
    unassignedInstructor: 'Sin docente asignado',
    creditsWord: 'créditos',
    passShort: 'Aprob.',
  },
  studyPlan: {
    title: 'Plan de Estudio Personalizado',
    tasksCompleted: 'tareas completadas',
    lastUpdated: 'Actualizado',
    addTask: 'Añadir Tarea',
    generateWithGemini: 'Generar con Gemini',
    analyzingGrades: 'Analizando Notas...',
    courseLabel: 'Curso',
    generalCourse: 'General',
    focusTopicLabel: 'Tema de Enfoque',
    focusPlaceholder: 'ej. Practicar valores propios',
    notesLabel: 'Notas / Método',
    notesPlaceholder: 'Paso de estudio opcional',
    minsLabel: 'Min',
    save: 'Guardar',
    allItems: 'Todos',
    remaining: 'Pendientes',
    completed: 'Completados',
    itemsCount: 'elementos',
    noTasks: 'No hay tareas en esta vista.',
    minUnit: 'min',
    timerBtn: 'Temporizador',
    coachMeBtn: 'Guíame',
    focusTimerTitle: 'Temporizador de Estudio',
    defaultTimerTask: 'Sesión de Estudio Enfocado',
    pause: 'Pausar',
    startSession: 'Iniciar Sesión',
  },
  advisor: {
    title: 'Asesor Académico Gemini',
    subtitlePrefix: 'Basado en tu registro real de notas y meta de promedio',
    newThread: 'Nuevo Hilo',
    emptyTitle: 'Pregunta sobre metas, temas difíciles o horarios de estudio',
    emptyDesc: 'Cada respuesta consulta tus entregas, créditos y brechas actuales automáticamente.',
    suggestedPrompts: 'Sugerencias para empezar',
    advisorLabel: 'Asesor Students Choice',
    thinking: 'Pensando...',
    inputPlaceholder: 'Pide una estrategia, cuestionario de práctica o plan de mejora...',
    promptTargetMath: (code, target) =>
      `¿Qué puntuación exacta necesito en lo que resta de ${code} para llegar al ${target}%, y cómo debo estudiarlo?`,
    promptQuizMe: (topic, code) =>
      `Hazme 3 preguntas de práctica sobre ${topic} para ${code}.`,
    promptSchedule: (first, second) =>
      `Crea un horario equilibrado de 5 días priorizando ${first} y ${second}.`,
    promptDefault: '¿Cómo puedo organizar mis bloques semanales de estudio para alcanzar mi meta?',
  },
  modals: {
    cancel: 'Cancelar',
    save: 'Guardar',
    saveChanges: 'Guardar Cambios',
    addCourse: 'Añadir Curso',
    editCourseTitle: 'Editar',
    codeLabel: 'Código',
    courseTitleLabel: 'Nombre del Curso',
    instructorLabel: 'Docente',
    creditsLabel: 'Créditos',
    targetGradeLabel: 'Meta (%)',
    editEntryTitle: 'Editar Evaluación',
    logEntryTitle: 'Registrar Evaluación',
    titleLabel: 'Título',
    categoryLabel: 'Categoría',
    dateLabel: 'Fecha',
    scoreLabel: 'Nota',
    maxPointsLabel: 'Puntos Máx.',
    weightLabel: 'Peso (%)',
    topicLabel: 'Concepto / Tema Principal',
    saveGrade: 'Guardar Nota',
    profileTitle: 'Perfil y Metas del Estudiante',
    fullNameLabel: 'Nombre Completo',
    majorLabel: 'Carrera / Programa',
    termLabel: 'Período Académico',
    targetGpaLabel: 'Meta de Promedio (4.0)',
    restoreSample: 'Restaurar Datos de Ejemplo',
    geminiReviewTitle: 'Repaso Conceptual Gemini',
    tryAgain: 'Reintentar',
    coreRefresher: 'Resumen del Concepto',
    commonPitfall: 'Error Común a Evitar',
    examHeuristic: 'Consejo de Verificación',
    practiceCheck: 'Práctica Rápida',
    hintLabel: 'Pista',
    hideSolution: 'Ocultar Solución',
    revealSolution: 'Ver Solución',
    quickPresetsLabel: 'Plantillas Curriculares (Opcional)',
    customSubjectHint: 'O escribe cualquier materia universitaria:',
    startBlank: 'Vaciar Materias',
    profilePhotoLabel: 'Foto de Perfil',
    uploadPhoto: 'Subir Foto',
    removePhoto: 'Quitar',
    photoUrlPlaceholder: 'O pega una URL de imagen...',
    passingGradeLabel: 'Nota Mínima Aprobatoria',
    passingMinLabel: 'Mín (%)',
  },
  files: {
    title: 'Materiales de la Materia',
    subtitle: 'Sube programas, apuntes, PDF o diapositivas para que el Plan de Estudio y el Asesor se mantengan relevantes.',
    attachBtn: 'Adjuntar Archivo',
    subjectSelectLabel: 'Materia',
    allSubjects: 'General / Todas las Materias',
    supportedFormats: 'PDF, TXT, MD, CSV, PNG, JPG (máx. 1 GB)',
    emptyHint: 'Aún no hay archivos adjuntos.',
    activeSummary: (count) => `${count} archivo${count === 1 ? '' : 's'} activo${count === 1 ? '' : 's'} para Gemini`,
    removeFile: 'Eliminar archivo',
    fileTooLarge: 'El archivo supera el límite de 1 GB.',
    unsupportedType: 'Formato no compatible. Sube PDF, TXT, MD, CSV o una imagen.',
    maxFilesReached: 'Máximo de 40 archivos adjuntos. Elimina uno para añadir otro.',
    promptFromFiles: 'Resume los temas clave y crea preguntas de práctica basadas en mis archivos subidos.',
    topicInputLabel: 'Tema',
    topicPlaceholder: 'Etiqueta del tema (opcional, ej. Semana 3)',
    subjectMaterialsTitle: 'PDFs por Tema y Materiales',
    subjectMaterialsSubtitle: 'Guarda PDFs de temas y apuntes para esta materia. Integrado con el Plan de Estudio, Repaso y Asesor.',
    emptySubjectHint: 'Aún no hay PDFs de temas guardados para esta materia.',
    attachPdfBtn: 'Añadir PDF de Tema',
    openFile: 'Ver',
    downloadFile: 'Descargar',
    askAdvisorFile: 'Consultar Asesor',
    previewUnavailable: 'Los PDF grandes (>500 KB) se guardan en caché local en el dispositivo de origen. Los menores a 500 KB se sincronizan completos en la nube.',
    maxPerSubjectReached: 'Máximo de 6 archivos por materia. Elimina uno para añadir otro.',
    pdfsCountShort: (count) => `${count} ${count === 1 ? 'archivo' : 'archivos'}`,
    promptForSubjectFile: (courseCode, topicOrName) =>
      `Explica los conceptos clave y crea 3 preguntas de práctica basadas en mi material de ${courseCode} "${topicOrName}".`,
  },
  auth: {
    signIn: 'Iniciar Sesión',
    signInGoogle: 'Continuar con Google',
    signingIn: 'Iniciando sesión...',
    signOut: 'Cerrar Sesión',
    syncedLabel: 'Sincronizado en la nube',
    localOnlyLabel: 'Solo local · Inicia sesión para guardar',
    syncErrorTitle: 'Error de sincronización',
    accountSectionTitle: 'Cuenta del Estudiante y Nube',
    accountSignedOutHint: 'Inicia sesión con Google para guardar tus notas, planes y archivos de forma segura.',
    accountSignedInHint: 'Tus notas, plan de estudio, historial y archivos se guardan automáticamente en tu cuenta.',
  },
  semesters: {
    all: 'Todos',
    short: (n) => `${n}.º`,
    full: (n) => `Semestre ${n}`,
    more: 'Más',
    extendedTitle: 'Semestres Adicionales (9+)',
    semesterLabel: 'Semestre',
    semesterGpa: 'Promedio Semestral',
    cumulativeGpaShort: 'Promedio Acumulado',
    emptySemester: 'Aún no hay materias en este semestre.',
    addInSemester: (n) => `Añadir Materia al Semestre ${n}`,
    gpaChartTitle: 'Promedio por Semestre',
    gpaChartSubtitle: 'Promedio semestral (barras) y tendencia acumulada (línea)',
    ipsLegend: 'Promedio Semestral',
    ipkLegend: 'Promedio Acumulado',
    noGradedSemesters: 'Registra una nota para graficar el promedio por semestre',
    coursesUnit: 'materias',
  },
};

const FR: Translations = {
  nav: {
    overview: 'Aperçu',
    courses: 'Cours & Notes',
    studyPlan: "Plan d'Étude",
    advisor: 'Conseiller Académique',
    appearance: 'Apparence',
    language: 'Langue',
    dark: 'Sombre',
    light: 'Clair',
    targetLabel: 'Objectif',
  },
  header: {
    addGrade: 'Ajouter Note',
    openMenu: 'Ouvrir le menu',
    closeMenu: 'Fermer le menu',
  },
  status: {
    strong: 'Excellent',
    onTrack: 'En Bonne Voie',
    needsFocus: 'À Renforcer',
    atRisk: 'À Risque',
    pending: 'En Attente',
    highPriority: 'Priorité Haute',
    mediumFocus: 'Priorité Moyenne',
    maintain: 'Maintenir',
  },
  overview: {
    cumulativeGpa: 'Moyenne Cumulée',
    goalSuffix: 'objectif',
    aboveTarget: "au-dessus de l'objectif",
    toTarget: "de l'objectif",
    weightedAverage: 'Moyenne Pondérée',
    acrossCourses: 'cours actifs',
    enrolledCredits: 'Crédits Inscrits',
    creditsUnit: 'crédits',
    studyPlanProgress: 'Avancement du Plan',
    completedUnit: 'terminées',
    personalizedActionItems: "Actions d'étude personnalisées",
    gradeTrajectory: 'Trajectoire des Notes',
    trajectorySubtitle: 'Performance cumulée pondérée par les crédits',
    logScore: 'Saisir Note',
    noMilestones: 'Aucune évaluation enregistrée',
    noMilestonesHint: 'Ajoutez une note pour tracer votre progression.',
    cumAvgLegend: 'Moyenne Cumulée',
    targetLegend: 'Objectif',
    courseStanding: 'Situation par Cours',
    courseStandingHint: 'Sélectionnez un cours pour voir les devoirs ou simuler la note finale',
    manageAll: 'Tout gérer',
    noCoursesYet: 'Aucun cours ajouté.',
    addFirstCourse: 'Ajouter un Cours',
    colCourse: 'Cours',
    colCurrent: 'Actuel',
    colTarget: 'Objectif',
    colStatus: 'Statut',
    crUnit: 'cr',
    personalizedFocus: 'Priorités Personnalisées',
    tailoredToGaps: 'Adaptées à vos écarts actuels',
    refresh: 'Actualiser',
    analyzing: 'Analyse...',
    openFullPlan: 'Ouvrir le plan complet',
    askAdvisor: 'Parler au Conseiller',
    addSubject: 'Ajouter Matière',
  },
  courses: {
    emptyTitle: 'Aucun cours enregistré',
    emptyDesc: 'Ajoutez vos cours et objectifs pour suivre vos moyennes pondérées.',
    addFirstCourse: 'Ajouter un Cours',
    enrolledCourses: 'Cours Inscrits',
    addCourse: 'Ajouter',
    editCourse: 'Modifier',
    targetLabel: 'Objectif',
    currentStanding: 'Note Actuelle',
    gradedWeight: 'Poids Évalué',
    neededOnRemaining: 'Requis sur le Reste',
    complete: 'Terminé',
    stretch: 'Ambitieux',
    secured: 'Acquis',
    simulatorPrefix: 'Simulateur — Avec une moyenne de',
    simulatorMiddle: 'sur les',
    simulatorSuffix: 'restants du cours :',
    projectedFinal: 'Note Finale Projetée',
    filterAll: 'Tous',
    filterPlaceholder: 'Filtrer par sujet...',
    addGrade: 'Ajouter Note',
    noAssignments: 'Aucune évaluation pour ce cours.',
    noMatchingAssignments: 'Aucune évaluation correspondante.',
    logFirstAssignment: 'Ajouter une Évaluation',
    colAssessment: 'Évaluation & Sujet',
    colDate: 'Date',
    colWeight: 'Poids',
    colScore: 'Note',
    colActions: 'Actions',
    review: 'Réviser',
    generalReview: 'Révision générale',
    unassignedInstructor: 'Enseignant non renseigné',
    creditsWord: 'crédits',
    passShort: 'Seuil',
  },
  studyPlan: {
    title: "Plan d'Apprentissage Personnalisé",
    tasksCompleted: 'tâches terminées',
    lastUpdated: 'Mis à jour',
    addTask: 'Ajouter Tâche',
    generateWithGemini: 'Générer avec Gemini',
    analyzingGrades: 'Analyse en cours...',
    courseLabel: 'Cours',
    generalCourse: 'Général',
    focusTopicLabel: 'Sujet Ciblé',
    focusPlaceholder: 'ex. Réviser les valeurs propres',
    notesLabel: 'Notes / Méthode',
    notesPlaceholder: 'Étape optionnelle',
    minsLabel: 'Min',
    save: 'Enregistrer',
    allItems: 'Tout',
    remaining: 'Restantes',
    completed: 'Terminées',
    itemsCount: 'éléments',
    noTasks: 'Aucune tâche dans cette vue.',
    minUnit: 'min',
    timerBtn: 'Minuteur',
    coachMeBtn: 'M’aider',
    focusTimerTitle: 'Minuteur de Concentration',
    defaultTimerTask: "Session d'Étude",
    pause: 'Pause',
    startSession: 'Démarrer',
  },
  advisor: {
    title: 'Conseiller Académique Gemini',
    subtitlePrefix: 'Connecté à vos notes en direct et à votre objectif',
    newThread: 'Nouvelle Discussion',
    emptyTitle: 'Posez vos questions sur vos objectifs, notions difficiles ou planning',
    emptyDesc: 'Chaque réponse analyse vos évaluations, crédits et écarts actuels.',
    suggestedPrompts: 'Suggestions pour démarrer',
    advisorLabel: 'Conseiller Students Choice',
    thinking: 'Réflexion...',
    inputPlaceholder: 'Demandez une stratégie, un quiz ou un plan de rattrapage...',
    promptTargetMath: (code, target) =>
      `Quelle note exacte me faut-il sur le reste de ${code} pour atteindre ${target}%, et comment réviser ?`,
    promptQuizMe: (topic, code) =>
      `Pose-moi 3 questions d'entraînement sur ${topic} pour ${code}.`,
    promptSchedule: (first, second) =>
      `Construis un planning de 5 jours équilibré en priorisant ${first} et ${second}.`,
    promptDefault: 'Comment organiser mes séances hebdomadaires pour atteindre mon objectif ?',
  },
  modals: {
    cancel: 'Annuler',
    save: 'Enregistrer',
    saveChanges: 'Enregistrer',
    addCourse: 'Ajouter Cours',
    editCourseTitle: 'Modifier',
    codeLabel: 'Code',
    courseTitleLabel: 'Intitulé du Cours',
    instructorLabel: 'Enseignant',
    creditsLabel: 'Crédits',
    targetGradeLabel: 'Objectif (%)',
    editEntryTitle: 'Modifier Évaluation',
    logEntryTitle: 'Nouvelle Évaluation',
    titleLabel: 'Titre',
    categoryLabel: 'Catégorie',
    dateLabel: 'Date',
    scoreLabel: 'Note',
    maxPointsLabel: 'Barème Max',
    weightLabel: 'Poids (%)',
    topicLabel: 'Notion / Sujet Abordé',
    saveGrade: 'Enregistrer',
    profileTitle: 'Profil & Objectifs',
    fullNameLabel: 'Nom Complet',
    majorLabel: 'Filière / Programme',
    termLabel: 'Semestre',
    targetGpaLabel: 'Objectif (4.0)',
    restoreSample: "Restaurer l'Exemple",
    geminiReviewTitle: 'Fiche de Révision Gemini',
    tryAgain: 'Réessayer',
    coreRefresher: 'Rappel du Concept',
    commonPitfall: 'Erreur Fréquente à Éviter',
    examHeuristic: 'Astuce de Vérification',
    practiceCheck: 'Exercices Rapides',
    hintLabel: 'Indice',
    hideSolution: 'Masquer la Réponse',
    revealSolution: 'Voir la Réponse',
    quickPresetsLabel: 'Modèles de Cours (Optionnel)',
    customSubjectHint: 'Ou saisissez librement votre matière :',
    startBlank: 'Tout Effacer',
    profilePhotoLabel: 'Photo de Profil',
    uploadPhoto: 'Importer Photo',
    removePhoto: 'Supprimer',
    photoUrlPlaceholder: "Ou collez une URL d'image...",
    passingGradeLabel: 'Note de Passage',
    passingMinLabel: 'Min (%)',
  },
  files: {
    title: 'Supports de Cours',
    subtitle: 'Importez syllabus, notes, PDF ou diapositives pour aligner le Plan d’Étude et le Conseiller sur votre cours.',
    attachBtn: 'Joindre un Fichier',
    subjectSelectLabel: 'Matière',
    allSubjects: 'Général / Toutes les Matières',
    supportedFormats: 'PDF, TXT, MD, CSV, PNG, JPG (max 1 Go)',
    emptyHint: 'Aucun support de cours joint.',
    activeSummary: (count) => `${count} fichier${count === 1 ? '' : 's'} actif${count === 1 ? '' : 's'} pour Gemini`,
    removeFile: 'Supprimer le fichier',
    fileTooLarge: 'Le fichier dépasse la limite de 1 Go.',
    unsupportedType: 'Format non pris en charge. Utilisez PDF, TXT, MD, CSV ou une image.',
    maxFilesReached: 'Maximum de 40 fichiers atteints. Supprimez-en un pour continuer.',
    promptFromFiles: 'Résume les notions clés et crée des questions d’entraînement à partir de mes fichiers joints.',
    topicInputLabel: 'Thème',
    topicPlaceholder: 'Nom du thème (optionnel, ex. Chapitre 3)',
    subjectMaterialsTitle: 'PDF par Thème & Supports',
    subjectMaterialsSubtitle: 'Stockez vos PDF de cours pour cette matière. Synchronisés avec le Plan d’Étude, les Fiches et le Conseiller.',
    emptySubjectHint: 'Aucun PDF de thème enregistré pour cette matière.',
    attachPdfBtn: 'Ajouter PDF',
    openFile: 'Voir',
    downloadFile: 'Télécharger',
    askAdvisorFile: 'Conseiller',
    previewUnavailable: 'Les PDF volumineux (>500 Ko) restent stockés localement sur l’appareil d’origine. Les PDF <500 Ko sont synchronisés dans le cloud.',
    maxPerSubjectReached: 'Maximum de 6 fichiers par matière atteint. Supprimez-en un pour continuer.',
    pdfsCountShort: (count) => `${count} ${count === 1 ? 'fichier' : 'fichiers'}`,
    promptForSubjectFile: (courseCode, topicOrName) =>
      `Explique les points essentiels et propose 3 exercices à partir du support ${courseCode} "${topicOrName}".`,
  },
  auth: {
    signIn: 'Connexion',
    signInGoogle: 'Se connecter avec Google',
    signingIn: 'Connexion...',
    signOut: 'Déconnexion',
    syncedLabel: 'Synchronisé dans le cloud',
    localOnlyLabel: 'Local uniquement · Connectez-vous',
    syncErrorTitle: 'Erreur de synchronisation',
    accountSectionTitle: 'Compte Étudiant & Sauvegarde',
    accountSignedOutHint: 'Connectez-vous avec Google pour conserver vos notes, plans et fichiers sur tous vos appareils.',
    accountSignedInHint: 'Vos notes, plans, discussions et supports sont enregistrés automatiquement sur votre compte.',
  },
  semesters: {
    all: 'Tous',
    short: (n) => `S${n}`,
    full: (n) => `Semestre ${n}`,
    more: 'Plus',
    extendedTitle: 'Semestres Supplémentaires (9+)',
    semesterLabel: 'Semestre',
    semesterGpa: 'Moyenne Semestrielle',
    cumulativeGpaShort: 'Moyenne Cumulée',
    emptySemester: 'Aucun cours enregistré pour ce semestre.',
    addInSemester: (n) => `Ajouter un Cours au S${n}`,
    gpaChartTitle: 'Moyenne par Semestre',
    gpaChartSubtitle: 'Moyenne semestrielle (barres) et cumulée (courbe)',
    ipsLegend: 'Moyenne Semestrielle',
    ipkLegend: 'Moyenne Cumulée',
    noGradedSemesters: 'Saisissez une note pour tracer les moyennes semestrielles',
    coursesUnit: 'matières',
  },
};

const ZH: Translations = {
  nav: {
    overview: '总览',
    courses: '课程与成绩',
    studyPlan: '学习计划',
    advisor: '学业顾问',
    appearance: '外观',
    language: '语言',
    dark: '深色',
    light: '浅色',
    targetLabel: '目标',
  },
  header: {
    addGrade: '录入成绩',
    openMenu: '打开导航菜单',
    closeMenu: '关闭导航菜单',
  },
  status: {
    strong: '优秀',
    onTrack: '达标中',
    needsFocus: '需加强',
    atRisk: '有风险',
    pending: '待定',
    highPriority: '高优先级',
    mediumFocus: '中等关注',
    maintain: '保持优势',
  },
  overview: {
    cumulativeGpa: '累计绩点 (GPA)',
    goalSuffix: '目标',
    aboveTarget: '高于目标',
    toTarget: '距离目标',
    weightedAverage: '加权平均分',
    acrossCourses: '门在修课程',
    enrolledCredits: '已选学分',
    creditsUnit: '学分',
    studyPlanProgress: '学习计划进度',
    completedUnit: '已完成',
    personalizedActionItems: '个性化学习任务',
    gradeTrajectory: '成绩趋势轨迹',
    trajectorySubtitle: '按学分与权重计算的学期累计成绩走势',
    logScore: '记录分数',
    noMilestones: '暂无已评分记录',
    noMilestonesHint: '录入作业或考试成绩即可绘制您的学业趋势图。',
    cumAvgLegend: '累计均分',
    targetLegend: '目标线',
    courseStanding: '各科成绩概览',
    courseStandingHint: '点击任意课程查看作业明细或模拟期末成绩',
    manageAll: '管理全部',
    noCoursesYet: '尚未添加课程。',
    addFirstCourse: '添加第一门课程',
    colCourse: '课程',
    colCurrent: '当前成绩',
    colTarget: '目标',
    colStatus: '状态',
    crUnit: '学分',
    personalizedFocus: '重点改进建议',
    tailoredToGaps: '根据当前成绩差距定制',
    refresh: '刷新建议',
    analyzing: '分析中...',
    openFullPlan: '查看完整学习计划',
    askAdvisor: '咨询顾问',
    addSubject: '添加课程',
  },
  courses: {
    emptyTitle: '课程表暂无课程',
    emptyDesc: '添加您的课程与目标分数，即可追踪加权均分与期末成绩模拟。',
    addFirstCourse: '添加第一门课程',
    enrolledCourses: '在修课程',
    addCourse: '添加课程',
    editCourse: '编辑课程',
    targetLabel: '目标',
    currentStanding: '当前成绩',
    gradedWeight: '已评权重',
    neededOnRemaining: '剩余部分需达',
    complete: '已全部评分',
    stretch: '较高挑战',
    secured: '已稳获',
    simulatorPrefix: '成绩模拟器 — 若剩余',
    simulatorMiddle: '考核平均得分',
    simulatorSuffix: '：',
    projectedFinal: '预计总评',
    filterAll: '全部',
    filterPlaceholder: '筛选知识点或名称...',
    addGrade: '录入成绩',
    noAssignments: '该课程暂无成绩记录。',
    noMatchingAssignments: '没有符合筛选条件的记录。',
    logFirstAssignment: '录入第一条成绩',
    colAssessment: '考核项目与知识点',
    colDate: '日期',
    colWeight: '权重',
    colScore: '得分',
    colActions: '操作',
    review: '复习',
    generalReview: '综合复习',
    unassignedInstructor: '未填写教师',
    creditsWord: '学分',
    passShort: '及格线',
  },
  studyPlan: {
    title: '个性化学习计划',
    tasksCompleted: '项任务已完成',
    lastUpdated: '更新于',
    addTask: '添加任务',
    generateWithGemini: '用 Gemini 生成',
    analyzingGrades: '正在分析成绩...',
    courseLabel: '课程',
    generalCourse: '通用',
    focusTopicLabel: '重点主题',
    focusPlaceholder: '例如：练习特征值与对角化证明',
    notesLabel: '备注 / 方法',
    notesPlaceholder: '可选学习步骤',
    minsLabel: '分钟',
    save: '保存',
    allItems: '全部',
    remaining: '待完成',
    completed: '已完成',
    itemsCount: '项',
    noTasks: '当前筛选下暂无学习任务。',
    minUnit: '分钟',
    timerBtn: '计时器',
    coachMeBtn: '辅导我',
    focusTimerTitle: '专注学习计时器',
    defaultTimerTask: '专注学习时段',
    pause: '暂停',
    startSession: '开始专注',
  },
  advisor: {
    title: 'Gemini 学业顾问',
    subtitlePrefix: '已同步您的实时成绩单与 GPA 目标',
    newThread: '新对话',
    emptyTitle: '询问提分策略、薄弱知识点或复习计划',
    emptyDesc: '每次回答都会自动结合您当前的作业得分、学分权重与目标差距。',
    suggestedPrompts: '推荐提问',
    advisorLabel: 'Students Choice 顾问',
    thinking: '思考中...',
    inputPlaceholder: '输入问题，获取提分建议、练习题或复习时间表...',
    promptTargetMath: (code, target) =>
      `我在 ${code} 剩余考核中需要考到多少分才能达到 ${target}%？我该如何高效复习？`,
    promptQuizMe: (topic, code) =>
      `请针对 ${code} 的「${topic}」给我出 3 道练习题。`,
    promptSchedule: (first, second) =>
      `请为我制定一份平衡的 5 天复习计划，优先提升 ${first} 和 ${second}。`,
    promptDefault: '我该如何安排每周学习时段以达成目标 GPA？',
  },
  modals: {
    cancel: '取消',
    save: '保存',
    saveChanges: '保存修改',
    addCourse: '添加课程',
    editCourseTitle: '编辑',
    codeLabel: '课程代码',
    courseTitleLabel: '课程名称',
    instructorLabel: '授课教师',
    creditsLabel: '学分',
    targetGradeLabel: '目标分数 (%)',
    editEntryTitle: '编辑成绩记录',
    logEntryTitle: '录入新成绩',
    titleLabel: '名称',
    categoryLabel: '类型',
    dateLabel: '日期',
    scoreLabel: '得分',
    maxPointsLabel: '满分',
    weightLabel: '权重 (%)',
    topicLabel: '核心知识点 / 主题',
    saveGrade: '保存成绩',
    profileTitle: '学生资料与目标',
    fullNameLabel: '姓名',
    majorLabel: '专业',
    termLabel: '学期',
    targetGpaLabel: '目标 GPA (4.0)',
    restoreSample: '恢复示例学期数据',
    geminiReviewTitle: 'Gemini 知识点精讲',
    tryAgain: '重试',
    coreRefresher: '核心概念回顾',
    commonPitfall: '常见易错点',
    examHeuristic: '考场检查技巧',
    practiceCheck: '巩固练习',
    hintLabel: '提示',
    hideSolution: '隐藏解析',
    revealSolution: '查看解析',
    quickPresetsLabel: '常见必修课程模板（可选）',
    customSubjectHint: '或在下方自由输入任意大学课程：',
    startBlank: '清空全部课程',
    profilePhotoLabel: '个人头像',
    uploadPhoto: '上传照片',
    removePhoto: '移除',
    photoUrlPlaceholder: '或粘贴图片链接...',
    passingGradeLabel: '及格等级',
    passingMinLabel: '最低分 (%)',
  },
  files: {
    title: '课程学习资料',
    subtitle: '上传教学大纲、讲义、PDF 或笔记，让学习计划与学业顾问始终紧扣您的课程内容。',
    attachBtn: '上传文件',
    subjectSelectLabel: '所属课程',
    allSubjects: '通用 / 全部课程',
    supportedFormats: '支持 PDF, TXT, MD, CSV, PNG, JPG（单文件上限 1 GB）',
    emptyHint: '尚未上传课程资料文件。',
    activeSummary: (count) => `已有 ${count} 份课程文件接入 Gemini`,
    removeFile: '移除文件',
    fileTooLarge: '文件大小超过 1 GB 上限。',
    unsupportedType: '不支持的文件格式，请上传 PDF、TXT、MD、CSV 或图片。',
    maxFilesReached: '最多可保存 40 份课程文件，请先移除部分文件后再添加。',
    promptFromFiles: '请根据我上传的课程文件总结重点知识，并生成几道练习题。',
    topicInputLabel: '主题',
    topicPlaceholder: '主题标签（可选，如：第3周 特征值）',
    subjectMaterialsTitle: '分主题 PDF 与学习资料',
    subjectMaterialsSubtitle: '为本课程按主题保存讲义 PDF 与笔记，自动同步至学习计划、知识点精讲与学业顾问。',
    emptySubjectHint: '该课程尚未保存任何主题 PDF。',
    attachPdfBtn: '添加主题 PDF',
    openFile: '查看',
    downloadFile: '下载',
    askAdvisorFile: '问顾问',
    previewUnavailable: '大于 500 KB 的 PDF 仅缓存在上传设备的本地存储中；小于 500 KB 的 PDF 和文本笔记可跨设备完整同步。',
    maxPerSubjectReached: '单门课程最多保存 6 份主题文件，请先移除一份后再添加。',
    pdfsCountShort: (count) => `${count} 份资料`,
    promptForSubjectFile: (courseCode, topicOrName) =>
      `请基于我上传的 ${courseCode} 资料「${topicOrName}」梳理核心知识点，并出 3 道练习题。`,
  },
  auth: {
    signIn: '登录账号',
    signInGoogle: '使用 Google 登录',
    signingIn: '登录中...',
    signOut: '退出登录',
    syncedLabel: '已云端同步',
    localOnlyLabel: '仅本地保存 · 登录以防数据丢失',
    syncErrorTitle: '云同步异常',
    accountSectionTitle: '学生账号与云端保存',
    accountSignedOutHint: '使用 Google 登录，将您的成绩、学习计划与课程资料安全保存至云端并支持跨设备同步。',
    accountSignedInHint: '您的成绩记录、学习计划、顾问对话与课程资料已自动保存至您的账号。',
  },
  semesters: {
    all: '全部学期',
    short: (n) => `第${n}学期`,
    full: (n) => `第 ${n} 学期`,
    more: '更多',
    extendedTitle: '延修学期 (第 9 学期起)',
    semesterLabel: '所属学期',
    semesterGpa: '本学期 GPA',
    cumulativeGpaShort: '累计总 GPA',
    emptySemester: '该学期尚未添加任何课程。',
    addInSemester: (n) => `添加第 ${n} 学期课程`,
    gpaChartTitle: '各学期 GPA 走势图',
    gpaChartSubtitle: '每学期 GPA（柱状）与累计 GPA 趋势（折线）',
    ipsLegend: '学期 GPA',
    ipkLegend: '累计 GPA',
    noGradedSemesters: '录入任意学期成绩后即可查看各学期 GPA 图表',
    coursesUnit: '门课',
  },
};

const JA: Translations = {
  nav: {
    overview: '概要',
    courses: '科目と成績',
    studyPlan: '学習計画',
    advisor: '学習アドバイザー',
    appearance: 'テーマ',
    language: '言語',
    dark: 'ダーク',
    light: 'ライト',
    targetLabel: '目標',
  },
  header: {
    addGrade: '成績を追加',
    openMenu: 'メニューを開く',
    closeMenu: 'メニューを閉じる',
  },
  status: {
    strong: '優秀',
    onTrack: '順調',
    needsFocus: '要強化',
    atRisk: '要注意',
    pending: '未確定',
    highPriority: '最優先',
    mediumFocus: '中優先',
    maintain: '維持',
  },
  overview: {
    cumulativeGpa: '累積 GPA',
    goalSuffix: '目標',
    aboveTarget: '目標達成中',
    toTarget: '目標まで',
    weightedAverage: '加重平均',
    acrossCourses: '履修科目',
    enrolledCredits: '履修単位数',
    creditsUnit: '単位',
    studyPlanProgress: '学習計画の進捗',
    completedUnit: '完了',
    personalizedActionItems: '個別学習タスク',
    gradeTrajectory: '成績推移',
    trajectorySubtitle: '単位数と配点ウェイトを加味した累積平均の推移',
    logScore: '点数を記録',
    noMilestones: '記録された成績がまだありません',
    noMilestonesHint: '課題や試験の点数を記録すると推移グラフが表示されます。',
    cumAvgLegend: '累積平均',
    targetLegend: '目標',
    courseStanding: '科目別の状況',
    courseStandingHint: '科目を選択して課題の詳細や最終成績シミュレーションを確認',
    manageAll: 'すべて管理',
    noCoursesYet: '科目が登録されていません。',
    addFirstCourse: '最初の科目を追加',
    colCourse: '科目',
    colCurrent: '現在',
    colTarget: '目標',
    colStatus: '状態',
    crUnit: '単位',
    personalizedFocus: '重点学習アドバイス',
    tailoredToGaps: '目標との差に基づく推奨事項',
    refresh: '更新',
    analyzing: '分析中...',
    openFullPlan: '学習計画を開く',
    askAdvisor: '相談する',
    addSubject: '科目を追加',
  },
  courses: {
    emptyTitle: '履修科目がありません',
    emptyDesc: '科目と目標成績を登録して、加重平均や最終スコアの予測を始めましょう。',
    addFirstCourse: '最初の科目を追加',
    enrolledCourses: '履修科目',
    addCourse: '科目追加',
    editCourse: '科目を編集',
    targetLabel: '目標',
    currentStanding: '現在の成績',
    gradedWeight: '採点済み比率',
    neededOnRemaining: '残りで必要な点',
    complete: '完了',
    stretch: '難関',
    secured: '達成確定',
    simulatorPrefix: '予測シミュレーター — 残り',
    simulatorMiddle: 'の平均点が',
    simulatorSuffix: 'の場合：',
    projectedFinal: '最終予想',
    filterAll: 'すべて',
    filterPlaceholder: 'トピックや課題名で検索...',
    addGrade: '成績を追加',
    noAssignments: 'この科目にはまだ課題が登録されていません。',
    noMatchingAssignments: '一致する課題がありません。',
    logFirstAssignment: '最初の成績を記録',
    colAssessment: '評価項目・トピック',
    colDate: '日付',
    colWeight: '配点',
    colScore: '得点',
    colActions: '操作',
    review: '復習',
    generalReview: '全般の復習',
    unassignedInstructor: '担当教員未設定',
    creditsWord: '単位',
    passShort: '合格基準',
  },
  studyPlan: {
    title: 'パーソナライズ学習計画',
    tasksCompleted: '件完了',
    lastUpdated: '最終更新',
    addTask: 'タスク追加',
    generateWithGemini: 'Gemini で生成',
    analyzingGrades: '成績を分析中...',
    courseLabel: '科目',
    generalCourse: '全般',
    focusTopicLabel: '重点トピック',
    focusPlaceholder: '例：固有値と対角化の演習',
    notesLabel: 'メモ / 手法',
    notesPlaceholder: '任意の手順',
    minsLabel: '分',
    save: '保存',
    allItems: 'すべて',
    remaining: '未完了',
    completed: '完了済み',
    itemsCount: '件',
    noTasks: 'この表示に学習タスクはありません。',
    minUnit: '分',
    timerBtn: 'タイマー',
    coachMeBtn: '個別指導',
    focusTimerTitle: '集中学習タイマー',
    defaultTimerTask: '集中学習セッション',
    pause: '一時停止',
    startSession: '開始',
  },
  advisor: {
    title: 'Gemini 学習アドバイザー',
    subtitlePrefix: '最新の成績データと目標 GPA に連動',
    newThread: '新しいスレッド',
    emptyTitle: '目標達成や苦手単元、学習スケジュールについて質問',
    emptyDesc: '現在の課題スコア、単位数、目標との差を自動的に踏まえて回答します。',
    suggestedPrompts: 'おすすめの質問',
    advisorLabel: 'Students Choice アドバイザー',
    thinking: '思考中...',
    inputPlaceholder: '学習戦略、練習問題、成績挽回プランなどを質問...',
    promptTargetMath: (code, target) =>
      `${code} で目標の ${target}% に到達するには残りの評価で何点必要ですか？効果的な勉強法も教えてください。`,
    promptQuizMe: (topic, code) =>
      `${code} の「${topic}」について練習問題を 3 問出題してください。`,
    promptSchedule: (first, second) =>
      `${first} と ${second} を優先した 5 日間のバランスの良い学習スケジュールを作ってください。`,
    promptDefault: '目標 GPA を達成するための週間学習ブロックの組み方を教えてください。',
  },
  modals: {
    cancel: 'キャンセル',
    save: '保存',
    saveChanges: '変更を保存',
    addCourse: '科目を追加',
    editCourseTitle: '編集',
    codeLabel: '科目コード',
    courseTitleLabel: '科目名',
    instructorLabel: '担当教員',
    creditsLabel: '単位数',
    targetGradeLabel: '目標成績 (%)',
    editEntryTitle: '成績を編集',
    logEntryTitle: '成績を記録',
    titleLabel: 'タイトル',
    categoryLabel: '区分',
    dateLabel: '日付',
    scoreLabel: '得点',
    maxPointsLabel: '満点',
    weightLabel: '配点 (%)',
    topicLabel: '主なトピック / 単元',
    saveGrade: '成績を保存',
    profileTitle: '学生プロフィールと目標',
    fullNameLabel: '氏名',
    majorLabel: '専攻',
    termLabel: '学期',
    targetGpaLabel: '目標 GPA (4.0)',
    restoreSample: 'サンプルデータを復元',
    geminiReviewTitle: 'Gemini 単元レビュー',
    tryAgain: '再試行',
    coreRefresher: '重要ポイントの整理',
    commonPitfall: 'よくある間違い',
    examHeuristic: '試験での確認ポイント',
    practiceCheck: '確認問題',
    hintLabel: 'ヒント',
    hideSolution: '解答を隠す',
    revealSolution: '解答を見る',
    quickPresetsLabel: '履修科目テンプレート（任意）',
    customSubjectHint: 'または任意の大学科目を自由に入力してください：',
    startBlank: '科目をすべて削除',
    profilePhotoLabel: 'プロフィール写真',
    uploadPhoto: '写真をアップロード',
    removePhoto: '削除',
    photoUrlPlaceholder: 'または画像 URL を貼り付け...',
    passingGradeLabel: '合格基準グレード',
    passingMinLabel: '最低 (%)',
  },
  files: {
    title: '科目資料ファイル',
    subtitle: 'シラバス、講義ノート、PDF、スライドを添付すると、学習計画とアドバイザーの回答が授業内容に沿ったものになります。',
    attachBtn: 'ファイルを添付',
    subjectSelectLabel: '科目',
    allSubjects: '全般 / すべての科目',
    supportedFormats: 'PDF, TXT, MD, CSV, PNG, JPG（最大 1 GB）',
    emptyHint: '科目ファイルはまだ添付されていません。',
    activeSummary: (count) => `${count} 件の資料が Gemini に連携中`,
    removeFile: 'ファイルを削除',
    fileTooLarge: 'ファイルサイズが 1 GB を超えています。',
    unsupportedType: '非対応の形式です。PDF、TXT、MD、CSV、または画像をアップロードしてください。',
    maxFilesReached: '添付できるファイルは合計 40 件までです。追加するには 1 件削除してください。',
    promptFromFiles: 'アップロードした科目ファイルの内容を要約し、確認問題を作成してください。',
    topicInputLabel: 'トピック',
    topicPlaceholder: 'トピック名（任意・例：第3回 固有値）',
    subjectMaterialsTitle: 'トピック別 PDF・教材ファイル',
    subjectMaterialsSubtitle: 'この科目の講義 PDF やノートを保存します。学習計画・単元レビュー・アドバイザーと自動連携されます。',
    emptySubjectHint: 'この科目に保存されたトピック PDF はまだありません。',
    attachPdfBtn: 'トピック PDF を追加',
    openFile: '閲覧',
    downloadFile: '保存',
    askAdvisorFile: '相談する',
    previewUnavailable: '500 KB を超える PDF 本体はアップロード元の端末にローカル保存されます。500 KB 未満の PDF とテキスト資料は端末間で完全同期されます。',
    maxPerSubjectReached: '1 科目あたり最大 6 件まで添付できます。追加するには 1 件削除してください。',
    pdfsCountShort: (count) => `${count} 件の資料`,
    promptForSubjectFile: (courseCode, topicOrName) =>
      `${courseCode} の資料「${topicOrName}」の重要ポイントを整理し、確認問題を 3 問作成してください。`,
  },
  auth: {
    signIn: 'ログイン',
    signInGoogle: 'Google でログイン',
    signingIn: 'ログイン中...',
    signOut: 'ログアウト',
    syncedLabel: 'クラウド同期中',
    localOnlyLabel: 'ローカルのみ · ログインして保存',
    syncErrorTitle: '同期エラー',
    accountSectionTitle: '学生アカウントとクラウド保存',
    accountSignedOutHint: 'Google でログインすると、成績・学習計画・科目ファイルが安全に保存され、どの端末からでも利用できます。',
    accountSignedInHint: '成績、学習計画、相談履歴、科目ファイルはアカウントに自動保存されています。',
  },
  semesters: {
    all: '全学期',
    short: (n) => `${n}学期`,
    full: (n) => `第 ${n} 学期`,
    more: 'その他',
    extendedTitle: '延長学期 (9学期以降)',
    semesterLabel: '学期',
    semesterGpa: '今学期 GPA',
    cumulativeGpaShort: '累積 GPA',
    emptySemester: 'この学期にはまだ科目が登録されていません。',
    addInSemester: (n) => `${n}学期の科目を追加`,
    gpaChartTitle: '全学期の GPA 推移',
    gpaChartSubtitle: '学期別 GPA（棒グラフ）と累積 GPA 推移（折れ線）',
    ipsLegend: '今学期 GPA',
    ipkLegend: '累積 GPA',
    noGradedSemesters: '成績を記録すると全学期の GPA グラフが表示されます',
    coursesUnit: '科目',
  },
};

export const TRANSLATIONS: Record<LanguageCode, Translations> = {
  en: EN,
  id: ID,
  es: ES,
  fr: FR,
  zh: ZH,
  ja: JA,
};
