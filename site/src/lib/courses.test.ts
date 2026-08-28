import { getCourseById, listCourses, mergeCourseMetadata } from "@/lib/courses";

// These exercise resolveCourseEntry/listCourses/getCourseById against the
// real courses/ content directory (no fs mocking) since that content is
// always present alongside the app and gives a truer regression signal for
// manifest + intro-frontmatter resolution than a synthetic fixture would.
describe("listCourses", () => {
  it("discovers every course folder and resolves its metadata", async () => {
    const courses = await listCourses();

    expect(courses.length).toBeGreaterThanOrEqual(3);
    const titles = courses.map((course) => course.title);
    expect(titles).toEqual(expect.arrayContaining(["AI for Business", "How to Create Courses"]));

    for (const course of courses) {
      expect(course.id).toBeTruthy();
      expect(course.title).toBeTruthy();
      expect(course.totalLessons).toBeGreaterThan(0);
    }
  });
});

describe("getCourseById", () => {
  it("resolves a known course id to its intro lesson and modules", async () => {
    const [course] = await listCourses();

    const resolved = await getCourseById(course.id);

    expect(resolved).not.toBeNull();
    expect(resolved?.id).toBe(course.id);
    expect(resolved?.intro.id).toBe("intro");
    expect(resolved?.modules.length).toBeGreaterThan(0);
  });

  it("returns null for an id that matches no course", async () => {
    const resolved = await getCourseById("does-not-exist-course-id");

    expect(resolved).toBeNull();
  });
});

describe("mergeCourseMetadata", () => {
  it("keeps manifest values when the intro override is undefined", () => {
    const manifest = {
      title: "AI for Business",
      subtitle: "Practical AI",
      audience: "Staff",
    };
    const intro = {
      title: undefined,
      subtitle: undefined,
      audience: undefined,
    };

    expect(mergeCourseMetadata(manifest, intro)).toEqual(manifest);
  });

  it("lets defined intro values override the manifest", () => {
    const manifest = { title: "Folder Title", subtitle: "Manifest subtitle" };
    const intro = { title: "Intro Title" };

    expect(mergeCourseMetadata(manifest, intro)).toEqual({
      title: "Intro Title",
      subtitle: "Manifest subtitle",
    });
  });

  it("does not mutate either input", () => {
    const manifest = { title: "Base" };
    const intro = { title: "Override" };

    mergeCourseMetadata(manifest, intro);

    expect(manifest).toEqual({ title: "Base" });
    expect(intro).toEqual({ title: "Override" });
  });
});
