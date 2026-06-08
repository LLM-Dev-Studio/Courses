"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { markdownComponents } from "@/lib/markdown-components";
import { QuizQuestionnaire } from "@/components/QuizQuestionnaire";

import {
  clearCourseOutcome,
  getQuizAnswersKey,
  getRawProgressSnapshot,
  notifyProgressChanged,
  parseProgressSnapshot,
  readProgress,
  readQuizScore,
  saveCourseOutcome,
  saveProgress,
} from "@/lib/progress";

type ModuleItem = {
  id: string;
  title: string;
  lessons: Array<{
    id: string;
    title: string;
    moduleId: string;
    moduleTitle: string;
  }>;
};

type LessonItem = {
  id: string;
  title: string;
  moduleId: string;
  moduleTitle: string;
  content: string;
  lessonType?: "lesson" | "quiz";
  quiz?: {
    passThreshold?: number;
    maxAttempts?: number;
    resetScopeOnFail?: "module" | "course";
    questions: Array<{
      prompt: string;
      options: string[];
      answer: string;
      explanation?: string;
    }>;
  };
};

interface CoursePlayerProps {
  courseId: string;
  title: string;
  subtitle?: string;
  audience?: string;
  totalLessons: number;
  selectedLessonId: string;
  modules: ModuleItem[];
  lessons: LessonItem[];
}

function stripLeadingHeading(markdown: string): string {
  return markdown.replace(/^\s*#\s+.+\r?\n+/, "");
}

function subscribeToProgressStore(callback: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handler = () => callback();
  window.addEventListener("storage", handler);
  window.addEventListener("course-progress-updated", handler);

  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener("course-progress-updated", handler);
  };
}

