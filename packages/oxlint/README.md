# @zap-studio/oxlint

Zap Studio's [oxlint](https://oxc.rs/docs/guide/usage/linter.html) preset — exclusive, single-owner rule sets built from vetted ESLint plugins, plus a bundled `anti-slop` plugin.

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
import { defineConfig } from "oxlint";
import {
  base,
  react,
  reactA11y,
  reactDoctor,
  jsxRuntimeAutomatic,
  nextjs,
} from "@zap-studio/oxlint";

export default defineConfig({
  extends: [base, react, reactA11y, reactDoctor, jsxRuntimeAutomatic, nextjs],
});
```

This is more imports than a bundled "one big preset" would need — that's the tradeoff for never getting rules you didn't ask for. `base` is the one exception: it's the JS/TS correctness and security baseline every project wants regardless of framework, so it stays a single preset instead of splitting into a dozen one-plugin imports.

Every preset is also reachable by its own subpath, if you'd rather import one preset per line instead of destructuring the root:

```ts
import { defineConfig } from "oxlint";
import base from "@zap-studio/oxlint/base";
import react from "@zap-studio/oxlint/react";

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

## `base`

The only bundled preset — assumes no runtime, no framework, no UI library. Safe as a baseline for any JS/TS project: a Node CLI, a browser library, a React app, all get the same core.

| Preset                    | Adds                                                                                                                                                               |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `@zap-studio/oxlint/base` | `eslint`, `typescript`, `unicorn`, `oxc`, `import`, `promise`, plus `regexp`, `sonarjs`, `github`, `e18e`, and the bundled [`anti-slop`](/oxlint/anti-slop) plugin |

## React

Five independent presets — pick every one your project needs. None of them imply another; `react` alone gets you hooks correctness only, nothing about accessibility, performance, or React-Doctor's broader rule catalog.

| Preset                              | Owns                                                                                                                                                                                            |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@zap-studio/oxlint/react`          | the `react` plugin — `rules-of-hooks`, `exhaustive-deps`                                                                                                                                        |
| `@zap-studio/oxlint/react-a11y`     | the `jsx-a11y` plugin, plus 4 accessibility checks from `eslint-plugin-github` with no jsx-a11y equivalent                                                                                      |
| `@zap-studio/oxlint/react-perf`     | the `react-perf` plugin — the 4 `jsx-no-new-*-as-prop` rules                                                                                                                                    |
| `@zap-studio/oxlint/react-doctor`   | `oxlint-plugin-react-doctor`'s framework-agnostic rules — security, hydration, effect-timing, rendering correctness — minus everything already owned by `react`/`react-a11y`/`react-perf` above |
| `@zap-studio/oxlint/react-compiler` | the `react/react-compiler` rule, for projects on the React Compiler                                                                                                                             |

### JSX runtime

`react-in-jsx-scope` depends on which JSX transform your project uses, so it isn't bundled into `react` — pick exactly one:

| Preset                                     | Sets                                                                                                                             |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| `@zap-studio/oxlint/jsx-runtime-automatic` | `react/react-in-jsx-scope: "off"` — for `jsx: "react-jsx"` (the default in modern React/Next.js/Vite/Preact/React Native setups) |
| `@zap-studio/oxlint/jsx-runtime-classic`   | `react/react-in-jsx-scope: "warn"` — for projects still on the classic transform                                                 |

## Framework & library leaves

Each of these owns only its own slice of `oxlint-plugin-react-doctor`'s framework-specific rules. None of them pull in `react`, `react-a11y`, `react-perf`, or `react-doctor` — add those yourself if you want them (you almost always do, for anything that renders JSX).

| Preset                                 | Targets                                                                                                                                                                 |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@zap-studio/oxlint/nextjs`            | Next.js — App Router, metadata, route handlers, `Image`/`Script`/`Head`                                                                                                 |
| `@zap-studio/oxlint/react-router`      | React Router — loaders, actions, middleware, splat and nested routes                                                                                                    |
| `@zap-studio/oxlint/react-native`      | React Native/Expo — lists, `Pressable`, Reanimated, deprecated modules                                                                                                  |
| `@zap-studio/oxlint/remotion`          | Remotion — deterministic rendering, `delayRender`, CSS animation bans                                                                                                   |
| `@zap-studio/oxlint/preact`            | Preact — API differences from React (`render` args, hooks import, `children`)                                                                                           |
| `@zap-studio/oxlint/solid`             | Solid — `eslint-plugin-solid`'s reactivity/JSX rules (props destructuring, `no-innerhtml`, `prefer-for`); not a react-doctor slice, Solid's reactivity model is its own |
| `@zap-studio/oxlint/ink`               | Ink — terminal rendering, raw mode, `Static`, focus handling                                                                                                            |
| `@zap-studio/oxlint/r3f`               | React Three Fiber                                                                                                                                                       |
| `@zap-studio/oxlint/three`             | three.js                                                                                                                                                                |
| `@zap-studio/oxlint/motion`            | Motion (Framer Motion) — `AnimatePresence`, imperative animation, layout ids                                                                                            |
| `@zap-studio/oxlint/redux`             | Redux — `useSelector` derivation and return-value pitfalls                                                                                                              |
| `@zap-studio/oxlint/zustand`           | Zustand — selector freshness, store mutation, whole-store destructuring                                                                                                 |
| `@zap-studio/oxlint/valtio`            | Valtio — proxy reads and snapshots                                                                                                                                      |
| `@zap-studio/oxlint/mobx`              | MobX — `observer`/`memo` interaction, `makeAutoObservable`, reaction disposal                                                                                           |
| `@zap-studio/oxlint/jotai`             | Jotai — derived atoms, `selectAtom` placement                                                                                                                           |
| `@zap-studio/oxlint/styled-components` | styled-components — duplicate CSS properties, transient props                                                                                                           |
| `@zap-studio/oxlint/stylex`            | StyleX — `@stylexjs/eslint-plugin`'s full rule set: valid/standard styles, unsafe shorthands, unused styles, conflicting props                                          |
| `@zap-studio/oxlint/tailwindcss`       | Tailwind CSS v4 — `eslint-plugin-tailwindcss`'s contradicting/unnecessary-arbitrary-value and class-order rules                                                         |
| `@zap-studio/oxlint/tanstack-query`    | TanStack Query — `@tanstack/eslint-plugin-query` plus `react-doctor`'s 9 query-pattern rules (floating mutations, missing invalidation, unstable query clients)         |
| `@zap-studio/oxlint/tanstack-start`    | TanStack Start — `react-doctor`'s 15 meta-framework rules (loaders, route property order, server functions, secrets in loaders)                                         |
| `@zap-studio/oxlint/tanstack-router`   | TanStack Router — `@tanstack/eslint-plugin-router`                                                                                                                      |

