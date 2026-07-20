//! Export golden vectors to `schemas/test-vectors/`.

use dating_crypto::{hash_blake3, SigningKeypair};
use dating_protocol::{
    encode_cbor, presence_signing_payload, validate_presence_lease, PresenceLease, PROTOCOL_VERSION,
};
use dating_test_support::{FakeRng, TestClock};
use std::fs;
use std::path::PathBuf;

#[test]
fn write_presence_lease_golden_vector() {
    let mut rng = FakeRng::new(99);
    let kp = SigningKeypair::generate(&mut rng);
    let issued_at = 1_700_000_000_i64;
    let expires_at = issued_at + 60;
    let rendezvous_id = hash_blake3(b"rendezvous-golden");
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

    let clock = TestClock::new(issued_at + 30);
    validate_presence_lease(&lease, &clock).unwrap();

    let encoded = encode_cbor(&lease).unwrap();
    let json = serde_json::json!({
        "name": "presence_lease_v1",
        "description": "Valid presence lease golden vector for protocol version 1",
        "protocol_version": PROTOCOL_VERSION,
        "cbor_hex": hex::encode(&encoded),
        "signer_public_key_hex": hex::encode(kp.public_key_bytes()),
        "fields": {
            "coarse_region": "us-west-coarse",
            "ttl_seconds": 60
        }
    });

    let mut path = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    path.push("../../schemas/test-vectors/presence-lease-v1.json");
    fs::write(&path, serde_json::to_string_pretty(&json).unwrap()).unwrap();
}
