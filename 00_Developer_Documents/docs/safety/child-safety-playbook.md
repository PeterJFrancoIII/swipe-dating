# Child safety playbook

**Status:** DRAFT — UNAPPROVED / HUMAN-OWNED  
**Updated:** 2026-07-20  
**Baseline:** `docs/governance/child-safety-baseline.md`

Autonomous agents must not fabricate law-enforcement procedures, file CyberTipline reports, or create realistic CSAM fixtures.

## Product floor

- Hard 18+ age floor; no parental-consent bypass.
- Fail closed when eligibility cannot be established.
- Public CSAE standards + child-safety contact (`CHANGE_ME`) before public beta.

## Triggers

- User report category: underage / appears under 18
- Age assurance failure or conflicting signals
- Actual knowledge of CSAM / CSAE
- External tip or regulator inquiry

## Immediate actions (operator)

1. Preserve evidence per retention policy — vault only, not ordinary DB.
2. Restrict subject account pending human review (fail closed).
3. On actual knowledge of CSAM: report per counsel-approved process (e.g. 18 U.S.C. § 2258A / CyberTipline considerations).
4. Escalate to designated Trust & Safety lead within SLA (define in ops runbook).
5. Do **not** notify subject of reporter identity.

## Required human assignments before production

| Role | Owner | Status |
|------|-------|--------|
| T&S lead | _unassigned_ | required |
| Legal counsel | _unassigned_ | required |
| Child-safety contact (public) | _unassigned_ | required |
| NCMEC / regional equivalent liaison | _unassigned_ | required |

## References

- `docs/safety/block-report-flows.md`
- `policies/community-rules.md`
- `docs/governance/store-compliance-baseline.md`
