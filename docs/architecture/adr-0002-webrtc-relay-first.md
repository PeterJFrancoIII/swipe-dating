# ADR-0002: WebRTC relay-first transport

Date: 2026-07-20
Status: accepted
Decision owner: AI System Architect (human ratification required for production)

## Context

WebRTC relay-first transport must be fixed before implementation proliferates.

## Options considered

1. Alternatives evaluated against privacy, safety, cost, and reversibility.
2. See decision below for selected default.

## Decision

Default pre-match ICE policy to relay-only to avoid peer IP disclosure. Optional post-match direct P2P only behind explicit consent and feature flag (default off). Document TURN metadata exposure.

## Consequences

- Privacy impact: minimizes operator custody of sensitive content where possible.
- Safety impact: preserves reporting/blocking and age fail-closed paths.
- Cost impact: requires relay/TURN and minimal always-on control plane.
- Reversibility: interfaces keep vendors replaceable; lock-in recorded here.

## Validation

Unit/integration tests and staging smoke for the affected subsystem.

## Owner

Engineering + Security (staging); human counsel before production claims.
