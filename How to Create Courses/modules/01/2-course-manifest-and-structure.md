# Course Manifest and Structure

A course is discovered from its folder and `course.json` manifest.

## Example Layout

```text
courses/
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

## Key Takeaway

Treat your manifest as the source of truth for navigation.

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
