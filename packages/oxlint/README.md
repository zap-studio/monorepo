# @zap-studio/oxlint

Zap Studio's [oxlint](https://oxc.rs/docs/guide/usage/linter.html) preset — composable rule sets built from vetted ESLint plugins, plus a bundled `anti-slop` plugin.

`oxlint`'s zero-config only covers its own bundled rules. This package picks up from there: a preset per framework and library, ready to `extends` in one line, so you get useful linting for your stack without assembling plugins by hand.

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

### Core Chain

| Preset                              | Built on | Adds                                                                                                                                        |
| ----------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `@zap-studio/oxlint/base`           | —        | `eslint`, `typescript`, `unicorn`, `oxc`, `import`, `jsdoc`, `node`, `promise`, plus `regexp`, `sonarjs`, `github`, `e18e`, and `anti-slop` |
| `@zap-studio/oxlint/react`          | `base`   | `react`, `react-perf`, `jsx-a11y`, and the framework-agnostic core of `react-doctor`                                                        |
| `@zap-studio/oxlint/react-compiler` | `react`  | the `react/react-compiler` rule, for projects on the React Compiler                                                                         |
| `@zap-studio/oxlint/testing`        | `base`   | `vitest` and `playwright`                                                                                                                   |

### Framework & Library Leaves

Each of these extends `react` and adds only that integration's slice of `react-doctor` — no shared plugins to configure, just the rules for the surface you're actually using.

| Preset                                 | Targets                                                                                                                                                            |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `@zap-studio/oxlint/nextjs`            | Next.js — App Router, metadata, route handlers, `Image`/`Script`/`Head`                                                                                            |
| `@zap-studio/oxlint/react-router`      | React Router — loaders, actions, middleware, splat and nested routes                                                                                               |
| `@zap-studio/oxlint/react-native`      | React Native/Expo — lists, `Pressable`, Reanimated, deprecated modules                                                                                             |
| `@zap-studio/oxlint/remotion`          | Remotion — deterministic rendering, `delayRender`, CSS animation bans                                                                                              |
| `@zap-studio/oxlint/preact`            | Preact — API differences from React (`render` args, hooks import, `children`)                                                                                      |
| `@zap-studio/oxlint/ink`               | Ink — terminal rendering, raw mode, `Static`, focus handling                                                                                                       |
| `@zap-studio/oxlint/r3f`               | React Three Fiber                                                                                                                                                  |
| `@zap-studio/oxlint/three`             | three.js                                                                                                                                                           |
| `@zap-studio/oxlint/motion`            | Motion (Framer Motion) — `AnimatePresence`, imperative animation, layout ids                                                                                       |
| `@zap-studio/oxlint/redux`             | Redux — `useSelector` derivation and return-value pitfalls                                                                                                         |
| `@zap-studio/oxlint/zustand`           | Zustand — selector freshness, store mutation, whole-store destructuring                                                                                            |
| `@zap-studio/oxlint/valtio`            | Valtio — proxy reads and snapshots                                                                                                                                 |
| `@zap-studio/oxlint/mobx`              | MobX — `observer`/`memo` interaction, `makeAutoObservable`, reaction disposal                                                                                      |
| `@zap-studio/oxlint/jotai`             | Jotai — derived atoms, `selectAtom` placement                                                                                                                      |
| `@zap-studio/oxlint/styled-components` | styled-components — duplicate CSS properties, transient props                                                                                                      |
| `@zap-studio/oxlint/tanstack`          | TanStack Query and TanStack Router — brings its own plugins (`@tanstack/eslint-plugin-query`, `@tanstack/eslint-plugin-router`) alongside its `react-doctor` slice |

`nextjs-react-compiler` and `tanstack-react-compiler` extend `react-compiler` instead of `react`, then layer the same `nextjs`/`tanstack` rules on top — use one of these instead of `nextjs`/`tanstack` if your project is also on the React Compiler. There's no `react-compiler` variant for every other leaf — combine `react-compiler`'s rules with a leaf's rules yourself via [cherry-picking](#cherry-picking-rules) if you need one.

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
