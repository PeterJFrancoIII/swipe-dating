# Mission

**Status:** ACTIVE — JavaScript rapid R&D / synthetic users only  
**Updated:** 2026-07-22  
**Public or production approval:** Not granted

## Mission statement

Build a free-to-use, adults-only, local-first dating service that helps consenting adults form genuine connections while minimizing data custody, protecting human dignity, and preserving the widest practical space for lawful adult expression.

The active application and control-plane research implementation is entirely **JavaScript**. One JavaScript codebase is used to test product, privacy, safety, marketplace, proximity, location, matching, storage, and abuse hypotheses rapidly across mobile, web, and Node.js before any production architecture decision.

## Current objective

Deliver durable local profile presentation and UI settings in the JavaScript Expo app while enforcing a strict persistence allowlist:

1. versioned shared JavaScript storage package with migration and corruption recovery;
2. Expo AsyncStorage adapter for synthetic R&D only;
3. persistent display name, about text, pronouns, mock cosmetics, last tab, and haptic preference;
4. adult status, intents, discovery preferences, questionnaire answers, proximity, matches, messages, and location kept out of unencrypted storage;
5. reset and redacted-export controls in the mobile UI;
6. deterministic tests and governance checks for the persistence boundary.

## Success criteria

- [x] Adults 18+ only; 18–25 is a design audience, never a 16–17 access path
- [x] Exact birthday boundary and subject-bound credential tests pass
- [x] Get fk'd is off by default and privacy defaults are identical for every gender
- [x] A nearby buzz does not itself disclose a profile
- [x] Auto-share requires explicit opt-in and independent compatibility
- [x] One-sided interest never creates a match
- [x] Location is off by default, match-scoped, expiring, revocable, and second-confirmed when precise in the domain model
- [x] Questionnaire ranking runs locally and excludes purchases, popularity, and protected traits
- [x] Skin Shop assets cannot execute code or make hidden network requests
- [x] Bot controls use layered, content-blind signals and progressive friction without paywalling ordinary humans
- [x] Versioned local-state serialization drops prohibited sensitive/session fields
- [x] Corrupt or unsupported local state fails safely to defaults
- [ ] Real-user local data uses an externally reviewed encrypted vault with approved key custody
- [x] JavaScript CI fails closed

## Active R&D stack

| Area | Decision |
|---|---|
| Language | JavaScript ECMAScript modules only for active app/service code |
| Mobile/web | Expo SDK 57 + React Native 0.86 |
| Runtime | Node.js 24 LTS |
| API | Node HTTP adapter over pure domain services |
| R&D persistence | Versioned allowlist JSON through AsyncStorage; unencrypted and synthetic-only |
| Sensitive state | Session-only until an approved encrypted vault exists |
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
- no sensitive dating, identity, location, proximity, message, match, safety, payment, or cryptographic data in unencrypted R&D storage;
- no real-user claims based on simulated behavior;
- no autonomous production deployment, store submission, legal filing, or fabricated approval.

## Release state

```text
JAVASCRIPT_RND_SYNTHETIC_ONLY
REAL_USER_CLOSED_BETA_BLOCKED
PRODUCTION_BLOCKED_HUMAN_APPROVALS_REQUIRED
```
