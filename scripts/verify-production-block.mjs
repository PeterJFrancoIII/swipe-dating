import { spawnSync } from "node:child_process";

const result = spawnSync(process.execPath, ["scripts/production-preflight.mjs"], {
  cwd: process.cwd(),
  encoding: "utf8",
});

const output = `${result.stdout ?? ""}${result.stderr ?? ""}`;
process.stdout.write(output);

if (result.status === 0) {
  console.error("Production preflight unexpectedly passed without complete human approvals.");
  process.exit(1);
}

if (!output.includes("PRODUCTION_BLOCKED_HUMAN_APPROVALS_REQUIRED")) {
  console.error("Production preflight failed without the required block marker.");
  process.exit(1);
}

console.log("Production preflight remains correctly blocked.");
