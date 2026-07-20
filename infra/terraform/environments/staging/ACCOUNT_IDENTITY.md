# Staging cloud account identity

**Status: UNVERIFIED**

This file must be updated by a human operator before `make deploy-staging` or `make infra-plan-staging` may proceed.

## Required verification

1. Confirm AWS (or chosen cloud) account ID matches the intended **staging** account only.
2. Confirm no production customer data or production DNS in this account.
3. Record verifier name, date (UTC), and account identifier below.
4. Change `status:` from `UNVERIFIED` to `VERIFIED`.

## Record (human-owned)

```yaml
status: UNVERIFIED
cloud_provider: aws
account_id: REPLACE_ME
verified_by: null
verified_at_utc: null
notes: >
  Autonomous agents must not mark this VERIFIED. Staging apply is blocked until
  a human updates this file and approvals/README requirements are understood.
```

## Autonomous agent rule

If `status` is `UNVERIFIED`, `scripts/verify_staging_account.sh` exits non-zero and
`make deploy-staging` refuses to apply infrastructure.
