import { Course, LetterGrade } from '../types/academic';

export interface LetterGradeRule {
  grade: LetterGrade;
  minPercentage: number;
  gpaPoints: number;
}

export const LETTER_GRADE_SCALE: LetterGradeRule[] = [
  { grade: 'A', minPercentage: 85, gpaPoints: 4.0 },
  { grade: 'AB', minPercentage: 78, gpaPoints: 3.5 },
  { grade: 'B', minPercentage: 70, gpaPoints: 3.0 },
  { grade: 'BC', minPercentage: 65, gpaPoints: 2.5 },
  { grade: 'C', minPercentage: 60, gpaPoints: 2.0 },
  { grade: 'D', minPercentage: 50, gpaPoints: 1.0 },
  { grade: 'E', minPercentage: 0, gpaPoints: 0.0 },
];

export function getDefaultPassingScore(grade: LetterGrade): number {
  const found = LETTER_GRADE_SCALE.find((item) => item.grade === grade);
  if (!found) return 60;
  return found.grade === 'E' ? 40 : found.minPercentage;
}

export function getCoursePassingInfo(course: Course): {
  passingGrade: LetterGrade;
  passingScore: number;
} {
  const passingGrade: LetterGrade = course.passingGrade || 'C';
  const passingScore =
    typeof course.passingScore === 'number'
      ? course.passingScore
      : getDefaultPassingScore(passingGrade);
  return { passingGrade, passingScore };
}

export function getCourseSemester(course: Pick<Course, 'semester'>): number {
  if (typeof course.semester === 'number' && Number.isFinite(course.semester)) {
    return Math.max(1, Math.min(20, Math.round(course.semester)));
  }
  return 1;
}

export interface CourseStats {
  currentPercentage: number | null;
  completedWeight: number;
  remainingWeight: number;
  letterGrade: string;
  gpaPoints: number;
  targetDelta: number | null;
  passingGrade: LetterGrade;
  passingScore: number;
  isPassing: boolean;
  status: 'Strong' | 'On Track' | 'Needs Focus' | 'At Risk' | 'Unweighted';
}

export function percentageToLetter(pct: number | null): string {
  if (pct === null) return '--';
  for (const rule of LETTER_GRADE_SCALE) {
    if (pct >= rule.minPercentage) return rule.grade;
  }
  return 'E';
}

export function percentageToGpa(pct: number | null): number {
  if (pct === null) return 0;
  for (const rule of LETTER_GRADE_SCALE) {
    if (pct >= rule.minPercentage) return rule.gpaPoints;
  }
  return 0.0;
}

export function calculateCourseStats(course: Course): CourseStats {
  const { passingGrade, passingScore } = getCoursePassingInfo(course);

  if (course.assignments.length === 0) {
    return {
      currentPercentage: null,
      completedWeight: 0,
      remainingWeight: 100,
      letterGrade: '--',
      gpaPoints: 0,
      targetDelta: null,
      passingGrade,
      passingScore,
      isPassing: true,
      status: 'Unweighted',
    };
  }

  const totalWeight = course.assignments.reduce((sum, a) => sum + Math.max(0, a.weight), 0);

  if (totalWeight <= 0) {
    const avg =
      course.assignments.reduce(
        (sum, a) => sum + (a.maxScore > 0 ? (a.score / a.maxScore) * 100 : 0),
        0
      ) / course.assignments.length;
    const rounded = Number(avg.toFixed(1));
    const delta = Number((rounded - course.targetGrade).toFixed(1));
    return {
      currentPercentage: rounded,
      completedWeight: 0,
      remainingWeight: 100,
      letterGrade: percentageToLetter(rounded),
      gpaPoints: percentageToGpa(rounded),
      targetDelta: delta,
      passingGrade,
      passingScore,
      isPassing: rounded >= passingScore,
      status: deriveStatus(rounded, course.targetGrade, passingScore),
    };
  }

  const weightedEarned = course.assignments.reduce((sum, a) => {
    const pct = a.maxScore > 0 ? (a.score / a.maxScore) * 100 : 0;
    return sum + pct * a.weight;
  }, 0);

  const currentPercentage = Number((weightedEarned / totalWeight).toFixed(1));
  const completedWeight = Number(Math.min(100, totalWeight).toFixed(1));
  const remainingWeight = Number(Math.max(0, 100 - totalWeight).toFixed(1));
  const targetDelta = Number((currentPercentage - course.targetGrade).toFixed(1));

  return {
    currentPercentage,
    completedWeight,
    remainingWeight,
    letterGrade: percentageToLetter(currentPercentage),
    gpaPoints: percentageToGpa(currentPercentage),
    targetDelta,
    passingGrade,
    passingScore,
    isPassing: currentPercentage >= passingScore,
    status: deriveStatus(currentPercentage, course.targetGrade, passingScore),
  };
}

