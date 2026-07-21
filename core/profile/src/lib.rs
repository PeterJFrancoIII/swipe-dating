//! Profile capsule build/validation helpers and safe cosmetic Skin Shop manifests.

mod skin_shop;

pub use skin_shop::*;

use dating_crypto::{hash_blake3, SigningKeypair};
use dating_protocol::{
    validate_profile_capsule, AgeBand, MediaManifestRef, ProfileCapsule, ValidationError,
    PROTOCOL_VERSION,
};
use dating_test_support::TestClock;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum ProfileError {
    #[error("validation failed: {0}")]
    Validation(#[from] ValidationError),
    #[error("display name required")]
    MissingDisplayName,
}

pub struct ProfileBuilder {
    capsule: ProfileCapsule,
    keypair: SigningKeypair,
}

impl ProfileBuilder {
    pub fn new<R: rand_core::CryptoRngCore>(rng: &mut R, issued_at: i64, expires_at: i64) -> Self {
        let keypair = SigningKeypair::generate(rng);
        let root_public_key = keypair.public_key_bytes();
        let profile_id = hash_blake3(&root_public_key);
        let signer_public_key = root_public_key;
        Self {
            capsule: ProfileCapsule {
                protocol_version: PROTOCOL_VERSION,
                profile_id,
                profile_version: 1,
                issued_at,
                expires_at,
                display_name: String::new(),
                age_band: AgeBand::TwentyFiveToThirtyFour,
                about_text: String::new(),
                media_manifest: Vec::new(),
                root_public_key,
                signature: [0u8; 64],
                signer_public_key,
            },
            keypair,
        }
    }

    pub fn display_name(mut self, name: impl Into<String>) -> Self {
        self.capsule.display_name = name.into();
        self
    }

    pub fn about_text(mut self, text: impl Into<String>) -> Self {
        self.capsule.about_text = text.into();
        self
    }

    pub fn age_band(mut self, band: AgeBand) -> Self {
        self.capsule.age_band = band;
        self
    }

    pub fn add_media(mut self, entry: MediaManifestRef) -> Self {
        self.capsule.media_manifest.push(entry);
        self
    }

    pub fn build(self, clock: &TestClock) -> Result<ProfileCapsule, ProfileError> {
        if self.capsule.display_name.is_empty() {
            return Err(ProfileError::MissingDisplayName);
        }
        let payload = dating_protocol::profile_signing_payload(&self.capsule);
        let sig = self.keypair.sign(&payload);
        let capsule = ProfileCapsule {
            signature: sig.0,
            ..self.capsule
        };
        validate_profile_capsule(&capsule, clock)?;
        Ok(capsule)
    }
}

pub fn validate_capsule(capsule: &ProfileCapsule, clock: &TestClock) -> Result<(), ProfileError> {
    validate_profile_capsule(capsule, clock)?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use dating_test_support::{FakeRng, TestClock};

    #[test]
    fn build_valid_capsule() {
        let mut rng = FakeRng::new(20);
        let clock = TestClock::new(1_700_000_000);
        let capsule = ProfileBuilder::new(&mut rng, 1_700_000_000, 1_700_086_400)
            .display_name("Sam")
            .about_text("Hello")
            .build(&clock)
            .unwrap();
        validate_capsule(&capsule, &clock).unwrap();
    }
}
