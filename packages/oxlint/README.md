# @zap-studio/oxlint

Zap Studio's [oxlint](https://oxc.rs/docs/guide/usage/linter.html) preset: composable `base`, `react`, and `testing` rule sets, built from vetted ESLint plugins (`eslint-plugin-regexp`, `eslint-plugin-sonarjs`, `eslint-plugin-github`, `@e18e/eslint-plugin`, `eslint-plugin-playwright`, `oxlint-plugin-react-doctor`) plus a bundled `anti-slop` plugin.

## Installation

```bash
npm install --save-dev @zap-studio/oxlint oxlint
```

`oxlint` is a peer dependency — install the version you want to run. If you use the `typeAware`/`typeCheck` options from `base`, also install `oxlint-tsgolint`.

## Usage

Pick the preset that matches your project and extend it from `oxlint.config.ts`:

```ts
// non-React project
import { defineConfig } from "oxlint";
import zapStudio from "@zap-studio/oxlint/base";

export default defineConfig({
  extends: [zapStudio],
});
```

```ts
// React project
import { defineConfig } from "oxlint";
import zapStudio from "@zap-studio/oxlint/react";

export default defineConfig({
  extends: [zapStudio],
});
```

```ts
// React project with the testing rule set (vitest + playwright) too
import { defineConfig } from "oxlint";
import zapStudio from "@zap-studio/oxlint/full";

export default defineConfig({
  extends: [zapStudio],
});
```

`extends` merges `rules` key-by-key and unions `plugins`/`jsPlugins`, so anything you add to your own `rules` after `extends` overrides the preset — no need to fork the preset to change or disable a single rule:

```ts
export default defineConfig({
  extends: [zapStudio],
  rules: {
    "sonarjs/cognitive-complexity": "off",
  },
});
```

## Presets

- `@zap-studio/oxlint/base` — general-purpose rules: `eslint`, `typescript`, `unicorn`, `oxc`, `import`, `jsdoc`, `node`, `promise`, plus `regexp`, `sonarjs`, `github`, `e18e`, and `anti-slop`.
- `@zap-studio/oxlint/react` — `base` plus `react`, `react-perf`, `jsx-a11y`, and `react-doctor`.
- `@zap-studio/oxlint/testing` — `base` plus `vitest` and `playwright`.
- `@zap-studio/oxlint/full` — `react` and `testing` combined.

## Cherry-picking rules

Every preset also exports its constituent pieces, so you can build your own combination instead of taking a whole preset:

```ts
import { defineConfig } from "oxlint";
import { basePlugins, baseJsPlugins, baseRules } from "@zap-studio/oxlint/base";
import { reactPlugins, reactJsPlugins, reactRules } from "@zap-studio/oxlint/react";

export default defineConfig({
  plugins: [...basePlugins, ...reactPlugins],
  jsPlugins: [...baseJsPlugins, ...reactJsPlugins],
  rules: { ...baseRules, ...reactRules, "react-doctor/no-barrel-import": "off" },
});
```

## License

MIT. The bundled `anti-slop` plugin (`@zap-studio/oxlint/anti-slop`) ships under its own MIT license — see [`src/anti-slop/LICENSE`](./src/anti-slop/LICENSE).
