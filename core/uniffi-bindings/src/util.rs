//! Shared FFI helpers.

use thiserror::Error;

#[derive(Debug, Error, uniffi::Error)]
pub enum ByteLengthError {
    #[error("profile id must be exactly 32 bytes")]
    InvalidProfileId,
}

pub fn parse_profile_id(bytes: &[u8]) -> Result<[u8; 32], ByteLengthError> {
    if bytes.len() != 32 {
        return Err(ByteLengthError::InvalidProfileId);
    }
    let mut arr = [0u8; 32];
    arr.copy_from_slice(bytes);
    Ok(arr)
}

/// STAGING: derive a stable 32-byte profile id from a UI label (e.g. synthetic deck id).
#[uniffi::export]
pub fn staging_profile_id_from_label(label: String) -> Vec<u8> {
    dating_crypto::hash_blake3(label.as_bytes()).to_vec()
}
