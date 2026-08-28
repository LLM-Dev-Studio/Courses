# How to Write a Course for the AI Learning Hub

You are generating content for a Next.js course platform ("the AI Learning Hub"). Courses are
plain folders of Markdown files under a `Courses/` directory at the repository root, discovered
automatically at build/request time — there is no database and no course editor UI in production.

Your job when asked to write a course: produce a complete, valid folder of files following the
exact structure and syntax below. Output each file as its full relative path followed by its
complete content (a fenced code block per file is ideal). Do not omit files, and do not invent
fields or syntax that aren't documented here.

## 1. Folder layout

```text
Courses/
  <Course Folder Name>/
    course.json
    course-index.md
    1-intro.md
    images/
      <descriptive-name>.svg
    modules/
      01/
        1-module-overview.md
        2-<lesson-slug>.md
        3-<lesson-slug>.md
        4-<module-quiz-slug>.md
      02/
        1-module-overview.md
        ...
```

Rules:

- `<Course Folder Name>` is a human-readable directory name (spaces allowed), e.g.
  `Courses/Selling With Confidence/`.
- `course.json` and `1-intro.md` live directly in the course folder.
- Every module is a numbered subfolder of `modules/` (`01`, `02`, `03`, ...), zero-padded, in
  the order the module should appear.
- Every lesson inside a module is a file named `<n>-<slug>.md`, where `<n>` is a leading integer
  used only for ordering (files sort numerically, then alphabetically) and `<slug>` is
  kebab-case and description-only — it is never read as an ID by the app.
- The **first lesson file in every module** (lowest number) must be its overview lesson and
  should be named `1-module-overview.md`.
- Do not reuse the same leading number twice inside one module folder.

## 2. `course.json` — the manifest

Minimal required shape:

```json
{
  "courseId": "selling-with-confidence",
  "title": "Selling With Confidence",
  "subtitle": "A practical course on outbound sales conversations",
  "audience": "New sales reps",
  "tags": ["Sales", "Communication"]
}
```

Field rules:

| Field | Required | Notes |
| --- | --- | --- |
| `courseId` | Yes | Lowercase, URL-safe (`a-z0-9-`), unique across all courses. Becomes the route `/courses/<courseId>`. Derive it by slugifying the title if not otherwise specified. |
| `title` | Yes | Displayed course title. |
| `subtitle` | No | One-line description shown on the catalog card. |
| `audience` | No | Who the course is for. |
| `tags` | No | Array of short strings used for catalog filtering. |

Do **not** add a `modules` array or `introFile` field — module and lesson structure is
discovered automatically from the filesystem (see Section 1), not declared in the manifest.
Only set `introFile` if the intro file is deliberately not named `1-intro.md` (rare; prefer the
default name instead).

Any of `courseId`, `title`, `subtitle`, `audience`, or `tags` may instead (or additionally) be
set via frontmatter in `1-intro.md` (Section 3) — frontmatter values there override
`course.json` when both are present. Simplest approach: put all metadata in `course.json` and
keep intro frontmatter minimal.

## 3. `1-intro.md` — the intro lesson

```markdown
---
courseId: selling-with-confidence
title: Selling With Confidence
subtitle: A practical course on outbound sales conversations
audience: New sales reps
---

# Welcome to Selling With Confidence

One or two sentences on what this course covers and why it matters.

## What You Will Learn

- Bullet list of the concrete skills or outcomes

## Key Takeaway

One sentence the learner should remember above all else.
```

The frontmatter block is optional but recommended — repeat the same values as `course.json` so
the course is self-describing even if the manifest changes later.

## 4. Lesson file structure

Every lesson (including module overviews) is a Markdown file, structured like this:

```markdown
# <Lesson Title as an H1>

One sentence of context: why this lesson matters right now.

## <Core concept as an H2>

The one thing this lesson teaches, explained plainly.

## Practical Steps

1. Step one
2. Step two

## Key Takeaway

A single, clear, memorable sentence. Every non-quiz lesson should end with a "Key Takeaway"
section.
```

Guidance:

- Exactly one H1 per file (the lesson title). If omitted, the app derives a title from the
  filename instead (strips the leading number, replaces hyphens with spaces, title-cases it) —
  always include an explicit H1 so you control the displayed title.
- The **first lesson in a module** (`1-module-overview.md`) should have an H1 in the form
  `Module <n> Overview: <Module Title>` (e.g. `# Module 1 Overview: Discovery Calls`) — the app
  extracts `<Module Title>` from this pattern to label the module in navigation. If this pattern
  isn't found, the module is labeled generically as `Module <n>`.
- Keep lessons short and scannable: context → core concept → practical steps → key takeaway.
- Prefer plain prose, short lists, and small tables over long paragraphs.
- Standard GitHub-Flavored Markdown is supported: headings, lists, tables, links, images, inline
  code, fenced code blocks (with language tags), bold/italic.

### Callouts

Use GitHub-style alert blockquotes for anything that should stand out. Exactly six types are
supported, written as `> [!TYPE]` followed by blockquote lines:

```markdown
> [!NOTE]
> Neutral context or background information.

> [!TIP]
> Practical advice or a shortcut the learner can act on immediately.

> [!WARNING]
> A gotcha, common mistake, or something that could cause problems if missed.

> [!SUCCESS]
> Reinforces a positive outcome or confirms the learner is on the right track.

> [!INFORMATION]
> Reference material or supplementary detail the learner may want but doesn't strictly need.

> [!IMPORTANT]
> A critical point the learner must not miss — a requirement, prerequisite, or consequence.
```

Do not invent other callout types (e.g. `[!DANGER]`, `[!INFO]`) — only the six above are
recognized; anything else renders as a plain blockquote.

