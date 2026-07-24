# Mission Control Packet

```yaml
mission_control_packet:
  project_name: local-first-dating-platform
  updated_at: 2026-07-21
  branch: agent/consent-proximity-marketplace-preferences
  user_objective: >
    Extend the adults-only local-first dating app with consent-based Bluetooth
    proximity, a cosmetic Skin Shop, optional match-scoped location sharing,
    private Looking For modes, inclusive identity and discovery preferences,
    local sensitive compatibility ranking, and layered bot/Sybil resistance.
  current_objective: >
    Land a truthful staging foundation: governance, architecture decisions,
    local models, synthetic UI, and regression fixes. Do not activate real
    Bluetooth, location, payments, attestation vendors, minors, or production.
  success_criteria:
    - Get fk'd toggle is visible on Discover and defaults off
    - Prompt-before-share is the default for every gender
    - Live discovery tickets no longer create unilateral matches
    - Declining location no longer maps to a real fallback region
    - Preferences and versioned questionnaire are local-first
    - Synthetic Skin Shop and matched-location consent UI are clearly labeled
    - Rust alignment scoring has deterministic unit tests
    - Governance and release gates cover proximity, location, marketplace, sensitive data, and bots
    - Closed beta and production remain blocked
  non_goals:
    - Any access for people under 18
    - Gender-asymmetric disclosure defaults
    - Real BLE advertising/scanning in this slice
    - Real Core Location, MapKit tracking, or background location in this slice
    - StoreKit, Play Billing, creator uploads, payouts, or public marketplace in this slice
    - Real App Attest, Play Integrity, adult-assurance vendor, or production credentials
    - Production deploy, store submission, real legal filing, or fabricated approval
  target_users:
    - Adults 18+; product design emphasis on adults 18-25
    - Internal operators using synthetic staging data
  constraints:
    stack: Rust core, UniFFI, SwiftUI iOS first, Kotlin Android later, Axum control plane
    privacy: local-first, E2EE, equal defaults, no encounter graph, no sensitive ads
    safety: adult-only, mutual consent, free block/report/emergency controls
    marketplace: cosmetics only, isolated plane, no pay-to-win dating
    deployment: staging scaffold only; beta/production human-gated
  architecture:
    proximity: ADR-0009, random rotating BLE IDs, off by default
    location: ADR-0010, match-scoped expiring E2EE grants
    alignment: ADR-0011, local scoring and sensitive-category consent
    marketplace: ADR-0012, isolated declarative public assets
    anti_abuse: ADR-0013, layered account/device/adult/request/risk controls
  data_classification:
    public:
      - community rules and product documentation
      - reviewed Skin Shop assets and catalog metadata
    internal:
      - synthetic catalog
      - feature flags
      - aggregate technical metrics
    confidential:
      - presence capabilities
      - purchase entitlements
      - bot-risk state
    sensitive:
      - gender and orientation
      - Looking For modes
      - political and intimacy questionnaire answers
      - proximity grants
      - match-scoped location
    regulated:
      - adult-eligibility results
      - safety report evidence
      - creator payout/tax records
  verification_plan:
    static_checks:
      - cargo fmt --all -- --check
      - cargo clippy --workspace --all-targets -- -D warnings
      - Swift build / Xcode build
    unit_tests:
      - cargo test -p dating-matching
      - questionnaire alignment dealbreaker and weighting tests
    integration_tests:
      - one-sided live ticket cannot match
      - hidden region cannot publish presence
      - production preflight remains blocked
    future_adversarial_tests:
      - BLE replay and long-range scanning
      - modified client bypass
      - location replay and stale cache
      - bot/profile farm
      - marketplace hostile asset and receipt replay
  implementation_slices:
    - objective: Governance and ADR update
      status: complete_on_feature_branch
    - objective: Local preference, questionnaire, and alignment model
      status: in_progress
    - objective: iOS staging controls and synthetic views
      status: in_progress
    - objective: Provider/platform integrations
      status: blocked_by_release_gates
```
