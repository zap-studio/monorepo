import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export interface PackageInfo {
  description: string;
  name: string;
  slug: string;
  version: string;
}

const packagesDirectory = resolve(process.cwd(), "../../packages");

const slugs = [
  "cache",
  "env",
  "fetch",
  "logger",
  "monads",
  "oxfmt",
  "oxlint",
  "permit",
  "react-hooks",
  "retry",
  "store",
  "validation",
  "webhooks",
  "webmcp",
] as const;

const readPackage = (slug: string): PackageInfo => {
  const manifest: unknown = JSON.parse(
    readFileSync(`${packagesDirectory}/${slug}/package.json`, "utf8"),
  );
  // SAFETY: the fields read below are checked before use, and the throw covers a
  // manifest that parses to anything else.
  const { description, name, version } = manifest as {
    description?: string;
    name?: string;
    version?: string;
  };

  if (!description || !name || !version) {
    throw new Error(`packages/${slug}/package.json is missing name, version or description`);
  }

  return { description, name, slug, version };
};

export const packages: PackageInfo[] = slugs.map(readPackage);

export const findPackage = (slug: string): PackageInfo | undefined =>
  packages.find((entry) => entry.slug === slug);
