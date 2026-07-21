# LocalFirst Dating (Staging)

Adults-only, local-first, privacy-preserving swipe dating platform.

Profiles, media, likes, matches, and messages live primarily on user devices and move peer-to-peer over end-to-end encrypted channels. A minimal ephemeral control plane handles presence, rendezvous, anti-abuse, and safety reporting metadata.

> **STAGING / INTERNAL BUILD** — Not production. Temporary branding. Legal entity, support contacts, and launch market are `CHANGE_ME` / `BLOCKED_PENDING_APPROVAL`.  
> **Closed beta and production:** blocked until `docs/governance/release-gates.md` and authentic `approvals/` are satisfied.

## Quick start

```bash
make doctor
make bootstrap
make test-unit
make local-up   # requires Docker daemon
```

iOS shell: `apps/ios/` — **UniFFI linked** on Simulator (`make ios-build`). Discover can publish signed presence to local rendezvous (`make local-services-up`).

## Architecture (summary)

- **Mode A (default):** Strict zero-store — discoverable only while online.
- **Mode B (flagged off):** Sealed mailbox for optional encrypted envelopes.
- **Mode C (post-MVP):** Personal availability node.

See `docs/architecture/system-overview.md` and ADRs under `docs/architecture/`.  
Decentralization limits: `docs/governance/decentralization-limits.md`.

## Safety & governance

Blocking, reporting, age assurance foundations, and encrypted messaging are free and non-paywalled. Safety tools reduce risk; they cannot guarantee identity, prevent screenshots, or make in-person meetings safe.

| Doc | Role |
|---|---|
| `MISSION.md` | Current objective |
| `policies/community-rules.md` | Behavior rules (DRAFT) |
| `docs/governance/` | Release gates, store/NCII/child-safety baselines |
| `docs/audits/2026-07-20-mission-readiness-review.md` | Latest readiness verdict |
| `docs/product/closed-beta-readiness.md` | Beta checklist |
| `AGENTS.md` | Agent rules |
| `docs/operations/github-sync.md` | Local ↔ GitHub sync (`make sync`) |
| `.cursor/commands/deploy-decentralized-dating-app.md` | Deploy runbook |

## License

License deliberately unset. See `docs/legal/license-decision-required.md`.
