# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0]

### Added

Initial release, extracted from the monorepo's own `oxfmt.config.ts`.

- Two composable presets: `base` and `tailwind` (`tailwind` builds on `base`, adding `sortTailwindcss: true`).
- `base` sorts imports (reusing this monorepo's own group order) and sorts `package.json` keys and `scripts` alphabetically.
