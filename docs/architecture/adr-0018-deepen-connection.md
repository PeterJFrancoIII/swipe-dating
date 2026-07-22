# ADR-0018 — Bilateral Deepen Connection phase

**Status:** Accepted for synthetic JavaScript R&D only  
**Date:** 2026-07-22  
**Real-user approval:** Not granted

## Context

The project research proposes a match-specific **Deepen Connection** transition: after a casual connection develops relational potential, both people may explicitly opt into a deeper phase that reveals long-term and values-oriented prompts. The research presents this as a way to preserve a connection after an initial casual encounter instead of forcing users into a static relationship category.

This ADR adopts the bilateral transition as a product hypothesis. It does not treat the research document's market scores, behavioral claims, or retention projections as independently verified evidence.

## Decision

The JavaScript R&D implementation will model relationship phase separately for each match.

1. Every match starts in `casual`.
2. A local or synthetic counterpart request alone remains pending.
3. The phase changes to `deepened` only after both sides explicitly opt in.
4. Message count, time elapsed, an offline meeting, sexual activity, location sharing, or any inferred sentiment must never activate the phase automatically.
5. A request may be withdrawn before mutual acceptance.
6. A request may be declined without collecting, retaining, or revealing a reason.
7. Either participant may return the match to `casual` at any time.
8. Deeper prompts unlock only during the mutually accepted `deepened` phase.
9. Prompt answers are match-scoped, session-only, editable, and clearable.
10. Returning to casual, unmatching, or blocking clears all deeper prompt answers.
11. Blocking ends the relationship phase alongside conversation-content purge and rediscovery suppression.
12. The phase does not mutate either person's public profile, discovery rank, reach, marketplace status, or safety access.

## Consent boundaries

Mutual entry into the deeper phase is not consent to:

- sex or any particular sexual activity;
- exclusivity or a committed relationship;
- an offline meeting or event;
- location sharing;
- media or attachment exchange;
- public disclosure of relationship status;
- AI analysis of the conversation;
- retention of messages or deeper answers.

Each separate capability requires its own consent and applicable release gates.

## Privacy and storage

The current R&D implementation stores relationship-phase state only in JavaScript memory. AsyncStorage must exclude:

- phase status;
- pending requests and responses;
- transition timestamps;
- deeper prompt answers;
- withdrawal, decline, or return-to-casual history;
- inferred relationship or emotional state.

The operator must not use phase state or answers for advertising, marketplace pricing, candidate ranking, creator access, or generalized engagement scoring.

## Synthetic-fixture limitation

A simulated counterpart request or response is a deterministic UI fixture. It is not another person's action, authenticated reciprocity, a signed phase receipt, or network delivery.

A real-user implementation requires authenticated participant identities, replay-resistant bilateral phase receipts, E2EE transport, encrypted local custody, multi-device conflict handling, deletion/export behavior, notification privacy, abuse testing, and human review of the exact consent language.

## Deeper prompt rules

The prompt catalog is allowlisted and limited to communication, relationship direction, sustainable time/energy, values, and future boundaries. The current R&D implementation must not introduce diagnostic, coercive, manipulative, financial, health-verification, or protected-trait prompts.

Answers are limited to 300 characters in the research build and remain private to the local session. The current build does not transmit them to the synthetic counterpart.

## Required verification

- one-sided request remains casual and pending;
- two explicit requests are required for `deepened`;
- decline stores no reason and leaves the match casual;
- withdrawal works before mutual acceptance;
- prompts are unavailable before mutual acceptance;
- prompt IDs are allowlisted and answers are bounded;
- either participant can return to casual;
- return to casual clears prompt answers;
- unmatch and block end the phase and clear answers;
- ended phases reject further transitions;
- relationship-phase fields remain absent from AsyncStorage;
- Expo web export remains green;
- production preflight remains blocked.

## Release state

```text
JAVASCRIPT_RND_SYNTHETIC_ONLY
REAL_USER_CLOSED_BETA_BLOCKED
PRODUCTION_BLOCKED_HUMAN_APPROVALS_REQUIRED
```
