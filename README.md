# LocalFirst Dating (Staging)

Adults-only (18+), local-first, consent-driven swipe dating platform designed especially for adults ages 18–25 while remaining open to eligible adults.

Profiles, media, preferences, likes, matches, and messages live primarily on user devices. A minimal ephemeral control plane handles presence, rendezvous, anti-abuse, and safety metadata. Ordinary private content should move over authenticated end-to-end encrypted peer channels once the production transport is implemented.

> **STAGING / INTERNAL BUILD** — Not production. Temporary branding. Legal entity, support contacts, launch markets, vendors, and operators are `CHANGE_ME` / `BLOCKED_PENDING_APPROVAL`.  
> **Real-user closed beta and production are blocked** until `docs/governance/release-gates.md` and authentic, commit-bound approvals are satisfied.

## Current feature foundation

### iPhone staging UX

- exact-date 18+ gate;
- Discover / Matches / Skin Shop / Safety / Settings tabs;
- **Get fk'd** adult proximity on/off control on the main swipe page;
- equal prompt-before-sharing proximity default for every gender;
- optional Looking For modes including relationships, Sex, Group sex, Cuddles, Movie night, activities, and conversation;
- separate gender identity, sexual orientation, private “Show me,” and visibility controls;
- lifestyle, conversation, body-hair, fragrance, and coarse-distance preferences;
- versioned politics/education/money-health/relationship/intimacy questionnaire;
- transparent local synthetic alignment ranking;
- optional synthetic match-area, meeting-pin, and temporary location grants;
- Skin Shop catalog, local previews, and a non-executable creator prototype;
- block, report, emergency privacy, and bot-readiness diagnostics.

### Rust foundation

- identity, protocol, crypto, profile, matching, messaging, storage, media, transport, safety, and telemetry crates;
- UniFFI bridge linked into the iOS Simulator build;
- `core/anti-abuse` policy primitives for adult/passkey/device/attestation gates, request binding, replay rejection, velocity, progressive challenge, and containment.

## Critical staging boundaries

The following are **not implemented as real-user capabilities**:

- no 16- or 17-year-old access;
- no real Bluetooth scan/advertise transport or encounter history;
- no gender-based forced/automatic profile disclosure;
- no real coordinates or background location collection;
- no automatic location sharing on match;
- no StoreKit/Play Billing charge, creator publication, or payout;
- no central political/sexual questionnaire answer storage;
- no production App Attest / Play Integrity / passkey / adult-credential integration;
- no live one-sided auto-match—reciprocal authenticated interest is required;
- no production WebRTC/E2EE device-pair messaging;
- no staffed report/evidence/case/appeal operation.

## Quick start

```bash
make doctor
make bootstrap
make feature-policy-check
make test-unit
make local-up   # requires Docker daemon; otherwise uses smoke fallback
```

### iOS

```bash
make ios-build
make ios-open
```

The iOS app uses a linked UniFFI static library for the Simulator. Start local control-plane services with:

```bash
make local-services-up
```

### Android

```bash
cd apps/android
./gradlew :app:assembleDebug --no-daemon
```

Android remains behind iOS for the new adult feature UX; parity is a later reviewed slice.

## Architecture

- **Mode A (default):** strict zero-store—discoverable only while online.
- **Mode B (flagged off):** sealed mailbox for optional encrypted envelopes.
- **Mode C (post-MVP):** personal availability node.
- **Proximity:** consent-based rotating BLE encounter IDs; transport pending. See ADR-0009.
- **Location:** recipient-bound, expiring match grants; real E2EE transport pending. See ADR-0010.
- **Alignment:** versioned local-first sensitive ranking. See ADR-0011.
- **Skin Shop:** isolated public declarative asset marketplace. See ADR-0012.
- **Bot defense:** layered adult/passkey/device/attestation/replay/quota policy. See ADR-0013.

See `docs/architecture/system-overview.md` and ADRs under `docs/architecture/`.

## Safety and governance

Core dating and safety are free. Marketplace purchases must never change reach, ranking, integrity treatment, or safety access. Safety tools reduce risk; they cannot guarantee identity, prevent screenshots, ensure Bluetooth delivery, erase malicious peer copies, or make an in-person or group meeting safe.

| Document | Role |
|---|---|
| `MISSION.md` | Binding current mission and product boundaries |
| `docs/specs/current-objective.md` | Active branch scope and stop conditions |
| `policies/community-rules.md` | Behavior rules (DRAFT / UNAPPROVED) |
| `docs/governance/release-gates.md` | Organization and feature-specific deny-by-default gates |
| `docs/audits/2026-07-21-adult-features-readiness-review.md` | Latest readiness verdict |
| `docs/privacy/data-map.md` | Data custody, processing, and retention map |
| `docs/security/threat-model.md` | Current threat model and production blockers |
| `docs/product/closed-beta-readiness.md` | Real-user beta checklist |
| `AGENTS.md` | Autonomous-agent rules |
| `docs/operations/github-sync.md` | Local ↔ GitHub sync (`make sync`) |
| `.cursor/commands/deploy-decentralized-dating-app.md` | Original staging deployment runbook |

## Release state

```text
INTERNAL_SYNTHETIC_DOGFOOD_ALLOWED
REAL_USER_CLOSED_BETA_BLOCKED
PRODUCTION_BLOCKED_HUMAN_APPROVALS_REQUIRED
```

## License

License deliberately unset. See `docs/legal/license-decision-required.md`.
