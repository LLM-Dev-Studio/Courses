# Project and Knowledge Management

## Context

Beyond agents and the board, the WinUI app gives you dedicated pages for managing project settings, agent configuration, the knowledge base, and secrets. These pages let you shape how agents behave and what they know.

## Core Concept

### Project Settings

The **Project Settings page** (`ProjectSettingsPage`) lets you:
- Rename the project
- Update the codebase path (the directory agents operate on)
- Toggle whether the codebase has been initialised (this controls whether the system prompt includes codebase context)

### Agent Templates

The **Templates page** (`TemplatesPage`) lists the available agent role templates — both the packaged templates that ship with the platform and any global templates you have created.

From this page you can:
- Preview the full system prompt for any template
- Fork a template to create a customised version
- Set a forked template as the default for a role

> [!TIP]
> Forking a template is the recommended way to customise agent behaviour. Never edit the packaged templates directly — they may be overwritten on update. Fork, rename, and edit the fork.

### Knowledge Base

The **Knowledge Base page** (`KnowledgeBasePage`) stores curated facts that agents can read during sessions via the MCP tool `read_kb_entry`. Use it for:

- Project architecture decisions
- Coding standards and conventions
- Business rules that agents must follow
- Links to external documentation

Each entry has a title, content, and optional tags. Agents can search the KB by tag or keyword via the MCP tool layer.

### Secrets

The **Secrets page** (`SecretsPage`) stores encrypted credentials scoped to specific agents. Examples:
- API keys for external services the agent needs to call
- Database connection strings for the test environment
- Service account credentials

> [!WARNING]
> Secrets are stored encrypted on disk. They are decrypted at session start and injected into the agent's environment. Do not store secrets in task descriptions or Knowledge Base entries — use the Secrets page.

### General Settings

The **Settings page** (`SettingsPage`) covers application-level configuration:
- API port override
- Ollama URL (default: `http://localhost:11434`)
- LM Studio URL (default: `http://localhost:1234`)
- Health check parameters

The **Preferences page** (`PreferencesPage`) covers user preferences:
- App theme
- **Enable Local Functionality** feature flag (enables progressive discovery, context compaction, and local planning)

## Practical Steps

1. Open **Templates** — browse the pre-packaged Developer template system prompt
2. Fork the Developer template — rename it "Developer (Custom)"
3. Open **Knowledge Base** — add an entry titled "Coding Standards" with a brief description
4. Open **Project Settings** — confirm the codebase path is correct
5. Open **Preferences** — note the "Enable Local Functionality" toggle

## Key Takeaway

The Knowledge Base and Secrets pages are how you give agents persistent, structured knowledge beyond their system prompt — use them to encode project conventions and credentials agents need.
