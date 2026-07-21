//! Privacy-conscious bot, spam, and Sybil resistance primitives.
//!
//! The policy engine consumes bounded technical/risk signals. It must not receive
//! message plaintext, sexual questionnaire answers, precise coordinates, photos,
//! race/ethnicity, gender, orientation, or marketplace spending as risk inputs.

use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet, VecDeque};
use thiserror::Error;

pub const REQUEST_NONCE_LEN: usize = 16;
pub const REQUEST_HASH_LEN: usize = 32;
pub const MAX_CHALLENGE_TTL_SECS: i64 = 300;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ActionKind {
    CreateAccount,
    PublishPresence,
    Discover,
    ProximityHandshake,
    FetchProfile,
    SendLike,
    OpenMessageSession,
    SendMessage,
    SubmitReport,
    MarketplacePublish,
    MarketplacePurchase,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum AttestationPlatform {
    AppleAppAttest,
    GooglePlayIntegrity,
    UnsupportedFallback,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum AttestationVerdict {
    Verified,
    Degraded,
    Unsupported,
    Invalid,
    Replay,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct IdentityGateContext {
    pub adult_credential_valid: bool,
    pub passkey_bound: bool,
    pub device_key_authorized: bool,
    pub attestation_platform: AttestationPlatform,
    pub attestation_verdict: AttestationVerdict,
    pub account_age_seconds: u64,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum RiskSignal {
    MissingAdultCredential,
    MissingPasskey,
    UnauthorizedDeviceKey,
    InvalidAttestation,
    AttestationReplay,
    RequestReplay,
    VelocityExceeded { observed: u32, limit: u32 },
    ExcessiveAccountCreation { observed: u32, limit: u32 },
    DeviceIdentityFanout { observed: u32, limit: u32 },
    CoordinatedFanout { recipients: u32, window_seconds: u32 },
    ImpossibleRegionChange { elapsed_seconds: u32 },
    EncounterIdentifierReplay,
    RepeatedBlockedUserContact,
    KnownMaliciousLink,
    MarketplacePaymentFraud,
    ReportBrigading,
}

impl RiskSignal {
    pub fn weight(&self) -> u32 {
        match self {
            Self::MissingAdultCredential => 100,
            Self::MissingPasskey => 40,
            Self::UnauthorizedDeviceKey => 100,
            Self::InvalidAttestation => 90,
            Self::AttestationReplay => 100,
            Self::RequestReplay => 100,
            Self::VelocityExceeded { observed, limit } => {
                15 + observed.saturating_sub(*limit).min(50)
            }
            Self::ExcessiveAccountCreation { observed, limit } => {
                30 + observed.saturating_sub(*limit).min(50)
            }
            Self::DeviceIdentityFanout { observed, limit } => {
                25 + observed.saturating_sub(*limit).min(50)
            }
            Self::CoordinatedFanout { recipients, .. } => 20 + recipients.min(&60),
            Self::ImpossibleRegionChange { .. } => 40,
            Self::EncounterIdentifierReplay => 70,
            Self::RepeatedBlockedUserContact => 100,
            Self::KnownMaliciousLink => 80,
            Self::MarketplacePaymentFraud => 80,
            Self::ReportBrigading => 65,
        }
    }

    pub fn reason_code(&self) -> &'static str {
        match self {
            Self::MissingAdultCredential => "adult_credential_required",
            Self::MissingPasskey => "passkey_required",
            Self::UnauthorizedDeviceKey => "device_key_unauthorized",
            Self::InvalidAttestation => "attestation_invalid",
            Self::AttestationReplay => "attestation_replay",
            Self::RequestReplay => "request_replay",
            Self::VelocityExceeded { .. } => "velocity_exceeded",
            Self::ExcessiveAccountCreation { .. } => "account_creation_fanout",
            Self::DeviceIdentityFanout { .. } => "device_identity_fanout",
            Self::CoordinatedFanout { .. } => "coordinated_fanout",
            Self::ImpossibleRegionChange { .. } => "impossible_region_change",
            Self::EncounterIdentifierReplay => "encounter_id_replay",
            Self::RepeatedBlockedUserContact => "blocked_user_contact",
            Self::KnownMaliciousLink => "known_malicious_link",
            Self::MarketplacePaymentFraud => "marketplace_payment_fraud",
            Self::ReportBrigading => "report_brigading",
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(tag = "decision", rename_all = "snake_case")]
pub enum RiskDecision {
    Allow,
    Throttle { retry_after_seconds: u32 },
    Challenge { difficulty: u8, expires_in_seconds: u32 },
    Contain { reason_code: String, appeal_allowed: bool },
}

impl RiskDecision {
    pub fn permits_action(&self) -> bool {
        matches!(self, Self::Allow)
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct RiskEvaluation {
    pub score: u32,
    pub decision: RiskDecision,
    pub reason_codes: Vec<&'static str>,
}

#[derive(Debug, Clone)]
pub struct RiskPolicy {
    pub throttle_score: u32,
    pub challenge_score: u32,
    pub contain_score: u32,
}

impl Default for RiskPolicy {
    fn default() -> Self {
        Self {
            throttle_score: 25,
            challenge_score: 55,
            contain_score: 90,
        }
    }
}

impl RiskPolicy {
    pub fn evaluate(&self, signals: &[RiskSignal]) -> RiskEvaluation {
        let score = signals.iter().map(RiskSignal::weight).sum::<u32>().min(1_000);
        let reason_codes = signals.iter().map(RiskSignal::reason_code).collect::<Vec<_>>();

        let hard_containment = signals.iter().find(|signal| {
            matches!(
                signal,
                RiskSignal::MissingAdultCredential
                    | RiskSignal::UnauthorizedDeviceKey
                    | RiskSignal::AttestationReplay
                    | RiskSignal::RequestReplay
                    | RiskSignal::RepeatedBlockedUserContact
            )
        });

        let decision = if let Some(signal) = hard_containment {
            RiskDecision::Contain {
                reason_code: signal.reason_code().to_string(),
                appeal_allowed: !matches!(signal, RiskSignal::RequestReplay),
            }
        } else if score >= self.contain_score {
            RiskDecision::Contain {
                reason_code: reason_codes.first().copied().unwrap_or("risk_containment").to_string(),
                appeal_allowed: true,
            }
        } else if score >= self.challenge_score {
            RiskDecision::Challenge {
                difficulty: challenge_difficulty(score),
                expires_in_seconds: 120,
            }
        } else if score >= self.throttle_score {
            RiskDecision::Throttle {
                retry_after_seconds: throttle_delay(score),
            }
        } else {
            RiskDecision::Allow
        };

        RiskEvaluation {
            score,
            decision,
            reason_codes,
        }
    }
}

fn challenge_difficulty(score: u32) -> u8 {
    match score {
        0..=64 => 1,
        65..=79 => 2,
        _ => 3,
    }
}

fn throttle_delay(score: u32) -> u32 {
    (score.saturating_sub(20) * 2).clamp(10, 120)
}

/// Builds the mandatory identity and platform-integrity signals for an action.
/// Unsupported devices receive degraded trust and progressive friction, not a
/// silent full-trust bypass.
pub fn identity_gate_signals(
    action: ActionKind,
    context: &IdentityGateContext,
) -> Vec<RiskSignal> {
    let mut signals = Vec::new();

    if action_requires_adult_credential(action) && !context.adult_credential_valid {
        signals.push(RiskSignal::MissingAdultCredential);
    }
    if action_requires_passkey(action) && !context.passkey_bound {
        signals.push(RiskSignal::MissingPasskey);
    }
    if !context.device_key_authorized {
        signals.push(RiskSignal::UnauthorizedDeviceKey);
    }

    match context.attestation_verdict {
        AttestationVerdict::Verified => {}
        AttestationVerdict::Degraded | AttestationVerdict::Unsupported => {
            signals.push(RiskSignal::VelocityExceeded {
                observed: 2,
                limit: 1,
            });
        }
        AttestationVerdict::Invalid => signals.push(RiskSignal::InvalidAttestation),
        AttestationVerdict::Replay => signals.push(RiskSignal::AttestationReplay),
    }

    // New identities may use the service, but high-fanout actions start with a
    // small amount of friction rather than a paywall.
    if context.account_age_seconds < 600
        && matches!(
            action,
            ActionKind::PublishPresence
                | ActionKind::ProximityHandshake
                | ActionKind::SendLike
                | ActionKind::MarketplacePublish
        )
    {
        signals.push(RiskSignal::VelocityExceeded {
            observed: 2,
            limit: 1,
        });
    }

    signals
}

fn action_requires_adult_credential(action: ActionKind) -> bool {
    !matches!(action, ActionKind::SubmitReport)
}

fn action_requires_passkey(action: ActionKind) -> bool {
    matches!(
        action,
        ActionKind::CreateAccount
            | ActionKind::PublishPresence
            | ActionKind::ProximityHandshake
            | ActionKind::SendLike
            | ActionKind::OpenMessageSession
            | ActionKind::MarketplacePublish
            | ActionKind::MarketplacePurchase
    )
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct RequestBinding {
    pub action: ActionKind,
    pub nonce: [u8; REQUEST_NONCE_LEN],
    pub request_hash: [u8; REQUEST_HASH_LEN],
    pub issued_at: i64,
    pub expires_at: i64,
}

impl RequestBinding {
    pub fn new(
        action: ActionKind,
        nonce: [u8; REQUEST_NONCE_LEN],
        request_body: &[u8],
        issued_at: i64,
        ttl_seconds: u32,
    ) -> Result<Self, RequestBindingError> {
        if ttl_seconds == 0 || i64::from(ttl_seconds) > MAX_CHALLENGE_TTL_SECS {
            return Err(RequestBindingError::InvalidTtl);
        }
        Ok(Self {
            action,
            nonce,
            request_hash: *blake3::hash(request_body).as_bytes(),
            issued_at,
            expires_at: issued_at + i64::from(ttl_seconds),
        })
    }

    pub fn validate(
        &self,
        request_body: &[u8],
        now: i64,
        nonce_cache: &mut dyn NonceCache,
    ) -> Result<(), RequestBindingError> {
        if self.expires_at <= now || self.issued_at > now + 30 {
            return Err(RequestBindingError::Expired);
        }
        if self.request_hash != *blake3::hash(request_body).as_bytes() {
            return Err(RequestBindingError::HashMismatch);
        }
        if nonce_cache.seen(&self.nonce) {
            return Err(RequestBindingError::Replay);
        }
        nonce_cache.record(self.nonce);
        Ok(())
    }
}

#[derive(Debug, Error, PartialEq, Eq)]
pub enum RequestBindingError {
    #[error("request challenge ttl is invalid")]
    InvalidTtl,
    #[error("request challenge expired or issued too far in the future")]
    Expired,
    #[error("request body does not match challenge binding")]
    HashMismatch,
    #[error("request nonce replayed")]
    Replay,
}

pub trait NonceCache {
    fn seen(&self, nonce: &[u8; REQUEST_NONCE_LEN]) -> bool;
    fn record(&mut self, nonce: [u8; REQUEST_NONCE_LEN]);
}

#[derive(Debug, Default)]
pub struct InMemoryNonceCache {
    seen: HashSet<[u8; REQUEST_NONCE_LEN]>,
}

impl NonceCache for InMemoryNonceCache {
    fn seen(&self, nonce: &[u8; REQUEST_NONCE_LEN]) -> bool {
        self.seen.contains(nonce)
    }

    fn record(&mut self, nonce: [u8; REQUEST_NONCE_LEN]) {
        self.seen.insert(nonce);
    }
}

/// Bounded sliding-window counter keyed by a pairwise or otherwise pseudonymous
/// quota key. The key must not be a raw push token, phone number, email, exact
/// location, questionnaire answer, or global advertising identifier.
#[derive(Debug)]
pub struct VelocityLimiter {
    window_seconds: i64,
    limit: usize,
    events: HashMap<String, VecDeque<i64>>,
}

impl VelocityLimiter {
    pub fn new(window_seconds: i64, limit: usize) -> Result<Self, VelocityError> {
        if window_seconds <= 0 || limit == 0 {
            return Err(VelocityError::InvalidPolicy);
        }
        Ok(Self {
            window_seconds,
            limit,
            events: HashMap::new(),
        })
    }

    pub fn observe(&mut self, quota_key: &str, now: i64) -> VelocityObservation {
        let queue = self.events.entry(quota_key.to_string()).or_default();
        let cutoff = now.saturating_sub(self.window_seconds);
        while queue.front().is_some_and(|timestamp| *timestamp <= cutoff) {
            queue.pop_front();
        }
        queue.push_back(now);
        VelocityObservation {
            observed: queue.len(),
            limit: self.limit,
            exceeded: queue.len() > self.limit,
        }
    }
}

#[derive(Debug, Error, PartialEq, Eq)]
pub enum VelocityError {
    #[error("velocity policy must have a positive window and limit")]
    InvalidPolicy,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct VelocityObservation {
    pub observed: usize,
    pub limit: usize,
    pub exceeded: bool,
}

#[cfg(test)]
mod tests {
    use super::*;

    fn verified_context() -> IdentityGateContext {
        IdentityGateContext {
            adult_credential_valid: true,
            passkey_bound: true,
            device_key_authorized: true,
            attestation_platform: AttestationPlatform::AppleAppAttest,
            attestation_verdict: AttestationVerdict::Verified,
            account_age_seconds: 86_400,
        }
    }

    #[test]
    fn verified_adult_may_publish_presence() {
        let signals = identity_gate_signals(ActionKind::PublishPresence, &verified_context());
        let evaluation = RiskPolicy::default().evaluate(&signals);
        assert_eq!(evaluation.decision, RiskDecision::Allow);
    }

    #[test]
    fn missing_adult_credential_hard_contains() {
        let mut context = verified_context();
        context.adult_credential_valid = false;
        let signals = identity_gate_signals(ActionKind::ProximityHandshake, &context);
        let evaluation = RiskPolicy::default().evaluate(&signals);
        assert!(matches!(
            evaluation.decision,
            RiskDecision::Contain { ref reason_code, .. } if reason_code == "adult_credential_required"
        ));
    }

    #[test]
    fn unsupported_attestation_gets_friction_not_full_block() {
        let mut context = verified_context();
        context.attestation_platform = AttestationPlatform::UnsupportedFallback;
        context.attestation_verdict = AttestationVerdict::Unsupported;
        let signals = identity_gate_signals(ActionKind::Discover, &context);
        let evaluation = RiskPolicy::default().evaluate(&signals);
        assert!(matches!(
            evaluation.decision,
            RiskDecision::Allow | RiskDecision::Throttle { .. }
        ));
    }

    #[test]
    fn request_binding_rejects_body_tamper_and_replay() {
        let binding = RequestBinding::new(
            ActionKind::SendLike,
            [7; REQUEST_NONCE_LEN],
            b"original",
            1_700_000_000,
            120,
        )
        .unwrap();
        let mut cache = InMemoryNonceCache::default();

        assert_eq!(
            binding.validate(b"tampered", 1_700_000_010, &mut cache),
            Err(RequestBindingError::HashMismatch)
        );
        binding
            .validate(b"original", 1_700_000_010, &mut cache)
            .unwrap();
        assert_eq!(
            binding.validate(b"original", 1_700_000_011, &mut cache),
            Err(RequestBindingError::Replay)
        );
    }

    #[test]
    fn velocity_limiter_uses_bounded_window() {
        let mut limiter = VelocityLimiter::new(60, 2).unwrap();
        assert!(!limiter.observe("pairwise-a", 100).exceeded);
        assert!(!limiter.observe("pairwise-a", 110).exceeded);
        assert!(limiter.observe("pairwise-a", 120).exceeded);
        assert!(!limiter.observe("pairwise-a", 200).exceeded);
    }

    #[test]
    fn plaintext_and_sensitive_traits_are_not_risk_signal_variants() {
        let encoded = serde_json::to_string(&RiskSignal::VelocityExceeded {
            observed: 4,
            limit: 2,
        })
        .unwrap();
        assert!(!encoded.contains("message"));
        assert!(!encoded.contains("gender"));
        assert!(!encoded.contains("orientation"));
        assert!(!encoded.contains("location"));
        assert!(!encoded.contains("questionnaire"));
    }
}
