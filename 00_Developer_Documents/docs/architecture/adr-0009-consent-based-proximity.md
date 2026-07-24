# ADR-0009: Consent-based Bluetooth proximity

**Status:** Accepted for staging scaffold; real-user activation blocked  
**Date:** 2026-07-21

## Context

The product needs an optional **Get fk'd** mode that alerts nearby eligible adults without creating a persistent location or encounter database. Bluetooth range is approximate and operating systems may suspend background work.

Gender-based disclosure defaults would create unequal privacy and stalking risk. They are rejected.

## Decision

- The feature is off by default and controlled from Discover.
- Every gender receives the same default: **prompt before profile sharing**.
- Automatic compatible-user profile sharing is a separate explicit opt-in.
- BLE advertisements carry only a protocol version, random rotating encounter ID, epoch, and non-sensitive capability bits.
- Encounter IDs are not derived from root/profile/rendezvous/push/marketplace identities.
- Raw encounters remain on device and expire rapidly.
- A local compatibility check precedes a generic haptic.
- Profile exchange requires pairwise expiring capabilities and relay-first encrypted transfer.
- Block, emergency privacy, account deletion, or mode-off terminates participation.
- No exact distance, direction, nearby count, or durable encounter graph.

## Consequences

- Detection is best effort rather than guaranteed.
- CoreBluetooth and Android BLE permissions/background behavior require platform-specific implementations.
- Battery, replay, relay, scanner, and stalking tests become release gates.
- The public store name may differ from the internal codename after compliance review.

## Rejected alternatives

- Stable profile IDs in advertisements.
- Server-uploaded encounter logs.
- Automatic disclosure based on gender.
- Exact-distance radar or direction finding.
- Paying to become more visible in proximity.
