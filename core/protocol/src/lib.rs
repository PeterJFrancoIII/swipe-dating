//! Canonical protocol types with CBOR encoding and validation.

pub mod limits;
pub mod serde_hex;
pub mod types;
pub mod validate;

pub use limits::*;
pub use types::*;
pub use validate::*;

use thiserror::Error;

pub const PROTOCOL_VERSION: u16 = 1;

#[derive(Debug, Error)]
pub enum ProtocolError {
    #[error("encode failed: {0}")]
    Encode(String),
    #[error("decode failed: {0}")]
    Decode(String),
    #[error("validation failed: {0}")]
    Validation(#[from] ValidationError),
}

/// Canonical CBOR encode.
pub fn encode_cbor<T: serde::Serialize>(value: &T) -> Result<Vec<u8>, ProtocolError> {
    let mut buf = Vec::new();
    ciborium::into_writer(value, &mut buf).map_err(|e| ProtocolError::Encode(e.to_string()))?;
    Ok(buf)
}

/// Canonical CBOR decode.
pub fn decode_cbor<T: serde::de::DeserializeOwned>(bytes: &[u8]) -> Result<T, ProtocolError> {
    ciborium::from_reader(bytes).map_err(|e| ProtocolError::Decode(e.to_string()))
}

#[cfg(test)]
mod golden_tests {
    use super::*;
    use dating_crypto::{hash_blake3, SigningKeypair};
    use dating_test_support::{FakeRng, TestClock};

    fn sample_presence_lease() -> PresenceLease {
        let mut rng = FakeRng::new(99);
        let kp = SigningKeypair::generate(&mut rng);
        let issued_at = 1_700_000_000_i64;
        let expires_at = issued_at + 60;
        let rendezvous_id = hash_blake3(b"rendezvous-sample");
        let payload = presence_signing_payload(
            PROTOCOL_VERSION,
            &rendezvous_id,
            0x01,
            "us-west-coarse",
            issued_at,
            expires_at,
            &[0xAB; 16],
        );
        let sig = kp.sign(&payload);
        PresenceLease {
            protocol_version: PROTOCOL_VERSION,
            rendezvous_id,
            capability_bitmap: 0x01,
            coarse_region: "us-west-coarse".to_string(),
            issued_at,
            expires_at,
            nonce: [0xAB; 16],
            signature: sig.0,
            signer_public_key: kp.public_key_bytes(),
        }
    }

    #[test]
    fn presence_lease_roundtrip() {
        let lease = sample_presence_lease();
        let clock = TestClock::new(1_700_000_030);
        validate_presence_lease(&lease, &clock).unwrap();

        let encoded = encode_cbor(&lease).unwrap();
        let decoded: PresenceLease = decode_cbor(&encoded).unwrap();
        assert_eq!(lease, decoded);

        let encoded2 = encode_cbor(&decoded).unwrap();
        assert_eq!(encoded, encoded2);
    }

    #[test]
    fn mutation_fails_validation() {
        let mut lease = sample_presence_lease();
        let clock = TestClock::new(1_700_000_030);
        validate_presence_lease(&lease, &clock).unwrap();

        lease.coarse_region = "x".repeat(200);
        assert!(validate_presence_lease(&lease, &clock).is_err());
    }

    #[test]
    fn expired_lease_rejected() {
        let lease = sample_presence_lease();
        let clock = TestClock::new(1_700_000_100);
        assert!(validate_presence_lease(&lease, &clock).is_err());
    }

    #[test]
    fn profile_capsule_roundtrip() {
        let mut rng = FakeRng::new(50);
        let kp = SigningKeypair::generate(&mut rng);
        let profile_id = hash_blake3(&kp.public_key_bytes());
        let issued_at = 1_700_000_000_i64;
        let expires_at = issued_at + 86_400;
        let capsule = ProfileCapsule {
            protocol_version: PROTOCOL_VERSION,
            profile_id,
            profile_version: 1,
            issued_at,
            expires_at,
            display_name: "Alex".to_string(),
            age_band: AgeBand::TwentyFiveToThirtyFour,
            about_text: "Coffee and hikes".to_string(),
            media_manifest: vec![MediaManifestRef {
                media_id: hash_blake3(b"photo-1"),
                mime_type: "image/jpeg".to_string(),
                width: 512,
                height: 720,
            }],
            root_public_key: kp.public_key_bytes(),
            signature: [0u8; 64],
            signer_public_key: kp.public_key_bytes(),
        };
        let payload = profile_signing_payload(&capsule);
        let sig = kp.sign(&payload);
        let capsule = ProfileCapsule {
            signature: sig.0,
            ..capsule
        };

        let clock = TestClock::new(1_700_000_100);
        validate_profile_capsule(&capsule, &clock).unwrap();

        let encoded = encode_cbor(&capsule).unwrap();
        let decoded: ProfileCapsule = decode_cbor(&encoded).unwrap();
        assert_eq!(capsule, decoded);
    }
}
