# Data Map

**Status:** DRAFT — UNAPPROVED  
**Updated:** 2026-07-21  
**Related:** `docs/privacy/privacy-policy.md`, `docs/privacy/dpia-outline.md`, `docs/governance/decentralization-limits.md`

| Data class | Primary location | Server processing | Default retention | Notes |
|---|---|---|---|---|
| Root identity secret | User device only | Never | Until local deletion | Hardware-backed wrap required; persist key reference, not exportable secret |
| Device keys | User device | Authorized public keys may register | Until revoked | Signed by root; device removal supported |
| Passkey credential | Platform authenticator | Public credential + challenge verification | Account lifetime / deletion | Phishing-resistant account auth |
| Adult eligibility credential | Device + eligibility service | Minimal signed adult/expiry/revocation proof | Expiry-bound | No ID/face retention by app; required at network boundary |
| Platform attestation | Device + anti-abuse | App/device integrity verdict + request binding | Short TTL | App Attest / Play Integrity; not unique-human proof |
| Profile text | User device | Relayed encrypted only | No central persistence | Signed capsule |
| Photos/videos | User device | Relayed encrypted only | No central persistence | Complete bounded decode/re-encode; metadata stripped |
| Gender identity | User device | Only user-authorized profile/discovery disclosure | User-controlled | Optional; not an automatic privacy default |
| Sexual orientation | User device | Only user-authorized profile/discovery disclosure | User-controlled | Optional sensitive data |
| Looking For modes | User device | Compatible-recipient disclosure only | User-controlled / optional TTL | Sexual modes adult-only; not public broadcast |
| Discovery preferences | User device | Coarse constraints only if required | Local | No protected-trait ranking |
| Questionnaire answers | User device | No plaintext in baseline | Until user clears/deletes | Encrypted; political/sexual answers separately optional |
| Compatibility score | User device | Never required centrally | Ephemeral/local | Transparent local ranking; no spending/popularity |
| Precise discovery location | User device only | Never | Ephemeral memory | Coarse region before network |
| Coarse discovery region | Device + presence | TTL lookup | 60–120s | Jitter + exclusion zones; true opt-out |
| BLE encounter identifier | Nearby devices | No central processing | Seconds/minutes | Random, rotating, unlinkable; no identity/profile fields |
| BLE encounter observation | User device | Never in baseline | Session/cooldown only | No persistent encounter graph |
| Proximity disclosure policy | User device | Optional coarse capability | Until changed | Prompt-before-sharing default for every gender |
| Proximity profile capability | Devices | Opaque relay metadata only | Minutes | Recipient/purpose/expiry bound; replay protected |
| Swipe dislike | User device | Never | User-configurable | Local dedupe |
| Like | Devices | Relayed; optional sealed | Short TTL if mailbox | Signed, replay-protected; one-sided like is not a match |
| Match receipt | Matched devices | Optional opaque metadata | Minimal | Bilateral signatures and identity binding required |
| Message | Matched devices | Relayed / optional ciphertext | TTL/quota | Vetted E2EE protocol required |
| Match-area snapshot | Matched devices | E2EE relay only | Default 24h | Approximate; explicit match-time grant |
| Meeting pin | Matched devices | E2EE relay only | Default 4h | User-selected; explicit precise confirmation |
| Temporary live location | Matched devices | E2EE relay only | 15m / 1h / 4h | Active indicator, expiry, sequence, revocation |
| Location revocation | Devices + relay acknowledgement | Opaque signed state | Short audit window | No location plaintext |
| Skin/Avatar asset | Public asset store/CDN | Public moderation and delivery | Catalog lifecycle | Declarative, non-executable, content-addressed |
| Creator public profile | Marketplace | Catalog/moderation | Creator lifecycle | Isolated from private dating identity/safety cases |
| Purchase receipt | Device + billing validator | Receipt validation | Financial/legal requirement | No dating reach effect |
| Marketplace entitlement | Device + minimal entitlement service | Signed entitlement | Purchase/refund lifecycle | No sensitive dating data |
| Creator payout/fraud state | Marketplace finance | Restricted processing | Financial/legal requirement | Segregated from dating and safety data |
| Push token | Push broker | Opaque wake routing | Rotated; deleted on sign-out | No dating/location/intent content |
| Pairwise block | Devices; minimal server token | Pseudonymous deny | Until unblock/deletion | Suppresses messaging/proximity/location |
| Anti-abuse quota key | Device + control plane | Pairwise/pseudonymous counters | Short rolling windows | Never raw phone/email/push/ad ID |
| Bot risk signals | Control plane | Purpose-limited scoring | Short raw / bounded aggregate | No plaintext, exact location, sensitive answers, protected traits, or spending trust |
| Request challenge nonce | Device + service | Replay validation | Challenge TTL | Bound to action and request hash |
| Report metadata | Safety system | Triage | Policy/law-defined | Segregated |
| Report evidence | Safety vault | Human review | Case-specific | Deliberate exception; no automatic gallery/location/BLE upload |
| Telemetry | Device + observability | Aggregate/technical | 7–30 days | No content, exact location, questionnaire answers, encounter history, or secrets |

## Custody boundary

Ordinary dating data remains local-first. The Skin Shop is an intentionally public, separately governed asset catalog and may use central storage/CDN. Safety evidence, billing records, and narrowly scoped anti-abuse state are deliberate exceptions with independent access, retention, and audit controls.

## Open decisions before beta

- adult-eligibility vendor and credential format;
- passkey recovery and multi-device authorization;
- unlinkable BLE encounter credential protocol;
- location envelope/revocation acknowledgement protocol;
- private questionnaire comparison protocol;
- marketplace billing, creator, copyright, and payout design;
- anti-abuse retention, appeals, and false-positive thresholds;
- launch-market privacy/DPIA acceptance.
