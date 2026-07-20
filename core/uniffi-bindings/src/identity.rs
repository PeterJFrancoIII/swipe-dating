//! Opaque identity handle — signing keys never cross FFI.

use dating_identity::RootIdentity;
use rand_core::OsRng;
use std::fmt;
use std::sync::Arc;

/// Public-facing identity summary safe for UI and logs.
#[derive(Debug, Clone, uniffi::Record)]
pub struct PublicIdentitySummary {
    pub profile_id_hex: String,
    pub root_public_key_hex: String,
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
}

/// Generate a new root identity. Private key material stays inside the handle.
#[uniffi::export]
pub fn generate_identity() -> Arc<IdentityHandle> {
    let mut rng = OsRng;
    let inner = RootIdentity::generate(&mut rng);
    Arc::new(IdentityHandle { inner })
}
