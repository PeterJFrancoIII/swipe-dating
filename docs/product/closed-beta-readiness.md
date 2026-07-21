# Closed beta readiness

**Updated:** 2026-07-21  
**Status:** **NOT READY — real-user beta blocked.**  
**Permitted:** synthetic/internal dogfood only.

The new proximity, sexual-intent, location, alignment, marketplace, and anti-bot surfaces materially increase risk. UI completion does not satisfy the underlying network, safety, privacy, commerce, or operational gates.

## Organization and operations

- [ ] Named owners replace every `CHANGE_ME` in `docs/governance/roles-and-owners.md`, CODEOWNERS, policies, and support/security contacts.
- [ ] Legal and privacy drafts are counsel-approved for each beta jurisdiction.
- [ ] DPIA covers proximity, precise/approximate location, sexuality, politics, relationship structure, grooming, age assurance, attestation, anti-abuse, marketplace, and reports.
- [ ] Child-safety contact and public CSAE standards are operational.
- [ ] NCII channel, case tracking, 48-hour-capable workflow, and escalation are operational.
- [ ] T&S coverage plan, P0 on-call, appeals, reviewer training, and capacity limits match the beta cohort.
- [ ] Authenticated reporting, evidence vault, case management, RBAC, immutable audit, retention, and legal hold are tested end-to-end.
- [ ] Staging account identity is verified; no production credentials or customer data are present.
- [ ] External security review is scheduled and critical findings are closed.
- [ ] App-store compliance matrix is dated ≤30 days for the actual distribution channel.
- [ ] Authentic beta approvals are bound to the exact commit and artifacts.

## Adult-only boundary

- [x] Exact-date staging UI rejects users under 18.
- [ ] Network endpoints require an expiring, revocable signed adult credential.
- [ ] Modified clients cannot publish presence, proximity, profiles, sexual intent, likes, matches, messages, or location without the credential.
- [ ] Passkey and authorized-device lifecycle is operational.
- [ ] Eligibility provider DPA, data-flow, retention, appeal, revocation, and accessibility review are accepted.
- [ ] No 16/17-year-old cohort, parental-consent bypass, or mixed minor/adult graph exists.
- [ ] Child-safety tabletop covers age evasion, suspected minors, grooming, sextortion, and CSAM/CSAE.

## Matching and messaging

- [x] Live one-sided likes no longer auto-match in the iOS staging model.
- [ ] Bilateral authenticated receipt validation is enforced before messaging.
- [ ] Profile, like, block, match, presence, and ticket keys are cryptographically bound to authorized identities.
- [ ] Native relay-only transport and vetted E2EE are implemented.
- [ ] Block/unmatch suppresses discovery, proximity, messaging, and location across devices.
- [ ] Device-pair, recovery, replay, tamper, and multi-device tests pass.

## Get fk'd proximity

- [x] Main-page switch and equal prompt-before-sharing default exist.
- [x] No gender-specific automatic disclosure default exists.
- [ ] Real BLE uses unlinkable rotating IDs with no sensitive/stable fields.
- [ ] Adult credential, device authorization, attestation, request binding, and local compatibility are required before disclosure.
- [ ] Block/revocation suppression, cooldown, emergency stop, and lock-screen privacy pass.
- [ ] Replay, venue scan, stalking, correlation, modified-client, and denial-of-service red teams pass.
- [ ] iOS/Android foreground/background reliability and battery budgets pass.
- [ ] Proximity abuse report category and staffed escalation are operational.
- [ ] Public name and store metadata are approved.

## Match location

- [x] Staging map uses synthetic coordinates and explicit grants only.
- [ ] Real OS permission and precise-mode second confirmation are implemented.
- [ ] Grants are recipient/device-bound, signed, encrypted, expiring, sequenced, and replay resistant.
- [ ] Manual stop, expiry, unmatch, block, and emergency revocation are acknowledged by relay/recipient where reachable.
- [ ] No location plaintext appears in push, logs, telemetry, crash reports, analytics, support tools, or ordinary server storage.
- [ ] Approximate radius/re-identification, background indicator, offline, clock-skew, replay, and battery tests pass.
- [ ] Coercion/stalking case handling and emergency guidance are operational.

