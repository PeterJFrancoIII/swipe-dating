# Intent-driven discovery product brief

**Status:** Synthetic R&D hypothesis  
**Updated:** 2026-07-22  
**Source basis:** User-provided “Strategic Architecture for Intent-Driven Matchmaking” research document

## Source-derived product framing

The supplied research describes an underserved product position: casual intimacy as a clear baseline, with enough profile depth and relationship infrastructure for a connection to evolve over time. It argues that mainstream mixed-intent apps create ambiguity, while casual-only products often remove the scaffolding needed for longer-term connection.

The research recommends:

- granular intent and boundary tagging;
- two separate intent axes: immediate desire and openness to relational progression;
- progressive, bio-first profile reveal;
- user-controlled algorithmic weighting;
- consent-driven conversation starters;
- privacy, verification, ephemeral-media, and safety controls;
- later “deepen connection” mechanics.

The research scores granular intent/boundary tagging and dual-axis intent signaling as its highest-priority discovery features, followed by user-controlled weighting, consent-driven starters, and progressive reveal. These scores and the document’s market, psychology, safety, and conversion claims have not been independently validated by this repository.

## Implemented R&D hypothesis

The current JavaScript slice implements only the discovery subset:

1. **Immediate intent** and **relational openness** are separate.
2. Both parties must mutually accept both axes before ranking.
3. User-required boundaries are hard exclusions.
4. Eligible candidates are ranked by transparent weights for:
   - intent;
   - boundaries;
   - lifestyle;
   - alignment;
   - distance.
5. The user may adjust the weights and see why a candidate ranked where they did.
6. The synthetic visual is hidden until the user reads or inspects non-visual profile content.
7. Synthetic interest requires selecting a visible shared-ground tag.

## Deliberate deviations and safety constraints

The R&D implementation does not adopt every mechanism proposed in the source document.

- It does not fabricate an artificial delay or “labor illusion.”
- It does not rank physical desirability.
- It does not expose private rejection or exclusion reasons.
- It does not treat self-reported boundary or health-related tags as verified facts.
- It does not persist sensitive discovery settings in AsyncStorage.
- It does not implement real biometric verification, explicit media, screenshot controls, AI coaching, synthetic intimacy, billing, events, or real users.
- It does not make gender-dependent privacy defaults.

## Measurement plan for later controlled research

Before any real-user use, named human owners must approve a research protocol covering:

- intent-completion and boundary-completion rates;
- eligible-queue size and empty-queue frequency;
- profile-read and reveal interactions;
- interest-to-conversation and conversation-to-offline-proposal rates;
- user comprehension of immediate intent versus relational openness;
- exclusion leakage and perceived stigma;
- accessibility and cognitive load;
- disparate impact and proxy discrimination;
- safety reports and coercive boundary behavior;
- deletion, export, retention, and telemetry boundaries.

No metric may justify weakening adult eligibility, consent, block/report access, privacy, protected-trait restrictions, or safety controls.

## Release state

```text
JAVASCRIPT_RND_SYNTHETIC_ONLY
REAL_USER_CLOSED_BETA_BLOCKED
PRODUCTION_BLOCKED_HUMAN_APPROVALS_REQUIRED
```
