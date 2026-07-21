# ADR-0013: Layered bot, spam, scraping, and Sybil resistance

**Status:** Accepted for staging interfaces; provider integrations blocked  
**Date:** 2026-07-21

## Context

A free, low-friction dating app is attractive to profile farms, romance scammers, scrapers, automated mass-likers, report brigades, marketplace fraud, and Bluetooth harvesters. No single signal proves a unique, trustworthy adult.

## Decision

Use independent layered controls:

1. passkey or equivalent phishing-resistant account authentication;
2. root-authorized device key and revocation;
3. expiring, revocable adult-eligibility credential;
4. iOS App Attest / Android Play Integrity assertion bound to a server challenge and request hash;
5. signed service requests and persistent replay prevention;
6. pairwise/anonymous quotas and adaptive velocity limits;
7. risk challenges such as additional attestation or bounded proof-of-work for elevated risk;
8. human review and appeal for consequential containment.

Risk systems may process request velocity, profiles per attested device, impossible travel, BLE replay, repeated content hashes, malicious domains, coordinated reports, purchase/refund abuse, and other purpose-limited technical signals.

Risk systems must not use private message plaintext, questionnaire answers, sexual intent, orientation, gender, race, ethnicity, disability, or marketplace spending as general bot-risk inputs.

Ordinary human use remains free. Payment is not proof of humanity.

## Consequences

- Unsupported devices need an explicit lower-trust path rather than silent full trust.
- Attestation providers require server-side verification and operational key management.
- False-positive controls, reason categories, retention limits, and appeals are launch requirements.
- Bot controls must be red-teamed against both bypass and discriminatory impact.

## Rejected alternatives

- Device attestation as the only identity or age control.
- Mandatory payment to create or use an account.
- Secret permanent shadow bans without appeal.
- Reading private messages by default for generalized bot detection.
- A single global identifier joining all user activity.
