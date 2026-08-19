# Incident response runbook (staging)

**Status: UNAPPROVED — operator draft**

## Severity levels

| Level | Example | Response |
|-------|---------|----------|
| SEV1 | Active exploitation report, data breach suspicion | Page on-call + T&S + legal |
| SEV2 | Control plane down, auth anomaly | Eng on-call, comms template |
| SEV3 | Degraded discovery, elevated error rate | Monitor, rollback staging |

## First 15 minutes

1. Acknowledge alert in incident channel (define in ops).
2. Classify severity; assign incident commander (human).
3. Preserve logs — no deletion. Redact PII from public status.
4. If safety-related: follow `docs/safety/` playbooks before public statements.

## Staging-specific

- Staging must not contain real user data.
- Rollback via `terraform apply` previous state or ECS task revision — human operator.

## Post-incident

- Blameless review within 5 business days
- Update threat model if control boundary crossed
