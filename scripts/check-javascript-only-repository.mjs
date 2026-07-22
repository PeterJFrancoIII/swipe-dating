import { existsSync, readdirSync } from "node:fs";
import { basename, extname, join, relative, sep } from "node:path";

const repositoryRoot = process.cwd();
const ignoredDirectories = new Set([".git", "node_modules", "dist-web", ".expo", "coverage"]);
const legacyRoots = ["apps/ios", "apps/android", "core", "services", "infra"];
const prohibitedExtensions = new Set([
  ".bash", ".c", ".cc", ".cpp", ".cs", ".dart", ".fish", ".fs", ".fsx", ".go",
  ".gradle", ".h", ".hpp", ".java", ".kt", ".kts", ".m", ".mm", ".php", ".podspec",
  ".py", ".rb", ".rs", ".scala", ".sh", ".swift", ".tf", ".tfvars", ".ts", ".tsx",
  ".xcconfig", ".zsh",
]);
const prohibitedNames = new Set([
  "Cargo.lock", "Cargo.toml", "Gemfile", "Gemfile.lock", "Makefile", "Package.swift",
  "Pipfile", "Podfile", "Podfile.lock", "build.gradle", "build.gradle.kts", "go.mod", "go.sum",
  "gradlew", "gradlew.bat", "package.resolved", "pubspec.yaml", "pyproject.toml", "requirements.txt",
  "settings.gradle", "settings.gradle.kts", "setup.py",
]);

const violations = [];
for (const file of walk(repositoryRoot)) {
  const relativePath = relative(repositoryRoot, file).split(sep).join("/");
  const name = basename(file);
  const extension = extname(file).toLowerCase();
  const legacyRoot = legacyRoots.find((root) => relativePath === root || relativePath.startsWith(`${root}/`));

  if (legacyRoot) {
    violations.push({ path: relativePath, reason: `legacy implementation root ${legacyRoot}` });
    continue;
  }
  if (prohibitedNames.has(name)) {
    violations.push({ path: relativePath, reason: `non-JavaScript build/runtime file ${name}` });
    continue;
  }
  if (prohibitedExtensions.has(extension)) {
    violations.push({ path: relativePath, reason: `non-JavaScript source extension ${extension}` });
  }
}

if (violations.length > 0) {
  console.error("Repository is not JavaScript-only:");
  for (const violation of violations.sort((left, right) => left.path.localeCompare(right.path))) {
    console.error(`- ${violation.path} (${violation.reason})`);
  }
  process.exit(1);
}

console.log("Repository implementation and build automation are JavaScript-only.");

function walk(root) {
  if (!existsSync(root)) return [];
  return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) return [];
    const path = join(root, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}
