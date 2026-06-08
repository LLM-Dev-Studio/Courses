# Resolving Decisions from VS Code

## Context

When an agent gets stuck, it raises a Decision — a typed question that blocks further progress. The Decisions panel in VS Code lets you read the context and provide a resolution without leaving your editor.

## Core Concept

### The Decision lifecycle

```
Agent hits an ambiguity or blocker
          ↓
Agent calls the raise_decision MCP tool
          ↓
Decision appears in Decisions panel
(agent session is paused)
          ↓
Human reads context and types resolution
          ↓
Human clicks Resolve
          ↓
Extension calls POST /api/decisions/{id}/resolve
          ↓
Resolution arrives as a Message in agent's inbox
          ↓
Agent session resumes from where it paused
```

### Reading a Decision

Each Decision card in the panel shows:
- **Title** — a short summary of what the agent is uncertain about
- **Context** — the full detail the agent provided: what it was trying to do, what it tried, and what it needs clarified
- **Type** — the category of question (e.g., `Ambiguity`, `Blocker`, `Clarification`)

Read the context carefully. The agent included it because it needs that information to continue. A vague resolution ("just do it") often results in another Decision being raised.

> [!TIP]
> If the agent's context references a file, open that file in VS Code before typing your resolution. Having the code in view leads to more precise answers.

### Writing a good resolution

A good resolution is:
- **Specific** — names the exact approach, file, or value the agent should use
- **Decisive** — does not hedge or ask the agent to "figure it out"
- **Contextual** — references the relevant code or requirement if helpful

**Poor resolution:** "Just use whatever makes sense"

**Good resolution:** "Use the `UserRepository.GetByEmailAsync()` method in `ai-dev.core/Features/Users/UserRepository.cs`. Return null if not found rather than throwing."

### Resolving a Decision

1. Click on the Decision card to expand the full context
2. Read through the details
3. Type your resolution in the text box at the bottom of the card
4. Click **Resolve**

The Decision moves out of the pending list and a Message is sent to the agent. If the agent's session is still running (paused), it will process the message and continue.

> [!NOTE]
> Resolved Decisions are preserved in the decisions history at `.ai-dev/<project-slug>/decisions/`. You can review past decisions to understand patterns in where agents get stuck.

## Practical Steps

1. Open the Decisions panel — note any pending decisions
2. Click one to expand the full context
3. Read through what the agent was trying to do and what it needs
4. Formulate a specific answer
5. Type it in the resolution box and click Resolve
6. Switch to the Agents panel — the agent should return to Running status shortly

> [!SUCCESS]
> You will know the resolution worked when the agent's status returns to Running in the Agents panel and new entries appear in its session transcript.

## Key Takeaway

Resolving a Decision is the primary way to unblock a stuck agent — provide a specific, decisive answer in the Decisions panel and the agent resumes automatically.
