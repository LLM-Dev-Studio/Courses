# Planning Sessions

## Context

Before complex features are executed, a Planning Session decomposes the goal into structured tasks. Planning is a distinct phase from execution — it runs a multi-turn conversation that produces a plan artefact, which is then handed off to the board for agent assignment.

## Core Concept

### What is a Planning Session?

A Planning Session is a structured multi-turn LLM conversation that:
1. Understands the business goal and constraints
2. Shapes a solution approach
3. Decomposes the goal into specific, independently-assignable tasks

The output is a set of tasks on the board — each with a clear description, acceptance criteria, and suggested agent role — ready to be assigned and executed.

Planning Sessions are available on the **Planning Tasks page** in the WinUI app.

### The three phases of planning

```
Phase 1: Business Discovery
  → What is the goal?
  → Who are the stakeholders?
  → What are the constraints and non-functional requirements?
  ↓
  Produces: BusinessDsl artefact

Phase 2: Solution Shaping
  → What is the proposed approach?
  → What are the key components and interfaces?
  → What are the technology decisions?
  ↓
  Produces: SolutionDsl artefact

Phase 3: Planning Decomposition
  → Break the solution into tasks
  → Assign estimated complexity and role
  → Identify dependencies between tasks
  ↓
  Produces: PlanDsl artefact → Tasks on the board
```

### When to use a Planning Session

Use planning when:
- The feature requires work across multiple agent roles (dev + QA + devops)
- The requirements are high-level and need decomposition
- You want the platform to propose the task breakdown rather than writing it manually

Skip planning when:
- The task is already well-defined and scoped
- You are fixing a specific bug with a clear solution
- You need something done in one session without additional overhead

> [!TIP]
> Planning Sessions work best with a capable model (Claude Sonnet or better). Using a 7B local model for planning on complex features often produces shallow decompositions. Reserve large models for planning; smaller local models are fine for execution tasks.

### Running a Planning Session in the WinUI app

1. Navigate to **Planning Tasks** in the left nav
2. Click **New Planning Session**
3. Describe the goal in natural language
4. The platform runs Phase 1, 2, and 3 in sequence
5. Review the generated tasks
6. Click **Accept** to push them to the board, or edit before accepting

> [!INFORMATION]
> Planning requires the Local Functionality feature flag to be enabled for the local planning engine to run. Without the flag, planning falls back to a single-pass decomposition without the multi-phase structure.

### Progressive context discovery during planning

When Local Functionality is enabled, the planning engine uses the `ProgressiveDiscoveryEngine` to build context about the codebase before planning:

1. The engine searches for relevant files using keywords from the goal
2. It reads summaries of key files (not full content)
3. It includes this codebase context in the planning prompt

This produces plans that reference actual file names, existing patterns, and current architecture — rather than generic task descriptions.

## Practical Steps

1. Enable Local Functionality in Preferences (if not already done)
2. Navigate to **Planning Tasks** in the WinUI app
3. Create a new Planning Session with a feature goal (e.g., "Add user email notification when a task is completed")
4. Watch each planning phase run and generate its artefact
5. Review the generated tasks — note how they reference actual codebase patterns
6. Accept the plan and check the Board to confirm the tasks were created

## Key Takeaway

Planning Sessions decompose complex goals into structured, assignable tasks in three phases — use them for multi-role features and skip them for already-scoped, single-agent work.
