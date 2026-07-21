//! Safety actions, report bundles, and privacy-preserving abuse controls.

mod anti_abuse;

pub use anti_abuse::*;

use dating_protocol::limits::MAX_REPORT_EVIDENCE_HASHES;
use serde::{Deserialize, Serialize};
use thiserror::Error;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum BlockAction {
    Block,
    Unblock,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ReportBundle {
    pub reporter_profile_id: [u8; 32],
    pub reported_profile_id: [u8; 32],
    pub issued_at: i64,
    pub category: String,
    pub evidence_hashes: Vec<[u8; 32]>,
}

#[derive(Debug, Error, PartialEq, Eq)]
pub enum SafetyError {
    #[error("too many evidence hashes")]
    TooManyEvidenceHashes,
    #[error("evidence hash required")]
    MissingEvidence,
}

impl ReportBundle {
    pub fn new(
        reporter_profile_id: [u8; 32],
        reported_profile_id: [u8; 32],
        issued_at: i64,
        category: impl Into<String>,
        evidence_hashes: Vec<[u8; 32]>,
    ) -> Result<Self, SafetyError> {
        if evidence_hashes.is_empty() {
            return Err(SafetyError::MissingEvidence);
        }
        if evidence_hashes.len() > MAX_REPORT_EVIDENCE_HASHES {
            return Err(SafetyError::TooManyEvidenceHashes);
        }
        Ok(Self {
            reporter_profile_id,
            reported_profile_id,
            issued_at,
            category: category.into(),
            evidence_hashes,
        })
    }
}

/// Returns a redacted summary safe for logs (no content, hashes only as counts).
pub fn report_summary_for_logs(bundle: &ReportBundle) -> String {
    format!(
        "report category={} evidence_count={}",
        bundle.category,
        bundle.evidence_hashes.len()
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn report_bundle_requires_hashes() {
        let err = ReportBundle::new([1; 32], [2; 32], 1, "spam", vec![]);
        assert_eq!(err, Err(SafetyError::MissingEvidence));
    }

    #[test]
    fn log_summary_has_no_raw_hashes() {
        let bundle =
            ReportBundle::new([1; 32], [2; 32], 1, "harassment", vec![[0xAB; 32]]).unwrap();
        let summary = report_summary_for_logs(&bundle);
        assert!(summary.contains("evidence_count=1"));
        assert!(!summary.contains("ab"));
    }
}
