# Roles and owners

**Status:** PLACEHOLDERS — replace before any real-user beta  
**Updated:** 2026-07-22

No autonomous agent may fill an owner field, approve its own work, or treat a placeholder as coverage.

| Role | Owner | Required responsibility |
|---|---|---|
| Executive launch | CHANGE_ME | Beta/production decision; scope, market, staffing, and risk acceptance |
| Legal counsel | CHANGE_ME | Terms, CSAE, NCII, §2258A process, proximity/location, relationship-phase consent, marketplace, payments |
| Privacy / DPO | CHANGE_ME | DPIA, sensitive questionnaire, intent/boundary processing, messages, relationship-phase prompts, location/proximity, rights requests, retention |
| Trust & safety lead | CHANGE_ME | Staffing, P0 coverage, enforcement, appeals, messaging/group/relationship-transition/proximity/location abuse |
| Security | CHANGE_ME | External review, identity/protocol, vault access, E2EE, bilateral phase receipts, attestation, bot controls |
| Local data custody | CHANGE_ME | Encrypted vault architecture, field allowlists, key custody, backup, recovery, migration, deletion, and export |
| Discovery fairness / ranking integrity | CHANGE_ME | Allowed features, proxy review, explainability, disparate-impact testing, exclusion leakage, empty-queue behavior, user recourse |
| Match and messaging protocol | CHANGE_ME | Signed likes, bilateral receipts, E2EE lifecycle, delivery semantics, replay/dedup, device changes, unmatch/block propagation |
| Relationship-transition consent | CHANGE_ME | Bilateral phase requests, consent copy, reversibility, prompt catalog, non-inference rules, decline privacy, return-to-casual behavior |
| Conversation safety | CHANGE_ME | Opening controls, spam/harassment protections, notification privacy, block/report UX, attachment/media boundaries, user recourse |
| Adult-assurance owner | CHANGE_ME | Provider design, DPA, credential issuance/revocation, appeal, network enforcement |
| Anti-abuse / integrity | CHANGE_ME | App Attest, Play Integrity, quotas, bot/Sybil red team, false-positive review |
| Proximity safety owner | CHANGE_ME | BLE consent, stalking controls, permissions, battery, replay/relay testing |
| Location safety owner | CHANGE_ME | Match-scoped grants, revocation, coercion response, location UI and testing |
| Mobile / store | CHANGE_ME | iOS/Android implementation, Apple/Google matrices, permission, notification, relationship-transition, and billing review |
| Marketplace / creator operations | CHANGE_ME | Skin Shop moderation, creator terms, IP reports, refunds, appeals |
| Payments / finance | CHANGE_ME | Platform billing, receipts, payouts, taxes, fraud, account segregation |
| Infrastructure | CHANGE_ME | Account attestation, KMS, service isolation, logging, retention, deployment |
| Child-safety contact | CHANGE_ME | Public contact, CSAE standards, urgent escalation, legal reporting process |
| NCII contact | CHANGE_ME | Public request channel, 48-hour workflow where applicable, case tracking |
| Accessibility | CHANGE_ME | Non-gesture controls, profile reveal, conversations, relationship-phase controls, haptics, motion, contrast, screen-reader acceptance |
| Impact / finance governance | CHANGE_ME | Allocation policy, conflicts, independent review, substantiated impact claims |

## Minimum separation of duties

- The person approving security may not be the sole author of the reviewed cryptographic, attestation, E2EE, bilateral-phase, or encrypted-vault implementation.
- Local data custody approval requires privacy and security review; a mobile implementation owner cannot approve the same vault alone.
- Discovery ranking approval requires product, privacy, safety, and fairness review; the ranking author cannot approve proxy or disparate-impact analysis alone.
- Match/messaging approval requires independent cryptographic, privacy, safety, mobile-notification, and protocol review; the state-machine author cannot alone approve bilateral consent or E2EE evidence.
- Relationship-transition approval requires legal, privacy, safety, accessibility, and product review; growth or retention owners cannot alone approve prompts, nudges, decline handling, or behavioral inference.
- Conversation-safety approval requires Trust & Safety and privacy participation; product growth owners cannot alone approve spam, notification, attachment, retention, or block/report behavior.
- Safety-evidence access requires a separately authorized safety role and audited purpose.
- Marketplace creator/payout staff receive no access to private dating, location, questionnaire, intent, boundary, match, message, relationship-phase, prompt-answer, or safety-case data.
- An executive approval cannot substitute for legal, privacy, security, child-safety, T&S, mobile-store, discovery-fairness, messaging-protocol, relationship-transition, or infrastructure approval.
- The adult-assurance, discovery-fairness, match/messaging, relationship-transition, conversation-safety, proximity, location, local-data-custody, and anti-abuse owners must sign feature-specific evidence before real-user activation.

## Coverage records

Before beta, each owner entry must point to:

1. a named person or contracted accountable organization;
2. an on-call or response schedule where relevant;
3. a backup owner;
4. approved contact channels;
5. the corresponding signed artifact in `approvals/` bound to the reviewed commit and environment.
