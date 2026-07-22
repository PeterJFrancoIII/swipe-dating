# ADR-0014 — JavaScript-only active R&D reset

**Status:** Accepted for active research; repository-retention decision superseded by ADR-0019  
**Date:** 2026-07-21  
**Amended:** 2026-07-22

## Context

The original repository was structured as a Rust core, SwiftUI iOS application, Kotlin Android application, Axum services, UniFFI bridge, and Terraform deployment scaffold. That production-shaped architecture created significant build, FFI, packaging, and infrastructure cost before product and abuse-prevention hypotheses had stabilized.

The project prioritized rapid experiments in adult eligibility, consent-based proximity, reciprocal matching, local compatibility, matched-location consent, marketplace boundaries, anti-bot controls, and ephemeral discovery.

## Decision

The active R&D application is implemented entirely in JavaScript.

- Expo SDK 57 / React Native 0.86 provides Android, iOS, and web UI from JavaScript.
- Node.js 24 LTS runs services, simulations, tests, validation, and tooling.
- Active source uses ECMAScript modules (`.js` / `.mjs`), not TypeScript.
- Pure domain packages remain independent of React Native and the network.
- Hardware, platform-integrity, and cryptographic dependencies are reached through JavaScript APIs in custom Expo development builds.
- Expo Go is not treated as sufficient for custom BLE or platform-attestation dependencies.

ADR-0019 later consolidated this decision across the whole repository. The former Rust, Swift, Kotlin, UniFFI, Terraform, Make, and shell implementation is no longer retained in the current tree; Git history preserves it.

## Why

1. One runtime and language makes iteration and onboarding faster.
2. Pure JavaScript domain rules are executable in Node, React Native, and browser simulations.
3. Expo Fast Refresh shortens UI/product iteration.
4. Node's built-in test runner makes safety and consent requirements executable without a separate test framework.
5. Workspace packages allow one implementation of product rules across mobile, API, and simulations.
6. Native capabilities can be supplied through reviewed JavaScript-facing dependencies without duplicating product logic.

## Native-boundary clarification

“Entirely JavaScript” applies to project-authored application, service, domain, simulation, test, validation, and release-tooling source. Mobile operating systems still expose Bluetooth, location, secure hardware, push, purchases, attestation, camera, and storage through compiled platform libraries.

Generated Expo native projects are disposable and uncommitted. A project-authored native adapter is not authorized by this ADR or ADR-0019; it requires a superseding exception ADR, named owners, measured need, narrow scope, and explicit human architecture approval.

## Consequences

### Positive

- faster feature experiments and feedback;
- one domain model across mobile, web, API, and simulations;
- no UniFFI or cross-language synchronization;
- simpler CI, review, and ownership;
- easier synthetic multi-user and abuse simulation;
- no obsolete second architecture in the current tree.

### Costs and limits

- historical prototypes require Git history to inspect;
- JavaScript is not assumed to be the final performance answer for every media or cryptographic operation;
- BLE background behavior, platform attestation, secure-hardware keys, and app-store packaging still require physical-device validation;
- Expo development builds, not Expo Go, are required for custom native dependencies.

## Guardrails

- no real users;
- proximity and location hardware adapters disabled by default;
- no production claim based on a simulation;
- adults-only, equal-consent defaults, reciprocal matching, free safety tools, and release gates remain binding;
- CI validates the complete JavaScript-only repository, governance contracts, Expo export, and production blocker;
- no project-authored non-JavaScript exception without ADR-0019 review.

## Exit criteria before choosing a production architecture

- full JavaScript vertical slice covers onboarding through delete/export;
- protocol identity binding and cryptographic envelopes independently reviewed;
- adult credential enforced at network boundaries;
- proximity and location implementations red-teamed on real devices;
- performance measurements identify actual bottlenecks;
- named human owners approve the production architecture and any native exceptions.
