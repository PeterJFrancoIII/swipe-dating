# Data Map

**Status:** DRAFT — UNAPPROVED  
**Updated:** 2026-07-20  
**Related:** `docs/privacy/privacy-policy.md`, `docs/privacy/dpia-outline.md`, `docs/governance/decentralization-limits.md`

| Data class | Primary location | Server processing | Default retention | Notes |
|---|---|---|---|---|
| Root identity secret | User device only | Never | Until local deletion | Hardware-backed wrap |
| Device keys | User device | Public keys may register | Until revoked | Signed by root |
| Profile text | User device | Relayed encrypted only | No central persistence | Signed capsule |
| Photos/videos | User device | Relayed encrypted only | No central persistence | EXIF stripped |
| Preferences | User device | Coarse constraints only | Presence TTL | Avoid durable orientation storage |
| Precise location | User device only | Never | Ephemeral memory | Coarse region before network |
| Coarse discovery region | Device + presence | TTL lookup | 60–120s | Jitter + exclusion zones |
| Swipe dislike | User device | Never | User-configurable | Local dedupe |
| Like | Devices | Relayed; optional sealed | Short TTL if mailbox | Replay-protected |
| Match receipt | Matched devices | Optional opaque metadata | Minimal | Bilateral signatures |
| Message | Matched devices | Relayed / optional ciphertext | TTL/quota | E2EE |
| Push token | Push broker | Opaque wake routing | Rotated; deleted on sign-out | No dating content |
| Age eligibility | Device + eligibility svc | Boolean/age-band | Expiry-bound | No ID/face retention |
| Attestation | Device + anti-abuse | Risk token | Short/medium TTL | Not sole truth |
| Pairwise block | Devices; minimal server token | Pseudonymous deny | Until unblock/deletion | No message content |
| Report metadata | Safety system | Triage | Policy/law-defined | Segregated |
| Report evidence | Safety vault | Human review | Case-specific | Deliberate exception |
| Telemetry | Device + observability | Aggregate/technical | 7–30 days | No content/exact location |
