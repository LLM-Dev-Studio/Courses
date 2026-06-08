# Architecture Overview

## Context

AI Dev Studio is a multi-project .NET solution with a VS Code extension front-end. Understanding how the pieces connect tells you where to look when something breaks and how the UIs relate to the shared backend.

## Core Concept

The solution is divided into layers:

```
ai-dev-net.AppHost       Aspire orchestration — dev entry point
ai-dev.api               ASP.NET Core Minimal API + SignalR hub
ai-dev.ui.winui          WinUI 3 desktop app (Windows App SDK)
ai-dev.core              Domain: entities, value types, service contracts
ai-dev.core.local        Local orchestration: planning, compaction, discovery
ai-dev.mcp               Model Context Protocol server (workspace tools)
ai-dev.executor.*        Six pluggable LLM backends
ai-dev-vscode            VS Code extension: React 19 webviews, SignalR client
```

### How the pieces connect

**Executors** implement a common contract in `ai-dev.core` and are registered via `Add*Executor()` extension methods. The `ModelResolver` and `AgentRunnerService` select the right executor at runtime.

**`ai-dev.core.local`** handles the stateful session lifecycle: building prompts, compacting transcripts (via `RuleBasedContextCompactor`), running progressive discovery (via `ProgressiveDiscoveryEngine`), and routing tool calls (via `LocalToolBroker`).

**`ai-dev.mcp`** exposes workspace tools as MCP tools — file reads, git operations, journal writes. Executors that support MCP (Anthropic, Claude CLI) call these tools; responses are routed back through the session.

**`ai-dev.api`** is a thin HTTP layer over `ai-dev.core` services. It hosts the SignalR hub (`ProjectStateHub`) that pushes `ProjectStateChangedEvent` domain events to connected clients.

**`ai-dev.ui.winui`** uses `ai-dev.core` services directly in-process via DI — no HTTP call. This means lower latency and simpler debugging.

**`ai-dev-vscode`** connects to `ai-dev.api` via REST and SignalR. It detects projects by watching for `.ai-dev/project.json` files, spawns the API process (`BackendProcessManager`), and renders four sidebar panels as React webviews.

### Two UI paths

```
VS Code extension
  → BackendProcessManager spawns ai-dev.api
  → StudioApiClient (REST) + StudioSignalRClient (SignalR)
  → Four sidebar panels (Agents, Messages, Decisions, Logs)

WinUI desktop app
  → ai-dev.core services in-process (DI)
  → 18+ pages via MVVM Community Toolkit view models
  → Same domain events, same data — no HTTP required
```

> [!NOTE]
> Both UIs share the same domain logic in `ai-dev.core`. The difference is the transport layer: REST + SignalR for the extension, in-process DI for WinUI.

## Practical Steps

1. Open `ai-dev-net.AppHost/Program.cs` — this is the Aspire entry point for local development. It starts all services.
2. Open `ai-dev.core/Features/` — this is where all domain logic lives, organised by feature (Agent, Board, Decision, Planning, etc.).
3. Open `ai-dev.api/Routes/` — each file is a thin endpoint that delegates to a core service.
4. Open `ai-dev-vscode/src/` — panels, backend manager, and SignalR client are each in their own directory.

> [!TIP]
> When debugging, start with `ai-dev.core` — both UIs are just delivery mechanisms for the same domain logic.

## Key Takeaway

All domain logic lives in `ai-dev.core`; the WinUI app accesses it in-process while the VS Code extension accesses it over HTTP — both surfaces show the same data from the same source.
