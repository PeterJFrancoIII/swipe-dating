//! Privacy-preserving telemetry filtering.

use serde_json::{Map, Value};

const REDACTED: &str = "[REDACTED]";

const SENSITIVE_PATTERNS: &[&str] = &[
    "profile", "message", "location", "secret", "token", "password", "email", "phone",
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

    fn is_sensitive_key(key: &str) -> bool {
        let lower = key.to_ascii_lowercase();
        SENSITIVE_PATTERNS
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
}
