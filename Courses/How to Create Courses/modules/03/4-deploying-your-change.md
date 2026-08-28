# Deploying Your Change

Merging to `main` is not the last step — it triggers a deployment.

## What Happens After Merge

1. Vercel detects the new commit on `main`
2. It builds the site fresh, including your new or edited course files
3. On a successful build, it becomes the live production deployment automatically

There is no separate "publish" button — merge is publish.

## Confirming It Worked

- Check the deployment status in the Vercel dashboard for the project
- Open the live site and navigate to the course you changed
- If a build fails, the previous deployment stays live, so learners are never shown a broken build

> [!NOTE]
> A failed build almost always means a content or config problem introduced in the pull request. Check the build logs first.

## Key Takeaway

A merged pull request becomes a live change within minutes, with no manual deployment step in between.
