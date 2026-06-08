"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { getCompletedCount, readCourseOutcome } from "@/lib/progress";
import { filterCourses } from "@/lib/course-filter";

type CourseSummary = {
  id: string;
  title: string;
  subtitle?: string;
  totalLessons: number;
  tags: string[];
};

export default function CourseCatalogGrid({ courses }: { courses: CourseSummary[] }) {
  const [progressByCourse, setProgressByCourse] = useState<Record<string, number>>({});
  const [outcomeByCourse, setOutcomeByCourse] = useState<Record<string, {
    scorePercent: number;
    rewardTier: "bronze" | "silver" | "gold" | "platinum";
    completedLessons: number;
    totalLessons: number;
  } | null>>({});

  const [query, setQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const allTags = useMemo(() => {
    const seen = new Set<string>();
    const ordered: string[] = [];
    for (const course of courses) {
      for (const tag of course.tags ?? []) {
        const key = tag.toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          ordered.push(tag);
        }
      }
    }
    return ordered.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  }, [courses]);

  const visibleCourses = useMemo(
    () => filterCourses(courses, { query, selectedTags }),
    [courses, query, selectedTags],
  );

  const toggleTag = (tag: string) => {
    setSelectedTags((current) =>
      current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag],
    );
  };

  useEffect(() => {
    const refreshProgress = () => {
      setProgressByCourse(
        Object.fromEntries(courses.map((course) => [course.id, getCompletedCount(course.id)])),
      );

      setOutcomeByCourse(
        Object.fromEntries(courses.map((course) => [course.id, readCourseOutcome(course.id)])),
      );
    };

    refreshProgress();
    window.addEventListener("storage", refreshProgress);
    window.addEventListener("course-progress-updated", refreshProgress);

    return () => {
      window.removeEventListener("storage", refreshProgress);
      window.removeEventListener("course-progress-updated", refreshProgress);
    };
  }, [courses]);

  return (
    <div className="mt-6">
      <div className="flex flex-col gap-3">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search courses…"
          aria-label="Search courses"
          className="w-full rounded-lg border border-[var(--sand-400)] bg-white px-4 py-2 text-sm text-[var(--green-900)] placeholder:text-[var(--green-700)]/60 focus:border-[var(--green-700)] focus:outline-none"
        />

        {allTags.length > 0 ? (
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by tag">
            {allTags.map((tag) => {
              const active = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleTag(tag)}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                    active
                      ? "border-[var(--green-800)] bg-[var(--green-800)] text-white"
                      : "border-[var(--sand-400)] bg-white text-[var(--green-800)] hover:bg-[var(--sand-100)]"
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      {visibleCourses.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-[var(--sand-300)] bg-white p-5 text-sm text-[var(--green-800)] shadow-sm">
          No courses match your search.
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {visibleCourses.map((course) => {
        const completed = progressByCourse[course.id] ?? 0;
        const started = completed > 0;
        const outcome = outcomeByCourse[course.id];
        const isClosed = Boolean(outcome);
        const percent = course.totalLessons > 0 ? Math.round((completed / course.totalLessons) * 100) : 0;
        const rewardLabel = outcome
          ? outcome.rewardTier.charAt(0).toUpperCase() + outcome.rewardTier.slice(1)
          : null;
        const hasPerfectCompletion = Boolean(outcome && outcome.scorePercent === 100);

        return (
          <article
            key={course.id}
            className={`rounded-2xl border p-5 shadow-sm ${
              isClosed
                ? "border-[var(--earth-500)] bg-[#fcf6ea]"
                : "border-[var(--sand-300)] bg-white"
            }`}
          >
            {hasPerfectCompletion ? (
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#c18f2f] bg-[#fff4d6] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#7a4f00]">
                <span aria-hidden="true">★</span>
                Gold Star Completion
              </div>
            ) : null}

            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--green-700)]">
              {course.totalLessons} lessons
            </p>
            <h2 className="mt-1 text-lg font-bold">{course.title}</h2>
            {course.subtitle ? (
              <p className="mt-2 text-sm text-[var(--green-800)]">{course.subtitle}</p>
            ) : null}

            {course.tags.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {course.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-[var(--sand-100)] px-2 py-0.5 text-[11px] font-medium text-[var(--green-700)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}

            <div className="mt-4 flex items-end justify-between gap-3">
              <Link
                className="inline-flex items-center rounded-lg bg-[var(--green-800)] px-4 py-2 text-sm font-semibold !text-white hover:bg-[var(--green-700)]"
                href={`/courses/${course.id}`}
              >
                {isClosed ? "Review Course" : "Open Course"}
              </Link>

              {isClosed && outcome ? (
                <div className="rounded-lg border border-[var(--earth-600)] bg-white px-3 py-1.5 text-right text-xs font-semibold text-[var(--green-800)]">
                  <p>Closed: {outcome.scorePercent}%</p>
                  <p>Reward: {rewardLabel}</p>
                </div>
              ) : started ? (
                <div className="rounded-lg border border-[var(--sand-300)] bg-[var(--sand-100)] px-3 py-1.5 text-right text-xs font-semibold text-[var(--green-700)]">
                  <p>
                    In Progress {completed}/{course.totalLessons}
                  </p>
                  <p>{percent}%</p>
                </div>
              ) : null}
            </div>
          </article>
        );
      })}
      </div>
    </div>
  );
}
