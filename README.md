# Courses Content Convention

This folder uses a file-first course format designed for easy authoring and scaling.

## Recommended Structure

- courses/
  - <Course Name>/
    - course.json            # machine-readable manifest
    - course-index.md        # human-readable file map
    - 1-intro.md             # course summary/landing content
    - modules/
      - 01/
        - 1-*.md
        - ...
      - 02/
      - ...

## Authoring Rules

1. Keep one lesson per markdown file.
2. Prefix files numerically to preserve lesson ordering.
3. Keep module folders zero-padded (`01`, `02`, ...).
4. Update `course-index.md` and `course.json` when adding/removing lessons.
5. Keep course-specific legal/compliance references in-region (e.g. Australia).

## Why This Works Well

- Easy for non-developers to edit markdown.
- Version control diffs are clean.
- Course renderer can rely on `course.json` for deterministic ordering.
- New courses can be added by copying a folder template.
