//! Protocol object validation from CBOR bytes.

use dating_protocol::{
    decode_cbor, validate_presence_lease, validate_profile_capsule, PresenceLease, ProfileCapsule,
    ProtocolError, ValidationError,
};
use dating_test_support::TestClock;

#[derive(Debug, Clone, Copy, PartialEq, Eq, thiserror::Error, uniffi::Error)]
pub enum ValidationErrorCode {
    #[error("unsupported protocol version")]
    UnsupportedVersion,
    #[error("field too long")]
    FieldTooLong,
    #[error("field count exceeded")]
    CountExceeded,
    #[error("expired")]
    Expired,
    #[error("ttl exceeds maximum")]
    TtlTooLong,
    #[error("invalid coarse region")]
    InvalidCoarseRegion,
    #[error("missing or invalid signature")]
    InvalidSignature,
    #[error("object too large")]
    ObjectTooLarge,
    #[error("decode failed")]
    DecodeFailed,
}

impl From<ValidationError> for ValidationErrorCode {
    fn from(value: ValidationError) -> Self {
        match value {
            ValidationError::UnsupportedVersion => Self::UnsupportedVersion,
            ValidationError::FieldTooLong(_) => Self::FieldTooLong,
            ValidationError::CountExceeded(_) => Self::CountExceeded,
            ValidationError::Expired => Self::Expired,
            ValidationError::TtlTooLong => Self::TtlTooLong,
            ValidationError::InvalidCoarseRegion => Self::InvalidCoarseRegion,
            ValidationError::InvalidSignature => Self::InvalidSignature,
            ValidationError::ObjectTooLarge => Self::ObjectTooLarge,
        }
    }
}

fn map_protocol_error(err: ProtocolError) -> ValidationErrorCode {
    match err {
        ProtocolError::Validation(v) => v.into(),
        ProtocolError::Encode(_) | ProtocolError::Decode(_) => ValidationErrorCode::DecodeFailed,
    }
}

/// Validate a CBOR-encoded presence lease against `now_unix`.
#[uniffi::export]
pub fn validate_presence_lease_bytes(
    bytes: Vec<u8>,
    now_unix: i64,
) -> Result<(), ValidationErrorCode> {
    let lease: PresenceLease = decode_cbor(&bytes).map_err(map_protocol_error)?;
    let clock = TestClock::new(now_unix);
    validate_presence_lease(&lease, &clock).map_err(Into::into)
}

/// Validate a CBOR-encoded profile capsule against `now_unix`.
#[uniffi::export]
pub fn validate_profile_capsule_bytes(
    bytes: Vec<u8>,
    now_unix: i64,
) -> Result<(), ValidationErrorCode> {
    let capsule: ProfileCapsule = decode_cbor(&bytes).map_err(map_protocol_error)?;
    let clock = TestClock::new(now_unix);
    validate_profile_capsule(&capsule, &clock).map_err(Into::into)
}
