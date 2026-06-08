# Launching the Desktop App

## Context

The WinUI desktop app is a standalone Windows application that provides the richest interface for managing AI Dev Studio projects. Unlike the VS Code extension, it accesses `ai-dev.core` services directly in-process — no HTTP layer.

## Core Concept

### Building and running

```bash
dotnet run --project ai-dev.ui.winui -p:Platform=x64
```

The `-p:Platform=x64` flag is mandatory. Windows App SDK does not support the AnyCPU platform target.

On first launch, the app opens to the **Projects** page — an empty list if no projects exist yet.

### Creating your first project

1. Click **New Project** on the Projects page
2. Enter a name for the project
3. Set the **Codebase Path** — the directory of the code the agents will work on
4. The platform creates the `.ai-dev/` workspace structure on disk
5. Default agents are provisioned using the packaged role templates

> [!NOTE]
> The codebase path is the directory that agents will read and write files in. Point it at your repository root or a subdirectory, depending on what you want agents to have access to.

### Switching between projects

Click the project selector in the top navigation bar to switch between projects. The app loads the selected project's agents, board, decisions, and knowledge base.

### Navigation

The app uses a left navigation panel with these top-level sections:

| Section | Pages |
|---------|-------|
| **Agents** | Agent Dashboard, Agent Detail |
| **Board** | Board (Kanban), Planning Tasks |
| **Collaboration** | Messages, Decisions, Decision Detail |
| **Knowledge** | Knowledge Base, Journals, Secrets |
| **Insights** | Digest, Insights, Consistency, Codebase |
| **Settings** | Settings, Project Settings, Templates, Preferences |

> [!TIP]
> The keyboard shortcut `Alt+Left` and `Alt+Right` navigate back and forward through the page history — useful when drilling into agent detail and wanting to return to the dashboard.

## Practical Steps

1. Run `dotnet run --project ai-dev.ui.winui -p:Platform=x64`
2. If the Projects page is empty, click **New Project** and set it up
3. Navigate to **Agent Dashboard** — confirm the default agents are listed
4. Click on one agent to open Agent Detail — note the tabs (Info, Transcript, Sessions)
5. Navigate to **Board** — confirm the default columns are present

> [!SUCCESS]
> The app is working correctly when the Agent Dashboard shows agents with Idle status and the Board shows at least one column.

## Key Takeaway

The WinUI desktop app is launched with a single `dotnet run` command and provides a full project management interface with project switching and persistent local storage.
