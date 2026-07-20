# Release gates

**Status:** BINDING for agents and CI validators  
**Updated:** 2026-07-20

## Deny by default

| Gate | Closed beta | Production |
|---|---|---|
| Legal counsel sign-off (`approvals/`) | required | required |
| Privacy / DPIA acceptance | required | required |
| External security review | recommended | required (≤180 days) |
| Trust & safety staffing + P0 coverage plan | required | required (24/7 if claimed) |
| Executive launch approval | required | required |
| App-store compliance matrix (dated ≤30 days) | required | required |
| Market row allowed in launch matrix | required | required |
| Infra account attestation (staging/prod) | staging verified | prod verified |
| Age-assurance design counsel-reviewed | required | required |
| Child-safety contact + CSAE standards published | required | required |
| NCII request channel operational | required | required |
| `make production-preflight` | must fail without approvals | must pass only with authentic approvals |

## Agent rules

- Autonomous agents may deploy **staging** only after staging account identity is verified.
- Autonomous agents must **not** submit to App Store / Play, buy vendors, accept legal terms, or fabricate approvals.
- Beta and production remain **BLOCKED** until the table above is satisfied with authentic artifacts.

## Validator

`make production-preflight` and `scripts/production_preflight.sh` must exit non-zero when approvals are missing.
