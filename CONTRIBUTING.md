# Contributing

1. Read `MISSION.md`, `AGENTS.md`, and the relevant ADR before coding.
2. Work on `feat/*` branches; one writer per worktree.
3. Keep diffs scoped; add tests for behavior changes.
4. Run `make lint` and `make test-unit` before opening a PR.
5. Red-zone paths (crypto, identity, age, location, reports, infra, release) need CODEOWNERS review.
6. Do not fabricate approvals, weaken safety controls, or deploy production.

Use the PR template. Mark drafts clearly when staging validation is incomplete.
