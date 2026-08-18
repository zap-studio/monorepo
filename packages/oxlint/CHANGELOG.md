# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
