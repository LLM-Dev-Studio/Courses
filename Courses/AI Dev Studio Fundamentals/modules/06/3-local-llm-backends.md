# Setting Up Local LLM Backends

## Context

AI Dev Studio supports fully local LLM execution via Ollama and LM Studio. Local backends keep all code and context on your machine — nothing is sent to an external API. This lesson covers setup, configuration, and enabling the feature flag required for advanced local features.

## Core Concept

### Ollama

Ollama is the recommended local backend. It manages model downloads and serves them via a local HTTP API (`http://localhost:11434`).

**Setup:**
1. Download and install Ollama from ollama.com
2. Pull a model: `ollama pull llama3.1:8b` (or any supported model)
3. Confirm it is running: `ollama serve` (or it starts automatically on install)
4. Verify: `curl http://localhost:11434/api/tags` should return the model list

**Minimum hardware:**
- 7B model: 8 GB RAM free
- 13B model: 16 GB RAM free
- 70B model: 64 GB RAM (GPU recommended)

> [!WARNING]
> Running a model without sufficient RAM causes it to swap to disk. Session speed will be 10–50x slower. Check `ollama ps` to see current memory usage.

### LM Studio

LM Studio provides a GUI for downloading and running models locally. It also exposes an OpenAI-compatible HTTP server.

**Setup:**
1. Download and install LM Studio from lmstudio.ai
2. Download a model via the model browser
3. Enable the local server: **Local Server → Start Server**
4. Default URL: `http://localhost:1234`

### Configuring the backend in AI Dev Studio

**VS Code extension:** Settings are in the workspace `.ai-dev/studio-settings.json`:
```json
{
  "ollama": { "baseUrl": "http://localhost:11434" },
  "lmStudio": { "baseUrl": "http://localhost:1234" }
}
```

**WinUI app:** Open **Settings page** and update the Ollama URL or LM Studio URL fields directly.

### Assigning a local executor to an agent

1. Open the agent's detail page (VS Code: board editor; WinUI: Agent Detail)
2. In the **Info** tab, change the **Executor** dropdown to `Ollama` or `LM Studio`
3. Set the model name (e.g., `llama3.1:8b` for Ollama)
4. Save and run the agent

### Enabling the Local Functionality feature flag

Advanced local features — progressive discovery, rule-based context compaction, and local planning sessions — require the `LocalFunctionalityEnabled` flag:

**WinUI app:** Preferences page → **Enable Local Functionality** toggle

**VS Code extension / manual:** Add to `studio-settings.json`:
```json
{
  "featureFlags": { "localFunctionalityEnabled": true }
}
```

> [!NOTE]
> Without this flag, agents using Ollama or LM Studio run without progressive discovery and context compaction. They will still work, but sessions may hit context length limits on longer tasks. Enable the flag for best results with local models.

## Practical Steps

1. Install Ollama and run `ollama pull llama3.1:8b`
2. Verify the server is running: visit `http://localhost:11434` in your browser
3. In the WinUI Settings page, confirm the Ollama URL is set to `http://localhost:11434`
4. Open the Developer agent's detail page and change its executor to Ollama
5. Enable Local Functionality in Preferences
6. Run the Developer agent and confirm it connects to Ollama (check the Transcript for Ollama responses)

## Key Takeaway

Running agents locally with Ollama or LM Studio keeps all data on your machine — configure the URL in Settings, set the executor on each agent, and enable the Local Functionality flag for best results.