Preact and React Native are runtime-ambiguous — combine either with `jsx-runtime-automatic` or `jsx-runtime-classic` depending on your project's transform. Solid uses its own JSX transform (`babel-preset-solid`), not React's, so neither `jsx-runtime` preset applies to it.

## Opt-in environment presets

Not every project runs in Node or wants JSDoc type-annotation rules enforced (redundant once you're on TypeScript, which `base` already assumes) — these stay separate from `base` for that reason:

| Preset                     | Adds                                                        |
| -------------------------- | ----------------------------------------------------------- |
| `@zap-studio/oxlint/jsdoc` | the `jsdoc` plugin — for JS (or intentionally-untyped) code |
| `@zap-studio/oxlint/node`  | the `node` plugin — for code that actually runs under Node  |

## Testing

Split by test runner and testing library — take the one(s) you actually use, none of them imply another:

| Preset                               | Adds                                                                                                        |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| `@zap-studio/oxlint/vitest`          | the `vitest` plugin                                                                                         |
| `@zap-studio/oxlint/playwright`      | `eslint-plugin-playwright`                                                                                  |
| `@zap-studio/oxlint/cypress`         | `eslint-plugin-cypress`                                                                                     |
| `@zap-studio/oxlint/testing-library` | `eslint-plugin-testing-library`'s framework-agnostic DOM query/async rules                                  |
| `@zap-studio/oxlint/jest-dom`        | `eslint-plugin-jest-dom` — its matcher rules work under both Jest and Vitest's jest-dom-compatible `expect` |

## Storybook

| Preset                         | Adds                                                                    |
| ------------------------------ | ----------------------------------------------------------------------- |
| `@zap-studio/oxlint/storybook` | `eslint-plugin-storybook`'s story-file correctness and CSF-format rules |

## Composing your own rules

Every preset is already just `plugins`/`jsPlugins`/`rules` wrapped in `defineConfig` — import the named exports directly instead of the default if you want to merge pieces by hand or override one rule from a large preset like `react-doctor`:

```ts
import { defineConfig } from "oxlint";
import { basePlugins, baseJsPlugins, baseRules } from "@zap-studio/oxlint/base";
import { reactDoctorJsPlugins, reactDoctorRulesFinal } from "@zap-studio/oxlint/react-doctor";

export default defineConfig({
  plugins: basePlugins,
  jsPlugins: [...baseJsPlugins, ...reactDoctorJsPlugins],
  rules: { ...baseRules, ...reactDoctorRulesFinal, "react-doctor/no-barrel-import": "off" },
});
```

## License

MIT. The bundled `anti-slop` plugin (`@zap-studio/oxlint/anti-slop`) ships under its own MIT license — see [`src/anti-slop/LICENSE`](./src/anti-slop/LICENSE).
