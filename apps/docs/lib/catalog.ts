import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { gzipSync } from "node:zlib";

import { type PackageInfo, packages } from "./packages.ts";

const packagesDirectory = resolve(process.cwd(), "../../packages");

export type Support = "full" | "partial" | "tooling";

export interface CatalogEntry extends PackageInfo {
  dependencies: number;
  gzipBytes: number | null;
  note?: string;
  subpaths: number;
  support: Record<RuntimeId, Support>;
}

export const runtimeColumns = [
  { id: "node", label: "Node" },
  { id: "bun", label: "Bun" },
  { id: "deno", label: "Deno" },
  { id: "workers", label: "Workers" },
  { id: "browser", label: "Browser" },
] as const;

export type RuntimeId = (typeof runtimeColumns)[number]["id"];

const everywhere = {
  browser: "full",
  bun: "full",
  deno: "full",
  node: "full",
  workers: "full",
} satisfies Record<RuntimeId, Support>;

const devTime = {
  browser: "tooling",
  bun: "tooling",
  deno: "tooling",
  node: "tooling",
  workers: "tooling",
} satisfies Record<RuntimeId, Support>;

const facts = {
  fetch: {
    note: "Needs a global `fetch` — native from Node.js 18.",
    support: everywhere,
  },
  oxfmt: {
    note: "A formatter preset: it runs in your toolchain, not in your app.",
    support: devTime,
  },
  oxlint: {
    note: "A linter preset: it runs in your toolchain, not in your app.",
    support: devTime,
  },
  "react-hooks": {
    note: "Runs wherever React runs. Each browser-API hook fails closed instead of throwing.",
    support: everywhere,
  },
  retry: {
    note: "Cancellation reads `AbortSignal.reason`, which sets the browser minimums.",
    support: everywhere,
  },
  webhooks: {
    note: "Verification needs `crypto.subtle`: Node.js 19, or 18 with `--experimental-global-webcrypto`. Browsers need HTTPS.",
    support: { ...everywhere, node: "partial" },
  },
  webmcp: {
    note: "Registers tools only where the native WebMCP API exists — Chrome and Edge behind a flag. Everywhere else it is a no-op, so server rendering never breaks.",
    support: {
      browser: "partial",
      bun: "partial",
      deno: "partial",
      node: "partial",
      workers: "partial",
    },
  },
} satisfies Record<string, { note: string; support: Record<RuntimeId, Support> }>;

const measure = (slug: string): number | null => {
  try {
    const distDirectory = `${packagesDirectory}/${slug}/dist`;
    const sources: Buffer[] = [];
    for (const file of readdirSync(distDirectory)) {
      if (file.endsWith(".js")) {
        sources.push(readFileSync(`${distDirectory}/${file}`));
      }
    }
    if (sources.length === 0) {
      return null;
    }
    return gzipSync(Buffer.concat(sources), { level: 9 }).byteLength;
  } catch {
    return null;
  }
};

const RELATIVE_PREFIX = /^\.\//u;

interface Manifest {
  dependencies?: Record<string, string>;
  exports?: Record<string, unknown>;
}

const readManifest = (slug: string): Manifest =>
  // SAFETY: a package manifest is an object, and every field read off it below
  // is either defaulted or type-checked before use.
  JSON.parse(readFileSync(`${packagesDirectory}/${slug}/package.json`, "utf8")) as Manifest;

const countDependencies = (manifest: Manifest): number =>
  Object.keys(manifest.dependencies ?? {}).filter((name) => !name.startsWith("@zap-studio/"))
    .length;

const countSubpaths = (manifest: Manifest): number =>
  Object.keys(manifest.exports ?? {}).filter((key) => !key.endsWith("package.json")).length;

export const catalog: CatalogEntry[] = packages.map((entry) => {
  const manifest = readManifest(entry.slug);
  return {
    ...entry,
    dependencies: countDependencies(manifest),
    gzipBytes: measure(entry.slug),
    subpaths: countSubpaths(manifest),
    // SAFETY: the key is checked against `facts` on the line above.
    ...(Object.hasOwn(facts, entry.slug)
      ? facts[entry.slug as keyof typeof facts]
      : { support: everywhere }),
  };
});

export const measureExport = (slug: string, subpath: string): number | null => {
  const target = readManifest(slug).exports?.[subpath];

  // SAFETY: an exports entry is either the file path itself or a conditions
  // object; anything else falls through the `typeof` check below.
  const file =
    typeof target === "string" ? target : (target as { import?: string } | undefined)?.import;
  if (typeof file !== "string") {
    return null;
  }
  try {
    const source = readFileSync(
      `${packagesDirectory}/${slug}/${file.replace(RELATIVE_PREFIX, "")}`,
    );
    return gzipSync(source, { level: 9 }).byteLength;
  } catch {
    return null;
  }
};

export const sizesAvailable = catalog.every((entry) => entry.gzipBytes !== null);

export const formatBytes = (bytes: number): string => {
  if (bytes < 1000) {
    return `${bytes} B`;
  }
  return `${(bytes / 1000).toFixed(bytes < 10_000 ? 1 : 0)} kB`;
};

export const runtimePackages = catalog.filter((entry) => entry.support.node !== "tooling");
