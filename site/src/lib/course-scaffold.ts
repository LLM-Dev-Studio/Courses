import { slugify } from "@/lib/course-paths";

export type CourseScaffoldInput = {
  title: string;
  subtitle?: string;
  audience?: string;
  courseId?: string;
  passThreshold?: string;
  maxAttempts?: string;
  resetScopeOnFail?: string;
};

export type CourseScaffoldFile = { path: string; content: string };

function toSafeFolderName(input: string) {
  const cleaned = input.trim().replace(/[<>:"/\\|?*]/g, "").replace(/\.+$/g, "");
  return cleaned || "New Course";
}

export function buildCourseScaffold(input: CourseScaffoldInput) {
  const title = input.title.trim();
  if (!title) throw new Error("Title is required.");
  const courseId = slugify(input.courseId?.trim() || title);
  if (!courseId) throw new Error("Unable to derive a valid course ID.");
  const passThreshold = Number.parseInt(input.passThreshold?.trim() || "80", 10);
  const maxAttempts = Number.parseInt(input.maxAttempts?.trim() || "2", 10);
  if (!Number.isFinite(passThreshold) || passThreshold < 1 || passThreshold > 100) throw new Error("Pass threshold must be a whole number between 1 and 100.");
  if (!Number.isFinite(maxAttempts) || maxAttempts < 1 || maxAttempts > 10) throw new Error("Max attempts must be a whole number between 1 and 10.");
  const subtitle = input.subtitle?.trim() || "";
  const audience = input.audience?.trim() || "";
  const resetScopeOnFail = input.resetScopeOnFail?.trim().toLowerCase() === "course" ? "course" : "module";
  const files: CourseScaffoldFile[] = [
    { path: "course.json", content: `${JSON.stringify({ courseId, title, ...(subtitle ? { subtitle } : {}), ...(audience ? { audience } : {}) }, null, 2)}\n` },
    { path: "course-index.md", content: [`# ${title} Course Index`, "", "## Files", "", "- 1-intro.md", "- modules/01/1-module-overview.md", "- modules/01/2-first-lesson.md", "- modules/01/3-module-quiz.md", "", "## Notes", "", "Keep this index updated when adding, removing, or renaming lesson files.", ""].join("\n") },
    { path: "1-intro.md", content: [`---`, `courseId: ${courseId}`, `title: ${title}`, ...(subtitle ? [`subtitle: ${subtitle}`] : []), ...(audience ? [`audience: ${audience}`] : []), "---", "", `# Welcome to ${title}`, "", "This course was generated with the Course Authoring Tool.", "", "## Next Steps", "", "- Edit this intro with your context", "- Add more lessons under modules/", "- Add quizzes using frontmatter", "", "## Key Takeaway", "", "Start simple and iterate quickly.", ""].join("\n") },
    { path: "modules/01/1-module-overview.md", content: "# Module 1 Overview: Getting Started\n\nThis starter module helps you structure your first content set.\n" },
    { path: "modules/01/2-first-lesson.md", content: "# Your First Lesson\n\nAdd your core teaching content here.\n\n## Key Takeaway\n\nOne lesson, one clear objective.\n" },
    { path: "modules/01/3-module-quiz.md", content: `---\nlessonType: quiz\npassThreshold: ${passThreshold}\nmaxAttempts: ${maxAttempts}\nresetScopeOnFail: ${resetScopeOnFail}\nquestions:\n  - prompt: Which file defines course-level metadata in this setup?\n    options:\n      - 1-intro.md frontmatter\n      - package.json\n      - globals.css\n      - README.md\n    answer: 1-intro.md frontmatter\n    explanation: Intro frontmatter is now supported as metadata source.\n---\n\n# Module 1 Quiz\n\nValidate your setup before expanding the course.\n` },
  ];
  return { courseId, folderName: toSafeFolderName(title), files };
}

export function scaffoldInputFromForm(formData: FormData): CourseScaffoldInput {
  return Object.fromEntries(["title", "subtitle", "audience", "courseId", "passThreshold", "maxAttempts", "resetScopeOnFail"].map((key) => [key, String(formData.get(key) ?? "")])) as CourseScaffoldInput;
}
