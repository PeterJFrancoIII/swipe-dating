//! SQLite-backed local store with application-level AES-256-GCM encryption.

use crate::crypto::{decrypt_record, encrypt_record};
use crate::key_provider::KeyProvider;
use crate::{AppSettings, LocalStore, MemoryStore, StorageError};
use dating_identity::RootIdentity;
use dating_protocol::{BlockRecord, MatchReceipt, ProfileCapsule};
use rusqlite::{params, Connection};
use std::path::Path;
use std::sync::Arc;
use thiserror::Error;

const STATE_KEY: &str = "app_state_v1";

#[derive(Debug, Error)]
pub enum SqliteStoreError {
    #[error("sqlite error: {0}")]
    Sqlite(#[from] rusqlite::Error),
    #[error("crypto error: {0}")]
    Crypto(#[from] crate::crypto::CryptoError),
    #[error("serialization error: {0}")]
    Serde(#[from] serde_json::Error),
    #[error("key provider error: {0}")]
    KeyProvider(#[from] crate::key_provider::KeyProviderError),
    #[error("storage error: {0}")]
    Storage(#[from] StorageError),
}

/// SQLite store encrypting the full application state as a single AES-GCM blob.
pub struct SqliteEncryptedStore {
    inner: MemoryStore,
    conn: Connection,
    key_provider: Arc<dyn KeyProvider>,
}

impl SqliteEncryptedStore {
    pub fn open<P: AsRef<Path>>(
        path: P,
        key_provider: Arc<dyn KeyProvider>,
    ) -> Result<Self, SqliteStoreError> {
        let conn = Connection::open(path)?;
        conn.execute_batch(
            "CREATE TABLE IF NOT EXISTS encrypted_kv (
                key TEXT PRIMARY KEY NOT NULL,
                ciphertext BLOB NOT NULL
            );",
        )?;

        let mut memory = MemoryStore::default();
        if let Some(blob) = Self::load_blob(&conn, STATE_KEY)? {
            let key = key_provider.storage_key()?;
            let plain = decrypt_record(&key, &blob)?;
            memory = MemoryStore::from_snapshot(&plain)?;
        }

        Ok(Self {
            inner: memory,
            conn,
            key_provider,
        })
    }

    pub fn open_in_memory(key_provider: Arc<dyn KeyProvider>) -> Result<Self, SqliteStoreError> {
        Self::open(":memory:", key_provider)
    }

    fn load_blob(conn: &Connection, key: &str) -> Result<Option<Vec<u8>>, SqliteStoreError> {
        let mut stmt = conn.prepare("SELECT ciphertext FROM encrypted_kv WHERE key = ?1")?;
        let mut rows = stmt.query(params![key])?;
        if let Some(row) = rows.next()? {
            let blob: Vec<u8> = row.get(0)?;
            Ok(Some(blob))
        } else {
            Ok(None)
        }
    }

    fn persist(&mut self) -> Result<(), SqliteStoreError> {
        let key = self.key_provider.storage_key()?;
        let plain = self.inner.to_snapshot_bytes()?;
        let blob = encrypt_record(&key, &plain)?;
        self.conn.execute(
            "INSERT INTO encrypted_kv (key, ciphertext) VALUES (?1, ?2)
             ON CONFLICT(key) DO UPDATE SET ciphertext = excluded.ciphertext",
            params![STATE_KEY, blob],
        )?;
        Ok(())
    }

    fn persist_after<R>(&mut self, result: R) -> Result<R, SqliteStoreError> {
        self.persist()?;
        Ok(result)
    }
}

impl LocalStore for SqliteEncryptedStore {
    fn put_identity_root(&mut self, identity: RootIdentity) -> Result<(), StorageError> {
        self.inner.put_identity_root(identity)?;
        self.persist_after(()).map_err(|_| StorageError::NotFound)
    }

    fn identity_root(&self) -> Option<&RootIdentity> {
        self.inner.identity_root()
    }

    fn put_profile_version(&mut self, capsule: ProfileCapsule) -> Result<(), StorageError> {
        self.inner.put_profile_version(capsule)?;
        self.persist_after(()).map_err(|_| StorageError::NotFound)
    }

    fn profile_version(&self, profile_id: &[u8; 32], version: u32) -> Option<&ProfileCapsule> {
        self.inner.profile_version(profile_id, version)
    }

    fn mark_profile_seen(&mut self, profile_id: [u8; 32]) {
        self.inner.mark_profile_seen(profile_id);
        let _ = self.persist();
    }

    fn is_profile_seen(&self, profile_id: &[u8; 32]) -> bool {
        self.inner.is_profile_seen(profile_id)
    }

    fn record_outgoing_like(&mut self, profile_id: [u8; 32]) {
        self.inner.record_outgoing_like(profile_id);
        let _ = self.persist();
    }

    fn outgoing_likes(&self) -> &[[u8; 32]] {
        self.inner.outgoing_likes()
    }

    fn store_match_receipt(&mut self, receipt: MatchReceipt) {
        self.inner.store_match_receipt(receipt);
        let _ = self.persist();
    }

    fn match_receipts(&self) -> &[MatchReceipt] {
        self.inner.match_receipts()
    }

    fn append_message(&mut self, match_id: [u8; 32], ciphertext: Vec<u8>) {
        self.inner.append_message(match_id, ciphertext);
        let _ = self.persist();
    }

    fn messages_for(&self, match_id: &[u8; 32]) -> &[Vec<u8>] {
        self.inner.messages_for(match_id)
    }

    fn store_block(&mut self, block: BlockRecord) {
        self.inner.store_block(block);
        let _ = self.persist();
    }

    fn blocks(&self) -> &[BlockRecord] {
        self.inner.blocks()
    }

    fn settings(&self) -> &AppSettings {
        self.inner.settings()
    }

    fn settings_mut(&mut self) -> &mut AppSettings {
        self.inner.settings_mut()
    }
}

impl SqliteEncryptedStore {
    /// Persists pending settings mutations.
    pub fn flush(&mut self) -> Result<(), SqliteStoreError> {
        self.persist()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::key_provider::SoftwareKeyProvider;
    use std::sync::Arc;

    #[test]
    fn sqlite_encrypted_persists_across_reopen() {
        let dir = std::env::temp_dir().join(format!("dating-store-test-{}", std::process::id()));
        let _ = std::fs::create_dir_all(&dir);
        let db_path = dir.join("store.db");
        let _ = std::fs::remove_file(&db_path);

        let provider = Arc::new(SoftwareKeyProvider::from_seed([0xAB; 32]));
        {
            let mut store = SqliteEncryptedStore::open(&db_path, provider.clone()).unwrap();
            store.record_outgoing_like([3; 32]);
            store.flush().unwrap();
        }
        {
            let store = SqliteEncryptedStore::open(&db_path, provider).unwrap();
            assert_eq!(store.outgoing_likes().len(), 1);
        }
        let _ = std::fs::remove_dir_all(dir);
    }
}
