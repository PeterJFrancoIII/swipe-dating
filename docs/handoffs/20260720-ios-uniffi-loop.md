# Agent loop handoff — iOS UniFFI link

**Updated:** 2026-07-20  
**Branch:** `feat/local-first-dating-platform`

## Done this loop

1. Built `libdating_uniffi_bindings.a` for `aarch64-apple-ios-sim` (`scripts/build-ios-uniffi.sh`).
2. Linked into SwipeDating via `DATING_UNIFFI_LINKED` + `Generated/` + `Native/lib`.
3. Wired Discover like/pass/block/staging-match through `AuditedMatchStore`.
4. Identity creation uses UniFFI `generateIdentity()` (public summary only).
5. Added `ControlPlaneClient` health probes (8080–8085) in Diagnostics.
6. App builds and launches on iPhone 17 Simulator.
7. Production preflight still fails closed (correct).

## Next loops

1. Keep `make smoke-local` services up and verify Diagnostics probe matrix from Simulator.
2. Publish signed presence lease + pull discovery tickets (replace synthetic deck when online).
3. Device-pair E2EE messaging path (still blocked on WebRTC/transport).
4. Do **not** open production or fabricate approvals.

## Verify

```bash
make ios-build
cargo test -p dating-uniffi-bindings
make production-preflight   # must fail
make smoke-local
```

## Loop continuation — ticket deck

- Discover prefers **live tickets** from `/v1/discovery` (opaque Peer + hex id)
- Own rendezvous id filtered out of the deck
- Synthetic seed only when no other peers (offline / empty region)
- Presence auto-refresh ~45s while Available
- Seed peers for dogfood: `cargo run -p dating-uniffi-bindings --bin print-staging-lease` → PUT presence
