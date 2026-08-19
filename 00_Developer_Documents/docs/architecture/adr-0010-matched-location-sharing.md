# ADR-0010: Match-scoped location sharing

**Status:** Accepted for staging scaffold; real-user activation blocked  
**Date:** 2026-07-21

## Context

Matches may want to share where they matched, a meeting point, or temporary live location. Persistent match tracking would create unacceptable stalking and coercion risk.

## Decision

Location is never shared merely because two people match. The app supports three separately consented grant types:

1. approximate match-area snapshot;
2. user-selected meeting pin;
3. temporary live location for 15 minutes, 1 hour, 4 hours, or explicit stop.

Each grant is pairwise, purpose-labeled, precision-labeled, signed, sequenced, expiring, encrypted to the recipient, and revocable. Precise location requires a second confirmation. Active shares are visible in one dashboard.

Block, unmatch, emergency privacy, explicit stop, or account deletion ends active grants and removes cached display. Push notifications and telemetry contain no location.

## Consequences

- Map UI may render only synthetic data until Core Location/MapKit, E2EE envelopes, background indicators, and revocation networking are implemented.
- Receivers cannot be forced to erase screenshots or externally copied coordinates; this limitation must be disclosed.
- Location coercion, stale-cache, replay, and compromised-relay tests are mandatory.

## Rejected alternatives

- Always-on match tracking.
- Sharing exact location by default.
- Server-readable location history.
- A permanent map of all past matches.
