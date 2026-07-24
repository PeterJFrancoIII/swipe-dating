# Block and report flows (draft)

**Status: UNAPPROVED**

## Block

1. User initiates block from profile or chat header.
2. Client generates pseudonymous block token pair; server stores **hashes only** (`block_tokens` table).
3. Discovery and rendezvous respect block graph server-side where metadata intersects control plane.
4. Block is immediate on client; sync to peer path is best-effort with fail-safe local enforcement.

## Report

1. User selects category (harassment, underage concern, scam, NCII, other).
2. Client packages encrypted evidence envelope for vault upload (not control-plane Postgres).
3. Control plane records case index row in `safety_cases` — no narrative body in Postgres.
4. Human T&S triages via safety console (staging stub at `web/safety-console/`).

## Fail-closed rules

- Underage reports trigger mandatory human review playbook (see `child-safety-playbook.md`).
- NCII reports trigger `ncii-playbook.md`.
- Trafficking indicators trigger `trafficking-playbook.md`.

## Not in scope for autonomous agents

- Final category taxonomy
- Law-enforcement liaison contacts
- Regional legal variations
