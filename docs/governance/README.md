# Governance index

**Updated:** 2026-07-22  
All policy documents here are **DRAFT / UNAPPROVED** until named humans place signed artifacts in `approvals/`.

| Doc | Purpose |
|---|---|
| `release-gates.md` | What blocks beta and production, including JavaScript, local persistence, intent discovery, reciprocal matching, messaging, relationship phases, BLE, location, marketplace, and anti-abuse gates |
| `decentralization-limits.md` | What decentralization does and does not do |
| `store-compliance-baseline.md` | Apple / Google Play UGC & dating baselines |
| `ncii-takedown-baseline.md` | NCII / TAKE IT DOWN expectations |
| `child-safety-baseline.md` | CSAE / child-safety standards baseline |
| `funding-and-impact-gates.md` | When impact-funding claims may be published |
| `roles-and-owners.md` | Named role placeholders, including local data custody, ranking fairness, match/messaging protocol, relationship-transition consent, and conversation safety |

Related architecture decisions with governance force:

- `docs/architecture/adr-0014-javascript-rnd-reset.md`
- `docs/architecture/adr-0015-local-persistence-boundary.md`
- `docs/architecture/adr-0016-intent-driven-discovery.md`
- `docs/architecture/adr-0017-reciprocal-match-conversations.md`
- `docs/architecture/adr-0018-deepen-connection.md`

The current AsyncStorage implementation is synthetic-R&D-only and is not an approved real-user encrypted vault.

The current intent-driven discovery engine is synthetic/session-only. It may not use prohibited trait proxies, disclose private exclusion reasons, fabricate matching effort, or claim that self-reported boundaries are medically or independently verified.

The current reciprocal match and conversation lifecycle is synthetic/session-only. A fixture flag is not authentication, a local transcript is not E2EE or delivered messaging, and a local block is not cross-device/service revocation. Decisions, matches, messages, transcripts, block state, and the Matches tab must remain outside AsyncStorage.

The current Deepen Connection lifecycle is synthetic/session-only. Two explicit opt-ins are required; the phase cannot be inferred from behavior; decline reasons are not retained; either participant can return to casual; and phase state, requests, timestamps, and deeper answers must remain outside AsyncStorage. Deepen Connection is not consent to sex, exclusivity, media, location, an offline meeting, health disclosure, or public relationship status.
