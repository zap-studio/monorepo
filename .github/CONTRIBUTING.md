# Contributing

Thanks for contributing to Zap Studio.

## Before you start

- Use the issue forms for reproducible bugs and concrete feature requests.
- Use GitHub Discussions or Discord for questions and general support.
- For larger API or architecture changes, open an issue or discussion first so
  the direction is clear before implementation.

## Setup

1. Fork the repository.
2. Clone your fork.
3. Install dependencies from the repository root:

```bash
vp install
```

## Repository layout

- `packages/fetch`
- `packages/permit`
- `packages/validation`
- `packages/webhooks`
- `apps/docs`
- `configs/`

## Local checks

Run these from the repo root:

```bash
vp run validate
vp run build
```

If you are changing one package, prefer the relevant package or app target via
`vp run`.

## Issues

Useful issues are specific and reproducible.

- For bugs, include the affected package, version, runtime, steps to reproduce,
  and the expected versus actual behavior.
- For feature requests, describe the problem first, then the proposed solution.
- Do not use public issues for security vulnerabilities. Follow `SECURITY.md`.

## Change expectations

- Keep changes focused and reviewable.
- Update docs when user-facing behavior or APIs change.
- Add or update tests when behavior changes.
- Do not include unrelated refactors in the same PR unless they are necessary.

## Releases

If your change affects a published package, add a changeset:

```bash
vp exec changeset
```

Write the changeset from the user or package-consumer perspective.

## Pull requests

PRs should clearly state:

- what changed
- why it changed
- how it was validated
- whether it is breaking

Link related issues or discussions when relevant.

If your change affects a published package API or behavior, include docs and
changeset updates in the same PR.

## Security

Do not report vulnerabilities through public issues or pull requests. Follow [SECURITY.md](./SECURITY.md) instead.
