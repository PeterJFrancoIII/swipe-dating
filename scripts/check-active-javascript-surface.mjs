import { readdirSync } from "node:fs";
import { extname, join } from "node:path";

const roots = ["apps/rnd-mobile", "apps/rnd-api", "apps/rnd-simulator", "packages/rnd-domain", "packages/rnd-crypto-node"];
const allowed = new Set([".js", ".json", ".md"]);
const forbidden = [];
for (const root of roots) {
  for (const file of walk(root)) {
    const extension = extname(file);
    if (!allowed.has(extension)) forbidden.push(file);
  }
}
if (forbidden.length > 0) {
  console.error("Non-JavaScript active implementation files detected:");
  for (const file of forbidden) console.error(`- ${file}`);
  process.exit(1);
}
console.log("Active R&D application surface is JavaScript/JSON only.");

function walk(root) {
  return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const path = join(root, entry.name);
    if (entry.isDirectory()) {
      if (["node_modules", "dist-web", ".expo"].includes(entry.name)) return [];
      return walk(path);
    }
    return [path];
  });
}
