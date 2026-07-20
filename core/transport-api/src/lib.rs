//! ICE transport policy and WebRTC session scaffolding.

use serde::{Deserialize, Serialize};
use thiserror::Error;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, Default)]
#[serde(rename_all = "snake_case")]
pub enum IceTransportPolicy {
    #[default]
    RelayOnly,
    AllowDirect,
}

impl IceTransportPolicy {
    pub fn requires_relay(&self) -> bool {
        matches!(self, Self::RelayOnly)
    }
}

/// ICE candidate transport classification for policy enforcement.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum IceCandidateType {
    Host,
    ServerReflexive,
    PeerReflexive,
    Relay,
}

impl IceCandidateType {
    pub fn is_relay(&self) -> bool {
        matches!(self, Self::Relay)
    }
}

/// Returns true when the candidate may be used under the active policy.
pub fn enforce_relay_first(policy: IceTransportPolicy, candidate: IceCandidateType) -> bool {
    match policy {
        IceTransportPolicy::RelayOnly => candidate.is_relay(),
        IceTransportPolicy::AllowDirect => true,
    }
}

/// WebRTC session lifecycle (stub state machine).
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, Default)]
#[serde(rename_all = "snake_case")]
pub enum WebRtcSessionState {
    #[default]
    Idle,
    Negotiating,
    Connected,
    Failed,
}

#[derive(Debug, Error, PartialEq, Eq)]
pub enum SessionTransitionError {
    #[error("invalid transition from {from:?} via {event:?}")]
    InvalidTransition {
        from: WebRtcSessionState,
        event: SessionEvent,
    },
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum SessionEvent {
    StartNegotiation,
    RemoteDescriptionApplied,
    IceConnected,
    IceFailed,
    Close,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct WebRtcSession {
    pub state: WebRtcSessionState,
    pub policy: IceTransportPolicy,
}

impl Default for WebRtcSession {
    fn default() -> Self {
        Self {
            state: WebRtcSessionState::Idle,
            policy: IceTransportPolicy::RelayOnly,
        }
    }
}

impl WebRtcSession {
    pub fn new(policy: IceTransportPolicy) -> Self {
        Self {
            state: WebRtcSessionState::Idle,
            policy,
        }
    }

    pub fn apply(
        &mut self,
        event: SessionEvent,
    ) -> Result<WebRtcSessionState, SessionTransitionError> {
        let next = match (self.state, event) {
            (WebRtcSessionState::Idle, SessionEvent::StartNegotiation) => {
                WebRtcSessionState::Negotiating
            }
            (WebRtcSessionState::Negotiating, SessionEvent::RemoteDescriptionApplied) => {
                WebRtcSessionState::Negotiating
            }
            (WebRtcSessionState::Negotiating, SessionEvent::IceConnected) => {
                WebRtcSessionState::Connected
            }
            (WebRtcSessionState::Negotiating, SessionEvent::IceFailed)
            | (WebRtcSessionState::Connected, SessionEvent::IceFailed) => {
                WebRtcSessionState::Failed
            }
            (WebRtcSessionState::Connected, SessionEvent::Close)
            | (WebRtcSessionState::Failed, SessionEvent::Close)
            | (WebRtcSessionState::Idle, SessionEvent::Close) => WebRtcSessionState::Idle,
            (from, event) => {
                return Err(SessionTransitionError::InvalidTransition { from, event });
            }
        };
        self.state = next;
        Ok(next)
    }

    pub fn selected_candidate_allowed(&self, candidate: IceCandidateType) -> bool {
        enforce_relay_first(self.policy, candidate)
    }
}

/// Request body for ephemeral TURN credential minting.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct TurnCredentialRequest {
    pub rendezvous_id: [u8; 32],
    pub ttl_seconds: Option<u32>,
}

/// TURN credential response — matches `dating-turn-credentials` MOCK shape.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct TurnCredentials {
    pub username: String,
    pub credential: String,
    pub ttl_seconds: u32,
    pub uris: Vec<String>,
    pub label: String,
}

impl TurnCredentials {
    pub fn mock() -> Self {
        Self {
            username: "MOCK:user:1700000000".to_string(),
            credential: "MOCK:credential:placeholder".to_string(),
            ttl_seconds: 600,
            uris: vec!["turn:turn.example.com:3478?transport=udp".to_string()],
            label: "MOCK".to_string(),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn relay_only_by_default() {
        assert!(IceTransportPolicy::default().requires_relay());
    }

    #[test]
    fn relay_first_rejects_host_candidate() {
        assert!(!enforce_relay_first(
            IceTransportPolicy::RelayOnly,
            IceCandidateType::Host
        ));
        assert!(enforce_relay_first(
            IceTransportPolicy::RelayOnly,
            IceCandidateType::Relay
        ));
    }

    #[test]
    fn allow_direct_accepts_host() {
        assert!(enforce_relay_first(
            IceTransportPolicy::AllowDirect,
            IceCandidateType::Host
        ));
    }

    #[test]
    fn session_idle_to_connected() {
        let mut session = WebRtcSession::new(IceTransportPolicy::RelayOnly);
        session.apply(SessionEvent::StartNegotiation).unwrap();
        session
            .apply(SessionEvent::RemoteDescriptionApplied)
            .unwrap();
        let state = session.apply(SessionEvent::IceConnected).unwrap();
        assert_eq!(state, WebRtcSessionState::Connected);
    }

    #[test]
    fn session_fails_on_ice_failure() {
        let mut session = WebRtcSession::new(IceTransportPolicy::RelayOnly);
        session.apply(SessionEvent::StartNegotiation).unwrap();
        let state = session.apply(SessionEvent::IceFailed).unwrap();
        assert_eq!(state, WebRtcSessionState::Failed);
    }

    #[test]
    fn turn_credentials_mock_shape() {
        let creds = TurnCredentials::mock();
        assert_eq!(creds.label, "MOCK");
        assert!(!creds.uris.is_empty());
    }
}
