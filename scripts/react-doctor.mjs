#!/usr/bin/env node

import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const [projectId, scanPathArg = "."] = process.argv.slice(2);

if (!projectId) {
  console.error(
    "Usage: node scripts/react-doctor.mjs <project-id> [scan-path]\n" +
      "Example: node scripts/react-doctor.mjs docs ."
  );
  process.exit(1);
}

const scanPath = path.resolve(process.cwd(), scanPathArg);
const reportDir = path.join(repoRoot, ".react-doctor", projectId);
const latestReportPath = path.join(reportDir, "latest.txt");

await mkdir(reportDir, { recursive: true });

const outputChunks = [];

const child = spawn(
  "pnpm",
  ["dlx", "react-doctor@latest", ".", "--verbose", "--yes"],
  {
    cwd: scanPath,
    env: process.env,
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

const exitCode = await new Promise((resolve) => {
  child.on("close", (code) => resolve(code ?? 1));
});

const report = Buffer.concat(outputChunks).toString("utf8");
await writeFile(latestReportPath, report, "utf8");

process.exit(exitCode);
