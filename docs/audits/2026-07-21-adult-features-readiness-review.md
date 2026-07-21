# Adult feature readiness review — 2026-07-21

**Scope:** `agent/adult-consent-features` against mission, privacy, consent, child-safety, security, commerce, and deployment requirements  
**Verdict:** **Synthetic/internal staging UX may continue. Real-user closed beta and production remain BLOCKED.**  
**Review type:** engineering/governance checkpoint; not legal advice, store approval, security certification, or authorization to launch

## Executive finding

The branch incorporates the requested product direction while preserving two mandatory boundaries:

1. The app remains strictly **18+**. It is designed especially for adults 18–25 but does not admit 16- or 17-year-olds.
2. Proximity disclosure defaults are equal across genders. Every adult starts at **prompt before sharing**; automatic compatible disclosure is explicit opt-in.

The branch establishes product models, iOS staging surfaces, a Rust anti-abuse policy core, data classification, threat modeling, ADRs, community rules, and release gates. It deliberately does not claim to provide real Bluetooth, real user location, real commerce, network adult assurance, production bot detection, or real safety operations.

## Implemented on this branch

### Adult and consent boundaries

- Exact date-of-birth staging check replaces birth-year subtraction.
- Welcome/onboarding clearly state adults 18+ only.
- No 16/17-year-old mode, parental-consent bypass, or minor/adult shared graph.
- Live discovery tickets no longer auto-match from a one-sided like.
- Same proximity disclosure default for every gender.
- Location remains off until a current match receives an explicit grant.

### Get fk'd staging UX

- On/off control appears on the main swiping page.
- Prompt, automatic-compatible, and no-share disclosure policies exist.
- Compatible gender and intention controls exist.
- Haptic encounter simulation exists without Bluetooth collection.
- UI explains that BLE transport, replay defense, blocked-user suppression, battery testing, and attestation are not wired.
- Emergency privacy disables proximity.

### Skin Shop staging UX

- Shop tab and catalog for avatars, profile skins, and chat skins.
- Local preview/apply entitlements; no real charge or payout.
- Creator prototype with declarative/non-executable format warning.
- Selected staging skins can alter profile-card appearance.
- Purchases are architecturally excluded from ranking, reach, bot trust, and safety access.

### Match map staging UX

- Optional approximate match area, meeting pin, and 15m/1h/4h modes.
- Synthetic coordinates only; no device location collected.
- Active grant indicator, expiry, map, stop control, and emergency clear.
- Block removes local location access.

### Preferences and alignment

- Separate gender identity, sexual orientation, “Show me,” and visibility concepts.
- Looking For includes Sex, Group sex, Cuddles, Movie night, relationships, activities, and conversation modes.
- Activity/fitness lifestyle, conversation, body-hair, fragrance, and coarse-distance preferences.
- Explicit exclusion of race, skin color, ethnicity, disability, height, spending, inferred attractiveness, and AI-inferred sensitive traits.
- Versioned questionnaire with politics, education/work, money/health, relationships, communication, adult intimacy, lifestyle, and values.
- Skip, importance, dealbreaker, and profile visibility controls.
- Transparent local-only synthetic compatibility score.

### Bot/Sybil foundation

`core/anti-abuse` adds:

- action classifications;
- adult/passkey/device/attestation gate signals;
- allow/throttle/challenge/contain decisions;
- request-body hash + nonce + expiry binding;
- replay cache interface;
- bounded pseudonymous velocity limiter;
- hard failure for missing adult credentials and replay;
- explicit forbidden sensitive/protected risk inputs;
- unit tests.

This is policy scaffolding—not a server integration, unique-human proof, or production fraud model.

### Governance

- Mission revised for adults 18–25 focus with an absolute 18+ floor.
- Community rules expanded for proximity stalking, location coercion, group consent, marketplace abuse, bots, and sensitive answers.
- Data map and threat model updated.
- ADR-0009 through ADR-0013 added.
- Feature-specific release gates added.
- Current objective replaced with the active branch scope.

