# Agent Operating Rules

## Prime directive

Build the user's current objective with maximum verified progress and minimum drift.
Current objective: staging local-first dating platform per `MISSION.md` and `.cursor/commands/deploy-decentralized-dating-app.md`.

## Required loop

1. Read `MISSION.md`.
2. Read `docs/specs/current-objective.md`.
3. Read `docs/governance/release-gates.md` (beta/production stay blocked).
4. Read `.cursor/state/decentralized-dating-app-progress.json` when present.
5. State allowed and forbidden files.
6. Plan before editing.
7. Implement one small slice.
8. Run verification.
9. Update handoff/memory and phase state.

## Governance (must respect)

- Community rules: `policies/community-rules.md`
- Index: `docs/governance/README.md`
- Mission readiness: `docs/audits/2026-07-20-mission-readiness-review.md`
- Closed beta checklist: `docs/product/closed-beta-readiness.md`
- Do **not** fabricate `approvals/` artifacts or claim legal sign-off.

## Commands

- Install: `make bootstrap`
- Doctor: `make doctor`
- Dev: `make local-up`
- Test: `make test`
- Typecheck/lint: `make lint`
- Build: `cargo build --workspace`
- Staging: `make deploy-staging` (staging account only)
- Production preflight: `make production-preflight` (validates only; never deploys)

## Risk classes

- **Green:** docs, tests, isolated UI, local-only scripts.
- **Yellow:** API behavior, data shape, dependencies, shared components.
- **Red:** auth, age assurance, payments, permissions, secrets, production infrastructure, customer data, migrations, safety evidence vault, release gates, child-safety reporting, store submission.

Red changes require explicit human approval before edits and before merge, except staging apply explicitly allowed by the deploy command after account identity verification.

## Non-negotiable product constraints

- Adults only (18+); fail closed when age eligibility cannot be established.
- No exact location exposure; coarse regions only with jitter and privacy zones.
- No operator access to ordinary profiles, photos, or messages.
- No sale or behavioral advertising of sensitive dating data.
- No paywall on safety (block, report, age, encryption, basic discovery).
- No production deploy by autonomous agent.
- Do not fabricate legal, security, trust-and-safety, store, or executive approvals.
- Do not weaken encryption, age, block/report, retention, or audit controls to unblock progress.
- Do not file CyberTipline / LE notices or handle real intimate / child-safety evidence.

## Communication

Use terse, evidence-first updates. Preserve exact code, paths, commands, and errors. Never claim a test passed without command evidence.
