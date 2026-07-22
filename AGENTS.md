# Agent instructions — JavaScript rapid R&D

## Read first

1. `MISSION.md`
2. `docs/architecture/adr-0014-javascript-rnd-reset.md`
3. `docs/architecture/adr-0015-local-persistence-boundary.md`
4. `docs/architecture/adr-0016-intent-driven-discovery.md`
5. `docs/architecture/adr-0017-reciprocal-match-conversations.md`
6. `docs/architecture/adr-0018-deepen-connection.md`
7. `docs/architecture/adr-0019-javascript-only-consolidation.md`
8. `docs/specs/current-objective.md`
9. `docs/governance/release-gates.md`
10. `policies/community-rules.md`

## Repository language rule

All project-authored application, service, domain, simulation, test, validation, and release-tooling behavior belongs in JavaScript under:

- `apps/rnd-*`
- `packages/rnd-*`
- `scripts/*.mjs`

Do not add Rust, Swift, Kotlin, Objective-C, Java, C/C++, Python, Dart, TypeScript, Terraform, shell, or another implementation language. The former cross-language implementation has been removed; historical code is available through Git history and must not be copied back into the active tree.

A non-JavaScript exception requires a superseding ADR, named owners, measured evidence that a maintained JavaScript-facing dependency cannot satisfy the capability, narrowly scoped files, and explicit human architecture approval.

Generated native output from Expo development builds is disposable and must not be committed as a second source of truth. Third-party native code beneath reviewed JavaScript dependencies does not authorize project-authored native product logic.

## Required implementation loop

1. State the hypothesis and affected privacy/safety invariants.
2. Implement the smallest pure-JavaScript domain slice first.
3. Add deterministic tests before UI or network adapters.
4. Run:

```bash
npm install --ignore-scripts
npm run check
npm run mobile:export:web
node scripts/check-governance-contracts.mjs
node scripts/verify-production-block.mjs
```

5. Update the relevant ADR/spec when a trust boundary changes.
6. Never represent a mock, fixture, simulator, schema, UI control, storage adapter, or JavaScript wrapper as operational hardware, encryption, billing, age assurance, authentication, delivery, verification, or safety capability.

## JavaScript validation rule

Agents must keep both language controls green:

- `check-active-javascript-surface.mjs` must dynamically discover every `apps/rnd-*` and `packages/rnd-*` workspace;
- `check-javascript-only-repository.mjs` must reject prohibited source extensions, build manifests, shell tooling, and deleted legacy roots;
- the GitHub tree audit must independently reject committed violations;
- validators must never return to hard-coded package lists;
- validation scripts and production preflight must remain JavaScript.

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

## Deepen Connection rule

The current relationship-phase lifecycle is governed by ADR-0018 and is synthetic/session-only.

Agents must:

- keep every new match casual by default;
- require two explicit participant opt-ins before setting a match to `deepened`;
- keep a one-sided request pending and permit withdrawal before acceptance;
- allow decline without collecting, retaining, or exposing a reason;
- allow either participant to return a deepened match to casual;
- unlock only the allowlisted deeper prompts after mutual acceptance;
- bound answers to 300 characters and keep them private to the local session;
- clear all deeper answers when returning to casual, unmatching, or blocking;
- reject transitions after a match phase has ended;
- keep phase state, requests, responses, timestamps, prompt answers, and transition history out of AsyncStorage;
- keep phase state and answers out of ranking, advertising, marketplace pricing, bot profiling, creator access, and public profiles;
- describe simulated counterpart requests and responses only as synthetic fixtures.

Agents must not infer or auto-activate relationship phase from message content, reply speed, message count, elapsed time, sexual activity, a meetup, location, purchases, or behavioral/AI models. Deepen Connection must not be represented as consent to sex, exclusivity, media, location, an offline meeting, health disclosure, or public relationship status.

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

Agents must not add date of birth, adult status, adult credentials, intent, relational openness, boundaries, discovery weights/history, orientation/discovery preferences, questionnaire answers, decisions, likes, pending interests, reciprocal flags, matches, starter tags, messages, transcripts, relationship phases, deepen requests/responses, deeper prompt answers, transition history, unmatch/block history, reports, evidence, location, proximity observations, encounter/device identifiers, keys, secrets, payments, or payouts to unencrypted storage.

Any expansion of the persisted field allowlist requires privacy and security review, updated tests, data-map changes, release-gate changes, and a superseding or amended ADR.

## Red-zone boundaries

Adult assurance, real matching, bilateral relationship transitions, E2EE messaging, BLE, location, cryptographic identity, encrypted local custody, platform attestation, payments, creator payouts, intimate/safety evidence, production infrastructure, app-store submission, legal reporting, and real users require explicit human approval.

## Prohibited shortcuts

- real user data, secrets, identity documents, intimate media, or safety evidence;
- minors in any dating or sexual-intent flow;
- gender-asymmetric disclosure defaults;
- unilateral matching or unilateral relationship-phase activation;
- automatic messages, phase changes, or location sharing;
- hidden exact-location defaults;
- discriminatory or proxy ranking;
- private exclusion, decline, pass, unmatch, or block-reason disclosure;
- purchase-weighted dating reach, matching, messaging, phase access, or safety access;
- sensitive fields in unencrypted local storage;
- non-JavaScript implementation or build automation without the ADR-0019 exception process;
- committed generated native projects;
- disabling tests, language audits, governance checks, or production blockers;
- fabricated legal, security, privacy, Trust & Safety, financial, or executive approval.
