# Current objective — JavaScript-only repository consolidation

**Status:** ACTIVE  
**Branch:** `agent/javascript-only-refactor`  
**Real users:** Prohibited

## Objective

Refactor the repository into one unambiguous JavaScript implementation and remove every obsolete project-authored Rust, Swift, Kotlin, UniFFI, Terraform, Make, and shell build path without weakening existing product, privacy, safety, or release controls.

## Deliverables

- remove the former `apps/ios`, `apps/android`, `core`, `services`, `infra`, Cargo workspace, Rust integration crate, Makefile, and shell tooling from the current Git tree;
- preserve removed prototypes through Git history only;
- dynamically discover every `apps/rnd-*` and `packages/rnd-*` workspace;
- dynamically discover all JavaScript test files;
- validate JavaScript syntax across all active non-JSX Node roots;
- reject non-JavaScript source and build artifacts across the complete checkout;
- independently audit the committed Git tree in GitHub Actions;
- move governance validation and production preflight to Node.js scripts;
- keep generated Expo native projects disposable and uncommitted;
- update README, mission, agent rules, architecture, ownership, release gates, and beta readiness;
- retain the full adults-only, consent, privacy, storage, safety, and production-block contract.

## Acceptance commands

```bash
nvm use
npm install --ignore-scripts
npm run check
npm run mobile:export:web
node scripts/check-governance-contracts.mjs
node scripts/verify-production-block.mjs
```

## Required outcomes

- repository checkout contains no prohibited project-authored non-JavaScript implementation or build automation;
- committed Git tree independently reports zero language violations;
- active workspace discovery includes every current and future `rnd-*` app/package without a hand-maintained list;
- test discovery includes every `.test.js` or `.test.mjs` file in active workspaces;
- no current architecture document points to deleted native, Rust, service, Terraform, Make, or Bash paths;
- no stale `make production-preflight` or `scripts/production_preflight.sh` command remains;
- JavaScript syntax, domain, API, storage, discovery, conversation, relationship-phase, and simulation tests pass;
- Expo SDK 57 web export passes;
- governance contracts pass;
- production preflight remains blocked without authentic human approvals.

## Explicitly deferred

- real-user accounts or data;
- native hardware capability activation;
- production adult assurance, identity, attestation, E2EE, billing, reporting, moderation, or infrastructure;
- any project-authored native-language exception without a superseding ADR, named owners, measured need, and human architecture approval.

## Release state

```text
JAVASCRIPT_RND_SYNTHETIC_ONLY
REAL_USER_CLOSED_BETA_BLOCKED
PRODUCTION_BLOCKED_HUMAN_APPROVALS_REQUIRED
```
