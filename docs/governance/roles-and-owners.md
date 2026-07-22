# Roles and owners

**Status:** PLACEHOLDERS — replace before any real-user beta  
**Updated:** 2026-07-22

No autonomous agent may fill an owner field, approve its own work, or treat a placeholder as coverage.

| Role | Owner | Required responsibility |
|---|---|---|
| Executive launch | CHANGE_ME | Beta/production decision; scope, market, staffing, and risk acceptance |
| Legal counsel | CHANGE_ME | Terms, CSAE, NCII, §2258A process, proximity/location, marketplace, payments |
| Privacy / DPO | CHANGE_ME | DPIA, sensitive questionnaire, location/proximity, rights requests, retention |
| Trust & safety lead | CHANGE_ME | Staffing, P0 coverage, enforcement, appeals, group/proximity/location abuse |
| Security | CHANGE_ME | External review, identity/protocol, vault access, attestation, bot controls |
| Local data custody | CHANGE_ME | Encrypted vault architecture, field allowlists, key custody, backup, recovery, migration, deletion, and export |
| Adult-assurance owner | CHANGE_ME | Provider design, DPA, credential issuance/revocation, appeal, network enforcement |
| Anti-abuse / integrity | CHANGE_ME | App Attest, Play Integrity, quotas, bot/Sybil red team, false-positive review |
| Proximity safety owner | CHANGE_ME | BLE consent, stalking controls, permissions, battery, replay/relay testing |
| Location safety owner | CHANGE_ME | Match-scoped grants, revocation, coercion response, location UI and testing |
| Mobile / store | CHANGE_ME | iOS/Android implementation, Apple/Google matrices, permission and billing review |
| Marketplace / creator operations | CHANGE_ME | Skin Shop moderation, creator terms, IP reports, refunds, appeals |
| Payments / finance | CHANGE_ME | Platform billing, receipts, payouts, taxes, fraud, account segregation |
| Infrastructure | CHANGE_ME | Account attestation, KMS, service isolation, logging, retention, deployment |
| Child-safety contact | CHANGE_ME | Public contact, CSAE standards, urgent escalation, legal reporting process |
| NCII contact | CHANGE_ME | Public request channel, 48-hour workflow where applicable, case tracking |
| Accessibility | CHANGE_ME | Non-gesture controls, haptics, motion, contrast, screen-reader acceptance |
| Impact / finance governance | CHANGE_ME | Allocation policy, conflicts, independent review, substantiated impact claims |

## Minimum separation of duties

- The person approving security may not be the sole author of the reviewed cryptographic, attestation, or encrypted-vault implementation.
- Local data custody approval requires privacy and security review; a mobile implementation owner cannot approve the same vault alone.
- Safety-evidence access requires a separately authorized safety role and audited purpose.
- Marketplace creator/payout staff receive no access to private dating, location, questionnaire, or safety-case data.
- An executive approval cannot substitute for legal, privacy, security, child-safety, T&S, mobile-store, or infrastructure approval.
- The adult-assurance, proximity, location, local-data-custody, and anti-abuse owners must sign feature-specific evidence before real-user activation.

## Coverage records

Before beta, each owner entry must point to:

1. a named person or contracted accountable organization;
2. an on-call or response schedule where relevant;
3. a backup owner;
4. approved contact channels;
5. the corresponding signed artifact in `approvals/` bound to the reviewed commit and environment.
