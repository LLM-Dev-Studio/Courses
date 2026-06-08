# Installation and Project Detection

## Context

The VS Code extension is distributed as a `.vsix` file with the backend API binary embedded. Once installed, it automatically detects AI Dev Studio projects in your open workspace — no manual configuration required.

## Core Concept

### Installing the extension

For development (building from source):
```bash
cd ai-dev-vscode
npm install
npm run watch      # starts incremental rebuilder
# Press F5 in VS Code to launch Extension Development Host
```

For production use, install a platform-specific `.vsix`:
```bash
# In VS Code terminal or via the Extensions panel > "Install from VSIX..."
code --install-extension ai-dev-studio-win32-x64-<version>.vsix
```

> [!IMPORTANT]
> Use the platform-specific package (`package:win`, `package:mac`, `package:linux`) for distribution — these embed the self-contained backend binary. The plain `npm run package` command produces a JS-only `.vsix` that will not start the backend.

### How project detection works

The extension's `WorkspaceDetector` watches all open workspace folders for a file matching the pattern:
```
<folder>/.ai-dev/project.json
```

When this file is found, the extension reads `projectSlug` and `apiPort` from it and:
1. Spawns the embedded `ai-dev.api` binary via `BackendProcessManager`
2. Sets the `WORKSPACE_ROOT` environment variable on the spawned process
3. Waits for `GET /api/health` to return 200 (up to 120 attempts × 1 second)
4. Connects SignalR to `ws://localhost:{apiPort}/hubs/project`
5. Updates the status bar to show "✓ Connected"

> [!NOTE]
> The extension monitors workspace folder changes at runtime. If you add a new folder that contains a `.ai-dev/project.json`, the extension detects it without a restart.

### Creating the project file

If your workspace does not have a `.ai-dev/project.json`, the extension's setup command creates one:

1. Open the Command Palette (`Ctrl+Shift+P`)
2. Run `AI Dev: Initialise Project in Current Folder`
3. The file is created with a generated `projectSlug` and an available `apiPort`

## Practical Steps

1. Install the extension (`.vsix` or via `F5` in development)
2. Open a folder that already has `.ai-dev/project.json` — or run the initialise command
3. Click the AI Dev Studio icon in the activity bar (left sidebar)
4. Watch the status bar at the bottom for "✓ Connected"
5. If connection fails, open the Logs panel to see the startup error

> [!TIP]
> Health check settings are configurable via the `aidev.backend.health.maxAttempts` and `aidev.backend.health.retryDelayMs` settings in VS Code. Increase these if your machine is slow to start the backend.

## Key Takeaway

The extension detects AI Dev Studio projects automatically by watching for `.ai-dev/project.json`; once found, it spawns the backend, waits for the health check, and connects SignalR.
