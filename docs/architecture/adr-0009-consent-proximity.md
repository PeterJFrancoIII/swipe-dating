# ADR-0009: Consent-based adult proximity (“Get fk'd”)

Date: 2026-07-21  
Status: accepted for staging UX; transport blocked for real users  
Decision owners: Product + Privacy + Security + Trust & Safety

## Context

The product needs an on/off proximity alarm on the main swipe screen. A naive BLE broadcast containing profile identity, gender, sexual intent, or a stable identifier would enable venue mapping, stalking, correlation, scraping, and involuntary disclosure. Gender-asymmetric defaults would also make privacy depend on gender rather than the user’s own consent.

Mobile operating systems cannot guarantee continuous background delivery, and a proximity alert must never be interpreted as consent to contact, profile disclosure, sex, touch, following, or location sharing.

## Decision

- Keep the product label **Get fk'd** in the staging UI; store-facing naming remains a release decision.
- Restrict the mode to adults with a valid, expiring network adult credential.
- Default the feature **off** for every user.
- Default profile disclosure to **prompt before sharing** for every gender.
- Permit an explicit `automaticCompatible` option only after the user chooses compatible genders and intentions.
- BLE advertisements carry only a random, unlinkable, short-lived encounter identifier and protocol capability bits.
- Never place root profile IDs, rendezvous IDs, names, gender, orientation, intent, photos, push tokens, or precise location in BLE advertisements.
- Use BLE only for discovery and a minimal authenticated handshake. Transfer profile capsules through relay-first WebRTC/QUIC after consent.
- Produce at most one haptic per encounter/cooldown window.
- Suppress blocked users and revoked devices before profile exchange.
- Emergency privacy stops advertising/scanning and clears local encounter state.
- Do not retain a central encounter graph.

## Required protocol

```text
BLE advertisement
  random rotating encounter id
  protocol version
  coarse capability flags
        ↓
BLE/GATT authenticated handshake
  ephemeral public key
  network adult-eligibility proof
  platform/app integrity assertion
  request-bound nonce
        ↓
local compatibility check
        ↓
prompt or pre-authorized disclosure grant
        ↓
relay-first encrypted profile capsule fetch
```

## Threat controls

- Encounter IDs rotate frequently and are generated independently from long-lived identity.
- A bounded replay cache rejects captured identifiers and handshakes.
- Rate limits use pairwise/pseudonymous quota keys rather than raw phone, email, push token, or advertising IDs.
- Venue scanning, directional ranging, exact distance, exact nearby-user counts, and persistent history are out of scope.
- Lock-screen notification text must not reveal sexual intent.
- Unsupported attestation receives lower quotas/progressive friction, not silent full trust.

## Consequences

- Detection is best-effort and subject to permission, suspension, battery, and radio conditions.
- BLE transport adds a meaningful stalking and battery attack surface and remains blocked for real-user beta until adversarial testing passes.
- Equal privacy defaults may reduce automatic exposure but preserve consent and reduce discriminatory treatment.

## Validation gates

- exact-date and network-enforced 18+ eligibility;
- rotating-ID unlinkability tests;
- identifier replay tests;
- blocked-user and revoked-device suppression;
- prompt/automatic/off disclosure-state tests;
- no sensitive fields in advertisements or logs;
- background delivery and battery benchmarks on representative devices;
- emergency-stop latency test;
- mass scanner and venue mapping red team;
- T&S proximity abuse playbook and staffed escalation;
- app-store review of public feature name and metadata.
