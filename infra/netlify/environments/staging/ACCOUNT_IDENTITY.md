# Netlify staging team and site identity

**Status: UNVERIFIED**

This human-owned record gates hosted Live Introductions `deploy-preview` and
`branch-deploy` builds. It is not a production approval. External deployment is
unauthorized until a human verifies this record and the canonical AWS staging
identity.

## Required verification

A human operator must complete these steps in order:

1. Create the staging-only Netlify project without authorizing or publishing a
   deployment. Confirm the intended team/project contains no production data
   and uses no production domain.
2. Link the Git repository without authorizing or publishing a deployment.
   If the UI cannot defer the first build, stop and leave this record
   `UNVERIFIED`.
3. After linking, immediately enable **Enforce Git-based deployments** and
   confirm it prevents production deploys through CLI, MCP, and API paths.
4. Enable the required production publishing lock.
   If the required production publishing lock is unavailable after linking, stop
   and leave this record `UNVERIFIED`. If Netlify exposes an additional
   automatic-production-
   publishing lock for this site, enable it and record both support and enabled
   state. Do not infer or fabricate unsupported/current settings.
5. Verify and record the Netlify team ID/slug, site ID/name/URL, repository link
   state, staging-only scope, no-production-data/domain state, verifier, and UTC
   time.
6. Change both displayed and structured status to `VERIFIED` only after every
   required field and safeguard below is truthful.

`netlify deploy` normally builds, but `deploy --no-build` bypasses every TOML
build command and repository verifier. Local code cannot block a raw CLI upload.
No external deployment is authorized while this setup sequence is incomplete or
this record is `UNVERIFIED`.

## Record (human-owned)

```yaml
status: UNVERIFIED
platform: netlify
team_id: REPLACE_ME
team_slug: REPLACE_ME
site_id: REPLACE_ME
site_name: REPLACE_ME
site_url: null
git_repository_linked: false
staging_only: null
contains_production_data: null
uses_production_domain: null
enforce_git_based_production_deploys: null
production_publish_lock_supported: null
production_publish_lock_enabled: null
automatic_production_publishing_lock_supported: null
automatic_production_publishing_lock_enabled: null
verified_by: null
verified_at_utc: null
notes: >
  Agents must never mark this record VERIFIED. A human must verify the
  staging-only team/site identity and site-level production safeguards.
```

## Autonomous agent rule

Agents must never mark this record VERIFIED, link/create a site, authenticate,
or deploy. Missing, malformed, or `UNVERIFIED` records must fail closed.
