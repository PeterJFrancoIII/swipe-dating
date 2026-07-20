//! Cryptographic primitives for the dating platform (no custom crypto).

use ed25519_dalek::{Signature as DalekSignature, Signer, SigningKey, Verifier, VerifyingKey};
use rand_core::CryptoRngCore;
use std::fmt;
use zeroize::{Zeroize, ZeroizeOnDrop};

/// Redacted secret key material.
#[derive(Zeroize, ZeroizeOnDrop)]
pub struct SecretKey([u8; 32]);

impl SecretKey {
    pub fn from_bytes(bytes: [u8; 32]) -> Self {
        Self(bytes)
    }

    pub fn expose(&self) -> &[u8; 32] {
        &self.0
    }
}

impl fmt::Debug for SecretKey {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str("SecretKey([REDACTED])")
    }
}

/// Ed25519 signing keypair.
pub struct SigningKeypair {
    signing_key: SigningKey,
    secret: SecretKey,
}

impl fmt::Debug for SigningKeypair {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.debug_struct("SigningKeypair")
            .field("public_key", &hex::encode(self.public_key_bytes()))
            .field("secret", &self.secret)
            .finish()
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Signature(pub [u8; 64]);

impl SigningKeypair {
    pub fn generate<R: CryptoRngCore>(rng: &mut R) -> Self {
        let signing_key = SigningKey::generate(rng);
        let secret = SecretKey::from_bytes(signing_key.to_bytes());
        Self {
            signing_key,
            secret,
        }
    }

    pub fn from_secret_bytes(bytes: [u8; 32]) -> Result<Self, ed25519_dalek::SignatureError> {
        let signing_key = SigningKey::from_bytes(&bytes);
        let secret = SecretKey::from_bytes(bytes);
        Ok(Self {
            signing_key,
            secret,
        })
    }

    pub fn public_key_bytes(&self) -> [u8; 32] {
        self.signing_key.verifying_key().to_bytes()
    }

    pub fn sign(&self, message: &[u8]) -> Signature {
        let sig = self.signing_key.sign(message);
        Signature(sig.to_bytes())
    }
}

pub fn verify(public_key: &[u8; 32], message: &[u8], signature: &Signature) -> bool {
    let Ok(verifying_key) = VerifyingKey::from_bytes(public_key) else {
        return false;
    };
    let sig = DalekSignature::from_bytes(&signature.0);
    verifying_key.verify(message, &sig).is_ok()
}

pub fn hash_blake3(bytes: &[u8]) -> [u8; 32] {
    *blake3::hash(bytes).as_bytes()
}

/// Constant-time byte comparison.
pub fn constant_time_eq(a: &[u8], b: &[u8]) -> bool {
    if a.len() != b.len() {
        return false;
    }
    let mut diff = 0u8;
    for (x, y) in a.iter().zip(b.iter()) {
        diff |= x ^ y;
    }
    diff == 0
}

#[cfg(test)]
mod tests {
    use super::*;
    use dating_test_support::FakeRng;

    #[test]
    fn sign_and_verify_roundtrip() {
        let mut rng = FakeRng::new(1);
        let kp = SigningKeypair::generate(&mut rng);
        let msg = b"hello dating";
        let sig = kp.sign(msg);
        assert!(verify(&kp.public_key_bytes(), msg, &sig));
    }

    #[test]
    fn reject_tampered_message() {
        let mut rng = FakeRng::new(2);
        let kp = SigningKeypair::generate(&mut rng);
        let sig = kp.sign(b"original");
        assert!(!verify(&kp.public_key_bytes(), b"tampered", &sig));
    }

    #[test]
    fn reject_tampered_signature() {
        let mut rng = FakeRng::new(3);
        let kp = SigningKeypair::generate(&mut rng);
        let mut sig = kp.sign(b"msg");
        sig.0[0] ^= 0xff;
        assert!(!verify(&kp.public_key_bytes(), b"msg", &sig));
    }

    #[test]
    fn blake3_hash_is_stable() {
        let h1 = hash_blake3(b"test");
        let h2 = hash_blake3(b"test");
        assert_eq!(h1, h2);
        assert_ne!(h1, hash_blake3(b"other"));
    }

    #[test]
    fn constant_time_eq_works() {
        assert!(constant_time_eq(b"abc", b"abc"));
        assert!(!constant_time_eq(b"abc", b"abd"));
        assert!(!constant_time_eq(b"a", b"ab"));
    }
}
