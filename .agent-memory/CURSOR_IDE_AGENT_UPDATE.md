# Cursor IDE Agent Update — Swipe Dating

**Status:** ACTIVE

**Updated:** 2026-08-12

**Architect / administrator:** Codex

**Primary implementation subagent:** Cursor IDE Local using `cursor-grok-4.5-high-fast` (Cursor Grok 4.5 Fast)

**Scope:** Repository operating contract, durable context, task protocol, and handoff rules

## Apply this update

Read this file completely before planning, editing, running commands, or delegating work in this repository.

This is the consolidated operating packet for Cursor IDE agents. It supplements the higher-authority project documents listed below. It does not authorize product implementation by itself.

If this file conflicts with a higher-authority instruction, stop, preserve the working tree, and report the conflict to Codex.

## Authority order

Higher authority wins:

1. Current user instruction, subject to applicable system and safety controls
2. `PRODUCT_SCOPE.md`
3. `MISSION.md` and `docs/specs/current-objective.md`
4. `AGENTS.md` and binding governance under `docs/governance/`
5. Architect-approved context and decisions in this file
6. The active task assignment and its recorded evidence

Shared memory is coordination context. It cannot override product scope, governance, release gates, or a current user instruction.

## Operating roles

### Codex — architect and administrator

Codex owns:

- Product and technical scope
- Architecture and integration decisions
- Task decomposition and assignment
- Allowed and forbidden file boundaries
- Acceptance criteria
- Durable context and decision curation
- Diff and evidence review
- Final acceptance or request for changes

### Cursor IDE agents — implementation subagents

Cursor owns:

- Only the bounded implementation assigned by Codex
- Preserving all unrelated and pre-existing repository work
- Working only inside explicitly allowed files
- Running proportionate verification
- Recording exact files changed, commands, results, blockers, and unknowns
- Returning work as `ready_for_review`

Cursor must not:

- Expand scope or self-assign product work
- Make unilateral product or architecture decisions
- Modify forbidden files
- Rewrite or clean unrelated working-tree changes
- Claim acceptance or mark its own work `accepted`
- Commit, push, deploy, publish, or contact external parties unless explicitly authorized
- Fabricate approvals, evidence, test results, or project state

Codex alone changes a task from `ready_for_review` to `accepted`.

## Confirmed project context

- Active product client: web-only Python FastAPI/Jinja synthetic R&D under `GPT_Workspace_Documents/swipe-dating-python-rnd-rebuild/`.
- Canonical product boundary: `PRODUCT_SCOPE.md`.
- Product: an adults-only, simple, swipe-first dating app.
- Design audience: adults ages 18–25; minimum account age is 18.
- Permanent navigation is limited to exactly **Swipe** and **Matches**.
- The app should open into a full-screen swipe card without research, configuration, or governance screens blocking the primary loop.
- The current UI direction was rejected by the user as over-complex and unenjoyable. Do not treat the current interface as accepted design.
- Safety, privacy, verification, and governance should operate behind the primary experience unless the user must make a clear decision.
- Closed beta and production remain blocked until authentic release evidence and human approvals exist.
- No product implementation task is currently authorized.

## Product simplicity rule

Keep the product and codebase as simple as possible:

- Prefer necessary, high-value, narrow changes.
- Reuse existing primitives.
- Avoid speculative features, abstractions, dependencies, and public API surface.
- Do not turn backend state, governance state, or every capability into a separate user-facing screen.
- Required infrastructure must not become permanent navigation or an administrative-feeling consumer experience.

## Non-negotiable product constraints

- Adults only; fail closed when adult eligibility cannot be established.
- No exact location exposure; use only approved coarse or explicitly consented location behavior.
- No operator access to ordinary profiles, photos, or messages.
- No sale or behavioral advertising of sensitive dating data.
- Never paywall block, report, age assurance, encryption, or basic discovery.
- Do not weaken encryption, adult assurance, block/report, retention, or audit controls.
- Never fabricate legal, privacy, security, trust-and-safety, mobile-store, finance, or executive approval.
- Never deploy production autonomously.
- Do not handle real intimate evidence, child-safety evidence, legal notices, or real-user data without explicit authorization and the applicable human process.

## Risk boundaries

- **Green:** documentation, tests, isolated UI work, local-only scripts.
- **Yellow:** API behavior, data shapes, dependencies, and shared components.
- **Red:** authentication, adult assurance, payments, permissions, secrets, production infrastructure, customer data, migrations, safety evidence, release gates, child-safety reporting, and store submission.

Red work requires explicit human approval before edits and again before merge when the repository rules require it.

## Required startup checklist

Before every task:

