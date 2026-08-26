# Canonical agent capabilities and MCP setup

- **Status:** active
- **Updated:** 2026-08-26
- **Architect:** ChatGPT SOL 5.6 / Main Agent
- **Repository:** `PeterJFrancoIII/swipe-dating`
- **Branch:** `review/asc-first-pass-submit`
- **Purpose:** single source of truth for project-relevant agent capabilities, MCP/connectors, and repository-local skills.

This file defines the **project-approved capability set**, not an exhaustive list of every tool a model vendor may expose. Runtime capabilities can differ by host. Agents must never claim a connector/MCP is available until their current runtime exposes it successfully.

## Roles

| Agent | Role | Primary responsibility |
|---|---|---|
| ChatGPT SOL 5.6 / Main Agent | Architect / reviewer / administrator | Scope, architecture, task assignment, review, acceptance, shared-memory curation |
| Gemini 3.7 Flash in Antigravity | Implementation / verification subagent | Execute bounded tasks, local code/test/device work, return evidence as `ready_for_review` |
| Cursor implementation agents | Implementation subagents | Execute bounded tasks inside allowed files, return evidence as `ready_for_review` |

Only the Main Agent may mark implementation work `accepted` unless the human owner explicitly overrides that workflow.

## Required common project capability

### GitHub repository access — REQUIRED

Purpose:
- Read the canonical repository and branch.
- Read/write `.agent-memory/` task and handoff packets when authorized.
- Inspect commits, PRs, diffs, and review evidence.

Canonical repository:
- `PeterJFrancoIII/swipe-dating`

Canonical shared memory:
- `.agent-memory/`

Rule:
- GitHub is the durable coordination source of truth. Chat-only packets are not canonical.
- Every agent must record the repository, branch/ref, and task file used.

Runtime mapping:
- Main Agent: GitHub connected tool/MCP.
- Gemini/Antigravity: Git/GitHub access available in its implementation environment; it must verify access at task start.
- Cursor: Git/GitHub access available in its implementation environment; it must verify access at task start.

## Local implementation capabilities

### Filesystem + shell / terminal — REQUIRED for implementation agents

Gemini/Antigravity and Cursor require local repository filesystem and shell access for implementation tasks.

Current product client:
- React Native + Expo under `apps/swipe/`.

Typical project commands:
- `npx tsc --noEmit`
- `npm test`
- Expo / Metro commands as required by the active task
- Git status/diff commands

Do not use the old Python/Jinja R&D client as the active product unless a task explicitly targets a retained legacy surface.

### Apple/Xcode physical-device tooling — REQUIRED only for iOS/device tasks

For physical iPhone verification tasks, the implementation runtime may use:
- Xcode command-line tools
- `xcrun devicectl`
- Metro / Expo development runtime
- connected iPhone hardware

A host-side Node benchmark is not physical-device evidence. Device tasks must distinguish Mac/host measurements from measurements or observations made on the phone/runtime rendering the app.

### NAS / development API access — TASK-CONDITIONAL

Use only when the active task requires the existing development API/NAS environment.

Requirements:
- confirm the target environment before changing or testing state;
- do not deploy production without explicit owner authorization;
- do not store credentials, tokens, host secrets, or private production data in `.agent-memory/`.

## Main Agent project-relevant connectors / MCPs

The Main Agent should prefer the following when available in its current ChatGPT runtime:

| Capability | Status | Project use |
|---|---|---|
| GitHub | REQUIRED | Repository/shared-memory review and authorized writes |
| Context7 | OPTIONAL / preferred for SDK docs | Current React Native, Expo, TypeScript, and library documentation |
| Firecrawl / web research | OPTIONAL | Current Apple, Expo/EAS, provider, policy, or external documentation research |
| Cloudflare plugin/tools | TASK-CONDITIONAL | Only when a task actually targets Cloudflare infrastructure or Pages/Workers |
| Google Drive/Docs/Sheets/Slides | TASK-CONDITIONAL | Only when the owner identifies connected Drive material as project source/input |
| Gmail / Calendar / Contacts | NOT part of normal engineering setup | Use only for an explicit owner request involving those connected accounts |

The Main Agent may have additional runtime tools. They are not automatically project dependencies and should not be added to the canonical setup merely because they exist.

## Gemini / Antigravity MCP rule

The repository does not currently contain a trustworthy machine-readable inventory of Antigravity's live MCP server connections. Therefore:

1. Gemini must report its **currently connected project-relevant MCPs/tools** at task startup when tool availability matters.
2. It must distinguish:
   - connected and successfully callable;
   - configured but unavailable/unauthenticated;
   - not configured.
3. Do not claim "all MCP connectors active" without naming the connectors used for the task and verifying them.
4. At minimum, implementation work requires repository/filesystem/shell access; iOS work additionally requires the Apple/device tooling above.
5. An MCP not required by the active task should not block work.

If Antigravity later gains a stable project-level MCP config file, record only server names/purposes here. Never commit secrets or access tokens.

## Repository-local skills

Current repository-local skill directories:

- `.agents/skills/frontend-design/`
- `.agents/skills/web-design-guidelines/`

### Important scope correction

Both existing skills are explicitly adapted to the older synthetic FastAPI/Jinja web UI. They are **legacy/task-conditional**, not default skills for the active React Native/Expo mobile client.

Do not apply their instructions to `apps/swipe/` when those instructions conflict with React Native/Expo or the current product brief.

For mobile UI work:
- use the active task specification, current product scope, React Native/Expo conventions, and current platform accessibility guidance;
- do not let legacy web-only skill text prohibit React, native state, or mobile implementation patterns.

For a retained server-rendered web surface explicitly named by a task, those two local skills may still be used within their stated scope.

## Main Agent installed skills

ChatGPT may expose platform skills/plugins in addition to repository-local skills. For this project, use them only when the task matches their documented trigger. Project-relevant examples include:

- Cloudflare platform skill — only for Cloudflare work.
- GitHub repository tooling/skill when available — repository/PR/review work.
- General document/spreadsheet/slides/PDF skills — only when creating or editing those artifact types.

Do not treat unrelated installed skills as project requirements.

## Startup capability check

Before implementation or review that depends on external tools, the acting agent should record:

- agent/runtime identity;
- repository + branch/ref;
- active task file;
- project-relevant tools/MCPs actually available for that task;
- any required connector that failed authentication or is unavailable;
- whether the task can proceed safely without it.

Tool availability is evidence, not authority. A connector being available does not authorize deployment, store submission, payments, production changes, or scope expansion.

## Known stale configuration corrected by this file

1. `.agent-memory/README.md` previously described shared memory as Codex + Cursor only; Gemini/Antigravity is now an active bounded implementer.
2. `.agent-memory/CURSOR_IDE_AGENT_UPDATE.md` contains stale statements describing the active product as a Python FastAPI/Jinja R&D client. The active client is React Native + Expo in `apps/swipe/`; treat conflicting legacy passages as superseded by current task/shared-memory state.
3. Repository-local `frontend-design` and `web-design-guidelines` skills are legacy web-scoped skills, not default mobile skills.
4. Generic statements such as "all MCP connectors are active" are insufficient evidence. Name and verify only the project-relevant connections needed by the task.

## Security

Never commit:
- MCP access tokens;
- API keys;
- cookies;
- SSH private keys;
- Apple credentials;
- GitHub tokens;
- NAS credentials;
- production secrets;
- private user data.

Store capability names and purposes only.
