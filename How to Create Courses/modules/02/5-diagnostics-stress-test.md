# Diagnostics Stress Test

Use this lesson to validate rendering and navigation edge cases.

## Complex Table

| Feature | Scenario | Expected Result |
| --- | --- | --- |
| Links | External + internal in one paragraph | External badge on external links only |
| Callouts | Multiple callout types in sequence | Distinct visual treatment for each |
| Lists | Long nested bullets and mixed numbering | Stable spacing and alignment |

## Mixed Link Paragraph

Compare [the course catalog](/courses) with [Markdown reference](https://www.markdownguide.org) and ensure only the external link shows the badge.

## Long List

1. Confirm the lesson appears in search when typing "diagnostics".
2. Verify module expansion state remains intuitive.
3. Validate keyboard shortcut `/` focuses the top search field.
4. Check that `Ctrl+K` also focuses the same field.
5. Confirm previous and next lesson actions remain consistent.

> [!NOTE]
> This lesson is intentionally dense to stress test UI behavior.

> [!TIP]
> If anything looks off, capture both route and lesson ID for debugging.

## Key Takeaway

A deliberate stress-test lesson helps catch regressions early.
