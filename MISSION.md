# Mission

**Status:** ACTIVE — staging / pre-beta governance in force  
**Updated:** 2026-07-21  
**Legal status of policy drafts:** UNAPPROVED until counsel and named owners sign artifacts in `approvals/`

## Mission statement

Build an **adults-only (18+)**, local-first, consent-driven dating platform—designed especially for adults ages **18–25** while remaining open to eligible adults—that enables private intent matching, optional nearby encounters, optional encrypted match-location sharing, expressive avatars/skins, and transparent local compatibility ranking.

Keep the core dating and safety experience free, minimize centralized custody of sensitive data, and prevent minors, coercion, stalking, trafficking, fraud, nonconsensual exposure, bot farms, and paid bypass of safety controls.

## Current objective

1. Keep a runnable **STAGING** iPhone client advancing product UX.
2. Implement the consent and policy foundations for:
   - **Get fk'd** adult proximity mode;
   - the **Skin Shop** avatar/theme marketplace boundary;
   - optional match-area, meeting-pin, and temporary live-location grants;
   - private **Looking For** modes;
   - inclusive gender/orientation fields and private candidate preferences;
   - non-protected lifestyle/grooming preferences;
   - a versioned, local-first alignment questionnaire;
   - layered bot, spam, and Sybil resistance.
3. Keep BLE transport, real location, real billing, sensitive-answer exchange, real-user networking, closed beta, and production **blocked** until their release gates pass.
4. Apply governance and code only through the canonical Git repository and reviewed pull requests.

## Non-negotiable product boundaries

- **No person under 18** may create a profile, publish presence, use proximity, use sexual-intent modes, share location, message, join a group encounter, or participate in marketplace social features.
- The 18+ floor has no parental-consent bypass.
- Gender never determines an automatic privacy setting. Every adult starts with **prompt before sharing** for proximity.
- Matching never shares location automatically.
- Live messaging requires authenticated reciprocal interest; a one-sided live like is not a match.
- Sexual intent is private and shown only to independently compatible adults.
- No ranking/filtering by race, skin color, ethnicity, disability, height, spending, inferred attractiveness, or AI-inferred intelligence, hygiene, gender, sexuality, fitness, or grooming.
- Safety, blocking, reporting, account deletion, emergency privacy, and bot challenges are never paywalled.
- Marketplace purchases never improve dating reach, ranking, visibility, or safety treatment.

## Success criteria

### Product / staging

- [x] Exact-date 18+ local staging gate; network adult credential remains blocked for beta
- [x] Get fk'd on/off control on the main swipe screen with equal consent defaults
- [x] Local proximity haptic simulation with no BLE identity/profile payload
- [x] Skin Shop staging catalog and local creator prototype
- [x] Optional expiring match-location consent and synthetic map prototype
- [x] Looking For modes including Sex, Group sex, Cuddles, Movie night, and conversation/activity modes
- [x] Separate gender identity, orientation, and private “Show me” preferences
- [x] Lifestyle, conversation, grooming, fragrance, and coarse-distance preferences
- [x] Versioned questionnaire with local transparent alignment scoring
- [x] Rust anti-abuse policy primitives for adult/passkey/attestation gates, replay, velocity, challenge, and containment
- [ ] Real rotating BLE encounter IDs and authenticated profile capability exchange
- [ ] Real OS location adapter and E2EE location envelopes with acknowledged revocation
- [ ] StoreKit / Play Billing, marketplace moderation, copyright, entitlements, and creator accounting
- [ ] Network-enforced adult eligibility and platform attestation
- [ ] Native WebRTC + vetted E2EE device-pair messaging
- [ ] Authenticated report intake, evidence vault, case management, and staffed safety operations

### Governance / release

- [ ] Community rules cover proximity stalking, location coercion, group consent, marketplace abuse, bot farms, appeals, enforcement, and deletion limits
- [ ] Release gates deny beta/production without named approvals and feature-specific evidence
- [ ] Impact/funding claims only with entity, accounting, and evidence controls
- [ ] Market launch matrix deny-by-default
- [ ] `make production-preflight` fails closed without authentic, commit-bound approvals
- [ ] CI builds current iOS/Android targets and treats failures as blocking

## Architecture constraints

| Area | Constraint |
|---|---|
| Stack | Rust audited core, UniFFI, SwiftUI iOS first, Kotlin Android parity later, Axum control plane |
| Privacy | Local-first data; no exact discovery location; E2EE peer path; metadata honesty |
| Proximity | BLE contains rotating random encounter identifiers only; no profile/gender/intent/root ID; prompt-before-sharing default for everyone |
| Location | Off by default; current-match only; recipient-scoped; expiring; revocable; no push/analytics plaintext |
| Alignment | Sensitive answers encrypted locally; local ranking; explicit opt-in; no ads or spending signals |
| Marketplace | Public declarative assets isolated from dating/safety data; no executable skins; platform billing for real purchases |
| Safety | Fail closed on adult/auth/protocol integrity; human review for consequential bans; free block/report |
| Bot defense | Passkeys + adult credentials + platform attestation + request binding + replay cache + privacy-preserving quotas + progressive friction + appeals |
| Decentralization | Hybrid local-first; ephemeral control plane; no arbitrary peer replication of others’ media in MVP |
| Funding | Core + safety free; impact claims evidence-backed only |
| Deployment | Synthetic/internal staging only for agents; beta and production human-gated |

## Non-goals

- Minors or a mixed minor/adult dating graph
- Gender-asymmetric or involuntary profile disclosure
- Covert proximity tracking, exact-distance radar, or a persistent encounter graph
- Automatic or indefinite location sharing
- Public sexual-intent broadcast, public explicit-content feed, or sexual-services marketplace
- Public popularity or attractiveness scoring
- Protected-trait ranking or photo-based sensitive-trait inference
- Sale or behavioral advertising using dating, sexual, political, location, message, photo, or questionnaire data
- Autonomous production deploy, store submission, legal reporting, or fabricated approvals
- Guaranteeing rescue, identity truth, Bluetooth delivery, screenshot prevention, or meeting safety

## Source of truth

- Spec: `docs/specs/current-objective.md`
- Deploy runbook: `.cursor/commands/deploy-decentralized-dating-app.md`
- Governance: `docs/governance/`
- New feature ADRs: `docs/architecture/adr-0009-consent-proximity.md` through `adr-0013-bot-sybil-defense.md`
- Release gates: `docs/governance/release-gates.md` + `approvals/`
- Audit: `docs/audits/2026-07-21-adult-features-readiness-review.md`

## Red-zone areas

Adult eligibility, platform attestation, proximity transport, location, payments, marketplace publishing, sensitive questionnaire exchange, crypto, permissions, secrets, production infrastructure, customer data, migrations, safety evidence, child-safety reporting, NCII response, and store submission require **explicit human approval** and feature-specific verification.
