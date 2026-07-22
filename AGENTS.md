# Agent instructions — JavaScript rapid R&D

## Read first

1. `MISSION.md`
2. `docs/architecture/adr-0014-javascript-rnd-reset.md`
3. `docs/architecture/adr-0015-local-persistence-boundary.md`
4. `docs/architecture/adr-0016-intent-driven-discovery.md`
5. `docs/specs/current-objective.md`
6. `docs/governance/release-gates.md`
7. `policies/community-rules.md`

## Active implementation rule

All new R&D application and service behavior belongs in JavaScript under:

- `apps/rnd-*`
- `packages/rnd-*`
- `scripts/*.mjs`

Do not add new active Rust, Swift, Kotlin, Objective-C, Java, Python, Dart, or TypeScript feature code. Existing native and Rust files are frozen historical reference until a dedicated archival/removal change is approved.

## Required implementation loop

1. State the hypothesis and affected privacy/safety invariants.
2. Implement the smallest pure-JavaScript domain slice first.
3. Add deterministic tests before UI or network adapters.
4. Run:

```bash
npm install --ignore-scripts
npm run check
npm run mobile:export:web
```

5. Update the relevant ADR/spec when a trust boundary changes.
6. Never represent a mock, simulator, schema, UI control, storage adapter, or JavaScript wrapper as an operational hardware, encryption, billing, age-assurance, verification, or safety capability.

## Intent-driven discovery rule

The current discovery engine is governed by ADR-0016 and is synthetic/session-only.

Agents must:

- keep immediate intent separate from relational openness;
- require mutual acceptance on both axes before scoring;
- treat user-required boundaries as hard exclusions;
- normalize user-controlled ranking weights and expose score explanations;
- keep intent, boundaries, weights, reveal state, starter tags, and discovery history out of AsyncStorage;
- reject race, ethnicity, skin color, disability, height, inferred attractiveness, intelligence, hygiene, sexuality, gender, fitness, grooming, body hair, popularity, purchases, spending, subscription, and creator-status ranking inputs;
- keep private exclusion reasons private;
- provide non-gesture and accessible reveal paths;
- label self-reported boundaries accurately and never imply medical verification.

Agents must not add artificial matching delays, fabricated labor, fake scarcity, hidden score multipliers, pay-to-rank behavior, or misleading compatibility claims.

## Local persistence rule

The current AsyncStorage-backed R&D store is unencrypted and governed by ADR-0015.

Agents may persist only:

- display name;
- short about text;
- optional pronouns;
- synthetic cosmetic ownership and selected cosmetic;
- last visible R&D tab;
- haptic-feedback preference.

Agents must not add date of birth, adult status, adult credentials, intent, relational openness, boundaries, discovery weights/history, orientation/discovery preferences, questionnaire answers, likes, matches, messages, blocks, reports, evidence, location, proximity observations, encounter/device identifiers, keys, secrets, payments, or payouts to unencrypted storage.

Any expansion of the persisted field allowlist requires privacy and security review, updated tests, data-map changes, release-gate changes, and a superseding or amended ADR.

## Red-zone boundaries

Adult assurance, BLE, location, cryptographic identity, encrypted local custody, platform attestation, payments, creator payouts, intimate/safety evidence, production infrastructure, app-store submission, legal reporting, and real users require explicit human approval.

## Prohibited shortcuts

- real user data, secrets, identity documents, intimate media, or safety evidence;
- minors in any dating or sexual-intent flow;
- gender-asymmetric disclosure defaults;
- unilateral matching;
- hidden exact-location defaults;
- discriminatory or proxy ranking;
- private exclusion-reason disclosure;
- purchase-weighted dating reach;
- sensitive fields in unencrypted local storage;
- disabling tests or production blockers;
- fabricated legal, security, privacy, Trust & Safety, financial, or executive approval.
