# Handoff: protocol identity binding

Date: 2026-07-21
Branch/worktree: `agent/protocol-identity-binding`
Current objective: reject signed protocol objects whose public key does not own the claimed profile identity.

## Completed

- Bound `LikeEnvelope.sender_profile_id` to `signer_public_key`.
- Bound both `MatchReceipt` party ids to their public keys and rejected same-party receipts.
- Bound `BlockRecord.blocker_profile_id` to `signer_public_key`.
- Bound `ProfileCapsule.profile_id`, `root_public_key`, and `signer_public_key`.
- Preserved the protocol version, version-1 wire schema, and UniFFI error surface.

## Changed files

- `core/protocol/src/validate.rs`
- `core/protocol/tests/identity_binding.rs`
- `docs/handoffs/20260721-protocol-identity-binding.md`

## Verification run

- `cargo test -p dating-protocol --test identity_binding` — PASS (6 tests)
- `cargo test -p dating-protocol` — PASS
- `cargo fmt --all -- --check` — PASS
- `cargo clippy -p dating-protocol --all-targets -- -D warnings` — PASS
- `cargo test -p dating-uniffi-bindings --lib` — PASS (12 tests)
- `cargo test --workspace` — PASS
- `make production-preflight` — expected block: `PRODUCTION_BLOCKED_HUMAN_APPROVALS_REQUIRED`

## Decisions made

- Identity binding remains centralized in `dating-protocol`.
- Identity-binding failures reuse `InvalidSignature`, avoiding a new public or UniFFI error variant.
- No signed payload bytes, wire fields, dependencies, or protocol versions changed.
- User directive: keep the project as simple as possible and preserve only necessary, high-value additions.

## Risks

- Presence leases still do not cryptographically expose enough information to recompute the rotating rendezvous id.
- Fetch tickets still carry a self-described server signer key until trusted issuer configuration is implemented.
- A match-state transition still needs to prove the receipt names the local profile and peer and follows an outgoing local like.

## Next smallest action

Implement bilateral match-state enforcement in `dating-matching` and `dating-uniffi-bindings`, using the validated receipt and a bound local profile id.
