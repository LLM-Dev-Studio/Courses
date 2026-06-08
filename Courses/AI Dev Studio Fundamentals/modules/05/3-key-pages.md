# Key Pages: Agents, Board, and Decisions

## Context

Three pages cover the core daily workflow in the WinUI app: the Agent Dashboard for monitoring and controlling agents, the Board for managing tasks, and the Decisions page for resolving agent blockers. Mastering these three pages is enough to run productive multi-agent sessions.

## Core Concept

### Agent Dashboard

The Agent Dashboard (`AgentDashboardPage`) is the home screen for agent management. It shows:

- All agents as cards with their current status (Idle / Running / Error)
- Role icon, name, and assigned executor
- **Run** and **Stop** buttons per agent
- A link to each agent's **Detail page**

**Agent Detail page** provides three tabs:
- **Info** — name, role, executor, and editable system prompt
- **Transcript** — the full transcript of the current or most recent session with search
- **Sessions** — historical list of all past sessions with timestamps and outcomes

> [!TIP]
> Use the Transcript tab to understand exactly why an agent produced a particular output. The transcript shows every tool call, file read, and LLM response in sequence.

### Board Page

The Board page (`BoardPage`) is a full-screen Kanban board with:

- Drag-and-drop task cards between columns
- **+ Add Task** in each column
- Task cards showing title, assignment, and a status indicator
- Click to open task detail inline

The Board page is wider and more interactive than the VS Code extension's board editor tab. For complex boards with many tasks, the desktop app's board is noticeably easier to navigate.

### Decisions Page

The Decisions page (`DecisionsPage`) shows all Decisions across the project:

- **Pending** — awaiting resolution; shown at the top
- **Resolved** — historical record; shown below

Click a Decision to open the **Decision Detail page** (`DecisionDetailPage`), which shows:
- Full decision context as provided by the agent
- A text input for the resolution
- The option to assign resolution to another agent

> [!IMPORTANT]
> Unresolved Decisions block agent progress. Check the Decisions page regularly when agents are running — especially for new agents on complex tasks, which tend to raise more Decisions early in their first session.

### Messages Page

The Messages page (`MessagesPage`) shows the complete inbox queue across all agents. It is the desktop equivalent of the VS Code Messages panel, with additional metadata:

- Source of each message (Board, Human, Overwatch)
- Timestamp
- Full message body
- **Mark as Processed** button

## Practical Steps

1. Open the Agent Dashboard — note the status of each agent
2. Click an agent's name to open its Detail page and browse the Transcript tab
3. Navigate to the Board — try dragging a task card to a different column
4. Navigate to Decisions — if any are pending, open the detail and read the context
5. Navigate to Messages — note which messages are unprocessed

## Key Takeaway

The three most-used pages in the WinUI app are Agent Dashboard, Board, and Decisions — mastering these covers the complete day-to-day multi-agent workflow.
