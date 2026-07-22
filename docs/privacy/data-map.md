# Data Map

**Status:** DRAFT — UNAPPROVED  
**Updated:** 2026-07-22  
**Related:** `docs/privacy/privacy-policy.md`, `docs/privacy/dpia-outline.md`, `docs/governance/decentralization-limits.md`, `docs/product/adult-feature-expansion.md`, `docs/architecture/adr-0015-local-persistence-boundary.md`, `docs/architecture/adr-0016-intent-driven-discovery.md`, `docs/architecture/adr-0017-reciprocal-match-conversations.md`

| Data class | Primary location | Server processing | Default retention | Notes |
|---|---|---|---|---|
| R&D display name / about / pronouns | Device AsyncStorage in synthetic build only | None | Until local reset/app deletion | Unencrypted allowlist persistence; real-user storage requires encrypted vault review |
| R&D mock cosmetic ownership / selected skin | Device AsyncStorage | None | Until local reset/app deletion | Synthetic entitlement only; no payment or dating-rank effect |
| R&D approved UI tab / haptic preference | Device AsyncStorage | None | Until local reset/app deletion | Matches is not an approved persisted tab |
| R&D adult gate / birth date | Memory only | None | Current session | Explicitly excluded from AsyncStorage |
| R&D immediate intent / relational openness | Memory only | None | Current session | Sensitive discovery state; explicitly excluded from AsyncStorage |
| R&D required boundaries | Memory only | None | Current session | Self-reported hard exclusions; never disclosed as rejection reasons |
| R&D discovery weights | Memory only | None | Current session | User-controlled weights for intent, boundaries, lifestyle, alignment, and distance |
| R&D reveal stage / dismissed queue / starter selection | Memory only | None | Current session | No centralized profile-view or exclusion history |
| R&D pass / pending-interest decision | Memory only | None | Current session | Undoable local decision; unilateral interest creates no match |
| R&D reciprocal fixture flag | Static synthetic fixture | None | Build fixture lifecycle | Test input only; not another person's action or authentication proof |
| R&D match snapshot / status | Memory only | None | Current session | Synthetic candidate ID/name/age band and active/unmatched/blocked status |
| R&D opening shared-ground tag | Memory only | None | Until block or session end | Required context for first local message; purged on block |
| R&D message transcript | Memory only | None | Current session; purged on block | No encryption, network delivery, push, read receipts, or attachments |
| R&D unmatch / block state | Memory only | None | Current session | Stops sending; block purges content and suppresses rediscovery |
| R&D Matches tab | Memory only | None | Current session | Not written as last tab because it can reveal relationship activity |
| R&D questionnaire selections | Memory only | None | Current session | Explicitly excluded from AsyncStorage because sensitive |
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
| Immediate-intent compatibility | User device | At most privacy-preserving compatibility capability | Short-lived / recomputed | Mutual eligibility control; raw value not needed by marketplace or ads |
| Relational-openness compatibility | User device | At most privacy-preserving compatibility capability | Short-lived / recomputed | Separate from immediate intent; no public negative label |
| Required boundary set | User device | Prefer local comparison; otherwise privacy-reviewed capability only | User-controlled | Hard exclusion; self-reported; not a safety guarantee |
| Discovery weight vector | User device | None by default | User-controlled | Explainable local ordering; no protected, inferred, popularity, or purchase inputs |
| Candidate score explanation | User device | None | Recomputed | Shows component and user weight; never exposes another person's private exclusions |
| Progressive reveal state | User device | None | Short session | Reveals media after non-visual interaction; no operator view-history graph |
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
| Swipe dislike | User device | Never | User-configurable | Local dedupe; never disclosed to the other person |
| Like | Devices | Relayed; optional sealed | Short TTL if mailbox | Signed and replay-protected; cannot itself prove reciprocal match |
| Match receipt | Matched devices | Optional opaque metadata | Minimal | Bilateral signatures and authorized-device binding required |
| Opening shared-ground context | Matched devices | E2EE message metadata or body only | Conversation policy | Not consent to sex, media, location, or an offline meeting |
| Message | Matched devices | Relayed ciphertext only | User/policy-controlled | E2EE; ordinary services must not receive plaintext |
| Message delivery metadata | Device + relay | Minimal routing, retry, sequence, expiry | Short reviewed TTL | No message body, sexual intent, or exact location in push/telemetry |
| Unmatch / block revocation | Devices + relevant services | Pairwise deny / revocation | Until unblock/deletion or reviewed safety window | Suppresses discovery, proximity, messaging, groups, push, and location |
| Group encounter membership | Participant devices | Opaque capability routing | Session TTL | Complete participant list + renewed consent on changes |
| Push token | Push broker | Opaque wake routing | Rotated; deleted on sign-out | No dating, sexual, location, questionnaire, or message content |
| Adult eligibility | Device + eligibility service | Adult boolean / age band / revocation | Expiry-bound | No ID/face retention in app; required before presence/proximity/matching/messaging |
| Device/app attestation | Device + anti-abuse | Integrity verdict / bound assertion | Short/medium TTL | Not proof of unique human or adult status |
| Bot-risk state | Anti-abuse service | Pseudonymous signals / quotas | Purpose-limited, reviewed TTL | No private message plaintext or protected-trait profiling |
| Replay nonce / quota token | Device + relevant service | Dedup / rate enforcement | Short TTL | Pairwise/anonymous where possible |
| Report metadata | Safety system | Triage | Policy/law-defined | Segregated from ordinary messaging and discovery |
| Report evidence | Safety vault | Human review | Case-specific | Deliberate exception; separate keys/RBAC/audit and user-selected evidence |
| Marketplace report | Marketplace moderation | Asset/creator review | Policy/legal period | Separated from dating safety evidence where possible |
| Telemetry | Device + observability | Aggregate/technical | 7–30 days | No message content, exact location, questionnaire answers, BLE IDs, sexual intent, boundaries, discovery weights, starter tags, match graph, or block reasons |

