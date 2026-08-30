# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.2.1]

### Fixed

- `@zap-studio/oxlint/react-compiler` no longer uses the nursery `react/react-compiler` rule. oxlint 1.79.0 removed this rule and replaced it with 22 rules, one per category (`react/purity`, `react/immutability`, `react/hooks`, `react/set-state-in-render`, and more) — see [oxc's React Compiler support announcement](https://oxc.rs/blog/2026-08-18-react-compiler-support). The old rule name broke every preset that extends this one, under the pinned `oxlint` peer version. The preset now lists all 22 new rules directly.

## [2.2.0]

### Added

- `@zap-studio/oxlint` (the package root) now re-exports every preset by name: `import { base, react, reactDoctor } from "@zap-studio/oxlint"`. This is a tree-shakeable alternative to the per-preset subpath imports (`@zap-studio/oxlint/react`, and so on). Those subpath imports still work, with no change.
- `scripts/verify-presets.mjs` now gets its file list from `package.json#exports`, instead of scanning `dist/*.js`. So it checks only the public presets, and skips internal bundler chunk files. Bundling the new root barrel splits shared code into chunks like `base-XXXXXXXX.js`. These chunks are not standalone `defineConfig` exports, and were never meant to load through `oxlint -c`.

## [2.1.0]

### Added

Seven new leaf presets. Each one owns its own plugin's rules alone. None of them extend another preset, or each other:

- `@zap-studio/oxlint/stylex` — all 9 rules from `@stylexjs/eslint-plugin`. `valid-styles`, `valid-shorthands`, `no-nonstandard-styles`, and `no-conflicting-props` are `error`. `no-unused`, `no-legacy-contextual-styles`, `no-lookahead-selectors`, `sort-keys`, and `enforce-extension` are `warn`.
- `@zap-studio/oxlint/tailwindcss` — `eslint-plugin-tailwindcss` for Tailwind CSS v4. `no-contradicting-classname` is `error`. The ordering and arbitrary-value rules are `warn`. `no-arbitrary-value` and `no-custom-classname` stay `off`, because they need project-specific config and are too disruptive as shared defaults.
- `@zap-studio/oxlint/testing-library` — the framework-agnostic `dom` rule set from `eslint-plugin-testing-library`. Async and query-await correctness rules are `error`. `no-debugging-utils` and `prefer-user-event*` are `warn`. Framework-specific rules (React, Vue, Svelte only) and rules that do nothing without extra config stay `off`.
- `@zap-studio/oxlint/jest-dom` — the matcher-preference rules from `eslint-plugin-jest-dom`. It works with both Jest and Vitest's jest-dom-compatible `expect`. 11 of 12 rules are `error`. `prefer-pressed` is `warn`, until upstream moves it into its own recommended config.
- `@zap-studio/oxlint/cypress` — `eslint-plugin-cypress`. Command-queue and CI-hang correctness rules are `error`. Situational rules are `warn`. `no-xpath` and `require-data-selectors` stay `off`.
- `@zap-studio/oxlint/storybook` — the `recommended`, `csf`, and `csf-strict` rules from `eslint-plugin-storybook`. Rules for a broken story, a wrong CSF shape, or a deprecated API are `error`. Naming and organization rules are `warn`.
- `@zap-studio/oxlint/solid` — `eslint-plugin-solid`. Rules for broken reactivity or XSS risk are `error`. JSX style rules are `warn`. This is not a `react-doctor` slice: Solid has its own reactivity model and JSX transform, and does not work with the `jsx-runtime-automatic`/`jsx-runtime-classic` presets.

We looked at `@graphql-eslint/eslint-plugin` and chose not to add it. It needs its own GraphQL-AST parser and a template-literal processor. oxlint's `jsPlugins` bridge supports neither: it can only load plain ESLint rule objects that work on the JS/TS AST.

### Fixed

- `react-a11y`: removed `jsx-a11y/aria-braille-equivalent`. This rule is part of the upstream `eslint-plugin-jsx-a11y` rule set. But oxlint's native `jsx_a11y` port does not implement it, in any oxlint version out today — checked in `1.78.0` and `1.79.0` with `oxlint --print-config`. oxlint only reimplements part of `jsx-a11y`'s rules in Rust, not the full set. oxlint's config parser fails hard on any unknown rule name, no matter its severity, so setting it to `"off"` was not an option either. The entry had to come out completely. Before this fix, this preset crashed every consumer that extended it, because oxlint refuses to parse the whole config when one rule name can't be resolved.

### Added

- Added `scripts/verify-presets.mjs` and a `verify` package script, run from `prepublishOnly`. This pre-publish check runs `oxlint --print-config` on every built preset (`dist/*.js`), using the installed `oxlint`. It fails the build if any preset's rules or jsPlugin specifiers do not resolve. This check should have caught the `aria-braille-equivalent` bug before it was ever published. Now it runs automatically on every `npm publish` of this package.
- Added a "Compatibility" section to the README. It explains how the presets that reference native plugins depend on the installed `oxlint` binary version, and points to `scripts/verify-presets.mjs` as the source of truth for what is actually checked.

## [2.0.0]

### Changed

- The framework-agnostic core of `oxlint-plugin-react-doctor` no longer copies rules already owned by `react`, `react-perf`, and `jsx-a11y`. About 90 rules — `button-has-type`, the `jsx-a11y` alt-text/aria/role rules, all 4 `react-perf` prop-identity checks, and more — are removed from `react-doctor`. They now live only in the plugin that first defined them.
- Every framework and library leaf preset now has its own `_rules-react-doctor-*.ts` file, and pulls in `react-doctor` directly. Before, they shared one overlapping rule map.
- Removed `testing` (the combined `vitest` + `eslint-plugin-playwright` preset). `vitest` and `playwright` are now separate presets. Compose them yourself.
- Removed `nextjs-react-compiler`. Compose `nextjs` and `react-compiler` directly instead.

### Removed

- Removed the `tanstack` leaf preset. It is now split into two presets:
  - `@zap-studio/oxlint/tanstack-query` — bundles `@tanstack/eslint-plugin-query` with `react-doctor`'s 9 query-pattern rules (floating mutations, missing invalidation, unstable query clients).
  - `@zap-studio/oxlint/tanstack-start` — carries `react-doctor`'s 15 meta-framework rules (loaders, route property order, server functions, secrets in loaders).
- Removed `tanstack-react-compiler`. Compose `tanstack-query`/`tanstack-start` and `react-compiler` directly instead.

## [1.0.1]

### Fixed

- `@zap-studio/oxlint/anti-slop` now ships as a compiled `dist/anti-slop/index.js`, not the raw `src/anti-slop/index.ts`. The raw-source export used to crash with `ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING` for any real, non-workspace consumer. Node's default type-stripping refuses `.ts` files resolved from inside `node_modules`. This broke `base`, and every preset that extends it, for every external install.

## [1.0.0]

### Added

Initial release, extracted from the monorepo's own `oxlint.config.ts`.

- A core chain of composable presets: `base`, `react`, `react-compiler`, `testing`. Each one `extends` the one before it. There is no bundled "everything" preset.
- Sixteen framework- and library-specific leaf presets, each extending `react`: `nextjs` (and `nextjs-react-compiler`), `react-router`, `react-native`, `remotion`, `preact`, `ink`, `r3f`, `three`, `motion`, `redux`, `zustand`, `valtio`, `mobx`, `jotai`, `styled-components`, and `tanstack` (and `tanstack-react-compiler`, which also adds `@tanstack/eslint-plugin-query` and `@tanstack/eslint-plugin-router`).
- Full rule coverage for `eslint-plugin-regexp`, `eslint-plugin-sonarjs`, `eslint-plugin-github`, `@e18e/eslint-plugin`, `eslint-plugin-playwright`, `oxlint-plugin-react-doctor`, `@tanstack/eslint-plugin-query`, and `@tanstack/eslint-plugin-router`. Every upstream rule is present: either on, or explicitly `"off"` with a reason.
- A bundled `anti-slop` plugin (`@zap-studio/oxlint/anti-slop`). It loads as raw TypeScript, so it works with oxlint's native TS support and needs no build step.
- Every preset also exports its raw `plugins`/`jsPlugins`/`rules` pieces, so you can pick parts instead of taking the whole preset.
