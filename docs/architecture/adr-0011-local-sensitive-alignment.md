# ADR-0011: Versioned, local-first sensitive alignment

Date: 2026-07-21  
Status: accepted for staging; peer exchange protocol blocked  
Decision owners: Product + Privacy + Security

## Context

The product needs a high-importance questionnaire spanning politics, education/work, money/health, relationships, communication, lifestyle, and adult intimacy. Political opinions, sexual orientation, sex-life information, and relationship structure are sensitive data. A central answer warehouse would conflict with the local-first mission and create disproportionate breach, advertising, discrimination, and government-access risk.

“Hard-coded” questions also become stale or misleading unless they are versioned, dated, and retired deliberately.

## Decision

- Ship a versioned question catalog in the client.
- Store answers encrypted on the user’s device.
- Make every question skippable; sensitive categories require explicit opt-in.
- Store importance (`0–5`), dealbreaker, and profile-visibility choices separately.
- Rank candidates locally with a transparent, deterministic score.
- Remove dealbreaker mismatches before ranking when both sides intentionally disclosed a compatible answer.
- Never use spending, popularity, attractiveness, race, ethnicity, skin color, height, disability, or inferred sensitive traits.
- Do not claim that compatibility predicts character, safety, intelligence, or relationship success.
- Do not transmit raw answers merely because a person is nearby.
- The control plane must not receive answer plaintext or per-question telemetry linked to a user.

## Baseline scoring

```text
score =
  sum(answer_similarity × user_importance × reciprocal_importance)
  ----------------------------------------------------------------
  sum(maximum_available_weight)
```

The initial staging implementation uses exact answer matches and only local synthetic candidate fixtures. Production candidate exchange requires a separate reviewed protocol.

## Question lifecycle

Each question has:

- stable ID;
- schema version;
- effective date;
- category;
- options with stable IDs;
- sensitivity classification;
- localization version;
- retirement/replacement metadata.

Election-specific questions include the election year and are not silently reinterpreted as current politics.

## Private comparison roadmap

Preferred order:

1. mutually disclosed encrypted answer subset after profile consent;
2. pairwise answer commitments with explicit reveal;
3. vetted private-set-intersection or OPRF protocol for score-only comparison.

A hidden UI field is not cryptographic privacy because a modified client can inspect received plaintext.

## Consequences

- Local ranking preserves privacy and user control but makes cross-device recovery and multi-device sync harder.
- Private comparison protocols add complexity and require external cryptographic review.
- Exact-match scoring is transparent but simplistic; future similarity matrices must be user-visible and versioned.

## Validation gates

- no answers in server logs, analytics, crash reports, push, or support search;
- encrypted-at-rest storage with hardware-backed key references;
- export/delete tests;
- consent and visibility tests for every category;
- scoring determinism and dealbreaker tests;
- catalog migration/retirement tests;
- fairness review for indirect protected-trait proxies;
- DPIA and explicit-consent review;
- external review before any PSI/OPRF implementation.
