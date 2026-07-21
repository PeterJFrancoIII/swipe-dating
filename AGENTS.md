# Agent Operating Rules

## Prime directive

Build the current objective with maximum verified progress and minimum drift.

Current objective: adult consent feature foundation in `MISSION.md` and `docs/specs/current-objective.md`. The original deployment command remains a staging reference, but newer mission, ADR, audit, and release-gate documents control when they conflict.

## Required loop

1. Read `MISSION.md`.
2. Read `docs/specs/current-objective.md`.
3. Read `docs/governance/release-gates.md`.
4. Read `docs/audits/2026-07-21-adult-features-readiness-review.md`.
5. Read `.cursor/state/decentralized-dating-app-progress.json` when present, but treat stale state as historical rather than overriding current source/docs.
6. State allowed and forbidden files/data.
7. Plan before editing.
8. Implement one reviewable slice.
9. Run the narrowest relevant checks, then the branch gates.
10. Update handoff/state truthfully; never claim unrun tests passed.

## Governance sources

- Community rules: `policies/community-rules.md`
- Governance index: `docs/governance/README.md`
- Latest readiness audit: `docs/audits/2026-07-21-adult-features-readiness-review.md`
- Feature gates: `docs/governance/release-gates.md`
- Closed beta checklist: `docs/product/closed-beta-readiness.md`
- Data map: `docs/privacy/data-map.md`
- Threat model: `docs/security/threat-model.md`
- Proximity/location/alignment/marketplace/bot decisions: ADR-0009 through ADR-0013
- Do **not** fabricate or repair `approvals/` with invented values.

## Commands

- Install: `make bootstrap`
- Doctor: `make doctor`
- Source/governance invariants: `make feature-policy-check`
- Test: `make test-unit`
- Typecheck/lint: `make lint`
- Mobile builds: `make test-mobile`
- Local services: `make local-up` / `make local-services-up`
- Full local readiness: `make release-readiness`
- Staging: `make deploy-staging` (verified staging account only)
- Production preflight: `make production-preflight` (validates only; never deploys)

## Risk classes

- **Green:** docs, unit tests, synthetic fixtures, isolated UI, local-only scripts.
- **Yellow:** API behavior, data shape, dependencies, shared components, synthetic map/proximity simulations.
- **Red:** adult eligibility, passkeys, device authorization, attestation, real BLE, real location, sexual-intent disclosure, sensitive questionnaire exchange, crypto/E2EE, payments, creator publication/payout, permissions, secrets, production infrastructure, customer data, migrations, safety evidence, child-safety/NCII reporting, release gates, store submission.

Red changes require explicit human approval before enabling real data/users and before merge into a release branch. Agents may prepare staging code and tests only when the feature remains visibly disabled/blocked and uses synthetic non-sensitive fixtures.

## Non-negotiable product constraints

- Adults only (18+); no 16/17-year-old mode and no parental-consent bypass.
- Network dating/proximity/location/social actions must eventually require a signed, expiring, revocable adult credential; UI age checks alone are never production assurance.
- Gender never determines an automatic privacy default. Prompt before sharing is the proximity default for everyone.
- Real live messaging requires authenticated reciprocal interest; no unilateral live auto-match.
- Matching never shares location automatically. Every grant is current-match-only, explicit, recipient-bound, expiring, and revocable.
- No exact discovery location; no location plaintext in push, telemetry, logs, analytics, or ordinary control-plane storage.
- Sexual intent is private adult compatibility data, not public broadcast or consent to activity.
- Group membership changes require renewed unanimous consent.
- No sexual-services marketplace.
- No filtering/ranking by race, skin color, ethnicity, disability, height, spending, inferred attractiveness, or AI-inferred sensitive traits.
- Sensitive questionnaire answers stay encrypted/local in the baseline and are never used for ads or bot scoring.
- Skin Shop assets are declarative/non-executable; commerce is isolated from dating/safety data and cannot affect reach/ranking/trust.
- Bot defenses may use bounded technical risk signals but not private content, exact location, sensitive answers, protected traits, or spending-as-trust.
- No operator access to ordinary private profiles, photos, messages, answers, or location.
- No sale or behavioral advertising of sensitive dating data.
- No paywall on safety, adult eligibility, encryption, block, report, delete, emergency privacy, or security challenges.
- No production deploy or store submission by an autonomous agent.
- Do not weaken encryption, adult gates, block/report, retention, audit, revocation, or approval controls to unblock progress.
- Do not file CyberTipline/law-enforcement notices or handle real intimate/child-safety evidence.

## Synthetic-only rules

Until real-user beta gates pass, agents may use only:

- clearly synthetic adult profiles;
- synthetic coordinates;
- fake/no-charge commerce and entitlements;
- random non-personal keys/tokens;
- non-graphic, non-real safety fixtures;
- local haptic/proximity simulations without radio collection.

Agents must not:

- collect real BLE encounters or device coordinates;
- charge purchases or pay creators;
- ingest real political/sexual questionnaire answers;
- enroll real dating users;
- upload real intimate, identity-document, or child-safety evidence;
- mark a feature operational because its UI exists.

## Communication

Use terse, evidence-first updates. Preserve exact code, paths, commands, commits, workflow runs, and errors. Distinguish `implemented`, `staging simulation`, `scaffold`, `blocked`, and `not started`. Never claim a test, deploy, approval, or safety operation passed without observed evidence.
