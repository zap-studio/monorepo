# Code Quality

Local.ts comes with a complete code quality setup using modern, fast tooling. This guide covers linting, formatting, testing, and the monorepo task runner.

## Ultracite

[Ultracite](https://www.ultracite.ai/) is a zero-configuration linter and formatter preset designed to enforce high code quality standards.

It can unify linting and formatting using different engines, such as Biome, Prettier with ESLint, or the oxlint and oxfmt tools.

In this project, we use the oxlint + oxfmt combo for fast, modern linting and formatting.

### Why Ultracite?

- **Fast** — Rust-based engine runs in milliseconds
- **Zero-config** — Sensible defaults out of the box
- **Unified** — Linting and formatting in one tool
- **Auto-fix** — Most issues are automatically fixable

### Commands

```bash
# Format and fix all issues
pnpm dlx ultracite fix

# Check for issues without fixing
pnpm dlx ultracite check

# Diagnose setup issues
pnpm dlx ultracite doctor
```

Or using Turborepo:

```bash
turbo format   # Fix issues
turbo lint     # Check issues
```

### Configuration

Ultracite works with oxlint under the hood. The configuration is in `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "extends": ["ultracite/oxlint/core", "ultracite/oxlint/react"]
}
```

The presets include rules for:
- TypeScript best practices
- React hooks and accessibility
- Modern JavaScript patterns
- Security and performance

### Pre-commit Hooks

Local.ts uses Lefthook to run Ultracite on staged files before each commit:

```yaml
# lefthook.yml
pre-commit:
  jobs:
    - run: pnpm dlx ultracite fix
      glob:
        - "*.js"
        - "*.jsx"
        - "*.ts"
        - "*.tsx"
        - "*.json"
        - "*.jsonc"
        - "*.css"
      stage_fixed: true
```

This ensures all committed code passes linting and formatting checks.

## Testing with Vitest

Local.ts uses [Vitest](https://vitest.dev/) for testing. Vitest is a fast, Vite-native test runner with a Jest-compatible API.

### Running Tests

```bash
# Run tests once
turbo test

# Watch mode for development
turbo test:watch

# Generate coverage report
turbo test:coverage

# Open the UI test runner
turbo test:ui
```

### Configuration

Testing is configured in `vite.config.ts`:

```typescript
export default defineConfig({
  // ... other config
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
    },
  },
});
```

### Writing Tests

Create test files with the `.test.ts` or `.test.tsx` extension:

```typescript
import { describe, it, expect } from "vitest";

describe("myFunction", () => {
  it("should return the correct value", () => {
    expect(myFunction(2)).toBe(4);
  });
});
```

### Coverage Reports

Coverage reports are generated in the `coverage/` directory:

- `coverage/index.html` — Interactive HTML report
- Terminal output shows summary

## Turborepo

[Turborepo](https://turbo.build/) orchestrates tasks across the monorepo, handling both the frontend (Vite) and backend (Tauri/Rust) with unified commands and intelligent caching.

### Monorepo Structure

Local.ts is structured as a pnpm workspace with two packages:

```yaml
# pnpm-workspace.yaml
packages:
  - .           # Frontend (React/Vite)
  - ./src-tauri # Backend (Rust/Tauri)
```

This allows Turborepo to run tasks across both packages with a single command.

### Task Configuration

Tasks are defined in `turbo.json`:

```json
{
  "$schema": "https://turborepo.com/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [
        "dist/**",
        "src-tauri/target/release/**",
        "src-tauri/target/debug/**"
      ]
    },
    "check": {
      "dependsOn": ["^check"]
    },
    "dev": {
      "persistent": true,
      "cache": false
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "test": {
      "dependsOn": ["^build"]
    },
    "validate": {
      "dependsOn": ["build", "check", "lint", "test"]
    }
  }
}
```

### Key Concepts

| Concept | Description |
|---------|-------------|
| `dependsOn` | Run dependencies first (e.g., `^build` runs build in all deps) |
| `outputs` | Files to cache for faster subsequent runs |
| `persistent` | Keep running (for dev servers) |
| `cache` | Whether to cache task outputs |

### Caching

Turborepo caches task outputs based on file inputs. When you run a task:

1. Turborepo hashes relevant source files
2. If the hash matches a previous run, it replays cached output
3. If not, it runs the task and caches the result

This dramatically speeds up CI pipelines and repeated local builds.

### Available Commands

| Command | Description |
|---------|-------------|
| `turbo dev` | Start Vite dev server |
| `turbo tauri -- dev` | Start full Tauri app with hot reload |
| `turbo tauri -- build` | Build production app |
| `turbo build` | Build frontend |
| `turbo check` | TypeScript type checking |
| `turbo lint` | Run Ultracite linter |
| `turbo format` | Format code with Ultracite |
| `turbo test` | Run Vitest tests |
| `turbo test:coverage` | Generate coverage report |
| `turbo validate` | Run all checks (build, check, lint, test) |

### The Validate Command

The `validate` task runs all quality checks in the correct order:

```json
{
  "validate": {
    "dependsOn": ["build", "check", "lint", "test"]
  }
}
```

Use it before committing or in CI:

```bash
turbo validate
```

This ensures your code:
- Builds successfully
- Passes TypeScript checks
- Passes linting rules
- Passes all tests

## CI Integration

In your CI pipeline, leverage Turborepo's caching:

```yaml
# Example GitHub Actions workflow
- name: Install dependencies
  run: pnpm install

- name: Validate
  run: turbo validate
```

Turborepo will cache build artifacts between runs, significantly reducing CI times after the first build.

### Remote Caching

For team environments, enable [Turborepo Remote Caching](https://turbo.build/repo/docs/core-concepts/remote-caching) to share cache across machines:

```bash
turbo login
turbo link
```

This allows team members to benefit from each other's cached builds.
