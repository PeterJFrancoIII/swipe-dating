# Roles and owners

**Status:** PLACEHOLDERS — replace before any real-user beta  
**Updated:** 2026-07-21

| Role | Owner | Responsibilities / gate |
|---|---|---|
| Executive launch | CHANGE_ME | Cohort limits, launch markets, production gate, incident authority |
| Legal counsel | CHANGE_ME | Terms, CSAE, NCII, §2258A process, proximity/location/sexual modes, marketplace, consumer law |
| Privacy / DPO | CHANGE_ME | DPIA, consent, sensitive data, rights requests, retention, vendor review |
| Trust & safety lead | CHANGE_ME | Staffing, P0 coverage, policy, appeals, proximity/location/group abuse |
| Security lead | CHANGE_ME | Threat model, external review, attestation, keys, vault access, incident response |
| Identity / age assurance | CHANGE_ME | Passkeys, adult credentials, device lifecycle, revocation, provider operations |
| Proximity safety owner | CHANGE_ME | BLE consent, stalking controls, venue red team, battery/background validation |
| Location safety owner | CHANGE_ME | Grant/revocation design, coercion response, precision and privacy review |
| Messaging / crypto | CHANGE_ME | Identity binding, bilateral receipts, E2EE, replay, external cryptographic review |
| Anti-abuse / integrity | CHANGE_ME | App Attest, Play Integrity, quotas, models/rules, false positives, appeals, kill switches |
| Mobile / store | CHANGE_ME | iOS/Android builds, permissions, accessibility, store matrices and review |
| Marketplace product | CHANGE_ME | Skin Shop formats, creator UX, catalog, entitlement boundary |
| Marketplace moderation / copyright | CHANGE_ME | Asset policy, copyright intake, impersonation, appeals, SLA |
| Marketplace finance | CHANGE_ME | Billing, refunds, tax, sanctions, payout holds, chargebacks, creator accounting |
| Questionnaire / ranking | CHANGE_ME | Catalog versioning, local score explainability, fairness/proxy review |
| Infrastructure | CHANGE_ME | Account attestation, network isolation, KMS, backups, cost and deploy controls |
| Safety evidence custodian | CHANGE_ME | Evidence vault RBAC, retention, legal holds, audit and break-glass |
| Child-safety contact | CHANGE_ME | Public contact, CSAE process, human legal reporting workflow |
| NCII contact | CHANGE_ME | Victim/non-user intake, case tracking, removal workflow and notices |
| Support lead | CHANGE_ME | User support, rights routing, accessibility, incident communication |
| Impact / finance | CHANGE_ME | Allocation policy, conflicts, independent review, evidence-backed claims |

## Separation of duties

- No single person should be able to approve, deploy, and conceal a production change affecting adult eligibility, proximity, location, crypto, safety evidence, or payments.
- Marketplace finance and creator operations have no access to dating messages, questionnaire answers, location grants, or safety evidence.
- Trust & safety reviewers do not receive unrestricted infrastructure or payment access.
- Engineers do not self-approve external security, counsel, privacy, store, or executive gates.
- Autonomous agents may prepare evidence but may not fill owner names, sign approvals, make legal reports, or release production.

## Before real-user beta

Every `CHANGE_ME` role applicable to the beta scope must have:

- a named person or contracted provider;
- an on-call/escalation path;
- access defined by least privilege;
- training appropriate to the role;
- documented backup coverage;
- approval freshness and exact commit/artifact binding;
- conflict-of-interest disclosure where applicable.
