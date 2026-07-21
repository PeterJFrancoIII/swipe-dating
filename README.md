# LocalFirst Dating (Staging)

Adults-only, local-first, consent-driven swipe dating platform. The product is designed especially for adults ages **18–25** while remaining available only to eligible adults 18+.

Profiles, media, private intent, questionnaire answers, likes, matches, messages, and match-scoped location are designed to live primarily on user devices and move through consent-scoped end-to-end encrypted channels. A minimal ephemeral control plane handles presence, rendezvous, anti-abuse, revocation, and safety-reporting metadata.

> **STAGING / INTERNAL BUILD** — Not production. Temporary branding. Legal entity, support contacts, operational safety channels, and launch market are `CHANGE_ME` / `BLOCKED_PENDING_APPROVAL`.  
> **Real-user closed beta and production:** blocked until `docs/governance/release-gates.md` and authentic `approvals/` are satisfied.

## Current feature foundation

The current iOS staging build includes local/synthetic foundations for:

- **Get fk'd** — an off-by-default Discover-page proximity toggle with equal prompt-first privacy defaults for every gender;
- private adult `Looking For` modes, including dating, casual sex, group encounter, cuddles, movie night, activities, and conversation;
- optional gender-feed preferences using neutral categories;
- a versioned, sensitive, local alignment questionnaire and explainable synthetic ranking;
- **Skin Shop** synthetic cosmetic catalog and local mock entitlements;
- post-match location-consent choices and a synthetic Matched Map;
- expanded proximity, location, bot, group-consent, and marketplace report categories.

The repository does **not** yet implement real Bluetooth advertising/scanning, Core Location/MapKit transfer, StoreKit/Play Billing, creator uploads/payouts, App Attest, Play Integrity, a production adult-assurance provider, or staffed safety operations. Those are release-gated work, not implied by the staging UI.

## Quick start

```bash
make doctor
make bootstrap
make test-unit
make local-up   # requires Docker daemon; otherwise smoke-local fallback
```

iOS:

```bash
make ios-build
make local-services-up
```

The iOS app links the Rust UniFFI core for Simulator. Live discovery can publish signed presence to the local rendezvous service. Live ticket interest does **not** create a unilateral match; a reciprocal signed match flow remains required.

## Architecture summary

- **Mode A (default):** strict zero-store — discoverable only while online.
- **Mode B (flagged off):** sealed mailbox for optional encrypted envelopes.
- **Mode C (post-MVP):** personal availability node.
- **Proximity:** random rotating BLE IDs, no profile attributes in advertisements, local compatibility, consent-scoped profile capability.
- **Location:** pairwise, expiring, revocable, E2EE grants after mutual match only.
- **Alignment:** encrypted local answers and local explainable scoring.
- **Skin Shop:** separate public cosmetic asset/commerce plane with no dating-rank influence.
- **Anti-abuse:** layered account, root/device, adult, attestation, request, quota, and risk controls.

See `docs/architecture/system-overview.md` and ADRs under `docs/architecture/`.  
Feature interpretation: `docs/product/adult-feature-expansion.md`.  
Decentralization limits: `docs/governance/decentralization-limits.md`.

## Safety and governance

Blocking, reporting, emergency privacy, deletion, and appeals entry points remain free and non-paywalled. Safety tools reduce risk; they cannot guarantee identity, Bluetooth detection, prevent screenshots, erase peer-held copies, or make in-person meetings safe.

| Document | Role |
|---|---|
| `MISSION.md` | Current mission, constraints, and non-goals |
| `docs/specs/current-objective.md` | Active implementation slice |
| `docs/product/adult-feature-expansion.md` | Product requirements and implementation boundary |
| `policies/community-rules.md` | Behavior rules — DRAFT / UNAPPROVED |
| `docs/governance/release-gates.md` | Binding beta and production gates |
| `docs/governance/roles-and-owners.md` | Required accountable owners — placeholders remain |
| `docs/privacy/data-map.md` | Data custody, retention, processing boundaries, prohibited joins |
| `docs/security/threat-model.md` | Threat and abuse model |
| `docs/security/bot-sybil-strategy.md` | Layered integrity plan |
| `docs/audits/2026-07-21-adult-feature-expansion-review.md` | Latest readiness verdict |
| `docs/product/closed-beta-readiness.md` | Real-user beta checklist |
| `AGENTS.md` | Agent rules |
| `docs/operations/github-sync.md` | Local ↔ GitHub sync (`make sync`) |
| `docs/operations/ramdisk.md` | macOS RAM disk for agent-speed worktrees |
| `.cursor/commands/deploy-decentralized-dating-app.md` | Deploy runbook |

## Product boundaries

- adults 18+ only; no 16- or 17-year-old path;
- same privacy defaults for every gender;
- no exact-distance radar, covert tracking, or server encounter graph;
- no automatic location sharing on match;
- no ranking/filtering by race, ethnicity, skin color, height, disability, or photograph-inferred protected/intimate traits;
- no pay-to-win dating reach;
- no sale or behavioral advertising using dating, political, sexual, proximity, location, questionnaire, message, or photo data;
- no sexual-services marketplace.

## Repository authority

GitHub is the engineering source of truth. Use `make sync` for the documented bidirectional local workflow. Google Drive is a convenience mirror only.

## License

License deliberately unset. See `docs/legal/license-decision-required.md`.
