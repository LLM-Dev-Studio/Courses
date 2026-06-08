"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { readCourseOutcome } from "@/lib/progress";

type HomeCourseSummary = {
  id: string;
  title: string;
  subtitle?: string;
  audience?: string;
  totalLessons: number;
};

export default function HomeAvailableCourses({ courses }: { courses: HomeCourseSummary[] }) {
  const [closedCourseIds, setClosedCourseIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const refreshClosedCourses = () => {
      const closedIds = courses
        .filter((course) => readCourseOutcome(course.id) !== null)
        .map((course) => course.id);

      setClosedCourseIds(new Set(closedIds));
    };

    refreshClosedCourses();
    window.addEventListener("storage", refreshClosedCourses);
    window.addEventListener("course-progress-updated", refreshClosedCourses);

    return () => {
      window.removeEventListener("storage", refreshClosedCourses);
      window.removeEventListener("course-progress-updated", refreshClosedCourses);
    };
  }, [courses]);

  const availableCourses = useMemo(
    () => courses.filter((course) => !closedCourseIds.has(course.id)).slice(0, 5),
    [closedCourseIds, courses],
  );

  if (availableCourses.length === 0) {
    return (
      <div className="mt-4 rounded-2xl border border-[var(--sand-300)] bg-white p-5 text-sm text-[var(--green-800)] shadow-sm">
        All courses are currently closed. Visit the catalog to review completed courses.
      </div>
    );
  }

  return (
    <div className="mt-4 grid gap-4 sm:grid-cols-2">
      {availableCourses.map((course) => (
        <article
          key={course.id}
          className="rounded-2xl border border-[var(--sand-300)] bg-white p-5 shadow-sm"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--green-700)]">
            {course.totalLessons} lessons
          </p>
          <h3 className="mt-1 text-lg font-bold">{course.title}</h3>
          {course.subtitle ? (
            <p className="mt-2 text-sm text-[var(--green-800)]">{course.subtitle}</p>
          ) : null}
          {course.audience ? (
            <p className="mt-2 text-sm text-[var(--green-700)]">Audience: {course.audience}</p>
          ) : null}

          <div className="mt-4">
            <Link
              className="inline-flex items-center rounded-lg bg-[var(--green-800)] px-4 py-2 text-sm font-semibold !text-white hover:bg-[var(--green-700)]"
              href={`/courses/${course.id}`}
            >
              Start Course
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
