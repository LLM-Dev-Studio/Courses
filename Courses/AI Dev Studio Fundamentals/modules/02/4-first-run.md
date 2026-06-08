# Your First Run

## Context

Once prerequisites are met, getting the platform running is a single command. This lesson walks through each path and what to look for to confirm success.

## Core Concept

There are three entry points, one for each setup option:

### Running the Aspire host

```bash
dotnet run --project ai-dev-net.AppHost
```

This starts the API, MCP server, and SignalR hub together. The Aspire dashboard opens in your browser and shows the health of each service. Look for all services showing green before proceeding.

### Running just the API

```bash
dotnet run --project ai-dev.api
```

Use this when you want the API running but do not need the full Aspire dashboard. Useful for debugging or running the VS Code extension against a locally built API.

### Running the WinUI desktop app

```bash
dotnet run --project ai-dev.ui.winui -p:Platform=x64
```

The desktop window opens. The first screen shows your projects list (empty on first run). From here you create your first project.

### Running the VS Code extension

1. Open `ai-dev-vscode/` in a terminal
2. Run `npm run watch` to start the incremental bundler
3. In VS Code, press `F5` to open a new Extension Development Host window
4. Open a workspace folder that contains (or will contain) a `.ai-dev/project.json` file

> [!WARNING]
> The WinUI app must be built with `-p:Platform=x64`. Omitting this flag will cause a build error because Windows App SDK requires an explicit platform target.

> [!TIP]
> For the first run, the Aspire host is the easiest way to confirm everything builds and the services start correctly before switching to your preferred UI surface.

## Practical Steps

1. Choose your entry point and run the command above
2. Wait for the health check to pass (Aspire: green dashboard; VS Code extension: status bar shows "✓ Connected")
3. Open the Agents panel or Agent Dashboard and confirm the default agents appear
4. Pick one agent and click **Run** — watch the Logs or Transcript to confirm a session starts

> [!SUCCESS]
> If you see an agent status change to "Running" and a session transcript begins populating, your installation is working correctly.

## Key Takeaway

Each entry point is a single command; success is confirmed when agents appear in the UI and a session starts without errors.
