# System Overview

**Updated:** 2026-07-22  
**Active implementation:** JavaScript rapid R&D, synthetic users only

The product target remains a hybrid **local-first** adult dating platform: an ephemeral control plane, consent-scoped encrypted peer data plane, isolated public cosmetic marketplace, and isolated safety/anti-abuse systems.

The active research implementation is one JavaScript monorepo. Product and safety logic runs in shared ECMAScript modules; Node.js runs tests, simulations, and the API adapter; Expo/React Native runs the mobile and web research UI.

## Active JavaScript components

| Component | R&D role | Sensitive-data boundary |
|---|---|---|
| `apps/rnd-mobile` | Expo UI for age gate, local profile editing, intent-driven Discover, Matches, session conversation, Deepen Connection, Get fk'd, preferences, Skin Shop, and matched-location consent | Synthetic and device-local state only; no real profiles, coordinates, purchases, message/phase delivery, or evidence |
| `apps/rnd-api` | Dependency-light Node HTTP adapter | Short-lived synthetic presence identifiers, likes, blocks, and discovery only; not used for chat or phase delivery |
| `apps/rnd-simulator` | Deterministic synthetic multi-user scenarios | No external network and no real users |
| `packages/rnd-domain` | Adult boundary, preferences, alignment, proximity decisions, location grants, matching, asset validation, risk decisions | Pure deterministic logic; no network or telemetry |
| `packages/rnd-discovery` | Mutual intent eligibility, hard boundary exclusions, transparent weighting, deterministic ranking, and progressive reveal | Session-only synthetic data; rejects protected/inferred/popularity/purchase inputs |
| `packages/rnd-conversations` | Pass/interest decisions, explicit reciprocal fixture, undo, opener context, session messages, unmatch, block, and suppression | Session-only synthetic state; no identity, signatures, encryption, delivery, push, or moderation |
| `packages/rnd-relationship-phases` | Bilateral request/accept/decline/withdraw, reversible casual/deepened phases, allowlisted deeper prompts, and terminal cleanup | Match-scoped session memory only; no behavioral inference, delivery, signatures, E2EE, or persistence |
| `packages/rnd-storage` | Versioned allowlist state, migration, corruption recovery, reset, and export | Persists only presentation/cosmetic/UI fields; sensitive/session fields are discarded |
| `packages/rnd-crypto-node` | Domain-separated HMAC identifiers for Node simulations | Synthetic secrets only; not a production key-management system |
| `config/rnd-alignment-questionnaire-v1.json` | Versioned synthetic questionnaire contract | Raw answers remain session-local in R&D |

## JavaScript-authored versus native runtime

“Entirely JavaScript” means all active application, service, simulation, and domain source authored by this project is JavaScript. Mobile operating systems still provide Bluetooth, location, notifications, secure hardware, attestation, billing, storage, and camera functions through native frameworks.

For a hardware experiment, the Expo app may consume a maintained React Native/Expo module inside a custom development build. Generated `ios/` and `android/` projects are disposable build artifacts, not manually maintained source. The project must not silently reintroduce Swift, Kotlin, Rust, Java, Objective-C, Dart, Python, or TypeScript as a second active implementation language without a superseding ADR and measured need.

## Intent-driven discovery flow

```text
Adult-only session
       ↓
Immediate intent + relational openness
       ↓
Mutual acceptance on both axes
       ↓
Required-boundary comparison
       ↓
Hard exclusion on mismatch
       ↓
Transparent weighted score
(intent / boundaries / lifestyle / alignment / distance)
       ↓
Bio-first profile preview
       ↓
Non-visual micro-interaction
       ↓
Synthetic visual reveal
       ↓
Shared-ground tag selected before synthetic interest
```

The ranking engine rejects race, ethnicity, skin color, disability, height, inferred attractiveness, intelligence, hygiene, sexuality, gender, fitness, grooming, body hair, popularity, purchases, spending, subscription status, and creator status. Private exclusion reasons are not disclosed to another person.

The current intent, boundary, weight, reveal, and queue state is session-only. It is not written to AsyncStorage and is not transmitted to a server.

## Reciprocal match and conversation flow

