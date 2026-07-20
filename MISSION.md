# Mission

**Status:** ACTIVE — staging / pre-beta governance in force  
**Updated:** 2026-07-20  
**Legal status of policy drafts:** UNAPPROVED until counsel and named owners sign artifacts in `approvals/`

## User objective

Build an adults-only, local-first, privacy-preserving swipe dating platform whose core experience remains free and resistant to centralized surveillance of ordinary private content — while still meeting child-safety, anti-trafficking, NCII, abuse-reporting, and app-store obligations required for the service to exist lawfully.

## Current objective

1. Keep a runnable **STAGING** iPhone client advancing product UX.
2. Apply and maintain **governance** (mission, community rules, release gates, safety/legal drafts) so beta and production stay blocked until gates pass.
3. Prefer applying governance and code to the **canonical Git repository**, not a loose Drive mirror alone.

## Success criteria

### Product / staging
- [ ] Adults-only path; fail-closed age eligibility before discovery
- [ ] Local-first profiles/media/messages; no operator access to ordinary private content
- [ ] Mutual match before messaging (except tightly limited interest signals)
- [ ] Block, report, emergency privacy, safety center — free, never paywalled
- [ ] Visible STAGING / INTERNAL BETA marker until approved branding and market

### Governance / release
- [ ] Community rules cover consent, NCII, child safety, trafficking, appeals, enforcement, and deletion limits
- [ ] Release gates deny beta/production without named approvals
- [ ] Impact-funding claims only with entity, accounting, and evidence controls
- [ ] Market launch matrix deny-by-default
- [ ] `make production-preflight` fails closed without approvals

## Non-goals

- Rule-free / “no moderation” product
- Public feeds, anonymous random chat, hot-or-not public scoring, proximity radar
- Minors or parental-consent bypass of the 18+ floor
- Sale or behavioral ads using dating/sexuality/location/message/photo data
- Claiming decentralization removes legal or safety duties
- Autonomous production deploy, store submission, or fabricated approvals
- Guaranteeing rescue, identity truth, screenshot prevention, or meeting safety

## Constraints

| Area | Constraint |
|---|---|
| Stack | Rust audited core, UniFFI, SwiftUI iOS first, Kotlin Android later, Axum control plane |
| Privacy | No exact location exposure; coarse regions + jitter; E2EE peer path; metadata honesty |
| Safety | Fail closed on age/auth/protocol integrity; human review for consequential bans |
| Decentralization | Hybrid local-first; ephemeral control plane; no peer replication of others’ media in MVP |
| Funding | Core + safety free; impact claims evidence-backed only |
| Deployment | Staging only for agents; production human-gated |

## Source of truth

- Spec: `docs/specs/current-objective.md`
- Deploy runbook: `.cursor/commands/deploy-decentralized-dating-app.md`
- Governance: `docs/governance/`
- Release gates: `docs/governance/release-gates.md` + `approvals/`
- Audit: `docs/audits/2026-07-20-mission-readiness-review.md`

## Red-zone areas

Auth, age assurance, payments/funding claims, permissions, secrets, production infra, customer data, migrations, safety evidence vault, child-safety reporting, and store submission require **explicit human approval**.
