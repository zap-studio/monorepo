# @zap-studio/oxlint

Zap Studio's [oxlint](https://oxc.rs/docs/guide/usage/linter.html) preset — exclusive, single-owner rule sets built from vetted ESLint plugins, plus a bundled `anti-slop` plugin.

Full documentation: [docs/oxlint](https://github.com/zap-studio/monorepo/tree/main/docs/oxlint)

`oxlint`'s zero-config only covers its own bundled rules. This package picks up from there: one preset per plugin or framework integration, each owning a disjoint slice of rules. No preset pulls another one in — what you `extends` is exactly what you get, nothing implied.

## Installation

```bash
npm install --save-dev @zap-studio/oxlint oxlint
```

`oxlint` is a peer dependency — install the version you want to run. If you use `base`'s `typeAware`/`typeCheck` options, also install `oxlint-tsgolint`.

## Compatibility

`oxlint` is a peer dependency, not a bundled one — check that your installed version satisfies `peerDependencies.oxlint` in this package's `package.json` before extending a preset. This matters more here than for most peer dependencies: presets built on jsPlugins (`stylex`, `playwright`, `tanstack-query`, ...) resolve a real installed npm package, so version drift there just resolves to whatever you have installed. Presets built on oxlint's _native_ plugins (`jsx-a11y`, `react`, `react-perf`, `typescript`, `unicorn`, `oxc`, `import`, `promise`, `eslint`) reference rules baked into the `oxlint` binary itself — if a referenced rule doesn't exist in your installed `oxlint`, config parsing hard-fails immediately with `Rule '<name>' not found in plugin '<plugin>'`, for the whole config, not just that rule.

Every release of this package is verified against the exact `oxlint` version its own `peerDependencies.oxlint` floor resolves to — `scripts/verify-presets.mjs` runs `oxlint --print-config` against every built preset before publish and fails the release if any preset doesn't parse. If you still hit the error above, your installed `oxlint` is older than this package's declared floor; upgrade `oxlint` to match.

## Usage

Every preset owns its own slice of rules and nothing else's — `react` doesn't bring accessibility rules, `nextjs` doesn't bring hooks rules, `tanstack-start` doesn't bring the TanStack Query plugin. List every preset your project actually needs in `extends`, importing each by name from the package root:

```ts
import {
  base,
  react,
  reactA11y,
  reactDoctor,
  jsxRuntimeAutomatic,
  nextjs,
} from "@zap-studio/oxlint";
import { defineConfig } from "oxlint";

export default defineConfig({
  extends: [base, react, reactA11y, reactDoctor, jsxRuntimeAutomatic, nextjs],
});
```

This is more imports than a bundled "one big preset" would need — that's the tradeoff for never getting rules you didn't ask for. `base` is the one exception: it's the JS/TS correctness and security baseline every project wants regardless of framework, so it stays a single preset instead of splitting into a dozen one-plugin imports.

Every preset is also reachable by its own subpath, if you'd rather import one preset per line instead of destructuring the root:

```ts
import base from "@zap-studio/oxlint/base";
import react from "@zap-studio/oxlint/react";
import { defineConfig } from "oxlint";

export default defineConfig({
  extends: [base, react],
});
```

This is the same code as the named root import — named ESM exports either way, so bundlers tree-shake away whatever preset you didn't import.

`extends` merges `rules` key-by-key and unions `plugins`/`jsPlugins`, so anything you add to your own `rules` after `extends` overrides a preset — no need to fork it to change or disable a single rule:

```ts
export default defineConfig({
  extends: [base, react],
  rules: {
    "sonarjs/cognitive-complexity": "off",
  },
});
```

## License

MIT. The bundled `anti-slop` plugin (`@zap-studio/oxlint/anti-slop`) ships under its own MIT license — see [`src/anti-slop/LICENSE`](./src/anti-slop/LICENSE).
