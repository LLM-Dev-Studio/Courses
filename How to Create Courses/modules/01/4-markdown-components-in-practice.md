# Markdown Components in Practice

This lesson intentionally uses multiple markdown features.

## Inline and Block Code

Use inline code like `lessonType: quiz` when naming metadata fields.

```yaml
lessonType: quiz
questions:
  - prompt: Example question
```

## Callouts

There are four supported callout types. Use the `> [!TYPE]` syntax in a blockquote.

> [!NOTE]
> Use **NOTE** for neutral context or background information — this is the closest equivalent to an "information" callout.

> [!TIP]
> Use **TIP** for practical advice or a shortcut the learner can act on immediately.

> [!WARNING]
> Use **WARNING** for gotchas, common mistakes, or anything that could cause problems if missed.

> [!SUCCESS]
> Use **SUCCESS** to reinforce a positive outcome or confirm the learner is on the right track.

> [!INFORMATION]
> Use **INFORMATION** for reference material or supplementary details the learner may want but doesn't strictly need to proceed.

> [!IMPORTANT]
> Use **IMPORTANT** for critical points the learner must not miss — requirements, prerequisites, or actions with real consequences.

## Key Takeaway

Use markdown features to improve clarity, not to add noise.
