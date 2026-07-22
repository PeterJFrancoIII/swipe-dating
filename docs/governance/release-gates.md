# Release gates

**Status:** BINDING for agents and CI validators  
**Updated:** 2026-07-22

## Deny by default

| Gate | Closed beta | Production |
|---|---|---|
| Legal counsel sign-off (`approvals/`) | required | required |
| Privacy / DPIA acceptance | required | required |
| External security review | scheduled + scope approved | required (≤180 days) |
| Trust & safety staffing + P0 coverage plan | required | required (24/7 only if claimed) |
| Executive launch approval | required | required |
| App-store compliance matrix (dated ≤30 days) | required | required |
| Market row allowed in launch matrix | required | required |
| Infrastructure account attestation | staging verified | production verified |
| Adult-assurance design counsel-reviewed | required | required |
| Network rejects protected operations without valid adult credential | required | required |
| Child-safety contact + public CSAE standards | required | required |
| NCII request channel operational | required | required |
| In-app report/block/delete paths are end-to-end | required | required |
| Authentic approvals bound to reviewed commit and environment | required | required |
| `npm run production:preflight` | must fail without approvals | must pass only with authentic approvals |

## JavaScript-only architecture gate

ADR-0014 and ADR-0019 authorize **synthetic research only**. They are not closed-beta or production approvals.

- [x] Project-authored application, service, domain, simulation, test, validation, and release-tooling code is JavaScript
- [x] Former Rust, Swift, Kotlin, UniFFI, Terraform, Cargo, Make, shell, and legacy integration-test trees are removed from the current Git tree
- [x] Historical implementations remain available through Git history rather than an active archive directory
- [x] Every `apps/rnd-*` and `packages/rnd-*` workspace is discovered dynamically
- [x] Every active `.test.js` and `.test.mjs` file is discovered dynamically
- [x] Checkout-wide repository-language audit is blocking
- [x] Independent committed Git-tree language audit is blocking
- [x] JavaScript consolidation/stale-reference validation is blocking
- [x] Node.js 24 LTS is pinned for CI and local `.nvmrc`
- [x] JavaScript syntax, active-surface, test, simulation, governance, and production-block checks are implemented in Node.js
- [x] Expo SDK 57 web export is blocking in CI
- [x] High/critical dependency-audit threshold is blocking
- [ ] A reviewed dependency lockfile is committed and approved before any real-user build
- [ ] Controlled iOS development build passes on supported physical devices
- [ ] Controlled Android development build passes on supported physical devices
- [ ] Current moderate Expo native-build-tooling advisories are resolved, accepted with an expiry, or superseded before any real-user build
- [ ] Every high-risk JavaScript-facing native dependency has a named owner, dependency review, permission review, and feature flag

Generated native projects and third-party native code may exist beneath Expo/React Native dependencies. Generated `ios/` and `android/` projects are disposable and uncommitted. Project-authored non-JavaScript code requires a superseding exception ADR, named owners, measured necessity, narrow scope, and explicit human architecture approval.

## Local persistence gates

The AsyncStorage-backed implementation is approved only for synthetic R&D and only for the allowlisted fields in ADR-0015.

- [x] Versioned JavaScript schema, migration, sanitization, corruption recovery, reset, and redacted export are tested
- [x] Current store contains only profile presentation, mock cosmetic ownership, an approved non-sensitive last tab, and haptic preference
- [x] Tests prove adult, intent, discovery, questionnaire, decision, match, message, relationship-phase, deeper-answer, block, location, and BLE fields are discarded
- [x] The Matches tab is rejected as persisted last-tab state
- [ ] Real-user profile, preference, match, message, phase, and answer persistence uses an externally reviewed encrypted vault
- [ ] Encryption keys are OS/hardware protected and never stored beside ciphertext
- [ ] Backup, transfer, recovery, logout, deletion, export, corruption, and migration behavior is documented and tested
- [ ] Sensitive local data is excluded from unencrypted browser storage, backups where required, logs, crash reports, and analytics
- [ ] Physical-device security tests cover supported iOS and Android versions
- [ ] Privacy/DPIA and external security review accept the exact field list and retention behavior

