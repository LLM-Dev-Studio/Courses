# Course Catalog Search & Tag Filtering Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add keyword search and multi-select tag filtering to the `/courses` catalog page so it stays usable as the course list grows.

**Architecture:** A new `tags: string[]` field flows from each `course.json` through the `courses.ts` data layer into the catalog page. A pure `filterCourses` function (unit-tested) does all matching. The existing `CourseCatalogGrid` client component gains a search box and a tag-chip row, and renders the filtered list.

**Tech Stack:** Next.js 16 (App Router, webpack dev), React 19, TypeScript, Tailwind v4, Vitest (globals + jsdom), `@/` path alias.

**Spec:** `docs/superpowers/specs/2026-06-01-course-catalog-search-and-tags-design.md`

---

## File Structure

- **Create** `site/src/lib/course-filter.ts` — pure tag normalisation + course filtering logic. No React, no fs.
- **Create** `site/src/lib/course-filter.test.ts` — Vitest unit tests for the above.
- **Modify** `site/src/lib/courses.ts` — add `tags` to types, parse it from manifest + frontmatter, return it from `listCourses()`.
- **Modify** `site/src/app/courses/CourseCatalogGrid.tsx` — search input, tag-chip row, filtered grid, empty state, per-card tag chips.
- **Modify** 5 × `courses/<name>/course.json` — backfill `tags`.

---

## Task 1: Pure tag-normalisation + filter module

**Files:**
- Create: `site/src/lib/course-filter.ts`
- Test: `site/src/lib/course-filter.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `site/src/lib/course-filter.test.ts`:

```ts
import { filterCourses, normalizeTags } from "@/lib/course-filter";

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
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cd site && npx vitest run src/lib/course-filter.test.ts`
Expected: FAIL — `Failed to resolve import "@/lib/course-filter"`.

- [ ] **Step 3: Write the implementation**

Create `site/src/lib/course-filter.ts`:

```ts
export interface CourseFilterCriteria {
  query: string;
  selectedTags: string[];
}

export function normalizeTags(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const seen = new Set<string>();
  const result: string[] = [];

  for (const entry of value) {
    if (typeof entry !== "string") {
      continue;
    }
    const trimmed = entry.trim();
    if (!trimmed) {
      continue;
    }
    const key = trimmed.toLowerCase();
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    result.push(trimmed);
  }

  return result;
}

