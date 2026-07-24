# Claude / AI assistant context

Read these before planning or editing:

1. **[MISSION.md](MISSION.md)** — user objective, success criteria, constraints, red zones
2. **[AGENTS.md](AGENTS.md)** — required agent loop, commands, risk classes, non-negotiables

## Quick commands

```bash
make bootstrap    # install / fetch Rust deps
make doctor       # toolchain health
make local-up     # Docker compose (Postgres, Valkey)
make lint         # fmt + clippy
make test         # cargo test --workspace
make deploy-staging          # blocked until staging account VERIFIED
make production-preflight    # validation only; fails without approvals/
```

## Boundaries

- Staging deploy only after human verifies `infra/terraform/environments/staging/ACCOUNT_IDENTITY.md`
- Never deploy production or fabricate legal/security approvals
- Do not weaken age, encryption, block/report, or retention controls

## Architecture pointers

- `docs/architecture/system-overview.md`
- `docs/specs/current-objective.md`
- `schemas/openapi/control-plane.yaml`
