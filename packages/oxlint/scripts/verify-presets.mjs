#!/usr/bin/env node
/**
 * Pre-publish gate: every built preset in `dist/*.js` must parse cleanly under the
 * `oxlint` version this package actually has installed (which is kept equal to
 * `peerDependencies.oxlint`'s floor via the `oxlint` catalog entry — see README's
 * "Compatibility" section).
 *
 * This exists because native-plugin rules (`jsx-a11y`, `react`, `react-perf`, `typescript`,
 * `unicorn`, `oxc`, `import`, `promise`, `eslint`, ...) are baked into the oxlint binary
 * itself, not resolved from an npm package the way jsPlugins are. A preset can reference a
 * rule name that only exists in a newer oxlint than what a consumer (or our own peer floor)
 * actually has, and oxlint's config parser hard-fails the *entire* config on any single
 * unknown rule name — see `_rules-react-a11y.ts`'s `aria-braille-equivalent` incident.
 *
 * `oxlint --print-config` does full config validation (plugin/rule resolution) without
 * linting any files, so pointing it at each compiled preset directly reproduces exactly
 * the failure a consumer would hit extending that preset — for both native-plugin rule
 * names and jsPlugin specifier resolution.
 */

import { spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const distDir = join(packageRoot, "dist");

const oxlintPackageJson = fileURLToPath(import.meta.resolve("oxlint/package.json"));
const oxlintBin = join(dirname(oxlintPackageJson), "bin", "oxlint");
const oxlintVersion = spawnSync(process.execPath, [oxlintBin, "--version"], {
  encoding: "utf8",
}).stdout.trim();

const presetFiles = readdirSync(distDir, { withFileTypes: true })
  // leading `_` marks an internal shared chunk (mirrors the `_rules-*.ts`/`_resolve.ts`
  // source convention), not a public preset with its own `defineConfig` default export.
  .filter((entry) => entry.isFile() && entry.name.endsWith(".js") && !entry.name.startsWith("_"))
  .map((entry) => entry.name)
  .sort();

console.log(`Verifying ${presetFiles.length} presets against installed ${oxlintVersion}...\n`);

const failures = [];

for (const file of presetFiles) {
  const absolutePath = join(distDir, file);
  const result = spawnSync(process.execPath, [oxlintBin, "-c", absolutePath, "--print-config"], {
    encoding: "utf8",
  });

  if (result.status !== 0) {
    failures.push({
      file,
      message: (result.stderr || result.stdout).trim(),
    });
  }
}

if (failures.length > 0) {
  console.error(`${failures.length} of ${presetFiles.length} preset(s) failed to parse:\n`);
  for (const { file, message } of failures) {
    console.error(`  dist/${file}`);
    console.error(
      `    ${message
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .join("\n    ")}\n`,
    );
  }
  console.error(
    "Each of these references a rule or plugin the installed oxlint doesn't have. Either the " +
      "preset's rule map needs fixing, or `peerDependencies.oxlint` needs bumping to a version " +
      "that ships what's referenced — see README's \"Compatibility\" section.",
  );
  process.exit(1);
}

console.log(`All ${presetFiles.length} presets parse cleanly under ${oxlintVersion}.`);
