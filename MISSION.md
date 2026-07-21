# Mission

**Status:** ACTIVE — JavaScript rapid R&D / synthetic users only  
**Updated:** 2026-07-21  
**Public or production approval:** Not granted

## Mission statement

Build a free-to-use, adults-only, local-first dating service that helps consenting adults form genuine connections while minimizing data custody, protecting human dignity, and preserving the widest practical space for lawful adult expression.

The active application and control-plane research implementation is entirely **JavaScript**. One JavaScript codebase is used to test product, privacy, safety, marketplace, proximity, location, matching, and abuse hypotheses rapidly across mobile, web, and Node.js before any production architecture decision.

## Current objective

Deliver an executable JavaScript vertical slice with:

1. Expo / React Native mobile and web UI;
2. Node.js service and deterministic multi-user simulator;
3. pure JavaScript domain rules for exact adult eligibility, consent, Looking For modes, gender-feed preferences, alignment, reciprocal matching, matched-location grants, Skin Shop assets, and bot resistance;
4. executable tests for every safety and consent invariant;
5. the prior native/Rust implementation frozen as historical reference rather than extended.

## Success criteria

- [ ] Adults 18+ only; 18–25 is a design audience, never a 16–17 access path
- [ ] Exact birthday boundary and subject-bound credential tests pass
- [ ] Get fk'd is off by default and privacy defaults are identical for every gender
- [ ] A nearby buzz does not itself disclose a profile
- [ ] Auto-share requires explicit opt-in and independent compatibility
- [ ] One-sided interest never creates a match
- [ ] Location is off by default, match-scoped, expiring, revocable, and second-confirmed when precise
- [ ] Questionnaire ranking runs locally and excludes purchases, popularity, and protected traits
- [ ] Skin Shop assets cannot execute code or make hidden network requests
- [ ] Bot controls use layered, content-blind signals and progressive friction without paywalling ordinary humans
- [ ] JavaScript CI fails closed

## Active R&D stack

| Area | Decision |
|---|---|
| Language | JavaScript ECMAScript modules only for active app/service code |
| Mobile/web | Expo SDK 57 + React Native 0.86 |
| Runtime | Node.js 24 LTS |
| API | Node HTTP adapter over pure domain services |
| State | in-memory and device-local synthetic state |
| Tests | Node built-in test runner |
| Native capabilities | JavaScript-facing adapters in Expo development builds, never Expo Go assumptions |
| Legacy | Rust/Swift/Kotlin/Terraform frozen; no new active feature work |

## Non-negotiable boundaries

- no person under 18 in dating, sexual-intent, proximity, match, map, group, or messaging flows;
- no gender-based forced profile disclosure;
- no covert proximity tracking, exact-distance radar, or persistent encounter graph;
- no location sharing merely because a match occurred;
- no race, ethnicity, skin-color, disability, height, or photo-inferred protected-trait ranking;
- no purchase-weighted candidate rank, messaging, reports, appeals, or safety access;
- no real-user claims based on simulated behavior;
- no autonomous production deployment, store submission, legal filing, or fabricated approval.

## Release state

```text
JAVASCRIPT_RND_SYNTHETIC_ONLY
REAL_USER_CLOSED_BETA_BLOCKED
PRODUCTION_BLOCKED_HUMAN_APPROVALS_REQUIRED
```