export function filterCourses<T extends { title: string; subtitle?: string; tags?: string[] }>(
  courses: T[],
  criteria: CourseFilterCriteria,
): T[] {
  const query = criteria.query.trim().toLowerCase();
  const selectedTags = criteria.selectedTags.map((tag) => tag.toLowerCase());

  return courses.filter((course) => {
    const tags = course.tags ?? [];

    const matchesQuery =
      query.length === 0 ||
      `${course.title} ${course.subtitle ?? ""} ${tags.join(" ")}`.toLowerCase().includes(query);

    const matchesTags =
      selectedTags.length === 0 ||
      tags.some((tag) => selectedTags.includes(tag.toLowerCase()));

    return matchesQuery && matchesTags;
  });
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `cd site && npx vitest run src/lib/course-filter.test.ts`
Expected: PASS — all tests green.

- [ ] **Step 5: Commit**

```bash
git add site/src/lib/course-filter.ts site/src/lib/course-filter.test.ts
git commit -m "feat: add pure course filter and tag-normalisation helpers"
```

---

## Task 2: Surface `tags` through the data layer

**Files:**
- Modify: `site/src/lib/courses.ts`

No unit test — `listCourses()` reads the live filesystem and has no existing unit coverage. The `tags` parsing reuses `normalizeTags` (already tested in Task 1). Verification is via lint + build in Task 5 and the manual run.

- [ ] **Step 1: Import the normaliser**

In `site/src/lib/courses.ts`, add to the existing import block near the top (after the `gray-matter` import):

```ts
import { normalizeTags } from "@/lib/course-filter";
```

- [ ] **Step 2: Add `tags` to the metadata + summary types**

Add `tags?: string[];` to the `CourseMetadata` type:

```ts
type CourseMetadata = {
  courseId?: string;
  title?: string;
  subtitle?: string;
  audience?: string;
  introFile?: string;
  tags?: string[];
};
```

Add `tags?: string[];` to the `CourseManifest` interface (after `modules?`):

```ts
  modules?: ManifestModule[];
  tags?: string[];
```

Add `tags: string[];` to the `CourseSummary` interface:

```ts
export interface CourseSummary {
  id: string;
  title: string;
  subtitle?: string;
  audience?: string;
  totalLessons: number;
  tags: string[];
}
```

- [ ] **Step 3: Parse `tags` in both metadata extractors**

In `toCourseMetadata`, add `tags` to the returned object:

```ts
  return {
    courseId: pickString(manifest.courseId),
    title: pickString(manifest.title),
    subtitle: pickString(manifest.subtitle),
    audience: pickString(manifest.audience),
    introFile: pickString(manifest.introFile),
    tags: normalizeTags(manifest.tags),
  };
```

In `toIntroFrontmatterMetadata`, add `tags` to the returned object:

```ts
  return {
    courseId: pickString(data.courseId),
    title: pickString(data.title),
    subtitle: pickString(data.subtitle),
    audience: pickString(data.audience),
    tags: normalizeTags(data.tags),
  };
```

- [ ] **Step 4: Return `tags` from `listCourses()`**

In `listCourses()`, the existing `metadata` merge is `{ ...manifestMetadata, ...introMetadata }`. Because `normalizeTags` always returns an array (never `undefined`), an absent-frontmatter `tags: []` would wipe a manifest value. Compute tags explicitly instead. After the `const metadata = { ... }` block and before `summaries.push(...)`, add:

```ts
    const tags = introMetadata.tags?.length ? introMetadata.tags : manifestMetadata.tags ?? [];
```

Then add `tags` to the pushed summary:

```ts
    summaries.push({
      id: metadata.courseId ?? slugify(entry.name),
      title: metadata.title ?? prettifyTitle(entry.name),
      subtitle: metadata.subtitle,
      audience: metadata.audience,
      totalLessons,
      tags,
    });
```

- [ ] **Step 5: Verify it type-checks**

Run: `cd site && npx tsc --noEmit`
Expected: PASS — no type errors. (`CourseSummary.tags` is now required, so any other consumer that constructs a summary will surface here.)

- [ ] **Step 6: Commit**

```bash
git add site/src/lib/courses.ts
git commit -m "feat: parse and expose course tags from the data layer"
```

---

## Task 3: Backfill tags onto the 5 existing courses

**Files:**
- Modify: `courses/AI for Business/course.json`
- Modify: `courses/How to Create Courses/course.json`
- Modify: `courses/AI Dev Studio Fundamentals/course.json`
- Modify: `courses/The Run Sheet/course.json`
- Modify: `courses/J-Track Domestic System Overview/course.json`

- [ ] **Step 1: Add `tags` to each manifest**

Edit each file, adding a `tags` array. Use these exact values:

`courses/AI for Business/course.json`:
```json
{
  "courseId": "ai-for-business",
  "title": "AI for Business",
  "subtitle": "Practical AI for Australian Businesses",
  "audience": "Teams across Australia",
  "tags": ["AI", "Operations", "Beginner"]
}
```

`courses/How to Create Courses/course.json`:
```json
{
  "courseId": "how-to-create-courses",
  "title": "How to Create Courses",
  "subtitle": "A sample course to test every platform feature",
  "audience": "Course creators and admins",
  "tags": ["Platform", "Authoring", "Admin"]
}
```

`courses/AI Dev Studio Fundamentals/course.json`:
```json
{
  "courseId": "ai-dev-studio-fundamentals",
  "title": "AI Dev Studio Fundamentals",
  "subtitle": "Master multi-agent AI orchestration for software development",
  "audience": "Developers",
  "tags": ["AI", "Development", "Advanced"]
}
```

- [ ] **Step 2: Verify all five files are valid JSON**

Run: `cd site && node -e "const fs=require('fs');for(const p of process.argv.slice(1)){JSON.parse(fs.readFileSync(p,'utf8'));console.log('OK',p)}" "../courses/AI for Business/course.json" "../courses/How to Create Courses/course.json" "../courses/AI Dev Studio Fundamentals/course.json" "../courses/The Run Sheet/course.json" "../courses/J-Track Domestic System Overview/course.json"`
Expected: `OK` printed for all five paths, no parse error.

- [ ] **Step 3: Commit**

```bash
git add "courses/AI for Business/course.json" "courses/How to Create Courses/course.json" "courses/AI Dev Studio Fundamentals/course.json"
git commit -m "feat: tag the five existing courses"
```

---

## Task 4: Search box + tag chips in the catalog grid

**Files:**
- Modify: `site/src/app/courses/CourseCatalogGrid.tsx`

- [ ] **Step 1: Update the component's prop type and imports**

At the top of `site/src/app/courses/CourseCatalogGrid.tsx`, change the React import to include `useMemo` and add the filter import:

```tsx
import { useEffect, useMemo, useState } from "react";

import { getCompletedCount, readCourseOutcome } from "@/lib/progress";
import { filterCourses } from "@/lib/course-filter";
```

Add `tags` to the `CourseSummary` type used by this component:

```tsx
type CourseSummary = {
  id: string;
  title: string;
  subtitle?: string;
  totalLessons: number;
  tags: string[];
};
```

- [ ] **Step 2: Add search + selected-tag state and derived values**

Inside `CourseCatalogGrid`, after the existing `useState` declarations for progress/outcome, add:

```tsx
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
```

- [ ] **Step 3: Render the search box and tag chips above the grid**

Change the component's returned JSX so the outer element is a fragment-free wrapping `<div>` containing the controls and then the grid. Replace the opening `return (` block up to and including the grid's opening `<div ...>` tag. The current code is:

```tsx
  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2">
      {courses.map((course) => {
```

Replace it with:

```tsx
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
```

- [ ] **Step 4: Close the new wrapper and render per-card tag chips**

Two edits inside the `.map(...)`:

(a) Add a tag-chip row to each card. Immediately after the closing tag of the `subtitle` block (the line `) : null}` that follows the `course.subtitle` paragraph), insert:

```tsx
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
```

(b) The original component ended with:

```tsx
        );
      })}
    </div>
  );
}
```

Because we added an outer `<div className="mt-6">`, add one more closing `</div>`:

```tsx
        );
      })}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Verify it type-checks and lints**

Run: `cd site && npx tsc --noEmit && npx eslint src/app/courses/CourseCatalogGrid.tsx`
Expected: PASS — no type or lint errors.

- [ ] **Step 6: Commit**

```bash
git add site/src/app/courses/CourseCatalogGrid.tsx
git commit -m "feat: add search box and tag filtering to the course catalog"
```

---

## Task 5: Full verification

**Files:** none (verification only)

- [ ] **Step 1: Run the full unit-test suite**

Run: `cd site && npm test`
Expected: PASS — all suites green, including the new `course-filter.test.ts`.

- [ ] **Step 2: Lint and type-check the whole project**

Run: `cd site && npm run lint && npx tsc --noEmit`
Expected: PASS — no errors.

- [ ] **Step 3: Production build**

Run: `cd site && npm run build`
Expected: PASS — build completes without errors.

- [ ] **Step 4: Manual smoke check**

Run: `cd site && npm run dev` and open `http://localhost:3000/courses`. Confirm:
- The search box and a row of tag chips appear above the grid.
- Typing `ai` narrows the list to AI courses.
- Clicking `Operations` then `J-Track` shows courses with either tag (OR).
- Search + a selected tag narrow together (AND).
- A nonsense query shows the "No courses match your search." card.
- Each card shows its own tag chips; progress/closed badges still render.

Stop the dev server when done (Ctrl+C).

- [ ] **Step 5: Final confirmation**

No commit needed — all work was committed per task. Report results.
