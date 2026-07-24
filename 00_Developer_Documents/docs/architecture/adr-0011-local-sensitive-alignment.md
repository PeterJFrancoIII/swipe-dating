# ADR-0011: Local sensitive compatibility and alignment ranking

**Status:** Accepted for staging scaffold; DPIA required before real users  
**Date:** 2026-07-21

## Context

The product needs a high-signal questionnaire covering values, politics, education/work, money/health, relationship structure, communication, lifestyle, adult intimacy, grooming, family, religion/philosophy, and technology.

Many answers concern political opinions, sexual orientation, sex life, religion, or other sensitive data. Centralized ranking would create surveillance, breach, discrimination, and advertising risk.

## Decision

- Ship a versioned built-in questionnaire with reviewed stable IDs.
- Every question supports skip/prefer-not-to-say, importance 0–5, optional dealbreaker, and visibility (`profile`, `score_only`, `private_unused`).
- Store answers encrypted on the user device.
- Compute compatibility locally and explain the score.
- Reciprocal dealbreaker conflicts exclude a candidate before scoring.
- Exclude popularity, attractiveness, purchases, spending, creator status, race, ethnicity, skin color, disability, height, and other protected traits from ranking.
- Do not infer intelligence, hygiene, sexuality, gender, fitness, grooming, or body hair from photos.
- Do not send score-only raw answers in ordinary profile capsules.
- No questionnaire answers in ads, general analytics, push text, bot scoring, or marketplace systems.

## Consequences

- A modified peer client can inspect any answer deliberately transmitted to it. True score-only privacy across untrusted clients may require a vetted PSI/OPRF or secure-computation design later.
- Questionnaire versioning and migration are product infrastructure, not copy edits.
- A counsel-reviewed DPIA, rights flow, and retention design are release gates.

## Rejected alternatives

- Central warehouse of all answers.
- Popularity- or purchase-weighted ranking.
- AI inference of sensitive traits from media.
- A permanent candidate-specific political label exposed without consent.
