# ADR-0013: Layered bot, spam, and Sybil defense

Date: 2026-07-21  
Status: accepted for core policy; production integrations blocked  
Decision owners: Security + Identity + Trust & Safety + Privacy

## Context

A free/unlimited dating service attracts account farms, scraping, scripted likes, romance scams, malicious links, venue scanners, report brigades, marketplace fraud, and modified clients. No single signal proves a unique human. Device attestation proves properties of an app/device, not identity truth, adulthood, or uniqueness.

The defense must resist automation without turning ordinary dating into a paywall or building a centralized surveillance profile.

## Decision

Use layered, progressive controls:

1. **Account authentication** — passkey or equivalent phishing-resistant authentication.
2. **Adult eligibility** — signed, expiring, revocable adult credential required at the network boundary.
3. **Device authorization** — device keys signed by the user’s root identity.
4. **Platform integrity** — Apple App Attest and Google Play Integrity verified server-side with request binding and counters.
5. **Replay defense** — one-time nonces, request-body hashes, expiry, monotonic counters, and bounded replay caches.
6. **Privacy-preserving quotas** — pairwise/pseudonymous quota keys, high normal limits, bounded retention.
7. **Behavioral risk** — velocity, fan-out, account creation, impossible region changes, encounter-ID replay, blocked-user contact, malicious domains, report brigading, and marketplace payment fraud.
8. **Progressive friction** — allow → throttle → challenge → temporary containment → human review.
9. **Appeal and transparency** — explain challenges/containment at an appropriate level and provide a human appeal path for consequential decisions.

## Forbidden risk inputs

The risk system must not ingest or score:

- message plaintext;
- private photos or intimate media;
- exact location;
- political or sexual questionnaire answers;
- race, ethnicity, skin color, disability, gender, orientation, or religion;
- marketplace spending as a trust shortcut;
- inferred attractiveness, intelligence, hygiene, fitness, or grooming.

## Adult network gate

Presence, proximity, profile fetch, likes, matching, messaging, and marketplace social/publishing actions require a valid adult credential. Report intake remains accessible even when an account is contained or unauthenticated, subject to abuse controls.

## Attestation fallback

- Verified attestation receives ordinary limits.
- Unsupported but otherwise valid devices receive lower initial limits or an additional challenge.
- Invalid or replayed attestations are contained.
- Attestation is not a permanent identifier and is not sold or used for advertising.

## Progressive friction

```text
low risk        → allow
moderate risk   → rate limit / delayed ticket issuance
high risk       → signed challenge or bounded proof-of-work
very high risk  → temporary containment + human review
confirmed abuse → policy enforcement + appeal
```

Users do not pay to remove security friction.

## Data minimization

- Risk features are purpose-limited and documented.
- Raw events expire quickly; longer-lived state is aggregated/pseudonymous.
- No global advertising ID or raw push token is used as a quota key.
- Human reviewers see reason codes and necessary evidence, not unrestricted private content.
- Models and rules are versioned, monitored for false positives, and reversible.

## Core implementation

`core/anti-abuse` provides:

- action classifications;
- adult/passkey/device/attestation gate signals;
- request body + nonce bindings;
- replay cache interface;
- bounded velocity window;
- transparent risk weights;
- allow/throttle/challenge/contain decisions;
- tests proving missing adult credentials and replay fail closed.

This core is policy scaffolding. It is not a production attestation verifier or fraud model.

## Validation gates

- server verification of App Attest and Play Integrity;
- passkey and authorized-device tests;
- adult credential revocation and expiry tests;
- request-binding and replay adversarial tests;
- account-farm, scraper, proximity-scanner, scam-link, report-brigade, and marketplace-fraud red team;
- false-positive evaluation across supported devices and accessibility tools;
- retention/deletion and privacy review;
- human escalation and appeal staffing;
- kill switches and rollback for every automated rule/model.
