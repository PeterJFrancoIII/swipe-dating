# Release gates

**Status:** BINDING for agents and CI validators  
**Updated:** 2026-07-21

## Deny by default

The current branch is approved only for **synthetic/internal staging**. No real profile, intimate media, precise location, Bluetooth encounter data, questionnaire answer, purchase, payout, or safety evidence may enter the system until the applicable gates below pass.

## Organization-wide gates

| Gate | Closed beta | Production |
|---|---|---|
| Legal counsel sign-off (`approvals/`) | required | required |
| Privacy / DPIA acceptance | required | required |
| External security review | scheduled + critical findings closed | required and current (≤180 days) |
| Trust & safety staffing + P0 coverage plan | required | required; 24/7 only if staffed and claimed |
| Executive launch approval | required | required |
| App-store compliance matrix | required; dated ≤30 days | required; dated ≤30 days |
| Market row allowed in deny-by-default launch matrix | required | required |
| Infrastructure account attestation | staging verified | production verified |
| Age-assurance design counsel/privacy-reviewed | required | required |
| Child-safety contact + CSAE standards published | required | required |
| NCII request channel and 48-hour-capable workflow operational | required | required |
| Authenticated report, case, evidence, appeal, and audit systems | required | required |
| Current iOS, Android, Rust, policy, and security CI blocking/green | required | required |
| Authentic approvals bound to exact release commit and artifact digests | beta pack | production pack |
| `make production-preflight` | must fail without production approvals | pass only with authentic approvals |

## Adult eligibility and identity gates

Before **any real-user networking**:

- [ ] Exact-date UI check retained; birth-year-only logic prohibited.
- [ ] A signed, expiring, revocable 18+ credential is required by presence, proximity, profile-fetch, like, match, messaging, location, and marketplace-social endpoints.
- [ ] Modified clients without a valid adult credential fail closed.
- [ ] No parental-consent bypass or 16/17-year-old cohort.
- [ ] Passkey or equivalent phishing-resistant account authentication is operational.
- [ ] Device keys are authorized by the user’s root identity and can be revoked.
- [ ] Eligibility and device recovery cannot silently create unlimited identities.
- [ ] Adult-credential theft, replay, expiry, revocation, and cross-device tests pass.
- [ ] Child-safety escalation and legal reporting processes are staffed and counsel-approved.

## Mutual matching and messaging gates

- [x] Staging live tickets do not auto-match from one-sided interest.
- [ ] Every live match requires authenticated reciprocal interest or a cryptographically valid bilateral receipt.
- [ ] Receipt signatures, identity/profile binding, timestamps, nonces, and protocol version are fully validated before state mutation.
- [ ] Block records are validated and suppress messaging, proximity, location, and future discovery.
- [ ] Native relay-only pre-match transport and vetted E2EE messaging are implemented.
- [ ] Device-pair, replay, tamper, block, unmatch, recovery, and multi-device tests pass.

## “Get fk'd” proximity gates

Before enabling real BLE scanning/advertising:

- [x] Main swipe-page on/off control exists.
- [x] Feature starts off and **prompt-before-sharing** is the default for every gender.
- [x] The UI does not implement gender-asymmetric automatic disclosure.
- [ ] BLE advertisements contain only random, unlinkable, rotating encounter IDs and non-sensitive capability bits.
- [ ] No name, profile ID, root/device/rendezvous key, gender, orientation, sexual intent, photo, push token, exact location, or stable identifier appears in BLE payloads.
- [ ] Profile transfer requires a valid adult credential, authorized device, request-bound platform integrity assertion, local compatibility, and user disclosure grant.
- [ ] Blocked/revoked users are suppressed before profile exchange.
- [ ] Encounter-ID and handshake replay tests pass.
- [ ] Venue enumeration, mass scanning, radio correlation, stalking, and modified-client red teams pass with accepted residual risk.
- [ ] Haptic cooldown, lock-screen privacy, emergency stop, and no-persistent-encounter-history tests pass.
- [ ] iOS/Android background behavior and battery budgets pass on representative devices.
- [ ] T&S proximity-abuse category, tooling, SLA, appeal, and staffed escalation are operational.
- [ ] Public feature name and store metadata are explicitly approved.

## Match-location gates

Before collecting or transmitting real location:

- [x] Matching does not automatically share location.
- [x] Staging provides approximate-area, meeting-pin, and 15m/1h/4h consent modes using synthetic coordinates only.
- [ ] Production uses explicit OS permission and a second confirmation for precise modes.
- [ ] Every grant is current-match-only, recipient/device-bound, signed, encrypted, expiring, sequence-numbered, and replay-resistant.
- [ ] Block, unmatch, expiry, manual stop, and emergency privacy revoke access immediately in UI and send signed revocations.
- [ ] Sender can see local, relay-acknowledged, and recipient-acknowledged revocation state.
- [ ] No location plaintext appears in push, telemetry, crash logs, analytics, support search, or ordinary control-plane storage.
- [ ] Approximate-area radius and re-identification review pass.
- [ ] Background indicator, permission, clock-skew, replay/rollback, offline recipient, and battery tests pass.
- [ ] Location coercion/stalking playbook, case category, SLA, and staffed escalation are operational.

