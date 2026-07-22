# ADR-0015 — Local persistence boundary for JavaScript R&D

**Status:** Accepted for synthetic R&D only  
**Date:** 2026-07-22

## Context

The Expo research application previously lost all state on restart. Rapid R&D now needs durable profile presentation, cosmetic ownership, and basic UI preferences without implying that an unencrypted key-value store is suitable for sensitive dating data.

Expo SDK 57 supports `@react-native-async-storage/async-storage` 2.2.0. AsyncStorage is persistent but unencrypted. That makes it appropriate only for explicitly allowlisted, non-secret R&D fields.

## Decision

Create a shared JavaScript package, `packages/rnd-storage`, containing:

- a versioned local-state schema;
- strict allowlist sanitization;
- migration from schema version 1;
- malformed/unsupported-record recovery;
- adapter-based load, save, clear, and redacted export behavior;
- deterministic Node tests proving prohibited fields are discarded.

The Expo adapter uses AsyncStorage only for:

- display name;
- short profile description;
- optional pronouns;
- locally owned/applied synthetic cosmetic identifiers;
- last visible R&D tab;
- haptic-feedback preference.

The following remain session-only and must not enter this store:

- date of birth or adult-gate result;
- adult-assurance credentials or identity documents;
- Looking For or sexual-intent selections;
- gender/orientation discovery selections;
- questionnaire answers or dealbreakers;
- likes, matches, messages, blocks, reports, or evidence;
- location choices, coordinates, grants, or history;
- BLE observations, encounter identifiers, proximity policy, or device identifiers;
- authentication, attestation, cryptographic, payment, or payout material.

## Consequences

### Positive

- the JavaScript app now restores approved profile/UI state after restart;
- migrations and corruption recovery can be tested independently of React Native;
- persistence policy is enforced by code rather than documentation alone;
- sensitive R&D selections are not silently written to an unencrypted store.

### Negative

- profile presentation fields are still stored without application-layer encryption;
- web and native storage inherit platform/browser backup and access characteristics;
- the current store is not acceptable for real users or sensitive questionnaire/profile data;
- a future encrypted vault needs key custody, backup, recovery, deletion, export, and migration design.

## Real-user gate

Before any real-user build stores profile or preference data, the project requires:

1. a reviewed encrypted local-vault design;
2. hardware/OS-backed key custody where available;
3. migration from the R&D allowlist store;
4. explicit backup and device-transfer behavior;
5. deletion, export, corruption, recovery, and logout tests;
6. privacy/DPIA and external security review;
7. physical-device testing on supported iOS and Android versions.

This ADR does not approve real profiles, real users, cloud synchronization, or production identity storage.
