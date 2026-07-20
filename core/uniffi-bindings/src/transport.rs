//! ICE transport policy for WebRTC privacy modes.

use dating_transport_api::IceTransportPolicy;

#[derive(Debug, Clone, Copy, PartialEq, Eq, uniffi::Enum)]
pub enum FfiIceTransportPolicy {
    RelayOnly,
    AllowDirect,
}

impl From<IceTransportPolicy> for FfiIceTransportPolicy {
    fn from(value: IceTransportPolicy) -> Self {
        match value {
            IceTransportPolicy::RelayOnly => Self::RelayOnly,
            IceTransportPolicy::AllowDirect => Self::AllowDirect,
        }
    }
}

impl From<FfiIceTransportPolicy> for IceTransportPolicy {
    fn from(value: FfiIceTransportPolicy) -> Self {
        match value {
            FfiIceTransportPolicy::RelayOnly => Self::RelayOnly,
            FfiIceTransportPolicy::AllowDirect => Self::AllowDirect,
        }
    }
}

#[uniffi::export]
pub fn ice_transport_requires_relay(policy: FfiIceTransportPolicy) -> bool {
    IceTransportPolicy::from(policy).requires_relay()
}
