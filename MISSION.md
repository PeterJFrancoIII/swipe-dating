# Mission

**Status:** ACTIVE — JavaScript rapid R&D / synthetic users only  
**Updated:** 2026-07-22  
**Public or production approval:** Not granted

## Mission statement

Build a free-to-use, adults-only, local-first dating service that helps consenting adults form genuine connections while minimizing data custody, protecting human dignity, and preserving the widest practical space for lawful adult expression.

The active application and control-plane research implementation is entirely **JavaScript**. One JavaScript codebase is used to test product, privacy, safety, marketplace, proximity, location, matching, messaging, storage, discovery, and abuse hypotheses rapidly across mobile, web, and Node.js before any production architecture decision.

## Current objective

Deliver a complete synthetic reciprocal-match and conversation lifecycle without weakening bilateral consent or expanding unencrypted storage:

1. record pass and interest decisions as session-only state;
2. keep unilateral interest pending and require explicit simulated reciprocity for a synthetic match;
3. support undo for pass and pending interest, but require explicit unmatch for an established match;
4. require the selected shared-ground tag for the first local message;
5. support active session chat and synthetic replies;
6. terminate sending after unmatch or block;
7. purge visible conversation content and suppress rediscovery after block;
8. keep the Matches tab, decisions, likes, matches, messages, blocks, and transcripts out of AsyncStorage;
9. enforce the lifecycle with deterministic JavaScript tests and governance contracts.

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
- [x] Immediate intent and relational openness are separate and mutually checked
- [x] Missing required boundaries hard-exclude a synthetic candidate
- [x] User-selected discovery weights normalize to 100 and produce deterministic ordering
- [x] Progressive profile reveal requires a non-visual micro-interaction
- [x] Protected, inferred, popularity, and purchase ranking fields are rejected
- [x] Unilateral interest remains pending; only an explicit reciprocal fixture creates a synthetic match
- [x] Pass and pending interest can be undone; matched state requires explicit unmatch
- [x] First local message requires the selected shared-ground context
- [x] Unmatch disables sending and block purges visible session content
- [x] Decisions, matches, messages, blocks, transcripts, and the Matches tab remain absent from AsyncStorage
- [ ] Real-user local data uses an externally reviewed encrypted vault with approved key custody
- [ ] Real-user matching uses signed bilateral receipts and reviewed E2EE messaging
- [x] JavaScript CI fails closed

## Active R&D stack

| Area | Decision |
|---|---|
| Language | JavaScript ECMAScript modules only for active app/service code |
| Mobile/web | Expo SDK 57 + React Native 0.86 |
| Runtime | Node.js 24 LTS |
| API | Node HTTP adapter over pure domain services |
| Discovery | `@swipe/rnd-discovery` mutual-intent eligibility, hard boundaries, transparent weights, and bio-first reveal |
| Match/conversation | `@swipe/rnd-conversations` session-only reciprocal fixture, undo, opener, message, unmatch, and block lifecycle |
| R&D persistence | Versioned allowlist JSON through AsyncStorage; unencrypted and synthetic-only |
| Sensitive state | Session-only until an approved encrypted vault exists |
| Tests | Node built-in test runner |
| Native capabilities | JavaScript-facing adapters in Expo development builds, never Expo Go assumptions |
| Legacy | Rust/Swift/Kotlin/Terraform frozen; no new active feature work |

## Non-negotiable boundaries

- no person under 18 in dating, sexual-intent, proximity, match, map, group, or messaging flows;
- no gender-based forced profile disclosure;
- no unilateral matching or automatic message creation;
- no claim that a synthetic reciprocal fixture is authentication, identity proof, delivery, or encryption;
- no covert proximity tracking, exact-distance radar, or persistent encounter graph;
- no location sharing merely because a match occurred;
- no race, ethnicity, skin-color, disability, height, or photo-inferred protected-trait ranking;
- no inferred attractiveness, intelligence, hygiene, sexuality, gender, fitness, grooming, or body-hair ranking;
- no popularity, purchase, spending, subscription, or creator-status weighting in discovery;
- no disclosure of why another person was excluded, passed, unmatched, or blocked;
- no deceptive artificial delays, fabricated matching work, or fake scarcity;
- no purchase-weighted candidate rank, matching, messaging, reports, appeals, or safety access;
- no message content used for discovery rank, advertising, marketplace pricing, or general bot profiling;
- no sensitive dating, identity, location, proximity, message, match, safety, payment, or cryptographic data in unencrypted R&D storage;
- no real-user claims based on simulated behavior;
- no autonomous production deployment, store submission, legal filing, or fabricated approval.

## Release state

```text
JAVASCRIPT_RND_SYNTHETIC_ONLY
REAL_USER_CLOSED_BETA_BLOCKED
PRODUCTION_BLOCKED_HUMAN_APPROVALS_REQUIRED
```
