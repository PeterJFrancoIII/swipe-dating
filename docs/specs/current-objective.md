# Current objective — adult consent feature foundation

**Updated:** 2026-07-21  
**Branch:** `agent/adult-consent-features`  
**Environment:** synthetic/internal staging only  
**Release state:** closed beta and production blocked

```yaml
mission_control_packet:
  project_name: local-first-dating-platform
  objective_id: adult-consent-features-2026-07-21
  user_objective: >
    Add adult proximity alerts, purchasable/custom avatars and skins, optional
    matched-location maps, private Looking For modes, inclusive gender and
    orientation preferences, lifestyle/grooming filters, a values/intimacy
    questionnaire, local compatibility ranking, and strong bot resistance.
  safety_resolution:
    - The requested 16-25 audience is implemented as an 18+ service designed
      especially for adults 18-25. No 16/17-year-old access is permitted.
    - Gender does not determine profile-disclosure defaults. Prompt before sharing
      is the default for every adult; automatic disclosure is explicit opt-in.
    - Real BLE, real location, real billing, real sensitive-answer exchange, and
      real-user beta remain blocked until feature-specific gates pass.
  staging_deliverables:
    - Get fk'd switch on the main swipe page
    - equal consent and compatible-adult proximity preferences
    - simulated haptic nearby encounter without BLE identity payload
    - Skin Shop catalog, local preview entitlement, creator prototype
    - optional synthetic match-area / meeting-pin / live-location map grants
    - Looking For taxonomy including adult sexual and nonsexual intentions
    - separate gender identity, orientation, Show me, and visibility controls
    - activity, conversation, body-hair, fragrance, and coarse-distance preferences
    - versioned hard-coded questionnaire with local transparent scoring
    - Rust anti-abuse primitives for adult/passkey/device/attestation gates,
      request binding, replay rejection, velocity, challenge, and containment
    - revised mission, rules, data map, threat model, ADRs, audit, and release gates
    - blocking CI for Rust and current mobile build targets
  non_goals_for_this_slice:
    - minor access or mixed minor/adult graph
    - real Bluetooth scan/advertise transport
    - real user coordinates or background location
    - real StoreKit/Play purchases, creator payouts, or asset publication
    - central questionnaire answer storage
    - production fraud model or unique-human proof
    - public beta, production deployment, or store submission
  target_users:
    primary: adults 18-25 seeking consent-based dating and social connection
    permitted: other adults 18+ subject to launch-market policy
    excluded: every person under 18
  architecture:
    style: hybrid local-first with ephemeral control plane
    new_components:
      - consent-based BLE proximity protocol (ADR-0009; transport pending)
      - recipient-scoped E2EE location grants (ADR-0010; transport pending)
      - local sensitive alignment system (ADR-0011)
      - isolated public Skin Shop domain (ADR-0012; commerce pending)
      - layered anti-abuse policy core (ADR-0013)
  privacy_invariants:
    - no profile/gender/intent/stable ID in Bluetooth advertisements
    - no automatic location on match
    - no sensitive questionnaire plaintext in control plane or telemetry
    - no protected-trait or spending-based ranking
    - marketplace has no access to dating or safety data
  consent_invariants:
    - prompt-before-proximity-disclosure for every gender
    - live messaging only after reciprocal authenticated interest
    - sexual intent visible only to independently compatible adults
    - group participant changes require renewed unanimous consent
    - every location grant is explicit, current-match-only, expiring, revocable
  verification:
    automated:
      - cargo fmt --all -- --check
      - cargo clippy --workspace --all-targets -- -D warnings
      - cargo test --workspace
      - bash scripts/feature_policy_check.sh
      - Android assembleDebug
      - make ios-build
      - production preflight must remain blocked
    manual_or_external:
      - BLE stalking/linkability/battery red team
      - adult-credential and attestation integration
      - E2EE location protocol and revocation acknowledgement
      - marketplace parser/billing/moderation/finance review
      - questionnaire DPIA/fairness/private-comparison review
      - staffed T&S and legal/store approvals
  completion_condition: >
    Merge only after branch CI is green and review confirms all unfinished high-risk
    capabilities remain visibly blocked. Merging this foundation is not approval
    for real-user beta or production.
```

## Immediate next engineering slices

1. Fix any branch CI failures and make mobile checks truly blocking.
2. Implement cryptographic identity binding and bilateral match validation.
3. Add network adult credentials, passkeys, authorized-device lifecycle, and server attestation verification.
4. Design/test rotating BLE encounter IDs without enabling real-user transport.
5. Design/test recipient-bound E2EE location envelopes and revocation acknowledgements.
6. Build hardware-backed local storage adapters and a bounded media re-encode pipeline.
7. Build authenticated safety case/evidence/appeal operations.

## Stop conditions

Stop before:

- real user enrollment;
- collecting real Bluetooth encounters or coordinates;
- charging money or paying creators;
- exchanging real sensitive questionnaire answers;
- deploying cloud staging without verified account identity;
- creating, signing, or simulating human approvals;
- production or store submission.