## Important honesty gaps

### Get fk'd is not a Bluetooth implementation

The app has consent state, copy, and haptic simulation only. It does not yet:

- advertise or scan rotating BLE identifiers;
- exchange adult credentials or attestation assertions;
- suppress blocked users over the network;
- detect replayed encounters;
- transfer profile capsules;
- meet background or battery targets.

### Map uses no real location or E2EE transport

The branch uses deterministic synthetic coordinates to exercise UI. It does not yet have:

- Core Location permission adapter;
- recipient/device-bound encrypted grant envelope;
- relay and recipient revocation acknowledgement;
- replay/rollback protection;
- push/log/telemetry end-to-end verification.

### Skin Shop is not commerce

There is no StoreKit/Play Billing, receipt validation, creator publication, moderation, copyright intake, refund/chargeback handling, tax/sanctions review, payout, or marketplace data separation in deployed infrastructure.

### Questionnaire exchange remains synthetic

Candidate answers are synthetic fixtures. There is no peer answer exchange, explicit mutual reveal protocol, PSI/OPRF, encrypted persistence adapter, migration, export, or deletion implementation.

### Bot defense is not connected to endpoints

App Attest, Play Integrity, passkeys, network adult credentials, authorized device keys, server nonce stores, quota storage, models, dashboards, and appeals are not wired.

### Safety operations remain stubs

Reports are local staging UI; report intake, evidence vault, case management, RBAC, immutable audit, appeals, NCII, child-safety operations, contacts, and staffing are not operational.

## Critical pre-beta blockers

1. Network-enforced, revocable 18+ credential on every dating/proximity/location/social endpoint.
2. Passkey account authentication and authorized-device lifecycle.
3. Server-side App Attest and Play Integrity with request binding/replay protection.
4. Cryptographic identity binding for profiles, likes, blocks, matches, presence, and tickets.
5. Bilateral live match receipt validation before messaging.
6. Real rotating/unlinkable BLE protocol and proximity stalking/battery red team.
7. Recipient-bound E2EE location grants and acknowledged revocation.
8. Native relay-only WebRTC and vetted E2EE device-pair messaging.
9. Hardware-backed local keys and encrypted persistence for all sensitive state.
10. Complete bounded media decode/re-encode and 10-bit adaptive media path.
11. Authenticated report/case/evidence/appeal systems and staffed T&S.
12. Marketplace moderation, secure asset pipeline, billing, copyright, finance, and creator operations.
13. Questionnaire DPIA, fairness/proxy review, encrypted storage, lifecycle, and private comparison design.
14. Current blocking CI, artifact signing, branch protection, and independent security review.
15. Named owners, public contacts, counsel-approved terms/privacy/CSAE/NCII processes, launch-market approval, and authentic beta approvals.

## Permitted next use

- Synthetic profiles and synthetic coordinates.
- Local haptic and Skin Shop preview demonstrations.
- Internal UX/accessibility testing.
- Unit tests and protocol/security development.
- Staging services without real users or sensitive evidence, after account identity is verified.

## Prohibited next use

- Any user under 18.
- Real dating beta users.
- Real Bluetooth venue scanning or profile exchange.
- Real background location or match tracking.
- Real purchases, creator publication, or payouts.
- Real political/sexual questionnaire exchange.
- Uploading real intimate or child-safety evidence.
- Public impact claims, app-store submission, production deployment, or fabricated approvals.

## Sign-off statement

The product direction has been incorporated as a **consent-first adult staging foundation**. This review does not approve the high-risk transports or operations. The release state remains:

```text
INTERNAL_SYNTHETIC_DOGFOOD_ALLOWED
REAL_USER_CLOSED_BETA_BLOCKED
PRODUCTION_BLOCKED_HUMAN_APPROVALS_REQUIRED
```
