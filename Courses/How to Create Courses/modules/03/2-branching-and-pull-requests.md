# Branching and Pull Requests

The `main` branch is protected. Nobody can push a course change directly to it — every change has to arrive as a pull request.

## If You Have Write Access

1. Create a branch from `main`, named for the change, e.g. `add-onboarding-course`
2. Add or edit files under `Courses/<Course Name>/`
3. Commit with a clear message describing what changed
4. Push the branch and open a pull request against `main`

## If You Don't Have Write Access

Fork the repository first, then follow the same steps on a branch in your fork. Open the pull request from your fork's branch back to `main` on the original repository.

## What a Good Pull Request Includes

- One course or one clear change per pull request
- A description of what the change is and why
- Confirmation the new/edited lesson renders correctly locally (`npm run dev`)

> [!WARNING]
> A pull request that mixes unrelated course edits together is harder to review and more likely to get sent back for changes.

## Key Takeaway

Every course change is a branch and a pull request — there is no other path to `main`.
