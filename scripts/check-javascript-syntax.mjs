import { spawnSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { extname, join } from "node:path";

const roots = discoverSyntaxRoots();
const files = roots.flatMap(walk).filter((path) => [".js", ".mjs", ".cjs"].includes(extname(path)));
let failed = false;

for (const file of files) {
  const result = spawnSync(process.execPath, ["--check", file], { stdio: "inherit" });
  if (result.status !== 0) failed = true;
}

if (failed) process.exit(1);
console.log(`JavaScript syntax OK: ${files.length} file(s) across ${roots.length} root(s)`);

function discoverSyntaxRoots() {
  const roots = ["scripts"];

  if (existsSync("packages")) {
    for (const entry of readdirSync("packages", { withFileTypes: true })) {
      if (entry.isDirectory() && entry.name.startsWith("rnd-")) roots.push(join("packages", entry.name));
    }
  }

  if (existsSync("apps")) {
    for (const entry of readdirSync("apps", { withFileTypes: true })) {
      if (!entry.isDirectory() || !entry.name.startsWith("rnd-") || entry.name === "rnd-mobile") continue;
      roots.push(join("apps", entry.name));
    }
  }

  return roots.sort();
}

function walk(root) {
  return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory() && ["node_modules", "dist-web", ".expo", "coverage"].includes(entry.name)) return [];
    const path = join(root, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}
