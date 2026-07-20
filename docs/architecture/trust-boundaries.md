# Trust Boundaries

| # | Boundary | Assets | Encryption / controls | Failure behavior |
|---|---|---|---|---|
| 1 | Device secure storage | root secret, device keys, local DB | OS keystore / Secure Enclave / Keystore wrap | Lock device; wipe on authenticated delete |
| 2 | Rust core ↔ native UI | validated value objects | UniFFI; no raw key export | Reject invalid; structured errors |
| 3 | Media codec boundary | images/video variants | size/dimension/time limits; EXIF strip | Fail closed on oversize/malformed |
| 4 | Public network / ISP | packets, timing | TLS to control plane; E2EE peer payloads | Timeout; degraded offline UX |
| 5 | STUN/TURN | IPs, timing metadata | Short-lived creds; relay-first | Document metadata exposure |
| 6 | Rendezvous/signaling | presence leases, tickets | Signed short TTL; no profile bodies | Expire leases; refuse unsigned |
| 7 | Push providers | device tokens | Opaque wake hints only | Rotate/delete on sign-out |
| 8 | Sealed mailbox | ciphertext envelopes | E2EE; TTL/quota | Disabled by default |
| 9 | Age / attestation providers | eligibility/risk tokens | Boolean/age-band only; no ID retention | Fail closed on uncertainty |
| 10 | Safety report API / vault | selected evidence | KMS, isolated account, audit | Human review required |
| 11 | Safety console | case metadata | SSO, least privilege, audit | Deny by default |
| 12 | CI/CD & signing | artifacts, secrets | OIDC, pinned actions, protected envs | No prod secrets on PR |
| 13 | Cloud operator / staff | infra metadata | Separation of duties | No content access by default |
| 14 | Personal availability node | user's own capsule | Paired device key; no root secret | Revocable; post-MVP |
