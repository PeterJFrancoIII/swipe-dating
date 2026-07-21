# ADR-0010: Optional match-location sharing

Date: 2026-07-21  
Status: accepted for staging UX; real coordinates blocked  
Decision owners: Product + Privacy + Security + Trust & Safety

## Context

Matched adults may want to share where they matched, a meeting point, or a temporary live location. A persistent “track my matches” map would create unacceptable stalking, coercion, insider, notification, and breach risk.

## Decision

Location sharing is a **separate, explicit grant**. Matching alone never transmits location.

Supported modes:

1. approximate area where the match occurred;
2. a user-selected meeting pin;
3. live location for 15 minutes;
4. live location for 1 hour;
5. live location for 4 hours.

Rules:

- off by default;
- available only to a current authenticated match;
- recipient-scoped and encrypted to that match;
- approximate by default;
- precise modes require a second confirmation;
- every grant has an expiry and monotonic sequence number;
- block or unmatch revokes the grant immediately on the sender and hides it immediately on the receiver;
- emergency privacy revokes all active grants;
- no location plaintext in push notifications, telemetry, crash logs, support tools, or ordinary control-plane storage;
- no historical trail unless the user explicitly saves a meeting pin locally;
- a persistent in-app indicator lists every active grant;
- the server may relay only opaque ciphertext and expiry metadata needed for deletion.

## Envelope

```text
LocationShareGrant
  protocol_version
  share_id
  sender_profile_id
  recipient_profile_id
  mode
  precision_class
  coordinate_or_area
  issued_at
  expires_at
  sequence_number
  nonce
  signer_device_key_id
  signature
```

The signed grant is encrypted to the recipient’s currently authorized device keys. A relay cannot decrypt it.

## Revocation

Revocation is a signed, request-bound message with a higher sequence number. The sender UI distinguishes:

- removed locally;
- revocation acknowledged by relay;
- revocation acknowledged by recipient device;
- recipient offline / acknowledgement pending.

The app must disclose that a malicious peer can retain screenshots or plaintext already received.

## Consequences

- Ephemeral location sharing improves coordination but adds one of the product’s highest-risk data classes.
- Live location creates background battery and platform-permission complexity.
- An E2EE design reduces operator custody but does not prevent recipient abuse.

## Validation gates

- explicit permission and double-confirmation tests;
- expiry under clock skew;
- block/unmatch/emergency revocation tests;
- recipient and device-key binding;
- replay and rollback rejection;
- no location in push, telemetry, logs, analytics, or operator search;
- approximate-area minimum radius and re-identification review;
- background indicator and battery tests;
- coercion/stalking playbook and staffed escalation;
- privacy/DPIA and jurisdiction review.
