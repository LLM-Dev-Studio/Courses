# How the Extension Connects to the Backend

## Context

The VS Code extension and the backend API are two separate processes. Understanding how they discover and communicate with each other helps you diagnose connection issues and explains why certain things behave the way they do.

## Core Concept

### The connection sequence

```
1. WorkspaceDetector finds .ai-dev/project.json
          ↓
2. BackendProcessManager spawns ai-dev.api binary
   (sets WORKSPACE_ROOT env var)
          ↓
3. Health check loop: GET /api/health
   (up to 120 attempts × 1000ms by default)
          ↓
4. StudioSignalRClient connects to:
   ws://localhost:{apiPort}/hubs/project
          ↓
5. Status bar updates: "✓ Connected"
          ↓
6. Panels subscribe to hub events:
   onAgentsChanged, onBoardChanged,
   onMessagesChanged, onDecisionsChanged
```

### REST vs. SignalR — two channels

The extension uses **two communication channels** simultaneously:

| Channel | Used for |
|---------|----------|
| **REST API** (`StudioApiClient`) | Fetching initial data, sending commands (run agent, resolve decision) |
| **SignalR hub** (`StudioSignalRClient`) | Receiving live state change notifications |

When you click **Run** on an agent, the extension calls `POST /api/agents/{slug}/run` via REST. When the agent's state changes, the backend broadcasts `ProjectStateChangedEvent` over SignalR, and the panel re-renders.

### CORS and security

The API only allows connections from `http://localhost:*` and `vscode-webview://` origins. This means:
- No API key is needed for the extension to connect
- The API is not accessible from other machines by default
- WebView panels connect from the `vscode-webview://` origin, which is explicitly allowed

> [!WARNING]
> If you expose the API port on a shared network, any process on that machine can call the API without authentication. The current security model assumes localhost isolation. Tighten CORS and add authentication before any network-accessible deployment.

### Command palette integration

The extension also registers VS Code commands accessible via `Ctrl+Shift+P`:

| Command | What it does |
|---------|--------------|
| `AI Dev: Restart Backend` | Kills and respawns the backend process |
| `AI Dev: Open Board` | Opens the board editor in a VS Code tab |
| `AI Dev: Open Global Templates Folder` | Opens the agent templates directory in VS Code |

## Practical Steps

1. Open the Logs panel and look for the line "Spawning backend process..."
2. Count the health check attempts in the logs — if it retries many times, your machine may need higher `maxAttempts`
3. Look for "SignalR connected" in the logs — this is the moment the panels go live
4. Run `AI Dev: Restart Backend` from the command palette and watch the reconnection sequence in logs

> [!TIP]
> If the extension shows "✗ Error" in the status bar, run `AI Dev: Restart Backend` first. If it fails again, check the Logs panel for the exact error — it is almost always a port conflict or a missing backend binary.

## Key Takeaway

The extension connects via a two-channel approach — REST for commands and initial data, SignalR for live state updates — and only communicates over localhost.
