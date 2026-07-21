//! Privacy-preserving abuse-risk primitives.
//!
//! This module intentionally avoids message plaintext, questionnaire answers, protected traits,
//! marketplace purchases, and attractiveness signals. It supports request-level friction and
//! temporary containment only; consequential account action remains human-reviewed.

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum AttestationVerdict {
    HardwareBacked,
    SoftwareFallback,
    Unsupported,
    Missing,
    Failed,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct RiskSignals {
    pub adult_credential_valid: bool,
    pub adult_credential_revoked: bool,
    pub attestation: AttestationVerdict,
    pub device_integrity_compromised: bool,
    pub accounts_created_24h: u16,
    pub presence_publishes_minute: u16,
    pub discovery_requests_minute: u16,
    pub profile_fetches_minute: u16,
    pub likes_minute: u16,
    pub ble_replay_hits_24h: u16,
    pub impossible_travel_events_24h: u16,
    pub malicious_link_hits_30d: u16,
    pub coordinated_report_hits_24h: u16,
    pub prior_enforcement_points: u16,
}

impl RiskSignals {
    pub fn trusted_human_baseline() -> Self {
        Self {
            adult_credential_valid: true,
            adult_credential_revoked: false,
            attestation: AttestationVerdict::HardwareBacked,
            device_integrity_compromised: false,
            accounts_created_24h: 1,
            presence_publishes_minute: 2,
            discovery_requests_minute: 10,
            profile_fetches_minute: 8,
            likes_minute: 5,
            ble_replay_hits_24h: 0,
            impossible_travel_events_24h: 0,
            malicious_link_hits_30d: 0,
            coordinated_report_hits_24h: 0,
            prior_enforcement_points: 0,
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum RiskReason {
    MissingAdultCredential,
    RevokedAdultCredential,
    FailedAttestation,
    MissingAttestation,
    LowerTrustDevice,
    CompromisedDevice,
    MassRegistration,
    PresenceFlood,
    DiscoveryScraping,
    ProfileScraping,
    AutomatedLiking,
    BleReplay,
    ImpossibleTravel,
    MaliciousLinks,
    ReportBrigading,
    PriorEnforcement,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum RiskAction {
    Allow,
    Throttle { retry_after_seconds: u32 },
    Challenge { difficulty: u8 },
    ContainPendingReview,
    RejectRequest,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct RiskAssessment {
    pub score: u16,
    pub action: RiskAction,
    pub reasons: Vec<RiskReason>,
}

fn add_capped(score: &mut u16, amount: u16, cap: u16) {
    *score = score.saturating_add(amount.min(cap));
}

/// Evaluate request risk without reading private content.
///
/// The result may slow, challenge, reject the current request, or temporarily contain an
/// identity. It must not be interpreted as an autonomous permanent-ban decision.
pub fn assess_request(signals: &RiskSignals) -> RiskAssessment {
    if signals.adult_credential_revoked {
        return RiskAssessment {
            score: 1_000,
            action: RiskAction::RejectRequest,
            reasons: vec![RiskReason::RevokedAdultCredential],
        };
    }
    if !signals.adult_credential_valid {
        return RiskAssessment {
            score: 1_000,
            action: RiskAction::RejectRequest,
            reasons: vec![RiskReason::MissingAdultCredential],
        };
    }
    if signals.device_integrity_compromised {
        return RiskAssessment {
            score: 100,
            action: RiskAction::ContainPendingReview,
            reasons: vec![RiskReason::CompromisedDevice],
        };
    }
    if signals.attestation == AttestationVerdict::Failed {
        return RiskAssessment {
            score: 100,
            action: RiskAction::ContainPendingReview,
            reasons: vec![RiskReason::FailedAttestation],
        };
    }

    let mut score = 0u16;
    let mut reasons = Vec::new();

    match signals.attestation {
        AttestationVerdict::HardwareBacked => {}
        AttestationVerdict::SoftwareFallback => {
            score = score.saturating_add(8);
            reasons.push(RiskReason::LowerTrustDevice);
        }
        AttestationVerdict::Unsupported => {
            score = score.saturating_add(20);
            reasons.push(RiskReason::LowerTrustDevice);
        }
        AttestationVerdict::Missing => {
            score = score.saturating_add(30);
            reasons.push(RiskReason::MissingAttestation);
        }
        AttestationVerdict::Failed => unreachable!("handled above"),
    }

    if signals.accounts_created_24h > 2 {
        add_capped(
            &mut score,
            signals.accounts_created_24h.saturating_sub(2).saturating_mul(12),
            48,
        );
        reasons.push(RiskReason::MassRegistration);
    }
    if signals.presence_publishes_minute > 12 {
        score = score.saturating_add(20);
        reasons.push(RiskReason::PresenceFlood);
    }
    if signals.discovery_requests_minute > 120 {
        score = score.saturating_add(20);
        reasons.push(RiskReason::DiscoveryScraping);
    }
    if signals.profile_fetches_minute > 100 {
        score = score.saturating_add(25);
        reasons.push(RiskReason::ProfileScraping);
    }
    if signals.likes_minute > 60 {
        score = score.saturating_add(25);
        reasons.push(RiskReason::AutomatedLiking);
    }
    if signals.ble_replay_hits_24h > 0 {
        add_capped(
            &mut score,
            signals.ble_replay_hits_24h.saturating_mul(30),
            90,
        );
        reasons.push(RiskReason::BleReplay);
    }
    if signals.impossible_travel_events_24h > 0 {
        add_capped(
            &mut score,
            signals.impossible_travel_events_24h.saturating_mul(25),
            75,
        );
        reasons.push(RiskReason::ImpossibleTravel);
    }
    if signals.malicious_link_hits_30d > 0 {
        add_capped(
            &mut score,
            signals.malicious_link_hits_30d.saturating_mul(40),
            120,
        );
        reasons.push(RiskReason::MaliciousLinks);
    }
    if signals.coordinated_report_hits_24h > 0 {
        add_capped(
            &mut score,
            signals.coordinated_report_hits_24h.saturating_mul(20),
            80,
        );
        reasons.push(RiskReason::ReportBrigading);
    }
    if signals.prior_enforcement_points > 0 {
        add_capped(&mut score, signals.prior_enforcement_points, 100);
        reasons.push(RiskReason::PriorEnforcement);
    }

    let action = match score {
        0..=19 => RiskAction::Allow,
        20..=39 => RiskAction::Throttle {
            retry_after_seconds: 30,
        },
        40..=69 => RiskAction::Challenge {
            difficulty: ((score - 35) / 5).clamp(1, 7) as u8,
        },
        _ => RiskAction::ContainPendingReview,
    };

    RiskAssessment {
        score,
        action,
        reasons,
    }
}

/// Derive a rotating, service-pairwise quota key without placing a profile id in rate-limit
/// storage. The caller must rotate `epoch` and keep `device_binding` out of logs.
pub fn derive_pairwise_quota_key(
    service_scope: &str,
    device_binding: &[u8],
    epoch: u64,
) -> [u8; 32] {
    let mut hasher = blake3::Hasher::new();
    hasher.update(b"swipe-dating-pairwise-quota-v1");
    hasher.update(&(service_scope.len() as u64).to_le_bytes());
    hasher.update(service_scope.as_bytes());
    hasher.update(&(device_binding.len() as u64).to_le_bytes());
    hasher.update(device_binding);
    hasher.update(&epoch.to_le_bytes());
    *hasher.finalize().as_bytes()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn ordinary_adult_use_is_allowed_without_payment_signal() {
        let result = assess_request(&RiskSignals::trusted_human_baseline());
        assert_eq!(result.action, RiskAction::Allow);
        assert_eq!(result.score, 0);
    }

    #[test]
    fn adult_credential_is_a_hard_network_gate() {
        let mut signals = RiskSignals::trusted_human_baseline();
        signals.adult_credential_valid = false;
        let result = assess_request(&signals);
        assert_eq!(result.action, RiskAction::RejectRequest);
        assert!(result.reasons.contains(&RiskReason::MissingAdultCredential));
    }

    #[test]
    fn replayed_ble_identifiers_trigger_containment() {
        let mut signals = RiskSignals::trusted_human_baseline();
        signals.ble_replay_hits_24h = 3;
        let result = assess_request(&signals);
        assert_eq!(result.action, RiskAction::ContainPendingReview);
        assert!(result.reasons.contains(&RiskReason::BleReplay));
    }

    #[test]
    fn suspicious_velocity_uses_progressive_friction() {
        let mut signals = RiskSignals::trusted_human_baseline();
        signals.likes_minute = 80;
        signals.discovery_requests_minute = 150;
        let result = assess_request(&signals);
        assert!(matches!(result.action, RiskAction::Challenge { .. }));
    }

    #[test]
    fn quota_keys_are_pairwise_and_rotate() {
        let binding = b"attested-device-handle";
        let a = derive_pairwise_quota_key("rendezvous", binding, 10);
        let b = derive_pairwise_quota_key("mailbox", binding, 10);
        let c = derive_pairwise_quota_key("rendezvous", binding, 11);
        assert_ne!(a, b);
        assert_ne!(a, c);
    }
}
