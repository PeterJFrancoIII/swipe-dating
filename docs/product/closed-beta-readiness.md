# Closed beta readiness

**Updated:** 2026-07-22  
**Status:** **NOT READY — JAVASCRIPT SYNTHETIC R&D ONLY**

The JavaScript implementation is a governed research scaffold. It is not permission to invite real users, collect real profiles or intimate preferences, activate Bluetooth proximity, transmit coordinates, process purchases, or operate real safety cases.

## Existing organizational gates

- [ ] Legal + privacy drafts counsel-approved for each beta jurisdiction
- [ ] Named owners replace every `CHANGE_ME` in `docs/governance/roles-and-owners.md`
- [ ] T&S staffing and P0 coverage plan funded for cohort size
- [ ] Child-safety, NCII, support, privacy, security, proximity-abuse, location-abuse, ranking-fairness, and creator/IP contacts operational
- [ ] External security review scope approved and scheduled
- [ ] Staging account identity verified; no production credentials in client
- [ ] Authentic beta approvals present and bound to reviewed commit/environment
- [ ] Store compliance matrix re-verified within 30 days of distribution

## JavaScript R&D delivery baseline

- [x] Root npm workspace with exact direct dependency pins
- [ ] Reviewed dependency lockfile committed and verified
- [x] Node.js 24 LTS CI
- [x] Plain JavaScript/ECMAScript-module active surface; no active TypeScript source
- [x] Node syntax and active-language checks
- [x] Domain, crypto, API, storage, discovery, and simulation tests
- [x] Expo SDK 57 dependency compatibility check
- [x] Expo web export
- [x] High/critical dependency audit threshold passes
- [ ] Moderate Expo native-build-tooling advisories resolved or formally time-bounded before real-user build
- [ ] Controlled iOS development build green on physical devices
- [ ] Controlled Android development build green on physical devices
- [ ] Legacy native/Rust prototype archived or explicitly retained under approved scope

## Local persistence and device custody

- [x] Synthetic R&D state uses a versioned allowlist schema with migration and corruption recovery
- [x] Current AsyncStorage adapter saves only display profile fields, mock cosmetics, last tab, and haptic preference
- [x] Automated tests prove sensitive/session fields are omitted from serialized state
- [x] User can view the redacted local record and clear it from the app
- [ ] Real-user profile and preference data uses an externally reviewed encrypted vault
- [ ] Keys are hardware/OS protected where available and not co-located with ciphertext
- [ ] Device backup, restore, transfer, logout, deletion, export, recovery, and schema migration are documented and tested
- [ ] Web storage behavior is reviewed separately; sensitive fields are never written to unencrypted browser storage
- [ ] Crash, telemetry, debug, and support paths cannot expose local vault plaintext or keys
- [ ] Physical-device testing covers corruption, low storage, app reinstall, OS upgrade, biometric changes, and key loss
- [ ] Privacy/DPIA and security review approve the exact persisted fields and retention behavior

## Adult eligibility and identity

- [ ] Production design uses full-date/provider evaluation, not birth-year subtraction
- [ ] Signed, expiring, revocable adult credential issued through counsel-approved process
- [ ] Presence, proximity, sexual-intent, match, map, group, and messaging services reject missing/invalid adult credentials
- [ ] Direct API/modified-client tests prove UI bypass cannot admit minors
- [ ] Adult assurance retains no identity document or face image in ordinary application services
- [ ] Appeal, provider outage, ambiguous result, expiry, revocation, and recovery flows tested
- [ ] Passkey/root/device identity enrollment, rotation, device removal, and recovery tested

## Mutual consent and protocol integrity

- [ ] Every profile/like/block/match/location object is cryptographically bound to an authorized root or device key
- [ ] All security-relevant fields are unambiguously framed and signed
- [ ] Client verifies server ticket issuer against configured trusted keys
- [ ] One-sided like or live discovery ticket cannot create a match
- [ ] Bilateral match receipt and reciprocal interest flow tested across two devices
- [ ] Block/unmatch suppresses discovery, proximity, messaging, groups, and location grants

## Intent-driven discovery and profile reveal

- [x] Immediate intent and relational openness are separate in the synthetic engine
- [x] Mutual acceptance on both axes is required before ranking
- [x] Missing user-required boundaries hard-exclude the synthetic candidate
- [x] Ranking uses only intent, boundaries, lifestyle, alignment, and distance
- [x] User-controlled weights normalize to 100 and explanations show component/weight values
- [x] Protected, inferred, popularity, purchase, spending, subscription, and creator-status inputs are rejected
- [x] Synthetic profile visuals remain hidden until a non-visual micro-interaction
- [x] Synthetic interest requires selecting visible shared-ground context
- [x] Intent, boundaries, weights, reveal, and queue history remain session-only and absent from AsyncStorage
- [ ] Real-user intent, boundaries, and ranking preferences use encrypted local custody
- [ ] Candidate retrieval discloses no private exclusion reason and resists enumeration/scraping
- [ ] Modified-client tests prove the server cannot be coerced into prohibited ranking inputs
- [ ] Fairness review covers proxy discrimination, disparate impact, empty queues, accessibility, and recourse
- [ ] Accessibility review verifies non-gesture reveal, screen-reader order, contrast, and reduced-motion behavior
- [ ] Privacy/DPIA review accepts each discovery purpose, field, retention period, and telemetry rule
- [ ] Self-reported health or boundary tags are accurately labeled and never presented as verified medical facts without an approved process
- [ ] No artificial matching delays, fabricated labor, fake scarcity, or misleading compatibility evidence

## Get fk'd proximity

