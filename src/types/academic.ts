export type AssignmentCategory = 'Exam' | 'Quiz' | 'Homework' | 'Lab' | 'Project';

export type LetterGrade = 'A' | 'AB' | 'B' | 'BC' | 'C' | 'D' | 'E';

export interface Assignment {
  id: string;
  title: string;
  category: AssignmentCategory;
  score: number;
  maxScore: number;
  weight: number; // percentage of course total (0-100)
  date: string; // YYYY-MM-DD
  topic: string;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  instructor: string;
  credits: number;
  targetGrade: number; // percentage (0-100)
  passingGrade?: LetterGrade; // minimum letter grade required to pass
  passingScore?: number; // numeric % threshold corresponding to passingGrade
  semester?: number; // 1-8 standard semesters, 9+ extended semesters
  assignments: Assignment[];
}

export interface StudentProfile {
  name: string;
  major: string;
  term: string;
  targetGpa: number;
  avatarUrl: string;
}

export interface StudyRecommendation {
  id: string;
  courseCode: string;
  courseName: string;
  priority: 'High' | 'Medium' | 'Maintain';
  focusArea: string;
  actionPlan: string;
  studyTechnique: string;
  estimatedMinutes: number;
  impactNote: string;
  completed: boolean;
}

export interface RecommendationPlan {
  diagnosis: string;
  generatedAt: string;
  recommendations: StudyRecommendation[];
}

export interface StudyGuideQuestion {
  question: string;
  hint: string;
  answer: string;
}

export interface StudyGuide {
  courseCode: string;
  assignmentTitle: string;
  topic: string;
  conceptRecap: string;
  commonMistake: string;
  actionableTip: string;
  practiceQuestions: StudyGuideQuestion[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

export interface SubjectFile {
  id: string;
  courseId: string;
  courseCode: string;
  topic?: string;
  name: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
  textContent?: string;
  base64Data?: string;
  geminiFileUri?: string;
}

export type SemesterFilter = 'ALL' | number;

export type ActiveTab = 'overview' | 'courses' | 'study-plan' | 'advisor';
