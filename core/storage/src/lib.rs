//! In-memory local storage trait and implementation.

mod crypto;
mod key_provider;
mod sqlite_encrypted;

pub use crypto::{decrypt_record, encrypt_record, CryptoError};
pub use key_provider::{
    InsecureDevKeyProvider, KeyProvider, KeyProviderError, SoftwareKeyProvider, StorageKey,
    STORAGE_KEY_LEN,
};
pub use sqlite_encrypted::{SqliteEncryptedStore, SqliteStoreError};

use dating_identity::RootIdentity;
use dating_protocol::{BlockRecord, MatchReceipt, ProfileCapsule};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use thiserror::Error;

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct AppSettings {
    pub discovery_enabled: bool,
    pub relay_only: bool,
}

#[derive(Debug, Error)]
pub enum StorageError {
    #[error("not found")]
    NotFound,
    #[error("already exists")]
    AlreadyExists,
}

pub trait LocalStore {
    fn put_identity_root(&mut self, identity: RootIdentity) -> Result<(), StorageError>;
    fn identity_root(&self) -> Option<&RootIdentity>;

    fn put_profile_version(&mut self, capsule: ProfileCapsule) -> Result<(), StorageError>;
    fn profile_version(&self, profile_id: &[u8; 32], version: u32) -> Option<&ProfileCapsule>;
    fn mark_profile_seen(&mut self, profile_id: [u8; 32]);
    fn is_profile_seen(&self, profile_id: &[u8; 32]) -> bool;

    fn record_outgoing_like(&mut self, profile_id: [u8; 32]);
    fn outgoing_likes(&self) -> &[[u8; 32]];

    fn store_match_receipt(&mut self, receipt: MatchReceipt);
    fn match_receipts(&self) -> &[MatchReceipt];

    fn append_message(&mut self, match_id: [u8; 32], ciphertext: Vec<u8>);
    fn messages_for(&self, match_id: &[u8; 32]) -> &[Vec<u8>];

    fn store_block(&mut self, block: BlockRecord);
    fn blocks(&self) -> &[BlockRecord];

    fn settings(&self) -> &AppSettings;
    fn settings_mut(&mut self) -> &mut AppSettings;
}

#[derive(Debug, Default, Serialize, Deserialize)]
struct MemoryStoreSnapshot {
    identity_root: Option<RootIdentity>,
    profile_versions: Vec<(([u8; 32], u32), ProfileCapsule)>,
    seen_profiles: Vec<[u8; 32]>,
    outgoing_likes: Vec<[u8; 32]>,
    match_receipts: Vec<MatchReceipt>,
    messages: Vec<([u8; 32], Vec<Vec<u8>>)>,
    blocks: Vec<BlockRecord>,
    settings: AppSettings,
}

#[derive(Debug, Default)]
pub struct MemoryStore {
    identity_root: Option<RootIdentity>,
    profile_versions: HashMap<([u8; 32], u32), ProfileCapsule>,
    seen_profiles: Vec<[u8; 32]>,
    outgoing_likes: Vec<[u8; 32]>,
    match_receipts: Vec<MatchReceipt>,
    messages: HashMap<[u8; 32], Vec<Vec<u8>>>,
    blocks: Vec<BlockRecord>,
    settings: AppSettings,
}

impl MemoryStore {
    pub(crate) fn to_snapshot_bytes(&self) -> Result<Vec<u8>, serde_json::Error> {
        let snapshot = MemoryStoreSnapshot {
            identity_root: self.identity_root.as_ref().and_then(clone_identity),
            profile_versions: self
                .profile_versions
                .iter()
                .map(|(k, v)| (*k, v.clone()))
                .collect(),
            seen_profiles: self.seen_profiles.clone(),
            outgoing_likes: self.outgoing_likes.clone(),
            match_receipts: self.match_receipts.clone(),
            messages: self.messages.iter().map(|(k, v)| (*k, v.clone())).collect(),
            blocks: self.blocks.clone(),
            settings: self.settings.clone(),
        };
        serde_json::to_vec(&snapshot)
    }