function deriveStatus(
  current: number,
  target: number,
  passingScore: number
): 'Strong' | 'On Track' | 'Needs Focus' | 'At Risk' {
  if (current < passingScore) return 'At Risk';
  const gap = current - target;
  if (current >= 85 || gap >= 2) return 'Strong';
  if (gap >= -3) return 'On Track';
  return 'Needs Focus';
}

export function calculateCumulativeGpa(courses: Course[]): {
  gpa: number;
  weightedAverage: number | null;
  gradedCredits: number;
  totalCredits: number;
} {
  let totalPoints = 0;
  let gradedCredits = 0;
  let totalCredits = 0;
  let weightedPctSum = 0;

  for (const course of courses) {
    totalCredits += course.credits;
    const stats = calculateCourseStats(course);
    if (stats.currentPercentage !== null) {
      totalPoints += stats.gpaPoints * course.credits;
      weightedPctSum += stats.currentPercentage * course.credits;
      gradedCredits += course.credits;
    }
  }

  if (gradedCredits === 0) {
    return { gpa: 0, weightedAverage: null, gradedCredits: 0, totalCredits };
  }

  return {
    gpa: Number((totalPoints / gradedCredits).toFixed(2)),
    weightedAverage: Number((weightedPctSum / gradedCredits).toFixed(1)),
    gradedCredits,
    totalCredits,
  };
}

export function calculateProjectedFinalGrade(
  currentPercentage: number | null,
  completedWeight: number,
  hypotheticalRemainingScore: number
): number {
  if (currentPercentage === null || completedWeight <= 0) {
    return Number(hypotheticalRemainingScore.toFixed(1));
  }
  const cappedCompleted = Math.min(100, completedWeight);
  const remaining = Math.max(0, 100 - cappedCompleted);
  if (remaining === 0) return currentPercentage;
  const projected =
    (currentPercentage * cappedCompleted + hypotheticalRemainingScore * remaining) / 100;
  return Number(projected.toFixed(1));
}

export function calculateRequiredScoreForTarget(
  currentPercentage: number | null,
  completedWeight: number,
  targetGrade: number
): number | null {
  const remaining = Math.max(0, 100 - Math.min(100, completedWeight));
  if (remaining <= 0) return null;
  if (currentPercentage === null || completedWeight <= 0) return targetGrade;
  const needed =
    (targetGrade * 100 - currentPercentage * Math.min(100, completedWeight)) / remaining;
  return Number(needed.toFixed(1));
}

export interface TrajectoryPoint {
  date: string;
  label: string;
  cumulativeAvg: number;
  assignmentScore: number;
  assignmentTitle: string;
  courseCode: string;
}

export function buildTrajectorySeries(courses: Course[]): TrajectoryPoint[] {
  const entries: Array<{
    date: string;
    scorePct: number;
    weight: number;
    title: string;
    courseCode: string;
    credits: number;
  }> = [];

  for (const course of courses) {
    for (const a of course.assignments) {
      const scorePct = a.maxScore > 0 ? (a.score / a.maxScore) * 100 : 0;
      entries.push({
        date: a.date,
        scorePct,
        weight: Math.max(1, a.weight),
        title: a.title,
        courseCode: course.code,
        credits: course.credits,
      });
    }
  }

  entries.sort((a, b) => a.date.localeCompare(b.date));

  let runningWeightedSum = 0;
  let runningWeightTotal = 0;

  return entries.map((entry) => {
    const effectiveWeight = entry.weight * entry.credits;
    runningWeightedSum += entry.scorePct * effectiveWeight;
    runningWeightTotal += effectiveWeight;
    const cumulativeAvg =
      runningWeightTotal > 0 ? Number((runningWeightedSum / runningWeightTotal).toFixed(1)) : 0;
    const d = new Date(entry.date + 'T12:00:00');
    const label = isNaN(d.getTime())
      ? entry.date
      : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    return {
      date: entry.date,
      label,
      cumulativeAvg,
      assignmentScore: Number(entry.scorePct.toFixed(1)),
      assignmentTitle: entry.title,
      courseCode: entry.courseCode,
    };
  });
}

