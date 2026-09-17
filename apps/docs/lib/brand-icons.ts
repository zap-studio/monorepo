import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Brand marks for the runtimes the packages target, vendored from Simple Icons
 * (CC0) under `lib/brands` so they inherit `currentColor` like every other icon.
 * They are read at build time and inlined into the page; each one sits beside a
 * label that names it, so the mark itself is decorative.
 */
const brandsDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "brands");

const readBrand = (name: string): string =>
  readFileSync(`${brandsDirectory}/${name}.svg`, "utf8").trim();

export const brandIcons = {
  bun: readBrand("bun"),
  chrome: readBrand("chrome"),
  deno: readBrand("deno"),
  firefox: readBrand("firefox"),
  node: readBrand("node"),
  safari: readBrand("safari"),
  workers: readBrand("workers"),
} as const;
