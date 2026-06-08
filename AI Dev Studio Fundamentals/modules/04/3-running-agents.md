# Running and Monitoring Agent Sessions

## Context

Every time an agent does work, it runs a Session — a single continuous conversation with its LLM backend. Understanding how sessions start, progress, and end helps you interpret what you see in the UI and know when to intervene.

## Core Concept

### Session lifecycle

```
Idle
  ↓ (user clicks Run, or a task is assigned)
Running — agent reads inbox, builds prompt, calls LLM
  ↓
[Loop: plan → execute tool calls → compact context → repeat]
  ↓
Done / Error / Paused (waiting for a Decision resolution)
  ↓
Idle
```

### Starting a session

**From the VS Code extension:** Click **Run** in the Agents panel next to the agent's name.

**From the WinUI app:** On the Agent Dashboard, click the **Run** button on the agent card. Or open the AgentDetailPage and click **Run Session**.

**Automatic start:** When a task is assigned to an agent, a `TaskAssigned` Message is added to the agent's inbox. If the agent is Idle, it starts a session to process the message.

### Monitoring a session

| What to watch | Where to find it |
|--------------|-----------------|
| Current status | Agents panel (VS Code) or Agent Dashboard (WinUI) |
| Live transcript | AgentDetailPage → Transcript tab (both UIs) |
| Messages processed | Messages panel (VS Code) or MessagesPage (WinUI) |
| Decisions raised | Decisions panel (VS Code) or DecisionsPage (WinUI) |
| Logs | Logs panel (VS Code) |

### Stopping a session

Click **Stop** on the agent in the Agents panel or Agent Dashboard. The session is marked as stopped with a `SessionStopped` event and the transcript is preserved up to that point.

> [!NOTE]
> Stopping a session does not delete its transcript. You can always review what the agent did up to the point it was stopped via the session history.

### Session transcript

Every tool call, LLM response, and decision raised is stored in the transcript under `.ai-dev/<project-slug>/sessions/<session-id>.json`. The transcript is the authoritative record of what the agent did.

> [!TIP]
> If an agent produces unexpected output or raises an unusual Decision, read its transcript first — agents include their reasoning in the transcript, which is usually enough to understand what went wrong.

## Practical Steps

1. Open the Agents panel in VS Code
2. Click **Run** on the Developer agent
3. Watch the status change from Idle → Running
4. Open the agent's detail page (or TranscriptPage in WinUI) and watch the transcript populate
5. When the session finishes, note the final status and review the last few transcript entries

## Key Takeaway

Agent sessions are transparent by design — every action is logged in the transcript, making it easy to understand what an agent did and why.
