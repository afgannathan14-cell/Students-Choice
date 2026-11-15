import { useState } from 'react';
import { Translations } from '../i18n/translations';
import { TrajectoryPoint } from '../utils/grades';

interface TrajectoryChartProps {
  data: TrajectoryPoint[];
  targetPercentage: number;
  t: Translations;
}

export function TrajectoryChart({ data, targetPercentage, t }: TrajectoryChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (data.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {t.overview.noMilestones}
        </p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          {t.overview.noMilestonesHint}
        </p>
      </div>
    );
  }

  const width = 760;
  const height = 240;
  const padLeft = 42;
  const padRight = 24;
  const padTop = 20;
  const padBottom = 34;

  const allValues = [
    ...data.map((d) => d.cumulativeAvg),
    ...data.map((d) => d.assignmentScore),
    targetPercentage,
  ];
  const minVal = Math.max(40, Math.floor((Math.min(...allValues) - 6) / 5) * 5);
  const maxVal = Math.min(100, Math.ceil((Math.max(...allValues) + 4) / 5) * 5);
  const range = Math.max(10, maxVal - minVal);

  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const getX = (idx: number) =>
    data.length === 1 ? padLeft + plotW / 2 : padLeft + (idx / (data.length - 1)) * plotW;

  const getY = (val: number) => padTop + ((maxVal - val) / range) * plotH;

  const linePath = data
    .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(pt.cumulativeAvg).toFixed(1)}`)
    .join(' ');

  const areaPath =
    data.length > 1
      ? `${linePath} L ${getX(data.length - 1).toFixed(1)} ${(padTop + plotH).toFixed(1)} L ${getX(0).toFixed(
          1
        )} ${(padTop + plotH).toFixed(1)} Z`
      : '';

  const yTicks = [minVal, Math.round((minVal + maxVal) / 2), maxVal];
  const targetY = getY(targetPercentage);

  const activePoint = hoveredIndex !== null ? data[hoveredIndex] : data[data.length - 1];
  const activeIdx = hoveredIndex !== null ? hoveredIndex : data.length - 1;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-2xl font-semibold text-zinc-900 dark:text-zinc-50 tabular-nums">
            {activePoint.cumulativeAvg.toFixed(1)}%
          </span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {activePoint.courseCode} · {activePoint.assignmentTitle} ({activePoint.assignmentScore.toFixed(0)}%) ·{' '}
            {activePoint.label}
          </span>
        </div>
        <div className="flex items-center gap-5 text-xs text-zinc-500 dark:text-zinc-400">
          <span className="inline-flex items-center gap-2">
            <span className="h-0.5 w-4 bg-indigo-600 dark:bg-indigo-400 inline-block" />
            <span>{t.overview.cumAvgLegend}</span>
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-0.5 w-4 border-t border-dashed border-zinc-400 dark:border-zinc-500 inline-block" />
            <span>
              {t.overview.targetLegend} ({targetPercentage.toFixed(0)}%)
            </span>
          </span>
        </div>
      </div>

      <div className="relative w-full">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible select-none"
          role="img"
          aria-label={t.overview.gradeTrajectory}
        >
          <defs>
            <linearGradient id="meridianArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.12" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0.0" />
            </linearGradient>
          </defs>

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
                  x={padLeft - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-zinc-400 dark:fill-zinc-500 font-mono text-[11px]"
                >
                  {tick}%
                </text>
              </g>
            );
          })}

          {targetPercentage >= minVal && targetPercentage <= maxVal && (
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

          {areaPath && (
            <path d={areaPath} fill="url(#meridianArea)" className="text-indigo-600 dark:text-indigo-400" />
          )}

          {data.length > 1 && (
            <path
              d={linePath}
              fill="none"
              className="stroke-indigo-600 dark:stroke-indigo-400"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {data.map((pt, idx) => {
            const cx = getX(idx);
            const cy = getY(pt.cumulativeAvg);
            const isSelected = idx === activeIdx;
            const showDateLabel =
              data.length <= 7 || idx === 0 || idx === data.length - 1 || idx % Math.ceil(data.length / 6) === 0;

            return (
              <g
                key={`${pt.date}-${idx}`}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => setHoveredIndex(idx)}
              >
                <circle cx={cx} cy={cy} r={14} fill="transparent" />
                {isSelected && (
                  <line
                    x1={cx}
                    y1={padTop}
                    x2={cx}
                    y2={padTop + plotH}
                    className="stroke-zinc-300 dark:stroke-zinc-700"
                    strokeWidth="1"
                  />
                )}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isSelected ? 4.5 : 3}
                  className={
                    isSelected
                      ? 'fill-indigo-600 dark:fill-indigo-400 stroke-white dark:stroke-zinc-900'
                      : 'fill-white dark:fill-zinc-900 stroke-indigo-600 dark:stroke-indigo-400'
                  }
                  strokeWidth="2"
                />
                {showDateLabel && (
                  <text
                    x={cx}
                    y={height - 8}
                    textAnchor="middle"
                    className="fill-zinc-400 dark:fill-zinc-500 font-mono text-[10px]"
                  >
                    {pt.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
