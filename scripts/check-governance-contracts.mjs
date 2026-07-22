import { existsSync, readFileSync } from "node:fs";

const contentContracts = [
  ["README.md", "entirely JavaScript rapid-R&D monorepo"],
  ["README.md", "former Rust, Swift, Kotlin, UniFFI, Terraform, Make, and shell implementation has been removed"],
  ["MISSION.md", "entirely **JavaScript**"],
  ["MISSION.md", "Repository implementation and build automation are JavaScript-only"],
  ["MISSION.md", "Adults 18+ only"],
  ["MISSION.md", "privacy defaults are identical for every gender"],
  ["AGENTS.md", "Do not add Rust, Swift, Kotlin"],
  ["docs/architecture/adr-0019-javascript-only-consolidation.md", "one project-authored implementation language: JavaScript"],
  ["docs/architecture/system-overview.md", "removed under ADR-0019"],
  ["docs/governance/release-gates.md", "npm run production:preflight"],
  ["docs/governance/release-gates.md", "AsyncStorage persistence must not be described as encryption"],
  ["docs/privacy/data-map.md", "Explicitly excluded from AsyncStorage because sensitive"],
  ["docs/governance/release-gates.md", "Intent-driven discovery gates"],
  ["docs/privacy/data-map.md", "Candidate ranking must not use race"],
  ["docs/architecture/adr-0016-intent-driven-discovery.md", "must not fabricate matching effort"],
  ["docs/governance/release-gates.md", "Reciprocal match and conversation gates"],
  ["docs/architecture/adr-0017-reciprocal-match-conversations.md", "One-sided interest never creates a match"],
  ["docs/privacy/data-map.md", "R&D message transcript"],
  ["AGENTS.md", "The Matches tab is not an approved persisted tab"],
  ["docs/governance/release-gates.md", "Deepen Connection gates"],
  ["docs/architecture/adr-0018-deepen-connection.md", "both sides explicitly opt in"],
  ["docs/privacy/data-map.md", "R&D deeper prompt answers"],
  ["AGENTS.md", "must not infer or auto-activate relationship phase"],
  ["docs/product/closed-beta-readiness.md", "Repository-wide checkout and Git-tree JavaScript-only audits pass"],
  ["docs/specs/current-objective.md", "agent/javascript-only-refactor"],
];

const requiredFiles = [
  "apps/rnd-mobile/src/App.js",
  "apps/rnd-mobile/src/IntentDiscoveryView.js",
  "apps/rnd-mobile/src/ConversationsView.js",
  "apps/rnd-mobile/src/DeepenConnectionPanel.js",
  "apps/rnd-mobile/src/local-storage.js",
  "packages/rnd-domain/src/index.js",
  "packages/rnd-discovery/src/index.js",
  "packages/rnd-discovery/test/discovery.test.js",
  "packages/rnd-conversations/src/index.js",
  "packages/rnd-conversations/test/conversations.test.js",
  "packages/rnd-relationship-phases/src/index.js",
  "packages/rnd-relationship-phases/test/relationship-phases.test.js",
  "packages/rnd-storage/src/index.js",
  "packages/rnd-storage/test/storage.test.js",
  "scripts/check-active-javascript-surface.mjs",
  "scripts/check-javascript-consolidation.mjs",
  "scripts/check-javascript-only-repository.mjs",
  "scripts/check-javascript-syntax.mjs",
  "scripts/check-governance-contracts.mjs",
  "scripts/run-tests.mjs",
  "scripts/production-preflight.mjs",
  "scripts/verify-production-block.mjs",
  "docs/architecture/adr-0014-javascript-rnd-reset.md",
  "docs/architecture/adr-0015-local-persistence-boundary.md",
  "docs/architecture/adr-0016-intent-driven-discovery.md",
  "docs/architecture/adr-0017-reciprocal-match-conversations.md",
  "docs/architecture/adr-0018-deepen-connection.md",
  "docs/architecture/adr-0019-javascript-only-consolidation.md",
  "docs/product/intent-driven-discovery.md",
  "docs/product/reciprocal-match-conversations.md",
  "docs/product/deepen-connection.md",
];

const failures = [];
for (const [path, expected] of contentContracts) {
  if (!existsSync(path)) {
    failures.push(`${path}: missing file`);
    continue;
  }
  if (!readFileSync(path, "utf8").includes(expected)) {
    failures.push(`${path}: missing required text ${JSON.stringify(expected)}`);
  }
}

for (const path of requiredFiles) {
  if (!existsSync(path)) failures.push(`${path}: required file missing`);
}

if (failures.length > 0) {
  console.error("Governance contract validation failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Governance contracts OK: ${contentContracts.length} text contract(s), ${requiredFiles.length} required file(s).`);
