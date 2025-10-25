# Turborepo Generators Guide

This document explains how to use [Turborepo](https://turborepo.com/) generators to quickly scaffold new packages and configurations in the Zap Studio monorepo.

## Overview

[Turborepo Generators](https://turborepo.com/docs/guides/generating-code/) use [Plop](https://plopjs.com/) under the hood to create boilerplate code with interactive prompts.

**Why use generators:**
- **Consistency** - All packages follow the same structure
- **Speed** - Create new packages in seconds, not minutes
- **Best practices** - Templates include proper setup out of the box
- **Less error-prone** - No missing files or configuration

## Available Generators

We have two main generators configured:

1. **`package`** - Create a new package in `packages/`
2. **`config`** - Create a new config package in `configs/`

## Creating a New Package

### Interactive Mode

From the monorepo root:

```bash
pnpm turbo gen package
```

This will:
1. Prompt for package name
2. Generate the package structure
3. Create all necessary files
4. Install dependencies

### What Gets Generated

```
packages/
  your-package/
    package.json          # Package configuration
    tsconfig.json         # TypeScript config
    tsdown.config.ts      # Build configuration
    vitest.config.ts      # Test configuration
    src/
      index.ts            # Main entry point
    tests/
      index.test.ts       # Test file
```

### Example

```bash
$ pnpm turbo gen package

? What is the name of the package? › analytics

✔ Created packages/analytics/package.json
✔ Created packages/analytics/tsconfig.json
✔ Created packages/analytics/tsdown.config.ts
✔ Created packages/analytics/vitest.config.ts
✔ Created packages/analytics/src/index.ts
✔ Created packages/analytics/tests/index.test.ts

✨ Package @zap-studio/analytics created!

Next steps:
  cd packages/analytics
  pnpm install
  pnpm build
```

## Creating a Config Package

### Interactive Mode

```bash
pnpm turbo gen config
```

Config packages are for shared configurations (TypeScript, ESLint, Vitest, etc.).

### What Gets Generated

```
configs/
  your-config/
    package.json          # Config package configuration
    tsconfig.json         # TypeScript config
    src/
      index.ts            # Config exports
```

### Example

```bash
$ pnpm turbo gen config

? What is the name of the config package? › biome-config

✔ Created configs/biome-config/package.json
✔ Created configs/biome-config/tsconfig.json
✔ Created configs/biome-config/src/index.ts

✨ Config @zap-studio/biome-config created!
```

## Generator Configuration

The generator configuration lives in `turbo/generators/config.ts`:

```typescript
import type { PlopTypes } from "@turbo/gen";
import { createGenerator } from "./utils";

export default function generator(plop: PlopTypes.NodePlopAPI): void {
  // Package generator
  createGenerator(plop, "package", {
    directory: "packages",
    description: "Create a new package in the packages directory",
    promptMessage: "What is the name of the package?",
    additionalActions: [
      {
        type: "add",
        path: "packages/{{ name }}/src/index.ts",
        templateFile: "templates/package/src/index.ts.hbs",
      },
    ],
  });

  // Config generator
  createGenerator(plop, "config", {
    directory: "configs",
    description: "Create a new config package in the configs directory",
    promptMessage: "What is the name of the config package?",
    additionalActions: [
      {
        type: "add",
        path: "configs/{{ name }}/src/index.ts",
        templateFile: "templates/config/src/index.ts.hbs",
      },
    ],
  });
}
```

## Template Structure

Templates use [Handlebars](https://handlebarsjs.com/) syntax and live in `turbo/generators/templates/`:

```
turbo/
  generators/
    config.ts
    utils.ts
    templates/
      package/
        package.json.hbs
        tsconfig.json.hbs
        tsdown.config.ts.hbs
        vitest.config.ts.hbs
        CHANGELOG.md.hbs
        src/
          index.ts.hbs
        tests/
          index.test.ts.hbs
      config/
        package.json.hbs
        tsconfig.json.hbs
        src/
          index.ts.hbs
```

### Example Template: `package.json.hbs`

```handlebars
{
  "name": "@zap-studio/{{ name }}",
  "version": "0.0.0",
  "description": "{{ description }}",
  "type": "module",
  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "files": ["dist"],
  "scripts": {
    "build": "tsdown",
    "dev": "tsdown --watch",
    "test": "vitest run",
    "test:watch": "vitest",
    "check-types": "tsc --noEmit"
  },
  "keywords": ["{{ name }}"],
  "author": "Zap Studio",
  "license": "MIT",
  "devDependencies": {
    "@zap-studio/tsdown-config": "workspace:*",
    "@zap-studio/typescript-config": "workspace:*",
    "@zap-studio/vitest-config": "workspace:*",
    "tsdown": "^0.3.0",
    "typescript": "^5.7.3",
    "vitest": "^3.2.9"
  }
}
```

### Variables Available in Templates

- `{{ name }}` - Package name (e.g., "analytics")
- `{{ description }}` - Package description (if prompted)

## Customizing Templates

### Modify Existing Templates

Edit files in `turbo/generators/templates/`:

```bash
# Edit package template
code turbo/generators/templates/package/package.json.hbs

# Changes apply to all new packages generated
```

### Add New Files to Templates

In `config.ts`, add to `additionalActions`:

```typescript
createGenerator(plop, "package", {
  directory: "packages",
  // ...
  additionalActions: [
    {
      type: "add",
      path: "packages/{{ name }}/README.md",
      templateFile: "templates/package/README.md.hbs",
    },
    {
      type: "add",
      path: "packages/{{ name }}/.gitignore",
      template: "dist\nnode_modules\ncoverage",
    },
  ],
});
```

### Add Custom Prompts

Extend the generator with additional prompts:

```typescript
plop.setGenerator("package-with-deps", {
  description: "Create a package with dependencies",
  prompts: [
    {
      type: "input",
      name: "name",
      message: "Package name:",
    },
    {
      type: "checkbox",
      name: "dependencies",
      message: "Select dependencies:",
      choices: ["zod", "react", "axios"],
    },
  ],
  actions: [
    // Generate based on selections
  ],
});
```

## Real-World Examples

### Creating a New API Client Package

```bash
$ pnpm turbo gen package

? What is the name of the package? › stripe

# Generated structure:
packages/
  stripe/
    src/
      index.ts          # Export Stripe client
    tests/
      index.test.ts     # Test Stripe integration
    package.json        # Include stripe as dependency
    tsconfig.json
    vitest.config.ts
```

**Next steps:**

```bash
cd packages/stripe

# Add Stripe SDK
pnpm add stripe

# Add to src/index.ts
export { createStripeClient } from "./client";

# Write tests
# Build
pnpm build
```

### Creating a Shared TypeScript Config

```bash
$ pnpm turbo gen config

? What is the name of the config package? › typescript-config-strict

# Generated structure:
configs/
  typescript-config-strict/
    src/
      index.ts
    package.json
    tsconfig.json
```

**Customize the config:**

```typescript
// configs/typescript-config-strict/src/index.ts
export default {
  compilerOptions: {
    strict: true,
    noUncheckedIndexedAccess: true,
    noImplicitOverride: true,
    // ... other strict options
  },
};
```

## Best Practices

### 1. Keep Templates Up to Date

When you update project conventions:
- Update templates immediately
- Regenerate existing packages if needed
- Document changes

### 2. Use Generators for All New Packages

Don't manually create packages:
- Use generators for consistency
- If generator is missing something, update it
- Share improvements with the team

### 3. Include Documentation in Templates

Add README templates:

```handlebars
# @zap-studio/{{ name }}

{{ description }}

## Installation

\`\`\`bash
pnpm add @zap-studio/{{ name }}
\`\`\`

## Usage

\`\`\`typescript
import { } from "@zap-studio/{{ name }}";
\`\`\`

## API

... (auto-generated documentation)
```

### 4. Validate Generated Code

After generation:
- Run linter: `pnpm lint`
- Run type check: `pnpm check-types`
- Run tests: `pnpm test`
- Build: `pnpm build`

### 5. Version Control Templates

- Commit template changes
- Review template changes in PRs
- Document template changes in commit messages

## Integration with Turborepo

Generators work seamlessly with Turborepo:

```bash
# Generate package
pnpm turbo gen package

# Turborepo automatically detects new package
pnpm build

# New package is included in the build graph
```

## References

- [Turborepo Generators](https://turborepo.com/docs/guides/generating-code/)
- [Plop Documentation](https://plopjs.com/documentation/)
- [Handlebars Documentation](https://handlebarsjs.com/)

## Questions?

If you have questions about generators:
1. Check this guide first
2. Review existing templates in `turbo/generators/templates/`
3. Look at `turbo/generators/config.ts`
4. Ask in team discussions
