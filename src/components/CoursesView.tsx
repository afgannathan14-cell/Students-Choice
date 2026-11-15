import { useMemo, useRef, useState } from 'react';
import {
  BookOpen,
  Eye,
  FileText,
  MessageSquare,
  Paperclip,
  Pencil,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { Translations } from '../i18n/translations';
import {
  Assignment,
  AssignmentCategory,
  Course,
  SemesterFilter,
  SubjectFile,
} from '../types/academic';
import {
  formatFileSize,
  MAX_FILES_PER_SUBJECT,
  MAX_SUBJECT_FILES,
  parseSubjectFile,
} from '../utils/fileStorage';
import {
  calculateCourseStats,
  calculateProjectedFinalGrade,
  calculateRequiredScoreForTarget,
  getCourseSemester,
  percentageToLetter,
} from '../utils/grades';
import { SemesterBar } from './SemesterBar';
import { StatusText } from './StatusText';
import { SubjectFileViewerModal } from './SubjectFileViewerModal';

interface CoursesViewProps {
  courses: Course[];
  subjectFiles: SubjectFile[];
  selectedCourseId: string;
  selectedSemester: SemesterFilter;
  t: Translations;
  onSelectSemester: (semester: SemesterFilter) => void;
  onSelectCourse: (id: string) => void;
  onAddCourse: () => void;
  onEditCourse: (course: Course) => void;
  onDeleteCourse: (courseId: string) => void;
  onClearAllCourses: () => void;
  onAddAssignment: (courseId: string) => void;
  onEditAssignment: (courseId: string, assignment: Assignment) => void;
  onDeleteAssignment: (courseId: string, assignmentId: string) => void;
  onOpenStudyGuide: (course: Course, assignment: Assignment) => void;
  onAddSubjectFiles: (files: SubjectFile[]) => void;
  onRemoveSubjectFile: (fileId: string) => void;
  onAskAdvisorAbout: (prompt: string) => void;
}

const CATEGORIES: Array<'All' | AssignmentCategory> = ['All', 'Exam', 'Quiz', 'Homework', 'Lab', 'Project'];

export function CoursesView({
  courses,
  subjectFiles,
  selectedCourseId,
  selectedSemester,
  t,
  onSelectSemester,
  onSelectCourse,
  onAddCourse,
  onEditCourse,
  onDeleteCourse,
  onClearAllCourses,
  onAddAssignment,
  onEditAssignment,
  onDeleteAssignment,
  onOpenStudyGuide,
  onAddSubjectFiles,
  onRemoveSubjectFile,
  onAskAdvisorAbout,
}: CoursesViewProps) {
  const [categoryFilter, setCategoryFilter] = useState<'All' | AssignmentCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [hypotheticalScore, setHypotheticalScore] = useState<number>(88);
  const [topicInput, setTopicInput] = useState('');
  const [fileUploadError, setFileUploadError] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<SubjectFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const visibleCourses = useMemo(
    () =>
      selectedSemester === 'ALL'
        ? courses
        : courses.filter((c) => getCourseSemester(c) === selectedSemester),
    [courses, selectedSemester]
  );

  const selectedCourse = useMemo(
    () => visibleCourses.find((c) => c.id === selectedCourseId) || visibleCourses[0] || null,
    [visibleCourses, selectedCourseId]
  );

  const stats = selectedCourse ? calculateCourseStats(selectedCourse) : null;
  const requiredOnRemaining =
    selectedCourse && stats
      ? calculateRequiredScoreForTarget(stats.currentPercentage, stats.completedWeight, selectedCourse.targetGrade)
      : null;

  const projectedGrade =
    stats && stats.remainingWeight > 0
      ? calculateProjectedFinalGrade(stats.currentPercentage, stats.completedWeight, hypotheticalScore)
      : stats?.currentPercentage ?? null;

  const filteredAssignments = useMemo(() => {
    if (!selectedCourse) return [];
    return [...selectedCourse.assignments]
      .sort((a, b) => b.date.localeCompare(a.date))
      .filter((a) => {
        const matchesCat = categoryFilter === 'All' || a.category === categoryFilter;
        const q = searchQuery.trim().toLowerCase();
        const matchesSearch =
          !q || a.title.toLowerCase().includes(q) || a.topic.toLowerCase().includes(q);
        return matchesCat && matchesSearch;
      });
  }, [selectedCourse, categoryFilter, searchQuery]);

  const selectedCourseFiles = useMemo(() => {
    if (!selectedCourse) return [];
    return subjectFiles.filter((f) => f.courseId === selectedCourse.id);
  }, [subjectFiles, selectedCourse]);

  const topicSuggestions = useMemo(() => {
    if (!selectedCourse) return [];
    return Array.from(
      new Set(
        selectedCourse.assignments
          .map((a) => a.topic.trim())
          .filter((topic) => topic.length > 0)
      )
    );
  }, [selectedCourse]);

  const handleSubjectPdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0 || !selectedCourse) return;

    setFileUploadError(null);
    const remainingTotalSlots = MAX_SUBJECT_FILES - subjectFiles.length;
    if (remainingTotalSlots <= 0) {
      setFileUploadError(t.files.maxFilesReached);
      e.target.value = '';
      return;
    }

    const remainingSubjectSlots = MAX_FILES_PER_SUBJECT - selectedCourseFiles.length;
    if (remainingSubjectSlots <= 0) {
      setFileUploadError(t.files.maxPerSubjectReached);
      e.target.value = '';
      return;
    }

    const allowedSlots = Math.min(remainingTotalSlots, remainingSubjectSlots);
    const parsed: SubjectFile[] = [];

    for (const file of Array.from(fileList).slice(0, allowedSlots)) {
      try {
        const item = await parseSubjectFile(file, selectedCourse, topicInput);
        parsed.push(item);
      } catch (err) {
        const code = err instanceof Error ? err.message : '';
        if (code === 'FILE_TOO_LARGE') {
          setFileUploadError(t.files.fileTooLarge);
        } else {
          setFileUploadError(t.files.unsupportedType);
        }
      }
    }

    if (fileList.length > allowedSlots) {
      setFileUploadError(
        remainingSubjectSlots < remainingTotalSlots
          ? t.files.maxPerSubjectReached
          : t.files.maxFilesReached
      );
    }

    if (parsed.length > 0) {
      onAddSubjectFiles(parsed);
      setTopicInput('');
    }
    e.target.value = '';
  };

  if (visibleCourses.length === 0) {
    return (
      <div className="space-y-6">
        <SemesterBar
          courses={courses}
          selectedSemester={selectedSemester}
          t={t}
          onSelectSemester={onSelectSemester}
        />
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-12 text-center">
          <h2 className="font-display text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            {courses.length === 0 ? t.courses.emptyTitle : t.semesters.emptySemester}
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-md mx-auto">
            {t.courses.emptyDesc}
          </p>
          <button
            type="button"
            onClick={onAddCourse}
            className="mt-5 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-indigo-700 text-white hover:bg-indigo-800 transition-colors"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>
              {selectedSemester === 'ALL'
                ? t.courses.addFirstCourse
                : t.semesters.addInSemester(selectedSemester)}
            </span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SemesterBar
        courses={courses}
        selectedSemester={selectedSemester}
        t={t}
        onSelectSemester={onSelectSemester}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Course List */}
        <aside className="lg:col-span-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between gap-2 px-5 py-4 border-b border-zinc-200 dark:border-zinc-800">
            <h2 className="font-display text-sm font-semibold text-zinc-900 dark:text-zinc-50 truncate">
              {t.courses.enrolledCourses} ({visibleCourses.length})
            </h2>
            <button
              type="button"
              onClick={onAddCourse}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700 transition-colors whitespace-nowrap shrink-0"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{t.courses.addCourse}</span>
            </button>
          </div>

          <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {visibleCourses.map((course) => {
              const cStats = calculateCourseStats(course);
              const sem = getCourseSemester(course);
              const courseFileCount = subjectFiles.filter((f) => f.courseId === course.id).length;
              const isSelected = selectedCourse?.id === course.id;
              return (
                <button
                  key={course.id}
                  type="button"
                  onClick={() => onSelectCourse(course.id)}
                  className={`w-full text-left px-5 py-4 transition-colors focus-visible:outline-2 focus-visible:outline-indigo-600 ${
                    isSelected
                      ? 'bg-zinc-100/90 dark:bg-zinc-800/80'
                      : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {course.code}
                    </span>
                    <span className="font-mono text-sm font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
                      {cStats.currentPercentage !== null ? `${cStats.currentPercentage.toFixed(1)}%` : '--'}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                    {course.name}
                  </p>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="text-xs text-zinc-400 dark:text-zinc-500 font-mono tabular-nums truncate">
                      {t.semesters.short(sem)} · {course.credits} {t.overview.crUnit} · {t.courses.passShort} {cStats.passingGrade}
                      {courseFileCount > 0 ? ` · ${t.files.pdfsCountShort(courseFileCount)}` : ''}
                    </span>
                    <StatusText status={cStats.status} t={t} />
                  </div>
                </button>
              );
            })}
          </div>

          <div className="px-5 py-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
            <button
              type="button"
              onClick={onClearAllCourses}
              className="text-xs font-medium text-zinc-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400 transition-colors whitespace-nowrap"
            >
              {t.modals.startBlank}
            </button>
          </div>
        </aside>

        {/* Selected Course Detail */}
        {selectedCourse && stats && (
          <div className="lg:col-span-8 space-y-6">
            <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
              <div className="flex flex-wrap items-start justify-between gap-4 px-6 py-5 border-b border-zinc-200 dark:border-zinc-800">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="font-display text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                      {selectedCourse.code} — {selectedCourse.name}
                    </h2>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    {t.semesters.full(getCourseSemester(selectedCourse))} ·{' '}
                    {selectedCourse.instructor || t.courses.unassignedInstructor} · {selectedCourse.credits}{' '}
                    {t.courses.creditsWord} · {t.courses.targetLabel} {selectedCourse.targetGrade}% ·{' '}
                    {t.courses.passShort} {stats.passingGrade} ({stats.passingScore}%)
                  </p>
                </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => onEditCourse(selectedCourse)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors whitespace-nowrap"
                >
                  <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{t.courses.editCourse}</span>
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteCourse(selectedCourse.id)}
                  className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:text-red-600 hover:border-red-200 dark:hover:text-red-400 dark:hover:border-red-900/50 transition-colors"
                  aria-label={`Delete ${selectedCourse.code}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* 3-Metric Course Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-zinc-200 dark:divide-zinc-800 border-b border-zinc-200 dark:border-zinc-800">
              <div className="px-6 py-4">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{t.courses.currentStanding}</p>
                <p className="mt-1 font-mono text-xl font-semibold text-zinc-900 dark:text-zinc-50 tabular-nums">
                  {stats.currentPercentage !== null ? `${stats.currentPercentage.toFixed(1)}%` : '--'}{' '}
                  <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400">
                    ({stats.letterGrade})
                  </span>
                </p>
              </div>
              <div className="px-6 py-4">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{t.courses.gradedWeight}</p>
                <p className="mt-1 font-mono text-xl font-semibold text-zinc-900 dark:text-zinc-50 tabular-nums">
                  {stats.completedWeight}%{' '}
                  <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400">
                    / 100%
                  </span>
                </p>
              </div>
              <div className="px-6 py-4">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{t.courses.neededOnRemaining}</p>
                <p className="mt-1 font-mono text-xl font-semibold text-zinc-900 dark:text-zinc-50 tabular-nums">
                  {requiredOnRemaining === null
                    ? t.courses.complete
                    : requiredOnRemaining > 100
                    ? `${requiredOnRemaining.toFixed(1)}% (${t.courses.stretch})`
                    : requiredOnRemaining <= 0
                    ? t.courses.secured
                    : `${requiredOnRemaining.toFixed(1)}%`}
                </p>
              </div>
            </div>

            {/* What-If Simulator */}
            {stats.remainingWeight > 0 && (
              <div className="px-6 py-4 bg-zinc-50/70 dark:bg-zinc-800/30 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1">
                    <label
                      htmlFor="what-if-slider"
                      className="block text-xs font-medium text-zinc-700 dark:text-zinc-300"
                    >
                      {t.courses.simulatorPrefix}{' '}
                      <span className="font-mono font-semibold text-indigo-700 dark:text-indigo-400 tabular-nums">
                        {hypotheticalScore}%
                      </span>{' '}
                      {t.courses.simulatorMiddle} {stats.remainingWeight}% {t.courses.simulatorSuffix}
                    </label>
                    <input
                      id="what-if-slider"
                      type="range"
                      min={40}
                      max={100}
                      step={1}
                      value={hypotheticalScore}
                      onChange={(e) => setHypotheticalScore(Number(e.target.value))}
                      className="w-full sm:w-80 accent-indigo-700 cursor-pointer"
                    />
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{t.courses.projectedFinal}</p>
                    <p className="font-mono text-lg font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
                      {projectedGrade !== null ? `${projectedGrade.toFixed(1)}%` : '--'}{' '}
                      <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400">
                        ({percentageToLetter(projectedGrade)})
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Assignment Toolbar */}
            <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg overflow-x-auto max-w-full">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                      categoryFilter === cat
                        ? 'bg-white text-zinc-900 shadow-xs dark:bg-zinc-700 dark:text-zinc-50'
                        : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
                    }`}
                  >
                    {cat === 'All' ? t.courses.filterAll : cat}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-48">
                  <Search
                    className="h-3.5 w-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    aria-hidden="true"
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.courses.filterPlaceholder}
                    aria-label={t.courses.filterPlaceholder}
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => onAddAssignment(selectedCourse.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-700 text-white hover:bg-indigo-800 transition-colors whitespace-nowrap shrink-0"
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{t.courses.addGrade}</span>
                </button>
              </div>
            </div>

            {/* Assignments Table */}
            {filteredAssignments.length === 0 ? (
              <div className="p-10 text-center">
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {selectedCourse.assignments.length === 0
                    ? t.courses.noAssignments
                    : t.courses.noMatchingAssignments}
                </p>
                {selectedCourse.assignments.length === 0 && (
                  <button
                    type="button"
                    onClick={() => onAddAssignment(selectedCourse.id)}
                    className="mt-3 px-4 py-2 text-xs font-medium rounded-lg bg-indigo-700 text-white hover:bg-indigo-800 transition-colors"
                  >
                    {t.courses.logFirstAssignment}
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                      <th className="py-3 pl-6 pr-3">{t.courses.colAssessment}</th>
                      <th className="py-3 px-3">{t.courses.colDate}</th>
                      <th className="py-3 px-3 text-right">{t.courses.colWeight}</th>
                      <th className="py-3 px-3 text-right">{t.courses.colScore}</th>
                      <th className="py-3 pl-3 pr-6 text-right">{t.courses.colActions}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-sm">
                    {filteredAssignments.map((a) => {
                      const pct = a.maxScore > 0 ? (a.score / a.maxScore) * 100 : 0;
                      return (
                        <tr key={a.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                          <td className="py-3.5 pl-6 pr-3">
                            <p className="font-medium text-zinc-900 dark:text-zinc-100">{a.title}</p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                              {a.category} · {a.topic || t.courses.generalReview}
                            </p>
                          </td>
                          <td className="py-3.5 px-3 font-mono text-xs text-zinc-500 dark:text-zinc-400 tabular-nums whitespace-nowrap">
                            {a.date}
                          </td>
                          <td className="py-3.5 px-3 text-right font-mono text-xs text-zinc-600 dark:text-zinc-300 tabular-nums">
                            {a.weight}%
                          </td>
                          <td className="py-3.5 px-3 text-right font-mono tabular-nums whitespace-nowrap">
                            <span className="font-medium text-zinc-900 dark:text-zinc-100">
                              {pct.toFixed(1)}%
                            </span>
                            <span className="block text-[11px] text-zinc-400 dark:text-zinc-500">
                              {a.score}/{a.maxScore}
                            </span>
                          </td>
                          <td className="py-3.5 pl-3 pr-6 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => onOpenStudyGuide(selectedCourse, a)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md border border-zinc-200 dark:border-zinc-700 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
                              >
                                <BookOpen className="h-3 w-3" aria-hidden="true" />
                                <span>{t.courses.review}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => onEditAssignment(selectedCourse.id, a)}
                                className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                aria-label={`Edit ${a.title}`}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => onDeleteAssignment(selectedCourse.id, a.id)}
                                className="p-1.5 rounded-md text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-950/40 transition-colors"
                                aria-label={`Delete ${a.title}`}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Integrated Per-Subject Topic PDFs & Materials */}
          <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.txt,.md,.markdown,.csv,.json,.png,.jpg,.jpeg,.webp,application/pdf,text/plain,text/markdown,text/csv,image/png,image/jpeg,image/webp"
              onChange={(e) => void handleSubjectPdfUpload(e)}
              className="hidden"
            />
            <datalist id="course-topic-suggestions">
              {topicSuggestions.map((topic) => (
                <option key={topic} value={topic} />
              ))}
            </datalist>

            <div className="flex flex-wrap items-start justify-between gap-4 px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
              <div className="min-w-0 max-w-lg">
                <div className="flex items-center gap-2.5">
                  <h3 className="font-display text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                    {t.files.subjectMaterialsTitle}
                  </h3>
                  <span className="text-xs font-mono text-zinc-400 dark:text-zinc-500 tabular-nums">
                    {selectedCourseFiles.length}/{MAX_FILES_PER_SUBJECT}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  {t.files.subjectMaterialsSubtitle}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  list="course-topic-suggestions"
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  placeholder={t.files.topicPlaceholder}
                  aria-label={t.files.topicInputLabel}
                  maxLength={120}
                  className="px-3 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 w-52 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors whitespace-nowrap shrink-0"
                >
                  <Paperclip className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{t.files.attachPdfBtn}</span>
                </button>
              </div>
            </div>

            {fileUploadError && (
              <div
                role="alert"
                className="px-6 py-2.5 border-b border-red-200 dark:border-red-900/50 bg-red-50/70 dark:bg-red-950/30 text-xs text-red-700 dark:text-red-300"
              >
                {fileUploadError}
              </div>
            )}

            {selectedCourseFiles.length === 0 ? (
              <div className="px-6 py-7 text-center">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {t.files.emptySubjectHint} · {t.files.supportedFormats}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {selectedCourseFiles.map((file) => {
                  const topicOrName = file.topic || file.name;
                  return (
                    <div
                      key={file.id}
                      className="px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <FileText
                          className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0"
                          aria-hidden="true"
                        />
                        <div className="min-w-0">
                          <button
                            type="button"
                            onClick={() => setPreviewFile(file)}
                            className="text-sm font-medium text-zinc-900 dark:text-zinc-100 hover:text-indigo-700 dark:hover:text-indigo-400 truncate block max-w-md text-left"
                          >
                            {file.name}
                          </button>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono tabular-nums truncate">
                            {file.topic ? `${file.topic} · ` : ''}
                            {formatFileSize(file.size)} · {file.uploadedAt.slice(0, 10)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => setPreviewFile(file)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors whitespace-nowrap"
                        >
                          <Eye className="h-3 w-3" aria-hidden="true" />
                          <span>{t.files.openFile}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            onAskAdvisorAbout(
                              t.files.promptForSubjectFile(selectedCourse.code, topicOrName)
                            )
                          }
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md border border-zinc-200 dark:border-zinc-700 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors whitespace-nowrap"
                        >
                          <MessageSquare className="h-3 w-3" aria-hidden="true" />
                          <span>{t.files.askAdvisorFile}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onRemoveSubjectFile(file.id)}
                          aria-label={`${t.files.removeFile}: ${file.name}`}
                          className="p-1.5 rounded-md text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-950/40 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}
    </div>

    <SubjectFileViewerModal
      file={previewFile}
      t={t}
      onClose={() => setPreviewFile(null)}
      onAskAdvisorAbout={onAskAdvisorAbout}
    />
    </div>
  );
}
