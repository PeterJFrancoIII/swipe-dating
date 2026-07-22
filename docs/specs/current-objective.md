# Current objective — durable local profile R&D slice

**Status:** ACTIVE  
**Branch:** `agent/local-profile-persistence`  
**Real users:** Prohibited

## Objective

Add durable, versioned local profile presentation and UI settings to the JavaScript Expo app without writing sensitive dating, eligibility, questionnaire, proximity, match, message, or location data to unencrypted storage.

## Deliverables

- shared `@swipe/rnd-storage` JavaScript package;
- versioned allowlist schema and migration path;
- invalid/corrupt record recovery;
- adapter-based load, save, clear, and redacted export operations;
- Expo AsyncStorage adapter using the SDK-supported package;
- persistent display name, about text, pronouns, mock cosmetics, last tab, and haptic preference;
- session-only adult gate, intents, gender-feed selections, questionnaire answers, proximity state, and location choices;
- mobile profile/settings UI with save state, export preview, and reset;
- deterministic tests proving sensitive fields are discarded;
- ADR, data map, release-gate, closed-beta, and system-overview updates.

## Acceptance commands

```bash
nvm use
npm install --ignore-scripts
npm run check
npm run mobile:export:web
```

## Required outcomes

- a valid saved record restores across repository instances;
- schema version 1 migrates to the current schema;
- malformed or unsupported data fails safe to defaults;
- selected cosmetics can only reference locally owned cosmetic IDs;
- date of birth, adult status, intents, discovery preferences, questionnaire answers, location, and encounter IDs are absent from serialized state;
- reset removes the local record;
- Expo web export remains green;
- production preflight remains blocked.

## Explicitly deferred

- encrypted local vault and hardware-backed key custody;
- backup/device transfer and production recovery;
- real profiles or user-generated photos;
- BLE scanning/advertising and background behavior;
- real location collection and E2EE coordinate payloads;
- production age assurance and app/device attestation;
- production E2EE messaging;
- StoreKit / Play Billing and creator operations;
- real reports, safety cases, evidence vault, staging cloud, or production deployment.

## Release state

```text
JAVASCRIPT_RND_SYNTHETIC_ONLY
REAL_USER_CLOSED_BETA_BLOCKED
PRODUCTION_BLOCKED_HUMAN_APPROVALS_REQUIRED
```
