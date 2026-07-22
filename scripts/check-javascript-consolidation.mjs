import { existsSync, readFileSync } from "node:fs";

const currentArchitectureFiles = [
  "README.md",
  "MISSION.md",
  "AGENTS.md",
  "CODEOWNERS",
  "docs/architecture/system-overview.md",
  "docs/governance/README.md",
  "docs/governance/release-gates.md",
  "docs/product/closed-beta-readiness.md",
  "docs/specs/current-objective.md",
];

const prohibitedText = [
  "scripts/production_preflight.sh",
  "make production-preflight",
  "Frozen legacy cryptography",
  "Frozen legacy native",
  "Frozen legacy prototype",
  "Existing native and Rust files are frozen historical reference",
  "Legacy native/Rust prototype archived or explicitly retained",
  "Legacy Rust/Swift/Kotlin code is archived or removed",
  "remains in the repository only as frozen historical reference",
];

const requiredText = [
  ["README.md", "former Rust, Swift, Kotlin, UniFFI, Terraform, Make, and shell implementation has been removed"],
  ["MISSION.md", "Repository implementation and build automation are JavaScript-only"],
  ["AGENTS.md", "Do not add Rust, Swift, Kotlin"],
  ["docs/architecture/system-overview.md", "removed under ADR-0019"],
  ["docs/governance/release-gates.md", "npm run production:preflight"],
  ["docs/product/closed-beta-readiness.md", "Repository-wide checkout and Git-tree JavaScript-only audits pass"],
  ["docs/specs/current-objective.md", "agent/javascript-only-refactor"],
];

const failures = [];
for (const path of currentArchitectureFiles) {
  if (!existsSync(path)) {
    failures.push(`${path}: missing current architecture file`);
    continue;
  }
  const text = readFileSync(path, "utf8");
  for (const prohibited of prohibitedText) {
    if (text.includes(prohibited)) failures.push(`${path}: stale reference ${JSON.stringify(prohibited)}`);
  }
}

for (const [path, expected] of requiredText) {
  if (!existsSync(path) || !readFileSync(path, "utf8").includes(expected)) {
    failures.push(`${path}: missing consolidation contract ${JSON.stringify(expected)}`);
  }
}

if (failures.length > 0) {
  console.error("JavaScript consolidation validation failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`JavaScript consolidation contracts OK across ${currentArchitectureFiles.length} current architecture file(s).`);
