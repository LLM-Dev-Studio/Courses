# AI Learning Hub

A local-first course platform for authoring and delivering markdown-based training content.

## Repository Layout

- `site/` - Next.js application (App Router, TypeScript)
- `courses/` - Course content in markdown/frontmatter
- `.github/workflows/` - CI pipeline definitions

## Features

- Markdown lesson rendering with frontmatter metadata
- Frontmatter-based quiz engine
- Local-only learner progress, completion status, and rewards
- Local authoring tools to scaffold new courses
- Course catalog with completion cards and rewards

## Quick Start

1. Install app dependencies:

```bash
cd site
npm ci
```

2. Run locally:

```bash
npm run dev
```

3. Open `http://localhost:3000`.

## Quality Checks

From `site/`:

```bash
npm run lint
npm run build
npm run test
npm run test:e2e
```

## Content Authoring

See `courses/README.md` for course structure and conventions.

## Contributing

See `CONTRIBUTING.md` for setup, coding standards, and pull request guidance.

## License

This repository is licensed under the MIT License. See `LICENSE`.
