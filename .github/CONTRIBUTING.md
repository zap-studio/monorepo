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
   - Run `vp install` from the workspace root.

## Project Structure

- **`packages/fetch`** - Modern HTTP client (`@zap-studio/fetch`)
- **`packages/waitlist`** - Waitlist management (`@zap-studio/waitlist`)
- **`packages/webhooks`** - Webhook handling (`@zap-studio/webhooks`)
- **`apps/docs`** - Documentation site (Fumadocs)
- **`configs/`** - Shared configurations

## Running Tests

- Run `vp run test` from the root to execute the package test suites.
- Run `vp run test:coverage` to generate and merge package coverage reports.
- Run `vp run build` to build packages and the docs app.
- Run `vp run validate` before opening a PR to run the root check plus the build and package test flow.

## Making Changes

- Make your changes in a dedicated branch.
- Ensure your code passes `vp run validate`.

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

- **[Vite+](https://viteplus.dev/)**: Handles installs, checks, staged fixes, package/docs task orchestration, and test workflows.

## Additional Resources

If needed, open an issue. You can also join the [GitHub discussions](https://github.com/zap-studio/monorepo/discussions) or the [Discord](https://discord.gg/24hXMC3eAa).

Thanks for helping make Zap Studio better!
