---
courseId: how-to-create-courses
title: How to Create Courses
subtitle: A sample course to test every platform feature
audience: Course creators and admins
---

# Welcome to How to Create Courses

This sample course is designed to validate the full learner and authoring experience.

> [!NOTE]
> Use this course to test navigation, progress tracking, markdown rendering, quizzes, and continuation behavior.

## What You Will Test

- Module expansion and collapse
- Search and active lesson state
- Markdown rendering (lists, tables, code, links, callouts)
- Quiz behavior including attempts, highlighting, and auto-continue
- Local persistence for progress and quiz state

## Local Authoring Workflow

When running locally (`npm run dev`), the root page includes a Local Authoring Tools section with a New Course button.

Use it to scaffold:

- A new course folder
- Intro lesson with frontmatter metadata
- Starter module lessons and quiz template

> [!NOTE]
> The New Course tool only runs in local development. It is disabled on the deployed site, since the deployment has no way to write files back into the GitHub repository.

## From Local Draft to Live Course

This platform now runs on Vercel, deployed straight from this repository's `main` branch. That changes how a course actually reaches learners:

1. Scaffold and draft locally with the New Course tool or by hand
2. Commit the course folder to a branch and push it to GitHub
3. Open a pull request so it can be reviewed
4. Once approved and merged to `main`, Vercel deploys it automatically

Module 3 covers that GitHub workflow in detail — branching, opening a pull request, and getting it approved.

## External Links

- [Markdown Guide](https://www.markdownguide.org)
- [Gray Matter](https://github.com/jonschlinkert/gray-matter)

## Key Takeaway

A good sample course should intentionally exercise every feature you expect real courses to use.
