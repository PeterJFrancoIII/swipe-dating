# Threat Model (Staging Baseline)

**Updated:** 2026-07-21  
**Status:** DRAFT — production blockers remain

## Assets

Identity secrets, adult-eligibility credentials, app/device attestations, profile/media, sexual and relationship intent, gender/orientation preferences, questionnaire answers, messages, coarse location tokens, BLE encounter identifiers, match-scoped location grants, marketplace assets and entitlements, creator payout records, report evidence, push tokens, signing keys, and infrastructure credentials.

## Adversaries

Curious operator, malicious peer, stalker, abusive former match, venue scanner, Bluetooth relay attacker, network observer, compromised relay, modified client, profile scraper, bot/Sybil farm, romance scammer, marketplace fraudster, malicious creator, insider with console access, compromised creator/payment account, and nation-state (out of MVP scope beyond honest documentation).

## Security and abuse invariants

1. No person under 18 may obtain a usable discovery, proximity, sexual-intent, match, map, group, or messaging capability.
2. Bluetooth advertisements reveal no stable identity, profile attribute, gender, orientation, sexual intent, or location.
3. Every profile/location/group disclosure is consent-scoped, expiring, revocable, and block-aware.
4. A one-sided like or discovery ticket cannot create a mutual match.
5. Purchases and creator status cannot influence dating rank, reach, safety access, or enforcement priority.
6. Sensitive questionnaire answers remain local by default and are never used for advertising.
7. The operator cannot reconstruct a durable proximity encounter graph from ordinary service data.

## Abuse cases → mitigations

| Abuse | Mitigation | Test/control |
|---|---|---|
| Underage access | Network-enforced adult credential + fail-closed UI + revocation | UI, protocol, modified-client, expired/revoked credential tests |
| Birth-year boundary error | Full date-of-birth or provider credential; no year-only production gate | Boundary tests for users turning 18 later in year |
| Modified client bypasses UI | Signed capability checks at every service boundary | Direct API negative tests |
| Counterfeit profile identity | Bind profile ID to root/device key; validate every signed object | Cross-identity forgery tests |
| Unilateral match | Bilateral match receipt and reciprocal interest proof | One-sided live-ticket tests |
| Exact location stalk | Location off by default; match-scoped E2EE grants; approximate default | Grant, expiry, revoke, block/unmatch tests |
| Location coercion | Separate consent, active-share dashboard, safety copy, report category | UX review + abuse tabletop |
| Stale location after revoke | Signed sequence/revocation tombstone + receiver cache purge | Network loss and replay tests |
| Proximity stalking | Off by default, equal defaults, rotating IDs, cooldown, block suppression | Stalker journey and venue tests |
| BLE identifier replay | Short epochs, nonce/challenge handshake, replay cache | Captured-advertisement replay tests |
| BLE relay / wormhole | Time/distance bounds, local confirmation, no automatic sensitive disclosure | Two-site relay simulation |
| Long-range venue sweep | Low-power bounded scanning, rate limits, no count UI, anomaly detection | Antenna/scanner red-team |
| Operator encounter graph | No server upload of raw BLE events/IDs; local-only metrics | Data-flow inspection and log tests |
| Lock-screen sexual disclosure | Generic notification text; no intent/profile in notification | Notification snapshot tests |
| Gender-asymmetric privacy | Same off/prompt defaults and controls for all identities | Configuration/unit tests |
| Sexual intent exposure | Reciprocal compatibility before disclosure | Incompatible-user tests |
| Group participant substitution | Complete roster signed by all; membership changes require renewed consent | Add/replace/remove adversarial tests |
| IP disclosure pre-match | Relay-only ICE default | Candidate-policy and packet-capture tests |
| Profile scraping | Bounded candidates, fetch capabilities, attestation, adaptive quotas | Load, crawler, token replay tests |
| Bot/Sybil farm | Passkeys, adult credential, app/device attestation, pairwise quotas, risk challenges | Registration/like/report farm simulations |
| Attestation as sole identity proof | Independent adult, root-key, behavior, and recovery controls | Control-composition review |
| False-positive bot containment | Explain temporary limits, human review, appeal, reversible risk state | Appeal and recovery tests |
| Romance scam / spam | Link risk, velocity controls, report/block, safety education | Abuse-model tests |
| Questionnaire answer leakage | Local scoring, encrypted storage, no plaintext telemetry | Modified-client and log inspection |
| Score manipulation | Versioned questions, reciprocal weights, no purchase/popularity inputs | Deterministic scoring tests |
| Protected-trait proxy ranking | Schema allowlist, feature review, no image inference | Fairness/privacy review |
| Malicious marketplace asset | Declarative allowlist, bounded decode, no code/network access, sandboxed preview | Fuzzing and decompression-bomb tests |
| Copyright/impersonation asset | Creator identity, report/takedown, provenance, human moderation | Marketplace playbook |
| Purchase fraud / payout abuse | Platform receipt validation, entitlement signing, payout holds, finance review | Receipt replay and refund tests |
| Marketplace-to-dating data join | Separate services/keys/roles; explicit policy denial | Access-control and data-lineage review |
| NCII / CSAM | Explicit report bundles; isolated evidence vault; human-owned legal path | Safety playbooks and access audit |
| Operator voyeurism | No plaintext custody; vault isolation | Data map, code review, access reviews |
| Key theft via backup | Hardware wrap, non-exportable device keys, explicit recovery | Storage lifecycle tests |
| Lost key causes crash | Typed unavailable/recovery errors; no `expect` on restored identity | Restore and corrupt-backup tests |
| Replay likes/messages | Nonces + persistent replay cache + TTL | Protocol replay tests |
| Malicious media | Bounded decode/re-encode, MIME sniff, dimensions/bytes/bit-depth limits | Fuzz + corpus tests |
| Shadow-ban opacity | Documented temporary limits, reason categories, appeal | Policy + console flows |
| Supply chain | Pin lockfiles; deny; SBOM; CI scans; signed builds | `make security`, provenance checks |
| Approval spoofing | Signed approval artifacts bound to commit/environment/freshness | Production-preflight negative tests |

## Proximity-specific privacy design

BLE encounter IDs must be generated from dedicated ephemeral randomness or an unlinkable credential construction. They must not be derived from the long-lived root public key, profile ID, rendezvous ID, push token, or marketplace account. Raw encounter observations remain on device and expire rapidly.

A detected device is not automatically a disclosed profile. The default transition is:

```text
nearby signal → local compatibility check → generic haptic → explicit profile-share prompt → pairwise capability → profile transfer
```

Automatic profile sharing is a separate explicit opt-in available on equal terms to every adult user.

## Location-specific privacy design

Location sharing is a post-match capability, not a discovery requirement. Each grant is pairwise, purpose-labeled, precision-labeled, signed, encrypted to the recipient, sequenced, and expiring. Matching alone transmits no location. Blocking, unmatching, emergency privacy, or explicit stop creates a revocation event and purges local displays.

## Bot-risk data minimization

Risk systems may process integrity verdicts, request velocity, replay signals, impossible travel, malicious-domain indicators, repeated hashes, and coordinated abuse patterns. They must not consume private message plaintext, questionnaire answers, sexual intent, orientation, or protected traits for general bot scoring.

## Current implementation honesty

The repository currently contains staging UI and protocol scaffolds, not production Bluetooth, StoreKit/Play Billing, live location, App Attest, Play Integrity, or staffed safety operations. Documentation of a target control is not evidence that the control exists.

Unresolved production risks remain blockers under `docs/governance/release-gates.md`.
