# Mission

## User objective

Deploy a complete **staging** implementation of a local-first, privacy-preserving, adults-only swipe dating platform per `.cursor/commands/deploy-decentralized-dating-app.md` (research snapshot 2026-07-20). Prepare production artifacts, but do not deploy production or fabricate legal, security, trust-and-safety, app-store, or executive approvals.

## Current objective

Execute the deploy runbook phases in order on branch `feat/local-first-dating-platform`, verify with evidence, stop at the production gate with `PRODUCTION_BLOCKED_HUMAN_APPROVALS_REQUIRED`.

## Success criteria

- [ ] Hybrid local-first architecture with ephemeral control plane and E2EE peer data plane
- [ ] Shared Rust core with iOS/Android stubs and UniFFI boundary
- [ ] Staging-capable services, IaC, CI, tests, safety/privacy docs
- [ ] Final agent report with honest pass/fail/blocked status
- [ ] Production gate rejects autonomous production deploy

## Non-goals

- Production submission, DNS, store upload, or real legal filings
- Minors / parent-managed accounts
- Public feeds, live streaming, random chat, proximity radar, public ratings
- Cryptocurrency, marketplace, facial recognition, central ML on user media
- Fabricating approvals or weakening safety/privacy controls

## Constraints

- Stack: Rust (Tokio/Axum), UniFFI, SwiftUI, Kotlin Compose, PostgreSQL, Valkey, Terraform, Docker Compose
- Deployment: staging only; production reference IaC generated but not applied
- Security/privacy: adults-only, no exact location, no operator access to ordinary private content
- Timeline: autonomous staging build; stop at production gate

## Source of truth

- Spec: docs/specs/current-objective.md
- Deploy command: .cursor/commands/deploy-decentralized-dating-app.md
- Architecture map: docs/architecture/system-overview.md
- Decision log: docs/ai/ai-decision-log.md

## Red-zone areas

Changes to auth, payments, permissions, production infrastructure, customer data, secrets, and database migrations require explicit human approval. This command may apply **staging** only after account identity verification.
