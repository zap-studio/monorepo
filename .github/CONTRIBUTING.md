# Contributing

Thanks for contributing to Zap Studio.

## Before you start

- Use the issue forms for reproducible bugs and concrete feature requests.
- Use GitHub Discussions for questions and general support.
- For larger API or architecture changes, open an issue or discussion first so the direction is clear before implementation.

## Setup

This repository uses [pnpm](https://pnpm.io) as its package manager. Other package managers are not supported here — the lockfile is `pnpm-lock.yaml`.

1. Install pnpm: `corepack enable` (uses the `packageManager` field in `package.json`), or `npm install -g pnpm`.
2. Fork the repository.
3. Clone your fork.
4. Install dependencies from the repository root:

```bash
pnpm install
```

## Repository layout

- `apps/`
- `packages/`
- `configs/`

## Local checks

Run this from the repo root before you open a pull request. It runs the format check, typecheck, lint, unused-code check, tests, and build:

```bash
pnpm run publish:check
```

The browser tests need Chromium once:

```bash
pnpm exec playwright install --with-deps chromium
```

You can also run a single step while you work: `pnpm run typecheck`, `pnpm run lint`, `pnpm run test`, or `pnpm run build`. To run the tests of one package only, pass its path: `pnpm run test packages/fetch`. To run a script of one workspace, use `pnpm --filter <name> run <script>`.

## Issues

Useful issues are specific and reproducible.

- For bugs, include the affected package, version, runtime, steps to reproduce, and the expected versus actual behavior.
- For feature requests, describe the problem first, then the proposed solution.

## Change expectations

- Keep changes focused and reviewable.
- Update docs when user-facing behavior or APIs change.
- Add or update tests when behavior changes.
- Do not include unrelated refactors in the same PR unless they are necessary.

## Pull requests

PRs should clearly state:

- what changed
- why it changed
- how it was validated
- whether it is breaking

Link related issues or discussions when relevant.

If your change affects a published package API or behavior, include docs updates in the same PR.

## Security

Do not report vulnerabilities through public issues or pull requests. Follow [SECURITY.md](./SECURITY.md) instead.
