---
lessonType: quiz
passThreshold: 80
maxAttempts: 2
resetScopeOnFail: module
questions:
  - prompt: "What MCP tool does an agent call to create a Decision?"
    options:
      - "raise_decision"
      - "create_decision"
      - "post_decision"
      - "request_clarification"
    answer: "raise_decision"
    explanation: "Agents call the raise_decision MCP tool when they need human input. This creates a Decision record, pauses the session, and surfaces the question in the Decisions panel."

  - prompt: "Which Decision type should an agent use when it is about to permanently delete files and wants explicit confirmation?"
    options:
      - "ConfirmationRequest"
      - "Blocker"
      - "Clarification"
      - "Ambiguity"
    answer: "ConfirmationRequest"
    explanation: "ConfirmationRequest is for irreversible actions that require explicit human approval before proceeding. This prevents agents from taking destructive actions without oversight."

  - prompt: "What is the minimum free RAM recommended for running a 7B Ollama model without swapping to disk?"
    options:
      - "8 GB"
      - "4 GB"
      - "16 GB"
      - "32 GB"
    answer: "8 GB"
    explanation: "A 7B parameter model requires approximately 8 GB of free RAM to run without memory pressure. Below this threshold the model swaps to disk, reducing session speed by 10–50x."

  - prompt: "Which feature flag must be enabled for progressive discovery and context compaction to activate?"
    options:
      - "LocalFunctionalityEnabled"
      - "ProgressiveDiscoveryEnabled"
      - "LocalModelsEnabled"
      - "ContextCompactionEnabled"
    answer: "LocalFunctionalityEnabled"
    explanation: "The LocalFunctionalityEnabled flag gates all advanced local features: progressive discovery, rule-based context compaction, and local planning sessions."

  - prompt: "In what order do the three phases of a Planning Session run?"
    options:
      - "Business Discovery → Solution Shaping → Planning Decomposition"
      - "Planning Decomposition → Solution Shaping → Business Discovery"
      - "Solution Shaping → Business Discovery → Planning Decomposition"
      - "Business Discovery → Planning Decomposition → Solution Shaping"
    answer: "Business Discovery → Solution Shaping → Planning Decomposition"
    explanation: "Planning Sessions run in three ordered phases: first understand the business goal (Business Discovery), then shape the solution approach (Solution Shaping), then decompose into tasks (Planning Decomposition)."

  - prompt: "When should you skip using a Planning Session and assign tasks directly?"
    options:
      - "When the task is already well-defined and scoped, such as fixing a specific known bug"
      - "When the codebase is small and has fewer than 10 files"
      - "When only one agent will be involved in the work"
      - "When using a local LLM executor rather than a cloud executor"
    answer: "When the task is already well-defined and scoped, such as fixing a specific known bug"
    explanation: "Planning Sessions add overhead. They are most valuable for complex, multi-role features where decomposition is non-trivial. For a specific, scoped bug fix, create the task directly on the board."
---
