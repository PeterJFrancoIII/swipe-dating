# Agent instructions — JavaScript rapid R&D

## Read first

1. `MISSION.md`
2. `docs/architecture/adr-0014-javascript-rnd-reset.md`
3. `docs/specs/current-objective.md`
4. `docs/governance/release-gates.md`
5. `policies/community-rules.md`

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
6. Never represent a mock, simulator, schema, UI control, or JavaScript adapter as an operational hardware, encryption, billing, age-assurance, or safety capability.

## Red-zone boundaries

Adult assurance, BLE, location, cryptographic identity, platform attestation, payments, creator payouts, intimate/safety evidence, production infrastructure, app-store submission, legal reporting, and real users require explicit human approval.

## Prohibited shortcuts

- real user data, secrets, identity documents, intimate media, or safety evidence;
- minors in any dating or sexual-intent flow;
- gender-asymmetric disclosure defaults;
- unilateral matching;
- hidden exact-location defaults;
- purchase-weighted dating reach;
- disabling tests or production blockers;
- fabricated legal, security, privacy, Trust & Safety, financial, or executive approval.
