# Key rotation runbook (draft)

**Status: UNAPPROVED**

## Scope

- Device signing keys (client-generated; server stores public keys only)
- TLS certificates (ALB / CloudFront)
- Database credentials (Secrets Manager)
- TURN credentials (short-lived; see `services/turn-credentials`)
- Push broker credentials (APNs/FCM keys)

## Rotation cadence (targets — human approval required)

| Secret class | Target cadence | Owner |
|--------------|----------------|-------|
| TLS public certs | Auto via ACM | Infra |
| RDS password | 90d | Infra |
| TURN shared secret | 30d | Infra |
| APNs/FCM keys | On compromise or annual | Mobile ops |

## Procedure (generic)

1. Issue new secret in staging first.
2. Dual-read window if supported.
3. Revoke old secret; verify `make smoke-staging`.
4. Document in change log — no secrets in git.

## Fail-closed

Never weaken rotation to unblock deploy. Production rotation requires `make production-preflight` approvals.
