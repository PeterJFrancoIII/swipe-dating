//! Messaging session stub (post-match only).

use dating_matching::MatchState;
use serde::{Deserialize, Serialize};
use std::collections::HashSet;
use thiserror::Error;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MessageSession {
    pub match_id: [u8; 32],
    pub established_at: i64,
    pub sealed_mailbox_enabled: bool,
}

impl MessageSession {
    pub fn new(match_id: [u8; 32], established_at: i64) -> Self {
        Self {
            match_id,
            established_at,
            sealed_mailbox_enabled: false,
        }
    }
}

#[derive(Debug, Error, PartialEq, Eq)]
pub enum MessagingError {
    #[error("session requires prior match")]
    NotMatched,
    #[error("session already exists")]
    AlreadyEstablished,
    #[error("sealed mailbox is disabled by default")]
    SealedMailboxDisabled,
    #[error("replay nonce already seen")]
    ReplayDetected,
}

/// Explicit gate for the optional sealed mailbox relay (disabled by default).
#[derive(Debug, Clone, Copy, Default)]
pub struct SealedMailboxGate {
    enabled: bool,
}

impl SealedMailboxGate {
    pub const DISABLED_BY_DEFAULT: bool = true;

    pub fn new() -> Self {
        Self::default()
    }

    pub fn is_enabled(&self) -> bool {
        self.enabled
    }

    pub fn enable_explicitly(&mut self) -> Result<(), MessagingError> {
        self.enabled = true;
        Ok(())
    }

    pub fn require_enabled(&self) -> Result<(), MessagingError> {
        if self.enabled {
            Ok(())
        } else {
            Err(MessagingError::SealedMailboxDisabled)
        }
    }
}

/// Anti-replay nonce cache for inbound message envelopes.
pub trait ReplayNonceCache {
    fn seen(&self, nonce: &[u8; 16]) -> bool;
    fn record(&mut self, nonce: [u8; 16]) -> Result<(), MessagingError>;
}

#[derive(Debug, Default)]
pub struct InMemoryReplayNonceCache {
    seen_nonces: HashSet<[u8; 16]>,
}

impl ReplayNonceCache for InMemoryReplayNonceCache {
    fn seen(&self, nonce: &[u8; 16]) -> bool {
        self.seen_nonces.contains(nonce)
    }

    fn record(&mut self, nonce: [u8; 16]) -> Result<(), MessagingError> {
        if self.seen_nonces.contains(&nonce) {
            return Err(MessagingError::ReplayDetected);
        }
        self.seen_nonces.insert(nonce);
        Ok(())
    }
}

#[derive(Debug)]
pub struct SessionManager {
    session: Option<MessageSession>,
    match_state: MatchState,
    mailbox_gate: SealedMailboxGate,
    replay_cache: InMemoryReplayNonceCache,
}

impl Default for SessionManager {
    fn default() -> Self {
        Self {
            session: None,
            match_state: MatchState::Neutral,
            mailbox_gate: SealedMailboxGate::default(),
            replay_cache: InMemoryReplayNonceCache::default(),
        }
    }
}

impl SessionManager {
    pub fn match_state(&self) -> MatchState {
        self.match_state
    }

    pub fn set_match_state(&mut self, state: MatchState) {
        self.match_state = state;
    }

    pub fn mailbox_gate(&self) -> &SealedMailboxGate {
        &self.mailbox_gate
    }

    pub fn mailbox_gate_mut(&mut self) -> &mut SealedMailboxGate {
        &mut self.mailbox_gate
    }

    pub fn replay_cache_mut(&mut self) -> &mut InMemoryReplayNonceCache {
        &mut self.replay_cache
    }

    pub fn open_session(
        &mut self,
        match_id: [u8; 32],
        now: i64,
    ) -> Result<&MessageSession, MessagingError> {
        if self.match_state != MatchState::Matched {
            return Err(MessagingError::NotMatched);
        }
        if self.session.is_some() {
            return Err(MessagingError::AlreadyEstablished);
        }
        self.session = Some(MessageSession::new(match_id, now));
        Ok(self.session.as_ref().unwrap())
    }

    pub fn session(&self) -> Option<&MessageSession> {
        self.session.as_ref()
    }

    pub fn sealed_mailbox_enabled(&self) -> bool {
        self.session
            .as_ref()
            .map(|s| s.sealed_mailbox_enabled)
            .unwrap_or(false)
            && self.mailbox_gate.is_enabled()
    }

    pub fn enable_sealed_mailbox(&mut self) -> Result<(), MessagingError> {
        self.mailbox_gate.require_enabled()?;
        let session = self.session.as_mut().ok_or(MessagingError::NotMatched)?;
        session.sealed_mailbox_enabled = true;
        Ok(())
    }

    pub fn accept_inbound(&mut self, nonce: [u8; 16]) -> Result<(), MessagingError> {
        if self.replay_cache.seen(&nonce) {
            return Err(MessagingError::ReplayDetected);
        }
        self.replay_cache.record(nonce)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn session_only_after_match_state() {
        let mut mgr = SessionManager::default();
        assert!(mgr.open_session([1; 32], 100).is_err());
        mgr.set_match_state(MatchState::Matched);
        let session = mgr.open_session([1; 32], 100).unwrap();
        assert!(!session.sealed_mailbox_enabled);
    }

    #[test]
    fn sealed_mailbox_disabled_by_default() {
        let gate = SealedMailboxGate::new();
        assert!(!gate.is_enabled());
        assert_eq!(
            gate.require_enabled(),
            Err(MessagingError::SealedMailboxDisabled)
        );
    }

    #[test]
    fn sealed_mailbox_requires_explicit_enable() {
        let mut mgr = SessionManager::default();
        mgr.set_match_state(MatchState::Matched);
        mgr.open_session([1; 32], 100).unwrap();
        assert!(mgr.enable_sealed_mailbox().is_err());
        mgr.mailbox_gate_mut().enable_explicitly().unwrap();
        mgr.enable_sealed_mailbox().unwrap();
        assert!(mgr.sealed_mailbox_enabled());
    }

    #[test]
    fn replay_cache_rejects_duplicates() {
        let mut cache = InMemoryReplayNonceCache::default();
        cache.record([1; 16]).unwrap();
        assert!(cache.seen(&[1; 16]));
        assert_eq!(cache.record([1; 16]), Err(MessagingError::ReplayDetected));
    }
}
