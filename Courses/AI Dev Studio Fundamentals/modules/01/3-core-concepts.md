# Core Concepts

## Context

AI Dev Studio has its own domain vocabulary. These terms appear everywhere — in the UI, in the codebase under `ai-dev.core/`, and throughout this course. Understanding them precisely will prevent confusion later.

## Core Concept

### Agent

An **Agent** is an autonomous AI worker with a defined role, an assigned Executor (LLM backend), and a personal inbox. Agents run one session at a time. Examples of built-in roles: Developer, Architect, Designer, QA, DevOps, PM, Analyst, Guard, Overwatch.

### Task (BoardTask)

A **Task** is a unit of work on the Kanban board — think of it as a card. Tasks move through columns (Backlog → In Progress → Review → Done). When a task is assigned to an agent, a `TaskAssigned` domain event fires and a Message lands in the agent's inbox.

> [!NOTE]
> In the codebase the class is `BoardTask` to avoid a naming collision with .NET's `System.Threading.Tasks.Task`. In conversations and the UI it is always called a **Task**.

### Decision

A **Decision** is a typed question raised by an agent when it gets stuck and needs human input. Decisions block further progress until resolved. Resolving a Decision sends a Message back to the agent's inbox, unblocking the session.

### Executor

An **Executor** is the pluggable LLM backend that an agent uses. The platform supports six executors out of the box:

| Executor | Type |
|----------|------|
| Anthropic | Cloud |
| Claude CLI | Cloud (via local Claude Code CLI) |
| GitHub Models | Cloud |
| Copilot CLI | Cloud |
| Ollama | Local |
| LM Studio | Local |

### Session

An **Agent Session** is a single run of an agent from start to completion (or failure). Each session has a transcript — the full conversation history, tool calls, and responses. Sessions are stored on disk under `.ai-dev/<project-slug>/sessions/`.

### Planning Session

A **Planning Session** is a structured multi-turn conversation that produces a plan artefact (decomposed tasks, goals, and constraints) before execution begins. It is a distinct concept from an Agent Session.

### Message

A **Message** is a notification in an agent's Inbox. Messages arrive when a task is assigned, when a Decision is resolved, or when Overwatch sends a nudge. Agents read their inbox at the start of each session.

### Project and Workspace

A **Project** is the domain entity that owns agents, a board, decisions, and knowledge. A **Workspace** is the directory on disk that holds one or more projects. The workspace root contains `.ai-dev/workspaces.json`.

## Practical Steps

Locate these concepts in the codebase:

1. Open `ai-dev.core/Models/Types/` — every domain ID (`AgentSlug`, `TaskId`, `DecisionId`, etc.) is a strongly-typed immutable record with constructor validation.
2. Open `docs/UBIQUITOUS_LANGUAGE.md` for the canonical glossary.
3. In the running app, open the Board — each card is a Task. Open an agent — its current status is a Session.

> [!IMPORTANT]
> Never use a raw `string` for a domain identifier in code. Always use the corresponding value type (`AgentSlug`, `TaskId`, etc.). Each has `TryParse()` for safe deserialization.

## Key Takeaway

The six domain terms — Agent, Task, Decision, Executor, Session, and Message — form the entire vocabulary of AI Dev Studio; everything else in the platform is built from these primitives.
