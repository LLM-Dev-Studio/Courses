# The Inbox and Message Flow

## Context

Agents do not poll the board for work — they receive Messages. Understanding how Messages flow from the board and from Decisions into an agent's inbox explains why agents start, pause, and resume when they do.

## Core Concept

### What triggers a Message

| Event | Message type | What it contains |
|-------|-------------|-----------------|
| Task assigned to agent | `TaskAssignment` | Task ID, title, description, column |
| Decision resolved by human | `DecisionReply` | Resolution text, original decision context |
| Overwatch sends a nudge | `Nudge` | Nudge reason, suggested action |

### The inbox lifecycle

```
Message created
  ↓
Appears in Messages panel (VS Code) or MessagesPage (WinUI)
  ↓
Agent session starts (or resumes)
  ↓
Agent reads inbox at session start
  ↓
Agent processes each message (acts on assignments, applies decision replies)
  ↓
Messages marked as processed
  ↓
Messages no longer appear in the panel
```

### How the agent reads its inbox

At the start of every session, the `AgentPromptBuilder` in `ai-dev.core.local` includes the agent's unprocessed inbox Messages in the initial prompt. The agent uses these to understand what work has been assigned and what decisions have been resolved.

> [!NOTE]
> An agent does not act on a Message immediately when it arrives. It processes Messages at the start of the next session. If the agent is already Running, it will see the message on its next loop iteration.

### Manually processing a message

In the Messages panel (VS Code) or MessagesPage (WinUI), you can click **Process** on any message. This marks it as processed without the agent running — useful for clearing stale messages or messages sent in error.

> [!WARNING]
> Manually marking a message as processed means the agent will never see it. Only do this if you are certain the message is no longer relevant.

### Message persistence

Messages are stored on disk under `.ai-dev/<project-slug>/board/` and survive restarts. If the platform is restarted while an agent has unprocessed messages, those messages are still there when the platform comes back up.

## Practical Steps

1. Open the Messages panel in VS Code
2. Create a task on the board and assign it to the Developer agent — a new message should appear
3. Note the message source ("Board") and content
4. Watch the message disappear when the agent processes it at the start of its next session
5. Create another message by resolving a Decision and watch the "DecisionReply" type appear

> [!TIP]
> The Messages panel is a great diagnostic tool — if an agent is not acting on a task assignment, check whether the message is still showing as unprocessed.

## Key Takeaway

Messages are the connective tissue between the board, Decisions, and agents — everything an agent knows about its current work arrives via its inbox.
