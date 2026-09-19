import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Brand marks for the runtimes the packages target, vendored from Simple Icons
 * (CC0) under `lib/brands` so they inherit `currentColor` like every other icon.
 * They are read at build time and inlined into the page; each mark sits beside a
 * label that names it, so the mark itself is decorative.
 *
 * The directory is resolved from the working directory rather than this file's
 * URL: the build bundles this module into a chunk elsewhere on disk, and only
 * the project root stays put. `lib/packages.ts` reads the workspace the same way.
 */
const brandsDirectory = resolve(process.cwd(), "lib/brands");

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
