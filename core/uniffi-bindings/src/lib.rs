//! Audited UniFFI boundary for iOS/Android — safe value objects only.
//!
//! Private signing keys and root secret material never cross this FFI surface.

mod age;
mod identity;
mod location;
mod matching;
mod protocol;
mod transport;
mod util;

uniffi::setup_scaffolding!("dating_uniffi_bindings");

/// Helpers for local smoke tooling binaries (not part of the mobile FFI contract).
pub mod tooling {
    use super::identity::{generate_identity, IdentityHandle};
    use std::sync::Arc;

    pub fn generate_tooling_identity() -> Arc<IdentityHandle> {
        generate_identity()
    }

    pub fn build_tooling_presence_lease_json(
        handle: &IdentityHandle,
        region: &str,
        now_unix: i64,
        ttl_secs: u32,
    ) -> Result<String, String> {
        handle
            .build_staging_presence_lease_json(region.to_string(), now_unix, ttl_secs)
            .map_err(|e| e.to_string())
    }
}

/// Canonical protocol version exposed to mobile clients.
#[uniffi::export]
pub fn protocol_version() -> u16 {
    dating_protocol::PROTOCOL_VERSION
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::age::{assert_discovery_allowed, evaluate_mock_age_eligibility, EligibilitySummary};
    use crate::identity::generate_identity;
    use crate::location::coarse_region_from_lat_lon;
    use crate::matching::AuditedMatchStore;
    use crate::protocol::{validate_presence_lease_bytes, validate_profile_capsule_bytes};
    use crate::transport::{ice_transport_requires_relay, FfiIceTransportPolicy};
    use crate::util::staging_profile_id_from_label;
    use chrono::Utc;
    use dating_crypto::{hash_blake3, SigningKeypair};
    use dating_protocol::{
        encode_cbor, presence_signing_payload, profile_signing_payload, AgeBand, MediaManifestRef,
        PresenceLease, ProfileCapsule, PROTOCOL_VERSION,
    };
    use dating_test_support::FakeRng;

    #[test]
    fn protocol_version_matches_core() {
        assert_eq!(protocol_version(), 1);
    }

    #[test]
    fn identity_handle_exposes_public_summary_only() {
        let handle = generate_identity();
        let summary = handle.public_identity_summary();
        assert_eq!(summary.profile_id_hex.len(), 64);
        assert_eq!(summary.root_public_key_hex.len(), 64);
        assert_eq!(handle.profile_id_bytes().len(), 32);
        // Summary hex must match raw bytes.
        assert_eq!(
            summary.profile_id_hex,
            hex::encode(handle.profile_id_bytes())
        );
    }

    #[test]
    fn identity_debug_does_not_leak_secrets() {
        let handle = generate_identity();
        let debug = format!("{handle:?}");
        assert!(!debug.contains("SigningKey"));
        assert!(debug.contains("REDACTED") || debug.contains("IdentityHandle"));
    }

    #[test]
    fn presence_lease_validation_accepts_valid_bytes() {
        let mut rng = FakeRng::new(99);
        let kp = SigningKeypair::generate(&mut rng);
        let issued_at = 1_700_000_000_i64;
        let expires_at = issued_at + 60;
        let rendezvous_id = hash_blake3(b"rendezvous-sample");
        let payload = presence_signing_payload(
            PROTOCOL_VERSION,
            &rendezvous_id,
            0x01,
            "us-west-coarse",
            issued_at,
            expires_at,
            &[0xAB; 16],
        );
        let sig = kp.sign(&payload);
        let lease = PresenceLease {
            protocol_version: PROTOCOL_VERSION,
            rendezvous_id,
            capability_bitmap: 0x01,
            coarse_region: "us-west-coarse".to_string(),
            issued_at,
            expires_at,
            nonce: [0xAB; 16],
            signature: sig.0,
            signer_public_key: kp.public_key_bytes(),
        };
        let bytes = encode_cbor(&lease).unwrap();
        validate_presence_lease_bytes(bytes, 1_700_000_030).unwrap();
    }

    #[test]
    fn profile_capsule_validation_rejects_expired() {
        let mut rng = FakeRng::new(50);
        let kp = SigningKeypair::generate(&mut rng);
        let profile_id = hash_blake3(&kp.public_key_bytes());
        let issued_at = 1_700_000_000_i64;
        let expires_at = issued_at + 86_400;
        let mut capsule = ProfileCapsule {
            protocol_version: PROTOCOL_VERSION,
            profile_id,
            profile_version: 1,
            issued_at,
            expires_at,
            display_name: "Alex".to_string(),
            age_band: AgeBand::TwentyFiveToThirtyFour,
            about_text: "Coffee".to_string(),
            media_manifest: vec![MediaManifestRef {
                media_id: hash_blake3(b"photo-1"),
                mime_type: "image/jpeg".to_string(),
                width: 512,
                height: 720,
            }],
            root_public_key: kp.public_key_bytes(),
            signature: [0u8; 64],
            signer_public_key: kp.public_key_bytes(),
        };
        let payload = profile_signing_payload(&capsule);
        let sig = kp.sign(&payload);
        capsule.signature = sig.0;
        let bytes = encode_cbor(&capsule).unwrap();
        let err = validate_profile_capsule_bytes(bytes, 1_700_100_000).unwrap_err();
        assert!(matches!(err, crate::protocol::ValidationErrorCode::Expired));
    }

    #[test]
    fn match_store_like_block_flow() {
        let store = AuditedMatchStore::new();
        let pid = vec![7u8; 32];
        store.record_like(pid.clone()).unwrap();
        assert_eq!(store.match_state_label(pid.clone()).unwrap(), "liked");

        let block = dating_protocol::BlockRecord {
            protocol_version: PROTOCOL_VERSION,
            blocker_profile_id: [9u8; 32],
            blocked_profile_id: [7u8; 32],
            issued_at: 1,
            signature: [0u8; 64],
            signer_public_key: [0u8; 32],
        };
        let block_bytes = encode_cbor(&block).unwrap();
        store.apply_block(pid.clone(), block_bytes).unwrap();
        assert_eq!(store.match_state_label(pid).unwrap(), "blocked");
        assert!(store.record_like(vec![7u8; 32]).is_err());
    }

    #[test]
    fn mock_age_eligibility_and_discovery_gate() {
        let summary = evaluate_mock_age_eligibility(true, false, false).unwrap();
        let now = Utc::now().timestamp();
        assert_discovery_allowed(summary.clone(), now).unwrap();

        let expired = EligibilitySummary {
            adult: true,
            age_band: Some("18+".into()),
            issued_at_unix: now - 86_400,
            expires_at_unix: now - 60,
            provider: "mock".into(),
            appeal_allowed: true,
        };
        assert!(assert_discovery_allowed(expired, now).is_err());
    }

    #[test]
    fn ice_transport_policy_mapping() {
        assert!(ice_transport_requires_relay(
            FfiIceTransportPolicy::RelayOnly
        ));
        assert!(!ice_transport_requires_relay(
            FfiIceTransportPolicy::AllowDirect
        ));
    }

    #[test]
    fn coarse_region_hides_precise_coords() {
        let region = coarse_region_from_lat_lon(40.7128, -74.0060, 42);
        assert!(!region.cell.contains("40.7128"));
        assert_eq!(region.band_label, "nearby");
    }

    #[test]
    fn dislike_store_records() {
        let store = AuditedMatchStore::new();
        let pid = vec![5u8; 32];
        store.record_dislike(pid.clone()).unwrap();
        assert!(store.is_disliked(pid).unwrap());
    }

    #[test]
    fn staging_match_and_block_helpers() {
        let store = AuditedMatchStore::new();
        let pid = staging_profile_id_from_label("p1".into());
        assert_eq!(pid.len(), 32);
        store.record_like(pid.clone()).unwrap();
        store.confirm_staging_match(pid.clone()).unwrap();
        assert_eq!(store.match_state_label(pid.clone()).unwrap(), "matched");
        store.block_staging(pid.clone()).unwrap();
        assert_eq!(store.match_state_label(pid).unwrap(), "blocked");
    }

    #[test]
    fn staging_presence_lease_json_roundtrip_fields() {
        let handle = generate_identity();
        let now = Utc::now().timestamp();
        let json = handle
            .build_staging_presence_lease_json("us-west-coarse".into(), now, 120)
            .unwrap();
        assert!(json.contains("us-west-coarse"));
        assert!(json.contains("protocol_version"));
        validate_presence_lease_bytes(
            dating_protocol::encode_cbor(
                &serde_json::from_str::<dating_protocol::PresenceLease>(&json).unwrap(),
            )
            .unwrap(),
            now + 1,
        )
        .unwrap();
    }
}
