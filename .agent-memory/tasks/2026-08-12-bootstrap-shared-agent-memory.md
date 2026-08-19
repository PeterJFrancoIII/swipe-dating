# Shared Agent Memory Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a small repository-tracked memory and handoff protocol shared by Codex and Cursor agents.

**Architecture:** Codex owns durable context, decisions, assignments, and acceptance. Cursor agents execute bounded task records and return evidence without changing product authority.

**Tech Stack:** Markdown, Cursor project rules, Git

---

## Task metadata

- **ID:** 2026-08-12-bootstrap-shared-agent-memory
- **Status:** accepted
- **Architect:** Codex
- **Implementer:** Cursor IDE Agent
- **Objective:** Bootstrap `.agent-memory/` coordination files, add Cursor shared-memory rule, and additively update `AGENTS.md` for roles and handoff. No application/product change.

## Allowed files

- `00_Developer_Documents/AGENTS.md` (canonical target of root `AGENTS.md` symlink)
- new `.agent-memory/**`
- new `.cursor/rules/05-shared-memory.mdc`

## Forbidden files

- all application code
- `PRODUCT_SCOPE.md`, `MISSION.md`, governance and release documents
- `.cursor/state/**`
- every existing Cursor rule
- all git history and remotes

## Acceptance criteria

- Shared memory files exist and are nonempty with the specified authority order, roles, task flow, and content rules.
- `AGENTS.md` gains an Agent roles and shared memory section; Required loop mentions shared-memory reads and handoff without duplicating the section.
- `.cursor/rules/05-shared-memory.mdc` has valid frontmatter and `alwaysApply: true`.
- Root `AGENTS.md` remains a symlink to `00_Developer_Documents/AGENTS.md`.
- Only allowed files changed by this task; pre-existing unrelated work preserved.
- `git diff --check` clean for this work; validation recorded here. No product tests.

## Implementation steps

- [x] Read `AGENTS.md`, `PRODUCT_SCOPE.md`, `MISSION.md`, `docs/specs/current-objective.md`, `docs/governance/release-gates.md`, and `.cursor/state/decentralized-dating-app-progress.json`.
- [x] Create `.agent-memory/README.md` with authority order, roles, startup reads, task flow, prohibitions, and ownership rules.
- [x] Create `.agent-memory/CONTEXT.md` dated 2026-08-12 with confirmed durable context and no product-task authorization.
- [x] Create `.agent-memory/DECISIONS.md` with append-only format plus AM-001 and AM-002.
- [x] Create `.agent-memory/CURRENT.md` pointing at this task; status `ready_for_review` after implementation.
- [x] Create `.agent-memory/tasks/README.md` with statuses and reusable template.
- [x] Create this task record as the saved plan and audit file.
- [x] Additively update `00_Developer_Documents/AGENTS.md` (roles/shared memory section + minimal Required loop update).
- [x] Create `.cursor/rules/05-shared-memory.mdc` with `alwaysApply: true`.
- [x] Verify symlink, file presence/nonempty, frontmatter, `git diff --check`, and scoped status/diff; record evidence below.

## Implementation summary

Bootstrapped repository-tracked shared memory for Codex/Cursor coordination. Added durable context, append-only decisions AM-001/AM-002, current-task pointer, task template, Cursor always-apply rule, and additive `AGENTS.md` role/handoff guidance. No application or product files modified.

## Files changed

- `.agent-memory/README.md` (new)
- `.agent-memory/CONTEXT.md` (new)
- `.agent-memory/DECISIONS.md` (new)
- `.agent-memory/CURRENT.md` (new)
- `.agent-memory/tasks/README.md` (new)
- `.agent-memory/tasks/2026-08-12-bootstrap-shared-agent-memory.md` (new)
- `00_Developer_Documents/AGENTS.md` (modified, additive)
- `.cursor/rules/05-shared-memory.mdc` (new)

## Validation evidence

Recorded 2026-08-12 after verification commands in this session:

```text
# symlink
lrwxr-xr-x AGENTS.md -> 00_Developer_Documents/AGENTS.md
readlink AGENTS.md => 00_Developer_Documents/AGENTS.md

# expected files nonempty (byte sizes)
OK nonempty: .agent-memory/README.md (1935 bytes)
OK nonempty: .agent-memory/CONTEXT.md (1204 bytes; trailing spaces then removed)
OK nonempty: .agent-memory/DECISIONS.md (1390 bytes)
OK nonempty: .agent-memory/CURRENT.md (245 bytes)
OK nonempty: .agent-memory/tasks/README.md (677 bytes)
OK nonempty: .agent-memory/tasks/2026-08-12-bootstrap-shared-agent-memory.md (present)
OK nonempty: 00_Developer_Documents/AGENTS.md (4346 bytes)
OK nonempty: .cursor/rules/05-shared-memory.mdc (1029 bytes)

# alwaysApply
.cursor/rules/05-shared-memory.mdc:3:alwaysApply: true

# git diff --check (full working tree)
exit 2 — pre-existing trailing whitespace in
  00_Developer_Documents/MISSION.md:3
  00_Developer_Documents/MISSION.md:4
  00_Developer_Documents/MISSION.md:5
(not modified by this task; left untouched)

# git diff --check -- 00_Developer_Documents/AGENTS.md .cursor/rules/05-shared-memory.mdc
exit 0

# trailing-whitespace spot-check on all allowed files after CONTEXT.md fix
OK

# git status --short -- .agent-memory .cursor/rules/05-shared-memory.mdc 00_Developer_Documents/AGENTS.md
 M 00_Developer_Documents/AGENTS.md
?? .agent-memory/
?? .cursor/rules/05-shared-memory.mdc

# note
Pre-existing unrelated dirty-tree changes remain present and were not restored,
reformatted, or cleaned (including prior M on .cursor/rules/00-project-constitution.mdc
and .cursor/rules/20-mobile.mdc). Product tests not run (docs/config only).
```

## Blockers / questions

None.

## Architect review

- **Reviewed by:** Codex
- **Reviewed on:** 2026-08-12
- **Decision:** accepted
- **Scope review:** Only the authorized agent rules and new shared-memory files were added by this task; the existing dirty working tree was preserved.
- **Content review:** Authority order, role separation, startup reads, bounded execution, evidence handoff, no-secrets rule, and Codex-only acceptance are present.
- **Verification:** Root `AGENTS.md` symlink, expected nonempty files, Cursor `alwaysApply: true`, scoped whitespace checks, and status/diff inspection were independently rerun before acceptance.