## Processing boundaries

1. **R&D local persistence plane:** unencrypted AsyncStorage allowlist for presentation/cosmetic/approved-UI fields only; no real users or sensitive fields.
2. **R&D discovery memory plane:** immediate intent, relational openness, boundaries, weights, reveal, and queue state remain session-only.
3. **R&D conversation memory plane:** decisions, pending interests, reciprocal fixtures, matches, starter context, messages, unmatch, block, and Matches-tab state remain session-only.
4. **Dating data plane:** device-local encrypted custody and E2EE peer transfer for real profiles, messages, private intent, questionnaire answers, match state, and match-scoped location.
5. **Ephemeral control plane:** presence, rendezvous, signaling, rate limits, revocations, opaque match capabilities, and ciphertext routing only.
6. **Marketplace plane:** public cosmetic assets, catalog, purchase validation, and creator accounting; no access to private dating or safety data.
7. **Safety plane:** deliberate report metadata/evidence exception with separate keys, access policy, logging, and retention.
8. **Anti-abuse plane:** pseudonymous integrity/risk controls; no ordinary private content or protected-trait ranking.

## Prohibited joins

The operator must not join marketplace purchases, creator status, bot-risk data, questionnaire answers, sexual intent, relational openness, boundaries, orientation, messages, match graph, precise location, BLE encounters, or safety cases to influence advertising, pricing, or access to safety features.

Candidate ranking must not use race, ethnicity, skin color, disability, height, inferred attractiveness, intelligence, hygiene, sexuality, gender, fitness, grooming, body hair, popularity, purchases, spending, subscription status, creator status, message content, reply speed, block history, or report history.

The R&D AsyncStorage record must not be expanded by convenience to include adult status, identity credentials, intents, relational openness, boundaries, discovery weights/history, questionnaire answers, decisions, likes, pending interests, reciprocal flags, matches, starter tags, messages, transcripts, unmatch/block history, the Matches tab, reports, location, proximity observations, device identifiers, cryptographic material, or payment data.
