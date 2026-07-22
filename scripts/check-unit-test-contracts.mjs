import { existsSync, readdirSync, writeFileSync } from "node:fs";
import { basename, dirname, extname, join, relative, sep } from "node:path";

const repositoryRoot = process.cwd();
const workspaces = discoverWorkspaceRoots();
const unitTestableWorkspaces = workspaces.filter((root) => root.startsWith("packages/") || root === "apps/rnd-api");
const testFiles = workspaces
  .flatMap((root) => walk(root))
  .filter(isTestFile)
  .map(normalize)
  .sort();
const sourceFiles = unitTestableWorkspaces
  .flatMap((root) => walk(join(root, "src")))
  .filter(isJavaScript)
  .map(normalize)
  .sort();

const workspaceSummaries = unitTestableWorkspaces.map((workspace) => {
  const normalizedWorkspace = normalize(workspace);
  const workspaceSources = sourceFiles.filter((path) => path.startsWith(`${normalizedWorkspace}/src/`));
  const workspaceTests = testFiles.filter((path) => path.startsWith(`${normalizedWorkspace}/`));
  return {
    workspace: normalizedWorkspace,
    sourceFiles: workspaceSources,
    testFiles: workspaceTests,
  };
});

const failures = [];
for (const summary of workspaceSummaries) {
  if (summary.sourceFiles.length > 0 && summary.testFiles.length === 0) {
    failures.push(`${summary.workspace}: has source files but no unit tests`);
  }
}

const duplicateTestBasenames = findDuplicates(testFiles.map((path) => basename(path)));
const inventory = {
  sourceFileCount: sourceFiles.length,
  testFileCount: testFiles.length,
  sourceFiles,
  testFiles,
  workspaceSummaries,
  duplicateTestBasenames,
};
writeFileSync(".unit-test-inventory.json", `${JSON.stringify(inventory, null, 2)}\n`);

console.log(`UNIT_TEST_SOURCE_FILES=${JSON.stringify(sourceFiles)}`);
console.log(`UNIT_TEST_FILES=${JSON.stringify(testFiles)}`);
console.log(`UNIT_TEST_WORKSPACES=${JSON.stringify(workspaceSummaries.map(({ workspace, sourceFiles: sources, testFiles: tests }) => ({ workspace, sources: sources.length, tests: tests.length })) )}`);
if (duplicateTestBasenames.length > 0) {
  console.log(`UNIT_TEST_DUPLICATE_BASENAMES=${JSON.stringify(duplicateTestBasenames)}`);
}

if (failures.length > 0) {
  console.error("Unit-test architecture validation failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Unit-test contracts OK: ${sourceFiles.length} source file(s), ${testFiles.length} test file(s), ${unitTestableWorkspaces.length} unit-testable workspace(s).`);

function discoverWorkspaceRoots() {
  const roots = [];
  for (const parent of ["apps", "packages"]) {
    if (!existsSync(parent)) continue;
    for (const entry of readdirSync(parent, { withFileTypes: true })) {
      if (entry.isDirectory() && entry.name.startsWith("rnd-")) roots.push(join(parent, entry.name));
    }
  }
  return roots.sort();
}

function walk(root) {
  if (!existsSync(root)) return [];
  return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory() && ["node_modules", "dist-web", ".expo", "coverage"].includes(entry.name)) return [];
    const path = join(root, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

function isJavaScript(path) {
  return [".js", ".mjs"].includes(extname(path));
}

function isTestFile(path) {
  return path.endsWith(".test.js") || path.endsWith(".test.mjs");
}

function normalize(path) {
  return relative(repositoryRoot, path).split(sep).join("/");
}

function findDuplicates(values) {
  const counts = new Map();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts.entries()].filter(([, count]) => count > 1).map(([value]) => value).sort();
}
