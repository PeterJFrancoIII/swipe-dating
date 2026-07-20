//! CBOR decode fuzz smoke — mutates valid payloads without panicking.

use dating_crypto::{hash_blake3, SigningKeypair};
use dating_protocol::{
    decode_cbor, encode_cbor, presence_signing_payload, validate_presence_lease, PresenceLease,
    PROTOCOL_VERSION,
};
use dating_test_support::{FakeRng, TestClock};

fn sample_presence_lease() -> (Vec<u8>, i64) {
    let mut rng = FakeRng::new(99);
    let kp = SigningKeypair::generate(&mut rng);
    let issued_at = 1_700_000_000_i64;
    let expires_at = issued_at + 60;
    let rendezvous_id = hash_blake3(b"rendezvous-fuzz");
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
    let clock_now = issued_at + 30;
    (encode_cbor(&lease).unwrap(), clock_now)
}

fn mutate_byte(bytes: &mut [u8], seed: u32) {
    if bytes.is_empty() {
        return;
    }
    let idx = (seed as usize) % bytes.len();
    bytes[idx] ^= ((seed >> 8) as u8).wrapping_add(1);
}

#[test]
fn cbor_mutation_smoke_1000_iterations() {
    let (encoded, clock_now) = sample_presence_lease();
    let clock = TestClock::new(clock_now);

    for seed in 0..1000 {
        let mut trial = encoded.clone();
        mutate_byte(&mut trial, seed);

        let decode_result: Result<PresenceLease, _> = decode_cbor(&trial);
        match decode_result {
            Ok(lease) => {
                let _ = validate_presence_lease(&lease, &clock);
            }
            Err(_) => {
                // Malformed CBOR is expected for most mutations.
            }
        }
    }
}

#[test]
#[ignore = "long-run fuzz smoke; invoked via make fuzz-smoke"]
fn cbor_mutation_smoke_extended() {
    let (encoded, clock_now) = sample_presence_lease();
    let clock = TestClock::new(clock_now);

    for seed in 0..10_000 {
        let mut trial = encoded.clone();
        mutate_byte(&mut trial, seed);
        if seed % 3 == 0 {
            trial.truncate(trial.len().saturating_sub(seed as usize % 8));
        }

        let decode_result: Result<PresenceLease, _> = decode_cbor(&trial);
        if let Ok(lease) = decode_result {
            let _ = validate_presence_lease(&lease, &clock);
        }
    }
}
