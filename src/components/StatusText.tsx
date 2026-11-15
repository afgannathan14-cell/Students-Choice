import { AlertCircle, AlertTriangle, CheckCircle2, Minus, TrendingUp } from 'lucide-react';
import { Translations } from '../i18n/translations';
import { CourseStats } from '../utils/grades';

interface StatusTextProps {
  status: CourseStats['status'];
  t: Translations;
}

export function StatusText({ status, t }: StatusTextProps) {
  switch (status) {
    case 'Strong':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>{t.status.strong}</span>
        </span>
      );
    case 'On Track':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-700 dark:text-indigo-400 whitespace-nowrap">
          <TrendingUp className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>{t.status.onTrack}</span>
        </span>
      );
    case 'Needs Focus':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-400 whitespace-nowrap">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>{t.status.needsFocus}</span>
        </span>
      );
    case 'At Risk':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-700 dark:text-red-400 whitespace-nowrap">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>{t.status.atRisk}</span>
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
          <Minus className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>{t.status.pending}</span>
        </span>
      );
  }
}

export function PriorityText({
  priority,
  t,
}: {
  priority: 'High' | 'Medium' | 'Maintain';
  t: Translations;
}) {
  if (priority === 'High') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-700 dark:text-red-400 whitespace-nowrap">
        <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span>{t.status.highPriority}</span>
      </span>
    );
  }
  if (priority === 'Medium') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-400 whitespace-nowrap">
        <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span>{t.status.mediumFocus}</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
      <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>{t.status.maintain}</span>
    </span>
  );
}