AsyncStorage persistence must not be described as encryption, secure storage, hardware-backed custody, or permission to collect real profiles, matches, messages, relationship phases, or deeper answers.

## Intent-driven discovery gates

ADR-0016 authorizes mutual-intent, boundary, ranking, and progressive-reveal behavior for synthetic R&D only.

- [x] Immediate intent and relational openness are distinct
- [x] Candidate eligibility requires mutual acceptance on both intent axes
- [x] User-required boundaries hard-exclude incompatible candidates before scoring
- [x] Score is explainable and uses only intent, boundaries, lifestyle, alignment, and distance
- [x] User-controlled weights normalize to 100 and deterministic tests cover ordering
- [x] Protected, inferred, popularity, purchase, spending, subscription, and creator-status inputs are rejected
- [x] Bio-first reveal requires a non-visual micro-interaction
- [x] Synthetic interest requires visible shared-ground context
- [x] Intent, boundary, weight, reveal, and discovery-history state remains out of AsyncStorage
- [ ] Real-user intent and boundary data uses reviewed encrypted local custody
- [ ] Retrieval and ranking resist modified clients, enumeration, scraping, coercive disclosure, and exclusion-reason leakage
- [ ] Accessibility review confirms equivalent non-gesture paths
- [ ] Privacy review accepts each field, purpose, retention period, and telemetry boundary
- [ ] Fairness review covers proxy discrimination, disparate impact, empty queues, and recourse
- [ ] Self-reported health or safety tags are never represented as verified medical facts without an approved process

The product must not fabricate matching effort, artificial delays, scarcity, or compatibility evidence. Another person must never receive the reason they were excluded by private settings.

## Reciprocal match and conversation gates

ADR-0017 authorizes session-only synthetic lifecycle research. It does not authorize real matching or messaging.

- [x] Unilateral interest remains pending and creates no match
- [x] Synthetic match creation requires an explicit reciprocal fixture
- [x] Fixture reciprocity is labeled synthetic, never authentication or another person's action
- [x] Pass and pending interest can be undone; an established match requires unmatch
- [x] First local message requires the visible shared-ground tag selected during discovery
- [x] Matching sends no automatic message and enables no proximity or location sharing
- [x] Unmatch disables sending; block purges visible content/context and suppresses rediscovery
- [x] Match, message, block, transcript, and Matches-tab state remains out of AsyncStorage
- [x] Purchases and subscriptions do not affect matching, messaging, unmatch, or block
- [ ] Real likes are signed by authorized identities and protected from replay
- [ ] Both devices verify a bilateral match receipt before messaging
- [ ] Reviewed E2EE covers authentication, verification, rotation, device changes, compromise, recovery, and multi-device behavior
- [ ] Transport covers ordering, deduplication, retry, expiry, offline mailbox, deletion, and failure states without plaintext exposure
- [ ] Block/unmatch/account deletion propagates across discovery, proximity, messaging, groups, push, phases, and location
- [ ] Push and lock-screen content reveals no sensitive match, intent, message, phase, or location data by default
- [ ] Spam, harassment, rate limits, reporting, evidence selection, moderation, appeals, and escalation are operational
- [ ] Attachments remain disabled until hostile-media, NCII, child-safety, screenshot-limitation, retention, and evidence review passes
- [ ] Two-device and modified-client tests cover impersonation, replay, duplicate/blocked delivery, stale revocation, device replacement, and recovery
- [ ] Privacy/DPIA, external security, conversation safety, accessibility, and store review approve the exact implementation

A fixture, local transcript, or UI label must never be described as authenticated reciprocity, E2EE, delivered messaging, screenshot protection, moderation, or cross-device revocation.

