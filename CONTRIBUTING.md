# Contributing

Thanks for helping improve this project.

## Prerequisites

- Node.js 20+
- npm 10+

## Setup

```bash
cd site
npm ci
npm run dev
```

## Branching

- Create a feature branch from `main`
- Keep changes scoped to one topic per pull request

## Coding Standards

- TypeScript strict mode must remain enabled
- Keep course data local-only (no server persistence for learner progress)
- Prefer small, focused commits and tests with each behavior change

## Before Opening a Pull Request

From `site/` run:

```bash
npm run lint
npm run build
npm run test
npm run test:e2e
```

## Pull Request Checklist

- [ ] Behavior change is documented in PR description
- [ ] Tests added or updated where relevant
- [ ] No unrelated refactors mixed in
- [ ] Local-only data requirements preserved
