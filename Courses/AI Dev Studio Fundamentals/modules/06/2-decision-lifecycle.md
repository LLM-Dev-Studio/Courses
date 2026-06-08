# The Decision Lifecycle in Depth

## Context

Decisions are the primary mechanism by which agents ask for help. Understanding the full lifecycle — from how an agent decides to raise one, to what happens when it is resolved — helps you write better task descriptions and provide faster, more effective resolutions.

## Core Concept

### When does an agent raise a Decision?

An agent raises a Decision when it encounters an ambiguity it cannot resolve from available context. Common triggers:

- **Ambiguity** — the task description could be interpreted multiple ways
- **Missing information** — a required value (URL, credential, table name) is not in the task, KB, or secrets
- **Blocker** — the agent has tried multiple approaches and all have failed
- **Confirmation request** — the agent is about to do something irreversible and wants explicit approval

Agents call the `raise_decision` MCP tool to create a Decision. This records the question, the context, and the agent's current state, then pauses the session.

> [!NOTE]
> A well-written Decision is an asset, not a failure. It means the agent has done enough work to identify a specific gap and communicate it precisely. The failure case is an agent that silently makes a wrong assumption.

### The full lifecycle

```
1. Agent calls raise_decision MCP tool
   → Decision created with type, summary, and context
   → Agent session pauses (awaiting input)

2. Decision appears in:
   → Decisions panel (VS Code)
   → DecisionsPage (WinUI app)
   → Decision detail in board editor

3. Human (or another agent) reads context
   → Types resolution
   → Clicks Resolve

4. Platform calls POST /api/decisions/{id}/resolve
   → Decision status → Resolved
   → DecisionReply Message created in agent's inbox

5. Agent session resumes
   → Reads DecisionReply from inbox
   → Applies resolution to current work
   → Continues session
```

### Decision types

| Type | When raised | Example |
|------|-------------|---------|
| `Ambiguity` | Multiple valid interpretations | "Should I update all callers or just add an overload?" |
| `Blocker` | Tried multiple approaches, all failed | "Both migration strategies fail on the existing constraint" |
| `Clarification` | Missing information to proceed | "Which environment should I target for this test?" |
| `ConfirmationRequest` | About to take an irreversible action | "This will delete 3 files — confirm?" |

### Writing effective resolutions

A resolution is fed back into the agent's session as part of its next prompt. Be specific:

- **Ambiguity** → Pick one interpretation explicitly: "Use option A: update all callers."
- **Blocker** → Describe the new approach: "Try using `TRUNCATE TABLE` inside a transaction instead of `DELETE`."
- **Clarification** → Provide the exact value: "Target `staging`. Connection string is in `.env.staging`."
- **ConfirmationRequest** → Approve or cancel: "Confirmed. Delete those files."

> [!WARNING]
> Vague resolutions ("use your judgement") often result in the agent raising a second Decision with the same context. Resolve Decisions definitively.

## Practical Steps

1. Create a task with an intentionally ambiguous description
2. Assign it to the Developer agent and run it
3. Watch for a Decision to appear in the Decisions panel
4. Open the Decision detail and read the full context the agent provided
5. Write a specific resolution and resolve it
6. Watch the agent resume and complete the task

## Key Takeaway

Decisions are the agent's way of asking precise questions — providing specific, decisive resolutions is the single most effective way to reduce session length and improve agent output quality.
