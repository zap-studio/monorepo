import { readFileSync } from "node:fs";
import { resolve } from "node:path";

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
