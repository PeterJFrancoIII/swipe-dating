# Governance index

**Updated:** 2026-07-22  
All policy documents here are **DRAFT / UNAPPROVED** until named humans place signed artifacts in `approvals/`.

| Doc | Purpose |
|---|---|
| `release-gates.md` | What blocks beta and production, including JavaScript-only architecture, persistence, discovery, matching, messaging, relationship phases, BLE, location, marketplace, and anti-abuse gates |
| `decentralization-limits.md` | What decentralization does and does not do |
| `store-compliance-baseline.md` | Apple / Google Play UGC and dating baselines |
| `ncii-takedown-baseline.md` | NCII / TAKE IT DOWN expectations |
| `child-safety-baseline.md` | CSAE and child-safety standards baseline |
| `funding-and-impact-gates.md` | When impact-funding claims may be published |
| `roles-and-owners.md` | Named role placeholders, including local data custody, ranking fairness, protocol, relationship-transition consent, and conversation safety |

Related architecture decisions with governance force:

- `docs/architecture/adr-0014-javascript-rnd-reset.md`
- `docs/architecture/adr-0015-local-persistence-boundary.md`
- `docs/architecture/adr-0016-intent-driven-discovery.md`
- `docs/architecture/adr-0017-reciprocal-match-conversations.md`
- `docs/architecture/adr-0018-deepen-connection.md`
- `docs/architecture/adr-0019-javascript-only-consolidation.md`

## JavaScript-only architecture

The current Git tree contains one project-authored implementation language: JavaScript. The former Rust, Swift, Kotlin, UniFFI, Terraform, Make, and shell implementation was removed under ADR-0019 and remains available only through Git history.

Both checkout and Git-tree language audits are blocking. Active workspace and test discovery must remain dynamic. Generated Expo native projects are disposable and uncommitted. A project-authored non-JavaScript exception requires a superseding ADR and explicit human architecture approval.

## Current trust boundaries

The AsyncStorage implementation is synthetic-R&D-only and is not an approved real-user encrypted vault.

The intent-driven discovery engine is synthetic/session-only. It may not use prohibited trait proxies, disclose private exclusion reasons, fabricate matching effort, or represent self-reported boundaries as independently verified.

The reciprocal match and conversation lifecycle is synthetic/session-only. Fixture reciprocity is not authentication, a local transcript is not E2EE or delivered messaging, and a local block is not cross-device revocation. Decisions, matches, messages, transcripts, block state, and the Matches tab remain outside AsyncStorage.

Deepen Connection is synthetic/session-only. Two explicit opt-ins are required; the phase cannot be inferred; decline reasons are not retained; either participant can return to casual; and phase state, requests, timestamps, and deeper answers remain outside AsyncStorage. It is not consent to sex, exclusivity, media, location, a meeting, health disclosure, or public relationship status.