export interface SemesterGpaPoint {
  semester: number;
  semesterGpa: number | null;
  cumulativeGpa: number | null;
  courseCount: number;
  gradedCredits: number;
  totalCredits: number;
}

export function buildSemesterGpaSeries(courses: Course[]): SemesterGpaPoint[] {
  const maxCourseSem = courses.reduce((max, c) => Math.max(max, getCourseSemester(c)), 1);
  const totalSemesters = Math.max(8, Math.min(20, maxCourseSem));

  let runningPoints = 0;
  let runningGradedCredits = 0;

  const series: SemesterGpaPoint[] = [];

  for (let sem = 1; sem <= totalSemesters; sem++) {
    const semCourses = courses.filter((c) => getCourseSemester(c) === sem);
    const semStats = calculateCumulativeGpa(semCourses);

    let semPoints = 0;
    for (const course of semCourses) {
      const stats = calculateCourseStats(course);
      if (stats.currentPercentage !== null) {
        semPoints += stats.gpaPoints * course.credits;
      }
    }

    if (semStats.gradedCredits > 0) {
      runningPoints += semPoints;
      runningGradedCredits += semStats.gradedCredits;
    }

    series.push({
      semester: sem,
      semesterGpa: semStats.gradedCredits > 0 ? semStats.gpa : null,
      cumulativeGpa:
        semStats.gradedCredits > 0 && runningGradedCredits > 0
          ? Number((runningPoints / runningGradedCredits).toFixed(2))
          : null,
      courseCount: semCourses.length,
      gradedCredits: semStats.gradedCredits,
      totalCredits: semStats.totalCredits,
    });
  }

  return series;
}

export function buildAcademicContextSummary(
  courses: Course[],
  term: string,
  targetGpa: number
): string {
  const summary = calculateCumulativeGpa(courses);

  const semesterNumbers: number[] = Array.from(
    new Set<number>(courses.map((c) => getCourseSemester(c)))
  ).sort((a, b) => a - b);

  const semesterBreakdown = semesterNumbers
    .map((sem) => {
      const semCourses = courses.filter((c) => getCourseSemester(c) === sem);
      const semStats = calculateCumulativeGpa(semCourses);
      return `Sem ${sem}: IPS ${semStats.gpa.toFixed(2)} (${semStats.totalCredits} SKS)`;
    })
    .join(' | ');

  const lines: string[] = [
    `Term: ${term}`,
    `Cumulative GPA (IPK across all semesters): ${summary.gpa.toFixed(2)} / 4.00 (Target GPA: ${targetGpa.toFixed(2)})`,
    `Total Enrolled Credits: ${summary.totalCredits} SKS`,
    `Weighted Overall Average: ${summary.weightedAverage !== null ? summary.weightedAverage + '%' : 'N/A'}`,
    ...(semesterBreakdown ? [`Per-Semester Standing: ${semesterBreakdown}`] : []),
    '',
    'Courses & Graded Work by Semester:',
  ];

  const sortedCourses = [...courses].sort(
    (a, b) => getCourseSemester(a) - getCourseSemester(b) || a.code.localeCompare(b.code)
  );

  for (const c of sortedCourses) {
    const stats = calculateCourseStats(c);
    const sem = getCourseSemester(c);
    const req = calculateRequiredScoreForTarget(
      stats.currentPercentage,
      stats.completedWeight,
      c.targetGrade
    );
    lines.push(
      `- [Semester ${sem}] ${c.code} (${c.name}) | ${c.credits} SKS | Current: ${
        stats.currentPercentage !== null ? `${stats.currentPercentage}% (${stats.letterGrade})` : 'No grades'
      } | Target: ${c.targetGrade}% | Passing Grade: ${stats.passingGrade} (>= ${stats.passingScore}%) | Status: ${stats.status} | Completed Weight: ${stats.completedWeight}%${
        req !== null ? ` | Needed on remaining ${stats.remainingWeight}% to hit target: ${req}%` : ''
      }`
    );
    const sortedAssignments = [...c.assignments].sort((a, b) => a.date.localeCompare(b.date));
    for (const a of sortedAssignments) {
      const pct = a.maxScore > 0 ? ((a.score / a.maxScore) * 100).toFixed(1) : '0.0';
      lines.push(
        `    * [${a.date}] ${a.title} (${a.category}, weight ${a.weight}%): ${a.score}/${a.maxScore} (${pct}%) — Topic: ${a.topic || 'General'}`
      );
    }
  }

  return lines.join('\n');
}
