//! ICE transport policy for WebRTC privacy modes.

use serde::{Deserialize, Serialize};

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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn relay_only_by_default() {
        assert!(IceTransportPolicy::default().requires_relay());
    }
}
