# ADR-0012: Skin Shop marketplace boundary

**Status:** Accepted for staging scaffold; commerce blocked  
**Date:** 2026-07-21

## Context

The product needs user-created and purchasable avatars, profile themes, chat skins, reaction packs, and bounded animations. Marketplace infrastructure is necessarily more centralized than private dating content and introduces payments, IP, moderation, fraud, and hostile-asset risk.

## Decision

- Operate Skin Shop as a separate public-asset and commerce plane.
- Keep marketplace services, keys, roles, telemetry, and storage isolated from profiles, private messages, sexual intent, questionnaire answers, proximity, location, and safety cases.
- Allow only bounded declarative formats: PNG, WebP, AVIF, a restricted vector subset, and reviewed animation manifests.
- Reject JavaScript, arbitrary HTML, executable plugins, arbitrary shaders, embedded network requests, and unbounded 3D assets.
- Label avatar, photo, and photo-verified profiles distinctly.
- Validate platform receipts and restore entitlements.
- Moderate assets and provide copyright, impersonation, refund, appeal, payout, tax, and fraud processes before public commerce.
- Purchases and creator status never affect dating rank, reach, messaging, report priority, appeal, or safety access.

## Consequences

- Public cosmetic assets may be cached centrally and through a CDN without changing the local-first promise for sensitive dating data.
- Creator payouts and impact allocations require independent financial controls.
- Hostile-asset fuzzing and decompression limits are release gates.
- The staging catalog is synthetic and non-purchasing.

## Rejected alternatives

- Executable theme code.
- Creator access to user dating data.
- Pay-to-win discovery boosts.
- Using private profile photos as marketplace training data.
- A marketplace for sexual services.
