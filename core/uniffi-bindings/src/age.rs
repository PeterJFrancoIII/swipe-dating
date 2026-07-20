//! Age eligibility mock evaluation — fail-closed discovery gate.

use chrono::{DateTime, TimeZone, Utc};
use dating_identity::{
    assert_discovery_allowed as core_assert_discovery_allowed, AgeAssuranceProvider,
    EligibilityCredential, EligibilityError, MockAgeProvider,
};

#[derive(Debug, Clone, uniffi::Record)]
pub struct EligibilitySummary {
    pub adult: bool,
    pub age_band: Option<String>,
    pub issued_at_unix: i64,
    pub expires_at_unix: i64,
    pub provider: String,
    pub appeal_allowed: bool,
}

impl From<EligibilityCredential> for EligibilitySummary {
    fn from(cred: EligibilityCredential) -> Self {
        Self {
            adult: cred.adult,
            age_band: cred.age_band,
            issued_at_unix: cred.issued_at.timestamp(),
            expires_at_unix: cred.expires_at.timestamp(),
            provider: cred.provider,
            appeal_allowed: cred.appeal_allowed,
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, thiserror::Error, uniffi::Error)]
pub enum EligibilityErrorCode {
    #[error("ineligible")]
    Ineligible,
    #[error("ambiguous eligibility — fail closed")]
    Ambiguous,
    #[error("expired eligibility")]
    Expired,
    #[error("revoked eligibility")]
    Revoked,
    #[error("provider unavailable — fail closed")]
    ProviderUnavailable,
}

impl From<EligibilityError> for EligibilityErrorCode {
    fn from(value: EligibilityError) -> Self {
        match value {
            EligibilityError::Ineligible => Self::Ineligible,
            EligibilityError::Ambiguous => Self::Ambiguous,
            EligibilityError::Expired => Self::Expired,
            EligibilityError::Revoked => Self::Revoked,
            EligibilityError::ProviderUnavailable => Self::ProviderUnavailable,
        }
    }
}

fn cred_from_summary(
    summary: &EligibilitySummary,
) -> Result<EligibilityCredential, EligibilityErrorCode> {
    let issued_at = Utc
        .timestamp_opt(summary.issued_at_unix, 0)
        .single()
        .ok_or(EligibilityErrorCode::Ambiguous)?;
    let expires_at = Utc
        .timestamp_opt(summary.expires_at_unix, 0)
        .single()
        .ok_or(EligibilityErrorCode::Ambiguous)?;
    Ok(EligibilityCredential {
        adult: summary.adult,
        age_band: summary.age_band.clone(),
        issued_at,
        expires_at,
        provider: summary.provider.clone(),
        appeal_allowed: summary.appeal_allowed,
    })
}

/// Staging mock age assurance — never stores identity documents.
#[uniffi::export]
pub fn evaluate_mock_age_eligibility(
    adult: bool,
    ambiguous: bool,
    unavailable: bool,
) -> Result<EligibilitySummary, EligibilityErrorCode> {
    let provider = MockAgeProvider {
        adult,
        ambiguous,
        unavailable,
        ..MockAgeProvider::default()
    };
    let now = Utc::now();
    provider.evaluate(now).map(Into::into).map_err(Into::into)
}

/// Fail-closed gate before entering discovery.
#[uniffi::export]
pub fn assert_discovery_allowed(
    summary: EligibilitySummary,
    now_unix: i64,
) -> Result<(), EligibilityErrorCode> {
    let cred = cred_from_summary(&summary)?;
    let now: DateTime<Utc> = Utc
        .timestamp_opt(now_unix, 0)
        .single()
        .ok_or(EligibilityErrorCode::Ambiguous)?;
    core_assert_discovery_allowed(&cred, now).map_err(Into::into)
}
