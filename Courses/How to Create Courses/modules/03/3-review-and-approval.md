# Review and Approval

A pull request needs at least one approving review before it can merge into `main`.

## What a Reviewer Checks

| Area | Question |
| --- | --- |
| Manifest | Does `course.json` have a valid, unique `courseId`? |
| Structure | Do lesson files follow the numbered naming convention? |
| Content | Is the lesson accurate, well-scoped, and free of typos? |
| Quiz | Do quiz questions have exactly one correct answer that matches an option? |

> [!TIP]
> Reviewing locally (`npm run dev`) and clicking through the actual lesson catches rendering issues that reading raw markdown misses.

## Requesting Changes

If something needs fixing, leave the review as "Request changes" with specific comments rather than approving with a comment asking for a fix afterward — it keeps the pull request's status accurate for anyone else looking at it.

## Merging

Once approved, the pull request can be merged into `main`. Deleting the source branch afterward keeps the repository tidy.

## Key Takeaway

Approval isn't a formality — it's the last check before a change reaches learners.