## Deepen Connection gates

ADR-0018 authorizes bilateral, reversible relationship-phase research for synthetic session state only.

- [x] Every synthetic match begins casual
- [x] One-sided request remains pending and does not change phase
- [x] Two explicit participant opt-ins are required before `deepened`
- [x] Request ordering works in either direction
- [x] Pending request may be withdrawn
- [x] Decline stores no reason
- [x] Either participant may return a deepened match to casual
- [x] Deeper prompts remain locked until mutual acceptance
- [x] Prompt catalog is allowlisted to communication, relationship direction, availability, values, and boundaries
- [x] Answers are bounded, editable, clearable, match-scoped, and session-only
- [x] Return to casual, unmatch, and block clear answers; unmatch/block end the phase
- [x] Ended phases reject further requests
- [x] Phase state, requests, responses, timestamps, and answers remain out of AsyncStorage
- [x] Phase state changes no public profile, discovery intent, rank, reach, marketplace status, or safety access
- [x] No automatic phase inference exists from content, reply speed, time, sexual activity, meetings, location, purchases, or models
- [ ] Real requests are signed, replay-resistant, match-scoped, expiry-aware, and device-authorized
- [ ] Both devices verify a bilateral phase receipt before deeper prompts unlock
- [ ] Return-to-casual and termination use authenticated revocation with deterministic multi-device conflict handling
- [ ] Real phase state and answers use reviewed encrypted custody; sharing is separately consented and E2EE
- [ ] Notifications reveal no phase request or answer content by default
- [ ] Decline, withdrawal, and return to casual create no penalty, retaliation signal, or monetized pressure
- [ ] Prompt catalog receives legal, privacy, safety, accessibility, and consent review
- [ ] Modified-client and two-device tests cover unilateral activation, spoofed acceptance, replay, stale state, concurrent transitions, and termination races
- [ ] Required human reviews approve exact copy and behavior

Deepen Connection is not consent to sex, exclusivity, commitment, media, location, a meeting, health disclosure, public relationship status, or AI analysis.

## Get fk'd proximity gates

- [ ] Adults 18+ only; 18–25 is a design audience, never a minor access path
- [ ] Real-user flag defaults off and can be disabled from Discover
- [ ] Privacy defaults are identical for every gender
- [ ] Default disclosure is **prompt before sharing**
- [ ] Bluetooth advertisement contains only rotating random identifier, epoch, protocol, and non-sensitive capabilities
- [ ] Encounter identifier is unlinkable to profile, root, rendezvous, push, marketplace, message, or phase identities
- [ ] No server upload or analytics of raw encounters
- [ ] Haptic cooldown and generic notification behavior are verified
- [ ] Replay, relay/wormhole, long-range scanning, venue sweep, enumeration, and stalking tests pass
- [ ] Block, emergency privacy, mode-off, and account deletion terminate participation
- [ ] Public naming and store metadata are approved

## Matched-location gates

- [ ] Matching or relationship-phase change alone never shares location
- [ ] Approximate snapshot, meeting pin, and temporary live location have separate consent
- [ ] Precise sharing requires second confirmation
- [ ] Grants are pairwise, signed, E2EE, purpose/precision labeled, sequenced, expiring, and revocable
- [ ] Active-share indicator and dashboard remain visible while sharing
- [ ] Block/unmatch/emergency privacy sends authenticated revocation and purges display
- [ ] No exact location appears in logs, push, analytics, bot scoring, marketplace, ranking, phase prompts, or message metadata
- [ ] Background permission and battery behavior are reviewed
- [ ] Replay, stale cache, lost network, compromised relay, and coercion tests pass

## Identity, preferences, filters, and alignment gates

