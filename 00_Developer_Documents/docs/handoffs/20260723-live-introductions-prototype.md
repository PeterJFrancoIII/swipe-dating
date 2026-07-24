# Handoff: Live Introductions static preview configuration

Date: 2026-07-24  
Branch/worktree: `agent/warm-web-polish`  
Objective: complete only todo 4 of the approved Live Introductions Static
Prototype plan by adding a synthetic-only Netlify configuration, default-deny
contexts, dual human-owned identity preflights, focused CI/tests, and durable
evidence without performing a deployment.

## Changed files

- `netlify.toml`
- `.gitignore`
- `Makefile`
- `.github/workflows/ci.yml` (dedicated `live-introductions-prototype` job only)
- `scripts/verify_live_introductions_deploy_context.py`
- `tests/test_live_introductions_prototype.py`
- `infra/netlify/environments/staging/ACCOUNT_IDENTITY.md`
- `docs/architecture/adr-0014-live-introductions-static-prototype.md`
- `docs/handoffs/20260723-live-introductions-prototype.md`

No plan, UX source, existing AWS identity, release gate, approval artifact,
production Terraform, or FastAPI file was edited.

## Architecture decision

- `netlify.toml` publishes `dist/live-introductions` and runs only the
  standard-library Python verifier and generator.
- There is **no** deploy-selectable Netlify context that generates without the
  canonical deployment preflight. The removed `local-validation` bypass is
  gone. Standalone local generation lives only in
  `make live-introductions-build`.
- The base command denies generation and reports the actual `CONTEXT`.
  Production—including `netlify build`'s default context—always emits
  `PRODUCTION_BLOCKED`; `dev` and unknown/custom contexts also fail with
  context-specific messages.
- Hosted `deploy-preview` and `branch-deploy` commands run canonical
  `--deployment-preflight`, then context validation, then generation. Both
  currently stop before generation because the AWS and Netlify records are
  `UNVERIFIED`.
- The static response policy denies scripts, connections, objects, frames, form
  submission, workers, media, manifests, fonts, and remote content while
  allowing only the local stylesheet and local images. It also sets
  `X-Frame-Options: DENY`, `nosniff`, `no-referrer`, a restrictive permissions
  policy, and `no-store`.
- No functions, edge functions, Identity, Forms, database, Blobs, analytics,
  plugins, image remotes, redirects, secrets, or runtime environment variables
  were added.
- Make and CI pin `npx --yes netlify-cli@23.13.0`. The local target
  `live-introductions-netlify-validate` uses `build --dry` plus expected-denial
  offline builds only. It neither authenticates, links, generates through a
  Netlify context, nor deploys. `.netlify/` is ignored exactly once.
- The standard-library verifier parses valid `UNVERIFIED` and `VERIFIED` AWS
  and Netlify records. Missing, malformed, and unverified states fail
  distinctly; preflight succeeds only when both records are valid `VERIFIED`
  records and the required Netlify safeguards are true. CI and canonical tests
  are status-aware: they branch on the current parsed preflight result rather
  than hard-coding today's `UNVERIFIED` forever.
- The new human-owned Netlify record requires a staging-only team/site, no
  production data/domain, a real site ID, Git repository linkage, human
  verifier/time, **Enforce Git-based deployments**, and supported production
  publish locks before `VERIFIED`.
- Build commands are not an upload boundary. `deploy --no-build` bypasses TOML
  and every verifier, so local code cannot block raw CLI uploads. External
  deployment remains unauthorized until a human completes the Netlify setup
  sequence below and both identity records are `VERIFIED`.

## Verification evidence

- Focused TDD checks covered default-deny contexts, CLI pin, Netlify identity
  record, identity parser/preflight lifecycle, CI status-aware branching,
  removal of deploy-selectable local generation, and correct Git-link-then-
  enforce ordering.
- `python3 scripts/verify_project_skills.py` — PASS:
  `Project skill verification passed (2 approved project skills).`
- `make live-introductions-test` — PASS: **54 tests** in 2.902 seconds.
- `python3 -m py_compile scripts/live_introductions_catalog.py scripts/generate_live_introductions_prototype.py scripts/browser_acceptance_live_introductions.py scripts/verify_live_introductions_deploy_context.py tests/test_live_introductions_prototype.py`
  — PASS.
- `make live-introductions-build` — PASS; regenerated
  `dist/live-introductions` via the standalone Python generator only.
