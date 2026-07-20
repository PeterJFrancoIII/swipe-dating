# LocalFirst Dating (Staging)

Adults-only, local-first, privacy-preserving swipe dating platform.

Profiles, media, likes, matches, and messages live primarily on user devices and move peer-to-peer over end-to-end encrypted channels. A minimal ephemeral control plane handles presence, rendezvous, anti-abuse, and safety reporting metadata.

> **STAGING / INTERNAL BUILD** — Not production. Temporary branding. Legal entity, support contacts, and launch market are `CHANGE_ME` / `BLOCKED_PENDING_APPROVAL`.

## Quick start

```bash
make doctor
make bootstrap
make test-unit
make local-up   # requires Docker daemon
```

## Architecture (summary)

- **Mode A (default):** Strict zero-store — discoverable only while online.
- **Mode B (flagged off):** Sealed mailbox for optional encrypted envelopes.
- **Mode C (post-MVP):** Personal availability node.

See `docs/architecture/system-overview.md` and ADRs under `docs/architecture/`.

## Safety

Blocking, reporting, age assurance foundations, and encrypted messaging are free and non-paywalled. Safety tools reduce risk; they cannot guarantee identity, prevent screenshots, or make in-person meetings safe.

## Agent / contributor entry points

- `MISSION.md` — current objective
- `AGENTS.md` — agent rules
- `.cursor/commands/deploy-decentralized-dating-app.md` — full deploy runbook
- `docs/execution/` — preflight, progress, final reports

## License

License deliberately unset. See `docs/legal/license-decision-required.md`.
