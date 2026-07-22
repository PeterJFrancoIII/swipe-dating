# Current objective — reciprocal match and conversation R&D slice

**Status:** ACTIVE  
**Branch:** `agent/reciprocal-match-conversations`  
**Real users:** Prohibited

## Objective

Build a complete synthetic JavaScript lifecycle from discovery decision through reciprocal match, shared-ground opening prompt, session conversation, unmatch, and block while preserving bilateral consent and the existing unencrypted-storage boundary.

The product direction continues the user-provided casual-first, relationship-capable research, especially its recommendation for consent-driven conversation starters and an ongoing communication surface. The research remains design input rather than independently verified evidence.

## Deliverables

- shared `@swipe/rnd-conversations` JavaScript package;
- session-only pass and interest decisions;
- unilateral interest that remains pending;
- explicit synthetic reciprocal fixture required to create a match;
- undo for the most recent pass or pending interest;
- explicit unmatch rather than swipe undo for established matches;
- selected discovery tag preserved as opening context;
- first local message gated on the same shared-ground context;
- active session transcript and synthetic reply simulation;
- unmatch that disables sending;
- block that purges visible messages/context and suppresses rediscovery;
- Matches UI kept session-only rather than persisted as the last tab;
- discovery suppression and undo restoration integration;
- storage regression tests proving decisions, matches, messages, blocks, transcripts, and Matches-tab state are discarded;
- ADR, mission, system overview, privacy map, release gates, beta checklist, ownership, agent rules, and CI updates.

## Acceptance commands

```bash
nvm use
npm install --ignore-scripts
npm run check
npm run mobile:export:web
```

## Required outcomes

- a unilateral interest creates no match;
- an explicit reciprocal fixture creates exactly one active synthetic match;
- pass and pending interest can be undone and restored to discovery;
- a created match cannot be removed through swipe undo;
- first local message requires the selected shared-ground tag;
- active matches accept local messages and synthetic replies;
- unmatch immediately disables sending;
- block purges visible content and suppresses future discovery;
- starter suggestions are grounded in the selected visible tag;
- no action automatically shares location, enables proximity, or sends a message;
- decision, match, message, block, transcript, and Matches-tab state remain absent from AsyncStorage;
- all lifecycle controls remain available without payment;
- Expo web export remains green;
- production preflight remains blocked.

## Explicitly deferred

- real accounts, adult credentials, device identity, or authenticated reciprocity;
- signed likes and bilateral match receipts;
- reviewed E2EE protocol, key agreement, key verification, and multi-device semantics;
- network message delivery, retries, offline mailbox, push, ordering, or deduplication;
- encrypted persistence of real matches and messages;
- read receipts, typing indicators, attachments, ephemeral media, or screenshot controls;
- end-to-end report intake, evidence selection, moderation, appeals, and emergency operations;
- real block propagation across discovery, proximity, messaging, groups, push, and location;
- production candidate retrieval or server-side ranking;
- BLE scanning/advertising and background behavior;
- production age assurance and app/device attestation;
- StoreKit / Play Billing and creator operations;
- staging cloud or production deployment.

## Release state

```text
JAVASCRIPT_RND_SYNTHETIC_ONLY
REAL_USER_CLOSED_BETA_BLOCKED
PRODUCTION_BLOCKED_HUMAN_APPROVALS_REQUIRED
```
