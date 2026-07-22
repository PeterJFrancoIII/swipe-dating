export const LOCAL_STATE_KEY = "@swipe/rnd/local-state";
export const LOCAL_STATE_SCHEMA_VERSION = 2;

const ALLOWED_TABS = new Set(["Discover", "My Profile", "Preferences", "Skin Shop", "Matched Map"]);

export function createDefaultLocalState() {
  return {
    profile: {
      displayName: "",
      about: "",
      pronouns: "",
    },
    cosmetics: {
      ownedSkinIds: [],
      selectedSkinId: null,
    },
    ui: {
      hapticsEnabled: true,
      lastTab: "Discover",
    },
  };
}

export function sanitizeLocalState(input) {
  const source = isPlainObject(input) ? input : {};
  const profile = isPlainObject(source.profile) ? source.profile : {};
  const cosmetics = isPlainObject(source.cosmetics) ? source.cosmetics : {};
  const ui = isPlainObject(source.ui) ? source.ui : {};

  const ownedSkinIds = uniqueStrings(cosmetics.ownedSkinIds, 50, 80);
  const selectedSkinId = cleanString(cosmetics.selectedSkinId, 80) || null;

  return {
    profile: {
      displayName: cleanString(profile.displayName, 64),
      about: cleanString(profile.about, 500),
      pronouns: cleanString(profile.pronouns, 40),
    },
    cosmetics: {
      ownedSkinIds,
      selectedSkinId: selectedSkinId && ownedSkinIds.includes(selectedSkinId) ? selectedSkinId : null,
    },
    ui: {
      hapticsEnabled: typeof ui.hapticsEnabled === "boolean" ? ui.hapticsEnabled : true,
      lastTab: ALLOWED_TABS.has(ui.lastTab) ? ui.lastTab : "Discover",
    },
  };
}

export function migrateLocalState(raw) {
  if (!isPlainObject(raw)) {
    return { state: createDefaultLocalState(), migratedFrom: null, recovered: true, reason: "invalid_shape" };
  }

  if (raw.schemaVersion === LOCAL_STATE_SCHEMA_VERSION) {
    return {
      state: sanitizeLocalState(raw),
      migratedFrom: null,
      recovered: false,
      reason: null,
    };
  }

  if (raw.schemaVersion === 1) {
    return {
      state: sanitizeLocalState({
        profile: {
          displayName: raw.profileName,
          about: raw.bio,
          pronouns: raw.pronouns,
        },
        cosmetics: {
          ownedSkinIds: raw.ownedSkins,
          selectedSkinId: raw.selectedSkin,
        },
        ui: {
          hapticsEnabled: raw.hapticsEnabled,
          lastTab: raw.lastTab,
        },
      }),
      migratedFrom: 1,
      recovered: false,
      reason: null,
    };
  }

  return {
    state: createDefaultLocalState(),
    migratedFrom: raw.schemaVersion ?? null,
    recovered: true,
    reason: "unsupported_schema",
  };
}

export function serializeLocalState(state, now = Date.now()) {
  const sanitized = sanitizeLocalState(state);
  return JSON.stringify({
    schemaVersion: LOCAL_STATE_SCHEMA_VERSION,
    savedAt: new Date(now).toISOString(),
    ...sanitized,
  });
}

export function deserializeLocalState(text) {
  if (typeof text !== "string" || text.length === 0) {
    return {
      state: createDefaultLocalState(),
      savedAt: null,
      migratedFrom: null,
      recovered: false,
      reason: null,
    };
  }

  try {
    const raw = JSON.parse(text);
    const migrated = migrateLocalState(raw);
    return {
      ...migrated,
      savedAt: typeof raw.savedAt === "string" ? raw.savedAt : null,
    };
  } catch {
    return {
      state: createDefaultLocalState(),
      savedAt: null,
      migratedFrom: null,
      recovered: true,
      reason: "invalid_json",
    };
  }
}

export function createLocalStateRepository(adapter, options = {}) {
  assertAdapter(adapter);
  const key = options.key ?? LOCAL_STATE_KEY;

  return {
    async load() {
      return deserializeLocalState(await adapter.getItem(key));
    },

    async save(state, now = Date.now()) {
      const text = serializeLocalState(state, now);
      await adapter.setItem(key, text);
      return deserializeLocalState(text);
    },

    async clear() {
      await adapter.removeItem(key);
      return createDefaultLocalState();
    },

    async exportText() {
      const current = await adapter.getItem(key);
      return current ?? serializeLocalState(createDefaultLocalState());
    },
  };
}

function assertAdapter(adapter) {
  for (const method of ["getItem", "setItem", "removeItem"]) {
    if (!adapter || typeof adapter[method] !== "function") {
      throw new TypeError(`Storage adapter requires ${method}()`);
    }
  }
}

function cleanString(value, maxLength) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function uniqueStrings(value, maxItems, maxLength) {
  if (!Array.isArray(value)) return [];
  const result = [];
  for (const entry of value) {
    const cleaned = cleanString(entry, maxLength);
    if (cleaned && !result.includes(cleaned)) result.push(cleaned);
    if (result.length >= maxItems) break;
  }
  return result;
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
