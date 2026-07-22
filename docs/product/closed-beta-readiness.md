# Closed beta readiness

**Updated:** 2026-07-22  
**Status:** **NOT READY — JAVASCRIPT SYNTHETIC R&D ONLY**

The JavaScript implementation is a governed research scaffold. It is not permission to invite real users, collect real profiles or intimate preferences, activate matching, messaging, relationship-phase delivery, Bluetooth proximity, coordinates, payments, or real safety cases.

## Organizational gates

- [ ] Legal and privacy drafts are counsel-approved for every beta jurisdiction
- [ ] Named owners replace every `CHANGE_ME` in `docs/governance/roles-and-owners.md`
- [ ] Trust & Safety staffing and P0 coverage are funded for cohort size
- [ ] Child-safety, NCII, support, privacy, security, conversation-abuse, relationship-transition, proximity, location, fairness, and creator/IP contacts are operational
- [ ] Match/messaging protocol, relationship-transition consent, conversation-safety, local-custody, and infrastructure owners are assigned
- [ ] External security review scope is approved and scheduled
- [ ] Staging account identity is verified; no production credentials exist in clients
- [ ] Authentic beta approvals are bound to the reviewed commit and environment
- [ ] Store compliance matrix is re-verified within 30 days of distribution

## JavaScript-only delivery baseline

- [x] Root npm workspaces use exact direct dependency pins
- [ ] Reviewed dependency lockfile is committed and approved
- [x] Node.js 24 LTS CI
- [x] Project-authored application, service, domain, simulation, test, validation, and release-tooling code is JavaScript
- [x] Former Rust, Swift, Kotlin, UniFFI, Terraform, Cargo, Make, shell, and Rust integration-test implementation is removed from the current Git tree
- [x] Removed prototypes remain accessible through Git history
- [x] Active app/package workspaces are discovered dynamically
- [x] JavaScript tests are discovered dynamically
- [x] Repository-wide checkout and Git-tree JavaScript-only audits pass
- [x] JavaScript consolidation/stale-reference validation passes
- [x] Node syntax and active-surface checks pass
- [x] Domain, crypto, API, storage, discovery, conversation, relationship-phase, and simulation tests pass
- [x] Governance validation and production preflight are JavaScript
- [x] Expo SDK 57 dependency compatibility check and web export pass
- [x] High/critical dependency-audit threshold passes
- [ ] Moderate Expo native-build-tooling advisories are resolved or formally time-bounded
- [ ] Controlled iOS development build passes on supported physical devices
- [ ] Controlled Android development build passes on supported physical devices
- [ ] Every native dependency has ownership, permission review, feature flagging, and a supported upgrade path

Generated Expo native projects must remain disposable and uncommitted. A project-authored non-JavaScript exception requires a superseding ADR and explicit human architecture approval.

## Local persistence and device custody

- [x] Synthetic state uses a versioned allowlist schema with migration and corruption recovery
- [x] AsyncStorage saves only presentation fields, mock cosmetics, an approved last tab, and haptic preference
- [x] Tests prove sensitive discovery, conversation, relationship-phase, location, and identity fields are omitted
- [x] Matches is rejected as persisted last-tab state
- [x] User can inspect the redacted record and clear it
- [ ] Real-user profile, preference, match, message, phase, and answer data uses an externally reviewed encrypted vault
- [ ] Keys are OS/hardware protected and not co-located with ciphertext
- [ ] Backup, restore, transfer, logout, deletion, export, recovery, and migration are documented and tested
- [ ] Browser, crash, telemetry, debug, and support paths cannot expose sensitive plaintext or keys
- [ ] Physical-device tests cover corruption, low storage, reinstall, OS upgrade, biometric changes, and key loss
- [ ] Privacy/DPIA and security review approve exact fields and retention

## Adult eligibility and identity

- [ ] Production eligibility uses full-date/provider evaluation rather than year subtraction
- [ ] Signed, expiring, revocable adult credential is issued through a counsel-approved process
- [ ] Presence, proximity, intent, match, group, messaging, phase, and location services reject invalid credentials
- [ ] Direct API and modified-client tests prove UI bypass cannot admit minors
- [ ] Ordinary application services retain no identity document or face image
- [ ] Appeal, provider outage, ambiguity, expiry, revocation, and recovery paths are tested
- [ ] Root/device enrollment, rotation, removal, and recovery are tested

