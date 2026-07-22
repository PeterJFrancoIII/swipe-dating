# Governance index

**Updated:** 2026-07-22  
All policy documents here are **DRAFT / UNAPPROVED** until named humans place signed artifacts in `approvals/`.

| Doc | Purpose |
|---|---|
| `release-gates.md` | What blocks beta and production, including JavaScript, local persistence, intent discovery, BLE, location, marketplace, and anti-abuse gates |
| `decentralization-limits.md` | What decentralization does and does not do |
| `store-compliance-baseline.md` | Apple / Google Play UGC & dating baselines |
| `ncii-takedown-baseline.md` | NCII / TAKE IT DOWN expectations |
| `child-safety-baseline.md` | CSAE / child-safety standards baseline |
| `funding-and-impact-gates.md` | When impact-funding claims may be published |
| `roles-and-owners.md` | Named role placeholders, including local data custody and ranking fairness |

Related architecture decisions with governance force:

- `docs/architecture/adr-0014-javascript-rnd-reset.md`
- `docs/architecture/adr-0015-local-persistence-boundary.md`
- `docs/architecture/adr-0016-intent-driven-discovery.md`

The current AsyncStorage implementation is synthetic-R&D-only and is not an approved real-user encrypted vault.

The current intent-driven discovery engine is synthetic/session-only. It may not use prohibited trait proxies, disclose private exclusion reasons, fabricate matching effort, or claim that self-reported boundaries are medically or independently verified.
