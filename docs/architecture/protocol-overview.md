# Protocol Overview

Deterministic signed objects use canonical CBOR + COSE (see ADR-0004). Control-plane HTTP APIs use OpenAPI (JSON).

## Core object types

- `ProfileCapsule` — signed versioned profile
- `PresenceLease` — ≤120s coarse discovery lease
- `FetchTicket` — one-time pre-match profile fetch
- `LikeEnvelope` — signed encrypted interest
- `MatchReceipt` — bilateral consent proof
- `BlockRecord` — pairwise deny
- `MessageEnvelope` — E2EE chat after match
- `ReportBundle` — user-selected evidence package

All objects carry `protocol_version`, expiry, nonce/anti-replay material where applicable, and strict size bounds.
