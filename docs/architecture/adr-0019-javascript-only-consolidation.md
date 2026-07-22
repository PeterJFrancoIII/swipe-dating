# ADR-0019 — JavaScript-only repository consolidation

**Status:** Accepted  
**Date:** 2026-07-22  
**Real-user approval:** Not granted

## Context

ADR-0014 moved active research to JavaScript but retained the earlier Rust, Swift, Kotlin, UniFFI, Terraform, Make, and shell implementation as frozen reference. That compromise left two architectural stories in one repository, created stale ownership and build instructions, and allowed validation scripts to miss newly added JavaScript workspaces because they relied on hard-coded directory lists.

The product now has working JavaScript vertical slices for adult eligibility, discovery, matching, conversations, relationship phases, persistence, simulation, and Expo UI. The retained cross-language tree no longer provides an active build path and creates more drift risk than research value.

## Decision

The repository is consolidated into one project-authored implementation language: JavaScript.

1. Application, service, domain, simulation, test, validation, and release-tooling code is authored as ECMAScript modules.
2. Active workspaces are discovered dynamically from `apps/rnd-*` and `packages/rnd-*`; validators must not maintain hand-written package lists.
3. The former Rust core and services, SwiftUI client, Kotlin client, UniFFI bindings, Terraform scaffold, Cargo workspace, integration-test crate, Makefile, and shell scripts are removed from the current Git tree.
4. Historical code remains available through Git history and does not need a parallel archive directory.
5. Documentation, JSON configuration, lockfiles, assets, and GitHub workflow YAML remain allowed non-runtime artifacts.
6. Generated or third-party native code beneath Expo/React Native dependencies is not project-authored product logic and is outside this source-language rule.
7. Project-authored Swift, Kotlin, Rust, Java, Objective-C, C/C++, Python, TypeScript, Terraform, shell, or other non-JavaScript implementation requires a superseding exception ADR, named owners, measured necessity, scoped files, and explicit human architecture approval.

## Enforcement

The repository uses two complementary checks:

- `scripts/check-active-javascript-surface.mjs` dynamically discovers every active R&D workspace and rejects non-JavaScript implementation files inside it.
- `scripts/check-javascript-only-repository.mjs` scans the complete checkout and rejects legacy implementation roots, non-JavaScript source extensions, and non-JavaScript build/runtime manifests.
- GitHub Actions independently inspects the committed Git tree through the GitHub API so ignored, generated, or untracked-local behavior cannot conceal committed violations.
- `scripts/check-javascript-syntax.mjs`, the Node test suite, simulator, Expo export, governance contracts, dependency audit, and production blocker remain mandatory.

## Tooling consolidation

The former Bash production preflight and Makefile wrappers are replaced by:

- `scripts/production-preflight.mjs`;
- `scripts/verify-production-block.mjs`;
- `scripts/check-governance-contracts.mjs`;
- npm scripts in the root `package.json`.

GitHub workflow YAML orchestrates these JavaScript tools but does not contain product or release-policy logic.

## Native capability boundary

JavaScript-only source does not mean mobile operating systems are implemented in JavaScript. Bluetooth, location, secure hardware, notifications, billing, attestation, camera, and storage may be supplied by reviewed Expo/React Native dependencies inside generated development builds.

Generated `ios/` or `android/` output must remain disposable and uncommitted. Product rules must not be duplicated in generated native projects.

## Consequences

### Positive

- one source language and dependency model;
- no cross-language FFI synchronization;
- no obsolete production-shaped architecture competing with R&D code;
- dynamic validation automatically covers new workspaces;
- simpler onboarding, review, CI, and agent operation;
- Git history preserves prior work without keeping dead code in the active tree.

### Costs and limits

- old native/Rust prototypes require Git history to inspect;
- JavaScript is not presumed optimal for every future cryptographic, media, or hardware operation;
- production native exceptions may still become necessary after measurement and review;
- Expo development-build and physical-device testing remain required for real native capabilities.

## Verification

- repository tree contains no project-authored non-JavaScript implementation or build automation;
- every `apps/rnd-*` and `packages/rnd-*` workspace is discovered automatically;
- Node syntax and test suite pass;
- deterministic simulator passes;
- Expo SDK 57 web export passes;
- governance contracts pass;
- production preflight remains blocked without authentic human approvals.

## Release state

```text
JAVASCRIPT_RND_SYNTHETIC_ONLY
REAL_USER_CLOSED_BETA_BLOCKED
PRODUCTION_BLOCKED_HUMAN_APPROVALS_REQUIRED
```
