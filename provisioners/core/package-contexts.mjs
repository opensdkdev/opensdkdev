import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

import { packagePrefix, packagesDir, repoRoot } from "../config.mjs";

export async function loadPackageContexts() {
  const entries = await readdir(packagesDir, { withFileTypes: true });
  const contexts = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const packageDir = path.join(packagesDir, entry.name);
    const packageJsonPath = path.join(packageDir, "package.json");
    const packageJsonRaw = await readFile(packageJsonPath, "utf8");
    const packageJson = JSON.parse(packageJsonRaw);

    contexts.push({
      packageDir,
      packageName: packageJson.name,
      packageSlug: entry.name
    });
  }

  return contexts;
}

export function validateSourcePackages(packageContexts) {
  for (const context of packageContexts) {
    if (typeof context.packageName !== "string" || !context.packageName.startsWith(packagePrefix)) {
      throw new Error(
        `Package ${path.relative(repoRoot, context.packageDir)} must start with ${packagePrefix}. Found ${String(context.packageName)}.`
      );
    }
  }
}

export function filterPackageContexts(packageContexts, packageDirFilter) {
  if (packageDirFilter == null) {
    return packageContexts;
  }

  return packageContexts.filter((context) => path.resolve(context.packageDir) === packageDirFilter);
}
