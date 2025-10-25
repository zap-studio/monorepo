# Linting and Formatting Guide

This document outlines the linting and formatting setup for the Zap Studio monorepo, which uses [Ultracite](https://www.ultracite.ai/) (a curated preset for [Biome](https://biomejs.dev/)).

## Overview

We use **Ultracite** because it's:
- **Fast** - Written in Rust, 10-100x faster than ESLint + Prettier
- **Opinionated** - Curated ruleset that enforces best practices
- **Zero-config** - Works out of the box with sensible defaults
- **All-in-one** - Combines linting and formatting in a single tool
- **Type-aware** - Understands TypeScript, JSX, JSON, and CSS

## What is Ultracite?

Ultracite is a carefully curated configuration preset for Biome that enforces:
- **Strict TypeScript rules** - Type safety, no `any`, proper null checks
- **React best practices** - Hooks rules, accessibility (a11y), proper JSX
- **Modern JavaScript** - ESNext features, proper async/await usage
- **Performance patterns** - Avoiding common performance pitfalls
- **Security rules** - Preventing common security issues

It's designed to catch bugs before they happen and enforce consistent code style across the entire codebase.

## Configuration

### Root Configuration

The monorepo uses a shared configuration in `biome.jsonc`:

```jsonc
{
  "$schema": "./node_modules/@biomejs/biome/configuration_schema.json",
  "extends": ["ultracite"],
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true
  },
  "files": {
    "includes": [
      "**",
      "!**/.source",
      "!apps/docs/src/components/ui",
      "!apps/website/src/components/ui"
    ]
  },
  "css": {
    "parser": {
      "tailwindDirectives": true
    }
  }
}
```

### What This Configures

- **VCS Integration** - Respects `.gitignore` files automatically
- **File Includes** - Defines which files to lint and format
- **CSS Parsing** - Supports Tailwind CSS directives (`@apply`, `@layer`, etc.)
- **Ultracite Preset** - Inherits all Ultracite rules

## Running Lint and Format

### Check for Issues

From the monorepo root:

```bash
# Check all files
pnpm lint

# This runs: npx ultracite check
```

This will:
- Report linting errors
- Report formatting issues
- Show type errors (if type-aware rules are enabled)
- **Not modify any files**

### Auto-fix Issues

```bash
# Fix all auto-fixable issues
pnpm format

# This runs: npx ultracite fix
```

This will:
- Fix all auto-fixable linting errors
- Format all files
- **Modify files in place**

### Check Specific Files

```bash
# Check a specific file
npx ultracite check src/index.ts

# Check a directory
npx ultracite check packages/fetch/src

# Check multiple patterns
npx ultracite check "packages/*/src/**/*.ts"
```

### Fix Specific Files

```bash
# Fix a specific file
npx ultracite fix src/index.ts

# Fix a directory
npx ultracite fix packages/fetch/src
```

## Editor Integration

### VS Code

Ultracite/Biome integrates seamlessly with VS Code:

#### Install Extension

```bash
code --install-extension biomejs.biome
```

Or search for "Biome" in the VS Code extensions marketplace.

### Other Editors

Biome has integrations for:
- **WebStorm/IntelliJ** - Built-in support
- **Neovim** - via LSP
- **Sublime Text** - via LSP
- **Emacs** - via LSP

See Biome [First-party extensions](https://biomejs.dev/guides/editors/first-party-extensions/) and [Third-party extensions](https://biomejs.dev/guides/editors/third-party-extensions/).

## Ignoring Rules

### Inline Ignore

Use sparingly and always with a comment:

```typescript
// biome-ignore lint/suspicious/noExplicitAny: API response not typed yet
const response: any = await fetch("/api/legacy");
```

### File-level Ignore

Add at the top of the file:

```typescript
/* biome-ignore-all lint/suspicious/noExplicitAny: generated file, do not edit */
```

### Configuration-level Ignore

In `biome.jsonc`:

```jsonc
{
  "linter": {
    "rules": {
      "suspicious": {
        "noExplicitAny": "off"
      }
    }
  }
}
```

**Warning:** Only disable rules after team discussion. Most rules catch real bugs.

See Biome [suppressions docs](https://biomejs.dev/analyzer/suppressions/).

## CI/CD Integration

Linting runs automatically on every commit via git hooks (see [Git Hooks Guide](./git-hooks.md)).

### GitHub Actions

```yaml
name: Lint

on:
  pull_request:
    branches: ["**"]

permissions:
  contents: read

jobs:
  lint-monorepo:
    runs-on: ubuntu-latest
    if: github.event.pull_request.draft == false
    steps:
      - uses: actions/checkout@v5

      - name: Setup Biome
        uses: biomejs/setup-biome@v2
        with:
          version: latest

      - name: Setup pnpm
        uses: pnpm/action-setup@v4

      - name: Setup Node.js
        uses: actions/setup-node@v6
        with:
          node-version: "latest"
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run linter on the monorepo
        run: pnpm run lint
```

## Best Practices

### 1. Format Before Committing

Always run format before creating a commit:

```bash
pnpm format
git add .
git commit -m "feat: add new feature"
```

Or let git hooks do it automatically (they're already configured).

### 2. Fix Issues as You Go

Don't accumulate linting errors. Fix them immediately:
- Use the VS Code extension for real-time feedback
- Run `pnpm lint` frequently during development
- Address issues before they accumulate

### 3. Understand Rule Violations

Don't blindly disable rules:
- Read the error message
- Understand why the rule exists
- Fix the underlying issue
- Only disable if absolutely necessary

### 4. Keep Configuration Minimal

The Ultracite preset is comprehensive. Avoid customizing unless necessary:
- Trust the preset
- Discuss with team before adding overrides
- Document why custom rules are needed

## References

- [Ultracite Documentation](https://www.ultracite.ai/)
- [Biome Documentation](https://biomejs.dev/)
- [Biome vs ESLint + Prettier](https://biomejs.dev/blog/biome-wins-prettier-challenge/)
- [Ultracite Rules Reference](https://www.ultracite.ai/preset/core)

## Questions?

If you have questions about linting or formatting:
1. Check this guide first
2. Review the Ultracite/Biome documentation
3. Look at how existing code is formatted
4. Ask in team discussions
