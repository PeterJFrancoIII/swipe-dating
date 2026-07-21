# ADR-0014 — JavaScript-only active R&D reset

**Status:** Accepted for active research  
**Date:** 2026-07-21

## Context

The original repository was structured as a Rust core, SwiftUI iOS application, Kotlin Android application, Axum services, UniFFI bridge, and Terraform deployment scaffold. That production-shaped architecture created significant build, FFI, packaging, and infrastructure cost before the product and abuse-prevention hypotheses had stabilized.

The project now prioritizes rapid experiments in:

- exact adult eligibility and credential boundaries;
- consent-based proximity behavior;
- reciprocal matching;
- local compatibility ranking;
- matched-location consent and revocation;
- cosmetic marketplace rules;
- content-blind anti-bot controls;
- decentralized and ephemeral discovery behavior.

## Decision

The active R&D application will be implemented entirely in JavaScript.

- Expo SDK 57 / React Native 0.86 provides Android, iOS, and web UI from JavaScript.
- Node.js 24 LTS runs services, simulations, tests, and tooling.
- Active source uses ECMAScript modules (`.js` / `.mjs`), not TypeScript.
- Pure domain packages remain independent of React Native and the network.
- Hardware, platform integrity, and cryptographic adapters are reached through JavaScript APIs in custom Expo development builds.
- Expo Go is not treated as a capable environment for custom native BLE or platform-attestation libraries.
- Existing Rust, Swift, Kotlin, and Terraform files remain frozen historical reference and receive no new active feature work.

## Why

1. One runtime and language makes agent-assisted iteration and team onboarding faster.
2. Pure JavaScript domain rules are executable in Node, React Native, and browser simulations.
3. Expo Fast Refresh shortens UI/product iteration.
4. Node's built-in test runner makes safety and consent requirements executable without a separate test framework.
5. Workspace packages allow a single implementation of product rules across mobile, API, and simulations.
6. The app can add native capabilities through development builds while preserving a JavaScript-facing product layer.

## Native-boundary clarification

“Entirely JavaScript” applies to the application, product rules, service logic, simulations, and active repository surface. Mobile operating systems still expose Bluetooth, location, secure hardware, push, purchases, and attestation through compiled platform libraries. Those libraries are dependencies beneath JavaScript APIs; they do not justify duplicating product logic in Swift or Kotlin.

A small native adapter may be unavoidable for an unsupported capability. Such an adapter is not authorized by this ADR and requires a separate exception ADR, named owners, and evidence that no maintained JavaScript-facing module can satisfy the need.

## Consequences

### Positive

- faster feature experiments and feedback;
- one domain model across mobile, web, API, and simulations;
- removal of UniFFI and cross-language synchronization from active R&D;
- simpler CI and code review;
- easier synthetic multi-user and abuse simulation.

### Negative

- JavaScript is not assumed to be the final performance answer for every media or cryptographic operation;
- BLE background behavior, platform attestation, secure hardware keys, and app-store packaging still require real-device validation;
- the existing native/Rust tree remains confusing until archived in a separate cleanup;
- Expo development builds, not Expo Go, are required for custom native modules.

## Guardrails

- no real users;
- proximity and location hardware adapters disabled by default;
- no production claim based on a simulation;
- adults-only, equal-consent defaults, reciprocal matching, free safety tools, and release gates remain binding;
- active CI must validate only the JavaScript R&D surface plus governance/production blockers.

## Exit criteria before choosing a production architecture

- full JavaScript vertical slice covers onboarding through delete/export;
- protocol identity binding and cryptographic envelopes independently reviewed;
- adult credential enforced at network boundaries;
- proximity and location implementations red-teamed on real devices;
- performance measurements identify actual bottlenecks;
- named human owners approve the production architecture and any native exceptions.
