# Bot, spam, scraping, and Sybil resistance strategy

**Status:** DRAFT — provider integrations not implemented  
**Updated:** 2026-07-21  
**Release authority:** `docs/governance/release-gates.md`

## Goal

Keep ordinary adult use free and low-friction while making mass registration, automated liking, profile scraping, Bluetooth harvesting, romance scams, report brigading, and Skin Shop fraud expensive, attributable enough for containment, and appealable when controls are wrong.

No single signal proves that an account is a unique trustworthy adult. Controls are independent and layered.

## Trust layers

### 1. Account authentication

- passkey or equivalent phishing-resistant authentication;
- recovery that does not silently mint unlimited new identities;
- rate-limited recovery and device enrollment;
- no password-only privileged path for production.

### 2. Root and device identity

- long-lived user root identity remains device-controlled;
- each device has a separate key authorized by the root;
- service requests are signed by the current device key;
- device removal and key rotation propagate revocation;
- marketplace creator identity is separate from dating-device identity.

### 3. Adult eligibility

- signed, expiring, revocable adult credential;
- minimal claim: adult boolean / approved age band, issuer, issue/expiry, revocation handle;
- required before presence, proximity, sexual intent, group mode, match, map, or messaging;
- no identity document or face image retained by ordinary app services;
- adult assurance is independent from device attestation.

### 4. App and device integrity

#### iOS

- App Attest key registered per app instance;
- server challenge and request hash bound into assertions;
- assertion counter/replay checks;
- DeviceCheck or lower-trust fallback only under approved policy;
- unsupported devices are explicitly lower trust, not silently equivalent.

#### Android

- Play Integrity app and device verdicts;
- request hash and nonce binding;
- server-side verification and verdict freshness;
- remediation path for legitimate users;
- lower-trust fallback documented and rate-limited.

### 5. Request integrity

Every sensitive endpoint requires:

- protocol version;
- device-key signature;
- one-time challenge or nonce;
- timestamp and bounded TTL;
- adult credential reference/proof where relevant;
- attestation assertion based on risk tier;
- replay cache;
- pairwise or anonymous quota token.

## Risk signals

Purpose-limited technical signals may include:

- account and device enrollment velocity;
- profiles per attested device/recovery lineage;
- presence, discovery, profile-fetch, like, group, report, and marketplace request velocity;
- identical fan-out timing;
- impossible geographic movement at coarse resolution;
- captured BLE encounter-ID replay;
- simultaneous incompatible sessions;
- repeated profile/media/skin hashes;
- malicious-domain or credential-theft indicators;
- high block/report ratio with confidence bounds;
- coordinated report clusters;
- purchase, refund, receipt, entitlement, and payout anomalies;
- known compromised app or device verdicts.

## Prohibited risk inputs

General bot scoring must not use:

- private message plaintext;
- questionnaire answers;
- political opinions;
- sexual intent or sex-life answers;
- orientation or gender identity;
- race, ethnicity, skin color, disability, religion, or other protected traits;
- precise location;
- marketplace spending as proof of legitimacy.

Safety evidence may be reviewed only within the isolated safety process for the reported case.

## Adaptive response ladder

| Tier | Example state | Response |
|---|---|---|
| 0 | ordinary human behavior | no interruption |
| 1 | mild velocity anomaly | tighter anonymous quota; silent backpressure |
| 2 | elevated risk | fresh attestation or signed challenge |
| 3 | high automated likelihood | bounded proof-of-work, temporary send cooldown, reduced fan-out |
| 4 | credible abuse | temporary containment, profile invisibility, preserve relevant technical evidence |
| 5 | confirmed severe abuse | policy-based suspension/ban, human review, appeal, legal escalation when required |

No tier requires payment to restore ordinary legitimate use.

## Privacy-preserving quotas

Prefer:

- pairwise identifiers per service/purpose;
- anonymous rate-limit credentials;
- rotating device pseudonyms;
- separate marketplace and dating quotas;
- short retention and aggregate abuse metrics;
- no single global identifier exposed to every service.

## Proximity abuse controls

- one active proximity broadcaster per eligible identity/device policy;
- random rotating BLE IDs with short epochs;
- challenge-response before profile capability issuance;
- replay and relay detection;
- haptic cooldown;
- no nearby count or exact distance;
- no raw encounter upload;
- suppress blocked identities;
- anomaly detection for venue sweeps and repeated capability requests.

## Scraping controls

- bounded randomized discovery batches;
- short-lived profile-fetch capabilities;
- relay-first transfer;
- no public profile index;
- per-recipient media variants and watermarks only if privacy-reviewed;
- fetch quotas based on adult credential, device, and pairwise tokens;
- decoy/honeypot techniques only if counsel and privacy approve and users are not deceived about enforcement.

## Marketplace fraud controls

- platform receipt validation;
- receipt replay cache;
- signed entitlements with restore flow;
- creator identity and payout hold for new/risky accounts;
- asset content hashes and provenance;
- refund/chargeback monitoring;
- no creator payout based on artificial self-purchases;
- marketplace containment does not silently alter dating reach.

## Transparency and appeal

Users should be told when an action is delayed, challenged, temporarily limited, or contained, subject to not disclosing detection details that enable abuse. Consequential actions require a reviewable reason category, human decision path, correction workflow, and appeal.

## Retention

Define and approve TTLs before beta:

- replay nonces: shortest useful TTL;
- raw request/security logs: short operational TTL;
- aggregated abuse metrics: limited analytical TTL;
- containment records: policy-defined;
- confirmed fraud/payment records: legal/accounting needs;
- legal holds: case-specific.

Risk data is never repurposed for advertising, attractiveness ranking, Skin Shop recommendations, or impact/funding decisions.

## Required tests

- direct API use without UI;
- expired/revoked adult credential;
- forged device/root authorization;
- attestation replay and request-body substitution;
- mass account registration;
- automated like and fetch farm;
- BLE replay, relay, and long-range scanner;
- impossible travel;
- report brigade;
- false-positive recovery and appeal;
- receipt/entitlement replay;
- creator payout abuse;
- log inspection for prohibited inputs;
- retention deletion verification.

## Current state

The repository contains domain models, staging copy, and release gates. It does **not** yet contain production passkeys, adult-credential issuer integration, App Attest, Play Integrity, privacy-preserving quota issuance, or staffed review operations. These remain closed-beta blockers.
