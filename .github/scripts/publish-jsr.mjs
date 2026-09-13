import { execFileSync } from "node:child_process";
import { globSync, readFileSync } from "node:fs";

const deno = process.env.DENO_BIN;
if (!deno) throw new Error("DENO_BIN is not set");

const released = new Set(JSON.parse(process.env.RELEASED ?? "[]"));
if (released.size === 0) {
  console.log("No released packages, nothing to publish to JSR.");
  process.exit(0);
}

const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));

for (const config of globSync("packages/*/jsr.json")) {
  const dir = config.slice(0, -"/jsr.json".length);
  const { name } = readJson(config);
  if (!released.has(name)) continue;

  const { version } = readJson(`${dir}/package.json`);
  console.log(`Publishing ${name}@${version} to JSR`);
  execFileSync(deno, ["publish", "--set-version", version, "--allow-dirty"], {
    cwd: dir,
    stdio: "inherit",
  });
}