> [!IMPORTANT]
> The callout body must be a single physical line in the source file, however long the sentence is — never wrap it onto a second `>` line.

The renderer's marker-detection regex cannot match across an embedded line break inside the
blockquote. A body written like this:

```markdown
> [!TIP]
> This sentence is long enough that a human
> would naturally wrap it across two lines.
```

silently fails to render as a styled callout at all — it falls back to a plain, undecorated
blockquote showing the literal `[!TIP]` marker text on screen instead of the colored callout box.
Always write the entire body as one line in the source, however long:

```markdown
> [!TIP]
> This sentence is long enough that a human would naturally wrap it across two lines, but it must stay on one line in the source anyway.
```

If a callout genuinely needs multiple paragraphs or a list, keep each paragraph or list item as
its own single unwrapped line, still prefixed with `>`, with no blank line between them (a blank
`>` line splits it into a second, unstyled blockquote).

### Images

Store image files inside the course's own folder — never in the site's codebase — typically
under `images/` (e.g. `Courses/<Course Folder Name>/images/knot-diagram.svg`). Supported
extensions: `.svg`, `.png`, `.jpg` / `.jpeg`, `.gif`, `.webp`, `.avif`.

Reference an image in markdown with a site-absolute URL of this exact form:

```text
/courses/<courseId>/assets/<path-relative-to-the-course-folder>
```

For example, an image at `Courses/Selling With Confidence/images/rapport-diagram.svg` in the
`selling-with-confidence` course is referenced as:

```markdown
![Diagram of building rapport in the first 30 seconds of a call](/courses/selling-with-confidence/assets/images/rapport-diagram.svg)
```

This is served by a generic, course-agnostic route already built into the platform — it works
for any course's own `images/` folder without any site code changes. Do not use a bare relative
path like `images/foo.svg` or an absolute `/images/...` path — neither resolves correctly.

> [!WARNING]
> Always write real alt text describing what the image shows — it's the only description a screen reader gets, and the only one available if the image fails to load.

## 5. Quizzes

A quiz is a lesson file whose frontmatter declares `lessonType: quiz`. Quizzes are placed as the
last lesson file in a module (highest leading number).

```markdown
---
lessonType: quiz
passThreshold: 80
maxAttempts: 2
resetScopeOnFail: module
questions:
  - prompt: What is the first thing to establish on a discovery call?
    options:
      - The prospect's budget
      - The prospect's actual problem
      - Your product's pricing tiers
      - The competitor they currently use
    answer: The prospect's actual problem
    explanation: Understanding the problem before pitching a solution keeps the call relevant.
  - prompt: True or false — you should always lead with a demo.
    options:
      - "True"
      - "False"
    answer: "False"
---

# Module 1 Quiz

Check your understanding before moving on.
```

Field rules:

- `lessonType: quiz` is required to mark the file as a quiz (otherwise `questions` is ignored
  and it's treated as a normal lesson).
- `questions` is a list of at least one question. Each question needs:
  - `prompt` — string, the question text.
  - `options` — array of at least 2 strings.
  - `answer` — string that must exactly match one entry in `options`.
  - `explanation` — optional string shown after answering.
- `passThreshold` (integer 1–100, optional) — turns on threshold mode: the learner must score
  at least this percentage to pass.
- `maxAttempts` (integer 1–10, optional, only meaningful with `passThreshold`) — how many times
  the learner may retry the quiz.
- `resetScopeOnFail` — `"module"` (default) or `"course"` — what gets reset if the learner
  exhausts attempts without passing.
- Without `passThreshold`, the quiz behaves as a simple per-question check-and-continue flow
  (wrong answers get visual feedback; after enough attempts the correct option is revealed and
  the learner can proceed) rather than a scored gate.
- Body content below the frontmatter (the `# Module 1 Quiz` heading etc.) is shown above the
  questions — keep it short, e.g. a one-line intro.

## 6. `course-index.md`

A plain-text (not machine-parsed) file listing every file in the course, for human maintainers:

```markdown
# Selling With Confidence Course Index

## Files

- 1-intro.md
- modules/01/1-module-overview.md
- modules/01/2-establishing-rapport.md
- modules/01/3-discovery-questions.md
- modules/01/4-module-1-quiz.md
- modules/02/1-module-overview.md
- ...

## Notes

Keep this index updated when adding, removing, or renaming lesson files.
```

Always generate this file and keep it in sync with the files you actually produce — it isn't
read by the app, but it's the expected convention for this repo and helps human reviewers.

## 7. Quality checklist (apply before finalizing output)

- [ ] `courseId` is lowercase, URL-safe, and unique.
- [ ] Every module folder's lowest-numbered file is a `1-module-overview.md` whose H1 follows
      `Module <n> Overview: <Title>`.
- [ ] Every non-quiz lesson has exactly one H1 and ends with a `## Key Takeaway` section.
- [ ] Every quiz has valid frontmatter: `lessonType: quiz`, at least one question, and each
      question's `answer` is present verbatim in its `options`.
- [ ] Only the six documented callout types are used.
- [ ] Every callout's body is a single unwrapped line in the source, however long the sentence is.
- [ ] Every image lives inside the course folder and is referenced as `/courses/<courseId>/assets/<relative-path>`.
- [ ] `course-index.md` lists every file that was actually generated, in the same order.
- [ ] No two lesson files in the same module share a leading number.

## 8. What generated output should look like

When asked to write a course, respond with the full file tree followed by each file's complete
contents (one fenced block per file, each preceded by its relative path, e.g.
`Courses/Selling With Confidence/course.json`). Do not summarize or truncate lesson content —
produce real, finished prose a learner could read today, not placeholders.
