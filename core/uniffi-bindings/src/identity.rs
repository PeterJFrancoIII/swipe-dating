//! Opaque identity handle — signing keys never cross FFI.

use dating_identity::{RootIdentity, RotatingRendezvousId};
use dating_protocol::{encode_cbor, presence_signing_payload, PresenceLease, PROTOCOL_VERSION};
use rand_core::{OsRng, RngCore};
use std::fmt;
use std::sync::Arc;
use thiserror::Error;

/// Public-facing identity summary safe for UI and logs.
#[derive(Debug, Clone, uniffi::Record)]
pub struct PublicIdentitySummary {
    pub profile_id_hex: String,
    pub root_public_key_hex: String,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Error, uniffi::Error)]
pub enum IdentityBuildError {
    #[error("coarse region invalid")]
    InvalidRegion,
    #[error("ttl out of range")]
    InvalidTtl,
    #[error("encode failed")]
    EncodeFailed,
}

/// Opaque holder for root identity key material.
#[derive(uniffi::Object)]
pub struct IdentityHandle {
    inner: RootIdentity,
}

impl fmt::Debug for IdentityHandle {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.debug_struct("IdentityHandle")
            .field("profile_id", &hex::encode(self.inner.profile_id()))
            .field("keypair", &"[REDACTED]")
            .finish()
    }
}

#[uniffi::export]
impl IdentityHandle {
    /// 32-byte profile identifier (BLAKE3 of root public key).
    pub fn profile_id_bytes(&self) -> Vec<u8> {
        self.inner.profile_id().to_vec()
    }

    /// Hex-encoded public identity summary for display.
    pub fn public_identity_summary(&self) -> PublicIdentitySummary {
        PublicIdentitySummary {
            profile_id_hex: hex::encode(self.inner.profile_id()),
            root_public_key_hex: hex::encode(self.inner.root_public_key()),
        }
    }

    /// STAGING: build a signed presence lease as JSON for `PUT /v1/presence`.
    /// Private key material never leaves this handle.
    pub fn build_staging_presence_lease_json(
        &self,
        coarse_region: String,
        now_unix: i64,
        ttl_secs: u32,
    ) -> Result<String, IdentityBuildError> {
        if coarse_region.is_empty() || coarse_region.len() > 64 || coarse_region.contains(',') {
            return Err(IdentityBuildError::InvalidRegion);
        }
        if !(30..=120).contains(&ttl_secs) {
            return Err(IdentityBuildError::InvalidTtl);
        }
        let epoch = (now_unix.max(0) as u64) / 60;
        let rendezvous_id = RotatingRendezvousId::derive(&self.inner.root_public_key(), epoch).0;
        let mut nonce = [0u8; 16];
        OsRng.fill_bytes(&mut nonce);
        let issued_at = now_unix;
        let expires_at = now_unix + i64::from(ttl_secs);
        let capability_bitmap = 0x01u64;
        let payload = presence_signing_payload(
            PROTOCOL_VERSION,
            &rendezvous_id,
            capability_bitmap,
            &coarse_region,
            issued_at,
            expires_at,
            &nonce,
        );
        let sig = self.inner.sign(&payload);
        let lease = PresenceLease {
            protocol_version: PROTOCOL_VERSION,
            rendezvous_id,
            capability_bitmap,
            coarse_region,
            issued_at,
            expires_at,
            nonce,
            signature: sig.0,
            signer_public_key: self.inner.root_public_key(),
        };
        // Ensure CBOR round-trip still works for validators that prefer bytes.
        let _ = encode_cbor(&lease).map_err(|_| IdentityBuildError::EncodeFailed)?;
        serde_json::to_string(&lease).map_err(|_| IdentityBuildError::EncodeFailed)
    }
}

/// Generate a new root identity. Private key material stays inside the handle.
#[uniffi::export]
pub fn generate_identity() -> Arc<IdentityHandle> {
    let mut rng = OsRng;
    let inner = RootIdentity::generate(&mut rng);
    Arc::new(IdentityHandle { inner })
}
