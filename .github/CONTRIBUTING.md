# Contributing to Zap Studio

Thank you for your interest in contributing to Zap Studio! We welcome all contributions, whether you're fixing bugs, improving documentation, or adding new features.

## Getting Started

1. **Fork the repository**
   - Click the "Fork" button on GitHub to create your own copy.
2. **Clone your fork**
   - `git clone https://github.com/<your-username>/monorepo.git`
   - `cd monorepo`
   - `git remote add upstream https://github.com/zap-studio/monorepo.git`
3. **Create a new branch**
   - `git checkout -b my-feature-branch`

## Setting Up the Monorepo

1. **Install dependencies**
   - Run `pnpm install` from the root directory to install all packages.

> If Lefthook blocks your commit, you may use `git commit --no-verify` and/or `git push --no-verify`, but this is discouraged and may reduce the chance of your PR being merged.

## Project Structure

- **`packages/fetch`** - Modern HTTP client (`@zap-studio/fetch`)
- **`packages/waitlist`** - Waitlist management (`@zap-studio/waitlist`)
- **`packages/webhooks`** - Webhook handling (`@zap-studio/webhooks`)
- **`apps/docs`** - Documentation site (VitePress)
- **`configs/`** - Shared configurations (TypeScript, tsdown, vitest)

## Running Tests

- Run `pnpm run test` from the root to test all packages.
- Run `pnpm run test:coverage` to generate coverage reports.

## Making Changes

- Make your changes in a dedicated branch.
- Ensure your code passes all checks and tests.

## Opening a Pull Request

1. **Push your branch**
   - `git push origin my-feature-branch`
2. **Open a PR**
   - Go to your fork on GitHub and click "Compare & pull request".
   - Fill out the PR template and describe your changes.

## Review Process

- Your PR will be reviewed by maintainers.
- Address any requested changes.
- Once approved, your PR will be merged.

## Quality and DX tools

- **[Lefthook](https://github.com/evilmartians/lefthook)**: Manages Git hooks (pre-commit, pre-push) defined in `lefthook.yml` at the repository root.
- **[Ultracite](https://www.ultracite.ai)**: Ensures accessibility and code style rules.
- **[Turbo](https://turborepo.com/)**: Used for fast monorepo builds, caching, and running tasks efficiently across packages.

## Additional Resources

If needed, open an issue. You can also join the [GitHub discussions](https://github.com/zap-studio/monorepo/discussions) or the [Discord](https://discord.gg/24hXMC3eAa).

Thanks for helping make Zap Studio better!
