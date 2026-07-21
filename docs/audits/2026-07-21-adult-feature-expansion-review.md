# Adult feature expansion readiness review — 2026-07-21

**Branch:** `agent/consent-proximity-marketplace-preferences`  
**Scope:** Requested proximity, marketplace, match-location, adult intent, audience, identity preferences, filters, alignment, and anti-bot changes  
**Verdict:** **INTERNAL SYNTHETIC DOGFOOD ALLOWED; REAL-USER BETA AND PRODUCTION BLOCKED**

## Executive assessment

The branch translates the requested features into an adults-only, consent-driven, local-first design and implements a meaningful iOS/Rust staging foundation. It deliberately does not implement two unsafe requirements as originally phrased:

1. People age 16 or 17 are not admitted to an adult dating/sexual-intent network; the design audience is adults 18–25.
2. Profile disclosure is not automatic for men or weaker for women; every gender receives the same off/prompt-first defaults, with separate explicit auto-share opt-in.

This interpretation advances the product mission while reducing stalking, coercion, child-safety, discrimination, privacy, and store-distribution risk.

## Implemented on this branch

### Mission and governance

- mission updated for adults 18–25, consent proximity, match location, Skin Shop, local alignment, and anti-bot controls;
- community rules expanded for proximity stalking, Bluetooth harvesting, location coercion, group consent, bots, marketplace/IP, and purchases;
- feature-specific beta/production release gates;
- expanded data map, threat model, ownership matrix, closed-beta checklist, and system overview;
- ADRs 0009–0013 for proximity, location, alignment, marketplace, and bot/Sybil resistance;
- current objective updated to this branch and staging scope.

### Rust core

- governed `LookingForMode`, gender-feed category, proximity policy, match-location mode, activity/body-hair/fragrance preference types;
- explicit allowlist and prohibited-filter keys;
- proximity defaults to off;
- deterministic local reciprocal alignment scoring;
- dealbreaker conflict exclusion;
- version, duplicate-question, importance, hidden-answer, and prefer-not-to-say tests.

### iOS staging application

- Get fk'd toggle on the main Discover page;
- equal prompt-before-share default and explicit compatible-user auto-share option;
- clear `STAGING UI ONLY` Bluetooth disclosure;
- Looking For selectors, including private adult sexual intent;
- neutral private gender-feed choices;
- built-in questionnaire subset with importance and dealbreakers;
- local synthetic alignment score and candidate ordering;
- Skin Shop synthetic catalog and local mock cosmetic entitlement;
- post-match location prompt, consent choices, synthetic Matched Map, and stop control;
- expanded report categories and diagnostics;
- full-date 18th-birthday boundary instead of birth-year subtraction;
- hidden region no longer publishes a real fallback discovery region;
- live discovery tickets no longer auto-create unilateral matches;
- emergency privacy disables local proximity and location state and honestly discloses TTL limitations.

### Delivery controls

- CI updated to run on `agent/**` branches;
- Rust fmt/clippy/workspace tests and focused alignment/preference tests are blocking;
- questionnaire JSON and governance contract checks are blocking;
- Android `assembleDebug` is blocking;
- Swift package and linked iOS Xcode/UniFFI builds are blocking;
- production preflight is required to fail without human approvals.

## Not implemented — real-user blockers

### Adult eligibility

The full-date UI boundary remains a staging aid. There is no production provider integration or signed, expiring, revocable adult credential enforced by presence, proximity, matching, map, group, and messaging services.

### Bluetooth proximity

No CoreBluetooth or Android BLE advertising/scanning, challenge-response, replay cache, relay/wormhole mitigation, haptic cooldown implementation, background/battery validation, or block-aware pairwise capability exchange exists yet.

### Match location

No Core Location/MapKit collection, E2EE location envelope, sequence/revocation protocol, active background-share indicator, receiver purge, push wake, or adversarial location test exists yet. Staging stores consent choices only and collects no coordinates.

### Marketplace

No creator upload, production asset parser, moderation, object storage/CDN, StoreKit, Play Billing, receipt validation, entitlement restore, refunds, IP process, payout/tax flow, or marketplace fraud operations exist yet.

### Questionnaire privacy

Answers remain local in staging. A production score-only exchange protocol has not been selected or externally reviewed. Sending raw score-only answers to untrusted clients would violate the target privacy model.

### Bot and Sybil resistance

The strategy is documented, but passkeys, device-key enrollment/revocation, App Attest, Play Integrity, signed request challenges, pairwise quotas, proof-of-work, risk storage, review tooling, and appeal operations are not implemented.

### Safety operations

Report submission and safety review remain staging stubs. There is no staffed queue, durable case system, isolated evidence vault, operational child-safety/NCII/proximity/location/marketplace channels, or real-user escalation coverage.

### Protocol and infrastructure debt inherited from main

The branch does not yet close all prior critical review findings, including complete identity binding for every protocol object, configured server-ticket trust roots, authenticated immediate presence withdrawal, production WebRTC/messaging, hardware-backed key persistence, complete media decode/re-encode, or production infrastructure modules.

## Verification state

At authoring time, source changes were committed through the GitHub connector and CI was configured to provide a blocking verdict. The final status of the draft PR checks must be recorded below after GitHub Actions completes.

| Check | Status |
|---|---|
| Rust fmt / clippy / workspace tests | PENDING CI |
| Alignment/preference focused tests | PENDING CI |
| Questionnaire/governance contracts | PENDING CI |
| Android assembleDebug | PENDING CI |
| Swift package build | PENDING CI |
| iOS Xcode + UniFFI Simulator build | PENDING CI |
| Production preflight expected block | PENDING CI |
| Real BLE/location/commerce/attestation tests | NOT IMPLEMENTED — BLOCKING |

## Required next sequence

1. Resolve all CI failures on the draft PR.
2. Complete protocol identity binding, trusted issuer configuration, bilateral match verification, and authenticated presence withdrawal.
3. Implement network-enforced adult credentials and layered account/device/request integrity.
4. Implement and red-team BLE proximity behind a real-user-off feature flag.
5. Implement and red-team match-scoped E2EE location grants and revocation.
6. Implement isolated Skin Shop asset validation, moderation, billing, entitlements, and creator operations.
7. Select and review the score-only privacy protocol; complete questionnaire DPIA and user-rights flow.
8. Build durable safety operations and real staging infrastructure.
9. Obtain named owners and authentic beta approvals bound to the reviewed commit/environment.
10. Re-run this audit before inviting any real user.

## Stop condition

```text
INTERNAL_SYNTHETIC_DOGFOOD_ALLOWED
REAL_USER_CLOSED_BETA_BLOCKED
PRODUCTION_BLOCKED_HUMAN_APPROVALS_REQUIRED
```

This review is an engineering, safety, privacy, and governance checkpoint. It is not legal advice and is not approval to launch.
