//! Validation logic separate from parse.

use crate::limits::*;
use crate::types::*;
use crate::PROTOCOL_VERSION;
use dating_crypto::{verify, Signature};
use dating_test_support::TestClock;
use thiserror::Error;

#[derive(Debug, Error, PartialEq, Eq)]
pub enum ValidationError {
    #[error("unsupported protocol version")]
    UnsupportedVersion,
    #[error("field too long: {0}")]
    FieldTooLong(&'static str),
    #[error("field count exceeded: {0}")]
    CountExceeded(&'static str),
    #[error("expired")]
    Expired,
    #[error("ttl exceeds maximum")]
    TtlTooLong,
    #[error("invalid coarse region")]
    InvalidCoarseRegion,
    #[error("missing or invalid signature")]
    InvalidSignature,
    #[error("object too large")]
    ObjectTooLarge,
}

pub fn validate_presence_lease(
    lease: &PresenceLease,
    clock: &TestClock,
) -> Result<(), ValidationError> {
    if lease.protocol_version != PROTOCOL_VERSION {
        return Err(ValidationError::UnsupportedVersion);
    }
    if lease.coarse_region.len() > MAX_COARSE_REGION_LEN {
        return Err(ValidationError::FieldTooLong("coarse_region"));
    }
    if lease.coarse_region.contains(',') || looks_like_coordinates(&lease.coarse_region) {
        return Err(ValidationError::InvalidCoarseRegion);
    }
    let ttl = lease.expires_at.saturating_sub(lease.issued_at);
    if ttl > MAX_PRESENCE_TTL_SECS {
        return Err(ValidationError::TtlTooLong);
    }
    if lease.expires_at <= clock.now_unix() {
        return Err(ValidationError::Expired);
    }
    let payload = presence_signing_payload(
        lease.protocol_version,
        &lease.rendezvous_id,
        lease.capability_bitmap,
        &lease.coarse_region,
        lease.issued_at,
        lease.expires_at,
        &lease.nonce,
    );
    if !verify(
        &lease.signer_public_key,
        &payload,
        &Signature(lease.signature),
    ) {
        return Err(ValidationError::InvalidSignature);
    }
    Ok(())
}

pub fn validate_fetch_ticket(
    ticket: &FetchTicket,
    clock: &TestClock,
) -> Result<(), ValidationError> {
    if ticket.protocol_version != PROTOCOL_VERSION {
        return Err(ValidationError::UnsupportedVersion);
    }
    if ticket.expires_at <= clock.now_unix() {
        return Err(ValidationError::Expired);
    }
    let payload = fetch_ticket_signing_payload(ticket);
    if !verify(
        &ticket.signer_public_key,
        &payload,
        &Signature(ticket.signature),
    ) {
        return Err(ValidationError::InvalidSignature);
    }
    Ok(())
}

pub fn validate_like_envelope(
    like: &LikeEnvelope,
    clock: &TestClock,
) -> Result<(), ValidationError> {
    if like.protocol_version != PROTOCOL_VERSION {
        return Err(ValidationError::UnsupportedVersion);
    }
    if let Some(intro) = &like.intro_text {
        if intro.len() > MAX_INTRO_TEXT_LEN {
            return Err(ValidationError::FieldTooLong("intro_text"));
        }
    }
    if like.expires_at <= clock.now_unix() {
        return Err(ValidationError::Expired);
    }
    let payload = like_signing_payload(like);
    if !verify(
        &like.signer_public_key,
        &payload,
        &Signature(like.signature),
    ) {
        return Err(ValidationError::InvalidSignature);
    }
    Ok(())
}

pub fn validate_match_receipt(receipt: &MatchReceipt) -> Result<(), ValidationError> {
    if receipt.protocol_version != PROTOCOL_VERSION {
        return Err(ValidationError::UnsupportedVersion);
    }
    let payload_a = match_receipt_signing_payload(receipt, true);
    let payload_b = match_receipt_signing_payload(receipt, false);
    if !verify(
        &receipt.public_key_a,
        &payload_a,
        &Signature(receipt.signature_a),
    ) {
        return Err(ValidationError::InvalidSignature);
    }
    if !verify(
        &receipt.public_key_b,
        &payload_b,
        &Signature(receipt.signature_b),
    ) {
        return Err(ValidationError::InvalidSignature);
    }
    Ok(())
}

pub fn validate_block_record(block: &BlockRecord) -> Result<(), ValidationError> {
    if block.protocol_version != PROTOCOL_VERSION {
        return Err(ValidationError::UnsupportedVersion);
    }
    let payload = block_signing_payload(block);
    if !verify(
        &block.signer_public_key,
        &payload,
        &Signature(block.signature),
    ) {
        return Err(ValidationError::InvalidSignature);
    }
    Ok(())
}

pub fn validate_profile_capsule(
    capsule: &ProfileCapsule,
    clock: &TestClock,
) -> Result<(), ValidationError> {
    if capsule.protocol_version != PROTOCOL_VERSION {
        return Err(ValidationError::UnsupportedVersion);
    }
    if capsule.display_name.len() > MAX_DISPLAY_NAME_LEN {
        return Err(ValidationError::FieldTooLong("display_name"));
    }
    if capsule.about_text.len() > MAX_ABOUT_TEXT_LEN {
        return Err(ValidationError::FieldTooLong("about_text"));
    }
    if capsule.media_manifest.len() > MAX_MEDIA_MANIFEST_COUNT {
        return Err(ValidationError::CountExceeded("media_manifest"));
    }
    if capsule.expires_at <= clock.now_unix() {
        return Err(ValidationError::Expired);
    }
    let payload = profile_signing_payload(capsule);
    if !verify(
        &capsule.signer_public_key,
        &payload,
        &Signature(capsule.signature),
    ) {
        return Err(ValidationError::InvalidSignature);
    }
    Ok(())
}

fn looks_like_coordinates(region: &str) -> bool {
    let parts: Vec<&str> = region.split_whitespace().collect();
    if parts.len() == 2 {
        parts[0].parse::<f64>().is_ok() && parts[1].parse::<f64>().is_ok()
    } else {
        false
    }
}

pub fn presence_signing_payload(
    protocol_version: u16,
    rendezvous_id: &[u8; 32],
    capability_bitmap: u64,
    coarse_region: &str,
    issued_at: i64,
    expires_at: i64,
    nonce: &[u8; 16],
) -> Vec<u8> {
    let mut buf = Vec::new();
    buf.extend_from_slice(&protocol_version.to_le_bytes());
    buf.extend_from_slice(rendezvous_id);
    buf.extend_from_slice(&capability_bitmap.to_le_bytes());
    buf.extend_from_slice(coarse_region.as_bytes());
    buf.extend_from_slice(&issued_at.to_le_bytes());
    buf.extend_from_slice(&expires_at.to_le_bytes());
    buf.extend_from_slice(nonce);
    buf
}

pub fn fetch_ticket_signing_payload(ticket: &FetchTicket) -> Vec<u8> {
    let mut buf = Vec::new();
    buf.extend_from_slice(&ticket.protocol_version.to_le_bytes());
    buf.extend_from_slice(&ticket.ticket_id);
    buf.extend_from_slice(&ticket.rendezvous_id);
    buf.extend_from_slice(&ticket.issued_at.to_le_bytes());
    buf.extend_from_slice(&ticket.expires_at.to_le_bytes());
    buf.extend_from_slice(&ticket.nonce);
    buf
}

pub fn like_signing_payload(like: &LikeEnvelope) -> Vec<u8> {
    let mut buf = Vec::new();
    buf.extend_from_slice(&like.protocol_version.to_le_bytes());
    buf.extend_from_slice(&like.sender_profile_id);
    buf.extend_from_slice(&like.recipient_profile_id);
    buf.extend_from_slice(&like.sender_profile_version.to_le_bytes());
    buf.extend_from_slice(&like.issued_at.to_le_bytes());
    buf.extend_from_slice(&like.expires_at.to_le_bytes());
    buf.extend_from_slice(&like.anti_replay_id);
    if let Some(intro) = &like.intro_text {
        buf.extend_from_slice(intro.as_bytes());
    }
    buf
}

pub fn match_receipt_signing_payload(receipt: &MatchReceipt, party_a: bool) -> Vec<u8> {
    let mut buf = Vec::new();
    buf.extend_from_slice(&receipt.protocol_version.to_le_bytes());
    buf.extend_from_slice(&receipt.profile_a);
    buf.extend_from_slice(&receipt.profile_b);
    buf.extend_from_slice(&receipt.matched_at.to_le_bytes());
    buf.extend_from_slice(&receipt.nonce);
    buf.push(u8::from(party_a));
    buf
}

pub fn block_signing_payload(block: &BlockRecord) -> Vec<u8> {
    let mut buf = Vec::new();
    buf.extend_from_slice(&block.protocol_version.to_le_bytes());
    buf.extend_from_slice(&block.blocker_profile_id);
    buf.extend_from_slice(&block.blocked_profile_id);
    buf.extend_from_slice(&block.issued_at.to_le_bytes());
    buf
}

pub fn profile_signing_payload(capsule: &ProfileCapsule) -> Vec<u8> {
    let mut buf = Vec::new();
    buf.extend_from_slice(&capsule.protocol_version.to_le_bytes());
    buf.extend_from_slice(&capsule.profile_id);
    buf.extend_from_slice(&capsule.profile_version.to_le_bytes());
    buf.extend_from_slice(&capsule.issued_at.to_le_bytes());
    buf.extend_from_slice(&capsule.expires_at.to_le_bytes());
    buf.extend_from_slice(capsule.display_name.as_bytes());
    buf.extend_from_slice(capsule.about_text.as_bytes());
    for entry in &capsule.media_manifest {
        buf.extend_from_slice(&entry.media_id);
        buf.extend_from_slice(entry.mime_type.as_bytes());
        buf.extend_from_slice(&entry.width.to_le_bytes());
        buf.extend_from_slice(&entry.height.to_le_bytes());
    }
    buf.extend_from_slice(&capsule.root_public_key);
    buf
}
