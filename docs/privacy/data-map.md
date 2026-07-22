# Data Map

**Status:** DRAFT — UNAPPROVED  
**Updated:** 2026-07-22  
**Related:** `docs/privacy/privacy-policy.md`, `docs/privacy/dpia-outline.md`, `docs/governance/decentralization-limits.md`, `docs/product/adult-feature-expansion.md`, `docs/architecture/adr-0015-local-persistence-boundary.md`

| Data class | Primary location | Server processing | Default retention | Notes |
|---|---|---|---|---|
| R&D display name / about / pronouns | Device AsyncStorage in synthetic build only | None | Until local reset/app deletion | Unencrypted allowlist persistence; real-user storage requires encrypted vault review |
| R&D mock cosmetic ownership / selected skin | Device AsyncStorage | None | Until local reset/app deletion | Synthetic entitlement only; no payment or dating-rank effect |
| R&D UI tab / haptic preference | Device AsyncStorage | None | Until local reset/app deletion | Non-secret UI convenience state |
| R&D adult gate / birth date | Memory only | None | Current session | Explicitly excluded from AsyncStorage |
| R&D intent / discovery / questionnaire selections | Memory only | None | Current session | Explicitly excluded from AsyncStorage because sensitive |
| R&D location / proximity selections and identifiers | Memory only | None | Current session or shorter | Explicitly excluded from AsyncStorage |
| Root identity secret | User device only | Never | Until local deletion | Hardware-backed wrap; key reference persisted, not raw key |
| Device keys | User device | Public keys / revocation state may register | Until revoked | Signed by root; independent of marketplace identity |
| Profile text | User device | Relayed encrypted only | No central persistence | Signed capsule; production local store must be encrypted |
| Photos/videos | User device | Relayed encrypted only | No central persistence | Decode/re-encode metadata scrub required |
| Public avatar / skin asset | Public asset store + creator device | Catalog, moderation, delivery | Creator lifecycle + legal/IP needs | Public cosmetic data; isolated from private dating data |
| Skin preview / manifest | Public marketplace | Catalog and moderation | While listed + audit period | Bounded declarative format; no executable code |
| Purchase entitlement | Device + platform validation service | Minimal receipt/entitlement state | Accounting/legal period | Must not affect dating rank or safety access |
| Creator payout / tax record | Finance systems | Payment and compliance | Legal/accounting period | No access to profiles, messages, proximity, location, or reports |
| Looking For modes | User device | Coarse compatibility capability only | User-controlled | Sexual intent private by default; never in public BLE payload |
| Gender identity / pronouns | User device | Only when user chooses profile disclosure | User-controlled | Separate from orientation and discovery preferences |
| Sexual orientation | User device | Local compatibility by default | User-controlled | Sensitive; no ads or general analytics |
| Who-I-see preferences | User device | At most privacy-preserving constraints | User-controlled | Never shown as a negative public label |
| Who-may-see-me policy | User device | Enforced capability/disclosure policy | User-controlled | Same defaults for every gender |
| Grooming/lifestyle preferences | User device | Local ranking only by default | User-controlled | Self-reported; no photo inference |
| Alignment questionnaire answers | User device | No plaintext by default | Until user edits/deletes | Versioned, skippable, category consent |
| Alignment score | User device | None | Recomputed | Explainable; no popularity/purchase/protected-trait weight |
| Precise location | User device | Never for ordinary discovery | Ephemeral memory | May enter match-scoped E2EE envelope only after explicit grant |
| Coarse discovery region | Device + presence | TTL lookup | 60–120s | Jitter + exclusion zones; no substitute when user declines |
| BLE encounter identifier | Nearby devices only | None | Seconds/minutes | Random rotating ID; no profile attributes |
| BLE scan result | User device memory | None | Short encounter window | No operator encounter graph or analytics |
| Proximity disclosure policy | User device | Optional capability bit | User-controlled | Off by default; prompt-before-share default |
| Proximity profile grant | Devices | Opaque relay/capability only | Short TTL | Pairwise, revocable, block-aware |
| Match-area snapshot | Matched devices | E2EE relay only | Short user-selected TTL | Approximate by default; separate consent |
| Meeting pin | Matched devices | E2EE relay only | Until event/expiry/revocation | User-selected place, not inferred tracking |
| Live location grant | Matched devices | E2EE relay only | 15m/1h/4h or explicit stop | Precise requires second confirmation; visible active-share indicator |
| Location revocation | Devices + minimal relay state | Pairwise deny / tombstone | Short safety window | Block/unmatch/emergency privacy triggers revocation |
| Swipe dislike | User device | Never | User-configurable | Local dedupe |
| Like | Devices | Relayed; optional sealed | Short TTL if mailbox | Replay-protected; cannot itself prove reciprocal match |
| Match receipt | Matched devices | Optional opaque metadata | Minimal | Bilateral signatures and identity binding required |
| Group encounter membership | Participant devices | Opaque capability routing | Session TTL | Complete participant list + renewed consent on changes |
| Message | Matched devices | Relayed / optional ciphertext | TTL/quota | E2EE |
| Push token | Push broker | Opaque wake routing | Rotated; deleted on sign-out | No dating, sexual, location, or questionnaire content |
| Adult eligibility | Device + eligibility service | Adult boolean / age band / revocation | Expiry-bound | No ID/face retention in app; required before presence/proximity |
| Device/app attestation | Device + anti-abuse | Integrity verdict / bound assertion | Short/medium TTL | Not proof of unique human or adult status |
| Bot-risk state | Anti-abuse service | Pseudonymous signals / quotas | Purpose-limited, reviewed TTL | No private message plaintext or protected-trait profiling |
| Replay nonce / quota token | Device + relevant service | Dedup / rate enforcement | Short TTL | Pairwise/anonymous where possible |
| Pairwise block | Devices; minimal server token | Pseudonymous deny | Until unblock/deletion | Suppresses discovery, proximity, group, location, and messages |
| Report metadata | Safety system | Triage | Policy/law-defined | Segregated |
| Report evidence | Safety vault | Human review | Case-specific | Deliberate exception; separate keys/RBAC/audit |
| Marketplace report | Marketplace moderation | Asset/creator review | Policy/legal period | Separated from dating safety evidence where possible |
| Telemetry | Device + observability | Aggregate/technical | 7–30 days | No content, exact location, questionnaire answers, BLE IDs, or sexual intent |

## Processing boundaries

1. **R&D local persistence plane:** unencrypted AsyncStorage allowlist for presentation/cosmetic/UI fields only; no real users or sensitive fields.
2. **Dating data plane:** device-local encrypted custody and E2EE peer transfer for real profiles, messages, private intent, questionnaire answers, and match-scoped location.
3. **Ephemeral control plane:** presence, rendezvous, signaling, rate limits, revocations, and opaque capabilities only.
4. **Marketplace plane:** public cosmetic assets, catalog, purchase validation, and creator accounting; no access to private dating or safety data.
5. **Safety plane:** deliberate report metadata/evidence exception with separate keys, access policy, logging, and retention.
6. **Anti-abuse plane:** pseudonymous integrity/risk controls; no ordinary private content or protected-trait ranking.

## Prohibited joins

The operator must not join marketplace purchases, creator status, bot-risk data, questionnaire answers, sexual intent, orientation, precise location, BLE encounters, or safety cases to influence dating rank, advertising, pricing, or access to safety features.

The R&D AsyncStorage record must not be expanded by convenience to include adult status, identity credentials, intents, discovery preferences, questionnaire answers, likes, matches, messages, blocks, reports, location, proximity observations, device identifiers, cryptographic material, or payment data.
