# Mission

**Status:** ACTIVE — staging / pre-beta governance in force  
**Updated:** 2026-07-21  
**Legal status of policy drafts:** UNAPPROVED until counsel and named owners sign artifacts in `approvals/`

## User objective

Build an adults-only, local-first, consent-driven dating platform — designed especially for adults ages **18–25** while remaining available to all eligible adults — whose core dating and safety experience remains free and resistant to centralized surveillance of ordinary private content.

The product may support private sexual intent, optional nearby encounters, optional encrypted location sharing between matches, expressive avatars and skins, and local compatibility ranking. It must still meet child-safety, anti-trafficking, NCII, abuse-reporting, privacy, consumer-protection, payments, and app-store obligations required for the service to exist lawfully.

## Current objective

1. Keep a runnable **STAGING** iPhone client advancing product UX.
2. Add governed foundations for:
   - **Get fk'd** — an explicitly enabled, consent-based Bluetooth proximity mode;
   - **Skin Shop** — user-created and purchasable cosmetic avatars/skins, isolated from dating reach;
   - optional matched-location grants and meeting pins;
   - private `Looking For` modes and inclusive gender/orientation preferences;
   - a versioned, local-first alignment questionnaire;
   - strong bot, spam, scraping, and Sybil resistance.
3. Keep closed beta and production blocked until the release gates for these high-risk features pass.
4. Apply governance and code to the canonical Git repository; Drive is a mirror only.

## Success criteria

### Product / staging

- [ ] Adults-only path; fail-closed adult eligibility before discovery **and before any proximity broadcast**
- [ ] No person under 18 can create a profile, enter proximity mode, select sexual intent, match, map, or message
- [ ] Local-first profiles/media/messages/questionnaire answers; no operator access to ordinary private content
- [ ] Mutual match before messaging; a live discovery ticket can never create a unilateral match
- [ ] `Get fk'd` can be turned on/off from Discover, defaults to **off**, and uses the same privacy defaults for every gender
- [ ] Proximity identifiers are rotating, unlinkable, replay-resistant, and reveal no profile attributes in BLE advertisements
- [ ] Location sharing is off by default, match-scoped, explicitly granted, expiring, revocable, and E2EE
- [ ] `Looking For` intent is private and disclosed only to independently compatible adults
- [ ] Gender identity, pronouns, orientation, who-I-see, and who-may-see-me are separate optional fields
- [ ] No ranking/filtering by race, ethnicity, skin color, height, disability, or inferred protected traits
- [ ] Alignment scoring runs locally and excludes popularity, purchases, protected traits, and spending
- [ ] Skin Shop assets cannot execute code and purchases never affect dating visibility or safety access
- [ ] Block, report, emergency privacy, safety center, delete, and appeal entry points remain free and never paywalled
- [ ] Visible STAGING / INTERNAL BETA marker until approved branding and market

### Security / abuse resistance

- [ ] Network-enforced adult credential, device/app attestation, replay prevention, and credential revocation
- [ ] Adaptive rate limits and bot-risk controls do not require ordinary humans to pay to prove legitimacy
- [ ] App Attest / Play Integrity integrations are verified server-side before real-user beta
- [ ] Proximity harvesting, BLE replay, mass scraping, fake-match, location coercion, and bot-farm red-team tests pass
- [ ] Consequential enforcement has policy-based human review and appeal

### Governance / release

- [ ] Community rules cover consent, proximity, location, group encounters, marketplace abuse, NCII, child safety, trafficking, appeals, enforcement, and deletion limits
- [ ] Release gates deny beta/production without named approvals and feature-specific evidence
- [ ] Sensitive questionnaire and location processing have a counsel-reviewed DPIA
- [ ] Skin Shop creator terms, IP process, moderation, billing, refunds, and payout controls are approved
- [ ] Impact-funding claims only with entity, accounting, and evidence controls
- [ ] Market launch matrix deny-by-default
- [ ] `make production-preflight` fails closed without authentic approvals bound to a reviewed commit

## Non-goals

- Rule-free or “no moderation” operation
- Minors or parental-consent bypass of the 18+ floor
- Gender-based forced disclosure or weaker privacy defaults for any gender
- Covert proximity tracking, exact-distance radar, directional stalking tools, or persistent encounter graphs
- Location sharing by default, indefinite background tracking, or a historical movement trail
- Public feeds, anonymous random chat, public attractiveness scoring, or public sexual-intent broadcasting
- A marketplace for sexual services or compensation tied to sexual activity
- Sale or behavioral advertising using dating, sexuality, politics, location, message, photo, questionnaire, or proximity data
- Ranking by race, ethnicity, skin color, disability, height, inferred intelligence, inferred hygiene, or photograph-derived protected traits
- Purchases, skins, or creator status influencing candidate rank, messaging access, report priority, or safety tools
- Claiming decentralization removes legal or safety duties
- Autonomous production deploy, store submission, legal filing, vendor purchase, or fabricated approval
- Guaranteeing rescue, identity truth, screenshot prevention, Bluetooth detection, or meeting safety

## Constraints

| Area | Constraint |
|---|---|
| Stack | Rust audited core, UniFFI, SwiftUI iOS first, Kotlin Android later, Axum control plane |
| Age | Adults 18+ only; 18–25 is a design audience, never a 16–17 access path |
| Privacy | No exact location exposure by default; consent grants; E2EE peer path; metadata honesty |
| Proximity | Off by default; equal defaults; random rotating BLE IDs; no attributes in advertisements |
| Safety | Fail closed on age/auth/protocol integrity; human review for consequential bans |
| Decentralization | Hybrid local-first; ephemeral control plane; no peer replication of others’ media in MVP |
| Marketplace | Cosmetics only; isolated public-asset plane; platform billing; no executable skins |
| Ranking | Local, explainable alignment; no protected-trait, popularity, or purchase weighting |
| Funding | Core + safety free; impact claims evidence-backed only |
| Deployment | Staging only for agents; beta and production human-gated |

## Source of truth

- Current specification: `docs/specs/current-objective.md`
- Feature interpretation: `docs/product/adult-feature-expansion.md`
- Deploy runbook: `.cursor/commands/deploy-decentralized-dating-app.md`
- Governance: `docs/governance/`
- Release gates: `docs/governance/release-gates.md` + `approvals/`
- Architecture decisions: `docs/architecture/adr-0009-*` through `adr-0013-*`
- Latest audit: `docs/audits/2026-07-21-adult-feature-expansion-review.md`

## Red-zone areas

Auth, adult assurance, proximity permissions, location sharing, sensitive questionnaire data, payments/creator payouts, funding claims, secrets, production infrastructure, customer data, migrations, safety evidence vault, child-safety reporting, NCII operations, and store submission require **explicit human approval**.
