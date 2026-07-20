# Closed beta readiness

**Updated:** 2026-07-20  
**Status:** NOT READY — gates open.

Blocked until: staging account verified, Java/Android builds green, iOS CI green, T&S staffing budget, legal drafts counsel-reviewed, age provider DPA (if used), external security review scheduled, and authentic beta approvals present.

## Must be true before inviting real beta users

- [ ] Legal + privacy drafts counsel-approved for beta cohort jurisdiction(s)
- [ ] Age-assurance design accepted (robust vs circumvention-prone self-declare alone)
- [ ] In-app report/block/delete paths tested end-to-end (not mock-only)
- [ ] NCII + child-safety contacts published to beta cohort
- [ ] T&S coverage plan for cohort size
- [ ] Staging ACCOUNT_IDENTITY verified; no production credentials in client
- [ ] Crash reporting excludes message bodies
- [ ] Beta users consented to experimental software risks
- [ ] App-store compliance matrix dated ≤30 days if store TestFlight/internal testing claims compliance
- [ ] `approvals/` beta pack present (see `docs/governance/release-gates.md`)

Until then: internal dogfood / synthetic decks only.
