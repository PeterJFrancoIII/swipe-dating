# Child safety playbook (human-owned stub)

**Status: UNAPPROVED / HUMAN-OWNED**

Autonomous agents must not fabricate law-enforcement procedures or regional legal advice.

## Triggers

- User report category: underage / appears under 18
- Age assurance failure or conflicting signals
- External tip or regulator inquiry

## Immediate actions (operator)

1. Preserve evidence per retention policy — vault only, not ordinary DB.
2. Restrict subject account pending human review (fail closed).
3. Escalate to designated Trust & Safety lead within SLA (define in ops runbook).
4. Do **not** notify subject of reporter identity.

## Required human assignments before production

| Role | Owner | Status |
|------|-------|--------|
| T&S lead | _unassigned_ | required |
| Legal counsel | _unassigned_ | required |
| NCMEC / regional equivalent liaison | _unassigned_ | required |

## References

- `docs/safety/block-report-flows.md`
- `policies/community-rules.md`
