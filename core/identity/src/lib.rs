//! Identity primitives: root keys, device attestation, rotating rendezvous IDs.

mod age;
pub use age::*;

use dating_crypto::{hash_blake3, Signature, SigningKeypair};
use rand_core::CryptoRngCore;
use serde::{Deserialize, Serialize};
use thiserror::Error;

pub type ProfileId = [u8; 32];

#[derive(Debug, Error)]
pub enum IdentityError {
    #[error("invalid device attestation signature")]
    InvalidDeviceSignature,
    #[error("invalid root signature")]
    InvalidRootSignature,
}

/// Long-lived root identity for a user profile.
#[derive(Serialize, Deserialize)]
pub struct RootIdentity {
    pub profile_id: ProfileId,
    pub root_public_key: [u8; 32],
    #[serde(skip)]
    keypair: Option<SigningKeypairHolder>,
}

/// Wrapper so SigningKeypair is not serialized.
struct SigningKeypairHolder(SigningKeypair);

impl std::fmt::Debug for SigningKeypairHolder {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str("SigningKeypairHolder([REDACTED])")
    }
}

impl std::fmt::Debug for RootIdentity {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("RootIdentity")
            .field("profile_id", &self.profile_id)
            .field("root_public_key", &self.root_public_key)
            .field("keypair", &self.keypair)
            .finish()
    }
}

impl RootIdentity {
    pub fn generate<R: CryptoRngCore>(rng: &mut R) -> Self {
        let keypair = SigningKeypair::generate(rng);
        let root_public_key = keypair.public_key_bytes();
        let profile_id = hash_blake3(&root_public_key);
        Self {
            profile_id,
            root_public_key,
            keypair: Some(SigningKeypairHolder(keypair)),
        }
    }

    pub fn profile_id(&self) -> ProfileId {
        self.profile_id
    }

    pub fn root_public_key(&self) -> [u8; 32] {
        self.root_public_key
    }

    pub fn sign(&self, message: &[u8]) -> Signature {
        self.keypair
            .as_ref()
            .expect("signing requires local key material")
            .0
            .sign(message)
    }
}

/// Device key signed by the root identity.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct DeviceKey {
    pub device_public_key: [u8; 32],
    pub issued_at: i64,
    pub root_signature: [u8; 64],
}

impl DeviceKey {
    pub fn attest<R: CryptoRngCore>(root: &RootIdentity, rng: &mut R, issued_at: i64) -> Self {
        let device_kp = SigningKeypair::generate(rng);
        let device_public_key = device_kp.public_key_bytes();
        let payload =
            device_attestation_payload(&root.root_public_key, &device_public_key, issued_at);
        let sig = root.sign(&payload);
        Self {
            device_public_key,
            issued_at,
            root_signature: sig.0,
        }
    }

    pub fn verify(&self, root_public_key: &[u8; 32]) -> Result<(), IdentityError> {
        let payload =
            device_attestation_payload(root_public_key, &self.device_public_key, self.issued_at);
        let sig = Signature(self.root_signature);
        if dating_crypto::verify(root_public_key, &payload, &sig) {
            Ok(())
        } else {
            Err(IdentityError::InvalidDeviceSignature)
        }
    }
}

fn device_attestation_payload(
    root_public_key: &[u8; 32],
    device_public_key: &[u8; 32],
    issued_at: i64,
) -> Vec<u8> {
    let mut payload = Vec::with_capacity(68);
    payload.extend_from_slice(root_public_key);
    payload.extend_from_slice(device_public_key);
    payload.extend_from_slice(&issued_at.to_le_bytes());
    payload
}

/// Rotating rendezvous identifier derived from root key + epoch.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub struct RotatingRendezvousId(pub [u8; 32]);

impl RotatingRendezvousId {
    pub fn derive(root_public_key: &[u8; 32], epoch: u64) -> Self {
        let mut input = Vec::with_capacity(40);
        input.extend_from_slice(b"rendezvous-v1");
        input.extend_from_slice(root_public_key);
        input.extend_from_slice(&epoch.to_le_bytes());
        Self(hash_blake3(&input))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use dating_test_support::FakeRng;

    #[test]
    fn profile_id_is_stable() {
        let mut rng = FakeRng::new(10);
        let root = RootIdentity::generate(&mut rng);
        let expected = hash_blake3(&root.root_public_key());
        assert_eq!(root.profile_id(), expected);
    }

    #[test]
    fn device_attestation_verifies() {
        let mut rng = FakeRng::new(11);
        let root = RootIdentity::generate(&mut rng);
        let device = DeviceKey::attest(&root, &mut rng, 1_700_000_000);
        device.verify(&root.root_public_key()).unwrap();
    }

    #[test]
    fn device_attestation_rejects_tamper() {
        let mut rng = FakeRng::new(12);
        let root = RootIdentity::generate(&mut rng);
        let mut device = DeviceKey::attest(&root, &mut rng, 1_700_000_000);
        device.device_public_key[0] ^= 1;
        assert!(device.verify(&root.root_public_key()).is_err());
    }

    #[test]
    fn rendezvous_id_changes_with_epoch() {
        let mut rng = FakeRng::new(13);
        let root = RootIdentity::generate(&mut rng);
        let pk = root.root_public_key();
        let a = RotatingRendezvousId::derive(&pk, 1);
        let b = RotatingRendezvousId::derive(&pk, 2);
        assert_ne!(a, b);
        assert_eq!(a, RotatingRendezvousId::derive(&pk, 1));
    }
}
