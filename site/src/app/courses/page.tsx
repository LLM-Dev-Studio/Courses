import Link from "next/link";

import { listCourses } from "@/lib/courses";
import { sortByTitleAsc } from "@/lib/course-filter";
import CourseCatalogGrid from "@/app/courses/CourseCatalogGrid";

export default async function CoursesPage() {
  const courses = sortByTitleAsc(await listCourses());

  return (
    <div className="min-h-screen bg-[var(--jjs-sand-50)] text-[var(--jjs-green-900)]">
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Available Courses</h1>
            <p className="mt-2 text-[var(--jjs-green-700)]">Browse our training courses and start learning today</p>
          </div>

          <Link
            href="/"
            className="inline-flex items-center rounded-lg border border-[var(--jjs-sand-400)] bg-white px-4 py-2 text-sm font-semibold text-[var(--jjs-green-800)] transition hover:bg-[var(--jjs-sand-100)]"
          >
            Home
          </Link>
        </div>

        <CourseCatalogGrid courses={courses} />
      </main>
    </div>
  );
}
