# Phase 7–17 scaffold notes

**Updated:** 2026-07-20  
**Branch:** `feat/local-first-dating-platform`  
**Status:** STAGING SCAFFOLD — not production-ready

## What was created

| Area | Artifacts |
|------|-----------|
| Build | `Makefile` with all required targets |
| Local infra | `infra/local/compose.yaml` (Postgres, Valkey, optional MinIO) |
| Terraform | `infra/terraform/modules/*`, `environments/staging`, `environments/production` |
| Migrations | `migrations/0001_init_control_plane.sql` |
| API contract | `schemas/openapi/control-plane.yaml` |
| iOS | `apps/ios/` SwiftPM skeleton + VERIFY.md |
| Android | `apps/android/` Gradle Kotlin DSL skeleton + VERIFY.md |
| Safety console | `web/safety-console/` static stub |
| Docs | `docs/safety/`, `docs/operations/`, `docs/legal/` (drafts UNAPPROVED) |
| CI | `.github/workflows/ci.yml` |
| Scripts | `scripts/production_preflight.sh`, `command_integrity_check.sh`, `verify_staging_account.sh` |
| AI context | `CLAUDE.md` |

## Known blockers (honest)

### Java / Android

- Host `make doctor` reports Java **MISSING** — Android Gradle cannot run locally.
- `gradle-wrapper.jar` not committed — `./gradlew` fails until `gradle wrapper` is run.
- Android SDK not verified on this host.

### Docker

- Docker daemon reported **not running** at preflight — `make local-up` fails until daemon starts.
- Compose file is valid; not exercised in this session without Docker.

### Terraform / cloud

- Terraform **not installed** on host — `make infra-validate` / `infra-plan-staging` stub or fail.
- Staging `ACCOUNT_IDENTITY.md` is **UNVERIFIED** — `make deploy-staging` refuses via `verify_staging_account.sh`.
- No staging cloud credentials verified; ECS/RDS modules are placeholders (subnet groups only / placeholder endpoints).
- Production environment is reference-only; autonomous apply forbidden.

### Approvals / production gate

- `approvals/` contains only `README.md` — no signed artifacts.
- `make production-preflight` exits non-zero with `PRODUCTION_BLOCKED_HUMAN_APPROVALS_REQUIRED` (expected).

### Mobile / UniFFI

- UniFFI bindings not generated — iOS/Android are UI shells only.
- Xcode / Swift build not verified in this scaffold session.

### Services integration

- Rendezvous service commented out in compose — build from `services/rendezvous` when crate is ready (owned by other agent).
- OpenAPI contract not yet implemented in running service.

## Verification commands (run when tooling available)

```bash
chmod +x scripts/*.sh
make doctor
bash scripts/command_integrity_check.sh
make production-preflight   # expect exit 1 + PRODUCTION_BLOCKED_HUMAN_APPROVALS_REQUIRED
bash scripts/verify_staging_account.sh   # expect STAGING_BLOCKED (UNVERIFIED)
make lint && make test-unit
```

## Next human actions

1. Verify staging cloud account → update `ACCOUNT_IDENTITY.md` to VERIFIED
2. Install Docker, start daemon, `make local-up`
3. Install Terraform; configure staging backend; complete ECS/RDS modules
4. Install Java 17 + Android SDK; generate Gradle wrapper jar
5. Legal/T&S review of all UNAPPROVED docs before any public surface
