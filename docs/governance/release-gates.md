# Release gates

**Status:** BINDING for agents and CI validators  
**Updated:** 2026-07-21

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
| Infra account attestation (staging/prod) | staging verified | prod verified |
| Adult-assurance design counsel-reviewed | required | required |
| Network rejects presence/proximity without valid adult credential | required | required |
| Child-safety contact + public CSAE standards | required | required |
| NCII request channel operational | required | required |
| In-app report/block/delete paths are end-to-end, not local stubs | required | required |
| Authentic approvals bound to reviewed commit and environment | required | required |
| `make production-preflight` | must fail without approvals | must pass only with authentic approvals |

## JavaScript R&D architecture gate

The JavaScript reset authorizes **synthetic research only**. It is not a closed-beta or production approval.

- [x] Active app, service, domain, simulation, and test source is JavaScript under `apps/rnd-*` and `packages/rnd-*`
- [x] Node.js 24 LTS is pinned for CI and local `.nvmrc`
- [ ] A reviewed dependency lockfile is committed before any real-user build
- [x] Expo SDK 57 web export is blocking in CI
- [x] Node syntax, active-surface, unit/API, simulation, and high/critical dependency-audit thresholds are blocking
- [ ] Legacy Rust/Swift/Kotlin code is archived or removed after parity review
- [ ] Custom Expo development builds are verified on controlled iOS and Android devices
- [ ] No manually maintained generated native project becomes a second source of truth
- [ ] High-risk native adapters have named owners, dependency review, permission review, and feature flags
- [ ] The ten current moderate Expo native-build-tooling advisories are resolved, accepted with expiry, or superseded by reviewed upstream releases before any real-user build

Generated native files and third-party native modules may exist below Expo/React Native, but newly authored product behavior remains JavaScript unless a superseding ADR documents a measured exception.

## Get fk'd proximity gates

`Get fk'd` remains unavailable to real users until all items below are evidenced.

- [ ] Adults 18+ only; 18–25 is a design audience, never a minor access path
- [ ] Feature is off by default and can be disabled from the main Discover page
- [ ] Identical privacy defaults for every gender; no gender-based automatic disclosure
- [ ] Default disclosure is **prompt before sharing**
- [ ] Bluetooth advertisements contain only random rotating encounter identifiers and protocol version
- [ ] Encounter identifiers are unlinkable to root/profile/rendezvous/push/marketplace identities
- [ ] Replay, relay, long-range scanning, venue harvesting, enumeration, and stalking tests pass
- [ ] Block, unmatch, emergency privacy, and account deletion suppress future encounters
- [ ] Haptic and notification cooldown prevents repeated buzzing and lock-screen sexual disclosure
- [ ] Background behavior, permissions, battery impact, and best-effort limitations are accurately disclosed
- [ ] No encounter graph, raw BLE history, or proximity analytics retained by the operator
- [ ] Store-review naming/metadata decision is approved; internal codename does not evade review

## Matched-location gates

- [ ] Matching alone never shares location
- [ ] Separate consent for approximate match-area snapshot, meeting pin, and temporary live location
- [ ] Default is off; precise location requires a second explicit confirmation
- [ ] Match-scoped E2EE grant includes purpose, precision, issue time, expiry, sequence, and revocation
- [ ] Active grants are visible in one dashboard and can be revoked immediately
- [ ] Block/unmatch/emergency privacy terminates active grants and hides cached display
- [ ] No location appears in push text, telemetry, advertising, marketplace, or questionnaire ranking
- [ ] No indefinite background tracking or historical movement trail
- [ ] Location coercion, replay, stale-cache, and compromised-relay tests pass

## Looking For, gender, filters, and questionnaire gates

- [ ] `Looking For` modes are adult-only, private by default, and disclosed only to independently compatible users
- [ ] Group encounters require complete-participant consent and renewed consent when membership changes
- [ ] Gender identity, pronouns, orientation, who-I-see, and who-may-see-me are separate optional fields
- [ ] Candidate preferences use neutral language and never reveal why another person was excluded
- [ ] No filter/rank by race, ethnicity, skin color, disability, height, or inferred protected traits
- [ ] No photo-derived inference of intelligence, hygiene, sexuality, gender, fitness, grooming, or body hair
- [ ] Questionnaire is versioned, skippable, exportable, deletable, and separately consented by sensitive category
- [ ] Political, sex-life, orientation, and relationship answers remain encrypted on device by default
- [ ] Alignment score is local, explainable, reciprocal, and excludes popularity, purchases, spending, and protected traits
- [ ] Modified-client review confirms “score only” answers are not sent in plaintext
- [ ] Counsel-reviewed DPIA and rights/retention process cover sensitive questionnaire processing

## Skin Shop gates

- [ ] Marketplace data plane is isolated from private dating, safety, location, and questionnaire data
- [ ] Only bounded declarative assets; no executable JavaScript inside assets, arbitrary shaders, executable plugins, or hidden network calls
- [ ] MIME/type/size/decompression/animation limits and hostile-asset fuzzing pass
- [ ] Avatars clearly distinguish avatar, photo, and photo-verified profiles
- [ ] Creator terms, content rules, copyright process, moderation, refunds, tax/payout, and fraud controls approved
- [ ] Apple/Google billing and entitlement restoration validated where required
- [ ] Purchases never affect dating rank, profile reach, messaging, reporting, appeals, or safety access
- [ ] Creator and sponsor access to dating data is technically prevented

## Bot, spam, scraping, and Sybil gates

- [ ] Passkey or equivalent phishing-resistant account authentication
- [ ] Device key authorized by root identity; rotation and device removal tested
- [ ] App Attest and Play Integrity (or approved equivalents) verified server-side with nonce/request binding
- [ ] Unsupported devices receive an explicit lower-trust path, not silent full trust
- [ ] Adult credential, attestation, and request signatures are independent controls
- [ ] Adaptive rate limits, anonymous/pairwise quotas, replay caches, and risk challenges implemented
- [ ] Mass registration, automated liking, profile scraping, BLE harvesting, fake matches, and report brigading red-teamed
- [ ] Ordinary human use is not paywalled as an anti-bot mechanism
- [ ] Temporary containment is explained; consequential action has human review and appeal
- [ ] Risk data is pseudonymous, purpose-limited, retention-limited, and excluded from advertising

## Agent rules

- Autonomous agents may run and publish **synthetic JavaScript R&D** and may deploy staging only after staging account identity is verified.
- Autonomous agents must not enable real Bluetooth scanning, location sharing, purchases, creator payouts, real-user reporting, App Store / Play submission, vendor contracts, legal processes, or production data without the corresponding human gate.
- Agents must not author or simulate legal, privacy, security, T&S, mobile-store, finance, or executive approval.
- Agents must not implement minors, gender-asymmetric disclosure, covert tracking, or purchase-weighted dating rank.
- Agents must not add new active Rust, Swift, Kotlin, Java, Python, Dart, Objective-C, or TypeScript product code without a superseding ADR and explicit human architecture approval.
- Beta and production remain **BLOCKED** until every applicable table and checklist item is satisfied with authentic evidence.

## Validator

`make production-preflight` and `scripts/production_preflight.sh` must exit non-zero when approvals are missing. Before production, the validator must also authenticate artifact signatures, freshness, commit binding, environment binding, and required feature evidence; filename prefixes alone are insufficient.
