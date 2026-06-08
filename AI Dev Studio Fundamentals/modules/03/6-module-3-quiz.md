---
lessonType: quiz
passThreshold: 80
maxAttempts: 2
resetScopeOnFail: module
questions:
  - prompt: "What file does the VS Code extension's WorkspaceDetector look for to discover a project?"
    options:
      - ".ai-dev/project.json in the workspace folder root"
      - ".ai-dev/workspaces.json in the workspace folder root"
      - "package.json with an aidev key"
      - "A .vsix file in the workspace folder"
    answer: ".ai-dev/project.json in the workspace folder root"
    explanation: "WorkspaceDetector watches for .ai-dev/project.json in each open workspace folder. This file contains the projectSlug and apiPort needed to spawn and connect to the backend."

  - prompt: "Which npm script should you use when building the extension for distribution on Windows?"
    options:
      - "npm run package:win"
      - "npm run package"
      - "npm run build"
      - "npm run package:all"
    answer: "npm run package:win"
    explanation: "npm run package:win creates a win32-x64 .vsix with the self-contained backend binary embedded. The plain npm run package produces a JS-only bundle that will not start the backend."

  - prompt: "What two communication channels does the VS Code extension use to talk to the API?"
    options:
      - "REST API for commands and initial data; SignalR for live state updates"
      - "WebSockets for all communication"
      - "gRPC for commands; REST for notifications"
      - "SignalR for everything; REST is not used"
    answer: "REST API for commands and initial data; SignalR for live state updates"
    explanation: "StudioApiClient uses REST for fetching data and sending commands (like run/stop). StudioSignalRClient subscribes to the ProjectStateHub for live ProjectStateChangedEvent notifications."

  - prompt: "Which panel should you open first when the extension status bar shows an error?"
    options:
      - "Logs panel"
      - "Agents panel"
      - "Decisions panel"
      - "Messages panel"
    answer: "Logs panel"
    explanation: "The Logs panel records the full startup sequence including backend spawn, health check attempts, and SignalR connection. It is the fastest way to diagnose what went wrong."

  - prompt: "What happens immediately after you resolve a Decision in the Decisions panel?"
    options:
      - "A Message is sent to the agent's inbox and the agent session resumes"
      - "The Decision is deleted and the agent's task is moved to Done"
      - "The extension restarts the backend to apply the resolution"
      - "A new Planning Session is created to re-plan the task"
    answer: "A Message is sent to the agent's inbox and the agent session resumes"
    explanation: "Resolving a Decision calls POST /api/decisions/{id}/resolve, which creates a Message in the agent's inbox. The paused agent session reads this message and continues from where it stopped."

  - prompt: "Why does the extension not require an API key to connect to the backend?"
    options:
      - "The API only accepts connections from localhost and vscode-webview:// origins, so it relies on localhost isolation"
      - "The extension embeds a hardcoded API key in the .vsix binary"
      - "Authentication is handled separately by the agent executor credentials"
      - "The API is public and does not require authentication by design"
    answer: "The API only accepts connections from localhost and vscode-webview:// origins, so it relies on localhost isolation"
    explanation: "The CORS policy restricts connections to http://localhost:* and vscode-webview://. This means only processes on the same machine can reach the API, so no token-based authentication is needed for local use."
---
