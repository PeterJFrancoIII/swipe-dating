# ADR-0004: Canonical profile format

Date: 2026-07-20
Status: accepted
Decision owner: AI System Architect (human ratification required for production)

## Context

Canonical profile format must be fixed before implementation proliferates.

## Options considered

1. Alternatives evaluated against privacy, safety, cost, and reversibility.
2. See decision below for selected default.

## Decision

Canonical CBOR with COSE signatures for ProfileCapsule and peer objects. Reject ad hoc JSON signing. Unknown critical fields fail closed; noncritical may be ignored.

## Consequences

- Privacy impact: minimizes operator custody of sensitive content where possible.
- Safety impact: preserves reporting/blocking and age fail-closed paths.
- Cost impact: requires relay/TURN and minimal always-on control plane.
- Reversibility: interfaces keep vendors replaceable; lock-in recorded here.

## Validation

Unit/integration tests and staging smoke for the affected subsystem.

## Owner

Engineering + Security (staging); human counsel before production claims.
