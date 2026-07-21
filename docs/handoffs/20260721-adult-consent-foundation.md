# Adult consent feature foundation handoff — 2026-07-21

## Branch and PR

- Branch: `agent/adult-consent-features`
- Draft PR: #2
- Base: current `main` including the macOS RAM-disk workflow
- Backup branch retained: `agent/adult-consent-features-backup`

## Incorporated product direction

- Get fk'd main-page proximity control, equal prompt-before-sharing default, compatible adult/gender/intent settings, and local haptic simulation.
- Skin Shop staging catalog, local preview entitlements, and safe declarative creator prototype.
- Optional synthetic approximate match area, meeting pin, and 15m/1h/4h match-location grants.
- Looking For modes including adult sexual and nonsexual intent.
- Separate gender identity, orientation, Show me, and visibility controls.
- Activity, conversation, body-hair, fragrance, and coarse-distance preferences; no protected-trait/height/spending ranking.
- Versioned political, education/work, money/health, relationship, communication, intimacy, lifestyle, and values questionnaire with local transparent scoring.
- Rust anti-abuse foundation for adult/passkey/device/attestation gates, request binding, replay, velocity, challenge, and containment.

## Mandatory resolutions

- Strict adults-only 18+ service; designed especially for adults 18–25. No 16/17-year-old mode.
- Gender never changes proximity disclosure defaults. Prompt before sharing is the default for every adult.
- Live one-sided interest is not a match.
- Matching never shares location automatically.
- Marketplace purchases cannot affect dating reach, ranking, integrity treatment, or safety access.

## Staging-only boundaries

The branch does not enable:

- real BLE scanning/advertising or encounter collection;
- real coordinates/background location;
- real purchases, publication, or creator payouts;
- real sensitive-answer exchange;
- network adult credentials, passkeys, App Attest, or Play Integrity;
- production WebRTC/E2EE;
- real-user beta or staffed safety operations.

## Verification paths

```bash
make feature-policy-check
make lint
make test-unit
make test-integration
make android-build
make ios-build
make production-preflight   # must block without approvals
```

GitHub Actions is configured to run policy, Rust, Android, iOS, command-integrity, and expected production-gate jobs. Do not record any job as passed until the corresponding workflow run is observed.

## Release state

```text
INTERNAL_SYNTHETIC_DOGFOOD_ALLOWED
REAL_USER_CLOSED_BETA_BLOCKED
PRODUCTION_BLOCKED_HUMAN_APPROVALS_REQUIRED
```
