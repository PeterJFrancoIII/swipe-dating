import assert from "node:assert/strict";
import test from "node:test";

import {
  LOCAL_STATE_SCHEMA_VERSION,
  createDefaultLocalState,
  createLocalStateRepository,
  deserializeLocalState,
  sanitizeLocalState,
  serializeLocalState,
} from "../src/index.js";

function createMemoryAdapter(initial = null) {
  let value = initial;
  return {
    async getItem() {
      return value;
    },
    async setItem(_key, next) {
      value = next;
    },
    async removeItem() {
      value = null;
    },
    inspect() {
      return value;
    },
  };
}

test("default state contains only approved non-sensitive R&D fields", () => {
  assert.deepEqual(createDefaultLocalState(), {
    profile: { displayName: "", about: "", pronouns: "" },
    cosmetics: { ownedSkinIds: [], selectedSkinId: null },
    ui: { hapticsEnabled: true, lastTab: "Discover" },
  });
});

test("sanitization truncates strings, rejects unowned skins, and never persists Matches as the last tab", () => {
  const sanitized = sanitizeLocalState({
    profile: {
      displayName: `  ${"x".repeat(100)}  `,
      about: " about ",
      pronouns: " they/them ",
    },
    cosmetics: {
      ownedSkinIds: ["neon-orbit", "neon-orbit", ""],
      selectedSkinId: "not-owned",
    },
    ui: {
      hapticsEnabled: false,
      lastTab: "Matches",
    },
  });

  assert.equal(sanitized.profile.displayName.length, 64);
  assert.equal(sanitized.profile.about, "about");
  assert.equal(sanitized.profile.pronouns, "they/them");
  assert.deepEqual(sanitized.cosmetics.ownedSkinIds, ["neon-orbit"]);
  assert.equal(sanitized.cosmetics.selectedSkinId, null);
  assert.deepEqual(sanitized.ui, { hapticsEnabled: false, lastTab: "Discover" });
});

test("serialization excludes sensitive session, discovery, match, and conversation fields", () => {
  const text = serializeLocalState({
    profile: { displayName: "Riley", about: "Builder", pronouns: "they/them" },
    cosmetics: { ownedSkinIds: ["neon-orbit"], selectedSkinId: "neon-orbit" },
    ui: { hapticsEnabled: true, lastTab: "My Profile" },
    activeTab: "Matches",
    birthDate: "2000-01-01",
    adultAccepted: true,
    answers: { politics: "private" },
    selectedIntents: ["casual_sex"],
    selectedGenders: ["women"],
    immediateIntent: "casual_dating",
    relationalOpenness: "open_to_more",
    requiredBoundaries: ["condoms_required"],
    discoveryWeights: { intent: 50, distance: 50 },
    revealStages: { p1: "photo_revealed" },
    dismissedProfileIds: ["p2"],
    selectedConversationStarter: "hiking",
    conversationState: {
      decisions: [{ candidateId: "p1", kind: "interest" }],
      matches: { "match:p1": { messages: [{ body: "private" }] } },
      blockedCandidateIds: ["p3"],
    },
    matches: ["match:p1"],
    messages: ["private"],
    blockedCandidateIds: ["p3"],
    locationChoice: "live_15_minutes",
    encounterIds: ["secret"],
  }, Date.UTC(2026, 6, 22));

  const raw = JSON.parse(text);
  assert.equal(raw.schemaVersion, LOCAL_STATE_SCHEMA_VERSION);
  assert.equal(raw.profile.displayName, "Riley");
  for (const forbidden of [
    "activeTab",
    "birthDate",
    "adultAccepted",
    "answers",
    "selectedIntents",
    "selectedGenders",
    "immediateIntent",
    "relationalOpenness",
    "requiredBoundaries",
    "discoveryWeights",
    "revealStages",
    "dismissedProfileIds",
    "selectedConversationStarter",
    "conversationState",
    "matches",
    "messages",
    "blockedCandidateIds",
    "locationChoice",
    "encounterIds",
  ]) {
    assert.equal(Object.hasOwn(raw, forbidden), false, `${forbidden} must not persist`);
  }
});

test("version one records migrate to the current schema", () => {
  const migrated = deserializeLocalState(JSON.stringify({
    schemaVersion: 1,
    profileName: "Sam",
    bio: "Hello",
    pronouns: "she/her",
    ownedSkins: ["neon-orbit"],
    selectedSkin: "neon-orbit",
    hapticsEnabled: false,
    lastTab: "Skin Shop",
  }));

  assert.equal(migrated.migratedFrom, 1);
  assert.equal(migrated.recovered, false);
  assert.equal(migrated.state.profile.displayName, "Sam");
  assert.equal(migrated.state.cosmetics.selectedSkinId, "neon-orbit");
  assert.equal(migrated.state.ui.lastTab, "Skin Shop");
});

test("invalid JSON recovers to a safe default", () => {
  const result = deserializeLocalState("{broken");
  assert.equal(result.recovered, true);
  assert.equal(result.reason, "invalid_json");
  assert.deepEqual(result.state, createDefaultLocalState());
});

test("repository saves, loads, exports, and clears through an adapter", async () => {
  const adapter = createMemoryAdapter();
  const repository = createLocalStateRepository(adapter);

  const saved = await repository.save({
    profile: { displayName: "Avery", about: "Local only", pronouns: "" },
    cosmetics: { ownedSkinIds: ["neon-orbit"], selectedSkinId: "neon-orbit" },
    ui: { hapticsEnabled: true, lastTab: "My Profile" },
  }, Date.UTC(2026, 6, 22));

  assert.equal(saved.state.profile.displayName, "Avery");
  assert.match(adapter.inspect(), /"schemaVersion":2/);

  const loaded = await repository.load();
  assert.equal(loaded.state.cosmetics.selectedSkinId, "neon-orbit");
  assert.equal(await repository.exportText(), adapter.inspect());

  await repository.clear();
  assert.equal(adapter.inspect(), null);
  assert.deepEqual((await repository.load()).state, createDefaultLocalState());
});
