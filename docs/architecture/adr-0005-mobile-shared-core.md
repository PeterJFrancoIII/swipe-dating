# ADR-0005: Mobile shared core via UniFFI

Date: 2026-07-20
Status: accepted
Decision owner: AI System Architect (human ratification required for production)

## Context

Mobile shared core via UniFFI must be fixed before implementation proliferates.

## Options considered

1. Alternatives evaluated against privacy, safety, cost, and reversibility.
2. See decision below for selected default.

## Decision

Share audited protocol/identity/matching/storage interfaces via UniFFI to Swift and Kotlin. UI remains native SwiftUI / Compose.

## Consequences

- Privacy impact: minimizes operator custody of sensitive content where possible.
- Safety impact: preserves reporting/blocking and age fail-closed paths.
- Cost impact: requires relay/TURN and minimal always-on control plane.
- Reversibility: interfaces keep vendors replaceable; lock-in recorded here.

## Validation

Unit/integration tests and staging smoke for the affected subsystem.

## Owner

Engineering + Security (staging); human counsel before production claims.
