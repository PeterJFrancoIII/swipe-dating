# Mission Control Packet

```yaml
mission_control_packet:
  project_name: local-first-dating-platform
  user_objective: >
    Build and deploy a complete staging implementation of a local-first,
    privacy-preserving adults-only swipe dating app; prepare production
    artifacts; stop before production without fabricating approvals.
  current_objective: >
    Phase 0+ execution of deploy-decentralized-dating-app.md on
    feat/local-first-dating-platform after verified SHA-256 integrity.
  success_criteria:
    - Staging platform with control plane + E2EE peer path scaffolds
    - Tests, CI, IaC, safety/privacy docs, and final agent report
    - Production gate blocks autonomous production deploy
  non_goals:
    - Production deploy / store submission / real legal filings
    - Minors, public feeds, crypto, facial recognition, peer replication MVP
  target_users:
    - Adults 18+ seeking mutual-consent dating discovery
    - Operators running staging for closed beta preparation
  constraints:
    time: autonomous session until staging gate / production stop
    budget: local and staging-only; no vendor purchases by agent
    stack: Rust core, UniFFI, iOS/Android, Axum services, PG, Valkey, Terraform
    compliance: adults-only; fail-closed age/auth; drafts marked unapproved
    deployment: staging allowed; production forbidden to autonomous agent
  assumptions:
    confirmed:
      - Repository was greenfield (Research/ only) at start
      - Command SHA-256 matches Research/*.sha256
      - Rust stable 1.97.1 installable via rustup
    unconfirmed:
      - Staging cloud account credentials available for Phase 17 apply
      - Docker daemon availability for local compose
      - Java/Android SDK and Terraform installability on this host
  architecture_hypothesis:
    style: hybrid local-first with ephemeral control plane
    main_components:
      - name: core
        responsibility: identity, protocol, crypto adapters, matching, storage interfaces
      - name: services
        responsibility: rendezvous, signaling metadata, TURN creds, push broker, report ingest
      - name: apps
        responsibility: native iOS/Android UI with UniFFI audited-core boundary
      - name: safety
        responsibility: block/report/appeal and isolated evidence vault interfaces
  data_classification:
    public: [protocol docs, openapi contracts, community rules drafts]
    internal: [staging metrics aggregates, feature flags]
    confidential: [push tokens, pseudonymous block tokens, presence leases]
    regulated: [age eligibility results, safety report evidence, identity docs NEVER retained]
  integrations:
    required: [WebRTC/TURN, APNs/FCM interfaces, age-assurance interface, attestation interface]
    optional: [sealed mailbox disabled by default, personal availability node post-MVP]
  risks:
    product: [background suspension limits zero-store availability]
    technical: [missing Java/Terraform/Docker on host]
    security: [metadata leakage via TURN/push; no bespoke crypto]
    delivery: [staging cloud credentials may block Phase 17 apply]
  verification_plan:
    static_checks: [cargo fmt/clippy, make lint, schema lint]
    unit_tests: [cargo test --workspace, protocol vectors]
    integration_tests: [compose local control plane]
    e2e_tests: [synthetic device pair smoke when runners available]
    manual_acceptance: [staging smoke; production gate must fail]
  first_three_slices:
    - objective: Preflight + constitution scaffolding
      allowed_files: [docs/**, .cursor/**, AGENTS.md, MISSION.md, governance root files]
      forbidden_files: [production secrets, real user data]
      done_when: [preflight report, state JSON, Phase 0 commit]
    - objective: Architecture ADRs and threat model
      allowed_files: [docs/architecture/**, docs/privacy/**, docs/security/**, docs/product/**]
      forbidden_files: [apps/** feature code before ADR freeze]
      done_when: [ADRs 0001-0008, data-map, threat-model]
    - objective: Toolchains and CI skeleton
      allowed_files: [Cargo.*, core/**, Makefile, .github/**, apps/** skeletons]
      forbidden_files: [infra production apply]
      done_when: [make doctor/bootstrap/test-unit pass or blockers documented]
```
