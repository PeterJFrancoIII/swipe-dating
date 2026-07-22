import { existsSync, statSync } from "node:fs";
import { join } from "node:path";

const exportPath = join(process.cwd(), "apps", "rnd-mobile", "dist-web", "index.html");

if (!existsSync(exportPath)) {
  console.error(`Expo web export is missing: ${exportPath}`);
  process.exit(1);
}

if (!statSync(exportPath).isFile() || statSync(exportPath).size === 0) {
  console.error(`Expo web export is empty or not a file: ${exportPath}`);
  process.exit(1);
}

console.log(`Expo web export verified: ${exportPath}`);