export default function CoursePlayer({
  courseId,
  title,
  subtitle,
  audience,
  totalLessons,
  selectedLessonId,
  modules,
  lessons,
}: CoursePlayerProps) {
  const router = useRouter();
  const navContainerRef = useRef<HTMLElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const rawProgressSnapshot = useSyncExternalStore(
    subscribeToProgressStore,
    () => getRawProgressSnapshot(courseId),
    () => '{"completedLessonIds":[]}',
  );
  const completedLessonIds = useMemo(() => {
    return parseProgressSnapshot(rawProgressSnapshot).completedLessonIds;
  }, [rawProgressSnapshot]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isQuizComplete, setIsQuizComplete] = useState(false);

  const selectedLesson = useMemo(
    () => lessons.find((lesson) => lesson.id === selectedLessonId) ?? lessons[0],
    [lessons, selectedLessonId],
  );

  const completedSet = useMemo(() => new Set(completedLessonIds), [completedLessonIds]);
  const completedCount = completedSet.size;
  const percent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  const isSelectedLessonCompleted = completedSet.has(selectedLesson.id);
  const isQuizLesson = selectedLesson.lessonType === "quiz" && Boolean(selectedLesson.quiz?.questions?.length);
  const canCloseCourse = !isQuizLesson || isQuizComplete || isSelectedLessonCompleted;
  const quizQuestions = useMemo(
    () => (isQuizLesson ? selectedLesson.quiz?.questions ?? [] : []),
    [isQuizLesson, selectedLesson.quiz?.questions],
  );
  const quizPassThreshold = isQuizLesson ? selectedLesson.quiz?.passThreshold : undefined;
  const quizMaxAttempts = isQuizLesson ? selectedLesson.quiz?.maxAttempts : undefined;
  const quizResetScopeOnFail = isQuizLesson ? selectedLesson.quiz?.resetScopeOnFail : undefined;
  const quizIntroContent = useMemo(
    () => stripLeadingHeading(selectedLesson.content)
      .split("\n")
      .filter((line) => !/^\s*-\s+/.test(line))
      .join("\n"),
    [selectedLesson.content],
  );
  const lessonBodyContent = useMemo(
    () => stripLeadingHeading(selectedLesson.content),
    [selectedLesson.content],
  );

  const moduleStats = useMemo(() => {
    return Object.fromEntries(
      modules.map((courseModule) => {
        const completed = courseModule.lessons.filter((lesson) => completedSet.has(lesson.id)).length;
        const total = courseModule.lessons.length;
        return [
          courseModule.id,
          {
            completed,
            total,
            percent: total > 0 ? Math.round((completed / total) * 100) : 0,
            isComplete: total > 0 && completed === total,
          },
        ];
      }),
    );
  }, [modules, completedSet]);

  const [expandedModuleIds, setExpandedModuleIds] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    for (const courseModule of modules) {
      const completed = courseModule.lessons.filter((lesson) => completedSet.has(lesson.id)).length;
      if (completed > 0 && completed === courseModule.lessons.length) {
        initial.add(courseModule.id);
      }
    }

    if (selectedLesson.moduleId !== "intro") {
      initial.add(selectedLesson.moduleId);
    }

    return initial;
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const hasExplicitLessonInUrl = new URLSearchParams(window.location.search).has("lesson");
    if (hasExplicitLessonInUrl) {
      return;
    }

    const lastLessonId = readProgress(courseId).lastLessonId;
    if (!lastLessonId || lastLessonId === selectedLesson.id) {
      return;
    }

    const isValidLesson = lessons.some((lesson) => lesson.id === lastLessonId);
    if (!isValidLesson) {
      return;
    }

    router.replace(`/courses/${courseId}?lesson=${lastLessonId}`);
  }, [courseId, lessons, router, selectedLesson.id]);

  useEffect(() => {
    saveProgress(courseId, {
      completedLessonIds,
      lastLessonId: selectedLesson.id,
    });
  }, [completedLessonIds, courseId, selectedLesson.id]);

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchInputRef.current?.focus();
        return;
      }

      const target = event.target as HTMLElement | null;
      const isTypingTarget =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;

      if (!isTypingTarget && event.key === "/") {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, []);

  useEffect(() => {
    const container = navContainerRef.current;
    if (!container) return;

    const activeNavItem = container.querySelector<HTMLElement>("[data-active-nav-item='true']");
    if (!activeNavItem) return;

    activeNavItem.scrollIntoView({
      block: "nearest",
      inline: "nearest",
      behavior: "smooth",
    });
  }, [selectedLesson.id]);

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const visibleModules = useMemo(() => {
    return modules
      .map((courseModule) => {
        const moduleMatches = courseModule.title.toLowerCase().includes(normalizedSearch);
        const lessons =
          normalizedSearch.length === 0
            ? courseModule.lessons
            : courseModule.lessons.filter((lesson) => {
                const haystack = `${lesson.title} ${lesson.id}`.toLowerCase();
                return moduleMatches || haystack.includes(normalizedSearch);
              });

        return {
          ...courseModule,
          lessons,
        };
      })
      .filter((courseModule) => courseModule.lessons.length > 0 || normalizedSearch.length === 0);
  }, [modules, normalizedSearch]);

  const { nextLesson, previousLesson } = useMemo(() => {
    const idx = lessons.findIndex((lesson) => lesson.id === selectedLesson.id);
    return {
      nextLesson: idx >= 0 ? lessons[idx + 1] : undefined,
      previousLesson: idx > 0 ? lessons[idx - 1] : undefined,
    };
  }, [lessons, selectedLesson.id]);

  const toggleSelectedLesson = () => {
    const wasAlreadyCompleted = completedSet.has(selectedLesson.id);

    if (isQuizLesson && !isQuizComplete && !wasAlreadyCompleted) {
      return;
    }

    const nextCompletedLessonIds = wasAlreadyCompleted
      ? completedLessonIds.filter((id) => id !== selectedLesson.id)
      : [...completedLessonIds, selectedLesson.id];

    saveProgress(courseId, {
      completedLessonIds: nextCompletedLessonIds,
      lastLessonId: selectedLesson.id,
    });
    clearCourseOutcome(courseId);
    notifyProgressChanged();

    if (!wasAlreadyCompleted && nextLesson) {
      router.push(`/courses/${courseId}?lesson=${nextLesson.id}`);
    }
  };

  const resetProgress = () => {
    if (typeof window !== "undefined") {
      const shouldReset = window.confirm("Reset all saved progress for this course on this device?");
      if (!shouldReset) {
        return;
      }
    }

    saveProgress(courseId, {
      completedLessonIds: [],
      lastLessonId: selectedLesson.id,
    });
    clearCourseOutcome(courseId);
    notifyProgressChanged();
  };

  const clearQuizAnswersForLessonIds = (lessonIds: string[]) => {
    if (typeof window === "undefined") {
      return;
    }

    for (const lessonId of lessonIds) {
      window.localStorage.removeItem(getQuizAnswersKey(courseId, lessonId));
    }
  };

  const handleThresholdQuizFailed = (scope: "module" | "course") => {
    const failedModuleId = selectedLesson.moduleId;
    const failedModule = modules.find((module) => module.id === failedModuleId);
    const failedModuleLessonIds = failedModule ? failedModule.lessons.map((lesson) => lesson.id) : [];

    if (scope === "course") {
      clearQuizAnswersForLessonIds(lessons.map((lesson) => lesson.id));
      saveProgress(courseId, {
        completedLessonIds: [],
        lastLessonId: "intro",
      });
      notifyProgressChanged();
      router.push(`/courses/${courseId}?lesson=intro`);
      return;
    }

    clearQuizAnswersForLessonIds(failedModuleLessonIds);
    const nextCompletedLessonIds = completedLessonIds.filter((lessonId) => !failedModuleLessonIds.includes(lessonId));
    const moduleStartLessonId = failedModule?.lessons[0]?.id ?? "intro";

    saveProgress(courseId, {
      completedLessonIds: nextCompletedLessonIds,
      lastLessonId: moduleStartLessonId,
    });
    notifyProgressChanged();
    router.push(`/courses/${courseId}?lesson=${moduleStartLessonId}`);
  };

  const completeAndContinue = (forceQuizCompletion = false) => {
    if (!nextLesson) return;

    const wasAlreadyCompleted = completedSet.has(selectedLesson.id);
    if (!wasAlreadyCompleted) {
      if (isQuizLesson && !isQuizComplete && !forceQuizCompletion) {
        return;
      }

      saveProgress(courseId, {
        completedLessonIds: [...completedLessonIds, selectedLesson.id],
        lastLessonId: selectedLesson.id,
      });
      clearCourseOutcome(courseId);
      notifyProgressChanged();
    }

    router.push(`/courses/${courseId}?lesson=${nextLesson.id}`);
  };

  const closeCourse = () => {
    if (typeof window === "undefined") {
      return;
    }

    if (!canCloseCourse) {
      return;
    }

    const finalCompletedLessonIds =
      !isSelectedLessonCompleted && (!isQuizLesson || isQuizComplete)
        ? [...completedLessonIds, selectedLesson.id]
        : completedLessonIds;

    const uniqueCompletedLessonIds = Array.from(new Set(finalCompletedLessonIds));
    saveProgress(courseId, {
      completedLessonIds: uniqueCompletedLessonIds,
      lastLessonId: "intro",
    });

    const quizLessons = lessons.filter((lesson) => lesson.lessonType === "quiz" && lesson.quiz?.questions?.length);
    const quizScores = quizLessons
      .map((lesson) =>
        readQuizScore(courseId, lesson.id, lesson.quiz?.questions.length ?? 0, lesson.quiz?.passThreshold),
      )
      .filter((value): value is number => value !== null);

    const completionPercent = totalLessons > 0
      ? Math.round((uniqueCompletedLessonIds.length / totalLessons) * 100)
      : 0;
    const scorePercent = quizScores.length > 0
      ? Math.round(quizScores.reduce((sum, score) => sum + score, 0) / quizScores.length)
      : completionPercent;

    const rewardTier =
      scorePercent >= 95
        ? "platinum"
        : scorePercent >= 85
          ? "gold"
          : scorePercent >= 70
            ? "silver"
            : "bronze";

    saveCourseOutcome(courseId, {
      closedAt: new Date().toISOString(),
      scorePercent,
      rewardTier,
      completedLessons: uniqueCompletedLessonIds.length,
      totalLessons,
    });

    notifyProgressChanged();
    router.push("/courses");
  };

  return (
    <div className="min-h-screen bg-[var(--jjs-sand-50)] text-[var(--jjs-green-900)]">
      <header className="border-b border-[var(--jjs-sand-300)] bg-white/90 backdrop-blur">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-4 px-4 py-4 sm:px-6 lg:grid-cols-[1fr_minmax(280px,420px)_auto] lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[var(--jjs-green-700)]">
              JJ&apos;s Waste & Recycling
            </p>
            <h1 className="text-xl font-bold sm:text-2xl">{title}</h1>
            {subtitle ? <p className="text-sm text-[var(--jjs-green-700)]">{subtitle}</p> : null}
          </div>

          <div>
            <input
              id="lesson-search"
              aria-label="Find lesson"
              ref={searchInputRef}
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search lessons (/, Ctrl+K)"
              className="w-full rounded-lg border border-[var(--jjs-sand-300)] bg-white px-3 py-2 text-sm text-[var(--jjs-green-900)] outline-none transition placeholder:text-[var(--jjs-green-600)] focus:border-[var(--jjs-green-600)] focus:ring-2 focus:ring-[var(--jjs-green-600)]/20"
            />
          </div>

          <div className="flex items-center justify-start gap-2 lg:justify-end">
            <Link
              href="/courses"
              className="rounded-lg border border-[var(--jjs-sand-400)] bg-white px-4 py-2 text-sm font-semibold text-[var(--jjs-green-800)] transition hover:bg-[var(--jjs-sand-100)]"
            >
              Course Catalog
            </Link>
            <div className="rounded-xl border border-[var(--jjs-sand-300)] bg-[var(--jjs-sand-100)] px-4 py-2">
              <p className="text-lg font-bold">{completedCount} / {totalLessons} ({percent}%)</p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[320px_1fr] lg:px-8">
        <aside
          ref={navContainerRef}
          className="max-h-[calc(100vh-10rem)] overflow-y-auto rounded-2xl border border-[var(--jjs-sand-300)] bg-white p-4"
        >
          <nav className="space-y-5" aria-label="Course modules">
            <div>
              <h3 className="text-base font-bold text-[var(--jjs-green-900)]">Course Content</h3>
              <p className="text-sm text-[var(--jjs-green-700)]">{completedCount} of {totalLessons} lessons completed</p>
            </div>

            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--jjs-green-700)]">Core Modules</p>

            <div>
              <Link
                href={`/courses/${courseId}?lesson=intro`}
                data-active-nav-item={selectedLesson.id === "intro" ? "true" : undefined}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                  selectedLesson.id === "intro"
                    ? "bg-[var(--jjs-green-800)] !text-white"
                    : "text-[var(--jjs-green-900)] hover:bg-[var(--jjs-sand-100)]"
                }`}
              >
                <span className={`inline-flex h-4 w-4 items-center justify-center rounded-full border text-[10px] ${
                  completedSet.has("intro")
                    ? "border-[var(--jjs-green-600)] bg-[var(--jjs-green-600)] text-white"
                    : selectedLesson.id === "intro"
                      ? "border-white/80 text-white"
                      : "border-[var(--jjs-sand-400)]"
                }`}>
                  {completedSet.has("intro") ? "✓" : selectedLesson.id === "intro" ? "●" : ""}
                </span>
                <span className={selectedLesson.id === "intro" ? "!text-white" : "text-[var(--jjs-green-900)]"}>Welcome</span>
              </Link>
            </div>

            <div className="rounded-xl bg-[var(--jjs-sand-100)] p-3">
              <p className="text-sm font-semibold text-[var(--jjs-green-800)]">Audience</p>
              <p className="text-sm text-[var(--jjs-green-700)]">{audience ?? "Teams"}</p>
            </div>

            {visibleModules.length === 0 ? (
              <p className="rounded-lg bg-[var(--jjs-sand-100)] px-3 py-2 text-sm text-[var(--jjs-green-700)]">
                No lessons match that search.
              </p>
            ) : null}

            {visibleModules.map((courseModule) => {
              const stats = moduleStats[courseModule.id] ?? { completed: 0, total: courseModule.lessons.length, percent: 0, isComplete: false };
              const isExpanded =
                normalizedSearch.length > 0
                  ? courseModule.lessons.length > 0
                  : expandedModuleIds.has(courseModule.id) || selectedLesson.moduleId === courseModule.id;

              return (
                <div key={courseModule.id} className="rounded-xl border border-[var(--jjs-sand-200)]">
                  <button
                    type="button"
                    onClick={() => {
                      setExpandedModuleIds((current) => {
                        const next = new Set(current);
                        if (next.has(courseModule.id)) {
                          next.delete(courseModule.id);
                        } else {
                          next.add(courseModule.id);
                        }
                        return next;
                      });
                    }}
                    className="w-full rounded-lg px-3 py-2 text-left transition hover:bg-[var(--jjs-sand-100)]"
                    aria-expanded={isExpanded}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--jjs-sand-100)] text-xs font-bold text-[var(--jjs-green-800)]">
                          {courseModule.id}
                        </span>
                        <p className="text-sm font-semibold text-[var(--jjs-green-800)]">{courseModule.title}</p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[var(--jjs-green-700)]">
                        <span>{stats.completed}/{stats.total}</span>
                        <span aria-hidden="true">{isExpanded ? "▾" : "▸"}</span>
                      </div>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-[var(--jjs-sand-200)]">
                      <div
                        className="h-2 rounded-full bg-[var(--jjs-earth-500)] transition-[width]"
                        style={{ width: `${stats.percent}%` }}
                      />
                    </div>
                  </button>

                  {isExpanded ? (
                    <ul className="mt-1 space-y-1 px-2 pb-2">
                      {courseModule.lessons.map((lesson) => {
                        const active = lesson.id === selectedLesson.id;
                        const done = completedSet.has(lesson.id);
                        return (
                          <li key={lesson.id}>
                            <Link
                              href={`/courses/${courseId}?lesson=${lesson.id}`}
                              data-active-nav-item={active ? "true" : undefined}
                              className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition ${
                                active
                                  ? "bg-[var(--jjs-green-800)] !text-white"
                                  : "text-[var(--jjs-green-900)] hover:bg-[var(--jjs-sand-100)]"
                              }`}
                            >
                              <span
                                className={`inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[10px] ${
                                  done
                                    ? "border-[var(--jjs-green-600)] bg-[var(--jjs-green-600)] text-white"
                                    : active
                                      ? "border-white/80 text-white"
                                      : "border-[var(--jjs-sand-400)]"
                                }`}
                              >
                                {done ? "✓" : active ? "●" : ""}
                              </span>
                              <span className={active ? "text-white" : "text-[var(--jjs-green-900)]"}>{lesson.title}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}
                </div>
              );
            })}
          </nav>
        </aside>

        <section className="rounded-2xl border border-[var(--jjs-sand-300)] bg-white p-5 sm:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--jjs-green-700)]">
                {selectedLesson.moduleTitle}
              </p>
              <h2 className="text-2xl font-bold">{selectedLesson.title}</h2>
            </div>

            <div className="flex gap-2">
              {!isQuizLesson ? (
                <button
                  onClick={toggleSelectedLesson}
                  className="rounded-lg bg-[var(--jjs-green-800)] px-4 py-2 text-sm font-semibold !text-white transition hover:bg-[var(--jjs-green-700)]"
                  type="button"
                >
                  {isSelectedLessonCompleted ? "Mark Incomplete" : "Mark Complete"}
                </button>
              ) : (
                <span className="rounded-lg bg-[var(--jjs-sand-100)] px-4 py-2 text-sm font-semibold text-[var(--jjs-green-800)]">
                  {isQuizComplete ? "Quiz Complete" : "Complete Quiz to Continue"}
                </span>
              )}
              <button
                onClick={resetProgress}
                className="rounded-lg border border-[var(--jjs-sand-400)] px-4 py-2 text-sm font-semibold text-[var(--jjs-green-800)] transition hover:bg-[var(--jjs-sand-100)]"
                type="button"
              >
                Reset Progress
              </button>
            </div>
          </div>

          {isQuizLesson ? (
            <section className="space-y-5">
              <article className="markdown-content max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                  {quizIntroContent}
                </ReactMarkdown>
              </article>

              <QuizQuestionnaire
                key={selectedLesson.id}
                courseId={courseId}
                lessonId={selectedLesson.id}
                questions={quizQuestions}
                passThreshold={quizPassThreshold}
                maxAttempts={quizMaxAttempts}
                resetScopeOnFail={quizResetScopeOnFail}
                onAllQuestionsCorrectChange={setIsQuizComplete}
                onFinalQuestionContinue={() => completeAndContinue(true)}
                onThresholdQuizFailed={handleThresholdQuizFailed}
              />
            </section>
          ) : (
            <article className="markdown-content max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                {lessonBodyContent}
              </ReactMarkdown>
            </article>
          )}

          <div className="mt-10 flex flex-wrap justify-between gap-3 border-t border-[var(--jjs-sand-300)] pt-6">
            {previousLesson ? (
              <Link
                href={`/courses/${courseId}?lesson=${previousLesson.id}`}
                className="rounded-lg border border-[var(--jjs-sand-400)] px-4 py-2 text-sm font-semibold text-[var(--jjs-green-800)] hover:bg-[var(--jjs-sand-100)]"
              >
                Previous Lesson
              </Link>
            ) : (
              <span />
            )}

            {nextLesson ? (
              <button
                onClick={isQuizLesson ? () => completeAndContinue() : toggleSelectedLesson}
                disabled={isQuizLesson && !isQuizComplete && !isSelectedLessonCompleted}
                className="rounded-lg bg-[var(--jjs-earth-500)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--jjs-earth-600)] disabled:cursor-not-allowed disabled:opacity-50"
                type="button"
              >
                {isQuizLesson
                  ? (isQuizComplete || isSelectedLessonCompleted ? "Continue" : "Complete Quiz to Continue")
                  : (isSelectedLessonCompleted ? "Mark Incomplete" : "Mark Complete")}
              </button>
            ) : (
              <button
                onClick={closeCourse}
                disabled={!canCloseCourse}
                className="rounded-lg bg-[var(--jjs-green-800)] px-4 py-2 text-sm font-semibold !text-white transition hover:bg-[var(--jjs-green-700)] disabled:cursor-not-allowed disabled:opacity-50"
                type="button"
              >
                {canCloseCourse ? "Close Course" : "Complete Quiz to Close"}
              </button>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
