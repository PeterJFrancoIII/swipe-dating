//! Consent-based Bluetooth proximity primitives.
//!
//! Bluetooth advertisements contain only a protocol version and rotating random-looking
//! encounter identifier. Profile ids, gender, orientation, intent, location, push tokens,
//! marketplace ids, and questionnaire answers are deliberately absent.

use crate::preferences::ProximityDisclosurePolicy;
use dating_crypto::hash_blake3;
use dating_protocol::PROTOCOL_VERSION;
use serde::{Deserialize, Serialize};

pub const ENCOUNTER_ID_LEN: usize = 16;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub struct ProximityAdvertisement {
    pub protocol_version: u16,
    pub encounter_id: [u8; ENCOUNTER_ID_LEN],
}

impl ProximityAdvertisement {
    pub fn new(encounter_id: [u8; ENCOUNTER_ID_LEN]) -> Self {
        Self {
            protocol_version: PROTOCOL_VERSION,
            encounter_id,
        }
    }

    pub fn is_valid(&self) -> bool {
        self.protocol_version == PROTOCOL_VERSION && self.encounter_id != [0; ENCOUNTER_ID_LEN]
    }
}

/// Derive a rotating encounter id from device-local random material.
///
/// `device_secret` must be separate from root/profile/rendezvous keys and must never leave the
/// device. `rotation_epoch` should be short-lived, and `session_nonce` must be random per mode
/// activation so captured advertisements cannot be replayed across sessions.
pub fn derive_rotating_encounter_id(
    device_secret: &[u8; 32],
    rotation_epoch: u64,
    session_nonce: &[u8; 16],
) -> [u8; ENCOUNTER_ID_LEN] {
    let mut input = Vec::with_capacity(32 + 8 + 16 + 29);
    input.extend_from_slice(b"swipe-proximity-encounter-v1");
    input.extend_from_slice(device_secret);
    input.extend_from_slice(&rotation_epoch.to_le_bytes());
    input.extend_from_slice(session_nonce);
    let digest = hash_blake3(&input);
    let mut encounter_id = [0u8; ENCOUNTER_ID_LEN];
    encounter_id.copy_from_slice(&digest[..ENCOUNTER_ID_LEN]);
    encounter_id
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct ProximityEncounterContext {
    pub adult_credential_valid: bool,
    pub emergency_privacy: bool,
    pub blocked: bool,
    pub remote_is_independently_compatible: bool,
    pub within_haptic_cooldown: bool,
    pub disclosure_policy: ProximityDisclosurePolicy,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ProximityEncounterDecision {
    Suppress,
    BuzzWithoutProfileDisclosure,
    BuzzAndPromptBeforeSharing,
    BuzzAndShareScopedCapability,
}

/// Decide local behavior for an authenticated nearby event.
///
/// A buzz does not itself disclose a profile. Auto-share produces only a short-lived,
/// revocable profile-fetch capability and is allowed solely after explicit opt-in.
pub fn decide_proximity_event(context: ProximityEncounterContext) -> ProximityEncounterDecision {
    if !context.adult_credential_valid
        || context.emergency_privacy
        || context.blocked
        || context.within_haptic_cooldown
        || context.disclosure_policy == ProximityDisclosurePolicy::Off
    {
        return ProximityEncounterDecision::Suppress;
    }

    if !context.remote_is_independently_compatible {
        return ProximityEncounterDecision::BuzzWithoutProfileDisclosure;
    }

    match context.disclosure_policy {
        ProximityDisclosurePolicy::Off => ProximityEncounterDecision::Suppress,
        ProximityDisclosurePolicy::PromptBeforeSharing => {
            ProximityEncounterDecision::BuzzAndPromptBeforeSharing
        }
        ProximityDisclosurePolicy::AutoShareCompatible => {
            ProximityEncounterDecision::BuzzAndShareScopedCapability
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn context(policy: ProximityDisclosurePolicy) -> ProximityEncounterContext {
        ProximityEncounterContext {
            adult_credential_valid: true,
            emergency_privacy: false,
            blocked: false,
            remote_is_independently_compatible: true,
            within_haptic_cooldown: false,
            disclosure_policy: policy,
        }
    }

    #[test]
    fn encounter_ids_rotate_by_epoch_and_session() {
        let secret = [7u8; 32];
        let a = derive_rotating_encounter_id(&secret, 10, &[1u8; 16]);
        let b = derive_rotating_encounter_id(&secret, 11, &[1u8; 16]);
        let c = derive_rotating_encounter_id(&secret, 10, &[2u8; 16]);
        assert_ne!(a, b);
        assert_ne!(a, c);
        assert!(ProximityAdvertisement::new(a).is_valid());
    }

    #[test]
    fn default_off_and_safety_states_suppress() {
        assert_eq!(
            decide_proximity_event(context(ProximityDisclosurePolicy::Off)),
            ProximityEncounterDecision::Suppress
        );

        let mut emergency = context(ProximityDisclosurePolicy::PromptBeforeSharing);
        emergency.emergency_privacy = true;
        assert_eq!(
            decide_proximity_event(emergency),
            ProximityEncounterDecision::Suppress
        );

        let mut blocked = context(ProximityDisclosurePolicy::PromptBeforeSharing);
        blocked.blocked = true;
        assert_eq!(
            decide_proximity_event(blocked),
            ProximityEncounterDecision::Suppress
        );
    }

    #[test]
    fn prompt_is_the_safe_disclosure_default() {
        assert_eq!(
            decide_proximity_event(context(ProximityDisclosurePolicy::PromptBeforeSharing)),
            ProximityEncounterDecision::BuzzAndPromptBeforeSharing
        );
    }

    #[test]
    fn incompatible_nearby_adult_never_receives_profile_capability() {
        let mut nearby = context(ProximityDisclosurePolicy::AutoShareCompatible);
        nearby.remote_is_independently_compatible = false;
        assert_eq!(
            decide_proximity_event(nearby),
            ProximityEncounterDecision::BuzzWithoutProfileDisclosure
        );
    }

    #[test]
    fn auto_share_requires_explicit_policy_and_compatibility() {
        assert_eq!(
            decide_proximity_event(context(ProximityDisclosurePolicy::AutoShareCompatible)),
            ProximityEncounterDecision::BuzzAndShareScopedCapability
        );
    }
}
