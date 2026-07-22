# ADR-0017 — Reciprocal match and conversation lifecycle

**Status:** Accepted for synthetic JavaScript R&D only  
**Date:** 2026-07-22  
**Real-user approval:** Not granted

## Context

ADR-0016 introduced intent-driven discovery and requires visible shared-ground context before synthetic interest. The next research question is how a discovery decision becomes a reciprocal match, a respectful opening message, an active conversation, an unmatch, or a block without weakening bilateral consent or expanding unencrypted persistence.

The current app has no production identity, bilateral signatures, encrypted transport, delivery service, push broker, moderation intake, safety case system, or real users. A fixture flag may simulate reciprocal interest, but it is not an authenticated statement from another person.

## Decision

The JavaScript R&D implementation will:

1. keep pass, interest, match, message, unmatch, and block state in memory for the current session only;
2. treat unilateral interest as pending and never create a match from one side alone;
3. create a synthetic match only when the candidate fixture explicitly simulates reciprocal interest;
4. preserve the shared-ground tag selected during discovery as the required opening context;
5. require the first local message to carry that same shared-ground context before free-form conversation is enabled;
6. permit undo only for the most recent pass or pending unilateral interest;
7. require explicit unmatch for an established reciprocal match rather than disguising it as swipe undo;
8. stop all new messages immediately after unmatch or block;
9. retain an unmatched transcript only in memory for the remainder of the current R&D session;
10. purge visible messages and shared-ground context immediately when blocking;
11. suppress passed, pending, matched, unmatched, and blocked candidates from rediscovery unless an eligible non-match decision is explicitly undone;
12. keep the Matches tab itself session-only so unencrypted storage does not reveal relationship activity;
13. expose clear synthetic labels and never represent fixture reciprocity as authentication, identity proof, message delivery, or encryption.

## State transitions

```text
eligible discovery profile
          ↓
pass ────────────────→ suppressed decision ──undo──→ discovery
          
interest
   ├── no reciprocal fixture → pending interest ──undo──→ discovery
   └── reciprocal fixture    → active synthetic match
                                      ↓
                          shared-ground opener
                                      ↓
                            session conversation
                              ├── unmatch → ended; no sending
                              └── block   → ended; content purged;
                                             rediscovery suppressed
```

## Consent and safety invariants

- One-sided interest never creates a match.
- Matching never shares location, starts proximity, or sends a message automatically.
- The selected starter tag is context for conversation, not consent to sexual activity, media, location, or an offline meeting.
- Unmatch and block must be available without payment.
- Block must suppress rediscovery and future conversation attempts.
- Another person is never shown whether they were passed, blocked, or excluded by private preferences.
- No message content may affect discovery rank, marketplace pricing, advertising, or access to safety features.
- No purchase, subscription, cosmetic, or creator status changes match or messaging privileges.

## Persistence boundary

The existing AsyncStorage allowlist remains unchanged. It may not contain:

- decisions, likes, pending interests, reciprocal flags, or undo history;
- match IDs, candidate snapshots, status, or timestamps;
- starter tags or opening prompts;
- messages or transcript metadata;
- unmatch or block history;
- the Matches tab as the persisted last tab.

Automated storage tests must prove these fields are discarded. Real-user match and message state requires an externally reviewed encrypted local vault with approved key custody, deletion, export, recovery, migration, and backup behavior.

## What this implementation does not provide

- authenticated users or devices;
- cryptographically signed likes or bilateral match receipts;
- E2EE message encryption or key agreement;
- network delivery, retries, ordering, deduplication, offline mailbox, push, or multi-device sync;
- read receipts, typing indicators, attachments, ephemeral media, screenshot controls, or screenshot guarantees;
- spam detection, reporting intake, evidence selection, human moderation, appeals, or emergency escalation;
- real block propagation across devices or services;
- account deletion or legal retention handling.

## Real-user prerequisites

Before any real-user activation, the exact implementation requires:

1. adult credential enforcement on like, match, and messaging APIs;
2. authorized device/root identity binding and signed, replay-protected requests;
3. bilateral match receipts verified by both devices;
4. reviewed E2EE protocol, key verification, device change, recovery, and multi-device semantics;
5. encrypted local custody and backup/deletion/export behavior;
6. server-side block and unmatch propagation across discovery, proximity, messaging, groups, push, and location;
7. abuse limits, spam controls, report flows, evidence consent, moderation staffing, and appeal operations;
8. notification-content privacy and lock-screen review;
9. attachment/media threat modeling before any media support;
10. two-device and modified-client tests for unilateral match creation, replay, impersonation, stale state, blocked delivery, and revocation.

## Required verification

- unilateral interest creates no match;
- reciprocal fixture creates exactly one active synthetic match;
- pass and pending interest can be undone;
- established matches require explicit unmatch;
- first local message requires the selected shared-ground tag;
- active conversations accept local and synthetic reply messages;
- unmatch disables further sending;
- block purges visible content and suppresses rediscovery;
- starter suggestions are grounded in the selected tag;
- match and conversation fields remain absent from AsyncStorage;
- Expo web export and production blockers remain green.

## Release state

```text
JAVASCRIPT_RND_SYNTHETIC_ONLY
REAL_USER_CLOSED_BETA_BLOCKED
PRODUCTION_BLOCKED_HUMAN_APPROVALS_REQUIRED
```
