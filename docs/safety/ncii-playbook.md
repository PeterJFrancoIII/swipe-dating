# NCII (non-consensual intimate imagery) playbook (human-owned stub)

**Status: UNAPPROVED / HUMAN-OWNED**

## Triggers

- Report category NCII
- Trusted flagger notice (when program exists)
- Victim direct outreach

## Operator steps (draft)

1. Quarantine referenced media handles on control plane (no operator viewing of content except trained reviewers).
2. Open `safety_cases` row; attach vault evidence ref only.
3. Offer victim support resources (links TBD — legal review).
4. Remove/redact per policy; preserve hashes for repeat-offender detection where lawful.

## Prohibited

- Autonomous agents authorizing takedown without human reviewer
- Storing unencrypted intimate imagery in Postgres or logs

## Production gate

Requires trust & safety staffing approval in `approvals/`.
