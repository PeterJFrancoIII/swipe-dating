# Local smoke (Docker-free)

Run the control-plane services directly on localhost without Docker Compose. Use this path when the Docker daemon is unavailable or you only need a quick service health check.

## Prerequisites

- Rust toolchain (`rustup`, `cargo`) — run `make bootstrap` if needed
- `curl` for health checks

## Quick start

```bash
make smoke-local
```

Or run the script directly:

```bash
./scripts/local-smoke.sh
```

The script builds the workspace, starts six services in the background, waits for `/healthz` on each, curls a discovery probe on rendezvous, then tears down all processes on exit (including `Ctrl+C`).

## Ports

| Service            | Default port | Env override |
|--------------------|-------------:|--------------|
| rendezvous         | 8080         | `PORT` or `BIND` |
| push-broker        | 8081         | `PORT` or `BIND` |
| turn-credentials   | 8082         | `PORT` or `BIND` |
| sealed-mailbox     | 8083         | `PORT` or `BIND` |
| report-ingest      | 8084         | `PORT` or `BIND` |
| safety-console-api | 8085         | `PORT` or `BIND` |

Each binary reads `BIND` (full address, e.g. `127.0.0.1:9090`) or `PORT` (binds `127.0.0.1:$PORT`). If neither is set, the default port above is used.

## Docker Compose fallback

`make local-up` starts Postgres and Valkey via Docker Compose when the daemon is running. If Docker is installed but the daemon is down, `local-up` prints a notice and runs `make smoke-local` instead.

For full integration tests that need Postgres/Valkey, start Docker and run `make local-up` before `make test-integration`.

## Evidence

Smoke run output is captured under `docs/execution/evidence/local-smoke-YYYYMMDD.txt` during agent verification runs.
