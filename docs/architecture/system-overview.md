# System Overview

Hybrid **local-first** dating platform: ephemeral control plane + peer-to-peer E2EE data plane.

## Components

| Component | Role |
|---|---|
| iOS / Android apps | UI, OS keystores, WebRTC, push registration |
| Shared Rust core (UniFFI) | Identity, protocol, validation, matching, storage interfaces |
| Rendezvous / presence | Short-lived signed leases, coarse region lookup |
| Signaling | Opaque WebRTC offer/answer relay |
| TURN credential service | Short-lived relay credentials |
| Push broker | Opaque wake hints only |
| Sealed mailbox (off by default) | Optional ciphertext envelopes |
| Report ingest + safety vault | Explicit user-selected evidence exception |
| Safety console | Human review tooling (staging) |

## Modes

- **A Strict Zero-Store (default):** discoverable only while online.
- **B Sealed Mailbox:** opt-in encrypted envelopes; operator cannot decrypt.
- **C Personal Availability Node:** post-MVP.

## Data plane default

Pre-match: `iceTransportPolicy: relay` (or platform equivalent). Post-match direct P2P behind explicit consent + feature flag (default off).