## Mutual consent and protocol integrity

- [ ] Every profile, like, block, match, message, phase request/receipt, and location object is bound to an authorized identity
- [ ] Security-relevant fields are unambiguously framed and signed
- [ ] Trusted issuer verification is configured and tested
- [ ] One-sided interest cannot create a match
- [ ] Bilateral match receipt is tested across two devices
- [ ] One-sided phase request cannot activate Deepen Connection
- [ ] Block/unmatch suppresses discovery, proximity, messaging, phases, groups, push, and location

## Reciprocal match and conversation lifecycle

- [x] Unilateral synthetic interest remains pending
- [x] Explicit reciprocal fixture creates one synthetic match
- [x] Fixture reciprocity is labeled synthetic
- [x] Pass and pending interest can be undone; a match requires unmatch
- [x] First local message requires selected visible shared-ground context
- [x] Matching sends no automatic message or location/proximity disclosure
- [x] Session chat supports local and synthetic replies
- [x] Unmatch stops sending; block purges content/context and suppresses rediscovery
- [x] Decisions, match state, transcripts, blocks, and Matches-tab state remain outside AsyncStorage
- [x] Purchases and subscriptions do not affect matching or messaging
- [ ] Real likes are signed and replay-protected
- [ ] Both devices verify a bilateral match receipt before chat creation
- [ ] Reviewed E2EE covers identity, verification, rotation, compromise, recovery, and multi-device behavior
- [ ] Ciphertext relay implements ordering, deduplication, retry, expiry, quotas, offline behavior, and deletion
- [ ] Notifications hide message, intent, location, starter, phase, and sensitive match information by default
- [ ] Cross-service revocation survives stale, offline, replayed, and modified clients
- [ ] Spam, harassment, unsolicited sexual content, automation, scams, coercion, and brigading tests pass
- [ ] Reporting displays selected evidence, creates a durable case ID, and supports status/appeal communication
- [ ] Attachments remain disabled until hostile-media, NCII, child-safety, screenshot, retention, and evidence review passes
- [ ] Accessibility and physical two-device end-to-end tests pass
- [ ] Required privacy, legal, security, safety, store, and Trust & Safety approvals are bound to the beta commit

## Deepen Connection lifecycle

- [x] Every synthetic match begins casual
- [x] One-sided request remains pending
- [x] Two explicit opt-ins are required
- [x] Either request order works
- [x] Pending request can be withdrawn
- [x] Decline stores no reason
- [x] Either participant can return to casual
- [x] Deeper prompts remain unavailable before mutual acceptance
- [x] Prompt catalog is allowlisted and answers are bounded, editable, clearable, and session-only
- [x] Return to casual, unmatch, and block clear answers
- [x] Unmatch/block end the phase; ended phases reject transitions
- [x] Phase state and answers remain outside AsyncStorage
- [x] No content, time, sexual activity, meeting, location, purchase, or model changes phase automatically
- [x] Phase changes no public profile, rank, reach, marketplace status, or safety access
- [x] UI states that Deepen Connection is not consent to sex, exclusivity, media, location, a meeting, health disclosure, or public status
- [ ] Real requests and responses are signed, replay-resistant, expiry-aware, and match-scoped
- [ ] Both devices verify a bilateral phase receipt
- [ ] Revert, unmatch, and block propagate authenticated phase revocation
- [ ] Real phase data uses encrypted custody and separately consented E2EE sharing
- [ ] Multi-device conflict and notification privacy rules are tested
- [ ] Decline, withdrawal, and revert create no penalty or monetized pressure
- [ ] Prompt catalog receives legal, privacy, safety, accessibility, and consent review
- [ ] Modified-client and two-device transition abuse tests pass

## Intent-driven discovery

