//! Protocol message types.

use crate::serde_hex::hex_64;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum AgeBand {
    EighteenToTwentyFour,
    TwentyFiveToThirtyFour,
    ThirtyFiveToFortyFour,
    FortyFivePlus,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct PresenceLease {
    pub protocol_version: u16,
    pub rendezvous_id: [u8; 32],
    pub capability_bitmap: u64,
    pub coarse_region: String,
    pub issued_at: i64,
    pub expires_at: i64,
    pub nonce: [u8; 16],
    #[serde(with = "hex_64")]
    pub signature: [u8; 64],
    pub signer_public_key: [u8; 32],
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct FetchTicket {
    pub protocol_version: u16,
    pub ticket_id: [u8; 32],
    pub rendezvous_id: [u8; 32],
    pub issued_at: i64,
    pub expires_at: i64,
    pub nonce: [u8; 16],
    #[serde(with = "hex_64")]
    pub signature: [u8; 64],
    pub signer_public_key: [u8; 32],
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct LikeEnvelope {
    pub protocol_version: u16,
    pub sender_profile_id: [u8; 32],
    pub recipient_profile_id: [u8; 32],
    pub sender_profile_version: u32,
    pub issued_at: i64,
    pub expires_at: i64,
    pub anti_replay_id: [u8; 16],
    pub intro_text: Option<String>,
    #[serde(with = "hex_64")]
    pub signature: [u8; 64],
    pub signer_public_key: [u8; 32],
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct MatchReceipt {
    pub protocol_version: u16,
    pub profile_a: [u8; 32],
    pub profile_b: [u8; 32],
    pub matched_at: i64,
    pub nonce: [u8; 16],
    #[serde(with = "hex_64")]
    pub signature_a: [u8; 64],
    #[serde(with = "hex_64")]
    pub signature_b: [u8; 64],
    pub public_key_a: [u8; 32],
    pub public_key_b: [u8; 32],
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct BlockRecord {
    pub protocol_version: u16,
    pub blocker_profile_id: [u8; 32],
    pub blocked_profile_id: [u8; 32],
    pub issued_at: i64,
    #[serde(with = "hex_64")]
    pub signature: [u8; 64],
    pub signer_public_key: [u8; 32],
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct MediaManifestRef {
    pub media_id: [u8; 32],
    pub mime_type: String,
    pub width: u32,
    pub height: u32,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ProfileCapsule {
    pub protocol_version: u16,
    pub profile_id: [u8; 32],
    pub profile_version: u32,
    pub issued_at: i64,
    pub expires_at: i64,
    pub display_name: String,
    pub age_band: AgeBand,
    pub about_text: String,
    pub media_manifest: Vec<MediaManifestRef>,
    pub root_public_key: [u8; 32],
    #[serde(with = "hex_64")]
    pub signature: [u8; 64],
    pub signer_public_key: [u8; 32],
}
