# JavaScript R&D reset review — 2026-07-21

**Verdict:** JavaScript synthetic R&D may proceed; real-user beta and production remain blocked.

## Implemented

- active Expo / React Native JavaScript UI;
- shared pure-JavaScript domain modules;
- Node API and deterministic simulator;
- exact 18th-birthday tests;
- subject-bound staging adult credential checks;
- ephemeral presence, immediate withdrawal, self-filtered discovery, blocks, and reciprocal likes;
- Get fk'd off-by-default consent decisions;
- local alignment and filter boundaries;
- bounded/revocable location-grant metadata without coordinates;
- Skin Shop asset-manifest rejection for executable and remote content;
- layered content-blind bot-risk and quota simulation;
- JavaScript-only active-surface checks and CI.

## Dependency verification

- Expo SDK 57 dependency compatibility is checked against Expo's bundled version map; direct dependency versions are exact-pinned in package manifests.
- `npm audit --audit-level=high` passes with zero high or critical findings.
- npm currently reports ten **moderate** transitive findings in Expo native-build tooling through `xcode`/`uuid`. npm's proposed automatic remedy is an unsafe downgrade to Expo 46, so no forced fix is applied. These findings remain documented and must be re-evaluated before any real-user build. A reviewed dependency lockfile is also required before closed beta.

## Honest limitations

The repository still contains the merged Rust/Swift/Kotlin prototype. It is frozen reference, not active architecture. This change does not prove:

- real BLE operation;
- background reliability or battery impact;
- real adult assurance;
- secure key storage or E2EE;
- exact or live location safety;
- platform attestation;
- purchases, creator moderation, refunds, or payouts;
- durable safety operations;
- production readiness.

## Remaining critical work

1. Archive/remove the legacy native/Rust prototype after JavaScript parity review.
2. Implement identity-bound, domain-separated signed protocol objects using reviewed libraries.
3. Enforce signed adult credentials and request integrity at every network boundary.
4. Add feature-flagged BLE adapters in custom development builds and red-team stalking/replay/wormhole risks.
5. Add match-scoped E2EE location payloads, receiver purge, and immediate revocation.
6. Build durable reporting, safety case, and appeals operations.
7. Obtain named owners and authentic legal/privacy/security/Trust & Safety approvals.

## Release state

```text
JAVASCRIPT_RND_SYNTHETIC_ONLY
REAL_USER_CLOSED_BETA_BLOCKED
PRODUCTION_BLOCKED_HUMAN_APPROVALS_REQUIRED
```