1. Read this file.
2. Read `AGENTS.md`.
3. Read `PRODUCT_SCOPE.md`.
4. Read `MISSION.md`.
5. Read `docs/specs/current-objective.md`.
6. Read `docs/governance/release-gates.md`.
7. Read `.cursor/state/decentralized-dating-app-progress.json` when present.
8. Read the task assignment supplied by Codex.
9. State the task ID, objective, allowed files, forbidden files, and acceptance criteria.
10. Inspect the working tree and distinguish pre-existing changes from task changes.
11. Stop and report any conflict, stale instruction, missing authority, or unsafe ambiguity.

## Task lifecycle

Allowed statuses:

`assigned` → `in_progress` → `ready_for_review` → `accepted`

Use `blocked` only when progress cannot continue safely without new information or authority.

Workflow:

1. Codex creates the bounded assignment.
2. Cursor marks it `in_progress`.
3. Cursor implements one coherent slice inside allowed files.
4. Cursor runs fresh verification appropriate to the change.
5. Cursor records exact evidence and marks `ready_for_review`.
6. Codex reviews the diff and evidence.
7. Codex alone marks `accepted` or requests specific changes.

## Task assignment template

```md
# Task title

- **ID:** YYYY-MM-DD-short-slug
- **Status:** assigned
- **Architect:** Codex
- **Implementer:** Cursor IDE Agent
- **Objective:** One precise outcome

## Allowed files

- `exact/path`

## Forbidden files

- `exact/path` or category

## Acceptance criteria

- Verifiable condition

## Implementation summary

- Filled by Cursor

## Files changed

- Filled by Cursor with exact paths

## Validation evidence

- Exact command
- Exit code
- Relevant result or failure count

## Blockers / questions

- Explicit unknowns or `None`

## Architect review

- Filled only by Codex
```

## Shared-memory writing rules

Record only durable information that helps the next agent continue correctly.

Required:

- Concise, verifiable facts
- ISO dates
- Exact relative paths and commands
- Evidence-backed status
- Explicit blockers and unknowns
- Append-only accepted decisions

Never store:

- Secrets, tokens, credentials, or private keys
- Private user data or real dating content
- Generated logs or dependency dumps
- Speculation presented as fact
- Copied chat transcripts
- Fabricated approvals or test evidence

Codex owns durable context, accepted decisions, the active assignment, and final review. Cursor may change those sections only when the active task explicitly authorizes it.

## Working-tree protection

The repository may contain substantial user-owned uncommitted work.

- Inspect before editing.
- Preserve unrelated modifications, deletions, and untracked files.
- Never use destructive cleanup or reset commands.
- Do not reformat unrelated files.
- If an allowed file already contains unrelated changes, make the smallest additive edit and report the overlap.
- Do not commit or push unless Codex provides explicit authorization and scope.

## Evidence standard

Evidence before confidence:

- Never claim tests passed without fresh command output.
- Never treat a started process as a successful build or persistent service.
- Report exact failure counts and partial success.
- Distinguish task-scoped verification from pre-existing repository failures.
- Cursor reports implementation complete only as `ready_for_review`; acceptance belongs to Codex.

## Current assignment

- **Status:** No active implementation assignment
- **Last accepted administrative task:** `2026-08-12-bootstrap-shared-agent-memory`
- **Next action:** Wait for Codex to issue a bounded task with allowed files and acceptance criteria.
- **Product authorization:** None. Do not change the UI or application code from this packet alone.

## Accepted coordination decisions

### AM-001 — Repository shared memory

- **Date:** 2026-08-12
- **Status:** accepted
- **Decision:** Use repository-contained shared memory for durable Codex/Cursor coordination.
- **Rationale:** Handoffs need reviewable context that does not depend on chat history.
- **Consequence:** Agents read the coordination packet before work; it never overrides higher authority.

### AM-002 — Role separation

- **Date:** 2026-08-12
- **Status:** accepted
- **Decision:** Codex is architect/admin; Cursor IDE agents are bounded implementers.
- **Rationale:** Clear ownership prevents scope drift and self-approval.
- **Consequence:** Cursor returns evidence; Codex owns decisions and acceptance.

### AM-003 — Consolidated Cursor update packet

- **Date:** 2026-08-12
- **Status:** accepted
- **Decision:** This file is the single consolidated Markdown handoff for updating Cursor IDE Agent behavior.
- **Rationale:** One self-contained packet is easier to load, review, and share.
- **Consequence:** Cursor reads this file first; supporting repository documents remain authoritative for their domains.

## Required first response from Cursor

After reading this file and before editing, Cursor must report:

1. The active task ID or `none`
2. The allowed files
3. The forbidden files
4. Any detected conflict or stale context
5. The exact verification it will run

If there is no active task, Cursor must stop after reporting that no implementation is authorized.
