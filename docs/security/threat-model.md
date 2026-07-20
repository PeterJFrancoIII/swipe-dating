# Threat Model (Staging Baseline)

## Assets

Identity secrets, profile/media, messages, coarse location tokens, report evidence, push tokens, signing keys, infra credentials.

## Adversaries

Curious operator, malicious peer, network observer, compromised relay, abusive mass-registration bot, insider with console access, nation-state (out of MVP scope beyond honest documentation).

## Abuse cases → mitigations

| Abuse | Mitigation | Test/control |
|---|---|---|
| Underage access | Fail-closed age eligibility | Age gate unit + e2e |
| Exact location stalk | Coarse cells, jitter, exclusion zones, no proximity alerts | Location property tests |
| IP disclosure pre-match | Relay-only ICE default | Transport policy tests |
| Profile scrape | Bounded randomized candidates; rate limits | Rate-limit integration |
| Romance scam / spam | Attestation + adaptive limits; report/block | Abuse model tests |
| NCII / CSAM | Explicit report bundles; human-owned legal path | Safety playbooks (draft) |
| Operator voyeurism | No plaintext custody; vault isolation | Data-map + access reviews |
| Key theft via backup | Explicit recovery kit; hardware wrap | Storage lifecycle tests |
| Replay likes/messages | Nonces + replay cache interfaces | Protocol replay tests |
| Malicious media | Decoder bounds; type allowlists | Fuzz + media tests |
| Shadow ban opacity | Documented limits; appeal path | Policy + console flows |
| Supply chain | Pin lockfiles; deny; SBOM; CI scans | `make security` |

Unresolved production risks remain blockers in Phase 20.
