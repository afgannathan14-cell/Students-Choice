import { useEffect, useState } from 'react';
import {
  Check,
  Clock,
  MessageSquare,
  Pause,
  Play,
  Plus,
  RefreshCw,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import { Translations } from '../i18n/translations';
import { Course, RecommendationPlan, StudyRecommendation, SubjectFile } from '../types/academic';
import { PriorityText } from './StatusText';
import { SubjectFilesBar } from './SubjectFilesBar';

interface StudyPlanViewProps {
  plan: RecommendationPlan;
  courses: Course[];
  subjectFiles: SubjectFile[];
  isGenerating: boolean;
  error: string | null;
  t: Translations;
  onGeneratePlan: () => void;
  onToggleComplete: (recId: string) => void;
  onDeleteRecommendation: (recId: string) => void;
  onAddCustomTask: (task: Omit<StudyRecommendation, 'id' | 'completed'>) => void;
  onAskAdvisorAbout: (prompt: string) => void;
  onAddSubjectFiles: (files: SubjectFile[]) => void;
  onRemoveSubjectFile: (fileId: string) => void;
}

export function StudyPlanView({
  plan,
  courses,
  subjectFiles,
  isGenerating,
  error,
  t,
  onGeneratePlan,
  onToggleComplete,
  onDeleteRecommendation,
  onAddCustomTask,
  onAskAdvisorAbout,
  onAddSubjectFiles,
  onRemoveSubjectFile,
}: StudyPlanViewProps) {
  const [filter, setFilter] = useState<'all' | 'active' | 'done'>('all');
  const [showAddForm, setShowAddForm] = useState(false);

  const [customCourseCode, setCustomCourseCode] = useState(courses[0]?.code || 'GENERAL');
  const [customFocus, setCustomFocus] = useState('');
  const [customPlan, setCustomPlan] = useState('');
  const [customMinutes, setCustomMinutes] = useState(30);

  const [activeTimerTask, setActiveTimerTask] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number>(25 * 60);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);

  useEffect(() => {
    if (!timerRunning) return;
    const interval = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [timerRunning]);

  const startTaskTimer = (rec: StudyRecommendation) => {
    setActiveTimerTask(`${rec.courseCode}: ${rec.focusArea}`);
    setSecondsLeft(rec.estimatedMinutes * 60);
    setTimerRunning(true);
  };

  const formatClock = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
  };

  const filteredRecs = plan.recommendations.filter((r) => {
    if (filter === 'active') return !r.completed;
    if (filter === 'done') return r.completed;
    return true;
  });

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customFocus.trim()) return;
    const matchedCourse = courses.find((c) => c.code === customCourseCode);
    onAddCustomTask({
      courseCode: customCourseCode,
      courseName: matchedCourse?.name || 'Independent Study',
      priority: 'Medium',
      focusArea: customFocus.trim(),
      actionPlan: customPlan.trim() || 'Complete focused practice set and self-test weak concepts.',
      studyTechnique: 'Self-Directed Practice',
      estimatedMinutes: customMinutes,
      impactNote: 'Custom study milestone added to weekly plan.',
    });
    setCustomFocus('');
    setCustomPlan('');
    setShowAddForm(false);
  };

  const completedCount = plan.recommendations.filter((r) => r.completed).length;

  return (
    <div className="space-y-6">
      {/* Header & Gemini Regeneration Bar */}
      <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <h2 className="font-display text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              {t.studyPlan.title}
            </h2>
            <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300 mt-2">
              {plan.diagnosis}
            </p>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-2 font-mono tabular-nums">
              {completedCount} / {plan.recommendations.length} {t.studyPlan.tasksCompleted} ·{' '}
              {t.studyPlan.lastUpdated}{' '}
              {new Date(plan.generatedAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              })}
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setShowAddForm((prev) => !prev)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors whitespace-nowrap"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{t.studyPlan.addTask}</span>
            </button>
            <button
              type="button"
              onClick={onGeneratePlan}
              disabled={isGenerating}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg bg-indigo-700 text-white hover:bg-indigo-800 disabled:opacity-60 transition-colors whitespace-nowrap"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${isGenerating ? 'animate-spin' : ''}`}
                aria-hidden="true"
              />
              <span>
                {isGenerating ? t.studyPlan.analyzingGrades : t.studyPlan.generateWithGemini}
              </span>
            </button>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-4 px-4 py-3 rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50/70 dark:bg-red-950/30 text-xs text-red-700 dark:text-red-300"
          >
            {error}
          </div>
        )}

        {showAddForm && (
          <form
            onSubmit={handleCreateCustom}
            className="mt-5 pt-5 border-t border-zinc-200 dark:border-zinc-800 grid grid-cols-1 md:grid-cols-12 gap-3"
          >
            <div className="md:col-span-3">
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                {t.studyPlan.courseLabel}
              </label>
              <select
                value={customCourseCode}
                onChange={(e) => setCustomCourseCode(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.code}>
                    {c.code}
                  </option>
                ))}
                <option value="GENERAL">{t.studyPlan.generalCourse}</option>
              </select>
            </div>
            <div className="md:col-span-4">
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                {t.studyPlan.focusTopicLabel}
              </label>
              <input
                type="text"
                required
                value={customFocus}
                onChange={(e) => setCustomFocus(e.target.value)}
                placeholder={t.studyPlan.focusPlaceholder}
                className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
              />
            </div>
            <div className="md:col-span-3">
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                {t.studyPlan.notesLabel}
              </label>
              <input
                type="text"
                value={customPlan}
                onChange={(e) => setCustomPlan(e.target.value)}
                placeholder={t.studyPlan.notesPlaceholder}
                className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
              />
            </div>
            <div className="md:col-span-2 flex items-end gap-2">
              <div className="w-20">
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  {t.studyPlan.minsLabel}
                </label>
                <input
                  type="number"
                  min={10}
                  max={120}
                  value={customMinutes}
                  onChange={(e) => setCustomMinutes(Number(e.target.value))}
                  className="w-full px-2.5 py-2 text-xs font-mono rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                />
              </div>
              <button
                type="submit"
                className="flex-1 px-3 py-2 text-xs font-medium rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors"
              >
                {t.studyPlan.save}
              </button>
            </div>
          </form>
        )}

        <div className="mt-5 pt-5 border-t border-zinc-200 dark:border-zinc-800">
          <SubjectFilesBar
            courses={courses}
            subjectFiles={subjectFiles}
            t={t}
            onAddSubjectFiles={onAddSubjectFiles}
            onRemoveSubjectFile={onRemoveSubjectFile}
          />
        </div>
      </section>

      {/* Main Split: Recommendations List + Focus Timer */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <section className="xl:col-span-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
              {(['all', 'active', 'done'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setFilter(tab)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                    filter === tab
                      ? 'bg-white text-zinc-900 shadow-xs dark:bg-zinc-700 dark:text-zinc-50'
                      : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
                  }`}
                >
                  {tab === 'all'
                    ? t.studyPlan.allItems
                    : tab === 'active'
                    ? t.studyPlan.remaining
                    : t.studyPlan.completed}
                </button>
              ))}
            </div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono tabular-nums">
              {filteredRecs.length} {t.studyPlan.itemsCount}
            </span>
          </div>

          {isGenerating ? (
            <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {[1, 2, 3].map((n) => (
                <div key={n} className="p-6 space-y-2.5 animate-pulse">
                  <div className="h-3 w-36 bg-zinc-200 dark:bg-zinc-800 rounded" />
                  <div className="h-4 w-72 bg-zinc-200 dark:bg-zinc-800 rounded" />
                  <div className="h-3 w-full bg-zinc-100 dark:bg-zinc-800/60 rounded" />
                </div>
              ))}
            </div>
          ) : filteredRecs.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">{t.studyPlan.noTasks}</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {filteredRecs.map((rec) => (
                <div
                  key={rec.id}
                  className={`p-6 transition-colors ${
                    rec.completed ? 'bg-zinc-50/50 dark:bg-zinc-900/40 opacity-75' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <button
                      type="button"
                      onClick={() => onToggleComplete(rec.id)}
                      aria-label={rec.focusArea}
                      className={`mt-0.5 h-5 w-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                        rec.completed
                          ? 'bg-indigo-700 border-indigo-700 text-white'
                          : 'border-zinc-300 dark:border-zinc-600 hover:border-indigo-600'
                      }`}
                    >
                      {rec.completed && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
                    </button>

                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                          {rec.courseCode} · {rec.studyTechnique} ·{' '}
                          <span className="font-mono tabular-nums">
                            {rec.estimatedMinutes} {t.studyPlan.minUnit}
                          </span>
                        </span>
                        <PriorityText priority={rec.priority} t={t} />
                      </div>

                      <h3
                        className={`text-sm font-semibold ${
                          rec.completed
                            ? 'line-through text-zinc-500 dark:text-zinc-400'
                            : 'text-zinc-900 dark:text-zinc-100'
                        }`}
                      >
                        {rec.focusArea}
                      </h3>

                      <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                        {rec.actionPlan}
                      </p>

                      <div className="pt-1 flex flex-wrap items-center justify-between gap-3">
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">{rec.impactNote}</p>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => startTaskTimer(rec)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                          >
                            <Clock className="h-3 w-3" aria-hidden="true" />
                            <span>{t.studyPlan.timerBtn}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              onAskAdvisorAbout(
                                `${rec.courseCode} (${rec.focusArea}): ${rec.actionPlan}`
                              )
                            }
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md border border-zinc-200 dark:border-zinc-700 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
                          >
                            <MessageSquare className="h-3 w-3" aria-hidden="true" />
                            <span>{t.studyPlan.coachMeBtn}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteRecommendation(rec.id)}
                            className="p-1.5 rounded-md text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                            aria-label="Remove task"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Minimalist Focus Timer */}
        <aside className="xl:col-span-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 space-y-5">
          <div>
            <h3 className="font-display text-base font-semibold text-zinc-900 dark:text-zinc-50">
              {t.studyPlan.focusTimerTitle}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 truncate">
              {activeTimerTask || t.studyPlan.defaultTimerTask}
            </p>
          </div>

          <div className="py-6 border-y border-zinc-200 dark:border-zinc-800 text-center">
            <span className="font-mono text-5xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 tabular-nums">
              {formatClock(secondsLeft)}
            </span>
          </div>

          <div className="flex items-center justify-center gap-2">
            {[25, 45, 60].map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => {
                  setTimerRunning(false);
                  setSecondsLeft(mins * 60);
                }}
                className="px-3 py-1.5 text-xs font-mono font-medium rounded-md border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                {mins}m
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setTimerRunning((r) => !r)}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg bg-indigo-700 text-white hover:bg-indigo-800 transition-colors"
            >
              {timerRunning ? (
                <>
                  <Pause className="h-4 w-4" aria-hidden="true" />
                  <span>{t.studyPlan.pause}</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" aria-hidden="true" />
                  <span>{t.studyPlan.startSession}</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setTimerRunning(false);
                setSecondsLeft(25 * 60);
              }}
              className="p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Reset timer"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
