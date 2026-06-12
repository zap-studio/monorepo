#!/usr/bin/env node

import { spawn } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const scanPath = process.cwd();
const repoRoot = path.resolve(scanPath, "../..");
const reportDir = path.join(repoRoot, ".react-doctor", "docs");
const latestReportPath = path.join(reportDir, "latest.txt");
const environmentPrefixesToRemove = ["npm_", "PNPM_"];
const catalogDependencyNames = ["react", "react-dom"];
const dependencyFields = [
  "dependencies",
  "devDependencies",
  "peerDependencies",
  "optionalDependencies",
];

await mkdir(reportDir, { recursive: true });

const outputChunks = [];

function createChildEnv() {
  const childEnv = Object.fromEntries(
    Object.entries(process.env).filter(([key]) => shouldKeepEnvironmentKey(key))
  );

  return childEnv;
}

function shouldKeepEnvironmentKey(key) {
  return (
    key !== "INIT_CWD" &&
    !environmentPrefixesToRemove.some((prefix) => key.startsWith(prefix))
  );
}

function getCatalogVersion(workspaceYaml, dependencyName) {
  const escapedName = dependencyName.replaceAll(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = workspaceYaml.match(
    new RegExp(`^\\s{2}${escapedName}:\\s+(.+)$`, "m")
  );

  return match?.[1]?.trim() ?? null;
}

async function prepareScanPackageJson() {
  const packageJsonPath = path.join(scanPath, "package.json");
  const originalPackageJson = await readFile(packageJsonPath, "utf-8");

  if (!originalPackageJson.includes('"catalog:"')) {
    return async () => {};
  }

  const workspaceYaml = await readFile(
    path.join(repoRoot, "pnpm-workspace.yaml"),
    "utf-8"
  );
  const packageJson = JSON.parse(originalPackageJson);
  const catalogVersions = Object.fromEntries(
    catalogDependencyNames.map((name) => [
      name,
      getCatalogVersion(workspaceYaml, name),
    ])
  );
  const modified = replaceCatalogVersions(packageJson, catalogVersions);

  if (!modified) {
    return async () => {};
  }

  await writeFile(
    packageJsonPath,
    `${JSON.stringify(packageJson, null, 2)}\n`,
    "utf-8"
  );

  return async () => {
    await writeFile(packageJsonPath, originalPackageJson, "utf-8");
  };
}

function replaceCatalogVersions(packageJson, catalogVersions) {
  const replacements = getCatalogReplacements(packageJson, catalogVersions);

  for (const { dependencies, dependencyName, version } of replacements) {
    dependencies[dependencyName] = version;
  }

  return replacements.length > 0;
}

function getCatalogReplacements(packageJson, catalogVersions) {
  return getDependencySections(packageJson).flatMap((dependencies) =>
    Object.entries(catalogVersions)
      .filter(
        ([dependencyName, version]) =>
          dependencies[dependencyName] === "catalog:" && version
      )
      .map(([dependencyName, version]) => ({
        dependencies,
        dependencyName,
        version,
      }))
  );
}

function getDependencySections(packageJson) {
  return dependencyFields
    .map((field) => packageJson[field])
    .filter((dependencies) => dependencies && typeof dependencies === "object");
}

const restorePackageJson = await prepareScanPackageJson();

const child = spawn(
  "pnpm",
  ["dlx", "react-doctor@latest", ".", "--verbose", "--yes"],
  {
    cwd: scanPath,
    env: createChildEnv(),
    stdio: ["ignore", "pipe", "pipe"],
  }
);

child.stdout.on("data", (chunk) => {
  outputChunks.push(chunk);
  process.stdout.write(chunk);
});

child.stderr.on("data", (chunk) => {
  outputChunks.push(chunk);
  process.stderr.write(chunk);
});

const result = await new Promise((resolve) => {
  const finish = async (payload) => {
    try {
      await restorePackageJson();
      resolve({ ...payload, restoreError: null });
    } catch (error) {
      resolve({ ...payload, restoreError: error });
    }
  };

  child.on("close", (code) => {
    void finish({ exitCode: code ?? 1, startupError: null });
  });

  child.on("error", (error) => {
    const errorText = `\n[react-doctor runner error]\n${error.stack ?? error.message}\n`;
    outputChunks.push(Buffer.from(errorText, "utf-8"));
    console.error(error);
    void finish({ exitCode: 1, startupError: error });
  });
});

const report = Buffer.concat(outputChunks).toString("utf-8");
await writeFile(latestReportPath, report, "utf-8");

if (result.startupError || result.restoreError) {
  process.exit(1);
}

process.exit(result.exitCode);