- [ ] Real-user feature flag defaults off
- [ ] Same prompt-before-share default for every gender
- [ ] Maintained React Native/Expo BLE adapter passes dependency and permission review
- [ ] Controlled iOS and Android development builds pass permission/background/battery review
- [ ] Advertisement contains only rotating random ID, epoch, protocol, and non-sensitive capability bits
- [ ] Encounter ID is unlinkable to root/profile/rendezvous/push/marketplace identities
- [ ] No server upload or analytics of raw encounters
- [ ] Haptic cooldown and generic lock-screen notification verified
- [ ] Replay, relay/wormhole, long-range scanner, venue sweep, enumeration, and stalking tests pass
- [ ] Block, emergency privacy, mode-off, and account deletion terminate participation
- [ ] Product copy accurately says detection is best effort
- [ ] Public feature name and store metadata approved

## Match-scoped location

- [ ] Matching alone transmits no location
- [ ] Approximate snapshot, meeting pin, and temporary live location have separate consent
- [ ] Precise sharing requires second confirmation
- [ ] Grants are pairwise, signed, E2EE, purpose/precision labeled, sequenced, expiring, and revocable
- [ ] Active-share indicator and dashboard are always visible while sharing
- [ ] Block/unmatch/emergency privacy/stop sends authenticated revocation and purges display
- [ ] No exact location in logs, push text, analytics, bot scoring, marketplace, or alignment rank
- [ ] Background permission and battery behavior reviewed
- [ ] Replay, stale cache, lost network, compromised relay, and coercion tests pass

## Looking For, identity, filters, and alignment

- [ ] Sexual and relationship intent is private by default and disclosed only to independently compatible adults
- [ ] Group encounters require complete roster and renewed consent after membership change
- [ ] Gender identity, pronouns, orientation, who-I-see, and who-may-see-me are separate optional fields
- [ ] No negative public label or exclusion reason disclosure
- [ ] No race, ethnicity, skin color, disability, height, or protected-trait filter/rank
- [ ] No photograph-derived intelligence, hygiene, sexuality, gender, fitness, grooming, or body-hair inference
- [ ] Questionnaire is versioned, skippable, exportable, deletable, and category-consented
- [ ] Political, orientation, sex-life, and intimacy answers are encrypted locally and absent from logs/ads
- [ ] Score-only raw answers are not transmitted in plaintext
- [ ] Alignment score is local, reciprocal, explainable, and excludes popularity, purchases, spending, and protected traits
- [ ] Counsel-reviewed DPIA and rights/retention process accepted

## Skin Shop

- [ ] Marketplace services, storage, roles, keys, and telemetry isolated from private dating and safety data
- [ ] Asset parser/renderer permits bounded declarative formats only
- [ ] No executable asset code, hidden network calls, arbitrary shaders, or unbounded assets
- [ ] MIME sniff, decode bounds, decompression limits, animation limits, and hostile-asset fuzzing pass
- [ ] Avatar/photo/photo-verified labels cannot be confused
- [ ] Creator terms, moderation, IP/takedown, impersonation, refund, appeal, tax, payout, and fraud processes approved
- [ ] StoreKit/Play Billing receipt validation and entitlement restoration tested
- [ ] Purchases never affect dating reach, rank, messaging, reporting, appeals, or safety access
- [ ] Creator and sponsor roles cannot access profiles, messages, questionnaire, location, proximity, or safety cases

## Bot, spam, scraping, and Sybil resistance

- [ ] App Attest and Play Integrity assertions verified server-side with fresh challenge/request binding
- [ ] Unsupported-device lower-trust path explicit and reviewed
- [ ] Signed requests and persistent replay cache implemented
- [ ] Pairwise/anonymous quotas and adaptive rate limits deployed
- [ ] Mass registration, automated likes, profile scraping, BLE harvesting, fake matches, report brigading, and marketplace fraud red-teamed
- [ ] General bot scoring excludes private messages and sensitive/protected attributes
- [ ] Ordinary human use is not paywalled to prove legitimacy
- [ ] Temporary containment, reason categories, human review, correction, and appeal tested
- [ ] Risk-data retention and deletion verified

## Safety operations

- [ ] In-app report/block/delete paths tested end to end, not local-only
- [ ] Report intake authenticates source, creates a durable case ID, and shows selected evidence before send
- [ ] Evidence vault has separate keys, RBAC, purpose logging, immutable access audit, retention, and legal hold
- [ ] Proximity stalking, location coercion, group-consent abuse, bot/scam, marketplace, NCII, child-safety, and credible-threat queues have playbooks and owners
- [ ] Appeals and emergency escalation tested with synthetic cases
- [ ] Crash and observability systems exclude messages, location, BLE IDs, sexual intent, relational openness, boundaries, discovery weights, questionnaire answers, local-vault plaintext, and secrets

## Delivery and infrastructure

- [ ] JavaScript syntax, active-surface, unit/API/storage/discovery/simulation, dependency-audit, and Expo export checks green on exact beta commit
- [ ] Physical iOS development-build tests green and blocking for the iOS cohort
- [ ] Physical Android development-build tests green and blocking for the Android cohort
- [ ] Device-pair E2E test passes for profile fetch, mutual match, E2EE chat, block, report, and revocation
- [ ] Staging infrastructure is real rather than placeholder modules; TLS, KMS, secrets, database/cache, TURN, observability, backup, and recovery tested
- [ ] Chaos and abuse-capacity tests pass for planned cohort
- [ ] Production preflight authenticates approval signatures, freshness, hashes, commit, and environment binding

Until every applicable item and `docs/governance/release-gates.md` passes with authentic evidence:

```text
JAVASCRIPT_RND_SYNTHETIC_ONLY
REAL_USER_CLOSED_BETA_BLOCKED
PRODUCTION_BLOCKED_HUMAN_APPROVALS_REQUIRED
```
