---
lessonType: quiz
passThreshold: 80
maxAttempts: 2
resetScopeOnFail: module
questions:
  - prompt: "Which .NET SDK version is required to build AI Dev Studio?"
    options:
      - ".NET 10"
      - ".NET 8"
      - ".NET 9"
      - ".NET 6 LTS"
    answer: ".NET 10"
    explanation: "The solution targets .NET 10. The CI pipeline runs dotnet build with -c Release and requires .NET 10 SDK."

  - prompt: "Why must the WinUI desktop app be built with -p:Platform=x64?"
    options:
      - "Windows App SDK requires an explicit platform target and does not support AnyCPU"
      - "The WinUI app uses native x64 binaries that cannot run in AnyCPU mode"
      - "The AI models only run on 64-bit processors"
      - "The Aspire host requires x64 to manage multiple services"
    answer: "Windows App SDK requires an explicit platform target and does not support AnyCPU"
    explanation: "Windows App SDK 1.8 does not support the AnyCPU platform target. You must specify x64 (or x86 or arm64) explicitly."

  - prompt: "What is the recommended LLM backend for a fully local setup with no data leaving your machine?"
    options:
      - "Ollama"
      - "Anthropic API"
      - "GitHub Models"
      - "Copilot CLI"
    answer: "Ollama"
    explanation: "Ollama runs entirely locally. No API key is required and all inference happens on your machine. LM Studio is also local, but Ollama is the primary recommendation."

  - prompt: "Which file should NEVER be committed to source control because it contains API keys?"
    options:
      - "studio-settings.json"
      - "workspaces.json"
      - "project.json"
      - "course.json"
    answer: "studio-settings.json"
    explanation: "studio-settings.json holds user-local settings including API keys, Ollama URL, and LM Studio URL. It must be added to .gitignore before committing a workspace."

  - prompt: "What single class in ai-dev.core is responsible for resolving all file paths?"
    options:
      - "WorkspacePaths"
      - "ProjectPaths"
      - "FileResolver"
      - "StorageManager"
    answer: "WorkspacePaths"
    explanation: "WorkspacePaths in ai-dev.core is the single source of truth for all path resolution. Every service uses it — never string-concatenate paths directly."

  - prompt: "When would you choose the Aspire host over the VS Code extension or WinUI app?"
    options:
      - "When contributing to the platform or running a shared server"
      - "When writing code day to day in VS Code"
      - "When reviewing project insights and managing multiple projects"
      - "When running on macOS or Linux exclusively"
    answer: "When contributing to the platform or running a shared server"
    explanation: "The Aspire host starts all services together and provides the .NET Aspire dashboard. It is most useful for platform development and server deployment scenarios."
---
