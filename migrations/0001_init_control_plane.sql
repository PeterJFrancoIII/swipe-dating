-- Control-plane durable schema (PostgreSQL).
-- PRESENCE / SIGNALING: ephemeral only — stored in Valkey/Redis with TTL leases.
--   Do NOT add presence tables here; see ADR-0006.
-- NO profile bodies, message plaintext, or photo blobs in this database.

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Device public keys for rendezvous authentication (pseudonymous device identity).
CREATE TABLE IF NOT EXISTS device_public_keys (
    device_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    public_key_ed25519 BYTEA NOT NULL CHECK (octet_length(public_key_ed25519) = 32),
    key_fingerprint   TEXT NOT NULL UNIQUE,
    registered_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    revoked_at        TIMESTAMPTZ,
    CONSTRAINT device_keys_not_revoked_future CHECK (revoked_at IS NULL OR revoked_at >= registered_at)
);

CREATE INDEX IF NOT EXISTS idx_device_public_keys_active
    ON device_public_keys (registered_at DESC)
    WHERE revoked_at IS NULL;

-- Feature flags (internal configuration; no user PII).
CREATE TABLE IF NOT EXISTS feature_flags (
    flag_key    TEXT PRIMARY KEY,
    enabled     BOOLEAN NOT NULL DEFAULT false,
    payload     JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Pseudonymous block tokens (hashed; no plaintext user identifiers).
CREATE TABLE IF NOT EXISTS block_tokens (
    blocker_token_hash  BYTEA NOT NULL,
    blocked_token_hash  BYTEA NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at          TIMESTAMPTZ,
    PRIMARY KEY (blocker_token_hash, blocked_token_hash)
);

CREATE INDEX IF NOT EXISTS idx_block_tokens_blocker
    ON block_tokens (blocker_token_hash, created_at DESC);

-- Safety case index metadata only — evidence blobs live in isolated vault (S3).
-- No report narrative or media stored here.
CREATE TABLE IF NOT EXISTS safety_cases (
    case_id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_token_hash BYTEA NOT NULL,
    subject_token_hash  BYTEA,
    category          TEXT NOT NULL,
    status            TEXT NOT NULL DEFAULT 'open'
                      CHECK (status IN ('open', 'triaged', 'escalated', 'closed')),
    evidence_ref      TEXT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_safety_cases_status
    ON safety_cases (status, created_at DESC);

-- Push notification token hashes (never store raw APNs/FCM tokens).
CREATE TABLE IF NOT EXISTS push_token_hashes (
    device_id           UUID NOT NULL REFERENCES device_public_keys(device_id),
    platform            TEXT NOT NULL CHECK (platform IN ('apns', 'fcm')),
    token_hash          BYTEA NOT NULL,
    registered_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_seen_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (device_id, platform, token_hash)
);

COMMENT ON TABLE device_public_keys IS 'Durable device key registry; no profile content.';
COMMENT ON TABLE feature_flags IS 'Operator feature toggles; internal only.';
COMMENT ON TABLE block_tokens IS 'Pseudonymous block graph; hashes only.';
COMMENT ON TABLE safety_cases IS 'Safety case index; evidence in vault; no message bodies.';
COMMENT ON TABLE push_token_hashes IS 'Hashed push tokens; raw tokens must not be stored.';

COMMIT;
