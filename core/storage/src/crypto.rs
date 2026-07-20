//! Application-level AES-256-GCM record encryption for local storage.

use crate::key_provider::StorageKey;
use aes_gcm::{
    aead::{Aead, KeyInit},
    Aes256Gcm, Nonce,
};
use rand::RngCore;
use thiserror::Error;

const NONCE_LEN: usize = 12;

#[derive(Debug, Error, PartialEq, Eq)]
pub enum CryptoError {
    #[error("ciphertext too short")]
    TooShort,
    #[error("decryption failed")]
    DecryptFailed,
    #[error("invalid key length")]
    InvalidKey,
}

pub fn encrypt_record(key: &StorageKey, plaintext: &[u8]) -> Result<Vec<u8>, CryptoError> {
    let cipher = Aes256Gcm::new_from_slice(key.expose()).map_err(|_| CryptoError::InvalidKey)?;
    let mut nonce_bytes = [0u8; NONCE_LEN];
    rand::thread_rng().fill_bytes(&mut nonce_bytes);
    let nonce = Nonce::from_slice(&nonce_bytes);
    let ciphertext = cipher
        .encrypt(nonce, plaintext)
        .map_err(|_| CryptoError::DecryptFailed)?;
    let mut out = Vec::with_capacity(NONCE_LEN + ciphertext.len());
    out.extend_from_slice(&nonce_bytes);
    out.extend_from_slice(&ciphertext);
    Ok(out)
}

pub fn decrypt_record(key: &StorageKey, blob: &[u8]) -> Result<Vec<u8>, CryptoError> {
    if blob.len() < NONCE_LEN {
        return Err(CryptoError::TooShort);
    }
    let cipher = Aes256Gcm::new_from_slice(key.expose()).map_err(|_| CryptoError::InvalidKey)?;
    let (nonce_bytes, ciphertext) = blob.split_at(NONCE_LEN);
    let nonce = Nonce::from_slice(nonce_bytes);
    cipher
        .decrypt(nonce, ciphertext)
        .map_err(|_| CryptoError::DecryptFailed)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::key_provider::{KeyProvider, SoftwareKeyProvider, STORAGE_KEY_LEN};

    #[test]
    fn encrypt_decrypt_roundtrip() {
        let key = SoftwareKeyProvider::test_default().storage_key().unwrap();
        let plain = b"local-first dating storage";
        let blob = encrypt_record(&key, plain).unwrap();
        assert_ne!(blob, plain);
        let recovered = decrypt_record(&key, &blob).unwrap();
        assert_eq!(recovered, plain);
    }

    #[test]
    fn wrong_key_fails() {
        let key_a = SoftwareKeyProvider::from_seed([1; STORAGE_KEY_LEN])
            .storage_key()
            .unwrap();
        let key_b = SoftwareKeyProvider::from_seed([2; STORAGE_KEY_LEN])
            .storage_key()
            .unwrap();
        let blob = encrypt_record(&key_a, b"secret").unwrap();
        assert_eq!(
            decrypt_record(&key_b, &blob),
            Err(CryptoError::DecryptFailed)
        );
    }
}
