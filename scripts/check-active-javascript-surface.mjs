import { existsSync, readdirSync } from "node:fs";
import { extname, join, relative } from "node:path";

const repositoryRoot = process.cwd();
const activeRoots = discoverActiveRoots();
const allowedExtensions = new Set([".js", ".mjs", ".cjs", ".json", ".md"]);
const ignoredDirectories = new Set(["node_modules", "dist-web", ".expo", "coverage"]);
const forbidden = [];

for (const root of activeRoots) {
  for (const file of walk(root)) {
    if (!allowedExtensions.has(extname(file))) {
      forbidden.push(relative(repositoryRoot, file));
    }
  }
}

if (forbidden.length > 0) {
  console.error("Non-JavaScript active implementation files detected:");
  for (const file of forbidden.sort()) console.error(`- ${file}`);
  process.exit(1);
}

console.log(`Active R&D surface is JavaScript/JSON only across ${activeRoots.length} workspace(s).`);

function discoverActiveRoots() {
  const roots = [];
  for (const parent of ["apps", "packages"]) {
    if (!existsSync(parent)) continue;
    for (const entry of readdirSync(parent, { withFileTypes: true })) {
      if (entry.isDirectory() && entry.name.startsWith("rnd-")) {
        roots.push(join(parent, entry.name));
      }
    }
  }

  if (roots.length === 0) throw new Error("no_active_javascript_workspaces_found");
  return roots.sort();
}

function walk(root) {
  return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) return [];
    const path = join(root, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}