    pub(crate) fn from_snapshot(bytes: &[u8]) -> Result<Self, serde_json::Error> {
        let snapshot: MemoryStoreSnapshot = serde_json::from_slice(bytes)?;
        Ok(Self {
            identity_root: snapshot.identity_root,
            profile_versions: snapshot.profile_versions.into_iter().collect(),
            seen_profiles: snapshot.seen_profiles,
            outgoing_likes: snapshot.outgoing_likes,
            match_receipts: snapshot.match_receipts,
            messages: snapshot.messages.into_iter().collect(),
            blocks: snapshot.blocks,
            settings: snapshot.settings,
        })
    }
}

fn clone_identity(id: &RootIdentity) -> Option<RootIdentity> {
    let value = serde_json::to_value(id).ok()?;
    serde_json::from_value(value).ok()
}

impl LocalStore for MemoryStore {
    fn put_identity_root(&mut self, identity: RootIdentity) -> Result<(), StorageError> {
        if self.identity_root.is_some() {
            return Err(StorageError::AlreadyExists);
        }
        self.identity_root = Some(identity);
        Ok(())
    }

    fn identity_root(&self) -> Option<&RootIdentity> {
        self.identity_root.as_ref()
    }

    fn put_profile_version(&mut self, capsule: ProfileCapsule) -> Result<(), StorageError> {
        let key = (capsule.profile_id, capsule.profile_version);
        self.profile_versions.insert(key, capsule);
        Ok(())
    }

    fn profile_version(&self, profile_id: &[u8; 32], version: u32) -> Option<&ProfileCapsule> {
        self.profile_versions.get(&(*profile_id, version))
    }

    fn mark_profile_seen(&mut self, profile_id: [u8; 32]) {
        if !self.seen_profiles.contains(&profile_id) {
            self.seen_profiles.push(profile_id);
        }
    }

    fn is_profile_seen(&self, profile_id: &[u8; 32]) -> bool {
        self.seen_profiles.contains(profile_id)
    }

    fn record_outgoing_like(&mut self, profile_id: [u8; 32]) {
        if !self.outgoing_likes.contains(&profile_id) {
            self.outgoing_likes.push(profile_id);
        }
    }

    fn outgoing_likes(&self) -> &[[u8; 32]] {
        &self.outgoing_likes
    }

    fn store_match_receipt(&mut self, receipt: MatchReceipt) {
        self.match_receipts.push(receipt);
    }

    fn match_receipts(&self) -> &[MatchReceipt] {
        &self.match_receipts
    }

    fn append_message(&mut self, match_id: [u8; 32], ciphertext: Vec<u8>) {
        self.messages.entry(match_id).or_default().push(ciphertext);
    }

    fn messages_for(&self, match_id: &[u8; 32]) -> &[Vec<u8>] {
        self.messages
            .get(match_id)
            .map(|v| v.as_slice())
            .unwrap_or(&[])
    }

    fn store_block(&mut self, block: BlockRecord) {
        self.blocks.push(block);
    }

    fn blocks(&self) -> &[BlockRecord] {
        &self.blocks
    }

    fn settings(&self) -> &AppSettings {
        &self.settings
    }

    fn settings_mut(&mut self) -> &mut AppSettings {
        &mut self.settings
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use dating_test_support::FakeRng;

    #[test]
    fn memory_store_roundtrip() {
        let mut store = MemoryStore::default();
        let mut rng = FakeRng::new(1);
        let identity = RootIdentity::generate(&mut rng);
        store.put_identity_root(identity).unwrap();
        assert!(store.identity_root().is_some());
        store.record_outgoing_like([9; 32]);
        assert_eq!(store.outgoing_likes().len(), 1);
    }

    #[test]
    fn snapshot_roundtrip() {
        let mut store = MemoryStore::default();
        store.record_outgoing_like([4; 32]);
        let bytes = store.to_snapshot_bytes().unwrap();
        let restored = MemoryStore::from_snapshot(&bytes).unwrap();
        assert_eq!(restored.outgoing_likes().len(), 1);
    }
}