- `make live-introductions-browser` — PASS: **43 routes × 3 widths = 129
  HTTP-200 page checks**, loopback-only request boundary, navigation, reduced
  motion, print, interaction contrast (rest 5.05:1 · hover 4.55:1 ·
  focus-visible 5.45:1 · focus indicator 4.33:1), and seven mobile
  first-viewport states.
- `npx --yes netlify-cli@23.13.0 --version` — PASS:
  `netlify-cli/23.13.0 darwin-arm64 node-v22.22.3`.
- `make live-introductions-netlify-validate` — PASS: pinned CLI dry resolution
  for default/production/`dev`/custom/`deploy-preview`/`branch-deploy`, plus
  expected-denial offline builds that inspect resolved config and headers
  without executing generation-capable Netlify contexts. Final line:
  `Netlify configuration resolution: PASS (no generation executed).`
- `npx --yes netlify-cli@23.13.0 build --offline` / `--context production`
  — expected FAIL with `PRODUCTION_BLOCKED`.
- Explicit pinned builds for `dev` and `quality-review-custom` — expected FAIL
  with `DEV_CONTEXT_BLOCKED` and `UNAPPROVED_CONTEXT_BLOCKED`.
- `npx --yes netlify-cli@23.13.0 build --context branch:local-validation
  --offline` — expected FAIL with
  `UNAPPROVED_CONTEXT_BLOCKED: local-validation` (former bypass closed).
- Explicit pinned builds for `deploy-preview` and `branch-deploy` — expected
  FAIL before generation with `AWS_IDENTITY_UNVERIFIED`,
  `NETLIFY_IDENTITY_UNVERIFIED`, and `NETLIFY_NO_BUILD_BOUNDARY`.
- `make live-introductions-deploy-preflight` — expected FAIL, Make exit 2, with
  the same identity blockers and the truthful Git-link-then-enforce `--no-build`
  boundary warning.
- `ruby -e 'require "yaml"; YAML.load_file(".github/workflows/ci.yml")'` —
  PASS: `CI YAML parse: PASS`. The job branches on preflight status and never
  calls `netlify deploy`, `--prod`, `login`, `link`, or `init`.
- `git check-ignore -v .netlify/` — PASS; single `.netlify/` ignore rule.
  `.netlify/state.json` is absent.
- Unit fixture coverage proves valid unverified/verified lifecycle parsing,
  verified dual-record success, missing/malformed/unverified distinctions, and
  required Netlify production safeguards. Canonical smoke snapshots prove both
  identity files are unchanged by preflight.
- `git diff --check` on all todo-4 scoped files — PASS.

## Limits and deployment status

This remains a synthetic, fictional, static review artifact. It provides no
backend, authentication, adult assurance, streaming, recording, facilitation,
reporting, messaging, matching, location, safety operations, research
operations, or real-user readiness. Static navigation and browser checks do not
prove those capabilities or constitute release evidence.

No Netlify authentication, site creation, site linking, `netlify deploy`, AWS
apply, external deployment, commit, approval, or release occurred. The canonical
AWS and Netlify staging identity records both remain **UNVERIFIED**. No Netlify
team/site identity or site-level production safeguard has been human-verified;
the record deliberately uses `null` rather than fabricating current settings.
Production remains prohibited.

The repository verifier improves ordinary build safety but cannot block
`deploy --no-build`. Only the human-configured site-level Git-only deployment
control can close the documented production CLI/MCP/API path. It is not yet
verified, so no external deployment is authorized.

## Exact next human actions

1. An AWS account owner must verify that the intended account is staging-only,
   contains no production data/DNS, and personally complete
   `infra/terraform/environments/staging/ACCOUNT_IDENTITY.md` with the real
   account ID, verifier, UTC timestamp, and `VERIFIED` status.
2. A Netlify team/site owner must, in this order:
   - create the staging-only Netlify project without authorizing or publishing a
     deployment;
   - link the Git repository without authorizing or publishing a deployment
     (if the UI cannot defer that first build, stop and leave the record
     `UNVERIFIED`);
   - immediately enable **Enforce Git-based deployments** and the required
     production publishing lock after linking;
   - verify no production data/domain and record the real team/site fields,
     safeguard states, verifier, and UTC timestamp in
     `infra/netlify/environments/staging/ACCOUNT_IDENTITY.md` as `VERIFIED`.

Neither human action authorizes production or an external deployment by an
agent.
