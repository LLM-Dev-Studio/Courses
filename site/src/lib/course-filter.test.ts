import { filterCourses, normalizeTags, sortByCreatedDesc, sortByTitleAsc } from "@/lib/course-filter";

type TestCourse = { title: string; subtitle?: string; tags?: string[] };

const courses: TestCourse[] = [
  { title: "AI for JJ's Waste", subtitle: "Practical AI", tags: ["AI", "Operations"] },
  { title: "How to Create Courses", subtitle: "Authoring guide", tags: ["Platform", "Authoring"] },
  { title: "The Run Sheet", subtitle: "Route data to worksheet", tags: ["J-Track", "Operations"] },
];

describe("normalizeTags", () => {
  it("trims, drops empties, and dedupes case-insensitively keeping first casing", () => {
    expect(normalizeTags(["  AI ", "ai", "", "Operations", "operations"])).toEqual(["AI", "Operations"]);
  });

  it("returns an empty array for non-array input", () => {
    expect(normalizeTags(undefined)).toEqual([]);
    expect(normalizeTags("AI" as unknown as string[])).toEqual([]);
  });

  it("ignores non-string entries", () => {
    expect(normalizeTags(["AI", 5 as unknown as string, null as unknown as string])).toEqual(["AI"]);
  });
});

describe("filterCourses", () => {
  it("returns everything when query and tags are empty", () => {
    expect(filterCourses(courses, { query: "", selectedTags: [] })).toHaveLength(3);
  });

  it("matches query against title, subtitle, and tags (case-insensitive)", () => {
    expect(filterCourses(courses, { query: "ai", selectedTags: [] }).map((c) => c.title)).toEqual([
      "AI for JJ's Waste",
    ]);
    expect(filterCourses(courses, { query: "guide", selectedTags: [] }).map((c) => c.title)).toEqual([
      "How to Create Courses",
    ]);
    expect(filterCourses(courses, { query: "j-track", selectedTags: [] }).map((c) => c.title)).toEqual([
      "The Run Sheet",
    ]);
  });

  it("matches ANY selected tag (OR semantics)", () => {
    const result = filterCourses(courses, { query: "", selectedTags: ["Operations"] });
    expect(result.map((c) => c.title)).toEqual(["AI for JJ's Waste", "The Run Sheet"]);
  });

  it("compares tags case-insensitively", () => {
    expect(filterCourses(courses, { query: "", selectedTags: ["operations"] })).toHaveLength(2);
  });

  it("combines query AND tags", () => {
    const result = filterCourses(courses, { query: "run", selectedTags: ["Operations"] });
    expect(result.map((c) => c.title)).toEqual(["The Run Sheet"]);
  });

  it("returns an empty array when nothing matches", () => {
    expect(filterCourses(courses, { query: "zzz", selectedTags: [] })).toEqual([]);
  });
});

describe("sortByTitleAsc", () => {
  it("sorts by title case-insensitively and does not mutate the input", () => {
    const input = [
      { title: "banana" },
      { title: "Apple" },
      { title: "cherry" },
    ];
    const result = sortByTitleAsc(input);
    expect(result.map((c) => c.title)).toEqual(["Apple", "banana", "cherry"]);
    // original array untouched
    expect(input.map((c) => c.title)).toEqual(["banana", "Apple", "cherry"]);
  });
});

describe("sortByCreatedDesc", () => {
  it("sorts by createdAt descending (newest first) without mutating the input", () => {
    const input = [
      { title: "old", createdAt: 100 },
      { title: "newest", createdAt: 300 },
      { title: "middle", createdAt: 200 },
    ];
    const result = sortByCreatedDesc(input);
    expect(result.map((c) => c.title)).toEqual(["newest", "middle", "old"]);
    expect(input.map((c) => c.createdAt)).toEqual([100, 300, 200]);
  });
});
