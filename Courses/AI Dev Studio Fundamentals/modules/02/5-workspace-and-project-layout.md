# Workspace and Project Layout

## Context

AI Dev Studio stores all project data on disk in a predictable structure. Understanding this layout makes it easier to debug issues, back up data, and understand what each file contains.

## Core Concept

### The `.ai-dev/` directory

Every project lives under a `.ai-dev/` directory at the workspace root:

```
<workspace-root>/
  .ai-dev/
    workspaces.json           Project registry (slug → name)
    studio-settings.json      User-local settings (API keys, preferences)
    <project-slug>/
      project.json            Project metadata
      agents/                 Agent definitions (one JSON file per agent)
      board/                  Task and column data
      decisions/              Decision history
      kb/                     Knowledge Base entries
      playbooks/              Agent playbooks
      sessions/               Session transcripts
```

### Key files

**`workspaces.json`** — the registry of all projects in this workspace. The platform reads this at startup to know which projects exist.

**`studio-settings.json`** — user-local configuration including API keys, Ollama URL, LM Studio URL, and feature flags. This file should **never** be committed to source control.

**`project.json`** (inside `<project-slug>/`) — project metadata: the codebase path, whether the codebase has been initialised, and the API port used by the VS Code extension.

### The VS Code extension's project file

The extension discovers projects via a **separate** `project.json` at `<codebase-root>/.ai-dev/project.json`. This file contains `projectSlug` and `apiPort` and tells the extension where to find the running API.

> [!IMPORTANT]
> There are two different `project.json` files involved:
> 1. The workspace storage `project.json` — contains full project data, lives in the studio workspace
> 2. The codebase `project.json` — a lightweight pointer used by the VS Code extension for discovery
>
> Do not confuse the two. The codebase one is safe to commit; the workspace storage one lives in the studio data directory.

### `WorkspacePaths` — the single source of truth

The class `WorkspacePaths` in `ai-dev.core` resolves all file paths for a project. Every service uses it. Never string-concatenate paths directly — always go through `WorkspacePaths`.

## Practical Steps

1. Navigate to your workspace root and look for the `.ai-dev/` directory
2. Open `workspaces.json` to see the registered projects
3. Find your project's directory and explore the `sessions/` subdirectory to see session transcripts
4. Look at `studio-settings.json` — confirm it is not included in `.gitignore` (if it is not, add it now)

> [!WARNING]
> `studio-settings.json` contains API keys. Ensure it is in `.gitignore` before committing the workspace to a shared repository.

## Key Takeaway

All project data lives under `.ai-dev/<project-slug>/` on disk, and every file path in the platform resolves through `WorkspacePaths` — never through manual string concatenation.
