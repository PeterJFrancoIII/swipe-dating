import { spawnSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const options = new Set(process.argv.slice(2));
const coverageEnabled = options.has("--coverage");

const testFiles = discoverWorkspaceRoots()
  .flatMap((root) => walk(root))
  .filter((path) => path.endsWith(".test.js") || path.endsWith(".test.mjs"))
  .sort();

if (testFiles.length === 0) {
  console.error("No JavaScript test files were discovered in active R&D workspaces.");
  process.exit(1);
}

const nodeArguments = [];
if (coverageEnabled) {
  nodeArguments.push(
    "--experimental-test-coverage",
    "--test-coverage-include=packages/rnd-*/src/**/*.js",
    "--test-coverage-include=apps/rnd-api/src/**/*.js",
    "--test-coverage-exclude=**/index.js",
  );
}
nodeArguments.push("--test", "--test-isolation=process", ...testFiles);

console.log(`Running ${testFiles.length} JavaScript test file(s)${coverageEnabled ? " with coverage" : ""}.`);
const result = spawnSync(process.execPath, nodeArguments, { stdio: "inherit" });

if (result.error) {
  console.error(result.error);
  process.exit(1);
}

process.exit(result.status ?? 1);

function discoverWorkspaceRoots() {
  const roots = [];
  for (const parent of ["apps", "packages"]) {
    if (!existsSync(parent)) continue;
    for (const entry of readdirSync(parent, { withFileTypes: true })) {
      if (entry.isDirectory() && entry.name.startsWith("rnd-")) {
        roots.push(join(parent, entry.name));
      }
    }
  }
  return roots.sort();
}

function walk(root) {
  return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory() && ["node_modules", "dist-web", ".expo", "coverage"].includes(entry.name)) {
      return [];
    }
    const path = join(root, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}
