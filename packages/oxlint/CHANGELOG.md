# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.2.1]

### Fixed

- `@zap-studio/oxlint/react-compiler` no longer references the nursery `react/react-compiler` rule, which oxlint 1.79.0 removed in favor of 22 category-specific rules (`react/purity`, `react/immutability`, `react/hooks`, `react/set-state-in-render`, ...) — see [oxc's React Compiler support announcement](https://oxc.rs/blog/2026-08-18-react-compiler-support). The old rule name made every preset extending this one fail to parse under the pinned `oxlint` peer version; the preset now declares all 22 replacement rules directly.

## [2.2.0]

### Added

- `@zap-studio/oxlint` (the package root) now re-exports every preset by name — `import { base, react, reactDoctor } from "@zap-studio/oxlint"` — as a tree-shakeable alternative to the per-preset subpath imports (`@zap-studio/oxlint/react`, etc.), which are unchanged and still work.
- `scripts/verify-presets.mjs` now derives its file list from `package.json#exports` instead of scanning `dist/*.js`, so it validates exactly the public presets and ignores internal bundler-generated chunk files (bundling the new root barrel causes shared code to split into chunks like `base-XXXXXXXX.js`, which aren't standalone `defineConfig` exports and were never meant to be loaded via `oxlint -c`).

## [2.1.0]

### Added

Seven new leaf presets, each exclusive-owner of its own plugin's rules — none extend another preset or each other:

- `@zap-studio/oxlint/stylex` — `@stylexjs/eslint-plugin`'s full 9-rule catalog (`valid-styles`, `valid-shorthands`, `no-nonstandard-styles`, `no-conflicting-props` as `error`; `no-unused`, `no-legacy-contextual-styles`, `no-lookahead-selectors`, `sort-keys`, `enforce-extension` as `warn`).
- `@zap-studio/oxlint/tailwindcss` — `eslint-plugin-tailwindcss` (Tailwind CSS v4). `no-contradicting-classname` as `error`; ordering/arbitrary-value consistency rules as `warn`; `no-arbitrary-value` and `no-custom-classname` left `off` (too disruptive/needs project-specific config as shared defaults).
- `@zap-studio/oxlint/testing-library` — `eslint-plugin-testing-library`'s framework-agnostic `dom` rule set: async/query-await correctness as `error`, `no-debugging-utils`/`prefer-user-event*` as `warn`, framework-specific (React/Vue/Svelte-only) and no-op-without-config rules left `off`.
- `@zap-studio/oxlint/jest-dom` — `eslint-plugin-jest-dom`'s matcher-preference rules (works under both Jest and Vitest's jest-dom-compatible `expect`); 11 of 12 rules `error`, `prefer-pressed` `warn` pending upstream's own recommended-config promotion.
- `@zap-studio/oxlint/cypress` — `eslint-plugin-cypress`; command-queue and CI-hang correctness rules as `error`, situational rules as `warn`, `no-xpath` and `require-data-selectors` left `off`.
- `@zap-studio/oxlint/storybook` — `eslint-plugin-storybook`'s `recommended` + `csf` + `csf-strict` rules: broken-story/CSF-shape/deprecated-API rules as `error`, naming and organizational conventions as `warn`.
- `@zap-studio/oxlint/solid` — `eslint-plugin-solid`; reactivity-breaking and XSS-risk rules as `error`, JSX-style conventions as `warn`. Not a `react-doctor` slice — Solid's reactivity model and JSX transform are its own, and it isn't compatible with the `jsx-runtime-automatic`/`jsx-runtime-classic` presets.

`@graphql-eslint/eslint-plugin` was evaluated and intentionally not added: it requires its own GraphQL-AST parser and a template-literal processor, neither of which oxlint's `jsPlugins` bridge supports (it loads plain ESLint rule objects operating on the JS/TS AST only).

### Fixed

- `react-a11y`: removed `jsx-a11y/aria-braille-equivalent`. It's part of upstream `eslint-plugin-jsx-a11y`'s rule catalog but isn't implemented in oxlint's native `jsx_a11y` port in any oxlint version published to date (checked `1.78.0` and `1.79.0` via `oxlint --print-config`) — oxlint reimplements a subset of `jsx-a11y`'s rules in Rust, not the full upstream set. Config parsing hard-fails on any unknown rule name regardless of severity, so `"off"` wasn't an option either — the entry had to come out entirely. This preset previously crashed every consumer that extended it, since oxlint refuses to parse the whole config on one unresolvable rule.

### Added

- `scripts/verify-presets.mjs` + a `verify` package script, wired into `prepublishOnly` — a pre-publish gate that runs `oxlint --print-config` against every built preset (`dist/*.js`) using the installed `oxlint`, and fails the build if any preset's rules or jsPlugin specifiers don't resolve. This is what should have caught the `aria-braille-equivalent` bug before it ever published; it now runs automatically on every `npm publish` of this package.
- A "Compatibility" section in the README documenting the coupling between this package's native-plugin-referencing presets and the installed `oxlint` binary version, and pointing at `scripts/verify-presets.mjs` as the source of truth for what's actually verified.

## [2.0.0]

### Changed

- `oxlint-plugin-react-doctor`'s framework-agnostic core no longer duplicates rules already owned by `react`, `react-perf`, and `jsx-a11y` — roughly 90 rules (`button-has-type`, the `jsx-a11y` alt-text/aria/role catalog, all 4 `react-perf` prop-identity checks, and more) were removed from `react-doctor` and now live exclusively in the plugin that originates them.
- Every framework and library leaf preset now owns its own `_rules-react-doctor-*.ts` slice and pulls in `react-doctor` directly, instead of relying on a shared, overlapping rule map.
- `testing` (the combined `vitest` + `eslint-plugin-playwright` preset) is removed — `vitest` and `playwright` are now standalone presets, composed independently.
- `nextjs-react-compiler` is removed — compose `nextjs` and `react-compiler` directly instead.

### Removed

- The `tanstack` leaf preset is removed, split into two independent presets:
  - `@zap-studio/oxlint/tanstack-query` — now bundles `@tanstack/eslint-plugin-query` together with `react-doctor`'s 9 query-pattern rules (floating mutations, missing invalidation, unstable query clients).
  - `@zap-studio/oxlint/tanstack-start` — carries `react-doctor`'s 15 meta-framework rules (loaders, route property order, server functions, secrets in loaders).
- `tanstack-react-compiler` is removed — compose `tanstack-query`/`tanstack-start` and `react-compiler` directly instead.

## [1.0.1]

### Fixed

- `@zap-studio/oxlint/anti-slop` now ships as a compiled `dist/anti-slop/index.js` instead of raw `src/anti-slop/index.ts`. The previous raw-source export crashed with `ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING` for any real (non-workspace) consumer, since Node's default type-stripping refuses `.ts` files resolved from inside `node_modules` — this broke `base` (and therefore every preset that extends it) for every external install.

## [1.0.0]

### Added

Initial release, extracted from the monorepo's own `oxlint.config.ts`.

- A core chain of composable presets: `base`, `react`, `react-compiler`, `testing`. Each `extends` the one before it — no bundled "everything" preset.
- Sixteen framework- and library-specific leaf presets, each extending `react`: `nextjs` (and `nextjs-react-compiler`), `react-router`, `react-native`, `remotion`, `preact`, `ink`, `r3f`, `three`, `motion`, `redux`, `zustand`, `valtio`, `mobx`, `jotai`, `styled-components`, and `tanstack` (and `tanstack-react-compiler`, which also brings `@tanstack/eslint-plugin-query` and `@tanstack/eslint-plugin-router`).
- Exhaustive per-plugin rule coverage for `eslint-plugin-regexp`, `eslint-plugin-sonarjs`, `eslint-plugin-github`, `@e18e/eslint-plugin`, `eslint-plugin-playwright`, `oxlint-plugin-react-doctor`, `@tanstack/eslint-plugin-query`, and `@tanstack/eslint-plugin-router` — every upstream rule is present, on or explicitly `"off"` with a reason.
- A bundled `anti-slop` plugin (`@zap-studio/oxlint/anti-slop`), loaded as raw TypeScript so it works under oxlint's native TS support without a build step.
- Every preset also exports its raw `plugins`/`jsPlugins`/`rules` pieces for cherry-picking instead of taking the whole preset.
