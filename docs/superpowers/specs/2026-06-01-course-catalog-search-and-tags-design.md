# Course Catalog: Search & Tag Filtering — Design

**Date:** 2026-06-01
**Status:** Approved

## Problem

The course catalog page (`/courses`) renders a flat, ungrouped grid of every course. With only five courses today this is fine, but the list will soon grow large enough that learners can't scan it. We need to let people **search** by keyword and **filter by category** so the catalog stays usable as it grows.

## Goals

- Search courses by keyword (title, subtitle, tags).
- Filter courses by one or more tags (categories).
- Keep the existing progress/outcome tracking on each card untouched.
- Keep the data model simple for course authors to maintain.

## Non-goals

- Searching inside lesson content (only course-level metadata).
- Changing the home page "Available Courses" list — it stays a separate curated view.
- A managed/approved master tag list — tags are free-form per course for now.

## Decisions

| Decision | Choice |
|---|---|
| Category model | **Multiple free-form tags per course** (`tags: string[]`) |
| Search scope | **title + subtitle + tags** (case-insensitive substring) |
| Tag filter semantics | **Multi-select, OR** (course matches if it has *any* selected tag) |
| Search × tags | **AND** — a course must satisfy both the query and the tag filter |
| Backfill | Tag all 5 existing courses now (table below) |
| Scope | `/courses` catalog page only |

## Data model — `tags` on each course

Add an optional `tags: string[]` to each `course.json`, also supported as intro-markdown frontmatter to match the existing metadata pattern.

In `site/src/lib/courses.ts`:
- Extend `CourseMetadata` and `CourseSummary` with `tags?: string[]`.
- Add a `pickStringArray(value): string[] | undefined` helper (returns the array only if it's an array of strings).
- Parse `tags` from manifest and intro frontmatter; precedence `intro ?? manifest ?? []`.
- Normalise: trim each tag, drop empty strings, dedupe case-insensitively (first-seen casing wins).
- `listCourses()` returns `tags` on every summary.

## Filtering logic — pure, testable function

New module `site/src/lib/course-filter.ts`:

```ts
export interface CourseFilterCriteria {
  query: string;
  selectedTags: string[];
}

export function filterCourses<T extends { title: string; subtitle?: string; tags?: string[] }>(
  courses: T[],
  criteria: CourseFilterCriteria,
): T[];
```

Behaviour:
- **Search**: trim and lowercase `query`; match as a substring against `title + " " + subtitle + " " + tags.join(" ")` (also lowercased). Empty query matches everything.
- **Tags**: empty `selectedTags` matches everything; otherwise the course must contain *at least one* selected tag (case-insensitive compare).
- **Combine**: AND — both conditions must pass.

This is unit-tested with Vitest in isolation, with no rendering.

## UI — search box + tag chips in `CourseCatalogGrid`

`site/src/app/courses/CourseCatalogGrid.tsx` (already a client component) gains:

- A **search input** at the top — controlled local state, no debounce (the list is small).
- A **tag chip row** built from the alphabetically-sorted union of all course tags. Chips toggle on click; selected chips use the green accent styling (`--jjs-green-*`). Multi-select, OR.
- The grid maps over `filterCourses(courses, { query, selectedTags })` instead of the raw `courses` prop.
- An **empty state** card ("No courses match your search") when the filtered list is empty.
- Each course card shows its own tags as small muted chips, so the taxonomy is visible, not just filterable.
- Progress and outcome tracking remain exactly as they are.

Styling reuses the existing `--jjs-*` CSS variables.

## Tag backfill for existing courses

| Course | `courseId` | Tags |
|---|---|---|
| AI for JJ's Waste & Recycling | `ai-for-jjs-business` | `AI`, `Operations`, `Beginner` |
| How to Create Courses | `how-to-create-courses` | `Platform`, `Authoring`, `Admin` |
| AI Dev Studio Fundamentals | `ai-dev-studio-fundamentals` | `AI`, `Development`, `Advanced` |
| The Run Sheet | `jtrack-run-sheet` | `J-Track`, `Development`, `Operations` |
| J-Track Domestic: System Overview | `jtrack-domestic-system-overview` | `J-Track`, `Development`, `Beginner` |

Resulting tag universe: `AI`, `Operations`, `Beginner`, `Platform`, `Authoring`, `Admin`, `Development`, `Advanced`, `J-Track`.

## Testing

- Unit tests for `filterCourses`: empty query/tags, query-only match, tag-only OR match, combined AND, case-insensitivity, no-match → empty.
- Existing catalog/navigation behaviour stays green.
