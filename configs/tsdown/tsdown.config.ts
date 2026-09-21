import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";
import { defineConfig } from "tsdown";

const repoRoot = fileURLToPath(new URL("../..", import.meta.url));

export default defineConfig({
  attw: { profile: "esm-only" },
  dts: true,
  entry: [
    "src/**/*.ts",
    "!src/**/_*.ts",
    "!src/anti-slop/rules/**",
    "!src/anti-slop/shared/**",
    "!**/*.test.ts",
    "!**/*.spec.ts",
  ],
  deps: { neverBundle: [/^node:/u] },
  hooks: {
    "build:done": ({ chunks }) => {
      const jsChunks = chunks.filter((chunk) => chunk.fileName.endsWith(".js"));
      const outDir = jsChunks.at(-1)?.outDir;

      if (outDir === undefined) {
        return;
      }

      const sizes = Object.fromEntries(
        jsChunks.map((chunk) => [
          chunk.fileName,
          gzipSync(Buffer.from(chunk.type === "chunk" ? chunk.code : chunk.source), { level: 9 })
            .byteLength,
        ]),
      );

      writeFileSync(resolve(outDir, "../.size.json"), `${JSON.stringify(sizes, null, 2)}\n`);
    },
  },
  exports: {
    customExports(exports, { pkg }) {
      if (pkg.name === "@zap-studio/oxlint") {
        exports["./anti-slop"] = "./dist/anti-slop/index.js";
      }
      return exports;
    },
  },
  platform: "neutral",
  publint: true,
  unused: {
    ignore: ["@oxlint/plugins", "oxlint-tsgolint"],
  },
  workspace: { include: [`${repoRoot}packages/*`] },
});
