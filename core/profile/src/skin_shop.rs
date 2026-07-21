//! Safe cosmetic asset manifests for the Skin Shop.
//!
//! Marketplace assets are public cosmetics and are deliberately isolated from candidate ranking,
//! message access, report priority, safety tools, private profiles, questionnaire answers, and
//! location data. Assets are declarative only; executable code and hidden network requests fail.

use serde::{Deserialize, Serialize};
use thiserror::Error;

pub const MAX_SKIN_ASSET_BYTES: u64 = 10 * 1024 * 1024;
pub const MAX_SKIN_DIMENSION: u32 = 4_096;
pub const MAX_ANIMATION_FRAMES: u16 = 120;

const ALLOWED_SKIN_MIMES: &[&str] = &[
    "image/png",
    "image/webp",
    "image/avif",
    "application/vnd.swipe.skin+json",
    "application/vnd.swipe.vector+json",
];

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum SkinAssetKind {
    Avatar,
    ProfileSkin,
    ChatSkin,
    ReactionPack,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct SkinAssetManifest {
    pub asset_id: [u8; 32],
    pub creator_public_id: [u8; 32],
    pub kind: SkinAssetKind,
    pub mime_type: String,
    pub byte_length: u64,
    pub width: u32,
    pub height: u32,
    pub animation_frames: u16,
    pub content_hash: [u8; 32],
    pub executable_payload: bool,
    pub external_network_references: bool,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct CosmeticEntitlement {
    pub entitlement_id: [u8; 32],
    pub owner_profile_id: [u8; 32],
    pub asset_id: [u8; 32],
    pub platform_receipt_hash: [u8; 32],
    pub issued_at: i64,
    pub revoked_at: Option<i64>,
}

impl CosmeticEntitlement {
    pub fn is_active(&self) -> bool {
        self.revoked_at.is_none()
    }
}

#[derive(Debug, Error, PartialEq, Eq)]
pub enum SkinAssetError {
    #[error("skin mime type is not allowed")]
    MimeNotAllowed,
    #[error("skin asset exceeds byte limit")]
    TooLarge,
    #[error("skin dimensions are invalid or too large")]
    InvalidDimensions,
    #[error("skin animation exceeds frame limit")]
    TooManyFrames,
    #[error("executable skin payloads are forbidden")]
    ExecutablePayload,
    #[error("skin assets cannot make hidden network requests")]
    ExternalNetworkReference,
    #[error("asset id or content hash is missing")]
    MissingIntegrityId,
}

pub fn validate_skin_asset(manifest: &SkinAssetManifest) -> Result<(), SkinAssetError> {
    if !ALLOWED_SKIN_MIMES.contains(&manifest.mime_type.as_str()) {
        return Err(SkinAssetError::MimeNotAllowed);
    }
    if manifest.byte_length == 0 || manifest.byte_length > MAX_SKIN_ASSET_BYTES {
        return Err(SkinAssetError::TooLarge);
    }
    if manifest.width == 0
        || manifest.height == 0
        || manifest.width > MAX_SKIN_DIMENSION
        || manifest.height > MAX_SKIN_DIMENSION
    {
        return Err(SkinAssetError::InvalidDimensions);
    }
    if manifest.animation_frames > MAX_ANIMATION_FRAMES {
        return Err(SkinAssetError::TooManyFrames);
    }
    if manifest.executable_payload {
        return Err(SkinAssetError::ExecutablePayload);
    }
    if manifest.external_network_references {
        return Err(SkinAssetError::ExternalNetworkReference);
    }
    if manifest.asset_id == [0; 32] || manifest.content_hash == [0; 32] {
        return Err(SkinAssetError::MissingIntegrityId);
    }
    Ok(())
}

pub fn allowed_skin_mimes() -> &'static [&'static str] {
    ALLOWED_SKIN_MIMES
}

#[cfg(test)]
mod tests {
    use super::*;

    fn valid_manifest() -> SkinAssetManifest {
        SkinAssetManifest {
            asset_id: [1; 32],
            creator_public_id: [2; 32],
            kind: SkinAssetKind::ProfileSkin,
            mime_type: "image/avif".to_string(),
            byte_length: 512_000,
            width: 1_024,
            height: 1_024,
            animation_frames: 1,
            content_hash: [3; 32],
            executable_payload: false,
            external_network_references: false,
        }
    }

    #[test]
    fn accepts_bounded_declarative_cosmetic() {
        assert!(validate_skin_asset(&valid_manifest()).is_ok());
    }

    #[test]
    fn rejects_script_and_html_assets() {
        let mut manifest = valid_manifest();
        manifest.mime_type = "text/html".to_string();
        assert_eq!(
            validate_skin_asset(&manifest),
            Err(SkinAssetError::MimeNotAllowed)
        );

        let mut executable = valid_manifest();
        executable.executable_payload = true;
        assert_eq!(
            validate_skin_asset(&executable),
            Err(SkinAssetError::ExecutablePayload)
        );
    }

    #[test]
    fn rejects_hidden_network_references() {
        let mut manifest = valid_manifest();
        manifest.external_network_references = true;
        assert_eq!(
            validate_skin_asset(&manifest),
            Err(SkinAssetError::ExternalNetworkReference)
        );
    }

    #[test]
    fn entitlement_is_cosmetic_and_revocable() {
        let active = CosmeticEntitlement {
            entitlement_id: [1; 32],
            owner_profile_id: [2; 32],
            asset_id: [3; 32],
            platform_receipt_hash: [4; 32],
            issued_at: 1,
            revoked_at: None,
        };
        assert!(active.is_active());

        let revoked = CosmeticEntitlement {
            revoked_at: Some(2),
            ..active
        };
        assert!(!revoked.is_active());
    }
}
