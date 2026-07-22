# Current objective — intent-driven discovery R&D slice

**Status:** ACTIVE  
**Branch:** `agent/intent-driven-discovery`  
**Real users:** Prohibited

## Objective

Build a synthetic JavaScript discovery experience that separates immediate intent from relational openness, enforces mutual compatibility and hard boundaries before ranking, gives users transparent control over ranking weights, and progressively reveals profile visuals only after a non-visual interaction.

The product hypothesis is derived from the user-provided strategic research on casual-first, relationship-capable matchmaking. The research is treated as design input, not independently verified evidence.

## Deliverables

- shared `@swipe/rnd-discovery` JavaScript package;
- immediate-intent and relational-openness vocabularies;
- mutual eligibility checks on both axes;
- self-reported boundary tags and hard boundary exclusions;
- transparent ranking dimensions for intent, boundaries, lifestyle, alignment, and distance;
- user-adjustable weights normalized to 100;
- deterministic candidate ordering and score explanations;
- prohibited-input rejection for protected, inferred, popularity, purchase, spending, subscription, and creator-status fields;
- bio-first synthetic profile reveal after reading or inspecting non-visual content;
- profile-tag context required before synthetic interest is recorded;
- session-only discovery state with no expansion of the AsyncStorage allowlist;
- mobile integration, tests, ADR, privacy map, release gates, beta checklist, mission, ownership, and CI updates.

## Acceptance commands

```bash
nvm use
npm install --ignore-scripts
npm run check
npm run mobile:export:web
```

## Required outcomes

- incompatible immediate intent fails closed before ranking;
- incompatible relational openness fails closed before ranking;
- a missing required boundary hard-excludes the profile;
- eligible profiles receive a 0–100 explainable score;
- user weights always normalize to exactly 100;
- distance-heavy and compatibility-heavy weights can deterministically change ordering;
- a right-swipe action alone does not reveal the synthetic visual;
- reading the bio, inspecting tags, or viewing the explanation can advance reveal;
- an interest action requires selecting a visible shared-ground tag;
- protected, inferred, popularity, purchase, spending, subscription, and creator-status fields cause ranking rejection;
- another person never receives a private exclusion reason;
- intent, boundary, ranking-weight, reveal, and discovery-history state remain absent from AsyncStorage;
- Expo web export remains green;
- production preflight remains blocked.

## Explicitly deferred

- encrypted persistence of real intent and boundary data;
- real profiles, user photos, or secure progressive-media delivery;
- production candidate retrieval or server-side ranking;
- health-status verification or medical claims;
- real conversation delivery;
- BLE scanning/advertising and background behavior;
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
