# Threat Model — Adult Feature Expansion

**Status:** STAGING BASELINE — not a production security review  
**Updated:** 2026-07-21

## Assets

- root/device/passkey key material;
- adult-eligibility credentials and revocation state;
- profiles, media, messages, likes, matches, and blocks;
- gender, orientation, Looking For modes, grooming/lifestyle preferences, and questionnaire answers;
- coarse discovery tokens;
- BLE encounter identifiers and observations;
- match-area, meeting-pin, and live-location grants;
- Skin Shop assets, creator identity, receipts, entitlements, payout/fraud state;
- report evidence, push tokens, signing keys, infrastructure credentials, and approval artifacts.

## Adversaries

- curious or compromised operator;
- malicious peer, stalker, coercive partner, or organized harasser;
- venue scanner collecting BLE identifiers;
- modified client or radio replay attacker;
- profile scraper and bot farm;
- romance scammer or malicious-link sender;
- report brigade;
- marketplace plagiarist, malware author, payment fraudster, or compromised creator;
- compromised relay, push provider, billing provider, or age-assurance provider;
- insider with console, vault, finance, or infrastructure access;
- network observer;
- nation-state (documented; full resistance beyond MVP).

## Security invariants

1. No minor may obtain a network credential permitting dating, proximity, sexual intent, location, matching, or messaging.
2. Gender never changes a privacy default.
3. A BLE advertisement contains no stable identity or sensitive profile field.
4. A one-sided interest signal cannot open messaging.
5. Matching never shares location; every location grant is explicit, recipient-bound, expiring, and revocable.
6. Sensitive questionnaire answers remain local in the baseline and never enter logs/ads.
7. Marketplace spending never changes ranking, reach, integrity treatment, or safety access.
8. Block suppresses messaging, proximity disclosure, and location access.
9. Safety reports remain possible when an account is contained.
10. Agents cannot create approvals, deploy production, submit stores, or make real legal reports.

## Abuse cases and controls

| Abuse | Primary mitigation | Required test/control |
|---|---|---|
| Underage UI bypass | Signed adult credential required by network endpoints | Modified-client tests; revoked/expired/missing credential rejects |
| Birth-year boundary error | Exact date calculation | 17-turning-18 test vectors |
| Adult credential sharing | Device/passkey binding + revocation + risk signals | Cross-device replay and theft tests |
| App/device spoofing | App Attest / Play Integrity + request hash/nonce | Server verification and replay tests |
| Account/Sybil farm | Passkey, device authorization, privacy-preserving quotas, progressive friction | Farm simulation and false-positive review |
| Scripted swiping/scraping | Ticket quotas, capability binding, local capsule transfer, velocity risk | Load and scraper adversarial tests |
| One-sided fake match | Bilateral signed receipt + state validation | Missing/invalid/foreign-key receipt tests |
| BLE tracking | Random rotating identifiers independent of root identity | Linkability analysis and multi-venue test |
| BLE replay | Expiring challenge, nonce cache, platform assertion | Captured advertisement/handshake replay tests |
| Venue enumeration | No counts/direction/ranging; bounded alerts and handshakes | Mass scanner red team |
| Gender-based exposure | Same prompt default for all genders | Policy/UI regression test |
| Proximity stalking | Block suppression, cooldown, emergency stop, T&S category | Blocked-user and repeated encounter tests |
| Exact location stalking | Approximate default; explicit precise confirmation | Precision floor and coercion tests |
| Location replay/rollback | Sequence number, expiry, device/recipient binding | Reordered/replayed envelope tests |
| Location after block | Signed revocation + immediate local hide + acknowledgement | Block/unmatch/emergency end-to-end tests |
| Push leaks location/sex intent | Opaque wake hints only | Static/dynamic notification audit |
| Sensitive answer leak | Encrypted local storage; no answer telemetry | Log/crash/support search tests |
| Modified client reads score-only answers | PSI/OPRF or explicit reveal protocol before production | External cryptographic review |
| Protected-trait proxy ranking | Feature inventory + fairness review + no image inference | Model/data review and regression tests |
| Romance scam / malicious URL | Link reputation, fan-out risk, report/block, human review | Scam campaign simulation |
| Report brigading | Pairwise quotas, graph signals, reporter reputation bounded by appeal | Coordinated-report tests |
| Marketplace executable payload | Declarative formats, bounded parser, no network/code | Fuzzing and sandbox tests |
| Marketplace art theft/impersonation | Creator terms, copyright/identity workflows | Takedown and appeal tabletop |
| Purchase fraud/chargeback | Platform receipt validation, payout holds, isolated finance | Receipt replay/refund tests |
| Spending buys reach/trust | Architectural separation and invariant tests | Ranking and risk audit |
| Malicious media | Complete bounded decode/re-encode, hash, type/bit-depth checks | Decoder fuzz + decompression bomb corpus |
| Operator voyeurism | No ordinary plaintext custody; isolated evidence exception | Data-flow review + access tests |
| Safety vault insider | Separate account/KMS/RBAC, dual control, immutable audit | Quarterly access review + break-glass test |
| Approval forgery | Signed, dated, commit-bound artifacts verified by CI/human | Invalid/freshness/hash tests |
| Supply chain | Pin lockfiles, SBOM, audit/deny, signed builds | Blocking CI and dependency review |

## Bot-defense privacy boundary

Allowed risk inputs are technical/purpose-limited: action velocity, account/device fan-out, request replay, attestation result, credential state, impossible coarse-region change, malicious-link verdict, blocked-user contact, report coordination, and marketplace payment fraud.

Forbidden risk inputs:

- message plaintext;
- photos/intimate media;
- exact location;
- political/sexual questionnaire answers;
- race, ethnicity, skin color, disability, gender, orientation, religion;
- spending as a trust shortcut;
- inferred attractiveness, intelligence, hygiene, fitness, or grooming.

## Residual risks

- A malicious recipient can retain screenshots, plaintext, or a received location.
- Determined radio observers can correlate timing and physical movement even with rotating IDs.
- App stores, push providers, billing providers, relays, and network operators retain some metadata.
- Strong anti-bot controls can exclude legitimate users on unsupported or compromised devices.
- An adults-only credential reduces but cannot eliminate identity fraud.
- Local-first architecture limits operator visibility and therefore some proactive abuse detection.

## Production blockers

- external protocol/cryptographic review;
- network adult credential and revocation;
- passkey recovery and authorized-device lifecycle;
- App Attest / Play Integrity server integration;
- native relay-only WebRTC + vetted E2EE;
- BLE transport red team;
- E2EE location + acknowledged revocation;
- hardware-backed local key adapters;
- real report/evidence/case systems and staffed T&S;
- marketplace security, moderation, billing, copyright, and finance operations;
- privacy/DPIA, counsel, store, launch-market, and executive approvals.
