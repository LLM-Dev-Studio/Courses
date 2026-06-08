# Advanced Views: Transcripts, Insights, and Codebase

## Context

The WinUI app includes several views that have no equivalent in the VS Code extension. These pages help you understand what agents have done, identify patterns, and get a picture of the codebase they are working on.

## Core Concept

### Transcripts

There are two transcript pages in the desktop app:

**Transcript page** (`TranscriptPage`) — the full session transcript for any agent session. Features:
- Full conversation history with tool calls
- Search across the transcript
- Expandable tool call results
- Timestamps on each entry

**Task Transcript page** (`TaskTranscriptPage`) — the transcript filtered to a specific task, showing only the work done on that particular task across all sessions.

> [!TIP]
> Use the Task Transcript view when reviewing a completed task before moving it to Done. It gives you a focused view of exactly what the agent did for that task, without unrelated session noise.

### Digest Page

The **Digest page** (`DigestPage`) generates a daily summary of agent activity:
- Tasks completed
- Sessions run
- Decisions raised and resolved
- Errors encountered

This is particularly useful for team leads or PMs who want a high-level view of what agents accomplished without reading individual transcripts.

### Insights Page

The **Insights page** (`InsightsPage`) provides analytical views of agent performance patterns:
- Which agents raise the most Decisions (and why)
- Session duration trends
- Error rate by agent and executor
- Tool call frequency patterns

Use Insights to identify agents whose prompts need refinement — consistently high Decision rates for a specific role often indicate the system prompt is missing important context.

### Consistency Page

The **Consistency page** (`ConsistencyPage`) runs static analysis across the codebase and surfaces:
- Style inconsistencies (naming conventions, formatting patterns)
- Code conventions that deviate from the project standard
- Patterns the Guard or QA agent should review

> [!NOTE]
> The Consistency page is a read-only analysis view — it does not make changes. Use it to understand what to include in task descriptions or Knowledge Base entries for the Guard or QA agent.

### Codebase Page

The **Codebase page** (`CodebasePage`) shows metadata about the project's codebase:
- Total lines of code
- File count by language
- Directory structure summary
- Last indexed timestamp

This data comes from the progressive discovery engine's index of the codebase.

### Process Page

The **Process page** (`ProcessPage`) visualises the active workflow process — the sequence of steps, agent handoffs, and decision gates in the current plan or workflow template.

## Practical Steps

1. Navigate to **Digest** — review the summary for today's agent activity
2. Navigate to **Insights** — look at the Decision rate per agent
3. Navigate to **Codebase** — note the language distribution and total file count
4. Open a completed task on the Board, then navigate to its **Task Transcript** to review what was done

> [!INFORMATION]
> The Insights, Consistency, and Codebase pages update based on indexed codebase data. On first run, or after adding many new files, allow the discovery engine a moment to re-index before relying on these figures.

## Key Takeaway

The advanced views — Digest, Insights, Consistency, and Codebase — give you the analytical tools to improve agent prompts, review completed work, and understand the codebase agents are operating on.
