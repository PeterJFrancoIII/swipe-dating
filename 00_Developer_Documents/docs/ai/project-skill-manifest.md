# Project skill manifest

**Reviewed:** 2026-07-22  
**Scope:** Local synthetic Python web UI only

This manifest applies the AI System Architect Bootloader's least-privilege skill policy. Project
skills are copied into `.agents/skills/`, recorded in `skills-lock.json`, and reviewed before use.
They are not allowed to widen product scope, alter governance, deploy the app, or access secrets.

## Project-installed skills

### `frontend-design`

- Source: `anthropics/skills`
- Reviewed source revision: `1f630fdf9259cec4a14913127dfd7c3b69ef72eb`
- Installed file SHA-256:
  `b1c0ca943ba71f0385a01b1e789bbba272b07541e9737b8df70f4e394b681d83`
- Locked folder hash: `88ff0e041124588e3811dc24e63fa9cba758edbcdd4504b9f23ac075f45409e6`
- Registry assessment at install: Gen Safe, Socket 0 alerts, Snyk Low Risk
- Allowed use: visual direction, typography, hierarchy, responsive critique, and restrained copy
- Constraint: system fonts and existing server-rendered HTML remain authoritative for this slice

### `web-design-guidelines`

- Source: `vercel-labs/agent-skills`
- Reviewed wrapper revision: `4559f18a20c1691c744b4395194290db6a0df5e9`
- Installed file SHA-256:
  `89666bf881bb9d779e020c7bd224698ae6aa1a8d508521bfb9bae5dde604330a`
- Locked folder hash: `ea403a50ec7c6130adc4e7d875408a00df4e4527f5900360e6dd2dcd48da797e`
- Registry assessment at install: Gen Safe, Socket 0 alerts, Snyk Medium Risk
- Allowed use: semantic HTML, accessibility, focus, forms, responsive layout, and reduced motion
- Dynamic-source restriction: the upstream wrapper normally fetches guidelines from `main`. The
  project copy is a self-contained, MIT-licensed subset of reviewed guideline revision
  `4e799d45c17aec1498c269287a83b9dba22b966b` and performs no remote fetch. A newer revision requires
  a fresh review before use.

## Retained workflow skills

These existing global skills are required by the build loop but have no updateable source metadata
in the Skills CLI. They were read and retained at the following local hashes rather than replaced:

- `tdd`: `af059705061156fd4845ddbb736fe92b564118ac5f03551e09ef9e8f6d970638`
- `webapp-testing`: `51b7349e77ec63b7744a6f63647e7566a0b4d2e301121cc10e8c2113af6556a2`
- `verification-before-completion`:
  `ea52d15aabaf72bc6b558efe2c126f161b53961090ddcd712000273bfe8c7b6c`
- `review-security`: `d007ec5a617e9caeef03055cd9c5dad762d80acb4ae1b20377bde4b3b41c46fd`

## Update procedure

1. Run `npx -y skills@1.5.20 list --json` and inspect `skills-lock.json`.
2. Review the complete candidate skill, its executable content, publisher, permissions, and source
   revision before updating.
3. Reject hidden telemetry, broad secret access, unsandboxed shell, mutable remote instructions, or
   production-affecting actions.
4. Update project scope only. Never run a blanket global update for this repository.
5. Refresh this manifest, `skills-lock.json`, and the expected values in
   `scripts/verify_project_skills.py`.
6. Run `python3 scripts/verify_project_skills.py`. Do not use the experimental remote restore path;
   the reviewed, version-controlled project copies are the restoration source.

The app's `MISSION.md`, `AGENTS.md`, scoped Cursor rules, and governance files override every skill.
