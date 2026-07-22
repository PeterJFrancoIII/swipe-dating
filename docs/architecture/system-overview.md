# System Overview

**Updated:** 2026-07-22  
**Active implementation:** JavaScript rapid R&D, synthetic users only

The product target remains a hybrid **local-first** adult dating platform: an ephemeral control plane, consent-scoped encrypted peer data plane, isolated public cosmetic marketplace, and isolated safety/anti-abuse systems.

The current research implementation is one JavaScript monorepo. Shared ECMAScript modules contain product and safety decisions; Node.js runs services, simulations, tests, validation, and release tooling; Expo/React Native runs the mobile and web research UI.

## Active JavaScript components

| Component | R&D role | Sensitive-data boundary |
|---|---|---|
| `apps/rnd-mobile` | Expo UI for age gate, profile, intent discovery, Matches, session conversation, Deepen Connection, Get fk'd, preferences, Skin Shop, and matched-location consent | Synthetic and device-local state only; no real profiles, coordinates, purchases, message/phase delivery, or evidence |
| `apps/rnd-api` | Dependency-light Node HTTP control-plane simulator | Short-lived synthetic presence identifiers, likes, blocks, and discovery only; no real chat or phase delivery |
| `apps/rnd-simulator` | Deterministic synthetic multi-user scenarios | No external network and no real users |
| `packages/rnd-domain` | Adult boundary, preferences, alignment, proximity, location grants, matching, asset validation, and risk decisions | Pure deterministic logic; no network or telemetry |
| `packages/rnd-discovery` | Mutual intent, hard boundary exclusions, transparent weighting, deterministic ranking, and progressive reveal | Session-only synthetic data; rejects protected, inferred, popularity, and purchase inputs |
| `packages/rnd-conversations` | Pass/interest, reciprocal fixture, undo, opener, session messages, unmatch, block, purge, and suppression | Session-only synthetic state; no identity, signatures, encryption, delivery, push, or moderation |
| `packages/rnd-relationship-phases` | Bilateral request/accept/decline/withdraw, reversible casual/deepened phases, deeper prompts, and terminal cleanup | Match-scoped session memory only; no inference, delivery, signatures, E2EE, or persistence |
| `packages/rnd-storage` | Versioned allowlist state, migration, corruption recovery, reset, and export | Persists presentation/cosmetic/UI fields only; sensitive/session fields are discarded |
| `packages/rnd-crypto-node` | Domain-separated HMAC identifiers for Node simulations | Synthetic secrets only; not production key management |
| `scripts` | JavaScript syntax, language, governance, production, and repository validation | No deployment action; validators only |
| `config/rnd-alignment-questionnaire-v1.json` | Versioned synthetic questionnaire contract | Raw answers remain session-local |

## JavaScript-only source boundary

All project-authored application, service, domain, simulation, test, validation, and release-tooling code is JavaScript. The earlier Rust, Swift, Kotlin, UniFFI, Terraform, Make, and shell implementation was removed under ADR-0019. Git history preserves it without retaining a competing source tree.

Mobile operating systems and reviewed Expo/React Native dependencies still provide compiled Bluetooth, location, notification, secure-hardware, attestation, billing, camera, and storage capabilities. Those dependencies do not authorize duplicated project logic in native languages.

Generated `ios/` and `android/` projects are disposable build output and must not be committed. Any project-authored non-JavaScript exception requires a superseding ADR, measured necessity, named owners, narrow scope, and explicit human architecture approval.

Validation is intentionally redundant:

```text
Git checkout
   ├── dynamic apps/rnd-* + packages/rnd-* workspace audit
   ├── repository-wide prohibited-language/build audit
   ├── JavaScript syntax + Node tests + simulator
   ├── Expo SDK 57 web export
   ├── governance contracts
   └── production preflight must remain blocked

Committed Git tree
   └── independent GitHub API language audit
```

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
Bio-first preview → non-visual interaction → synthetic visual reveal
       ↓
Visible shared-ground tag selected before interest
```

The ranking engine rejects race, ethnicity, skin color, disability, height, inferred attractiveness, intelligence, hygiene, sexuality, gender, fitness, grooming, body hair, popularity, purchases, spending, subscription status, and creator status. Private exclusion reasons are not disclosed.

Intent, boundary, weight, reveal, and queue state is session-only and is not written to AsyncStorage or transmitted to a server.

## Reciprocal match and conversation flow

```text
Eligible synthetic profile
         ↓
Pass → session decision → optional undo → discovery

Interest
  ├── unilateral fixture → pending interest → optional undo
  └── reciprocal fixture → active synthetic match
                                  ↓
                       same shared-ground tag
                                  ↓
                    consent-aware first message
                                  ↓
                       session-only transcript
                         ├── unmatch → sending disabled
                         └── block → content/context purged
                                      + rediscovery suppressed
```

`syntheticReciprocalLike` is test data, not an authenticated action. No bilateral signature, identity proof, match receipt, encryption, transport, delivery, push, or multi-device synchronization exists.

Matching does not automatically send a message, enable proximity, or share location. Decisions, pending interests, matches, messages, transcripts, unmatch/block state, and the Matches tab are session-only and excluded from AsyncStorage.

## Deepen Connection flow

```text
Active synthetic match → casual by default
         ↓
