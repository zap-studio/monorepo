# Local.ts

A starter kit for building local-first applications for desktop and mobile.

## What is Local.ts?

Local.ts is a production-ready template for building cross-platform desktop applications with a local-first architecture.

Your data stays on the user's device, always available offline, with native performance and a small bundle size.

Built with **React**, **TypeScript**, **Tauri**, and **Rust**, Local.ts provides everything you need to ship a polished desktop app: persistent settings, system tray integration, notifications, database storage, and more.

::: tip
Since Local.ts relies heavily on Tauri, we highly recommend checking the [Tauri documentation](https://tauri.app/develop/) for deeper understanding of the platform and advanced customization options.
:::

## Features

- **Local-first** — Your data stays on the device, always available offline
- **Cross-platform** — Build for macOS, Windows, Linux, iOS, and Android
- **Lightweight** — Native performance with a small bundle size
- **Secure** — Built-in Content Security Policy and Tauri's security model

### Built-in Functionality

| Feature | Description |
|---------|-------------|
| [Settings](/local-ts/settings) | Persistent settings with theme, behavior, and developer options |
| [System Tray](/local-ts/system-tray) | Background operation with show/hide and quit actions |
| [Notifications](/local-ts/notifications) | Native notifications with permission handling |
| [Database](/local-ts/database) | SQLite with Diesel ORM and automatic migrations |
| [Theming](/local-ts/theming) | Light, dark, and system theme modes |
| [Logging](/local-ts/logging) | Multi-target logging to console, webview, and files |
| [Window State](/local-ts/window-state) | Remember window size and position across restarts |
| [Autostart](/local-ts/autostart) | Launch at login with user-configurable settings |
| [Splash Screen](/local-ts/splash-screen) | Elegant loading screen while app initializes |

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/zap-studio/local.ts.git my-app
cd my-app
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Run the Development Server

```bash
pnpm tauri dev
```

Your app will open in a native window with hot reload enabled.

## Project Structure

```text
local.ts/
├── src/                    # Frontend React code
│   ├── components/         # UI components
│   ├── routes/             # TanStack Router pages
│   ├── stores/             # Zustand state management
│   ├── lib/                # Utilities and Tauri API wrappers
│   └── constants/          # App configuration
├── src-tauri/              # Rust backend
│   ├── src/
│   │   ├── commands/       # Tauri commands (API endpoints)
│   │   ├── database/       # Diesel ORM models and schema
│   │   ├── services/       # Business logic and database operations
│   │   └── plugins/        # Plugin configurations
│   └── migrations/         # Database migrations
└── public/                 # Static assets
```

## What's Next?

With all these features built-in, Local.ts gives you everything needed to start building production-ready local-first applications.

Explore the individual feature guides to learn more about each capability, customize them for your needs, and ship your first offline-capable desktop app.
