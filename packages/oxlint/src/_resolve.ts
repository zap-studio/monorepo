import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * oxlint resolves `jsPlugins` specifiers relative to the consuming project's
 * `oxlint.config.ts`, not relative to this package. A bare package name (e.g.
 * `"eslint-plugin-regexp"`) only resolves if the consumer also has it hoisted
 * into their own `node_modules` — which isn't guaranteed under pnpm's default,
 * non-hoisted layout. Resolving to an absolute path here, from this package's
 * own module graph, works regardless of the consumer's `node_modules` layout.
 */
export const resolvePlugin = (specifier: string): string =>
  fileURLToPath(import.meta.resolve(specifier));

const packageRoot = dirname(fileURLToPath(import.meta.resolve("@zap-studio/oxlint/package.json")));

export const antiSlopSpecifier: string = join(packageRoot, "src", "anti-slop", "index.ts");
