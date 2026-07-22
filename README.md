# Swipe Dating — JavaScript R&D

This repository is an **entirely JavaScript rapid-R&D monorepo**. Application logic, service logic, simulations, tests, validation, and release tooling are authored in JavaScript. The former Rust, Swift, Kotlin, UniFFI, Terraform, Make, and shell implementation has been removed from the current tree; its history remains available through Git.

## Active stack

- **Node.js 24 LTS** for services, simulations, scripts, tests, and governance validation
- **Expo SDK 57 / React Native 0.86** for Android, iOS, and web research UI
- Plain modern **ECMAScript modules (`.js` / `.mjs`)** — no TypeScript source
- npm workspaces for every `apps/rnd-*` and `packages/rnd-*` module
- Node's built-in test runner and assertion library
- Expo development builds for eventual JavaScript-facing native dependencies

Mobile operating systems and third-party dependencies may contain compiled native code beneath React Native. No project-authored product or service behavior may be implemented in Swift, Kotlin, Rust, Java, Objective-C, Python, TypeScript, Terraform, or shell without an approved exception ADR.

## Quick start

```bash
nvm use
npm install --ignore-scripts
npm run check
npm run mobile
```

Other commands:

```bash
npm run simulate
npm run api
npm run mobile:web
npm run mobile:export:web
npm run production:preflight
```

## Active implementation surface

```text
apps/rnd-mobile/                    Expo / React Native JavaScript app
apps/rnd-api/                       Node.js control-plane simulator
apps/rnd-simulator/                 deterministic synthetic multi-user run
packages/rnd-domain/                age, consent, alignment, location, marketplace, risk rules
packages/rnd-crypto-node/           synthetic encounter and pairwise quota identifiers
packages/rnd-storage/               allowlisted local state and migrations
packages/rnd-discovery/             intent eligibility, ranking, reveal, queue logic
packages/rnd-conversations/         pass, interest, match, message, unmatch, block lifecycle
packages/rnd-relationship-phases/   bilateral Deepen Connection lifecycle
scripts/                            JavaScript validation and release tooling
```

## JavaScript-only enforcement

`npm run check` executes both active-workspace discovery and a repository-wide language audit. GitHub Actions independently inspects the committed Git tree. CI fails if project-authored implementation or build automation reintroduces native, Rust, Terraform, TypeScript, Python, or shell source.

## What works in synthetic R&D

- exact eighteenth-birthday eligibility boundary;
- subject-bound, expiring staging adult credentials;
- ephemeral presence and immediate withdrawal;
- intent-driven discovery with hard boundaries and explainable weights;
- bio-first progressive reveal and shared-ground interest;
- reciprocal synthetic matching only;
- session conversation, unmatch, block, purge, and rediscovery suppression;
- bilateral, reversible Deepen Connection phase;
- Get fk'd consent model, off by default;
- local Looking For, gender-feed, alignment, and location-grant rules;
- bounded Skin Shop manifest validation;
- content-blind bot-risk simulation and pairwise quotas;
- versioned allowlist persistence with sensitive-field redaction;
- Android, iOS, and web UI experimentation from one JavaScript codebase.

## Not enabled for real users

- BLE scanning or advertising;
- exact or live location collection;
- production adult assurance or platform attestation;
- authenticated bilateral matching or relationship-phase receipts;
- E2EE profile, message, media, or location delivery;
- purchases, creator uploads, moderation, refunds, or payouts;
- real reports or safety evidence;
- staging cloud or production deployment.

## Release state

```text
JAVASCRIPT_RND_SYNTHETIC_ONLY
REAL_USER_CLOSED_BETA_BLOCKED
PRODUCTION_BLOCKED_HUMAN_APPROVALS_REQUIRED
```