- [x] Immediate intent and relational openness are separate
- [x] Mutual acceptance is required before ranking
- [x] Required-boundary mismatches hard-exclude candidates
- [x] Ranking uses allowed explainable components and normalized user weights
- [x] Protected, inferred, popularity, purchase, spending, subscription, and creator-status inputs are rejected
- [x] Synthetic visuals require non-visual interaction
- [x] Interest requires visible shared-ground context
- [x] Discovery state remains outside AsyncStorage
- [ ] Real discovery settings use encrypted custody
- [ ] Retrieval resists enumeration, scraping, modified clients, and exclusion leakage
- [ ] Fairness, accessibility, privacy, and DPIA reviews pass
- [ ] Self-reported health/boundary tags are never represented as medically verified
- [ ] No artificial matching delay, fabricated labor, scarcity, or misleading evidence

## Proximity and match-scoped location

- [ ] Real proximity defaults off with identical privacy defaults for every gender
- [ ] JavaScript-facing BLE dependency passes ownership, permission, background, battery, and physical-device review
- [ ] Advertisements contain only unlinkable rotating identifiers and non-sensitive capabilities
- [ ] No operator upload or analytics of raw encounters
- [ ] Replay, relay/wormhole, scanner, venue-sweep, enumeration, stalking, and cooldown tests pass
- [ ] Block, emergency privacy, mode-off, and account deletion terminate participation
- [ ] Matching or relationship-phase change alone shares no location
- [ ] Approximate snapshot, meeting pin, and live location have separate consent
- [ ] Precise location requires second confirmation
- [ ] Grants are signed, E2EE, labeled, sequenced, expiring, visible, and revocable
- [ ] Block/unmatch/emergency privacy revokes and purges location
- [ ] Exact location is absent from logs, notifications, analytics, ranking, marketplace, phase prompts, and messages
- [ ] Replay, stale cache, lost network, compromised relay, and coercion tests pass

## Preferences, alignment, marketplace, and anti-abuse

- [ ] Sensitive intent and identity fields are private and separately modeled
- [ ] Group encounters require complete roster and renewed consent after changes
- [ ] No protected-trait filtering/ranking or photo-derived sensitive inference
- [ ] Questionnaire is versioned, skippable, exportable, deletable, and category-consented
- [ ] Sensitive answers are encrypted and absent from logs/ads
- [ ] Alignment is local, reciprocal, explainable, and excludes popularity, purchases, messages, and phases
- [ ] Marketplace systems are isolated from private dating and safety data
- [ ] Assets are bounded, declarative, validated, fuzzed, and non-executable
- [ ] Creator, moderation, IP, refund, tax, payout, billing, and fraud processes are approved
- [ ] Purchases never affect reach, rank, matching, messaging, phases, reports, appeals, or safety
- [ ] Passkeys, device authorization, attestation, replay caches, quotas, rate limits, and lower-trust paths are deployed
- [ ] Registration, automated likes/messages/phase requests, scraping, BLE harvesting, fake matches, reports, and marketplace fraud are red-teamed
- [ ] Risk decisions have explanation, human review, correction, appeal, retention, and deletion

## Safety operations and infrastructure

- [ ] Report/block/delete paths work end-to-end rather than as local stubs
- [ ] Evidence vault has separate keys, RBAC, purpose logging, immutable access audit, retention, and legal hold
- [ ] Abuse queues have playbooks and owners
- [ ] Appeals and emergency escalation are tested with synthetic cases
- [ ] Observability excludes private content, exact location, encounter IDs, sensitive intent, phase answers, vault plaintext, and secrets
- [ ] Physical iOS and Android development-build checks are blocking for their cohorts
- [ ] Device-pair E2E covers profile fetch, match, E2EE chat, phase transitions, block, report, and revocation
- [ ] Staging infrastructure is real, attested, isolated, encrypted, observable, backed up, and recoverable
- [ ] Chaos and abuse-capacity tests pass
- [ ] Production preflight authenticates signatures, freshness, hashes, commit, and environment binding

Until every applicable item and `docs/governance/release-gates.md` passes with authentic evidence:

```text
JAVASCRIPT_RND_SYNTHETIC_ONLY
REAL_USER_CLOSED_BETA_BLOCKED
PRODUCTION_BLOCKED_HUMAN_APPROVALS_REQUIRED
```
