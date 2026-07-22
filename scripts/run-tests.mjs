import { spawnSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const testFiles = discoverWorkspaceRoots()
  .flatMap((root) => walk(root))
  .filter((path) => path.endsWith(".test.js") || path.endsWith(".test.mjs"))
  .sort();

if (testFiles.length === 0) {
  console.error("No JavaScript test files were discovered in active R&D workspaces.");
  process.exit(1);
}

console.log(`Running ${testFiles.length} JavaScript test file(s).`);
const result = spawnSync(process.execPath, ["--test", ...testFiles], { stdio: "inherit" });

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
