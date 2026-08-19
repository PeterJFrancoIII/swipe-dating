# Staging deploy runbook

**Status: UNAPPROVED — engineering draft**

## Preconditions

- [ ] `infra/terraform/environments/staging/ACCOUNT_IDENTITY.md` status **VERIFIED** (human)
- [ ] Terraform installed; AWS credentials for staging account only
- [ ] `make lint` and `make test-unit` pass
- [ ] Migrations reviewed (`migrations/0001_init_control_plane.sql`)

## Deploy steps

```bash
make doctor
make lint
make test-unit
make infra-validate
make deploy-staging    # blocked if account UNVERIFIED
make smoke-staging     # requires STAGING_BASE_URL
```

## Post-deploy

- Record URL in `.cursor/state/decentralized-dating-app-progress.json` (human/agent handoff)
- Run safety console smoke (empty cases OK on first deploy)
- Do **not** point production DNS here

## Rollback

Human operator: `terraform apply` with previous known-good state or destroy/recreate per change policy.

## Blockers (current scaffold)

- Account identity UNVERIFIED
- Terraform may be missing on host
- ECS task definitions not fully wired in modules
