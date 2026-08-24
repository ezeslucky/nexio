
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const root = __dirname;

function findPackageJsons() {
  const out = execSync(
    'grep -rl "\\"build\\": \\"tsc\\"" --include=package.json .',
    { cwd: root, encoding: "utf8" }
  );
  return out
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.includes("node_modules"));
}

function main() {
  const files = findPackageJsons();
  let changed = 0;

  for (const rel of files) {
    const full = path.join(root, rel);
    const raw = fs.readFileSync(full, "utf8");
    const pkg = JSON.parse(raw);

    const hasIt =
      (pkg.dependencies && pkg.dependencies.typescript) ||
      (pkg.devDependencies && pkg.devDependencies.typescript);

    if (!hasIt) {
      pkg.devDependencies = pkg.devDependencies || {};
      pkg.devDependencies.typescript = "^5.7.2";
      fs.writeFileSync(full, JSON.stringify(pkg, null, 2) + "\n");
      changed++;
      console.log("patched:", rel);
    }
  }

  console.log(`\nDone. Patched ${changed} package.json file(s).`);
}

main();