# Prerequisites

## Context

AI Dev Studio is a .NET 10 solution with a TypeScript VS Code extension. Before you can run it, you need a few things installed and at least one LLM backend available.

## Core Concept

### Required

| Requirement | Minimum Version | Notes |
|-------------|-----------------|-------|
| .NET SDK | 10.0 | Used by all .NET projects in the solution |
| Node.js | 18+ | Required for the VS Code extension only |
| VS Code | Latest | Required for the extension; not needed for WinUI-only use |

### Required for WinUI desktop app (Windows only)

| Requirement | Notes |
|-------------|-------|
| Windows 10.0.19041 or later | Minimum OS version for Windows App SDK |
| Windows App SDK 1.8 | Installed automatically via NuGet if missing |
| x64 platform | WinUI builds require `-p:Platform=x64` |

### LLM Backend (choose at least one)

| Backend | Type | How to get it |
|---------|------|---------------|
| Anthropic API | Cloud | API key from console.anthropic.com |
| GitHub Models | Cloud | GitHub PAT with models:read scope |
| Copilot CLI | Cloud | GitHub Copilot subscription + CLI installed |
| Ollama | Local | Install from ollama.com; run `ollama pull llama3.1:8b` |
| LM Studio | Local | Install from lmstudio.ai; load a model; enable local server |

> [!TIP]
> If you just want to try the platform quickly, Anthropic is the fastest path — create a key, set `ANTHROPIC_API_KEY` in your environment, and you are ready. For a fully local setup with no data leaving your machine, Ollama is the recommended choice.

> [!WARNING]
> Local LLM backends (Ollama, LM Studio) require significant RAM. A 7B model needs at least 8 GB free RAM; a 13B model needs 16 GB. Running locally with insufficient RAM will cause the model to swap to disk and sessions will be very slow.

## Practical Steps

1. Verify .NET 10 is installed: `dotnet --version` should print `10.x.x`
2. Clone the repository or navigate to the existing checkout
3. Choose your LLM backend and have credentials or a running server ready
4. If using the VS Code extension, run `npm install` once from `ai-dev-vscode/`

## Key Takeaway

You need .NET 10, at least one LLM backend, and (for the extension) Node.js — everything else is installed by the build process.
