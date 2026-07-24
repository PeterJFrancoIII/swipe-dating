# Abuse and Rate-Limit Model

## Principles

- Adaptive limits on registration, discovery, likes, messages, reports, account creation.
- Do not encode protected attributes into limit decisions.
- No undocumented permanent shadow bans; consequential enforcement needs human review (except immediate legal/security blocks).
- Prefer pseudonymous risk tokens over stable device advertising IDs.

## Default staging budgets (tunable)

| Action | Soft | Hard (per hour / identity) |
|---|---|---|
| Presence refresh | 120/hour | 300 |
| Discovery query | 60 | 120 |
| Fetch tickets | 30 | 60 |
| Likes | 40 | 80 |
| Messages (per match) | 120 | 240 |
| Reports | 5 | 10 |

Exceeding soft limits adds delay; hard limits return bounded errors without confirming peer existence beyond necessary protocol.
