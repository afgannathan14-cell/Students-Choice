import { useRef, useState } from 'react';
import { ChevronDown, ChevronUp, Cloud, LogIn, LogOut, RotateCcw, Trash2, Upload, X } from 'lucide-react';
import { INDONESIAN_CURRICULUM_PRESETS } from '../data/initialData';
import { Translations } from '../i18n/translations';
import {
  Assignment,
  AssignmentCategory,
  Course,
  LetterGrade,
  StudentProfile,
  StudyGuide,
} from '../types/academic';
import { getCourseSemester, getDefaultPassingScore, LETTER_GRADE_SCALE } from '../utils/grades';

interface CourseModalProps {
  course: Course | null;
  defaultSemester?: number;
  t: Translations;
  onClose: () => void;
  onSave: (data: Omit<Course, 'id' | 'assignments'>, existingId?: string) => void;
}

const SEMESTER_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];

export function CourseModal({ course, defaultSemester = 1, t, onClose, onSave }: CourseModalProps) {
  const [code, setCode] = useState(course?.code || '');
  const [name, setName] = useState(course?.name || '');
  const [instructor, setInstructor] = useState(course?.instructor || '');
  const [credits, setCredits] = useState(course?.credits ?? 3);
  const [targetGrade, setTargetGrade] = useState(course?.targetGrade ?? 85);
  const [semester, setSemester] = useState<number>(
    course ? getCourseSemester(course) : Math.max(1, Math.min(14, defaultSemester))
  );
  const [passingGrade, setPassingGrade] = useState<LetterGrade>(course?.passingGrade || 'C');
  const [passingScore, setPassingScore] = useState<number>(
    typeof course?.passingScore === 'number'
      ? course.passingScore
      : getDefaultPassingScore(course?.passingGrade || 'C')
  );

  const handleSelectPassingGrade = (grade: LetterGrade) => {
    setPassingGrade(grade);
    setPassingScore(getDefaultPassingScore(grade));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) return;
    onSave(
      {
        code: code.trim().toUpperCase(),
        name: name.trim(),
        instructor: instructor.trim(),
        credits: Math.max(1, Math.min(8, credits)),
        targetGrade: Math.max(40, Math.min(100, targetGrade)),
        semester,
        passingGrade,
        passingScore: Math.max(0, Math.min(100, passingScore)),
      },
      course?.id
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/50">
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="font-display text-base font-semibold text-zinc-900 dark:text-zinc-50">
            {course ? `${t.modals.editCourseTitle} ${course.code}` : t.modals.addCourse}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {!course && (
            <div className="space-y-2 pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                {t.modals.quickPresetsLabel}
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {INDONESIAN_CURRICULUM_PRESETS.map((preset) => (
                  <button
                    key={preset.code}
                    type="button"
                    onClick={() => {
                      setCode(preset.code);
                      setName(preset.name);
                      setCredits(preset.credits);
                      setTargetGrade(preset.targetGrade);
                      setPassingGrade(preset.passingGrade);
                      setPassingScore(preset.passingScore);
                    }}
                    className="text-left px-2.5 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <span className="block text-xs font-medium text-zinc-900 dark:text-zinc-100 truncate">
                      {preset.name}
                    </span>
                    <span className="block text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                      {preset.code} · {preset.credits} SKS
                    </span>
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500 pt-1">
                {t.modals.customSubjectHint}
              </p>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                {t.modals.codeLabel}
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="PHYS 101"
                className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                {t.modals.courseTitleLabel}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Classical Mechanics"
                className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                {t.modals.instructorLabel}
              </label>
              <input
                type="text"
                value={instructor}
                onChange={(e) => setInstructor(e.target.value)}
                placeholder="Dr. Alan Turing"
                className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                {t.semesters.semesterLabel}
              </label>
              <select
                value={semester}
                onChange={(e) => setSemester(Number(e.target.value))}
                aria-label={t.semesters.semesterLabel}
                className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
              >
                {SEMESTER_OPTIONS.map((sem) => (
                  <option key={sem} value={sem}>
                    {t.semesters.full(sem)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                {t.modals.creditsLabel}
              </label>
              <input
                type="number"
                min={1}
                max={8}
                required
                value={credits}
                onChange={(e) => setCredits(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                {t.modals.targetGradeLabel}
              </label>
              <input
                type="number"
                min={40}
                max={100}
                required
                value={targetGrade}
                onChange={(e) => setTargetGrade(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                {t.modals.passingGradeLabel}
              </label>
              <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 tabular-nums">
                {passingGrade} ({passingScore}%)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 grid grid-cols-7 gap-1 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                {LETTER_GRADE_SCALE.map((rule) => {
                  const active = passingGrade === rule.grade;
                  return (
                    <button
                      key={rule.grade}
                      type="button"
                      onClick={() => handleSelectPassingGrade(rule.grade)}
                      className={`py-1.5 text-xs font-mono font-medium rounded-md transition-colors ${
                        active
                          ? 'bg-white text-indigo-700 shadow-xs dark:bg-zinc-700 dark:text-indigo-300'
                          : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
                      }`}
                    >
                      {rule.grade}
                    </button>
                  );
                })}
              </div>
              <div className="w-20 shrink-0">
                <input
                  type="number"
                  min={0}
                  max={100}
                  required
                  aria-label={t.modals.passingMinLabel}
                  title={t.modals.passingMinLabel}
                  value={passingScore}
                  onChange={(e) => setPassingScore(Number(e.target.value))}
                  className="w-full px-2.5 py-2 text-xs font-mono rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
            >
              {t.modals.cancel}
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium rounded-lg bg-indigo-700 text-white hover:bg-indigo-800"
            >
              {course ? t.modals.saveChanges : t.modals.addCourse}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface AssignmentModalProps {
  courses: Course[];
  initialCourseId: string;
  assignment: Assignment | null;
  t: Translations;
  onClose: () => void;
  onSave: (courseId: string, data: Omit<Assignment, 'id'>, existingId?: string) => void;
}

export function AssignmentModal({
  courses,
  initialCourseId,
  assignment,
  t,
  onClose,
  onSave,
}: AssignmentModalProps) {
  const [courseId, setCourseId] = useState(initialCourseId || courses[0]?.id || '');
  const [title, setTitle] = useState(assignment?.title || '');
  const [category, setCategory] = useState<AssignmentCategory>(assignment?.category || 'Exam');
  const [score, setScore] = useState(assignment?.score ?? 85);
  const [maxScore, setMaxScore] = useState(assignment?.maxScore ?? 100);
  const [weight, setWeight] = useState(assignment?.weight ?? 15);
  const [date, setDate] = useState(assignment?.date || new Date().toISOString().slice(0, 10));
  const [topic, setTopic] = useState(assignment?.topic || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId || !title.trim()) return;
    onSave(
      courseId,
      {
        title: title.trim(),
        category,
        score: Math.max(0, score),
        maxScore: Math.max(1, maxScore),
        weight: Math.max(0, Math.min(100, weight)),
        date,
        topic: topic.trim(),
      },
      assignment?.id
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/50">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="font-display text-base font-semibold text-zinc-900 dark:text-zinc-50">
            {assignment ? t.modals.editEntryTitle : t.modals.logEntryTitle}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {!assignment && (
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                {t.studyPlan.courseLabel}
              </label>
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} — {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              {t.modals.titleLabel}
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Midterm 2: Reaction Mechanisms"
              className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                {t.modals.categoryLabel}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as AssignmentCategory)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
              >
                <option value="Exam">Exam</option>
                <option value="Quiz">Quiz</option>
                <option value="Homework">Homework</option>
                <option value="Lab">Lab</option>
                <option value="Project">Project</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                {t.modals.dateLabel}
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                {t.modals.scoreLabel}
              </label>
              <input
                type="number"
                step="0.5"
                min={0}
                required
                value={score}
                onChange={(e) => setScore(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                {t.modals.maxPointsLabel}
              </label>
              <input
                type="number"
                step="0.5"
                min={1}
                required
                value={maxScore}
                onChange={(e) => setMaxScore(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                {t.modals.weightLabel}
              </label>
              <input
                type="number"
                step="0.5"
                min={0}
                max={100}
                required
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              {t.modals.topicLabel}
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. SN1 vs SN2 stereochemistry"
              className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
            >
              {t.modals.cancel}
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium rounded-lg bg-indigo-700 text-white hover:bg-indigo-800"
            >
              {assignment ? t.modals.saveChanges : t.modals.saveGrade}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface ProfileModalProps {
  profile: StudentProfile;
  authUser: { uid: string; email: string | null } | null;
  isAuthBusy: boolean;
  t: Translations;
  onClose: () => void;
  onSave: (updated: StudentProfile) => void;
  onSignIn: () => void;
  onSignOut: () => void;
  onResetSampleData: () => void;
  onClearAllCourses: () => void;
}

export function ProfileModal({
  profile,
  authUser,
  isAuthBusy,
  t,
  onClose,
  onSave,
  onSignIn,
  onSignOut,
  onResetSampleData,
  onClearAllCourses,
}: ProfileModalProps) {
  const [name, setName] = useState(profile.name);
  const [major, setMajor] = useState(profile.major);
  const [term, setTerm] = useState(profile.term);
  const [targetGpa, setTargetGpa] = useState(profile.targetGpa);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl);
  const [previewError, setPreviewError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const initials = (name || profile.name)
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const maxSide = 256;
        const size = Math.min(img.width, img.height);
        const sx = (img.width - size) / 2;
        const sy = (img.height - size) / 2;
        const canvas = document.createElement('canvas');
        canvas.width = maxSide;
        canvas.height = maxSide;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, sx, sy, size, size, 0, 0, maxSide, maxSide);
          const compressed = canvas.toDataURL('image/jpeg', 0.85);
          setAvatarUrl(compressed);
          setPreviewError(false);
        }
      };
      if (typeof reader.result === 'string') {
        img.src = reader.result;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      ...profile,
      name: name.trim(),
      major: major.trim(),
      term: term.trim(),
      targetGpa: Math.max(0, Math.min(4.0, targetGpa)),
      avatarUrl: avatarUrl.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/50">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="font-display text-base font-semibold text-zinc-900 dark:text-zinc-50">
            {t.modals.profileTitle}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[82vh] overflow-y-auto">
          <div className="p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                {t.auth.accountSectionTitle}
              </span>
              {authUser && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                  <Cloud className="h-3 w-3" aria-hidden="true" />
                  <span>{t.auth.syncedLabel}</span>
                </span>
              )}
            </div>
            {authUser ? (
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200 truncate">
                    {authUser.email || authUser.uid}
                  </p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                    {t.auth.accountSignedInHint}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onSignOut}
                  disabled={isAuthBusy}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-white dark:hover:bg-zinc-800 disabled:opacity-50 whitespace-nowrap shrink-0"
                >
                  <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{t.auth.signOut}</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  {t.auth.accountSignedOutHint}
                </p>
                <button
                  type="button"
                  onClick={onSignIn}
                  disabled={isAuthBusy}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg bg-indigo-700 text-white hover:bg-indigo-800 disabled:opacity-50 whitespace-nowrap"
                >
                  <LogIn className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{isAuthBusy ? t.auth.signingIn : t.auth.signInGoogle}</span>
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
            {!previewError && avatarUrl ? (
              <img
                src={avatarUrl}
                alt={`${name} preview`}
                referrerPolicy="no-referrer"
                onError={() => setPreviewError(true)}
                className="h-14 w-14 rounded-full object-cover border border-zinc-200 dark:border-zinc-700 shrink-0"
              />
            ) : (
              <div className="h-14 w-14 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-sm font-semibold text-zinc-700 dark:text-zinc-200 shrink-0">
                {initials || 'ST'}
              </div>
            )}

            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  aria-label={t.modals.uploadPhoto}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors whitespace-nowrap"
                >
                  <Upload className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{t.modals.uploadPhoto}</span>
                </button>
                {avatarUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setAvatarUrl('');
                      setPreviewError(false);
                    }}
                    className="px-2.5 py-1.5 text-xs font-medium rounded-lg text-zinc-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400 transition-colors whitespace-nowrap"
                  >
                    {t.modals.removePhoto}
                  </button>
                )}
              </div>
              <input
                type="url"
                value={avatarUrl.startsWith('data:') ? '' : avatarUrl}
                onChange={(e) => {
                  setAvatarUrl(e.target.value);
                  setPreviewError(false);
                }}
                placeholder={t.modals.photoUrlPlaceholder}
                aria-label={t.modals.profilePhotoLabel}
                className="w-full px-2.5 py-1 text-xs rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-200 placeholder:text-zinc-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              {t.modals.fullNameLabel}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              {t.modals.majorLabel}
            </label>
            <input
              type="text"
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                {t.modals.termLabel}
              </label>
              <input
                type="text"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                {t.modals.targetGpaLabel}
              </label>
              <input
                type="number"
                step="0.05"
                min={1.0}
                max={4.0}
                required
                value={targetGpa}
                onChange={(e) => setTargetGpa(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  onResetSampleData();
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{t.modals.restoreSample}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onClearAllCourses();
                  onClose();
                }}
                className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{t.modals.startBlank}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
              >
                {t.modals.cancel}
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-medium rounded-lg bg-indigo-700 text-white hover:bg-indigo-800"
              >
                {t.modals.save}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

interface StudyGuideDrawerProps {
  guide: StudyGuide | null;
  loading: boolean;
  error: string | null;
  contextTitle: string;
  t: Translations;
  onClose: () => void;
  onRetry: () => void;
}

export function StudyGuideDrawer({
  guide,
  loading,
  error,
  contextTitle,
  t,
  onClose,
  onRetry,
}: StudyGuideDrawerProps) {
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-zinc-950/40">
      <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 h-full overflow-y-auto flex flex-col">
        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 bg-white dark:bg-zinc-900 z-10">
          <div>
            <p className="text-xs font-medium text-indigo-700 dark:text-indigo-400">
              {t.modals.geminiReviewTitle}
            </p>
            <h2 className="font-display text-base font-semibold text-zinc-900 dark:text-zinc-50 mt-0.5">
              {contextTitle}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            aria-label="Close review drawer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-6 flex-1">
          {loading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-4 w-40 bg-zinc-200 dark:bg-zinc-800 rounded" />
              <div className="h-20 w-full bg-zinc-100 dark:bg-zinc-800/60 rounded-lg" />
              <div className="h-4 w-36 bg-zinc-200 dark:bg-zinc-800 rounded" />
              <div className="h-24 w-full bg-zinc-100 dark:bg-zinc-800/60 rounded-lg" />
            </div>
          ) : error ? (
            <div className="p-5 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/70 dark:bg-red-950/30 space-y-3">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              <button
                type="button"
                onClick={onRetry}
                className="px-3.5 py-1.5 text-xs font-medium rounded-lg bg-red-700 text-white hover:bg-red-800"
              >
                {t.modals.tryAgain}
              </button>
            </div>
          ) : guide ? (
            <>
              <div className="space-y-1.5">
                <h3 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                  {t.modals.coreRefresher}
                </h3>
                <p className="text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
                  {guide.conceptRecap}
                </p>
              </div>

              <div className="space-y-1.5 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <h3 className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                  {t.modals.commonPitfall}
                </h3>
                <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                  {guide.commonMistake}
                </p>
              </div>

              <div className="space-y-1.5 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <h3 className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  {t.modals.examHeuristic}
                </h3>
                <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                  {guide.actionableTip}
                </p>
              </div>

              <div className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <h3 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                  {t.modals.practiceCheck} ({guide.practiceQuestions.length})
                </h3>
                {guide.practiceQuestions.map((pq, idx) => {
                  const isShown = Boolean(revealed[idx]);
                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/30 space-y-2.5"
                    >
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {idx + 1}. {pq.question}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {t.modals.hintLabel}: {pq.hint}
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          setRevealed((prev) => ({ ...prev, [idx]: !prev[idx] }))
                        }
                        className="inline-flex items-center gap-1 text-xs font-medium text-indigo-700 dark:text-indigo-400 hover:underline"
                      >
                        {isShown ? (
                          <>
                            <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>{t.modals.hideSolution}</span>
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>{t.modals.revealSolution}</span>
                          </>
                        )}
                      </button>
                      {isShown && (
                        <div className="pt-2 border-t border-zinc-200 dark:border-zinc-700 text-xs leading-relaxed text-zinc-700 dark:text-zinc-200">
                          {pq.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
