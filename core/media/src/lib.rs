//! Media manifest validation and location metadata stripping.

mod exif;

pub use exif::{
    gps_tag_ids, strip_jpeg_gps_app1, strip_location_metadata, ExifTagMap, GPS_TAG_IDS,
};

use serde::{Deserialize, Serialize};
use thiserror::Error;

pub const MAX_IMAGE_WIDTH: u32 = 4096;
pub const MAX_IMAGE_HEIGHT: u32 = 4096;

const ALLOWED_MIMES: &[&str] = &["image/jpeg", "image/heif", "image/avif", "image/png"];

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct MediaManifestEntry {
    pub media_id: [u8; 32],
    pub mime_type: String,
    pub width: u32,
    pub height: u32,
    pub content_hash: [u8; 32],
}

impl MediaManifestEntry {
    pub fn from_bytes(
        mime_type: impl Into<String>,
        width: u32,
        height: u32,
        content: &[u8],
    ) -> Self {
        let content_hash = *blake3::hash(content).as_bytes();
        let mut id_input = Vec::with_capacity(32 + content.len());
        id_input.extend_from_slice(&content_hash);
        id_input.extend_from_slice(content);
        let media_id = *blake3::hash(&id_input).as_bytes();
        Self {
            media_id,
            mime_type: mime_type.into(),
            width,
            height,
            content_hash,
        }
    }
}

#[derive(Debug, Error, PartialEq, Eq)]
pub enum MediaError {
    #[error("mime type not allowed")]
    MimeNotAllowed,
    #[error("dimensions exceed maximum")]
    DimensionsTooLarge,
}

pub fn validate_media_entry(entry: &MediaManifestEntry) -> Result<(), MediaError> {
    if !ALLOWED_MIMES.contains(&entry.mime_type.as_str()) {
        return Err(MediaError::MimeNotAllowed);
    }
    if entry.width == 0
        || entry.height == 0
        || entry.width > MAX_IMAGE_WIDTH
        || entry.height > MAX_IMAGE_HEIGHT
    {
        return Err(MediaError::DimensionsTooLarge);
    }
    Ok(())
}

pub fn mime_allowlist() -> &'static [&'static str] {
    ALLOWED_MIMES
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn accepts_jpeg() {
        let entry = MediaManifestEntry::from_bytes("image/jpeg", 720, 512, b"fake-image");
        validate_media_entry(&entry).unwrap();
    }

    #[test]
    fn rejects_gif() {
        let entry = MediaManifestEntry::from_bytes("image/gif", 100, 100, b"x");
        assert_eq!(
            validate_media_entry(&entry),
            Err(MediaError::MimeNotAllowed)
        );
    }

    #[test]
    fn rejects_oversized_dimensions() {
        let entry = MediaManifestEntry::from_bytes("image/png", 5000, 100, b"x");
        assert_eq!(
            validate_media_entry(&entry),
            Err(MediaError::DimensionsTooLarge)
        );
    }
}
