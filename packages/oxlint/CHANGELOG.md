# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0]

### Added

Initial release, extracted from the monorepo's own `oxlint.config.ts`.

- Six composable presets: `base`, `react`, `react-compiler`, `tanstack`, `tanstack-react-compiler`, `testing`. Each `extends` the one before it — no bundled "everything" preset.
- Exhaustive per-plugin rule coverage for `eslint-plugin-regexp`, `eslint-plugin-sonarjs`, `eslint-plugin-github`, `@e18e/eslint-plugin`, `eslint-plugin-playwright`, `oxlint-plugin-react-doctor`, `@tanstack/eslint-plugin-query`, and `@tanstack/eslint-plugin-router` — every upstream rule is present, on or explicitly `"off"` with a reason.
- A bundled `anti-slop` plugin (`@zap-studio/oxlint/anti-slop`), loaded as raw TypeScript so it works under oxlint's native TS support without a build step.
- Every preset also exports its raw `plugins`/`jsPlugins`/`rules` pieces for cherry-picking instead of taking the whole preset.
