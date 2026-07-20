# Contributing

1. Read `MISSION.md`, `AGENTS.md`, `policies/community-rules.md`, and the relevant ADR before coding.
2. Read `docs/governance/release-gates.md` — do not treat beta/production as unblocked.
3. Work on `feat/*` branches; one writer per worktree.
4. Keep diffs scoped; add tests for behavior changes.
5. Run `make lint` and `make test-unit` before opening a PR.
6. Red-zone paths (crypto, identity, age, location, reports, infra, release, governance approvals) need CODEOWNERS review.
7. Do not fabricate approvals, weaken safety controls, submit to stores, or deploy production.
8. Prefer the canonical Git repo as source of truth; Drive mirrors are operational convenience only.

Use the PR template. Mark drafts clearly when staging validation is incomplete.
