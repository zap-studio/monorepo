# Getting Started

This guide walks you through setting up Local.ts and running your first build.

::: info
Local.ts comes with pre-made components like the sidebar. These are entirely customizable and exist to help you start building faster—feel free to modify or replace them as needed.
:::

## Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js** (v18 or later) — [nodejs.org](https://nodejs.org/)
- **Rust** — [rust-lang.org](https://www.rust-lang.org/tools/install)
- **pnpm** (recommended) – [pnpm.io](https://www.pnpm.io/)
- **Turbo** — [turborepo.com](https://turborepo.com/)

::: tip
For database migrations, optionally install Diesel CLI:
```bash
cargo install diesel_cli
```
:::

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/zap-studio/local.ts.git my-app
cd my-app
```

### 2. Install Dependencies

```bash
pnpm install
```

This installs npm packages.

### 3. Run in Development Mode

```bash
turbo tauri -- dev
```

This starts the Vite development server with hot reload and opens your app in a native window. Changes to your React code will update instantly.

## Building for Production

Create a production build for your current platform:

```bash
turbo tauri -- build
```

The output will be in `src-tauri/target/release/bundle/` with platform-specific installers.

## Customizing Your App

After cloning, update these files to match your project:

### Project Identity

| File | Fields to Update |
|------|------------------|
| `package.json` | `name`, `version`, `description` |
| `index.html` | `title` |
| `src/constants/index.ts` | `APP_TITLE` |
| `src-tauri/Cargo.toml` | `name`, `version`, `description`, `authors` |
| `src-tauri/tauri.conf.json` | `productName`, `version`, `identifier` |
| `splash.html` | App name and description text |

## Available Run Scripts

Local.ts includes several scripts to streamline your development workflow.

| Command | Description |
|---------|-------------|
| `turbo dev` | Start Vite dev server (frontend only) |
| `turbo tauri dev` | Start full app with hot reload |
| `turbo tauri build` | Build for production |
| `turbo check` | TypeScript type checking |
| `turbo lint` | Run linter |
| `turbo format` | Format code |
| `turbo test` | Run tests |
| `turbo validate` | Run build, check, lint, and test to validate everything passes |

::: tip
The `validate` script is useful before committing or deploying—it ensures your code builds correctly and passes all quality checks in one command.
:::

## What's Next?

Ready to dive deeper? Explore the guides to learn about specific features like [Settings](/local-ts/settings), [Database](/local-ts/database), and [System Tray](/local-ts/system-tray).