## Looking For, gender, and filtering gates

- [x] Sexual modes are restricted to adults and represented as private intent.
- [x] Gender identity, sexual orientation, “Show me,” and profile visibility are separate controls.
- [x] LGBTQ+ is not modeled as a gender.
- [x] No filters/ranking by race, skin color, ethnicity, disability, height, spending, or inferred protected/sensitive traits.
- [ ] Sexual intent is disclosed only after independently compatible opt-in and never appears in public discovery metadata, BLE, push, or analytics.
- [ ] Group encounters require a complete participant list and renewed unanimous consent when membership changes.
- [ ] No sexual-services payment or solicitation path exists.
- [ ] Fairness/proxy review confirms lifestyle/grooming questions do not become covert protected-trait ranking.
- [ ] Sensitive field export/delete/visibility tests pass.

## Alignment questionnaire gates

- [x] Question catalog is versioned and election-specific questions are dated.
- [x] Every question is skippable; importance, dealbreaker, and visibility are distinct.
- [x] Baseline scoring is transparent and local-only.
- [x] Spending, popularity, attractiveness, and protected traits do not affect the score.
- [ ] Answers are encrypted at rest using hardware-backed key references.
- [ ] Political, sexual, relationship, and health categories have explicit, granular consent.
- [ ] No answer, question ID linked to identity, or score explanation leaks to server logs, analytics, crash reports, push, or support tools.
- [ ] Catalog migration, localization, retirement, export, and deletion tests pass.
- [ ] Candidate comparison uses explicit mutual disclosure or an externally reviewed PSI/OPRF design; hidden plaintext fields are not treated as private.
- [ ] DPIA, fairness/proxy, discrimination, and launch-market reviews are accepted.

## Skin Shop gates

- [x] Staging catalog and local creator prototype are clearly non-transactional.
- [x] Purchases/skins do not alter dating reach, ranking, integrity treatment, or safety access.
- [ ] Only bounded declarative image/vector/animation formats are accepted; no scripts, HTML, WebViews, arbitrary shaders, native plugins, network calls, fonts, or archives.
- [ ] Asset type, dimensions, decompressed size, content hash, signature, and parser bounds are validated.
- [ ] Decoder/parser fuzzing and malicious asset corpus pass.
- [ ] StoreKit and Google Play Billing receipts are verified server-side; restore/refund/chargeback flows pass.
- [ ] Creator terms, moderation, copyright, impersonation, prohibited-content, appeal, tax, sanctions, payout-hold, and fraud processes are operational.
- [ ] Marketplace storage, finance, and moderation are isolated from dating profiles, questionnaire answers, location, messages, and safety evidence.
- [ ] Avatar/photo/photo-verified states cannot be confused.

## Bot, spam, and Sybil gates

- [x] `core/anti-abuse` defines adult/passkey/device/attestation gates, request binding, replay cache, velocity limits, progressive friction, containment, and tests.
- [ ] Apple App Attest and Google Play Integrity are verified server-side with one-time challenge, request hash, expiry, and counter/replay validation.
- [ ] Unsupported devices receive documented fallback friction rather than silent full trust or blanket exclusion.
- [ ] Pairwise/pseudonymous quota keys are used; raw phone, email, push token, advertising ID, exact location, and questionnaire answers are forbidden quota keys.
- [ ] Risk inputs exclude message plaintext, private media, exact location, politics/sexual answers, protected traits, and marketplace spending-as-trust.
- [ ] Account-farm, scraper, scripted-like, proximity-scanner, malicious-link, report-brigade, and marketplace-fraud exercises pass.
- [ ] False-positive evaluation covers supported devices, accessibility tools, travel, VPN/carrier churn, and account recovery.
- [ ] Every automated containment rule/model has versioning, monitoring, a kill switch, rollback, reason codes, retention limits, and a human appeal route.
- [ ] Security friction and safety access cannot be bypassed with payment.

## Agent rules

- Autonomous agents may deploy **staging** only after staging account identity is verified.
- Agents may use only synthetic profiles, synthetic coordinates, fake commerce, and non-sensitive fixtures.
- Agents must not enable real BLE, real location collection, real purchases/payouts, real questionnaire exchange, or real-user networking merely because UI exists.
- Agents must not submit to App Store / Play, buy vendors, accept legal terms, handle real intimate/child-safety evidence, make legal reports, or fabricate approvals.
- Beta and production remain **BLOCKED** until all applicable gates are satisfied with authentic artifacts.

## Validators

- `make feature-policy-check` enforces non-negotiable source/governance invariants.
- `make release-readiness` runs policy, lint, unit, and mobile checks available to the environment.
- `make production-preflight` and `scripts/production_preflight.sh` must exit non-zero when authentic, commit-bound approvals are absent.
