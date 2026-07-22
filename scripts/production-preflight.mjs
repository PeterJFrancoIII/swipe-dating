import { existsSync, readdirSync } from "node:fs";
import { basename, join } from "node:path";

const approvalsDirectory = join(process.cwd(), "approvals");
const requiredRoles = [
  "legal",
  "privacy",
  "security",
  "trust-safety",
  "executive",
  "mobile",
  "infra",
];

console.log("=== production-preflight (validation only) ===");

if (!existsSync(approvalsDirectory)) {
  console.error(`ERROR: approvals directory missing: ${approvalsDirectory}`);
  process.exit(1);
}

const artifacts = readdirSync(approvalsDirectory, { withFileTypes: true })
  .filter((entry) => entry.isFile() && !entry.name.startsWith(".") && entry.name !== "README.md")
  .map((entry) => entry.name);

let found = 0;
let missing = 0;

for (const role of requiredRoles) {
  const match = artifacts.find((artifact) => artifact.startsWith(role));
  if (match) {
    found += 1;
    console.log(`OK approval: ${basename(match)}`);
  } else {
    missing += 1;
    console.log(`MISSING approval: ${role}*`);
  }
}

if (found === 0) {
  block(`No signed approval artifacts in ${approvalsDirectory}/.\nSee approvals/README.md for required roles and freshness.`);
}

if (missing > 0) {
  block(`${missing} approval role(s) still missing.`);
}

console.log("All required approval prefixes present — human must still verify authenticity.");

function block(message) {
  console.log("");
  console.log("PRODUCTION_BLOCKED_HUMAN_APPROVALS_REQUIRED");
  console.log(message);
  process.exit(1);
}
