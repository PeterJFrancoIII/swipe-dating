//! Privacy-preserving telemetry filtering.

use serde_json::{Map, Value};

const REDACTED: &str = "[REDACTED]";

const SENSITIVE_PATTERNS: &[&str] = &[
    "profile", "message", "location", "secret", "token", "password", "email", "phone",
];

/// Exact keys that must never appear in telemetry (case-insensitive).
const EXACT_SENSITIVE_KEYS: &[&str] = &[
    "latitude",
    "longitude",
    "lat",
    "lon",
    "lng",
    "exact_location",
    "precise_location",
    "message_body",
    "body",
    "plaintext",
    "ciphertext",
];

/// Redacts keys matching sensitive patterns from a JSON value.
pub struct PrivacyFilter;

impl PrivacyFilter {
    pub fn redact_value(value: &Value) -> Value {
        match value {
            Value::Object(map) => Value::Object(Self::redact_map(map)),
            Value::Array(arr) => Value::Array(arr.iter().map(Self::redact_value).collect()),
            other => other.clone(),
        }
    }

    fn redact_map(map: &Map<String, Value>) -> Map<String, Value> {
        let mut out = Map::new();
        for (key, val) in map {
            if Self::is_sensitive_key(key) {
                out.insert(key.clone(), Value::String(REDACTED.to_string()));
            } else {
                out.insert(key.clone(), Self::redact_value(val));
            }
        }
        out
    }

    pub fn is_sensitive_key(key: &str) -> bool {
        let lower = key.to_ascii_lowercase();
        EXACT_SENSITIVE_KEYS.iter().any(|exact| lower == *exact)
            || SENSITIVE_PATTERNS
                .iter()
                .any(|pattern| lower.contains(pattern))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn redacts_sensitive_keys() {
        let input = json!({
            "event": "discovery",
            "profile_name": "secret user",
            "message_body": "hello",
            "region_token": "coarse-1",
            "latency_ms": 42
        });
        let out = PrivacyFilter::redact_value(&input);
        assert_eq!(out["profile_name"], REDACTED);
        assert_eq!(out["message_body"], REDACTED);
        assert_eq!(out["latency_ms"], 42);
    }

    #[test]
    fn redacts_exact_lat_lon_keys() {
        let input = json!({
            "lat": 37.7749,
            "lon": -122.4194,
            "latitude": 37.77,
            "longitude": -122.41,
            "region": "us-west-coarse"
        });
        let out = PrivacyFilter::redact_value(&input);
        assert_eq!(out["lat"], REDACTED);
        assert_eq!(out["lon"], REDACTED);
        assert_eq!(out["latitude"], REDACTED);
        assert_eq!(out["longitude"], REDACTED);
        assert_eq!(out["region"], "us-west-coarse");
    }

    #[test]
    fn redacts_message_body_exact_key() {
        assert!(PrivacyFilter::is_sensitive_key("message_body"));
        assert!(PrivacyFilter::is_sensitive_key("body"));
        let input = json!({ "body": "plaintext chat", "event": "send" });
        let out = PrivacyFilter::redact_value(&input);
        assert_eq!(out["body"], REDACTED);
        assert_eq!(out["event"], "send");
    }
}
