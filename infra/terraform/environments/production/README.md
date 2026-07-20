# Production reference IaC — DO NOT auto-apply by autonomous agents.

**Status: REFERENCE ONLY / UNVERIFIED**

Production infrastructure must never be applied without:

- Human updates to `ACCOUNT_IDENTITY.md` with production account attestation
- All artifacts in `approvals/` per `approvals/README.md`
- Successful `make production-preflight` (validation only)

Use `terraform plan` for review; apply requires explicit human operator.
