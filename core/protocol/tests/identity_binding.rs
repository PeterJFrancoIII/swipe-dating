use dating_crypto::{hash_blake3, SigningKeypair};
use dating_protocol::{
    block_signing_payload, like_signing_payload, match_receipt_signing_payload,
    profile_signing_payload, validate_block_record, validate_like_envelope, validate_match_receipt,
    validate_profile_capsule, AgeBand, BlockRecord, LikeEnvelope, MatchReceipt, ProfileCapsule,
    PROTOCOL_VERSION,
};
use dating_test_support::{FakeRng, TestClock};

const NOW: i64 = 1_700_000_000;

fn keypair(seed: u64) -> SigningKeypair {
    let mut rng = FakeRng::new(seed);
    SigningKeypair::generate(&mut rng)
}

fn sign_like(like: &mut LikeEnvelope, signer: &SigningKeypair) {
    like.signature = signer.sign(&like_signing_payload(like)).0;
}

fn sign_match(receipt: &mut MatchReceipt, signer_a: &SigningKeypair, signer_b: &SigningKeypair) {
    receipt.signature_a = signer_a
        .sign(&match_receipt_signing_payload(receipt, true))
        .0;
    receipt.signature_b = signer_b
        .sign(&match_receipt_signing_payload(receipt, false))
        .0;
}

fn sign_block(block: &mut BlockRecord, signer: &SigningKeypair) {
    block.signature = signer.sign(&block_signing_payload(block)).0;
}

#[test]
fn valid_identity_bound_objects_are_accepted() {
    let signer_a = keypair(101);
    let signer_b = keypair(102);
    let profile_a = hash_blake3(&signer_a.public_key_bytes());
    let profile_b = hash_blake3(&signer_b.public_key_bytes());
    let clock = TestClock::new(NOW);

    let mut like = LikeEnvelope {
        protocol_version: PROTOCOL_VERSION,
        sender_profile_id: profile_a,
        recipient_profile_id: profile_b,
        sender_profile_version: 1,
        issued_at: NOW,
        expires_at: NOW + 60,
        anti_replay_id: [1; 16],
        intro_text: Some("hello".to_string()),
        signature: [0; 64],
        signer_public_key: signer_a.public_key_bytes(),
    };
    sign_like(&mut like, &signer_a);
    validate_like_envelope(&like, &clock).unwrap();

    let mut receipt = MatchReceipt {
        protocol_version: PROTOCOL_VERSION,
        profile_a,
        profile_b,
        matched_at: NOW,
        nonce: [2; 16],
        signature_a: [0; 64],
        signature_b: [0; 64],
        public_key_a: signer_a.public_key_bytes(),
        public_key_b: signer_b.public_key_bytes(),
    };
    sign_match(&mut receipt, &signer_a, &signer_b);
    validate_match_receipt(&receipt).unwrap();

    let mut block = BlockRecord {
        protocol_version: PROTOCOL_VERSION,
        blocker_profile_id: profile_a,
        blocked_profile_id: profile_b,
        issued_at: NOW,
        signature: [0; 64],
        signer_public_key: signer_a.public_key_bytes(),
    };
    sign_block(&mut block, &signer_a);
    validate_block_record(&block).unwrap();

    let mut capsule = ProfileCapsule {
        protocol_version: PROTOCOL_VERSION,
        profile_id: profile_a,
        profile_version: 1,
        issued_at: NOW,
        expires_at: NOW + 60,
        display_name: "Alex".to_string(),
        age_band: AgeBand::TwentyFiveToThirtyFour,
        about_text: "Local-first".to_string(),
        media_manifest: vec![],
        root_public_key: signer_a.public_key_bytes(),
        signature: [0; 64],
        signer_public_key: signer_a.public_key_bytes(),
    };
    capsule.signature = signer_a.sign(&profile_signing_payload(&capsule)).0;
    validate_profile_capsule(&capsule, &clock).unwrap();
}

#[test]
fn like_rejects_sender_profile_not_owned_by_signer() {
    let signer = keypair(201);
    let mut like = LikeEnvelope {
        protocol_version: PROTOCOL_VERSION,
        sender_profile_id: [0xA1; 32],
        recipient_profile_id: [0xB2; 32],
        sender_profile_version: 1,
        issued_at: NOW,
        expires_at: NOW + 60,
        anti_replay_id: [3; 16],
        intro_text: None,
        signature: [0; 64],
        signer_public_key: signer.public_key_bytes(),
    };
    sign_like(&mut like, &signer);

    assert!(validate_like_envelope(&like, &TestClock::new(NOW)).is_err());
}

#[test]
fn match_rejects_party_profile_not_owned_by_signer() {
    let signer_a = keypair(301);
    let signer_b = keypair(302);
    let mut receipt = MatchReceipt {
        protocol_version: PROTOCOL_VERSION,
        profile_a: [0xA3; 32],
        profile_b: hash_blake3(&signer_b.public_key_bytes()),
        matched_at: NOW,
        nonce: [4; 16],
        signature_a: [0; 64],
        signature_b: [0; 64],
        public_key_a: signer_a.public_key_bytes(),
        public_key_b: signer_b.public_key_bytes(),
    };
    sign_match(&mut receipt, &signer_a, &signer_b);

    assert!(validate_match_receipt(&receipt).is_err());
}

#[test]
fn match_rejects_same_profile_on_both_sides() {
    let signer = keypair(401);
    let profile_id = hash_blake3(&signer.public_key_bytes());
    let mut receipt = MatchReceipt {
        protocol_version: PROTOCOL_VERSION,
        profile_a: profile_id,
        profile_b: profile_id,
        matched_at: NOW,
        nonce: [5; 16],
        signature_a: [0; 64],
        signature_b: [0; 64],
        public_key_a: signer.public_key_bytes(),
        public_key_b: signer.public_key_bytes(),
    };
    sign_match(&mut receipt, &signer, &signer);

    assert!(validate_match_receipt(&receipt).is_err());
}

#[test]
fn block_rejects_blocker_profile_not_owned_by_signer() {
    let signer = keypair(501);
    let mut block = BlockRecord {
        protocol_version: PROTOCOL_VERSION,
        blocker_profile_id: [0xA5; 32],
        blocked_profile_id: [0xB5; 32],
        issued_at: NOW,
        signature: [0; 64],
        signer_public_key: signer.public_key_bytes(),
    };
    sign_block(&mut block, &signer);

    assert!(validate_block_record(&block).is_err());
}

#[test]
fn profile_rejects_signer_not_bound_to_claimed_root() {
    let root = keypair(601);
    let attacker = keypair(602);
    let mut capsule = ProfileCapsule {
        protocol_version: PROTOCOL_VERSION,
        profile_id: hash_blake3(&root.public_key_bytes()),
        profile_version: 1,
        issued_at: NOW,
        expires_at: NOW + 60,
        display_name: "Forged".to_string(),
        age_band: AgeBand::TwentyFiveToThirtyFour,
        about_text: "attacker-signed".to_string(),
        media_manifest: vec![],
        root_public_key: root.public_key_bytes(),
        signature: [0; 64],
        signer_public_key: attacker.public_key_bytes(),
    };
    capsule.signature = attacker.sign(&profile_signing_payload(&capsule)).0;

    assert!(validate_profile_capsule(&capsule, &TestClock::new(NOW)).is_err());
}
