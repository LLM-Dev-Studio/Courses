import Link from "next/link";

import HomeAvailableCourses from "@/app/HomeAvailableCourses";
import { listCourses } from "@/lib/courses";
import { sortByCreatedDesc } from "@/lib/course-filter";

export default async function Home() {
  const courses = sortByCreatedDesc(await listCourses());
  const isLocalRuntime = process.env.NODE_ENV !== "production";

  return (
    <div className="min-h-screen bg-[var(--jjs-sand-50)] text-[var(--jjs-green-900)]">
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="rounded-3xl border border-[var(--jjs-sand-300)] bg-white p-8 shadow-sm sm:p-12">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-[var(--jjs-green-700)]">
                AI Dev Studio
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                AI Learning Hub
              </h1>
              <p className="mt-4 max-w-3xl text-base text-[var(--jjs-green-800)] sm:text-lg">
                Practical AI learning for Australian waste and recycling teams. No login required,
                progress saved locally on this device.
              </p>
            </div>

            <Link
              href="/courses"
              className="inline-flex items-center rounded-lg border border-[var(--jjs-sand-400)] bg-white px-4 py-2 text-sm font-semibold text-[var(--jjs-green-800)] transition hover:bg-[var(--jjs-sand-100)]"
            >
              Course Catalog
            </Link>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-bold">Available Courses</h2>

          <HomeAvailableCourses courses={courses} />
        </section>

        {isLocalRuntime ? (
          <section className="mt-10 rounded-2xl border border-[var(--jjs-sand-300)] bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold">Local Authoring Tools</h2>
                <p className="mt-1 text-sm text-[var(--jjs-green-700)]">
                  Create a new course scaffold from the browser while running locally.
                </p>
              </div>

              <Link
                href="/courses/new"
                className="inline-flex items-center rounded-lg bg-[var(--jjs-green-800)] px-4 py-2 text-sm font-semibold !text-white hover:bg-[var(--jjs-green-700)]"
              >
                New Course
              </Link>
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}
