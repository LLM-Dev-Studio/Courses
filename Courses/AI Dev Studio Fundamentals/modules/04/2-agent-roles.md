# Agent Roles and Specialisation

## Context

AI Dev Studio ships with a set of pre-configured agent roles. Each role has a system prompt shaped for a specific concern. Assigning the right task to the right role is what makes multi-agent orchestration more effective than a single general-purpose assistant.

## Core Concept

### Built-in roles

| Role | Primary responsibility |
|------|----------------------|
| **Developer** | Writing code, implementing features, fixing bugs |
| **Architect** | System design, ADRs, technology decisions |
| **Designer** | UI/UX design, accessibility, style guides |
| **QA** | Test writing, quality analysis, edge case identification |
| **DevOps** | CI/CD pipelines, infrastructure, deployments |
| **PM** | Requirements, user stories, roadmap management |
| **Analyst** | Data analysis, reporting, metrics interpretation |
| **Growth Marketer** | Messaging, campaigns, conversion optimisation |
| **Guard** | Security review, threat modelling, vulnerability assessment |
| **Process Evolution** | Workflow improvement, retrospectives, process documentation |
| **Overwatch** | Meta-coordination; monitors all agents and sends nudges |

### Role vs. Executor

A role defines **what** the agent does (its system prompt and capabilities). An Executor defines **how** it does it (which LLM backend processes the prompt). You can assign any executor to any role:

- Developer + Anthropic Claude = cloud-powered code generation
- QA + Ollama llama3.1:8b = local, private test writing
- Architect + LM Studio = fully air-gapped design review

### Overwatch

Overwatch is a special role. It does not work on tasks directly — it monitors all running agents and sends Messages to them if they appear stuck, are missing context, or need a nudge. Think of it as a team lead that watches agent activity across the board.

> [!TIP]
> For tasks that involve sensitive code (proprietary algorithms, security keys, private business logic), assign them to an agent using a local executor (Ollama or LM Studio). The code never leaves your machine.

## Practical Steps

1. In the VS Code extension, expand the Agents panel — note the roles listed
2. In the WinUI app, open **Agent Dashboard** — each card shows the role icon and executor
3. Click an agent name to open its detail page — review its system prompt in the Info tab
4. Look at `ai-dev.core/Features/Agents/AgentTemplates/` — the packaged templates show exactly how each role's prompt is constructed

## Key Takeaway

Matching the right role to the right task — and the right executor to the right data sensitivity — is the core skill of effective multi-agent orchestration.