## Looking For, gender, and preferences

- [x] Gender, orientation, Show me, and visibility are separate.
- [x] Sexual and nonsexual Looking For modes are modeled.
- [x] Protected-trait and spending filters/ranking are explicitly excluded.
- [ ] Sexual intent is disclosed only to independently compatible adults and never in BLE, push, public metadata, or analytics.
- [ ] Group encounter membership requires renewed unanimous consent.
- [ ] No sexual-services transaction path exists.
- [ ] Fairness/proxy and inclusive-language reviews are accepted.
- [ ] Export/delete/visibility behavior is tested for every sensitive field.

## Alignment questionnaire

- [x] Versioned, skippable catalog and local synthetic scoring exist.
- [ ] Answers are encrypted with hardware-backed key references.
- [ ] Political, sexual, health, and relationship categories have granular explicit consent.
- [ ] No answers or identity-linked question telemetry leave the device in baseline.
- [ ] Catalog migration, localization, retirement, export, and deletion pass.
- [ ] Candidate comparison uses explicit disclosure or an externally reviewed private protocol.
- [ ] DPIA, fairness/proxy, and discrimination reviews are accepted.

## Skin Shop

- [x] Non-transactional staging catalog, previews, and creator prototype exist.
- [ ] Safe declarative asset schema and bounded parser/re-encode pipeline are implemented and fuzzed.
- [ ] StoreKit and Google Play Billing validation, restore, refund, chargeback, and entitlement revocation pass.
- [ ] Creator terms, moderation, copyright, impersonation, appeals, tax, sanctions, payout holds, and fraud operations are staffed.
- [ ] Marketplace systems are isolated from dating profiles, answers, location, messages, reports, and evidence.
- [ ] Purchase/skin state is proven incapable of changing ranking, reach, bot trust, moderation, or safety access.

## Bot, spam, and Sybil protection

- [x] Rust policy primitives and unit tests exist.
- [ ] Server-side App Attest and Play Integrity verification is operational.
- [ ] Passkeys, adult credential, device authorization, nonces, request hashes, counters, and replay stores are integrated.
- [ ] Pairwise/pseudonymous quotas and retention limits are implemented.
- [ ] Account-farm, scraper, scripted-like, proximity-scanner, malicious-link, report-brigade, and marketplace-fraud exercises pass.
- [ ] False-positive evaluation includes accessibility tools, unsupported devices, travel, VPN/carrier changes, and recovery.
- [ ] Automated containment has versioning, monitoring, kill switch, rollback, reason codes, and human appeal.
- [ ] Risk inputs exclude private content, exact location, sensitive answers, protected traits, and spending-as-trust.

## Engineering and distribution

- [ ] Rust fmt/clippy/unit/integration/security checks are blocking and green.
- [ ] Current iOS Simulator build is blocking and green in CI.
- [ ] Android assembleDebug is blocking and green; new feature parity status is disclosed.
- [ ] `make feature-policy-check` is blocking and green.
- [ ] Native device tests cover permissions, accessibility, battery, haptics, background behavior, revoke/delete, and emergency privacy.
- [ ] Crash reporting excludes messages, exact location, answers, BLE observations, tokens, and secrets.
- [ ] Builds are signed/reproducible enough for the chosen beta channel and SBOMs are retained.
- [ ] Branch protection requires current checks and independent reviewers for crypto/age/safety/location/commerce changes.

## Release state

Until every applicable item above is complete with authentic evidence:

```text
INTERNAL_SYNTHETIC_DOGFOOD_ALLOWED
REAL_USER_CLOSED_BETA_BLOCKED
PRODUCTION_BLOCKED_HUMAN_APPROVALS_REQUIRED
```
