# Choosing Your Setup

## Context

AI Dev Studio offers three different ways to run — the Aspire host, the VS Code extension, and the WinUI desktop app. They are not mutually exclusive, but most people start with one and expand later.

## Core Concept

### Option 1: VS Code Extension

**Best for:** Developers who live in VS Code and want agent activity visible in their editor without switching windows.

- Spawns the API backend automatically when a project is detected
- Four sidebar panels in the activity bar (Agents, Messages, Decisions, Logs)
- Board editor opens in a VS Code tab
- Works on Windows, macOS, and Linux
- Distributed as a `.vsix` file with the backend binary embedded

### Option 2: WinUI Desktop App

**Best for:** Windows users who want a full-screen management interface with richer visualisations.

- Standalone Windows application (no browser or VS Code needed)
- 18+ pages covering every aspect of project management
- Direct in-process access to `ai-dev.core` — fastest and most responsive
- Includes Insights, Codebase, Consistency, and Process views not available in the extension
- Requires Windows 10.0.19041+ and x64

### Option 3: Aspire Host (Web)

**Best for:** Running the full stack for development or server deployment.

- Starts all services (API, SignalR, MCP server) in one command
- Provides the .NET Aspire dashboard for service monitoring
- The API it starts is what the VS Code extension connects to in production builds
- Requires all .NET projects to build cleanly

> [!NOTE]
> The VS Code extension has its own embedded API binary for distribution. During development you can connect the extension to a separately running Aspire host by setting `apiPort` in `.ai-dev/project.json`.

## Practical Steps

Choose based on your primary use case:

- Writing code day-to-day → **VS Code extension**
- Managing multiple projects, reviewing insights, or running on Windows → **WinUI app**
- Contributing to the platform or running a shared server → **Aspire host**

Most teams end up using the extension daily and the WinUI app for periodic project reviews and planning.

> [!TIP]
> You can run the WinUI app and VS Code extension simultaneously — they both read the same `.ai-dev/` data on disk and receive the same SignalR domain events.

## Key Takeaway

Start with the VS Code extension for day-to-day development work; use the WinUI desktop app when you need the full project management surface.
