# Shared agent memory

This tracked directory is the durable coordination space shared by Codex and Cursor.

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
| Architect / admin | Codex | Scope, architecture, assignments, decisions, acceptance, shared-context curation |
| Implementer | Cursor agents | Only the bounded work assigned in a task record |

## Startup reads

In addition to the reads required by `AGENTS.md`, both agents read:

1. `.agent-memory/README.md` (this file)
2. `.agent-memory/CONTEXT.md`
3. `.agent-memory/DECISIONS.md`
4. `.agent-memory/CURRENT.md`
5. The task file named by `CURRENT.md` when present

## Task flow

1. Codex creates a task record with allowed files, forbidden files, and acceptance criteria.
2. Cursor marks the task `in_progress`, implements narrowly inside allowed files, records exact files changed and validation evidence, then marks `ready_for_review`.
3. Codex reviews the diff and evidence, and alone marks `accepted` or requests changes.

Cursor does not expand scope, make product or architecture decisions, or self-approve.

## Content rules

**Prohibit:** secrets, credentials, private user data, generated logs, dependency dumps, speculative facts, and copied chat transcripts.

**Require:** concise facts, ISO dates, exact paths and commands, evidence-backed status, append-only decisions, and explicit unknowns.

## Ownership of context and decisions

`CONTEXT.md` and `DECISIONS.md` are architect-owned. Cursor may edit them only when a task record explicitly authorizes those edits.
