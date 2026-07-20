//! Provider-neutral adult age eligibility (mock adapters only).

use chrono::{DateTime, Duration, Utc};
use serde::{Deserialize, Serialize};
use thiserror::Error;

/// Derived eligibility — never stores identity documents or biometrics.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct EligibilityCredential {
    pub adult: bool,
    pub age_band: Option<String>,
    pub issued_at: DateTime<Utc>,
    pub expires_at: DateTime<Utc>,
    pub provider: String,
    pub appeal_allowed: bool,
}

#[derive(Debug, Error, PartialEq, Eq)]
pub enum EligibilityError {
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

pub trait AgeAssuranceProvider {
    fn evaluate(&self, now: DateTime<Utc>) -> Result<EligibilityCredential, EligibilityError>;
}

/// Staging mock — always returns adult unless configured otherwise.
#[derive(Debug, Clone)]
pub struct MockAgeProvider {
    pub adult: bool,
    pub ambiguous: bool,
    pub unavailable: bool,
    pub ttl_hours: i64,
}

impl Default for MockAgeProvider {
    fn default() -> Self {
        Self {
            adult: true,
            ambiguous: false,
            unavailable: false,
            ttl_hours: 24,
        }
    }
}

impl AgeAssuranceProvider for MockAgeProvider {
    fn evaluate(&self, now: DateTime<Utc>) -> Result<EligibilityCredential, EligibilityError> {
        if self.unavailable {
            return Err(EligibilityError::ProviderUnavailable);
        }
        if self.ambiguous {
            return Err(EligibilityError::Ambiguous);
        }
        if !self.adult {
            return Err(EligibilityError::Ineligible);
        }
        Ok(EligibilityCredential {
            adult: true,
            age_band: Some("18+".into()),
            issued_at: now,
            expires_at: now + Duration::hours(self.ttl_hours),
            provider: "mock".into(),
            appeal_allowed: true,
        })
    }
}

pub fn assert_discovery_allowed(
    cred: &EligibilityCredential,
    now: DateTime<Utc>,
) -> Result<(), EligibilityError> {
    if !cred.adult {
        return Err(EligibilityError::Ineligible);
    }
    if now > cred.expires_at {
        return Err(EligibilityError::Expired);
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn mock_adult_may_enter_discovery() {
        let p = MockAgeProvider::default();
        let now = Utc::now();
        let c = p.evaluate(now).unwrap();
        assert!(assert_discovery_allowed(&c, now).is_ok());
    }

    #[test]
    fn underage_fails_closed() {
        let p = MockAgeProvider {
            adult: false,
            ..Default::default()
        };
        assert_eq!(p.evaluate(Utc::now()), Err(EligibilityError::Ineligible));
    }

    #[test]
    fn ambiguous_fails_closed() {
        let p = MockAgeProvider {
            ambiguous: true,
            ..Default::default()
        };
        assert_eq!(p.evaluate(Utc::now()), Err(EligibilityError::Ambiguous));
    }

    #[test]
    fn expired_blocks_discovery() {
        let now = Utc::now();
        let c = EligibilityCredential {
            adult: true,
            age_band: Some("18+".into()),
            issued_at: now - Duration::hours(48),
            expires_at: now - Duration::hours(1),
            provider: "mock".into(),
            appeal_allowed: true,
        };
        assert_eq!(
            assert_discovery_allowed(&c, now),
            Err(EligibilityError::Expired)
        );
    }
}
