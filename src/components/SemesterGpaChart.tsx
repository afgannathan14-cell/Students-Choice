import { useState } from 'react';
import { Translations } from '../i18n/translations';
import { SemesterFilter } from '../types/academic';
import { SemesterGpaPoint } from '../utils/grades';

interface SemesterGpaChartProps {
  data: SemesterGpaPoint[];
  targetGpa: number;
  selectedSemester: SemesterFilter;
  t: Translations;
  onSelectSemester: (semester: SemesterFilter) => void;
}

export function SemesterGpaChart({
  data,
  targetGpa,
  selectedSemester,
  t,
  onSelectSemester,
}: SemesterGpaChartProps) {
  const [hoveredSem, setHoveredSem] = useState<number | null>(null);

  const gradedPoints = data.filter((d) => d.semesterGpa !== null);

  if (gradedPoints.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {t.overview.noMilestones}
        </p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          {t.semesters.noGradedSemesters}
        </p>
      </div>
    );
  }

  const width = 560;
  const height = 240;
  const padLeft = 38;
  const padRight = 16;
  const padTop = 22;
  const padBottom = 34;

  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;
  const colW = plotW / Math.max(1, data.length);
  const barW = Math.min(28, Math.max(12, colW * 0.48));

  const getCenterX = (idx: number) => padLeft + (idx + 0.5) * colW;
  const getY = (gpa: number) => {
    const clamped = Math.max(0, Math.min(4, gpa));
    return padTop + ((4 - clamped) / 4) * plotH;
  };

  const yTicks = [0, 1, 2, 3, 4];
  const targetY = getY(targetGpa);

  const cumulativeLinePath = gradedPoints
    .map((pt, i) => {
      const idx = data.findIndex((d) => d.semester === pt.semester);
      const x = getCenterX(idx);
      const y = getY(pt.cumulativeGpa ?? pt.semesterGpa ?? 0);
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');

  const defaultActive =
    (hoveredSem !== null && data.find((d) => d.semester === hoveredSem)) ||
    (selectedSemester !== 'ALL' && data.find((d) => d.semester === selectedSemester)) ||
    gradedPoints[gradedPoints.length - 1];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div className="flex flex-wrap items-baseline gap-2.5 min-w-0">
          <span className="font-mono text-2xl font-semibold text-zinc-900 dark:text-zinc-50 tabular-nums">
            {defaultActive.semesterGpa !== null ? defaultActive.semesterGpa.toFixed(2) : '--'}
          </span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono tabular-nums truncate">
            {t.semesters.full(defaultActive.semester)} · {t.semesters.cumulativeGpaShort}:{' '}
            {defaultActive.cumulativeGpa !== null ? defaultActive.cumulativeGpa.toFixed(2) : '--'} ·{' '}
            {defaultActive.courseCount} {t.semesters.coursesUnit} ({defaultActive.totalCredits}{' '}
            {t.overview.crUnit})
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
            <span className="h-2.5 w-2.5 rounded-xs bg-indigo-600/80 dark:bg-indigo-400/80 inline-block" />
            <span>{t.semesters.ipsLegend}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
            <span className="h-0.5 w-4 bg-emerald-600 dark:bg-emerald-400 inline-block" />
            <span>{t.semesters.ipkLegend}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
            <span className="h-0.5 w-4 border-t border-dashed border-zinc-400 dark:border-zinc-500 inline-block" />
            <span>
              {t.overview.targetLegend} ({targetGpa.toFixed(2)})
            </span>
          </span>
        </div>
      </div>

      <div className="relative w-full">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible select-none"
          role="img"
          aria-label={t.semesters.gpaChartTitle}
        >
          {yTicks.map((tick) => {
            const y = getY(tick);
            return (
              <g key={tick}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  className="stroke-zinc-200 dark:stroke-zinc-800"
                  strokeWidth="1"
                />
                <text
                  x={padLeft - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-zinc-400 dark:fill-zinc-500 font-mono text-[11px]"
                >
                  {tick.toFixed(1)}
                </text>
              </g>
            );
          })}

          {targetGpa >= 0 && targetGpa <= 4 && (
            <line
              x1={padLeft}
              y1={targetY}
              x2={width - padRight}
              y2={targetY}
              className="stroke-zinc-400 dark:stroke-zinc-500"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
          )}

          {data.map((pt, idx) => {
            const cx = getCenterX(idx);
            const barX = cx - barW / 2;
            const baselineY = getY(0);
            const isSelected = selectedSemester === pt.semester;
            const isHovered = hoveredSem === pt.semester;
            const isActive = isSelected || isHovered;
            const hasGpa = pt.semesterGpa !== null;
            const barTopY = hasGpa ? getY(pt.semesterGpa as number) : baselineY;
            const barHeight = Math.max(0, baselineY - barTopY);

            return (
              <g
                key={pt.semester}
                className="cursor-pointer focus:outline-none"
                role="button"
                tabIndex={0}
                aria-label={`${t.semesters.full(pt.semester)}: ${
                  pt.semesterGpa !== null ? pt.semesterGpa.toFixed(2) : '--'
                }`}
                onMouseEnter={() => setHoveredSem(pt.semester)}
                onMouseLeave={() => setHoveredSem(null)}
                onClick={() =>
                  onSelectSemester(selectedSemester === pt.semester ? 'ALL' : pt.semester)
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectSemester(selectedSemester === pt.semester ? 'ALL' : pt.semester);
                  }
                }}
              >
                <rect
                  x={cx - colW / 2}
                  y={padTop}
                  width={colW}
                  height={plotH + padBottom}
                  fill="transparent"
                />

                {isActive && (
                  <rect
                    x={cx - colW / 2 + 2}
                    y={padTop}
                    width={Math.max(4, colW - 4)}
                    height={plotH}
                    rx={4}
                    className="fill-zinc-100/80 dark:fill-zinc-800/40"
                  />
                )}

                {hasGpa ? (
                  <rect
                    x={barX}
                    y={barTopY}
                    width={barW}
                    height={Math.max(2, barHeight)}
                    rx={3}
                    className={
                      isActive
                        ? 'fill-indigo-600 dark:fill-indigo-400 transition-colors'
                        : 'fill-indigo-600/65 dark:fill-indigo-400/65 transition-colors'
                    }
                  />
                ) : pt.courseCount > 0 ? (
                  <rect
                    x={barX}
                    y={baselineY - 12}
                    width={barW}
                    height={12}
                    rx={3}
                    fill="none"
                    strokeDasharray="3 2"
                    className="stroke-zinc-300 dark:stroke-zinc-600"
                    strokeWidth="1.2"
                  />
                ) : (
                  <line
                    x1={barX + 2}
                    y1={baselineY - 1}
                    x2={barX + barW - 2}
                    y2={baselineY - 1}
                    className="stroke-zinc-200 dark:stroke-zinc-800"
                    strokeWidth="2"
                  />
                )}

                {hasGpa && (isActive || data.length <= 10) && (
                  <text
                    x={cx}
                    y={Math.max(12, barTopY - 6)}
                    textAnchor="middle"
                    className={
                      isActive
                        ? 'fill-zinc-900 dark:fill-zinc-50 font-mono text-[10px] font-semibold'
                        : 'fill-zinc-500 dark:fill-zinc-400 font-mono text-[10px]'
                    }
                  >
                    {(pt.semesterGpa as number).toFixed(2)}
                  </text>
                )}

                <text
                  x={cx}
                  y={height - 8}
                  textAnchor="middle"
                  className={
                    isActive
                      ? 'fill-indigo-700 dark:fill-indigo-300 font-mono text-[10px] font-semibold'
                      : 'fill-zinc-400 dark:fill-zinc-500 font-mono text-[10px]'
                  }
                >
                  {t.semesters.short(pt.semester)}
                </text>
              </g>
            );
          })}

          {gradedPoints.length > 1 && (
            <path
              d={cumulativeLinePath}
              fill="none"
              className="stroke-emerald-600 dark:stroke-emerald-400 pointer-events-none"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {gradedPoints.map((pt) => {
            const idx = data.findIndex((d) => d.semester === pt.semester);
            const cx = getCenterX(idx);
            const cy = getY(pt.cumulativeGpa ?? pt.semesterGpa ?? 0);
            const isActive = hoveredSem === pt.semester || selectedSemester === pt.semester;
            return (
              <circle
                key={`ipk-${pt.semester}`}
                cx={cx}
                cy={cy}
                r={isActive ? 4.5 : 3.2}
                className="fill-white dark:fill-zinc-900 stroke-emerald-600 dark:stroke-emerald-400 pointer-events-none"
                strokeWidth="2"
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
}
