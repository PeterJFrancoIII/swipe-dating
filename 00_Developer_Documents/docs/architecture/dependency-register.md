# Dependency Register

| Component | Version / pin | License | Notes |
|---|---|---|---|
| Rust toolchain | 1.97.1 (stable) | Apache-2.0/MIT | `rust-toolchain.toml` |
| Tokio | workspace pin | MIT | async runtime |
| Axum | workspace pin | MIT | HTTP services |
| Serde / ciborium | workspace pin | MIT/Apache | JSON/CBOR |
| ed25519-dalek | workspace pin | BSD-3 | signatures |
| blake3 | workspace pin | Apache-2.0/CC0 | hashing |
| zeroize | workspace pin | MIT/Apache | secret wiping |
| SQLx | workspace pin | MIT/Apache | Postgres |
| redis crate | workspace pin | BSD | Valkey/Redis |
| UniFFI | workspace pin | MPL-2.0 | bindings — review OK for staging |
| Android / iOS WebRTC | TBD pin | BSD-style | native wrappers |
| coturn | image pin TBD | BSD | local/staging TURN |

Update this file whenever dependencies are added. Run `make licenses` before release candidates.
