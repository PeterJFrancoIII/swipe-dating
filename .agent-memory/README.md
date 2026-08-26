# Shared agent memory

This tracked directory is the durable coordination space shared by the Main Agent and bounded implementation subagents, including Cursor and Gemini/Antigravity.

## Authority order

Higher authority wins. Shared memory is coordination context only and cannot override higher authority.

1. Current user instruction
2. `PRODUCT_SCOPE.md`
3. `MISSION.md` and `docs/specs/current-objective.md`
4. `AGENTS.md` and binding governance
5. Architect-approved `.agent-memory/CONTEXT.md` and `.agent-memory/DECISIONS.md`
6. Task records under `.agent-memory/tasks/`

## Roles

| Role | Owner | Owns |
|---|---|---|
| Architect / admin | ChatGPT SOL 5.6 / Main Agent | Scope, architecture, assignments, decisions, acceptance, shared-context curation |
| Implementer | Cursor agents | Only bounded work assigned in a task record |
| Implementer | Gemini 3.7 Flash / Antigravity | Only bounded work assigned in a task record |

Only the Main Agent marks implementation work `accepted` unless the human owner explicitly overrides that workflow.

## Startup reads

In addition to the reads required by `AGENTS.md`, all project agents read:

1. `.agent-memory/README.md` (this file)
2. `.agent-memory/AGENT_CAPABILITIES.md`
3. `.agent-memory/CONTEXT.md`
4. `.agent-memory/DECISIONS.md`
5. `.agent-memory/CURRENT.md`
6. The task file named by `CURRENT.md` when present

## Capability truth

`.agent-memory/AGENT_CAPABILITIES.md` is the canonical project-level inventory of required/optional tools, MCP/connectors, and repository-local skill scope.

- Runtime tool availability can differ by host.
- Agents must verify project-relevant connectors that a task actually depends on.
- Do not claim "all MCP connectors active" without naming and testing the relevant connections.
- Never store credentials, tokens, cookies, or secrets in shared memory.

## Current client

The active product client is React Native + Expo under `apps/swipe/`.

Legacy references to the older synthetic FastAPI/Jinja R&D client are not authoritative for current mobile work unless a task explicitly targets a retained web surface.

## Task flow

1. Main Agent creates a task record with allowed files, forbidden files, and acceptance criteria.
2. Assigned implementation subagent marks the task `in_progress`, implements narrowly inside allowed files, records exact files changed and validation evidence, then marks `ready_for_review`.
3. Main Agent reviews the diff and evidence, and alone marks `accepted` or requests changes.

Implementation subagents do not expand scope, make product or architecture decisions, or self-approve.

## Review packets on GitHub

Review packets **live and die** in this directory on the GitHub remote. Chat is not the packet.

After writing or updating a handoff, task record, or review packet:

1. Keep it under `.agent-memory/` (usually `tasks/`).
2. Commit it.
3. Push it to the review branch.

Main Agent reads the GitHub file, not a paste that exists only in a thread. Do not leave a review packet only in chat, a local working tree, or `docs/handoffs/` unless that file is also mirrored here and pushed.

## Content rules

**Prohibit:** secrets, credentials, private user data, generated logs, dependency dumps, speculative facts, and copied chat transcripts.

**Require:** concise facts, ISO dates, exact paths and commands, evidence-backed status, append-only decisions, and explicit unknowns.

## Ownership of context and decisions

`CONTEXT.md` and `DECISIONS.md` are architect-owned. Implementation subagents may edit them only when a task record explicitly authorizes those edits.
