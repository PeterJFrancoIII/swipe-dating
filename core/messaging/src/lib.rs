//! Messaging session stub (post-match only).

use serde::{Deserialize, Serialize};
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
}

#[derive(Debug, Default)]
pub struct SessionManager {
    session: Option<MessageSession>,
    matched: bool,
}

impl SessionManager {
    pub fn mark_matched(&mut self) {
        self.matched = true;
    }

    pub fn open_session(
        &mut self,
        match_id: [u8; 32],
        now: i64,
    ) -> Result<&MessageSession, MessagingError> {
        if !self.matched {
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
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn session_only_after_match() {
        let mut mgr = SessionManager::default();
        assert!(mgr.open_session([1; 32], 100).is_err());
        mgr.mark_matched();
        let session = mgr.open_session([1; 32], 100).unwrap();
        assert!(!session.sealed_mailbox_enabled);
    }
}
