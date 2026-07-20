# NCII (non-consensual intimate imagery) playbook

**Status:** DRAFT — UNAPPROVED / HUMAN-OWNED  
**Updated:** 2026-07-20  
**Baseline:** `docs/governance/ncii-takedown-baseline.md`

Covered platforms are expected to provide an easy NCII removal process and to remove qualifying content and known identical copies within **48 hours** where TAKE IT DOWN Act / FTC guidance applies.

## Triggers

- Report category NCII
- Trusted flagger notice (when program exists)
- Victim or non-user direct request via published channel (`CHANGE_ME` before public beta)

## Operator steps (draft)

1. Issue case ID; quarantine referenced media handles on control plane (no ordinary staff viewing).
2. Open `safety_cases` row; attach vault evidence ref only — never intimate media in Slack/tickets.
3. Assess under counsel-approved criteria; remove operator-held copies and identical hashes within applicable timelines.
4. Offer victim support resources (links TBD — legal review).
5. Notify requester of outcome without oversharing peer-device / screenshot limits.
6. Preserve only what counsel requires; vault access audited.

## Honest limits

Peer-held copies and screenshots may persist outside operator control; disclose in privacy and safety copy.

## Prohibited

- Autonomous agents authorizing takedown, sending real notices, or handling real intimate evidence
- Storing unencrypted intimate imagery in Postgres, logs, or this repository

## Production gate

Requires trust & safety staffing approval in `approvals/` and an operational request channel.