```text
Eligible synthetic profile
        ↓
Pass ───────────────→ session decision ──undo──→ discovery

Interest
  ├── unilateral fixture → pending session interest ──undo──→ discovery
  └── reciprocal fixture → active synthetic match
                                  ↓
                       same shared-ground tag
                                  ↓
                    consent-aware opening prompt
                                  ↓
                       session-only transcript
                         ├── unmatch → sending disabled
                         └── block   → content/context purged
                                       + rediscovery suppressed
```

The fixture field `syntheticReciprocalLike` is test data, not an authenticated action. No bilateral signature, identity proof, match receipt, message encryption, transport, delivery, push, or multi-device synchronization exists.

Matching does not automatically send a message, enable proximity, or share location. The first local message carries the visible starter tag selected during discovery. Unmatch and block stop sending; block additionally purges visible transcript content and starter context in the current session.

The Matches tab, decisions, pending interests, reciprocal flags, matches, messages, transcripts, unmatch state, and block state are session-only and explicitly excluded from AsyncStorage.

## Deepen Connection research flow

```text
Active synthetic match
        ↓
Casual by default
        ↓
Participant A explicitly requests deeper phase
        ↓
Pending — no phase change
   ├── withdrawal → casual
   ├── decline    → casual, no reason retained
   └── Participant B explicitly accepts/requests
                         ↓
                 Deepened phase
                         ↓
      Allowlisted private deeper prompts
 communication / goals / availability / values / boundaries
                         ↓
 editable + clearable session-only answers
   ├── either participant returns to casual → answers cleared
   ├── unmatch → phase ended + answers cleared
   └── block   → phase ended + answers cleared + conversation purge
```

The phase never activates from message count, reply speed, elapsed time, sexual activity, an offline meeting, location, purchases, or model inference. It does not change either participant's public profile or discovery settings. Entry is not consent to sex, exclusivity, media, location, an offline meeting, health disclosure, or public relationship status.

Simulated counterpart requests and responses are deterministic UI fixtures, not authenticated actions or signed bilateral phase receipts. Requests, responses, timestamps, phase state, and deeper answers remain session-only and are explicitly excluded from AsyncStorage.

## Current local persistence flow

```text
Approved profile / cosmetic / UI fields
                ↓
Shared allowlist sanitizer
                ↓
Versioned JSON record
                ↓
AsyncStorage adapter
                ↓
Restore / migrate / clear / redacted export
```

The AsyncStorage record is intentionally unencrypted and therefore synthetic-R&D-only. It excludes birth date, adult-gate result, intent, relational openness, boundaries, discovery weights/history, questionnaire answers, decisions, likes, pending interests, reciprocal flags, matches, starter tags, messages, transcripts, relationship-phase requests/responses/status/timestamps, deeper answers, transition history, unmatch/block history, the Matches tab, reports, coordinates, location grants, BLE observations, encounter identifiers, device IDs, credentials, cryptographic keys, payments, and safety evidence.

A real-user implementation requires an encrypted vault with reviewed key custody, backup, recovery, migration, deletion, export, and physical-device behavior. See ADR-0015, ADR-0017, and ADR-0018.

## Target product components

| Target component | Responsibility | Real-user prerequisite |
|---|---|---|
| Encrypted local vault | Profile, preferences, questionnaire, discovery settings, match/message/phase state, deeper answers, and key references | External security/privacy review, OS-backed keys, migration, recovery, deletion/export tests |
| Adult eligibility | Signed, expiring, revocable adult credential | Counsel-approved provider and network enforcement |
| Discovery engine | Mutual intent, hard boundaries, explainable user weights, privacy-preserving candidate retrieval | Fairness/privacy review, modified-client tests, encrypted custody, exclusion-leakage tests |
| Match protocol | Signed reciprocal interests and bilateral match receipt | Root/device identity, replay protection, trusted issuers, two-device verification |
| Messaging | Post-match E2EE, delivery, ordering, retries, offline handling, block/unmatch revocation | Reviewed protocol, encrypted custody, notification privacy, spam/report operations, device-change tests |
| Relationship-phase protocol | Signed bilateral phase requests/receipts, reversible revocation, optional E2EE sharing of deeper answers | Identity binding, replay/ordering/conflict rules, encrypted custody, decline privacy, notification review, two-device tests |
| Attestation/anti-abuse | App/device integrity, signed challenges, pairwise quotas, risk containment | App Attest/Play Integrity validation, privacy review, appeal operations |
| Rendezvous/presence | Short-lived signed leases, coarse-region discovery, capability routing | Identity binding, replay protection, trusted issuer configuration |
| Proximity | Rotating BLE encounter IDs, local compatibility, consent-scoped profile capability | Custom dev build, background/battery tests, stalking/replay/wormhole red team |
| Profile/media transfer | Consent-scoped profile capsule and adaptive media | Reviewed E2EE transport and hostile-media pipeline |
| Match location | Approximate snapshot, meeting pin, temporary live share | Pairwise E2EE payload, expiry, immediate revoke, receiver purge |
| Skin Shop | Bounded public cosmetic assets, moderation, platform billing, entitlements | Parser sandbox, store billing, creator/IP/refund/payout operations |
| Safety plane | Report intake, isolated evidence vault, human review, appeals | Named staff, RBAC, audit, retention, legal processes, operational contacts |

