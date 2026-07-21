# Current objective — JavaScript rapid-R&D vertical slice

**Status:** ACTIVE  
**Branch:** `agent/javascript-rnd-reset`  
**Real users:** Prohibited

## Objective

Establish a complete JavaScript research surface before adding any more production-shaped native or infrastructure work.

## Deliverables

- npm workspace monorepo using Node.js and JavaScript ESM;
- Expo/React Native synthetic mobile/web app;
- Node content-minimizing control-plane simulator;
- deterministic multi-user simulator;
- shared domain packages covering age, consent, preferences, alignment, proximity, matched location, Skin Shop, reciprocal matching, and bot risk;
- executable tests for safety and consent invariants;
- JavaScript-focused CI;
- updated mission, agent instructions, architecture decision, and readiness audit.

## Acceptance commands

```bash
nvm use
npm install --ignore-scripts
npm run check
npm run mobile:export:web
```

## Required simulation outcomes

- a person whose eighteenth birthday is tomorrow is rejected;
- a person whose eighteenth birthday is today is accepted in the local boundary model;
- presence requires a subject-bound, unexpired staging adult credential;
- discovery excludes the requesting profile;
- a single like does not match;
- reciprocal likes create the synthetic receipt;
- Get fk'd defaults to off and prompt-first when explicitly enabled;
- encounter and quota identifiers rotate;
- ordinary synthetic activity receives `allow` while scraping/replay receives friction;
- immediate presence withdrawal removes discoverability.

## Explicitly deferred

- BLE scanning/advertising and background behavior;
- real location collection and E2EE coordinate payloads;
- production age assurance and app/device attestation;
- secure-hardware identity and production cryptography;
- StoreKit / Play Billing and creator operations;
- real reports, safety case systems, and evidence vault;
- production deployment.

## Release state

```text
JAVASCRIPT_RND_SYNTHETIC_ONLY
REAL_USER_CLOSED_BETA_BLOCKED
PRODUCTION_BLOCKED_HUMAN_APPROVALS_REQUIRED
```
