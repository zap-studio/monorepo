# @zap-studio/oxlint

Zap Studio's [oxlint](https://oxc.rs/docs/guide/usage/linter.html) preset — composable rule sets built from vetted ESLint plugins, plus a bundled `anti-slop` plugin.

Every plugin's full upstream rule list is covered: each rule is either turned on or explicitly set to `"off"` with a comment explaining why, so nothing is silently missing.

## Installation

```bash
npm install --save-dev @zap-studio/oxlint oxlint
```

`oxlint` is a peer dependency — install the version you want to run. If you use the `typeAware`/`typeCheck` options from `base`, also install `oxlint-tsgolint`.

## Usage

Pick the preset that matches your project and `extends` it from `oxlint.config.ts`:

```ts
import { defineConfig } from "oxlint";
import zapStudio from "@zap-studio/oxlint/react";

export default defineConfig({
  extends: [zapStudio],
});
```

Need more than one rule set? `extends` accepts an array — each preset already includes everything up its own chain (e.g. `tanstack` already includes `react`, so you never need to list both):

```ts
import { defineConfig } from "oxlint";
import react from "@zap-studio/oxlint/react";
import testing from "@zap-studio/oxlint/testing";

export default defineConfig({
  extends: [react, testing],
});
```

`extends` merges `rules` key-by-key and unions `plugins`/`jsPlugins`, so anything you add to your own `rules` after `extends` overrides the preset — no need to fork it to change or disable a single rule:

```ts
export default defineConfig({
  extends: [zapStudio],
  rules: {
    "sonarjs/cognitive-complexity": "off",
  },
});
```

## Presets

| Preset                                       | Built on         | Adds                                                                                                                                        |
| -------------------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `@zap-studio/oxlint/base`                    | —                | `eslint`, `typescript`, `unicorn`, `oxc`, `import`, `jsdoc`, `node`, `promise`, plus `regexp`, `sonarjs`, `github`, `e18e`, and `anti-slop` |
| `@zap-studio/oxlint/react`                   | `base`           | `react`, `react-perf`, `jsx-a11y`, and `react-doctor`                                                                                       |
| `@zap-studio/oxlint/react-compiler`          | `react`          | the `react/react-compiler` rule, for projects on the React Compiler                                                                         |
| `@zap-studio/oxlint/tanstack`                | `react`          | TanStack Query and TanStack Router rules                                                                                                    |
| `@zap-studio/oxlint/tanstack-react-compiler` | `react-compiler` | TanStack Query and Router rules, for projects on both                                                                                       |
| `@zap-studio/oxlint/testing`                 | `base`           | `vitest` and `playwright`                                                                                                                   |

There's no bundled "everything" preset on purpose — pick the leaf preset(s) that match your project (and stack them with `extends` if you need more than one branch, e.g. `react` + `testing`).

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
