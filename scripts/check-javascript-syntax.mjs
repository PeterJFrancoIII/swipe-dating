import { spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { extname, join } from "node:path";

const roots = ["apps/rnd-api", "apps/rnd-simulator", "packages/rnd-domain", "packages/rnd-crypto-node", "scripts"];
const files = roots.flatMap(walk).filter((path) => extname(path) === ".js" || extname(path) === ".mjs");
let failed = false;
for (const file of files) {
  const result = spawnSync(process.execPath, ["--check", file], { stdio: "inherit" });
  if (result.status !== 0) failed = true;
}
if (failed) process.exit(1);
console.log(`JavaScript syntax OK: ${files.length} file(s)`);

function walk(root) {
  return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const path = join(root, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}
