# Data Protection Impact Assessment (DPIA draft)

**Status: UNAPPROVED**

## Processing overview

| Activity | Data | Legal basis (TBD) | Risk |
|----------|------|-------------------|------|
| Discovery | Coarse region, device handles | Contract / legitimate interest | Metadata inference |
| Messaging | E2EE payloads (not on server) | Contract | Client-side loss |
| Age assurance | Eligibility signal only | Legal obligation | False positive/negative |
| Safety reports | Vault evidence | Legitimate interest / legal | Sensitive content handling |

## Necessity and proportionality

Control plane minimized per ADR-0006. Presence in Valkey TTL only.

## Mitigations (planned)

- Fail-closed age gate
- Block/report without paywall
- Evidence vault isolation (S3 module)
- No operator browsing of ordinary chats

## Sign-off required

- Data Protection Officer / privacy counsel: _pending_
- Security: _pending_

---

*DPIA scaffold for staging preparation — not a completed assessment.*