- [ ] Sexual and relationship intent is private by default and disclosed only to independently compatible adults
- [ ] Group encounters require complete roster and renewed consent after membership change
- [ ] Gender identity, pronouns, orientation, who-I-see, and who-may-see-me are separate optional fields
- [ ] No negative public label or exclusion reason disclosure
- [ ] No race, ethnicity, skin color, disability, height, or protected-trait filter/rank
- [ ] No photograph-derived intelligence, hygiene, sexuality, gender, fitness, grooming, or body-hair inference
- [ ] Questionnaire is versioned, skippable, exportable, deletable, and category-consented
- [ ] Political, orientation, sex-life, relationship, and deeper-phase answers are encrypted locally and absent from logs/ads
- [ ] Alignment is local, reciprocal, explainable, and excludes popularity, purchases, protected traits, messages, and phase state
- [ ] Modified-client review confirms raw private answers are not transmitted in plaintext
- [ ] Counsel-reviewed DPIA and rights/retention process covers sensitive processing

Candidate ranking must not use race, ethnicity, skin color, disability, height, inferred attractiveness, intelligence, hygiene, sexuality, gender, fitness, grooming, body hair, popularity, purchases, spending, subscription status, creator status, message content, reply speed, block history, report history, or relationship phase.

## Skin Shop gates

- [ ] Marketplace services, storage, roles, keys, and telemetry are isolated from private dating and safety data
- [ ] Asset formats are bounded and declarative; no executable asset code, hidden calls, arbitrary shaders, or unbounded assets
- [ ] MIME sniffing, decode bounds, decompression limits, animation limits, and hostile-asset fuzzing pass
- [ ] Avatar/photo/photo-verified labels cannot be confused
- [ ] Creator terms, moderation, IP/takedown, impersonation, refund, appeal, tax, payout, and fraud processes are approved
- [ ] StoreKit/Play Billing validation and entitlement restoration are tested
- [ ] Purchases never affect reach, rank, matching, messaging, phase access, reporting, appeals, or safety
- [ ] Creator and sponsor roles cannot access private dating, location, message, phase, answer, or safety data

## Bot, spam, scraping, and Sybil gates

- [ ] Passkey or equivalent phishing-resistant authentication
- [ ] Device key authorized by root identity; rotation and removal tested
- [ ] App Attest and Play Integrity assertions verified server-side with fresh challenge/request binding
- [ ] Unsupported-device lower-trust path is explicit
- [ ] Adult credential, attestation, and request signatures remain independent controls
- [ ] Adaptive limits, pairwise/anonymous quotas, replay caches, and risk challenges are deployed
- [ ] Registration, automated likes/messages/phase requests, scraping, BLE harvesting, fake matches, and brigading are red-teamed
- [ ] Ordinary human use is not paywalled as an anti-bot mechanism
- [ ] Consequential containment has explanation, human review, correction, and appeal
- [ ] Risk data is pseudonymous, purpose-limited, retention-limited, and excludes private plaintext

## Agent rules

- Autonomous agents may run and publish **synthetic JavaScript R&D** only.
- Agents must not enable real matching, delivery, Bluetooth, location, purchases, payouts, reporting, store submission, vendor contracts, legal processes, or production data without corresponding human gates.
- Agents must not fabricate legal, privacy, security, Trust & Safety, store, finance, or executive approval.
- Agents must not implement minors, asymmetric defaults, unilateral matching/deepening, automatic message/phase/location behavior, deceptive ranking, private-reason disclosure, or purchase-weighted dating behavior.
- Agents must not add project-authored non-JavaScript implementation or build automation without the ADR-0019 exception process.
- Agents must not persist non-allowlisted sensitive fields in unencrypted storage.
- Beta and production remain **BLOCKED** until all applicable evidence is authentic and complete.

## Validator

`npm run production:preflight` and `node scripts/production-preflight.mjs` must exit non-zero when approvals are missing. Before production, the validator must authenticate approval signatures, freshness, hashes, commit binding, environment binding, and required feature evidence; filename prefixes alone are insufficient.
