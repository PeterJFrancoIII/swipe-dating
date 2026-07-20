# ADR-0008: Cloud and TURN provider

Date: 2026-07-20
Status: accepted
Decision owner: AI System Architect (human ratification required for production)

## Context

Cloud and TURN provider must be fixed before implementation proliferates.

## Options considered

1. Alternatives evaluated against privacy, safety, cost, and reversibility.
2. See decision below for selected default.

## Decision

Reference production design: AWS Fargate (or ECS) + RDS PostgreSQL + managed Valkey + S3/KMS evidence vault. Staging may use Compose + coturn. Managed TURN preferred when credentials supplied; coturn fallback. Avoid Kubernetes for MVP fashion.

## Consequences

- Privacy impact: minimizes operator custody of sensitive content where possible.
- Safety impact: preserves reporting/blocking and age fail-closed paths.
- Cost impact: requires relay/TURN and minimal always-on control plane.
- Reversibility: interfaces keep vendors replaceable; lock-in recorded here.

## Validation

Unit/integration tests and staging smoke for the affected subsystem.

## Owner

Engineering + Security (staging); human counsel before production claims.
