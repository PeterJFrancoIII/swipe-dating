# Mission

**Status:** ACTIVE — JavaScript rapid R&D / synthetic users only  
**Updated:** 2026-07-22  
**Public or production approval:** Not granted

## Mission statement

Build a free-to-use, adults-only, local-first dating service that helps consenting adults form genuine connections while minimizing data custody, protecting human dignity, and preserving the widest practical space for lawful adult expression.

The application, service, simulation, test, validation, and release-tooling implementation is entirely **JavaScript**. One ECMAScript codebase is used to test product, privacy, safety, marketplace, proximity, location, matching, messaging, relationship transition, storage, discovery, and abuse hypotheses across mobile, web, and Node.js before any production architecture decision.

## Current objective

Maintain one unambiguous JavaScript-only repository architecture:

1. remove the former Rust, Swift, Kotlin, UniFFI, Terraform, Make, and shell implementation from the active Git tree;
2. preserve historical prototypes through Git history rather than duplicate archive directories;
3. discover every `apps/rnd-*` and `packages/rnd-*` workspace automatically;
4. implement validation, governance checks, and production preflight in JavaScript;
5. reject project-authored non-JavaScript implementation and build files through both checkout and Git-tree audits;
6. keep generated native projects disposable and uncommitted;
7. preserve all existing consent, privacy, safety, storage, and production blockers during the refactor.

## Success criteria

- [x] Repository implementation and build automation are JavaScript-only
- [x] Former Rust, Swift, Kotlin, UniFFI, Terraform, Cargo, Make, and shell trees are removed
- [x] Every active R&D workspace is discovered dynamically
- [x] Governance validation and production preflight run through Node.js scripts
- [x] Independent checkout and Git-tree language audits pass
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
- [x] Two explicit Deepen Connection opt-ins are required and either side may return to casual
- [x] Decisions, matches, messages, phase state, deeper answers, blocks, transcripts, and Matches tab remain absent from AsyncStorage
- [ ] Real-user local data uses an externally reviewed encrypted vault with approved key custody
- [ ] Real-user matching and relationship transitions use signed bilateral records and reviewed E2EE messaging
- [x] JavaScript CI fails closed

## Active R&D stack

| Area | Decision |
|---|---|
| Language | JavaScript ECMAScript modules for all project-authored implementation and tooling |
| Mobile/web | Expo SDK 57 + React Native 0.86 |
| Runtime | Node.js 24 LTS |
| API | Node HTTP adapter over pure domain services |
| Discovery | `@swipe/rnd-discovery` mutual-intent eligibility, hard boundaries, transparent weights, and bio-first reveal |
| Match/conversation | `@swipe/rnd-conversations` session-only reciprocal fixture, undo, opener, message, unmatch, and block lifecycle |
| Relationship phase | `@swipe/rnd-relationship-phases` bilateral request/accept/decline/withdraw/revert and bounded prompt lifecycle |
| R&D persistence | Versioned allowlist JSON through AsyncStorage; unencrypted and synthetic-only |
| Sensitive state | Session-only until an approved encrypted vault exists |
| Tests | Node built-in test runner |
| Validation | JavaScript syntax, workspace, repository-language, governance, simulation, dependency, Expo-export, and production-block checks |
| Native capabilities | Reviewed JavaScript-facing Expo/React Native dependencies in disposable development builds |
| History | Removed prototypes remain accessible through Git history only |

## Non-negotiable boundaries

- no person under 18 in dating, sexual-intent, proximity, match, map, group, messaging, or relationship-transition flows;
- no unilateral matching, unilateral deepening, or automatic message creation;
- no phase inference from chat content, reply speed, elapsed time, sexual activity, a meetup, location, purchases, or behavioral models;
- no claim that a synthetic fixture is authentication, identity proof, delivery, encryption, or another person's real action;
- no Deepen Connection acceptance treated as consent to sex, exclusivity, media, location, health disclosure, or an offline meeting;
- no public profile or discovery-intent mutation from a match-specific phase;
- no decline reason collection, retaliation, ranking penalty, visibility penalty, or monetized pressure;
- no location sharing merely because a match or relationship phase occurred;
- no prohibited or proxy trait ranking;
- no purchase-weighted candidate rank, matching, messaging, phase access, reports, appeals, or safety access;
- no message or deeper-answer content used for discovery rank, advertising, marketplace pricing, general bot profiling, or engagement optimization;
- no sensitive dating, identity, location, proximity, message, match, phase, prompt-answer, safety, payment, or cryptographic data in unencrypted R&D storage;
- no project-authored non-JavaScript implementation or build automation without a superseding exception ADR and explicit human architecture approval;
- no committed generated `ios/` or `android/` project as a second source of truth;
- no real-user claims based on simulated behavior;
- no autonomous production deployment, store submission, legal filing, or fabricated approval.

## Release state

```text
JAVASCRIPT_RND_SYNTHETIC_ONLY
REAL_USER_CLOSED_BETA_BLOCKED
PRODUCTION_BLOCKED_HUMAN_APPROVALS_REQUIRED
```
