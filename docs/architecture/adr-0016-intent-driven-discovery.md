# ADR-0016 — Intent-driven discovery and progressive profile reveal

**Status:** Accepted for synthetic JavaScript R&D only  
**Date:** 2026-07-22  
**Real-user approval:** Not granted

## Context

The product research supplied for this project argues that ambiguous relationship intent, photo-first browsing, and opaque ranking produce mismatched expectations and low trust. It recommends separate immediate-intent and longer-term-openness signals, explicit boundaries, user-controlled ranking weights, progressive profile reveal, and conversation starters grounded in profile content.

This ADR adopts those ideas as testable R&D hypotheses without treating the research document's market, psychology, safety, or performance claims as independently verified evidence.

## Decision

The JavaScript R&D discovery engine will:

1. model **immediate intent** separately from **relational openness**;
2. require mutual acceptance on both axes before a candidate is eligible;
3. support self-reported boundary tags, including user-selected hard requirements;
4. hard-exclude boundary mismatches rather than compensating with a high score elsewhere;
5. rank only eligible candidates using transparent user-controlled weights for intent, boundaries, lifestyle, alignment, and distance;
6. expose a score explanation showing each component and normalized weight;
7. begin eligible profiles in a `bio_first` reveal stage;
8. reveal the synthetic visual only after a non-visual micro-interaction such as reading the bio, inspecting tags, or viewing the explanation;
9. require a visible shared-ground tag before recording synthetic interest;
10. keep all intent, boundary, ranking-weight, reveal, and discovery-history state session-only in the current unencrypted R&D build.

## Prohibited ranking inputs

The discovery engine must reject any attempt to rank or filter using:

- race, ethnicity, or skin color;
- disability;
- height;
- inferred attractiveness, intelligence, hygiene, sexuality, gender, fitness, grooming, or body hair;
- popularity;
- purchases, spending, subscription status, or creator status.

Self-reported gender discovery preferences remain a separate private eligibility control governed by existing policy; gender must not become a score multiplier.

## Privacy and disclosure

- Immediate intent, relational openness, and boundaries are sensitive device-local data.
- Another person must not receive the reason they were excluded.
- Raw preference vectors must not be used for advertising or marketplace pricing.
- The operator must not retain a centralized history of viewed, excluded, or revealed profiles for R&D.
- The current AsyncStorage allowlist must not be expanded to include discovery state.

## Ethical UX constraints

The product may use progressive disclosure to reduce cognitive load, but it must not fabricate matching effort, artificial delays, fake scarcity, or misleading compatibility analysis. Accessibility alternatives must allow non-gesture interaction and must not make essential profile information permanently inaccessible.

## Consequences

### Positive

- Intent mismatch fails closed before ranking.
- Boundary requirements cannot be overridden by attractiveness or engagement incentives.
- Users can see and change the ranking model.
- The profile card gives non-visual information meaningful prominence.
- Tests can verify deterministic ranking and prohibited-input rejection.

### Costs and limitations

- Self-reported boundaries may be inaccurate and are not a safety guarantee.
- Mutual-intent filtering may produce an empty queue.
- Transparent controls increase UI complexity.
- The current visual reveal is synthetic and does not implement secure media handling.
- Real-user use requires encrypted local custody, privacy review, abuse testing, accessibility review, and network enforcement.

## Required verification

- mutual immediate-intent and relational-openness compatibility tests;
- hard boundary-exclusion tests;
- deterministic user-weight ordering tests;
- normalized weights sum to 100;
- progressive reveal requires a non-visual interaction;
- prohibited ranking fields cause a hard error;
- no discovery fields enter the AsyncStorage serialized record;
- Expo web export and production blocker remain green.

## Release state

```text
JAVASCRIPT_RND_SYNTHETIC_ONLY
REAL_USER_CLOSED_BETA_BLOCKED
PRODUCTION_BLOCKED_HUMAN_APPROVALS_REQUIRED
```
