//! OS-agnostic encryption key providers for local storage.

use std::fmt;
use thiserror::Error;
use zeroize::{Zeroize, ZeroizeOnDrop};

pub const STORAGE_KEY_LEN: usize = 32;

/// Redacted AES-256 storage key material.
#[derive(Clone, Zeroize, ZeroizeOnDrop)]
pub struct StorageKey([u8; STORAGE_KEY_LEN]);

impl StorageKey {
    pub fn from_bytes(bytes: [u8; STORAGE_KEY_LEN]) -> Self {
        Self(bytes)
    }

    pub fn expose(&self) -> &[u8; STORAGE_KEY_LEN] {
        &self.0
    }
}

impl fmt::Debug for StorageKey {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str("StorageKey([REDACTED])")
    }
}

#[derive(Debug, Error)]
pub enum KeyProviderError {
    #[error("key unavailable")]
    Unavailable,
}

/// Supplies a 32-byte AES-256 key for encrypting local storage at rest.
pub trait KeyProvider: Send + Sync {
    fn storage_key(&self) -> Result<StorageKey, KeyProviderError>;
}

/// Deterministic key for unit tests (never use in production).
#[derive(Debug, Clone)]
pub struct SoftwareKeyProvider {
    key: StorageKey,
}

impl SoftwareKeyProvider {
    pub fn from_seed(seed: [u8; STORAGE_KEY_LEN]) -> Self {
        Self {
            key: StorageKey::from_bytes(seed),
        }
    }

    pub fn test_default() -> Self {
        Self::from_seed([0x42; STORAGE_KEY_LEN])
    }
}

impl KeyProvider for SoftwareKeyProvider {
    fn storage_key(&self) -> Result<StorageKey, KeyProviderError> {
        Ok(self.key.clone())
    }
}

/// **INSECURE DEV ONLY** — fixed, well-known key. Never ship to production.
#[derive(Debug, Clone, Copy)]
pub struct InsecureDevKeyProvider;

impl InsecureDevKeyProvider {
    pub const LABEL: &'static str = "INSECURE_DEV_KEY_DO_NOT_USE_IN_PRODUCTION";
}

impl KeyProvider for InsecureDevKeyProvider {
    fn storage_key(&self) -> Result<StorageKey, KeyProviderError> {
        Ok(StorageKey::from_bytes([0xDE; STORAGE_KEY_LEN]))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn software_key_roundtrip() {
        let provider = SoftwareKeyProvider::test_default();
        let key = provider.storage_key().unwrap();
        assert_eq!(*key.expose(), [0x42; STORAGE_KEY_LEN]);
    }

    #[test]
    fn insecure_dev_key_is_labeled() {
        assert!(InsecureDevKeyProvider::LABEL.contains("INSECURE"));
        let key = InsecureDevKeyProvider.storage_key().unwrap();
        assert_eq!(*key.expose(), [0xDE; STORAGE_KEY_LEN]);
    }
}
