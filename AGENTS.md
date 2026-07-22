# Agent instructions — JavaScript rapid R&D

## Read first

1. `MISSION.md`
2. `docs/architecture/adr-0014-javascript-rnd-reset.md`
3. `docs/architecture/adr-0015-local-persistence-boundary.md`
4. `docs/architecture/adr-0016-intent-driven-discovery.md`
5. `docs/architecture/adr-0017-reciprocal-match-conversations.md`
6. `docs/specs/current-objective.md`
7. `docs/governance/release-gates.md`
8. `policies/community-rules.md`

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
6. Never represent a mock, fixture, simulator, schema, UI control, storage adapter, or JavaScript wrapper as operational hardware, encryption, billing, age assurance, authentication, delivery, verification, or safety capability.

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

## Reciprocal match and conversation rule

The current lifecycle is governed by ADR-0017 and is synthetic/session-only.

Agents must:

- keep unilateral interest pending;
- require an explicit reciprocal fixture before creating a synthetic match;
- never describe fixture reciprocity as authentication, identity proof, a signed match receipt, or another person's real action;
- preserve the selected visible starter tag as the opening context;
- require that context for the first local message before enabling free-form chat;
- permit undo only for pass or pending unilateral interest;
- require explicit unmatch for an established match;
- stop sending immediately after unmatch or block;
- purge visible messages and starter context on block;
- suppress blocked and ended matches from rediscovery;
- keep decisions, pending interests, reciprocal flags, matches, messages, transcripts, unmatch/block history, and the Matches tab out of AsyncStorage;
- keep matching, messaging, unmatch, block, and safety controls free of purchase/subscription effects;
- never use message content for candidate ranking, advertising, marketplace pricing, or general bot profiling.

Agents must not claim E2EE, network delivery, push, read receipts, screenshot blocking, ephemeral-media guarantees, moderation operations, or cross-device block propagation until the corresponding implementation and human gates exist.

## Local persistence rule

The current AsyncStorage-backed R&D store is unencrypted and governed by ADR-0015.

Agents may persist only:

- display name;
- short about text;
- optional pronouns;
- synthetic cosmetic ownership and selected cosmetic;
- the last approved non-sensitive R&D tab;
- haptic-feedback preference.

The Matches tab is not an approved persisted tab because it can reveal relationship activity.

Agents must not add date of birth, adult status, adult credentials, intent, relational openness, boundaries, discovery weights/history, orientation/discovery preferences, questionnaire answers, decisions, likes, pending interests, reciprocal flags, matches, starter tags, messages, transcripts, unmatch/block history, reports, evidence, location, proximity observations, encounter/device identifiers, keys, secrets, payments, or payouts to unencrypted storage.

Any expansion of the persisted field allowlist requires privacy and security review, updated tests, data-map changes, release-gate changes, and a superseding or amended ADR.

## Red-zone boundaries

Adult assurance, real matching, E2EE messaging, BLE, location, cryptographic identity, encrypted local custody, platform attestation, payments, creator payouts, intimate/safety evidence, production infrastructure, app-store submission, legal reporting, and real users require explicit human approval.

## Prohibited shortcuts

- real user data, secrets, identity documents, intimate media, or safety evidence;
- minors in any dating or sexual-intent flow;
- gender-asymmetric disclosure defaults;
- unilateral matching;
- automatic messages or location sharing on match;
- hidden exact-location defaults;
- discriminatory or proxy ranking;
- private exclusion, pass, unmatch, or block-reason disclosure;
- purchase-weighted dating reach, matching, messaging, or safety access;
- sensitive fields in unencrypted local storage;
- disabling tests or production blockers;
- fabricated legal, security, privacy, Trust & Safety, financial, or executive approval.
