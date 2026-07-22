# Swipe Dating — JavaScript R&D

The **active application is now an entirely JavaScript rapid-R&D monorepo**. The prior Rust, Swift, Kotlin, and Terraform implementation remains in the repository only as frozen historical reference until a separate archival cleanup is reviewed.

## Active stack

- **Node.js 24 LTS** for services, simulations, scripts, and tests
- **Expo SDK 57 / React Native 0.86** for Android, iOS, and web research UI
- Plain modern **ECMAScript modules (`.js`)** — no TypeScript source
- Node's built-in test runner and assertion library
- Node HTTP server for the content-minimizing control-plane simulator
- Expo development builds for eventual custom native bindings

Expo Go is intentionally not the target for the real proximity experiment. Custom BLE and platform attestation libraries require a development build that contains those native capabilities; application behavior and business logic remain JavaScript-facing.

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
```

## Active implementation surface

```text
apps/rnd-mobile/          Expo / React Native JavaScript app
apps/rnd-api/             Node.js control-plane simulator
apps/rnd-simulator/       deterministic synthetic multi-user run
packages/rnd-domain/      age, consent, match, alignment, location, marketplace, bot rules
packages/rnd-crypto-node/ rotating encounter and pairwise quota identifiers
```

## What works in R&D

- exact eighteenth-birthday eligibility boundary;
- subject-bound, expiring staging adult credentials;
- ephemeral presence and immediate withdrawal;
- self-filtered discovery;
- reciprocal-like matching only;
- Get fk'd UI and consent decision model, off by default;
- local Looking For and gender-feed preferences;
- local reciprocal alignment score;
- expiring/revocable location-grant metadata without coordinates;
- Skin Shop manifest safety boundary and synthetic catalog;
- content-blind bot-risk simulation and pairwise quotas;
- Android/iOS/web UI experimentation from one JavaScript codebase.

## Not enabled for real users

- BLE scanning or advertising;
- exact or live location collection;
- production adult assurance;
- App Attest / Play Integrity;
- profile/photo transfer or E2EE messaging;
- purchases, creator uploads, moderation, refunds, or payouts;
- real reports or safety evidence;
- staging cloud or production deployment.

## Release state

```text
JAVASCRIPT_RND_SYNTHETIC_ONLY
REAL_USER_CLOSED_BETA_BLOCKED
PRODUCTION_BLOCKED_HUMAN_APPROVALS_REQUIRED
```
