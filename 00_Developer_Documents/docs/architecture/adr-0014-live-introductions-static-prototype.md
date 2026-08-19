# ADR-0014: Live Introductions static synthetic prototype

**Status:** Accepted for a local static prototype; external deployment blocked  
**Date:** 2026-07-23

## Context

`docs/product/live-introductions-ux.md` defines a synthetic, fictional UX
walkthrough with 39 numbered frames. The walkthrough needs a reviewable artifact
without implying that Live Introductions, research operations, safety operations,
or any real-user capability exists.

The existing FastAPI product runtime and governed AWS infrastructure have
different security, privacy, release, and operational boundaries. Coupling a
design prototype to either boundary would create avoidable deployment and
capability ambiguity.

## Decision

Build the prototype as a Python-generated static synthetic artifact:

- Keep its catalog, future generator, and generated files separate from the
  FastAPI/product runtime and from governed AWS infrastructure.
- Treat `docs/product/live-introductions-ux.md` as immutable product source.
- Provide exactly 39 directly addressable frames: V01–V19 plus V08A, F01–F08,
  C01–C08, and S01–S03.
- Type every transition as a user control, facilitator control, automatic system
  transition, or review/atlas link. System and review transitions are catalog
  metadata and must never render as participant or facilitator controls.
- Give rendered controls immutable explicit audience sets. Shared S02/S03
  controls may apply to viewer, featured-participant, and facilitator roles,
  while target-specific block, connection, re-entry, and facilitation controls
  remain limited to their named role sets. `CROSS_ROLE` is never queried as an
  actual product audience.
- Keep fixed-start admission, fixed-end resolution, fail-closed integrity
  resolution, and known-neutral closure system-owned. Viewer, featured
  participant, and facilitator controls may arm, request, or decide only the
  actions assigned to those roles.
- Return ordered frame-body controls and ordered shell metadata through separate
  public helpers. Shell order is synthetic status, atlas navigation, Safety,
  then applicable guarded **Withdraw preview consent**. Persistent controls are
  not duplicated in frame-body results.
- Publish fixed-end terminal precedence as immutable machine-readable rules:
  committed facilitator C07, unresolved safety/integrity S01, known-neutral C08,
  then healthy normal C06. C03 and C05 system transitions use that exact order;
  a generator must not recover precedence from prose.
- Require successful mutual-readiness revalidation before V18 can resolve to
  V19. Failed or non-mutual revalidation returns to fresh V18 choices without a
  cause; V19-to-V17 is ordinary return navigation only.
- Use semantic HTML, local CSS, and normal links. Navigation must work without
  client-side routing.
- Keep all people, rooms, copy, outcomes, and media synthetic or fictional.
- Implement no backend, JavaScript framework, real data, real recording,
  location, report, messaging, matching, meeting, safety-case, or research
  capability.
- Add no analytics, tracking, remote fonts, remote images, remote scripts,
  remote styles, or other remote assets.
- Keep the generated artifact and production build standard-library-only.
  Isolate the pinned Playwright browser-acceptance dependency in the
  non-package test project at `tools/live-introductions-browser/`; it is not a
  runtime or generated-site dependency.
- Do not present the artifact as beta, production, an operational study, or an
  approved real-user experience.

The repository-root Netlify configuration is default-deny and exposes no
deploy-selectable context that generates without the canonical deployment
preflight. Hosted `deploy-preview` and `branch-deploy` commands must first
validate the canonical human-owned AWS and Netlify staging identity records,
then validate their context, then generate. Production (including the CLI's
default build context), `dev`, and unknown/custom contexts fail before
generation. Standalone local generation remains outside Netlify in
`make live-introductions-build`.

Local and CI configuration checks pin Netlify CLI 23.13.0. They resolve the
default, production, `dev`, unknown/custom, preview, and branch contexts with
`build --dry`, and exercise only expected-denial non-hosted builds to inspect
the resolved command and headers. This validation path never executes a
generation-capable Netlify context.

These build commands are not an upload security boundary. Netlify deployment
normally builds, but its `--no-build` option bypasses TOML and every repository
verifier. No local code can block that raw upload path. Before any external
deployment, a human must create the staging-only Netlify project and Git-link
this repository without authorizing or publishing a deployment. If the UI
cannot defer that first build, the human must stop. Only after Git linking may
the human confirm and immediately enable **Enforce Git-based deployments** and
the required production publishing lock, verify the IDs and staging-only scope,
and mark
`infra/netlify/environments/staging/ACCOUNT_IDENTITY.md` `VERIFIED`. Until both
canonical identity records are well-formed `VERIFIED` records with those
Netlify safeguards true, external deployment is unauthorized. None of these
records or settings constitutes production approval.

## Alternatives considered

### Add prototype routes to FastAPI

Rejected. This would blur the boundary between a visual review artifact and the
product runtime, and could imply backend or operational capability.

### Build a JavaScript single-page application

Rejected. Client-side routing and framework state add unnecessary complexity,
reduce no-script reviewability, and make static transition auditing harder.

### Host through governed AWS infrastructure

Rejected. The prototype needs no cloud service, database, identity, or
production-like infrastructure, and the staging account identity is unverified.

### Hand-author 39 independent HTML files

Rejected. Repeated shell, safety, terminology, and transition rules would drift.
A typed immutable Python catalog gives a single auditable source for later
generation.

### Use remote design assets or analytics

Rejected. Remote requests add privacy, reliability, provenance, and tracking
questions without improving the static review objective.

## Consequences

- The artifact can be inspected locally as ordinary files with no service
  process, credentials, network access, or product data.
- Frame inventory, role ownership, terminology, fields, transitions, and
  terminal-continuation rules can be tested through a small Python API.
- Browser acceptance is reproducible from a tracked lockfile without depending
  on another workspace or adding Playwright to the production artifact.
- Netlify configuration validation resolves every relevant context without
  generation; hosted builds remain status-aware and identity-gated, while
  production/default, `dev`, and custom contexts are tested deny paths.
- Site-level Git-only production enforcement is a required human control because
  repository build commands cannot prevent a raw upload that bypasses builds.
- A future generator can request audience-filtered frame controls, ordered shell
  metadata, system transitions, terminal precedence, and review links separately
  rather than inferring ownership or priority from labels and destinations.
- Semantic markup and normal links remain available to keyboard, screen-reader,
  no-script, and static-link review.
- The catalog duplicates selected UX copy intentionally; source-fidelity tests
  and review are required when the immutable product source changes.
- Static controls demonstrate intended states only. They cannot prove streaming,
  age assurance, facilitation, blocking, reporting, messaging, location,
  accessibility, safety operations, or research readiness.
- A later generator and styling task must preserve this ADR and must not add
  runtime behavior, instrumentation, remote dependencies, or deploy authority.

## Verification

For this catalog slice:

```bash
python3 -m unittest tests.test_live_introductions_prototype
python3 -m py_compile scripts/live_introductions_catalog.py tests/test_live_introductions_prototype.py
```

The tests must verify the exact inventory and role counts, unique IDs, complete
rendering data, valid declared targets, source terminology, blocked-capability
copy, canonical frame order, key frame actions/transitions, role-appropriate
audience sets, system/user/review separation, disjoint ordered shell and frame
actions, fixed-end precedence, mutual-readiness revalidation, public catalog
helpers, and terminal-continuation constraints.

A later generated-artifact slice must additionally verify 39 addressable HTML
frames, semantic landmarks and headings, normal-link reachability, local-only
assets, absence of JavaScript and analytics, and visible synthetic/fictional
markers. Those checks do not authorize external deployment.
