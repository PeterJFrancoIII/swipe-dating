//! Protocol size and count limits.

pub const MAX_PRESENCE_TTL_SECS: i64 = 120;
pub const MAX_COARSE_REGION_LEN: usize = 64;
pub const MAX_DISPLAY_NAME_LEN: usize = 64;
pub const MAX_ABOUT_TEXT_LEN: usize = 500;
pub const MAX_MEDIA_MANIFEST_COUNT: usize = 9;
pub const MAX_INTRO_TEXT_LEN: usize = 280;
pub const MAX_REPORT_EVIDENCE_HASHES: usize = 32;
pub const MAX_CBOR_OBJECT_BYTES: usize = 65_536;
