import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Translations } from '../i18n/translations';
import { Course, SemesterFilter } from '../types/academic';
import { calculateCumulativeGpa, getCourseSemester } from '../utils/grades';

interface SemesterBarProps {
  courses: Course[];
  selectedSemester: SemesterFilter;
  t: Translations;
  onSelectSemester: (semester: SemesterFilter) => void;
}

const STANDARD_SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];
const EXTENDED_SEMESTERS = [9, 10, 11, 12, 13, 14];

export function SemesterBar({
  courses,
  selectedSemester,
  t,
  onSelectSemester,
}: SemesterBarProps) {
  const [moreOpen, setMoreOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!moreOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMoreOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [moreOpen]);

  const countBySemester = new Map<number, number>();
  for (const c of courses) {
    const sem = getCourseSemester(c);
    countBySemester.set(sem, (countBySemester.get(sem) || 0) + 1);
  }

  const allStats = calculateCumulativeGpa(courses);
  const isExtendedSelected =
    typeof selectedSemester === 'number' && selectedSemester > 8;

  const filteredCourses =
    selectedSemester === 'ALL'
      ? courses
      : courses.filter((c) => getCourseSemester(c) === selectedSemester);
  const semStats = calculateCumulativeGpa(filteredCourses);

  const extendedCount = EXTENDED_SEMESTERS.reduce(
    (sum, s) => sum + (countBySemester.get(s) || 0),
    0
  );

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={() => {
            onSelectSemester('ALL');
            setMoreOpen(false);
          }}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
            selectedSemester === 'ALL'
              ? 'bg-indigo-700 text-white'
              : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100'
          }`}
        >
          {t.semesters.all}
        </button>

        <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 mx-0.5 hidden sm:block" />

        {STANDARD_SEMESTERS.map((sem) => {
          const isActive = selectedSemester === sem;
          const count = countBySemester.get(sem) || 0;
          return (
            <button
              key={sem}
              type="button"
              onClick={() => {
                onSelectSemester(sem);
                setMoreOpen(false);
              }}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100'
              }`}
            >
              <span>{t.semesters.short(sem)}</span>
              {count > 0 && (
                <span
                  className={`ml-1 font-mono text-[11px] tabular-nums ${
                    isActive
                      ? 'text-zinc-300 dark:text-zinc-600'
                      : 'text-zinc-400 dark:text-zinc-500'
                  }`}
                >
                  ({count})
                </span>
              )}
            </button>
          );
        })}

        <div ref={dropdownRef} className="relative">
          <button
            type="button"
            onClick={() => setMoreOpen((prev) => !prev)}
            aria-expanded={moreOpen}
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              isExtendedSelected
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100'
            }`}
          >
            <span>
              {isExtendedSelected
                ? t.semesters.short(selectedSemester as number)
                : t.semesters.more}
            </span>
            {extendedCount > 0 && !isExtendedSelected && (
              <span className="font-mono text-[11px] tabular-nums text-zinc-400 dark:text-zinc-500">
                ({extendedCount})
              </span>
            )}
            <ChevronDown className="h-3.5 w-3.5 opacity-75" aria-hidden="true" />
          </button>

          {moreOpen && (
            <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-56 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-lg py-2 z-40">
              <p className="px-3.5 py-1.5 text-[11px] font-medium text-zinc-400 dark:text-zinc-500 border-b border-zinc-100 dark:border-zinc-800">
                {t.semesters.extendedTitle}
              </p>
              <div className="py-1">
                {EXTENDED_SEMESTERS.map((sem) => {
                  const active = selectedSemester === sem;
                  const count = countBySemester.get(sem) || 0;
                  return (
                    <button
                      key={sem}
                      type="button"
                      onClick={() => {
                        onSelectSemester(sem);
                        setMoreOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2 text-xs text-left transition-colors ${
                        active
                          ? 'bg-indigo-50 text-indigo-700 font-medium dark:bg-indigo-950/50 dark:text-indigo-300'
                          : 'text-zinc-700 hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-zinc-800'
                      }`}
                    >
                      <span>{t.semesters.full(sem)}</span>
                      {count > 0 && (
                        <span className="font-mono text-[11px] text-zinc-400 dark:text-zinc-500 tabular-nums">
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="text-xs font-mono tabular-nums text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
        {selectedSemester === 'ALL' ? (
          <span>
            {t.semesters.cumulativeGpaShort}:{' '}
            <strong className="font-semibold text-zinc-900 dark:text-zinc-100">
              {allStats.gpa.toFixed(2)}
            </strong>{' '}
            · {allStats.totalCredits} {t.overview.creditsUnit}
          </span>
        ) : (
          <span>
            {t.semesters.semesterGpa}:{' '}
            <strong className="font-semibold text-zinc-900 dark:text-zinc-100">
              {semStats.gpa.toFixed(2)}
            </strong>{' '}
            · {t.semesters.cumulativeGpaShort}:{' '}
            <strong className="font-semibold text-zinc-900 dark:text-zinc-100">
              {allStats.gpa.toFixed(2)}
            </strong>
          </span>
        )}
      </div>
    </div>
  );
}
