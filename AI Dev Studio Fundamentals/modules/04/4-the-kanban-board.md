# The Kanban Board

## Context

The Kanban board is the primary way to give agents work. Each card on the board is a Task, and tasks move through columns as work progresses. Assigning a task to an agent is what triggers that agent to start working.

## Core Concept

### Board columns

The board has four default columns:

| Column | Meaning |
|--------|---------|
| **Backlog** | Tasks created but not yet started |
| **In Progress** | Tasks actively being worked on by an agent |
| **Review** | Tasks completed by the agent, awaiting human review |
| **Done** | Tasks accepted and closed |

Columns are configurable — you can rename them, add new columns, and set WIP (work in progress) limits.

### Creating a task

1. Click **+ Add Task** in the Backlog column (or any column)
2. Give the task a descriptive title — agents read this when picking up work
3. Add detail in the description: what needs to be done, acceptance criteria, any constraints
4. Optionally assign it to an agent immediately, or leave it unassigned for manual assignment later

> [!IMPORTANT]
> Task descriptions are read verbatim by the agent. Write them as you would write a clear ticket — include enough context that the agent can proceed without needing to raise a Decision. Vague tasks result in more Decisions and slower progress.

### Assigning a task

Right-click a task card (or open it) and select **Assign to Agent**. Choose the agent from the dropdown. This:
1. Sets the `AssignedAgentSlug` on the task
2. Fires a `TaskAssigned` domain event
3. Creates a Message in the agent's inbox

If the agent is currently Idle, it will start a new session the next time it checks its inbox (or immediately if configured for auto-start).

### Moving tasks between columns

Drag and drop task cards between columns. The column change fires a `TaskColumnChanged` domain event, which is broadcast over SignalR so all connected UIs update in real time.

> [!TIP]
> When an agent completes a task, it moves the card to the Review column itself (if the board tool is available via MCP). Your job is to review the work and move it to Done — or return it to Backlog with a comment if changes are needed.

### Task detail

Click a card to open its detail view:
- **Title and description** — the agent's primary source of context
- **Assignment history** — which agent has worked on it
- **Status and column** — current position on the board
- **Linked session** — the session ID where the work was done

## Practical Steps

1. Open the board (VS Code: `AI Dev: Open Board` command; WinUI: BoardPage)
2. Create a new task in Backlog with a clear title and description
3. Assign it to the Developer agent
4. Watch the Messages panel — a new message should appear
5. Watch the Agents panel — the Developer agent's status should update

## Key Takeaway

The Kanban board is how work enters the agent system — clear task descriptions with explicit acceptance criteria lead to better results and fewer Decisions.
