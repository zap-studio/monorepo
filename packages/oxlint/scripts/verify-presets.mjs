#!/usr/bin/env node
/**
 * Pre-publish gate: every public preset in `package.json#exports` must parse cleanly under the
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
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = dirname(dirname(fileURLToPath(import.meta.url)));

const oxlintPackageJson = fileURLToPath(import.meta.resolve("oxlint/package.json"));
const oxlintBin = join(dirname(oxlintPackageJson), "bin", "oxlint");
const oxlintVersion = spawnSync(process.execPath, [oxlintBin, "--version"], {
  encoding: "utf8",
}).stdout.trim();

const { exports: packageExports } = JSON.parse(
  readFileSync(join(packageRoot, "package.json"), "utf8"),
);

const compareFilePaths = (a, b) => {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
};

// Derived from `package.json#exports` rather than a `dist` directory scan: bundling
// `index.ts`'s tree-shakeable barrel can split shared code into internal chunk files
// (e.g. `base-XXXXXXXX.js`) that sit alongside the public presets in `dist` but aren't
// themselves a `defineConfig` default export meant to be loaded via `-c`. `.` (the
// barrel) and `./anti-slop` (a plugin, not an `OxlintConfig`) are excluded for the same
// reason — neither is consumed via `oxlint -c`.
const presetFiles = Object.entries(packageExports)
  .filter(
    ([specifier]) =>
      specifier !== "." && specifier !== "./anti-slop" && specifier !== "./package.json",
  )
  .map(([, file]) => file)
  .sort(compareFilePaths);

console.log(`Verifying ${presetFiles.length} presets against installed ${oxlintVersion}...\n`);

const failures = [];

for (const file of presetFiles) {
  const absolutePath = join(packageRoot, file);
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
    console.error(`  ${file}`);
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
