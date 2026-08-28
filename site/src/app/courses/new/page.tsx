import fs from "node:fs/promises";
import path from "node:path";

import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { listCourses } from "@/lib/courses";
import { COURSES_ROOT } from "@/lib/course-paths";
import { buildCourseScaffold, scaffoldInputFromForm } from "@/lib/course-scaffold";


async function createCourseAction(formData: FormData) {
  "use server";

  if (process.env.NODE_ENV === "production") {
    redirect("/courses");
  }

  const { courseId, folderName, files } = buildCourseScaffold(scaffoldInputFromForm(formData));

  const existingCourses = await listCourses();
  if (existingCourses.some((course) => course.id === courseId)) {
    throw new Error(`A course with ID '${courseId}' already exists.`);
  }

  const coursePath = path.join(COURSES_ROOT, folderName);

  const exists = await fs
    .access(coursePath)
    .then(() => true)
    .catch(() => false);

  if (exists) {
    throw new Error(`Folder '${folderName}' already exists in courses.`);
  }

  await fs.mkdir(coursePath, { recursive: true });
  await Promise.all(files.map((file) => fs.writeFile(path.join(coursePath, file.path), file.content, "utf-8")));

  revalidatePath("/");
  revalidatePath("/courses");

  redirect(`/courses/${courseId}`);
}

export default function NewCoursePage() {
  const isLocalRuntime = process.env.NODE_ENV !== "production";

  if (!isLocalRuntime) {
    return (
      <div className="min-h-screen bg-[var(--sand-50)] text-[var(--green-900)]">
        <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold">New Course</h1>
          <p className="mt-3 text-[var(--green-700)]">Course scaffolding is available only in local development.</p>
          <div className="mt-6">
            <Link href="/courses" className="rounded-lg border border-[var(--sand-400)] px-4 py-2 text-sm font-semibold text-[var(--green-800)] hover:bg-[var(--sand-100)]">
              Back to Catalog
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--sand-50)] text-[var(--green-900)]">
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-[var(--sand-300)] bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-bold">Create New Course</h1>
          <p className="mt-2 text-sm text-[var(--green-700)]">
            Enter the basics and a starter course structure will be generated locally.
          </p>

          <form action={createCourseAction} className="mt-6 space-y-4">
            <div>
              <label htmlFor="title" className="mb-1 block text-sm font-semibold text-[var(--green-800)]">Course Title</label>
              <input id="title" name="title" required className="w-full rounded-lg border border-[var(--sand-300)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--green-600)] focus:ring-2 focus:ring-[var(--green-600)]/20" placeholder="How to Run Better Toolbox Talks" />
            </div>

            <div>
              <label htmlFor="subtitle" className="mb-1 block text-sm font-semibold text-[var(--green-800)]">Subtitle (Optional)</label>
              <input id="subtitle" name="subtitle" className="w-full rounded-lg border border-[var(--sand-300)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--green-600)] focus:ring-2 focus:ring-[var(--green-600)]/20" placeholder="Practical skills for frontline supervisors" />
            </div>

            <div>
              <label htmlFor="audience" className="mb-1 block text-sm font-semibold text-[var(--green-800)]">Audience (Optional)</label>
              <input id="audience" name="audience" className="w-full rounded-lg border border-[var(--sand-300)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--green-600)] focus:ring-2 focus:ring-[var(--green-600)]/20" placeholder="Operations teams" />
            </div>

            <div>
              <label htmlFor="courseId" className="mb-1 block text-sm font-semibold text-[var(--green-800)]">Course ID (Optional)</label>
              <input id="courseId" name="courseId" className="w-full rounded-lg border border-[var(--sand-300)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--green-600)] focus:ring-2 focus:ring-[var(--green-600)]/20" placeholder="auto-generated from title if blank" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="passThreshold" className="mb-1 block text-sm font-semibold text-[var(--green-800)]">Quiz Pass Threshold (%)</label>
                <input id="passThreshold" name="passThreshold" type="number" min={1} max={100} defaultValue={80} className="w-full rounded-lg border border-[var(--sand-300)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--green-600)] focus:ring-2 focus:ring-[var(--green-600)]/20" />
              </div>

              <div>
                <label htmlFor="maxAttempts" className="mb-1 block text-sm font-semibold text-[var(--green-800)]">Quiz Max Attempts</label>
                <input id="maxAttempts" name="maxAttempts" type="number" min={1} max={10} defaultValue={2} className="w-full rounded-lg border border-[var(--sand-300)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--green-600)] focus:ring-2 focus:ring-[var(--green-600)]/20" />
              </div>
            </div>

            <div>
              <label htmlFor="resetScopeOnFail" className="mb-1 block text-sm font-semibold text-[var(--green-800)]">On Failed Quiz Reset Scope</label>
              <select id="resetScopeOnFail" name="resetScopeOnFail" defaultValue="module" className="w-full rounded-lg border border-[var(--sand-300)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--green-600)] focus:ring-2 focus:ring-[var(--green-600)]/20">
                <option value="module">Module reset (default)</option>
                <option value="course">Course reset</option>
              </select>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <Link href="/" className="rounded-lg border border-[var(--sand-400)] px-4 py-2 text-sm font-semibold text-[var(--green-800)] hover:bg-[var(--sand-100)]">
                Cancel
              </Link>

              <button type="submit" className="rounded-lg bg-[var(--green-800)] px-4 py-2 text-sm font-semibold !text-white hover:bg-[var(--green-700)]">
                Create Course
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
