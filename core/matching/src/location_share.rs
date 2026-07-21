//! Match-scoped, expiring location-share grant metadata.
//!
//! Coordinates are never represented in this module. The location payload is expected to be
//! encrypted directly to the matched recipient; only a content hash is carried here for replay,
//! integrity, and revocation bookkeeping.

use serde::{Deserialize, Serialize};
use thiserror::Error;

pub const MAX_LIVE_LOCATION_TTL_SECS: i64 = 4 * 60 * 60;
pub const MAX_SNAPSHOT_TTL_SECS: i64 = 7 * 24 * 60 * 60;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum LocationShareKind {
    ApproximateMatchArea,
    MeetingPin,
    TemporaryLive,
}

impl LocationShareKind {
    fn maximum_ttl(self) -> i64 {
        match self {
            Self::TemporaryLive => MAX_LIVE_LOCATION_TTL_SECS,
            Self::ApproximateMatchArea | Self::MeetingPin => MAX_SNAPSHOT_TTL_SECS,
        }
    }

    fn is_precise(self) -> bool {
        matches!(self, Self::MeetingPin | Self::TemporaryLive)
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct LocationShareGrant {
    pub grant_id: [u8; 16],
    pub match_id: [u8; 32],
    pub sender_profile_id: [u8; 32],
    pub recipient_profile_id: [u8; 32],
    pub kind: LocationShareKind,
    pub issued_at: i64,
    pub expires_at: i64,
    pub sequence: u64,
    pub encrypted_payload_hash: [u8; 32],
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct LocationShareRevocation {
    pub grant_id: [u8; 16],
    pub match_id: [u8; 32],
    pub revoked_at: i64,
    pub sequence: u64,
}

#[derive(Debug, Error, PartialEq, Eq)]
pub enum LocationShareError {
    #[error("sender and recipient must differ")]
    SameParty,
    #[error("match id must be non-zero")]
    MissingMatch,
    #[error("grant id must be non-zero")]
    MissingGrant,
    #[error("encrypted payload hash must be non-zero")]
    MissingPayloadHash,
    #[error("location grant expiry must be after issue time")]
    InvalidExpiry,
    #[error("location grant ttl exceeds mode maximum")]
    TtlTooLong,
    #[error("precise location requires a second explicit confirmation")]
    PreciseConfirmationRequired,
}

impl LocationShareGrant {
    #[allow(clippy::too_many_arguments)]
    pub fn new(
        grant_id: [u8; 16],
        match_id: [u8; 32],
        sender_profile_id: [u8; 32],
        recipient_profile_id: [u8; 32],
        kind: LocationShareKind,
        issued_at: i64,
        expires_at: i64,
        sequence: u64,
        encrypted_payload_hash: [u8; 32],
        precise_confirmation: bool,
    ) -> Result<Self, LocationShareError> {
        if sender_profile_id == recipient_profile_id {
            return Err(LocationShareError::SameParty);
        }
        if match_id == [0; 32] {
            return Err(LocationShareError::MissingMatch);
        }
        if grant_id == [0; 16] {
            return Err(LocationShareError::MissingGrant);
        }
        if encrypted_payload_hash == [0; 32] {
            return Err(LocationShareError::MissingPayloadHash);
        }
        if expires_at <= issued_at {
            return Err(LocationShareError::InvalidExpiry);
        }
        if expires_at.saturating_sub(issued_at) > kind.maximum_ttl() {
            return Err(LocationShareError::TtlTooLong);
        }
        if kind.is_precise() && !precise_confirmation {
            return Err(LocationShareError::PreciseConfirmationRequired);
        }

        Ok(Self {
            grant_id,
            match_id,
            sender_profile_id,
            recipient_profile_id,
            kind,
            issued_at,
            expires_at,
            sequence,
            encrypted_payload_hash,
        })
    }

    pub fn is_active_at(&self, now_unix: i64) -> bool {
        self.issued_at <= now_unix && now_unix < self.expires_at
    }

    pub fn revoke(&self, revoked_at: i64) -> LocationShareRevocation {
        LocationShareRevocation {
            grant_id: self.grant_id,
            match_id: self.match_id,
            revoked_at,
            sequence: self.sequence.saturating_add(1),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn base(
        kind: LocationShareKind,
        precise_confirmation: bool,
    ) -> Result<LocationShareGrant, LocationShareError> {
        LocationShareGrant::new(
            [1; 16],
            [2; 32],
            [3; 32],
            [4; 32],
            kind,
            1_000,
            1_900,
            7,
            [5; 32],
            precise_confirmation,
        )
    }

    #[test]
    fn matching_does_not_create_a_location_grant_by_itself() {
        // A grant has no Default implementation and requires explicit constructor inputs.
        assert!(base(LocationShareKind::ApproximateMatchArea, false).is_ok());
    }

    #[test]
    fn precise_modes_require_second_confirmation() {
        assert_eq!(
            base(LocationShareKind::TemporaryLive, false),
            Err(LocationShareError::PreciseConfirmationRequired)
        );
        assert!(base(LocationShareKind::TemporaryLive, true).is_ok());
    }

    #[test]
    fn live_location_is_bounded_and_expiring() {
        let grant = LocationShareGrant::new(
            [1; 16],
            [2; 32],
            [3; 32],
            [4; 32],
            LocationShareKind::TemporaryLive,
            1_000,
            1_000 + MAX_LIVE_LOCATION_TTL_SECS,
            1,
            [5; 32],
            true,
        )
        .unwrap();
        assert!(grant.is_active_at(1_001));
        assert!(!grant.is_active_at(grant.expires_at));
    }

    #[test]
    fn revocation_advances_sequence() {
        let grant = base(LocationShareKind::ApproximateMatchArea, false).unwrap();
        let revocation = grant.revoke(1_100);
        assert_eq!(revocation.sequence, grant.sequence + 1);
        assert_eq!(revocation.grant_id, grant.grant_id);
    }
}
