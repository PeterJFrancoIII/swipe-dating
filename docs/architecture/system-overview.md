# System Overview

**Updated:** 2026-07-21

Hybrid **local-first** adult dating platform: ephemeral control plane + consent-scoped peer-to-peer E2EE data plane + isolated public marketplace + isolated safety and anti-abuse planes.

## Components

| Component | Role | Sensitive-data boundary |
|---|---|---|
| iOS / Android apps | UI, OS keystores, BLE proximity, WebRTC, local alignment, location consent, push registration | Primary custody for profiles, preferences, questionnaire, messages, precise location |
| Shared Rust core (UniFFI) | Identity, protocol, validation, matching, preferences, alignment, storage interfaces | No network logging; deterministic local logic |
| Adult eligibility interface | Signed, expiring, revocable adult credential | Minimal adult/age-band result; no ordinary app custody of ID/face |
| Attestation / anti-abuse | App/device integrity, signed challenges, pairwise quotas, risk containment | Purpose-limited pseudonymous technical data; no private content |
| Rendezvous / presence | Short-lived signed leases, coarse region lookup, capability routing | No profile text/media; adult and device authorization required before real users |
| Proximity engine | Random rotating BLE encounter IDs, local compatibility, pairwise profile capability | Raw encounter observations remain on device; no server encounter graph |
| Signaling | Opaque WebRTC offer/answer relay | Ciphertext/transport metadata only |
| TURN credential service | Short-lived relay credentials | No dating content |
| Profile/media transfer | Consent-scoped profile capsules and adaptive media | Relay-first E2EE; receiver gets only granted content |
| Matching / messaging | Reciprocal interest, bilateral receipt, post-match E2EE sessions | One-sided ticket/like cannot match |
| Match-location grants | Approximate snapshot, meeting pin, temporary live share | Pairwise E2EE, expiring, sequenced, revocable |
| Push broker | Opaque wake hints only | No profile, sexual intent, questionnaire, location, or message text |
| Sealed mailbox (off by default) | Optional ciphertext envelopes | Bounded TTL/quota; operator lacks content keys |
| Skin Shop catalog/assets | Public cosmetic assets, previews, moderation, delivery | Separate from dating, location, questionnaire, anti-abuse, and safety data |
| Billing / entitlements | Platform receipt validation and cosmetic ownership | Purchases never influence dating rank/reach/safety |
| Creator operations | Creator identity, IP reports, payouts, tax/fraud controls | No access to private dating or safety data |
| Report ingest + safety vault | Explicit user-selected evidence exception | Separate keys, roles, audit, retention, legal hold |
| Safety console | Human review, enforcement, appeals | Need-to-know access; no general operator browsing |

## Operating modes

- **A Strict Zero-Store (default):** discoverable only while online.
- **B Sealed Mailbox:** opt-in encrypted envelopes; operator cannot decrypt.
- **C Personal Availability Node:** post-MVP user-controlled availability device.
- **P Get fk'd Proximity:** off by default; prompt-before-share default; best-effort BLE detection; no exact-distance radar.
- **L Match Location:** off by default; match-scoped grant after separate consent.

## Trust and consent flow

```text
Passkey / root identity
        +
Authorized device key
        +
Adult eligibility credential
        +
App/device attestation as risk requires
        ↓
Short-lived service capability
        ↓
Presence / discovery / proximity / profile fetch / like
        ↓
Reciprocal interest + bilateral match receipt
        ↓
Post-match E2EE messaging, optional mailbox, optional location grant
```

No UI-only gate is considered a security boundary. Real-user services must reject requests that lack required cryptographic authorization.

## Proximity flow

```text
User enables Get fk'd
        ↓
Device advertises random rotating encounter ID
        ↓
Nearby opted-in device detects ID
        ↓
Challenge-response + replay check
        ↓
Local compatibility check
        ↓
Generic haptic with cooldown
        ↓
Prompt before profile share (default)
        ↓
Pairwise expiring profile capability
        ↓
Relay-first encrypted profile transfer
```

Bluetooth payloads contain no profile ID, root key, rendezvous ID, gender, orientation, age band, sexual intent, location, push token, or marketplace identity.

## Location flow

```text
Mutual match
    ↓
Separate prompt: none / approximate snapshot / meeting pin / temporary live
    ↓
Second confirmation for precise choice
    ↓
Signed pairwise grant + E2EE payload
    ↓
Visible active-share indicator
    ↓
Expiry or authenticated revoke
```

Block, unmatch, emergency privacy, explicit stop, or account deletion terminates active grants. Short TTL is a network-failure fallback, not a substitute for authenticated revocation.

## Alignment flow

```text
Versioned questionnaire
        ↓
Encrypted local answers + importance + dealbreakers
        ↓
Only approved comparable representation exchanged
        ↓
Local reciprocal weighted score
        ↓
Explain strongest alignment and differences
```

Popularity, attractiveness, spending, purchases, creator status, race, ethnicity, skin color, disability, height, and photograph-inferred sensitive traits are excluded.

## Marketplace isolation

```text
Public cosmetic asset
    → validation / moderation
    → catalog / CDN
    → platform purchase validation
    → signed entitlement
    → local application
```

Marketplace services cannot query private profiles, messages, proximity, location, questionnaire answers, bot-risk state, or safety cases. Cosmetics never alter dating reach or safety access.

## Data plane default

Pre-match: `iceTransportPolicy: relay` (or platform equivalent). Post-match direct P2P may be offered only behind explicit consent and a feature flag; relay-only remains the safe default.

## Current implementation status

Implemented in repository:

- Rust identity/protocol/matching/storage scaffolds;
- deterministic local alignment and governed preference types;
- iOS staging UI/state for Get fk'd, Looking For, gender-feed preferences, questionnaire, Skin Shop, and match-location consent;
- local rendezvous ticket discovery;
- release gates, threat model, data map, and anti-bot strategy.

Not implemented for real users:

- CoreBluetooth/Android BLE proximity;
- network-enforced adult credential;
- App Attest/Play Integrity server verification;
- native WebRTC profile/messaging transport;
- E2EE location grants/revocation;
- StoreKit/Play Billing, creator upload/moderation/payout;
- staffed safety operations and production infrastructure.
