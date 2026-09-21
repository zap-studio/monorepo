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
      const sizes: Record<string, number> = {};
      let outDir = "";

      for (const chunk of chunks) {
        if (!chunk.fileName.endsWith(".js")) {
          continue;
        }
        const source = chunk.type === "chunk" ? chunk.code : chunk.source;
        sizes[chunk.fileName] = gzipSync(Buffer.from(source), { level: 9 }).byteLength;
        outDir = chunk.outDir;
      }

      if (outDir === "") {
        return;
      }

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
