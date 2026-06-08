# The Four Sidebar Panels

## Context

The VS Code extension surfaces four purpose-built panels in the activity bar. Each panel shows a different slice of the project's live state and lets you take action without leaving VS Code.

## Core Concept

### 1. Agents Panel

**What it shows:** All agents in the project, each with their current status — Idle, Running, or Error.

**What you can do:**
- Click **Run** to start an agent's session
- Click **Stop** to end a running session
- Click an agent's name to open its detail page in the board editor tab

The Agents panel is driven by the `AgentsPanelProvider`. It re-renders whenever the extension receives an `onAgentsChanged` event over SignalR.

### 2. Messages Panel

**What it shows:** The queue of unprocessed Messages across all agents — task assignments, decision replies, and Overwatch nudges.

**What you can do:**
- Read the message content and source (Board, Human, Overwatch)
- Click **Process** to clear a message from the inbox (marks it as read by the agent)

> [!NOTE]
> Messages are the mechanism by which the board communicates with agents. A task assignment, a resolved decision reply, or a nudge from Overwatch all arrive as Messages. They persist in the inbox until the agent processes them.

### 3. Decisions Panel

**What it shows:** All pending Decisions raised by agents — each with a summary of the question and the context the agent provided.

**What you can do:**
- Read the full decision context
- Type your resolution in the text input
- Click **Resolve** to send a reply Message to the agent's inbox

> [!IMPORTANT]
> Resolving a Decision is how you unblock a stuck agent. Until a Decision is resolved, the agent's session is paused waiting for the answer.

### 4. Logs Panel

**What it shows:** Real-time extension host logs — backend startup events, SignalR connection status, and error messages from the process manager.

**What you can do:**
- Read startup errors if the backend fails to connect
- Monitor SignalR reconnection events
- Copy log lines for bug reports

> [!TIP]
> Open the Logs panel first whenever something seems wrong. The startup sequence — spawn process → health check loop → SignalR connect — is logged step by step.

## Practical Steps

1. Open the AI Dev Studio activity bar icon
2. Expand the **Agents** panel — note each agent's current status
3. If an agent is Running, switch to the **Messages** panel and watch for new messages arriving
4. Check the **Decisions** panel — if any are listed, read the context and try resolving one
5. Click the **Logs** panel header and scroll to the top to see the startup sequence

## Key Takeaway

The four panels — Agents, Messages, Decisions, and Logs — give you complete visibility and control over the agent lifecycle without leaving your editor.
