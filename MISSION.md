# Mission

**Status:** ACTIVE — JavaScript rapid R&D / synthetic users only  
**Updated:** 2026-07-22  
**Public or production approval:** Not granted

## Mission statement

Build a free-to-use, adults-only, local-first dating service that helps consenting adults form genuine connections while minimizing data custody, protecting human dignity, and preserving the widest practical space for lawful adult expression.

The active application and control-plane research implementation is entirely **JavaScript**. One JavaScript codebase is used to test product, privacy, safety, marketplace, proximity, location, matching, messaging, relationship transition, storage, discovery, and abuse hypotheses rapidly across mobile, web, and Node.js before any production architecture decision.

## Current objective

Deliver a bilateral, reversible, match-specific **Deepen Connection** transition without inferring feelings, bundling consent, changing public profiles, or expanding unencrypted storage:

1. keep each match casual by default;
2. require two explicit opt-ins before entering a deepened phase;
3. support either request ordering, decline, withdrawal, and one-party return to casual;
4. unlock only bounded deeper prompts after mutual acceptance;
5. keep prompt answers editable, clearable, and session-only;
6. clear answers when returning to casual, unmatching, or blocking;
7. prohibit activation from message count, time, sexual activity, location, meetings, purchases, or model inference;
8. keep phase state and answers outside AsyncStorage;
9. enforce the complete lifecycle with deterministic tests, Expo UI, and governance contracts.

## Success criteria

- [x] Adults 18+ only; 18–25 is a design audience, never a 16–17 access path
- [x] Exact birthday boundary and subject-bound credential tests pass
- [x] Get fk'd is off by default and privacy defaults are identical for every gender
- [x] One-sided interest never creates a match
- [x] Location is off by default and never shared merely because a match or phase transition occurred
- [x] Questionnaire and discovery ranking exclude purchases, popularity, protected traits, and prohibited proxies
- [x] Progressive profile reveal requires a non-visual micro-interaction
- [x] Unilateral interest remains pending; only an explicit reciprocal fixture creates a synthetic match
- [x] Pass and pending interest can be undone; matched state requires explicit unmatch
- [x] First local message requires selected shared-ground context
- [x] Unmatch disables sending and block purges visible session content
- [x] One-sided deepen request remains casual
- [x] Two explicit deepen opt-ins unlock the deepened phase
- [x] Decline stores no reason and has no ranking or reach consequence
- [x] Either side can withdraw a pending request or return an established deepened match to casual
- [x] Deeper prompts remain unavailable before mutual acceptance
- [x] Only allowlisted prompts accept bounded session answers
- [x] Return to casual, unmatch, and block clear deeper answers
- [x] Decisions, matches, messages, phase state, deeper answers, blocks, transcripts, and Matches tab remain absent from AsyncStorage
- [ ] Real-user local data uses an externally reviewed encrypted vault with approved key custody
- [ ] Real-user matching and relationship transitions use signed bilateral records and reviewed E2EE messaging
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
| Relationship phase | `@swipe/rnd-relationship-phases` bilateral request/accept/decline/withdraw/revert and bounded prompt lifecycle |
| R&D persistence | Versioned allowlist JSON through AsyncStorage; unencrypted and synthetic-only |
| Sensitive state | Session-only until an approved encrypted vault exists |
| Tests | Node built-in test runner |
| Native capabilities | JavaScript-facing adapters in Expo development builds, never Expo Go assumptions |
| Legacy | Rust/Swift/Kotlin/Terraform frozen; no new active feature work |

## Non-negotiable boundaries

- no person under 18 in dating, sexual-intent, proximity, match, map, group, messaging, or relationship-transition flows;
- no unilateral matching, unilateral deepening, or automatic message creation;
- no phase inference from chat content, reply speed, time elapsed, sexual activity, a meetup, location, purchases, or behavioral models;
- no claim that a synthetic fixture is authentication, identity proof, delivery, encryption, or another person's real action;
- no Deepen Connection acceptance treated as consent to sex, exclusivity, media, location, health disclosure, or an offline meeting;
- no public profile or discovery-intent mutation from a match-specific phase;
- no decline reason collection, retaliation, ranking penalty, visibility penalty, or monetized pressure;
- no location sharing merely because a match or relationship phase occurred;
- no prohibited or proxy trait ranking;
- no purchase-weighted candidate rank, matching, messaging, phase access, reports, appeals, or safety access;
- no message or deeper-answer content used for discovery rank, advertising, marketplace pricing, general bot profiling, or engagement optimization;
- no sensitive dating, identity, location, proximity, message, match, phase, prompt-answer, safety, payment, or cryptographic data in unencrypted R&D storage;
- no real-user claims based on simulated behavior;
- no autonomous production deployment, store submission, legal filing, or fabricated approval.

## Release state

```text
JAVASCRIPT_RND_SYNTHETIC_ONLY
REAL_USER_CLOSED_BETA_BLOCKED
PRODUCTION_BLOCKED_HUMAN_APPROVALS_REQUIRED
```
