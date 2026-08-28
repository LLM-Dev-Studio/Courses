# Course Manifest and Structure

A course is discovered from its folder and `course.json` manifest.

## Example Layout

```text
Courses/
  How to Create Courses/
    course.json
    1-intro.md
    modules/
      01/
        1-module-overview.md
```

## Required Manifest Fields

| Field | Purpose |
| --- | --- |
| `courseId` | Route and storage key |
| `title` | Displayed course title |
| `modules` | Ordered module list |
| `introFile` | Intro lesson file |

> [!WARNING]
> Keep lesson IDs unique across the course.

## Setting Up a Downloaded Starter ZIP

The deployed landing page includes a **Download Starter ZIP** authoring tool. Enter the course basics, download the archive, and unzip it locally. The ZIP contains a complete starter folder:

```text
Your Course Title/
  course.json
  course-index.md
  1-intro.md
  modules/
    01/
      1-module-overview.md
      2-first-lesson.md
      3-module-quiz.md
```

Move the unpacked folder into this repository's `Courses/` directory, then edit `course.json`, the intro, and the starter lessons. Keep the folder name readable, keep `courseId` URL-safe and unique, and update `course-index.md` whenever you add or rename lessons. The ZIP is a starting point, not a catalog submission by itself; after customizing it, follow the branching, review, and deployment workflow in Module 3.

## Key Takeaway

Treat your manifest as the source of truth for navigation, and treat the downloaded ZIP as a local starting point for a branch.

## Quiz Policy Frontmatter

Threshold-based quizzes can now declare policy in frontmatter:

```yaml
passThreshold: 80
maxAttempts: 2
resetScopeOnFail: module
```

- `passThreshold` turns on threshold mode
- `maxAttempts` controls total quiz retries in threshold mode
- `resetScopeOnFail` supports `module` (default) or `course`
