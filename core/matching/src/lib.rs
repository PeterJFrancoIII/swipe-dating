//! Local matching state machine and dislike store.

mod location;
pub use location::*;

use dating_protocol::{BlockRecord, MatchReceipt, PROTOCOL_VERSION};
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};
use thiserror::Error;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum MatchState {
    Neutral,
    Liked,
    Matched,
    Blocked,
}

#[derive(Debug, Error, PartialEq, Eq)]
pub enum MatchingError {
    #[error("cannot like while blocked")]
    Blocked,
    #[error("already matched")]
    AlreadyMatched,
    #[error("invalid transition")]
    InvalidTransition,
}

#[derive(Debug, Default)]
pub struct LocalDislikeStore {
    disliked: HashSet<[u8; 32]>,
}

impl LocalDislikeStore {
    pub fn record_dislike(&mut self, profile_id: [u8; 32]) {
        self.disliked.insert(profile_id);
    }

    pub fn is_disliked(&self, profile_id: &[u8; 32]) -> bool {
        self.disliked.contains(profile_id)
    }

    pub fn len(&self) -> usize {
        self.disliked.len()
    }

    pub fn is_empty(&self) -> bool {
        self.disliked.is_empty()
    }
}

#[derive(Debug, Default)]
pub struct MatchStateMachine {
    states: HashMap<[u8; 32], MatchState>,
    outgoing_likes: HashSet<[u8; 32]>,
}

impl MatchStateMachine {
    pub fn state_of(&self, profile_id: &[u8; 32]) -> MatchState {
        self.states
            .get(profile_id)
            .copied()
            .unwrap_or(MatchState::Neutral)
    }

    pub fn send_like(&mut self, profile_id: [u8; 32]) -> Result<(), MatchingError> {
        match self.state_of(&profile_id) {
            MatchState::Blocked => Err(MatchingError::Blocked),
            MatchState::Matched => Err(MatchingError::AlreadyMatched),
            MatchState::Neutral | MatchState::Liked => {
                self.states.insert(profile_id, MatchState::Liked);
                self.outgoing_likes.insert(profile_id);
                Ok(())
            }
        }
    }

    pub fn confirm_match(
        &mut self,
        profile_id: [u8; 32],
        _receipt: &MatchReceipt,
    ) -> Result<(), MatchingError> {
        if self.state_of(&profile_id) == MatchState::Blocked {
            return Err(MatchingError::Blocked);
        }
        if _receipt.protocol_version != PROTOCOL_VERSION {
            return Err(MatchingError::InvalidTransition);
        }
        self.states.insert(profile_id, MatchState::Matched);
        Ok(())
    }

    pub fn apply_block(&mut self, profile_id: [u8; 32], _block: &BlockRecord) {
        self.states.insert(profile_id, MatchState::Blocked);
        self.outgoing_likes.remove(&profile_id);
    }

    pub fn has_outgoing_like(&self, profile_id: &[u8; 32]) -> bool {
        self.outgoing_likes.contains(profile_id)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn pid(n: u8) -> [u8; 32] {
        [n; 32]
    }

    #[test]
    fn like_then_match() {
        let mut sm = MatchStateMachine::default();
        sm.send_like(pid(1)).unwrap();
        assert_eq!(sm.state_of(&pid(1)), MatchState::Liked);

        let receipt = MatchReceipt {
            protocol_version: PROTOCOL_VERSION,
            profile_a: pid(1),
            profile_b: pid(2),
            matched_at: 1,
            nonce: [0; 16],
            signature_a: [0; 64],
            signature_b: [0; 64],
            public_key_a: [0; 32],
            public_key_b: [0; 32],
        };
        sm.confirm_match(pid(1), &receipt).unwrap();
        assert_eq!(sm.state_of(&pid(1)), MatchState::Matched);
    }

    #[test]
    fn block_prevents_like() {
        let mut sm = MatchStateMachine::default();
        let block = BlockRecord {
            protocol_version: PROTOCOL_VERSION,
            blocker_profile_id: pid(9),
            blocked_profile_id: pid(1),
            issued_at: 1,
            signature: [0; 64],
            signer_public_key: [0; 32],
        };
        sm.apply_block(pid(1), &block);
        assert!(sm.send_like(pid(1)).is_err());
    }

    #[test]
    fn dislike_store_dedupes() {
        let mut store = LocalDislikeStore::default();
        store.record_dislike(pid(5));
        store.record_dislike(pid(5));
        assert_eq!(store.len(), 1);
        assert!(store.is_disliked(&pid(5)));
    }
}