## Operating modes

- **A Strict Zero-Store (default target):** discoverable only while online.
- **B Sealed Mailbox:** optional encrypted envelopes, off by default.
- **C Personal Availability Node:** post-MVP user-controlled availability device.
- **P Get fk'd Proximity:** off by default; prompt-before-share default; best-effort detection; no exact-distance radar.
- **L Match Location:** off by default; separate match-scoped consent.
- **D Deepen Connection:** casual by default; match-specific bilateral opt-in; reversible; no behavioral inference.

## Consent flow

```text
Adult eligibility + authorized device + request integrity
                         ↓
Short-lived service capability
                         ↓
Presence / discovery / optional proximity / profile fetch / interest
                         ↓
Reciprocal signed interest + bilateral match receipt
                         ↓
Post-match E2EE messaging + optional location grant
                         ↓
Optional bilateral relationship-phase request + receipt
                         ↓
Optional deeper prompts / separately shared E2EE answers
```

No UI-only gate is a security boundary. The current JavaScript model tests required decisions; it does not claim production cryptographic enforcement.

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

The advertisement model contains no profile ID, root identity, gender, orientation, age band, sexual intent, location, push token, marketplace identity, relationship phase, or deeper answers.

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
Session-local answer + importance + dealbreaker
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
- ephemeral presence, immediate withdrawal, blocks, self-filtered discovery, and reciprocal matching model;
- mutual immediate-intent and relational-openness eligibility;
- hard required-boundary exclusions;
- user-controlled transparent discovery weights and explanations;
- bio-first progressive reveal and shared-ground interest prompt;
- prohibited ranking-input rejection;
- session-only pass, pending interest, explicit reciprocal fixture, match, undo, opener, message, unmatch, block, content purge, and rediscovery suppression;
- bilateral synthetic Deepen Connection request/accept/decline/withdraw/revert lifecycle;
- allowlisted deeper prompts with bounded editable session answers and cleanup on casual/unmatch/block;
- Get fk'd off-by-default consent decisions;
- local Looking For, gender-feed, filter, and alignment rules;
- expiring/revocable location-grant metadata without coordinates;
- bounded Skin Shop manifest validation;
- content-blind bot-risk and pairwise-quota simulations;
- versioned allowlist local persistence with migration, corruption recovery, reset, export, and sensitive-field redaction;
- Expo Android/iOS/web research UI and Node API;
- Node tests, JavaScript surface checks, dependency audit threshold, and Expo web export.

Not implemented for real users:

- encrypted local vault and production key custody;
- authenticated reciprocal likes or bilateral match receipts;
- signed/replay-resistant relationship-phase requests, receipts, revocation, delivery, multi-device conflict handling, or encrypted answer sharing;
- reviewed E2EE messaging, delivery, push, ordering, retries, offline mailbox, or multi-device synchronization;
- real block/unmatch propagation, spam controls, reports, moderation, appeals, or notification privacy review;
- real profile/media progressive disclosure;
- production candidate retrieval or server-side ranking;
- BLE scanning/advertising, challenge-response, background reliability, or haptic cooldown enforcement;
- production adult assurance and platform attestation;
- reviewed E2EE profile, media, or location transport;
- StoreKit/Play Billing and creator operations;
- durable safety operations or production infrastructure.

## Frozen legacy prototype

The earlier Rust/UniFFI/SwiftUI/Kotlin/Terraform prototype remains in the repository as historical reference. It is not the active R&D architecture and must receive no new product feature work. Archival or removal requires a separate review after JavaScript parity is accepted.
