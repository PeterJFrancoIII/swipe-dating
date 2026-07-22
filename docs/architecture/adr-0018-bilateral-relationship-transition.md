# ADR-0018 — Bilateral relationship transition

**Status:** Accepted for synthetic JavaScript R&D only  
**Date:** 2026-07-22  
**Real-user approval:** Not granted

## Context

The product research supplied for this project proposes a match-specific “Deepen Connection” mode that can support an organic transition from casual intimacy toward a more emotionally or relationally significant connection. The feature must not infer feelings, pressure retention, redefine consent, or silently rewrite either person's public intent.

ADR-0017 establishes reciprocal synthetic matches and session-only conversation. This ADR governs an optional second layer inside an active match.

## Decision

The R&D implementation will:

1. keep every match in the `casual` phase by default;
2. require an explicit request from one side and an explicit acceptance/request from the other side before entering `deepened`;
3. permit either side to withdraw a pending request;
4. permit either side to return an established deepened match to casual without penalty;
5. keep the phase private to that match and never mutate either public profile or discovery intent;
6. unlock only a bounded allowlist of deeper prompts after mutual acceptance;
7. keep prompt answers session-only and locally editable/clearable;
8. clear deeper prompt answers when either participant returns to casual, unmatches, or blocks;
9. terminate the phase when the match ends;
10. keep requests, acceptance, phase, prompt answers, and timestamps outside AsyncStorage;
11. label every counterpart request/response as synthetic fixture behavior;
12. prohibit automatic activation based on message count, reply speed, time elapsed, sexual activity, location sharing, a meetup, purchases, or model inference.

## Consent separation

Deepen Connection is consent only to reveal the bounded deeper-prompt surface for that match. It is not consent to:

- sex or a specific sexual act;
- exclusivity or commitment;
- media or explicit-media sharing;
- precise or approximate location sharing;
- an offline meeting;
- health-information disclosure;
- AI analysis of messages;
- public profile changes;
- continued contact after unmatch or block.

Each of those actions requires its own explicit consent and governance path.

## Prompt boundary

The initial allowlist covers:

- communication style;
- relationship direction;
- sustainable time and communication expectations;
- values in practice;
- future boundaries.

The current prompts accept local free-text answers up to 300 characters. They are not transmitted, compared, scored, used for ranking, or treated as verified facts.

New prompt categories require privacy and product review. Highly sensitive categories such as health diagnoses, trauma history, finances, fertility, immigration, identity documents, or exact location are prohibited without a superseding review and explicit purpose/retention design.

## Privacy and fairness

- A decline reason is neither requested nor stored.
- Declining, withdrawing, or returning to casual must not reduce profile reach, ranking, safety access, or future match eligibility.
- The operator must not infer relationship phase from messages or behavior.
- Phase state and answers must not enter advertising, marketplace pricing, creator access, bot scoring, analytics, or engagement optimization.
- No streaks, urgency timers, scarcity, badges, public labels, or gamified pressure may encourage acceptance.
- A mutual transition must not automatically extend message retention.

## Match-end cleanup

Unmatch or block terminates the relationship phase and clears prompt answers. Block additionally follows ADR-0017 content-purge and rediscovery-suppression rules. Real-user implementations must propagate this cleanup across encrypted local custody, messaging, push, location, groups, proximity, backups, and all devices.

## What this implementation does not provide

- real counterpart consent;
- authenticated or signed transition requests;
- encrypted storage or transport;
- shared prompt answers or answer comparison;
- notifications or cross-device synchronization;
- relationship counseling, mental-health assessment, or compatibility prediction;
- public relationship status;
- automatic relationship inference;
- durable audit or appeals.

## Real-user prerequisites

Before activation for real users:

1. transition requests must be signed, authenticated, replay-protected, match-scoped, and device-authorized;
2. phase and answers must use reviewed encrypted local custody and E2EE transport if shared;
3. counterpart identity and bilateral match receipt must already be verified;
4. decline/withdraw/revert privacy must be tested against modified clients and notification leakage;
5. unmatch/block/account deletion must revoke and purge phase data across all devices/services/backups under reviewed retention rules;
6. prompt categories, copy, purpose, accessibility, retention, export, deletion, and safety risks require privacy/T&S/legal review;
7. coercion, harassment, retaliation, stalking, repeated-request, and dark-pattern tests must pass;
8. no phase or answer may influence discovery rank, monetization, ads, or safety access;
9. real-user analytics must be aggregate, content-free, purpose-limited, and separately approved.

## Required verification

- one-sided request remains casual;
- two explicit requests/acceptances enter deepened;
- either ordering of requests works;
- decline resets requests without storing a reason;
- pending request can be withdrawn;
- prompts are unavailable before mutual acceptance;
- only allowlisted prompts accept bounded answers;
- return to casual clears answers;
- unmatch/block terminates the phase and clears answers;
- ended phases reject further transitions;
- phase and prompt fields remain absent from AsyncStorage;
- Expo export and production blocker remain green.

## Release state

```text
JAVASCRIPT_RND_SYNTHETIC_ONLY
REAL_USER_CLOSED_BETA_BLOCKED
PRODUCTION_BLOCKED_HUMAN_APPROVALS_REQUIRED
```
