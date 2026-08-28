---
lessonType: quiz
passThreshold: 80
maxAttempts: 2
resetScopeOnFail: module
questions:
  - prompt: Can a course change be pushed directly to main?
    options:
      - "No, main is protected and only accepts changes through an approved pull request"
      - "Yes, as long as the build passes locally"
      - "Yes, but only on weekdays"
      - "No, but only for quiz files"
    answer: "No, main is protected and only accepts changes through an approved pull request"
    explanation: Branch protection on main requires a pull request with at least one approval before merging.
  - prompt: What triggers a new production deployment?
    options:
      - Merging a pull request into main
      - Saving a file locally
      - Opening a pull request
      - Running npm run dev
    answer: Merging a pull request into main
    explanation: Vercel deploys automatically from new commits on main; merging is what publishes the change.
  - prompt: What happens if a merged change fails to build on Vercel?
    options:
      - The previous successful deployment stays live
      - The site goes offline until it's fixed
      - Learner progress is deleted
      - The pull request automatically reverts itself
    answer: The previous successful deployment stays live
    explanation: A failed build never replaces a working production deployment.
---

# Contributing Quiz

Confirm you understand how a course change goes from a local branch to the live site.
