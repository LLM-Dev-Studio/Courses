import fs from "node:fs/promises";
import path from "node:path";

import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { listCourses } from "@/lib/courses";
import { COURSES_ROOT, slugify } from "@/lib/course-paths";

function toSafeFolderName(input: string): string {
  const cleaned = input
    .trim()
    .replace(/[<>:"/\\|?*]/g, "")
    .replace(/\.+$/g, "");

  return cleaned || "New Course";
}

async function createCourseAction(formData: FormData) {
  "use server";

  if (process.env.NODE_ENV === "production") {
    redirect("/courses");
  }

  const title = String(formData.get("title") ?? "").trim();
  const subtitle = String(formData.get("subtitle") ?? "").trim();
  const audience = String(formData.get("audience") ?? "").trim();
  const requestedCourseId = String(formData.get("courseId") ?? "").trim();
  const requestedPassThreshold = String(formData.get("passThreshold") ?? "").trim();
  const requestedMaxAttempts = String(formData.get("maxAttempts") ?? "").trim();
  const requestedResetScope = String(formData.get("resetScopeOnFail") ?? "module").trim().toLowerCase();

  if (!title) {
    throw new Error("Title is required.");
  }

  const courseId = slugify(requestedCourseId || title);
  if (!courseId) {
    throw new Error("Unable to derive a valid course ID.");
  }

  const parsedPassThreshold = Number.parseInt(requestedPassThreshold || "80", 10);
  const parsedMaxAttempts = Number.parseInt(requestedMaxAttempts || "2", 10);

  if (!Number.isFinite(parsedPassThreshold) || parsedPassThreshold < 1 || parsedPassThreshold > 100) {
    throw new Error("Pass threshold must be a whole number between 1 and 100.");
  }

  if (!Number.isFinite(parsedMaxAttempts) || parsedMaxAttempts < 1 || parsedMaxAttempts > 10) {
    throw new Error("Max attempts must be a whole number between 1 and 10.");
  }

  const resetScopeOnFail = requestedResetScope === "course" ? "course" : "module";

  const existingCourses = await listCourses();
  if (existingCourses.some((course) => course.id === courseId)) {
    throw new Error(`A course with ID '${courseId}' already exists.`);
  }

  const folderName = toSafeFolderName(title);
  const coursePath = path.join(COURSES_ROOT, folderName);

  const exists = await fs
    .access(coursePath)
    .then(() => true)
    .catch(() => false);

  if (exists) {
    throw new Error(`Folder '${folderName}' already exists in courses.`);
  }

  await fs.mkdir(path.join(coursePath, "modules", "01"), { recursive: true });

  const courseManifest = {
    courseId,
    title,
    subtitle: subtitle || undefined,
    audience: audience || undefined,
  };

  await fs.writeFile(
    path.join(coursePath, "course.json"),
    `${JSON.stringify(courseManifest, null, 2)}\n`,
    "utf-8",
  );

  const courseIndexMarkdown = [
    `# ${title} Course Index`,
    "",
    "## Files",
    "",
    "- 1-intro.md",
    "- modules/01/1-module-overview.md",
    "- modules/01/2-first-lesson.md",
    "- modules/01/3-module-quiz.md",
    "",
    "## Notes",
    "",
    "Keep this index updated when adding, removing, or renaming lesson files.",
    "",
  ].join("\n");

  await fs.writeFile(path.join(coursePath, "course-index.md"), courseIndexMarkdown, "utf-8");

  const introFrontmatter = [
    "---",
    `courseId: ${courseId}`,
    `title: ${title}`,
    ...(subtitle ? [`subtitle: ${subtitle}`] : []),
    ...(audience ? [`audience: ${audience}`] : []),
    "---",
    "",
  ].join("\n");

  const introMarkdown = `${introFrontmatter}# Welcome to ${title}\n\nThis course was generated locally using the New Course tool.\n\n## Next Steps\n\n- Edit this intro with your context\n- Add more lessons under modules/\n- Add quizzes using frontmatter\n\n## Key Takeaway\n\nStart simple and iterate quickly.\n`;

  await fs.writeFile(path.join(coursePath, "1-intro.md"), introMarkdown, "utf-8");

  await fs.writeFile(
    path.join(coursePath, "modules", "01", "1-module-overview.md"),
    "# Module 1 Overview: Getting Started\n\nThis starter module helps you structure your first content set.\n",
    "utf-8",
  );

  await fs.writeFile(
    path.join(coursePath, "modules", "01", "2-first-lesson.md"),
    "# Your First Lesson\n\nAdd your core teaching content here.\n\n## Key Takeaway\n\nOne lesson, one clear objective.\n",
    "utf-8",
  );

  await fs.writeFile(
    path.join(coursePath, "modules", "01", "3-module-quiz.md"),
    `---\nlessonType: quiz\npassThreshold: ${parsedPassThreshold}\nmaxAttempts: ${parsedMaxAttempts}\nresetScopeOnFail: ${resetScopeOnFail}\nquestions:\n  - prompt: Which file defines course-level metadata in this setup?\n    options:\n      - 1-intro.md frontmatter\n      - package.json\n      - globals.css\n      - README.md\n    answer: 1-intro.md frontmatter\n    explanation: Intro frontmatter is now supported as metadata source.\n---\n\n# Module 1 Quiz\n\nValidate your setup before expanding the course.\n`,
    "utf-8",
  );

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
