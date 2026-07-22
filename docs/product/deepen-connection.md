# Deepen Connection — product behavior specification

**Status:** Synthetic JavaScript R&D only  
**Updated:** 2026-07-22  
**Real-user activation:** Prohibited

## Source framing

The user-provided strategic research recommends a dynamic, match-specific **Deepen Connection** mode. Its proposed purpose is to support a casual connection that develops emotional or long-term potential without requiring either person to change a public profile or leave the application. The research suggests unlocking deeper life-goal, values, and family-oriented prompts only after both participants opt in.

This specification treats that recommendation as product-design input. It does not adopt the document's numerical market, psychology, safety, or retention claims as verified facts.

## Product hypothesis

A reversible bilateral phase may let two consenting adults explore greater relational depth while preserving the original casual connection and preventing the application from inferring or pressuring a relationship transition.

## Current synthetic behavior

Each active synthetic match has one independent relationship-phase record:

- `casual` — default;
- `deepened` — both sides explicitly opted in;
- `ended` — match was unmatched or blocked.

The local user may:

- request a deeper phase;
- withdraw a pending request;
- accept or decline a synthetic incoming request;
- return a deepened match to casual;
- answer or clear allowlisted deeper prompts.

The research UI may simulate the counterpart requesting, accepting, or declining. Those buttons are clearly synthetic fixtures and do not represent a real person.

## Bilateral consent rules

1. A one-sided request remains pending and leaves the phase casual.
2. The second explicit opt-in changes only that match to deepened.
3. Decline clears both requests and stores no reason.
4. Withdrawal clears only the requesting participant's pending request.
5. Either participant may return the match to casual.
6. No decline, withdrawal, or return-to-casual action changes candidate rank, reach, profile visibility, or safety access.
7. Purchases, cosmetics, subscriptions, and creator status cannot accelerate or unlock the phase.

## Prohibited automatic activation

The phase must never be inferred or activated from:

- message count or content;
- reply speed or conversation sentiment;
- time elapsed since match;
- sexual activity or claimed sexual activity;
- an offline meeting or event;
- location sharing;
- purchases or subscription state;
- AI or behavioral prediction.

The product may present an optional control, but it must not claim that the application has detected mutual feelings or relationship readiness.

## Deeper prompts

The current allowlist contains prompts in these categories:

- communication;
- relationship direction;
- sustainable time and energy;
- values in practice;
- future boundaries.

Answers are private local reflections in the current build. They are not sent to the synthetic counterpart. Answers are limited to 300 characters, editable, individually clearable, and removed when the phase returns to casual or the match ends.

The prompt catalog must not add diagnosis, therapy, coercive disclosure, protected-trait interrogation, medical verification, trauma extraction, financial screening, fertility, immigration, identity-document, or precise-location prompts without a separate reviewed decision.

## Consent separation

Deepen Connection is not consent to:

- sex or any sexual act;
- exclusivity, commitment, or a public relationship label;
- an offline meeting;
- location sharing;
- media or attachment exchange;
- health disclosure;
- AI analysis;
- retaining or sharing deeper answers.

Each capability requires its own control and applicable governance gates.

## Cleanup behavior

- **Return to casual:** clears all deeper answers and resets both requests.
- **Unmatch:** ends the phase and clears all deeper answers.
- **Block:** ends the phase, clears answers, and relies on the conversation lifecycle to purge visible transcript/context and suppress rediscovery.
- **Session end:** all phase state disappears because no phase state is persisted.

## Storage and analytics boundary

The current build keeps requests, responses, timestamps, phase state, and answers in JavaScript memory only. They must not enter AsyncStorage, logs, crash reports, advertising, marketplace pricing, candidate ranking, creator tools, generalized engagement analytics, or bot scoring.

## Real-user prerequisites

Real use requires all of the following before activation:

- authenticated adult participants and authorized devices;
- signed, replay-resistant, match-scoped requests and bilateral receipts;
- deterministic expiry, ordering, revocation, and multi-device conflict rules;
- reviewed encrypted local custody;
- separately consented E2EE sharing of any prompt answer;
- private notification defaults;
- deletion/export/recovery behavior;
- coercion, retaliation, spam, and modified-client abuse testing;
- accessibility review;
- legal, privacy, security, Trust & Safety, relationship-transition, mobile-store, and executive approvals bound to the exact release.

## Acceptance evidence

The R&D slice is complete only when:

- deterministic tests cover pending, mutual acceptance, decline, withdrawal, prompt gating, answer bounds, return to casual, unmatch/block cleanup, and ended-state rejection;
- storage tests prove every relationship-phase field is omitted;
- mobile UI exposes all supported states without implying real consent;
- ADR-0018, data map, release gates, closed-beta checklist, ownership, agent rules, and CI agree;
- Expo web export succeeds;
- production preflight remains blocked.

## Release state

```text
JAVASCRIPT_RND_SYNTHETIC_ONLY
REAL_USER_CLOSED_BETA_BLOCKED
PRODUCTION_BLOCKED_HUMAN_APPROVALS_REQUIRED
```
