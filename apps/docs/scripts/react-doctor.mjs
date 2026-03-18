#!/usr/bin/env node

import { spawn } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const scanPath = process.cwd();
const repoRoot = path.resolve(scanPath, "../..");
const reportDir = path.join(repoRoot, ".react-doctor", "docs");
const latestReportPath = path.join(reportDir, "latest.txt");
const vitePlusBin = path.join(process.env.HOME ?? "", ".vite-plus", "bin", "vp");

await mkdir(reportDir, { recursive: true });

const outputChunks = [];

function createChildEnv() {
  const childEnv = { ...process.env };

  for (const key of Object.keys(childEnv)) {
    if (key.startsWith("npm_") || key.startsWith("PNPM_") || key.startsWith("VITE_PLUS_")) {
      delete childEnv[key];
    }
  }

  delete childEnv.INIT_CWD;

  return childEnv;
}

function getCatalogVersion(workspaceYaml, dependencyName) {
  const escapedName = dependencyName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = workspaceYaml.match(new RegExp(`^\\s{2}${escapedName}:\\s+(.+)$`, "m"));

  return match?.[1]?.trim() ?? null;
}

async function prepareScanPackageJson() {
  const packageJsonPath = path.join(scanPath, "package.json");
  const originalPackageJson = await readFile(packageJsonPath, "utf8");

  if (!originalPackageJson.includes('"catalog:"')) {
    return async () => {};
  }

  const workspaceYaml = await readFile(path.join(repoRoot, "pnpm-workspace.yaml"), "utf8");
  const packageJson = JSON.parse(originalPackageJson);
  const catalogVersions = {
    react: getCatalogVersion(workspaceYaml, "react"),
    "react-dom": getCatalogVersion(workspaceYaml, "react-dom"),
  };

  let modified = false;

  for (const field of [
    "dependencies",
    "devDependencies",
    "peerDependencies",
    "optionalDependencies",
  ]) {
    const dependencies = packageJson[field];

    if (!dependencies || typeof dependencies !== "object") {
      continue;
    }

    for (const [dependencyName, version] of Object.entries(catalogVersions)) {
      if (dependencies[dependencyName] === "catalog:" && version) {
        dependencies[dependencyName] = version;
        modified = true;
      }
    }
  }

  if (!modified) {
    return async () => {};
  }

  await writeFile(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`, "utf8");

  return async () => {
    await writeFile(packageJsonPath, originalPackageJson, "utf8");
  };
}

const restorePackageJson = await prepareScanPackageJson();

const child = spawn(vitePlusBin, ["dlx", "react-doctor@latest", ".", "--verbose", "--yes"], {
  cwd: scanPath,
  env: createChildEnv(),
  stdio: ["ignore", "pipe", "pipe"],
});

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
    outputChunks.push(Buffer.from(errorText, "utf8"));
    console.error(error);
    void finish({ exitCode: 1, startupError: error });
  });
});

const report = Buffer.concat(outputChunks).toString("utf8");
await writeFile(latestReportPath, report, "utf8");

if (result.startupError || result.restoreError) {
  process.exit(1);
}

process.exit(result.exitCode);
