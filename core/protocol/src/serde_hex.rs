//! Hex encoding helpers for serde (arrays larger than serde's default limit).

use serde::{Deserialize, Deserializer, Serializer};

pub fn serialize_64<S>(bytes: &[u8; 64], serializer: S) -> Result<S::Ok, S::Error>
where
    S: Serializer,
{
    serializer.serialize_str(&hex::encode(bytes))
}

pub fn deserialize_64<'de, D>(deserializer: D) -> Result<[u8; 64], D::Error>
where
    D: Deserializer<'de>,
{
    let s = String::deserialize(deserializer)?;
    let raw = hex::decode(s).map_err(serde::de::Error::custom)?;
    raw.try_into()
        .map_err(|_| serde::de::Error::custom("expected 64 bytes"))
}

pub mod hex_64 {
    pub use super::{deserialize_64 as deserialize, serialize_64 as serialize};
}
