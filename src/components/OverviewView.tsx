import { ArrowRight, Plus, RefreshCw } from 'lucide-react';
import { Translations } from '../i18n/translations';
import { ActiveTab, Course, RecommendationPlan, SemesterFilter, StudentProfile } from '../types/academic';
import {
  buildSemesterGpaSeries,
  buildTrajectorySeries,
  calculateCourseStats,
  calculateCumulativeGpa,
  getCourseSemester,
} from '../utils/grades';
import { SemesterBar } from './SemesterBar';
import { SemesterGpaChart } from './SemesterGpaChart';
import { PriorityText, StatusText } from './StatusText';
import { TrajectoryChart } from './TrajectoryChart';

interface OverviewViewProps {
  profile: StudentProfile;
  courses: Course[];
  selectedSemester: SemesterFilter;
  plan: RecommendationPlan;
  isGeneratingPlan: boolean;
  planError?: string | null;
  t: Translations;
  onSelectSemester: (semester: SemesterFilter) => void;
  onRefreshPlan: () => void;
  onNavigate: (tab: ActiveTab) => void;
  onSelectCourse: (courseId: string) => void;
  onQuickAddGrade: () => void;
  onAddCourse: () => void;
}

export function OverviewView({
  profile,
  courses,
  selectedSemester,
  plan,
  isGeneratingPlan,
  planError,
  t,
  onSelectSemester,
  onRefreshPlan,
  onNavigate,
  onSelectCourse,
  onQuickAddGrade,
  onAddCourse,
}: OverviewViewProps) {
  const allStats = calculateCumulativeGpa(courses);
  const visibleCourses =
    selectedSemester === 'ALL'
      ? courses
      : courses.filter((c) => getCourseSemester(c) === selectedSemester);
  const viewStats = calculateCumulativeGpa(visibleCourses);
  const semesterGpaSeries = buildSemesterGpaSeries(courses);
  const trajectory = buildTrajectorySeries(visibleCourses);

  const avgTarget =
    visibleCourses.length > 0
      ? visibleCourses.reduce((sum, c) => sum + c.targetGrade * c.credits, 0) /
        Math.max(1, visibleCourses.reduce((sum, c) => sum + c.credits, 0))
      : 90;

  const completedTasks = plan.recommendations.filter((r) => r.completed).length;
  const totalTasks = plan.recommendations.length;

  const gpaGap = Number((allStats.gpa - profile.targetGpa).toFixed(2));
  const topRecommendations = plan.recommendations.slice(0, 3);

  return (
    <div className="space-y-6">
      <SemesterBar
        courses={courses}
        selectedSemester={selectedSemester}
        t={t}
        onSelectSemester={onSelectSemester}
      />

      {/* 4-Column KPI Strip */}
      <section
        aria-label="Academic Summary Metrics"
        className="grid grid-cols-2 lg:grid-cols-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl divide-y lg:divide-y-0 lg:divide-x divide-zinc-200 dark:divide-zinc-800"
      >
        <div className="p-5">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            {t.overview.cumulativeGpa}
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-semibold text-zinc-900 dark:text-zinc-50 tabular-nums">
              {allStats.gpa.toFixed(2)}
            </span>
            <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400 tabular-nums">
              / {profile.targetGpa.toFixed(2)} {t.overview.goalSuffix}
            </span>
          </div>
          <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400 font-mono tabular-nums">
            {selectedSemester !== 'ALL'
              ? `${t.semesters.short(selectedSemester)} ${t.semesters.semesterGpa}: ${viewStats.gpa.toFixed(2)}`
              : gpaGap >= 0
              ? `+${gpaGap.toFixed(2)} ${t.overview.aboveTarget}`
              : `${gpaGap.toFixed(2)} ${t.overview.toTarget}`}
          </p>
        </div>

        <div className="p-5">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            {t.overview.weightedAverage}
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-semibold text-zinc-900 dark:text-zinc-50 tabular-nums">
              {viewStats.weightedAverage !== null ? `${viewStats.weightedAverage.toFixed(1)}%` : '--'}
            </span>
          </div>
          <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
            {visibleCourses.length} {t.overview.acrossCourses}
          </p>
        </div>

        <div className="p-5">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            {t.overview.enrolledCredits}
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-semibold text-zinc-900 dark:text-zinc-50 tabular-nums">
              {viewStats.totalCredits}
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">{t.overview.creditsUnit}</span>
          </div>
          <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
            {selectedSemester === 'ALL'
              ? profile.term
              : `${t.semesters.full(selectedSemester)} · ${allStats.totalCredits} ${t.overview.creditsUnit} total`}
          </p>
        </div>

        <div className="p-5">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            {t.overview.studyPlanProgress}
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-semibold text-zinc-900 dark:text-zinc-50 tabular-nums">
              {completedTasks}/{totalTasks}
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {t.overview.completedUnit}
            </span>
          </div>
          <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
            {t.overview.personalizedActionItems}
          </p>
        </div>
      </section>

      {/* Charts Row: All-Semester GPA Progression + Milestone Grade Trajectory */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-stretch">
        <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="font-display text-base font-semibold text-zinc-900 dark:text-zinc-50">
                {t.semesters.gpaChartTitle}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                {t.semesters.gpaChartSubtitle}
              </p>
            </div>
            {selectedSemester !== 'ALL' && (
              <button
                type="button"
                onClick={() => onSelectSemester('ALL')}
                className="px-2.5 py-1 text-xs font-medium rounded-md border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors whitespace-nowrap shrink-0"
              >
                {t.semesters.all}
              </button>
            )}
          </div>

          <SemesterGpaChart
            data={semesterGpaSeries}
            targetGpa={profile.targetGpa}
            selectedSemester={selectedSemester}
            t={t}
            onSelectSemester={onSelectSemester}
          />
        </section>

        <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="font-display text-base font-semibold text-zinc-900 dark:text-zinc-50">
                {t.overview.gradeTrajectory}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                {t.overview.trajectorySubtitle}
              </p>
            </div>
            <button
              type="button"
              onClick={onQuickAddGrade}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors whitespace-nowrap shrink-0"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{t.overview.logScore}</span>
            </button>
          </div>

          <TrajectoryChart data={trajectory} targetPercentage={avgTarget} t={t} />
        </section>
      </div>

      {/* Two-Column Split: Course Standing + Personalized Recommendations */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <section className="xl:col-span-7 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
            <div>
              <h2 className="font-display text-base font-semibold text-zinc-900 dark:text-zinc-50">
                {t.overview.courseStanding}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                {t.overview.courseStandingHint}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={onAddCourse}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors whitespace-nowrap"
              >
                <Plus className="h-3 w-3" aria-hidden="true" />
                <span>{t.overview.addSubject}</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('courses')}
                className="inline-flex items-center gap-1 text-xs font-medium text-indigo-700 dark:text-indigo-400 hover:underline whitespace-nowrap"
              >
                <span>{t.overview.manageAll}</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>

          {visibleCourses.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {selectedSemester === 'ALL' ? t.overview.noCoursesYet : t.semesters.emptySemester}
              </p>
              <button
                type="button"
                onClick={onAddCourse}
                className="mt-3 px-4 py-2 text-xs font-medium rounded-lg bg-indigo-700 text-white hover:bg-indigo-800 transition-colors"
              >
                {selectedSemester === 'ALL'
                  ? t.overview.addFirstCourse
                  : t.semesters.addInSemester(selectedSemester)}
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    <th className="py-3 pl-6 pr-3">{t.overview.colCourse}</th>
                    <th className="py-3 px-3 text-right">{t.overview.colCurrent}</th>
                    <th className="py-3 px-3 text-right">{t.overview.colTarget}</th>
                    <th className="py-3 pl-3 pr-6 text-right">{t.overview.colStatus}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-sm">
                  {visibleCourses.map((course) => {
                    const stats = calculateCourseStats(course);
                    const sem = getCourseSemester(course);
                    return (
                      <tr
                        key={course.id}
                        onClick={() => {
                          onSelectCourse(course.id);
                          onNavigate('courses');
                        }}
                        className="cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                      >
                        <td className="py-3.5 pl-6 pr-3">
                          <div className="font-medium text-zinc-900 dark:text-zinc-100">
                            {course.code}
                          </div>
                          <div className="text-xs text-zinc-500 dark:text-zinc-400 truncate max-w-[240px]">
                            {course.name} · {t.semesters.short(sem)} · {course.credits} {t.overview.crUnit}
                          </div>
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono tabular-nums text-zinc-900 dark:text-zinc-100">
                          {stats.currentPercentage !== null ? (
                            <>
                              {stats.currentPercentage.toFixed(1)}%{' '}
                              <span className="text-zinc-400 dark:text-zinc-500">
                                ({stats.letterGrade})
                              </span>
                            </>
                          ) : (
                            '--'
                          )}
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono tabular-nums text-zinc-500 dark:text-zinc-400">
                          {course.targetGrade.toFixed(0)}%
                        </td>
                        <td className="py-3.5 pl-3 pr-6 text-right">
                          <StatusText status={stats.status} t={t} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="xl:col-span-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
            <div>
              <h2 className="font-display text-base font-semibold text-zinc-900 dark:text-zinc-50">
                {t.overview.personalizedFocus}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                {t.overview.tailoredToGaps}
              </p>
            </div>
            <button
              type="button"
              onClick={onRefreshPlan}
              disabled={isGeneratingPlan}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50 transition-colors whitespace-nowrap shrink-0"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${isGeneratingPlan ? 'animate-spin' : ''}`}
                aria-hidden="true"
              />
              <span>{isGeneratingPlan ? t.overview.analyzing : t.overview.refresh}</span>
            </button>
          </div>

          {planError && (
            <div
              role="alert"
              className="px-6 py-3 border-b border-red-200 dark:border-red-900/60 bg-red-50/70 dark:bg-red-950/30 text-xs text-red-700 dark:text-red-300"
            >
              {planError}
            </div>
          )}

          <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/30">
            <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">{plan.diagnosis}</p>
          </div>

          <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {topRecommendations.map((rec) => (
              <div key={rec.id} className="px-6 py-4 space-y-1.5">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    {rec.courseCode} · <span className="font-mono tabular-nums">{rec.estimatedMinutes}m</span>
                  </span>
                  <PriorityText priority={rec.priority} t={t} />
                </div>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{rec.focusArea}</p>
                <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">{rec.actionPlan}</p>
              </div>
            ))}
          </div>

          <div className="px-6 py-3.5 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <button
              type="button"
              onClick={() => onNavigate('study-plan')}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-700 dark:text-indigo-400 hover:underline"
            >
              <span>{t.overview.openFullPlan}</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => onNavigate('advisor')}
              className="text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              {t.overview.askAdvisor}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
