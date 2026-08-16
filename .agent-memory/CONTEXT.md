# Shared context

**Updated:** 2026-08-12
**Curator:** Codex (architect/admin)
**Status:** Bootstrap — no product implementation task authorized

## Confirmed durable context

- Active client is **Apple-first Expo** at `apps/swipe/`. Python web R&D is frozen at `golden-master/swipe-dating-web/`. Do not edit the golden master. Do not submit to stores.
- `PRODUCT_SCOPE.md` is the canonical product boundary and overrides conflicting product docs.
- Product is an adults-only (18+), simple, swipe-first dating app.
- Permanent navigation is exactly two tabs: **Swipe** and **Matches**.
- Current UI direction was rejected by the user as over-complex and unenjoyable; it must not be treated as accepted design.
- Safety and governance belong behind the primary experience unless user action is needed.
- Closed beta and production remain blocked.
- Coding-agent system behavior: `docs/architecture/minimum-sufficient-architecture.md` (ADR-0017). Automation first, community second, staff last. Authenticity ≠ Reliability ≠ Bot Hunter Reputation. Phase 1 is the dating core; proximity/marketplace are Phase 5.

## Operating roles

- **Codex:** architect/admin — owns scope, architecture, assignments, decisions, acceptance, and shared-context curation.
- **Cursor IDE agents:** implementers — own only bounded work assigned in a task record.

## Authorization note

No product implementation task is currently authorized by this bootstrap. Docs/config coordination only until Codex assigns a new task.
