export type CourseProgressState = {
  completedLessonIds: string[];
  lastLessonId?: string;
};

export type CourseRewardTier = "bronze" | "silver" | "gold" | "platinum";

export type CourseOutcomeState = {
  closedAt: string;
  scorePercent: number;
  rewardTier: CourseRewardTier;
  completedLessons: number;
  totalLessons: number;
};

const DEFAULT_PROGRESS_SNAPSHOT = '{"completedLessonIds":[]}';

export function getProgressKey(courseId: string): string {
  return `course_progress_v1::${courseId}`;
}

export function getCourseOutcomeKey(courseId: string): string {
  return `course_outcome_v1::${courseId}`;
}

export function getRawProgressSnapshot(courseId: string): string {
  if (typeof window === "undefined") {
    return DEFAULT_PROGRESS_SNAPSHOT;
  }

  return window.localStorage.getItem(getProgressKey(courseId)) ?? DEFAULT_PROGRESS_SNAPSHOT;
}

export function parseProgressSnapshot(rawSnapshot: string): CourseProgressState {
  try {
    const parsed = JSON.parse(rawSnapshot) as Partial<CourseProgressState>;
    return {
      completedLessonIds: Array.isArray(parsed.completedLessonIds) ? parsed.completedLessonIds : [],
      lastLessonId: typeof parsed.lastLessonId === "string" ? parsed.lastLessonId : undefined,
    };
  } catch {
    return { completedLessonIds: [] };
  }
}

export function readProgress(courseId: string): CourseProgressState {
  return parseProgressSnapshot(getRawProgressSnapshot(courseId));
}

export function saveProgress(courseId: string, progress: CourseProgressState): void {
  if (typeof window === "undefined") {
    return;
  }

  const payload: CourseProgressState = {
    completedLessonIds: Array.from(new Set(progress.completedLessonIds)),
    lastLessonId: progress.lastLessonId,
  };

  window.localStorage.setItem(getProgressKey(courseId), JSON.stringify(payload));
}

export function readCourseOutcome(courseId: string): CourseOutcomeState | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(getCourseOutcomeKey(courseId));
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<CourseOutcomeState>;
    const rewardTier = parsed.rewardTier;
    const normalizedRewardTier: CourseRewardTier =
      rewardTier === "platinum" || rewardTier === "gold" || rewardTier === "silver" || rewardTier === "bronze"
        ? rewardTier
        : "bronze";

    const scorePercent =
      typeof parsed.scorePercent === "number" && Number.isFinite(parsed.scorePercent)
        ? Math.max(0, Math.min(100, Math.round(parsed.scorePercent)))
        : 0;

    const completedLessons =
      typeof parsed.completedLessons === "number" && Number.isFinite(parsed.completedLessons)
        ? Math.max(0, Math.round(parsed.completedLessons))
        : 0;

    const totalLessons =
      typeof parsed.totalLessons === "number" && Number.isFinite(parsed.totalLessons)
        ? Math.max(0, Math.round(parsed.totalLessons))
        : 0;

    return {
      closedAt: typeof parsed.closedAt === "string" ? parsed.closedAt : new Date().toISOString(),
      scorePercent,
      rewardTier: normalizedRewardTier,
      completedLessons,
      totalLessons,
    };
  } catch {
    return null;
  }
}

export function saveCourseOutcome(courseId: string, outcome: CourseOutcomeState): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(getCourseOutcomeKey(courseId), JSON.stringify(outcome));
}

export function clearCourseOutcome(courseId: string): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(getCourseOutcomeKey(courseId));
}

export function notifyProgressChanged(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event("course-progress-updated"));
}

export function getCompletedCount(courseId: string): number {
  const progress = readProgress(courseId);
  return progress.completedLessonIds.length;
}

export function getQuizAnswersKey(courseId: string, lessonId: string): string {
  return `course_quiz_answers_v1::${courseId}::${lessonId}`;
}

export function readQuizScore(
  courseId: string,
  lessonId: string,
  questionCount: number,
  passThreshold?: number,
): number | null {
  if (typeof window === "undefined") return null;
  if (questionCount === 0) return null;

  const raw = window.localStorage.getItem(getQuizAnswersKey(courseId, lessonId));
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as { answeredCorrectly?: boolean[]; thresholdPassed?: boolean };
    const correctCount = Array.isArray(parsed.answeredCorrectly)
      ? parsed.answeredCorrectly.filter(Boolean).length
      : 0;

    let score = Math.round((correctCount / questionCount) * 100);
    if (score === 0 && parsed.thresholdPassed && typeof passThreshold === "number") {
      score = passThreshold;
    }

    return Math.max(0, Math.min(100, score));
  } catch {
    return null;
  }
}
