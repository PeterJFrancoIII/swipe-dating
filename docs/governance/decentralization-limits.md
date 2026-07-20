# Decentralization limits

**Status:** DRAFT — UNAPPROVED  
**Updated:** 2026-07-20

## What we optimize for

Minimize operator custody of profiles, photos, private messages, precise location, and relationship preferences. Prefer device-local storage and E2EE peer transfer.

## What decentralization does **not** remove

The operator still controls or provides:

- app distribution and store presence;
- discovery / rendezvous / signaling / TURN credential interfaces;
- age-eligibility and anti-abuse interfaces;
- block/report ingestion and safety evidence vault;
- push wake routing;
- terms, community rules, and enforcement for access to the service.

Decentralization is **not** a claim of zero legal duty, zero moderation, or zero ability to ban.

## MVP architecture choice

Hybrid **local-first** with ephemeral control plane (Mode A strict zero-store default). Optional sealed mailbox (Mode B) off by default. Personal availability node (Mode C) post-MVP.

Rejected as MVP default: replicating arbitrary users’ profiles/media onto unrelated phones.
