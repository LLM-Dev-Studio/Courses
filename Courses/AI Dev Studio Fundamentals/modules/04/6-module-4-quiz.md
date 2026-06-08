---
lessonType: quiz
passThreshold: 80
maxAttempts: 2
resetScopeOnFail: module
questions:
  - prompt: "Which agent role is responsible for monitoring all other agents and sending nudges?"
    options:
      - "Overwatch"
      - "Guard"
      - "Process Evolution"
      - "PM"
    answer: "Overwatch"
    explanation: "Overwatch is a meta-coordination role. It does not work on tasks directly — it monitors all running agents and sends Messages to nudge them when they appear stuck or need guidance."

  - prompt: "What happens when a task is assigned to an agent on the board?"
    options:
      - "A TaskAssigned domain event fires and a Message is added to the agent's inbox"
      - "The agent immediately starts a new session and reads the task"
      - "The task is moved to In Progress and the agent's status changes to Running"
      - "A Planning Session is created to decompose the task"
    answer: "A TaskAssigned domain event fires and a Message is added to the agent's inbox"
    explanation: "Assigning a task fires a TaskAssigned domain event, which creates a Message in the agent's inbox. The agent processes this message at the start of its next session."

  - prompt: "Why should task descriptions be written clearly and in detail?"
    options:
      - "Agents read task descriptions verbatim as their primary context — vague tasks lead to more Decisions and slower progress"
      - "The board validates task descriptions before allowing assignment"
      - "Overwatch uses task descriptions to generate the digest report"
      - "The board's search feature relies on well-written descriptions"
    answer: "Agents read task descriptions verbatim as their primary context — vague tasks lead to more Decisions and slower progress"
    explanation: "AgentPromptBuilder includes the task description directly in the agent's prompt. If the description lacks context, the agent will raise a Decision to ask for it."

  - prompt: "Where are agent session transcripts stored on disk?"
    options:
      - ".ai-dev/<project-slug>/sessions/"
      - ".ai-dev/<project-slug>/board/"
      - ".ai-dev/<project-slug>/agents/"
      - ".ai-dev/workspaces.json"
    answer: ".ai-dev/<project-slug>/sessions/"
    explanation: "Every session transcript is stored in the sessions/ subdirectory under the project slug. Each session gets its own file named by session ID."

  - prompt: "What does manually clicking Process on a message in the Messages panel do?"
    options:
      - "Marks the message as processed so the agent will never see it"
      - "Forces the agent to start a session immediately to handle the message"
      - "Moves the associated task to the Done column"
      - "Sends the message content as a Decision for the agent to resolve"
    answer: "Marks the message as processed so the agent will never see it"
    explanation: "Clicking Process marks the message as processed without agent involvement. The agent will not see the message in its next session. Only do this if the message is no longer relevant."

  - prompt: "What is the difference between an agent's Role and its Executor?"
    options:
      - "Role defines what the agent does (system prompt); Executor defines how it does it (which LLM backend)"
      - "Role is the agent's name; Executor is the version of the LLM model"
      - "Role is set by the board; Executor is set by the agent template"
      - "Role and Executor are the same concept with different names"
    answer: "Role defines what the agent does (system prompt); Executor defines how it does it (which LLM backend)"
    explanation: "A role (Developer, QA, etc.) sets the system prompt and capability focus. An Executor (Anthropic, Ollama, etc.) is the LLM backend that processes the prompt. Any role can use any executor."
---
