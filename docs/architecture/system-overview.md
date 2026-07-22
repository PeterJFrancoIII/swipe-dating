# System Overview

**Updated:** 2026-07-21  
**Active implementation:** JavaScript rapid R&D, synthetic users only

The product target remains a hybrid **local-first** adult dating platform: an ephemeral control plane, consent-scoped encrypted peer data plane, isolated public cosmetic marketplace, and isolated safety/anti-abuse systems.

The active research implementation is now one JavaScript monorepo. Product and safety logic runs in shared ECMAScript modules; Node.js runs tests, simulations, and the API adapter; Expo/React Native runs the mobile and web research UI.

## Active JavaScript components

| Component | R&D role | Sensitive-data boundary |
|---|---|---|
| `apps/rnd-mobile` | Expo UI for age gate, Discover, Get fk'd, preferences, Skin Shop, and matched-location consent | Synthetic and device-local state only; no real profiles, coordinates, purchases, or evidence |
| `apps/rnd-api` | Dependency-light Node HTTP adapter | Short-lived synthetic presence identifiers, likes, blocks, and discovery only |
| `apps/rnd-simulator` | Deterministic synthetic multi-user scenarios | No external network and no real users |
| `packages/rnd-domain` | Adult boundary, preferences, alignment, proximity decisions, location grants, matching, asset validation, risk decisions | Pure deterministic logic; no network or telemetry |
| `packages/rnd-crypto-node` | Domain-separated HMAC identifiers for Node simulations | Synthetic secrets only; not a production key-management system |
| `config/rnd-alignment-questionnaire-v1.json` | Versioned synthetic questionnaire contract | Raw answers remain local in R&D |

## JavaScript-authored versus native runtime

“Entirely JavaScript” means all active application, service, simulation, and domain source authored by this project is JavaScript. Mobile operating systems still provide Bluetooth, location, notifications, secure hardware, attestation, billing, and camera functions through native frameworks.

For a hardware experiment, the Expo app may consume a maintained React Native/Expo module inside a custom development build. Generated `ios/` and `android/` projects are disposable build artifacts, not manually maintained source. The project must not silently reintroduce Swift, Kotlin, Rust, Java, Objective-C, Dart, Python, or TypeScript as a second active implementation language without a superseding ADR and measured need.

## Target product components

| Target component | Responsibility | Real-user prerequisite |
|---|---|---|
| Adult eligibility | Signed, expiring, revocable adult credential | Counsel-approved provider and network enforcement |
| Attestation/anti-abuse | App/device integrity, signed challenges, pairwise quotas, risk containment | App Attest/Play Integrity validation, privacy review, appeal operations |
| Rendezvous/presence | Short-lived signed leases, coarse-region discovery, capability routing | Identity binding, replay protection, trusted issuer configuration |
| Proximity | Rotating BLE encounter IDs, local compatibility, consent-scoped profile capability | Custom dev build, background/battery tests, stalking/replay/wormhole red team |
| Profile/media transfer | Consent-scoped profile capsule and adaptive media | Reviewed E2EE transport and hostile-media pipeline |
| Matching/messaging | Reciprocal interest, bilateral receipt, post-match E2EE | Cryptographic identity binding and two-device tests |
| Match location | Approximate snapshot, meeting pin, temporary live share | Pairwise E2EE payload, expiry, immediate revoke, receiver purge |
| Skin Shop | Bounded public cosmetic assets, moderation, platform billing, entitlements | Parser sandbox, store billing, creator/IP/refund/payout operations |
| Safety plane | Report intake, isolated evidence vault, human review, appeals | Named staff, RBAC, audit, retention, legal processes, operational contacts |

## Operating modes

- **A Strict Zero-Store (default target):** discoverable only while online.
- **B Sealed Mailbox:** optional encrypted envelopes, off by default.
- **C Personal Availability Node:** post-MVP user-controlled availability device.
- **P Get fk'd Proximity:** off by default; prompt-before-share default; best-effort detection; no exact-distance radar.
- **L Match Location:** off by default; separate match-scoped consent.

## Consent flow

```text
Adult eligibility + authorized device + request integrity
                         ↓
Short-lived service capability
                         ↓
Presence / discovery / optional proximity / profile fetch / interest
                         ↓
Reciprocal interest + bilateral match receipt
                         ↓
Post-match messaging + optional location grant
```

No UI-only gate is a security boundary. The current JavaScript model tests the required decisions; it does not claim production cryptographic enforcement.

## Proximity research flow

```text
User explicitly enables Get fk'd
             ↓
Rotating opaque encounter identifier
             ↓
Authenticated nearby-event simulation
             ↓
Block / adult / cooldown / emergency checks
             ↓
Local compatibility check
             ↓
Generic buzz simulation
             ↓
Prompt before sharing by default
             ↓
Short-lived scoped profile capability target
```

The advertisement model contains no profile ID, root identity, gender, orientation, age band, sexual intent, location, push token, or marketplace identity.

## Match-location research flow

```text
Mutual match
    ↓
Separate choice: none / approximate / meeting pin / temporary live
    ↓
Second confirmation for precise mode
    ↓
Bounded grant metadata with issue, expiry, sequence, and revoke
    ↓
No coordinates in the current R&D implementation
```

## Alignment research flow

```text
Versioned optional questionnaire
            ↓
Local answer + importance + dealbreaker
            ↓
Reciprocal minimum weight
            ↓
Explainable local score and dealbreaker exclusion
```

Popularity, spending, purchases, creator status, race, ethnicity, skin color, disability, height, and photograph-inferred sensitive traits are excluded.

## Current implementation status

Implemented and verified in the JavaScript R&D surface:

- exact eighteenth-birthday handling;
- subject-bound expiring staging adult credentials;
- ephemeral presence, immediate withdrawal, blocks, self-filtered discovery, and reciprocal matching;
- Get fk'd off-by-default consent decisions;
- local Looking For, gender-feed, filter, and alignment rules;
- expiring/revocable location-grant metadata without coordinates;
- bounded Skin Shop manifest validation;
- content-blind bot-risk and pairwise-quota simulations;
- Expo Android/iOS/web research UI and Node API;
- Node tests, JavaScript surface checks, dependency audit threshold, and Expo web export.

Not implemented for real users:

- BLE scanning/advertising, challenge-response, background reliability, or haptic cooldown enforcement;
- production adult assurance and platform attestation;
- reviewed E2EE profile, media, messaging, or location transport;
- StoreKit/Play Billing and creator operations;
- durable safety operations or production infrastructure.

## Frozen legacy prototype

The earlier Rust/UniFFI/SwiftUI/Kotlin/Terraform prototype remains in the repository as historical reference. It is not the active R&D architecture and must receive no new product feature work. Archival or removal requires a separate review after JavaScript parity is accepted.
