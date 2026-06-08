# What is AI Dev Studio?

## Context

Modern AI coding assistants are powerful in isolation, but they struggle with complex, multi-phase software projects. A single agent asked to "build a feature" can get lost, lose context, or produce incomplete work. AI Dev Studio was built to solve this problem.

## Core Concept

AI Dev Studio is a **local-first multi-agent AI orchestration platform**. Instead of relying on one AI model to do everything, it coordinates a team of specialised agents — each with a defined role, its own LLM backend, and its own inbox — to tackle software development tasks collaboratively.

The platform is designed around three principles:

1. **Specialisation** — Different roles (Developer, Architect, QA, DevOps) handle different concerns. A task assigned to the QA agent is handled by a model prompt shaped for quality analysis, not a generic assistant.
2. **Local-first** — Agents can run against Ollama or LM Studio, keeping code and context on your machine. No data needs to leave your network.
3. **Transparency** — Every agent session, tool call, and decision is logged. You can read the full transcript for any session and see exactly what the agent did and why.

> [!INFORMATION]
> The platform supports both cloud backends (Anthropic API, GitHub Models, Copilot CLI) and local backends (Ollama, LM Studio). You choose per agent.

## Practical Steps

To get a feel for the problem AI Dev Studio solves, consider this scenario:

1. You have a complex feature request: add OAuth2 login, update the database schema, write integration tests, and update the docs.
2. With a single agent, you get a long, context-overloaded conversation that often derails.
3. With AI Dev Studio, you create four tasks on the board, assign each to the appropriate specialist agent, and let them work in parallel. Agents raise Decisions when they need human input. You resolve those and they continue.

> [!TIP]
> The clearest signal that you need multi-agent orchestration is when a single AI conversation keeps losing track of earlier context. That is the problem this platform is built for.

## Key Takeaway

AI Dev Studio coordinates specialised AI agents so that complex software tasks can be decomposed, distributed, and executed with full transparency — locally or via cloud APIs.