One participant explicitly requests
         ↓
Pending — no phase change
   ├── withdrawal → casual
   ├── decline → casual; no reason retained
   └── second explicit opt-in → deepened
                                  ↓
                    allowlisted private prompts
             communication / goals / availability /
                    values / future boundaries
                                  ↓
                  editable session-only answers
   ├── either participant returns to casual → answers cleared
   ├── unmatch → phase ended + answers cleared
   └── block → phase ended + answers cleared + conversation purge
```

The phase never activates from content, reply speed, elapsed time, sexual activity, a meetup, location, purchases, or model inference. It does not change public profiles or discovery settings. Entry is not consent to sex, exclusivity, media, location, a meeting, health disclosure, or public relationship status.

Simulated counterpart actions are fixtures, not real consent or signed receipts. Requests, responses, timestamps, phase state, and deeper answers remain session-only.

## Local persistence flow

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

The AsyncStorage record is intentionally unencrypted and synthetic-R&D-only. It excludes birth date, adult status, credentials, intent, boundaries, ranking state, questionnaire answers, decisions, matches, messages, relationship phases, deeper answers, reports, coordinates, location grants, BLE observations, device identifiers, keys, payments, and safety evidence.

A real-user implementation requires a reviewed encrypted vault with OS-backed key custody, backup, recovery, migration, deletion, export, and physical-device tests.

## Target product components

| Target component | Responsibility | Real-user prerequisite |
|---|---|---|
| Encrypted local vault | Profile, preferences, questionnaire, discovery, match/message/phase state, deeper answers, and key references | External security/privacy review, OS-backed keys, migration, recovery, deletion/export tests |
| Adult eligibility | Signed, expiring, revocable adult credential | Counsel-approved provider and network enforcement |
| Discovery engine | Mutual intent, hard boundaries, explainable user weights, privacy-preserving retrieval | Fairness/privacy review, modified-client tests, encrypted custody, exclusion-leakage tests |
| Match protocol | Signed reciprocal interests and bilateral match receipt | Root/device identity, replay protection, trusted issuers, two-device verification |
| Messaging | Post-match E2EE, ordering, retries, offline handling, and block/unmatch revocation | Reviewed protocol, encrypted custody, notification privacy, spam/report operations, device-change tests |
| Relationship-phase protocol | Signed bilateral requests/receipts, reversible revocation, optional E2EE answer sharing | Identity binding, replay/ordering/conflict rules, encrypted custody, decline privacy, two-device tests |
| Attestation/anti-abuse | App/device integrity, signed challenges, quotas, risk containment | App Attest/Play Integrity validation, privacy review, appeal operations |
| Rendezvous/presence | Short-lived signed leases, coarse-region discovery, capability routing | Identity binding, replay protection, trusted issuer configuration |
| Proximity | Rotating BLE encounter IDs, local compatibility, consent-scoped profile capability | Custom dev build, background/battery tests, stalking/replay/wormhole red team |
| Profile/media transfer | Consent-scoped profile capsule and adaptive media | Reviewed E2EE transport and hostile-media pipeline |
| Match location | Approximate snapshot, meeting pin, temporary live share | Pairwise E2EE payload, expiry, immediate revoke, receiver purge |
| Skin Shop | Bounded public assets, moderation, billing, entitlements | Parser sandbox, store billing, creator/IP/refund/payout operations |
| Safety plane | Report intake, isolated evidence vault, human review, appeals | Named staff, RBAC, audit, retention, legal processes, operational contacts |

## Current implementation status

Implemented and verified in JavaScript R&D:

- exact eighteenth-birthday handling and synthetic adult credentials;
- ephemeral presence, withdrawal, blocks, and discovery model;
- mutual intent, hard boundaries, transparent ranking, and progressive reveal;
- session pass, pending interest, reciprocal fixture, match, opener, message, unmatch, block, purge, and suppression;
- bilateral synthetic Deepen Connection and deeper-prompt lifecycle;
- off-by-default proximity consent decisions;
- Looking For, gender-feed, filter, alignment, and location-grant rules;
- Skin Shop manifest validation;
- content-blind bot-risk and quota simulations;
- allowlisted persistence with migration, recovery, reset, export, and redaction;
- Expo Android/iOS/web research UI and Node API;
- JavaScript-only repository, syntax, test, simulator, dependency, Expo, governance, and production-block checks.

Not implemented for real users:

- encrypted local vault and production key custody;
- authenticated likes, match receipts, or relationship-phase receipts;
- reviewed E2EE messaging, profile, media, answer, or location transport;
- real delivery, push, ordering, retry, mailbox, or multi-device synchronization;
- cross-service block/unmatch revocation, reports, moderation, appeals, or notification review;
- production candidate retrieval, BLE, adult assurance, attestation, billing, creator operations, safety operations, or infrastructure.

## Historical implementation

The removed Rust/UniFFI/SwiftUI/Kotlin/Terraform prototype is available through Git history only. It is not part of the current build, dependency graph, ownership map, CI surface, or architecture.
