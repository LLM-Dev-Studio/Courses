---
lessonType: quiz
passThreshold: 80
maxAttempts: 2
resetScopeOnFail: module
questions:
  - prompt: "Why must the WinUI app be launched with -p:Platform=x64?"
    options:
      - "Windows App SDK requires an explicit platform target and does not support AnyCPU"
      - "The WinUI app uses 64-bit AI model binaries that require x64"
      - "The Aspire host requires x64 to coordinate multiple services"
      - "The .ai-dev directory structure is different on 32-bit systems"
    answer: "Windows App SDK requires an explicit platform target and does not support AnyCPU"
    explanation: "Windows App SDK 1.8 does not support the AnyCPU platform. You must specify x64 (or x86 or arm64) when running the WinUI project."

  - prompt: "What is the recommended way to customise an agent's system prompt in the WinUI app?"
    options:
      - "Fork the packaged template on the Templates page and edit the fork"
      - "Edit the packaged template directly in the Templates page"
      - "Modify the system prompt JSON files in ai-dev.core/Features/Agents/"
      - "Override the prompt via the Knowledge Base"
    answer: "Fork the packaged template on the Templates page and edit the fork"
    explanation: "Forking a template creates an editable copy while preserving the original. Editing packaged templates directly risks losing changes when the platform is updated."

  - prompt: "What is the Knowledge Base used for?"
    options:
      - "Storing curated facts and project conventions that agents can read via MCP tools during sessions"
      - "Storing agent session transcripts for later review"
      - "Recording Decisions and their resolutions"
      - "Caching LLM responses to reduce API costs"
    answer: "Storing curated facts and project conventions that agents can read via MCP tools during sessions"
    explanation: "The Knowledge Base holds structured project knowledge (architecture decisions, coding standards, business rules) that agents access via the read_kb_entry MCP tool during sessions."

  - prompt: "Which page should you use to review what an agent did on a specific task?"
    options:
      - "Task Transcript page"
      - "Digest page"
      - "Insights page"
      - "Sessions page"
    answer: "Task Transcript page"
    explanation: "The Task Transcript page filters the transcript to a specific task, showing only the work done for that task across all sessions — ideal for reviewing completed work before moving to Done."

  - prompt: "Where should agent credentials and API keys be stored in the WinUI app?"
    options:
      - "Secrets page — credentials are stored encrypted and injected at session start"
      - "Knowledge Base — so agents can read them during sessions"
      - "studio-settings.json — the user-local settings file"
      - "Task descriptions — so the agent has them when the task starts"
    answer: "Secrets page — credentials are stored encrypted and injected at session start"
    explanation: "Secrets are stored encrypted on disk via the Secrets page and decrypted at session start. Never store credentials in task descriptions or Knowledge Base entries."

  - prompt: "What does a consistently high Decision rate for a specific agent role indicate?"
    options:
      - "The agent's system prompt is missing important context that should be added"
      - "The agent's executor is too slow to process complex tasks"
      - "The board tasks assigned to that role are too simple"
      - "The MCP tools available to that agent are insufficient"
    answer: "The agent's system prompt is missing important context that should be added"
    explanation: "Per the Insights page guidance, a high Decision rate for a role typically means the system prompt lacks context the agent needs to make decisions independently. Refining the prompt reduces Decisions."
---
