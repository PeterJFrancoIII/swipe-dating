//! Local matching and dislike state exposed to mobile.

use crate::util::parse_profile_id;
use dating_matching::{LocalDislikeStore, MatchState, MatchStateMachine, MatchingError};
use dating_protocol::{decode_cbor, BlockRecord, MatchReceipt, ProtocolError};
use std::sync::Mutex;

#[derive(Debug, Clone, Copy, PartialEq, Eq, thiserror::Error, uniffi::Error)]
pub enum MatchingErrorCode {
    #[error("cannot like while blocked")]
    Blocked,
    #[error("already matched")]
    AlreadyMatched,
    #[error("invalid transition")]
    InvalidTransition,
    #[error("profile id must be exactly 32 bytes")]
    InvalidProfileId,
    #[error("decode failed")]
    DecodeFailed,
}

impl From<MatchingError> for MatchingErrorCode {
    fn from(value: MatchingError) -> Self {
        match value {
            MatchingError::Blocked => Self::Blocked,
            MatchingError::AlreadyMatched => Self::AlreadyMatched,
            MatchingError::InvalidTransition => Self::InvalidTransition,
        }
    }
}

fn map_protocol_decode(err: ProtocolError) -> MatchingErrorCode {
    match err {
        ProtocolError::Validation(_) => MatchingErrorCode::InvalidTransition,
        ProtocolError::Encode(_) | ProtocolError::Decode(_) => MatchingErrorCode::DecodeFailed,
    }
}

fn state_label(state: MatchState) -> &'static str {
    match state {
        MatchState::Neutral => "neutral",
        MatchState::Liked => "liked",
        MatchState::Matched => "matched",
        MatchState::Blocked => "blocked",
    }
}

/// Combined local dislike store and match state machine.
#[derive(uniffi::Object)]
pub struct AuditedMatchStore {
    state: Mutex<MatchStateMachine>,
    dislikes: Mutex<LocalDislikeStore>,
}

#[uniffi::export]
impl AuditedMatchStore {
    #[uniffi::constructor]
    pub fn new() -> Self {
        Self {
            state: Mutex::new(MatchStateMachine::default()),
            dislikes: Mutex::new(LocalDislikeStore::default()),
        }
    }

    pub fn record_dislike(&self, profile_id: Vec<u8>) -> Result<(), MatchingErrorCode> {
        let pid = parse_profile_id(&profile_id).map_err(|_| MatchingErrorCode::InvalidProfileId)?;
        self.dislikes
            .lock()
            .map_err(|_| MatchingErrorCode::InvalidTransition)?
            .record_dislike(pid);
        Ok(())
    }

    pub fn record_like(&self, profile_id: Vec<u8>) -> Result<(), MatchingErrorCode> {
        let pid = parse_profile_id(&profile_id).map_err(|_| MatchingErrorCode::InvalidProfileId)?;
        self.state
            .lock()
            .map_err(|_| MatchingErrorCode::InvalidTransition)?
            .send_like(pid)
            .map_err(Into::into)
    }

    pub fn apply_match(
        &self,
        profile_id: Vec<u8>,
        receipt_bytes: Vec<u8>,
    ) -> Result<(), MatchingErrorCode> {
        let pid = parse_profile_id(&profile_id).map_err(|_| MatchingErrorCode::InvalidProfileId)?;
        let receipt: MatchReceipt = decode_cbor(&receipt_bytes).map_err(map_protocol_decode)?;
        self.state
            .lock()
            .map_err(|_| MatchingErrorCode::InvalidTransition)?
            .confirm_match(pid, &receipt)
            .map_err(Into::into)
    }

    pub fn apply_block(
        &self,
        profile_id: Vec<u8>,
        block_bytes: Vec<u8>,
    ) -> Result<(), MatchingErrorCode> {
        let pid = parse_profile_id(&profile_id).map_err(|_| MatchingErrorCode::InvalidProfileId)?;
        let block: BlockRecord = decode_cbor(&block_bytes).map_err(map_protocol_decode)?;
        self.state
            .lock()
            .map_err(|_| MatchingErrorCode::InvalidTransition)?
            .apply_block(pid, &block);
        Ok(())
    }

    pub fn match_state_label(&self, profile_id: Vec<u8>) -> Result<String, MatchingErrorCode> {
        let pid = parse_profile_id(&profile_id).map_err(|_| MatchingErrorCode::InvalidProfileId)?;
        let state = self
            .state
            .lock()
            .map_err(|_| MatchingErrorCode::InvalidTransition)?
            .state_of(&pid);
        Ok(state_label(state).to_string())
    }

    pub fn is_disliked(&self, profile_id: Vec<u8>) -> Result<bool, MatchingErrorCode> {
        let pid = parse_profile_id(&profile_id).map_err(|_| MatchingErrorCode::InvalidProfileId)?;
        Ok(self
            .dislikes
            .lock()
            .map_err(|_| MatchingErrorCode::InvalidTransition)?
            .is_disliked(&pid))
    }
}
