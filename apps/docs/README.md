# Zap.ts Docs ⚡️

The official documentation for [Zap.ts](https://github.com/alexandretrotel/zap.ts) - build applications as fast as a zap.

## Overview

This repository contains the documentation site for Zap.ts, built with [VitePress](https://vitepress.dev/). Zap.ts is a modern boilerplate that accelerates web application development with a turbocharged stack and built-in features.

## Features

- **Built-in Auth ⚡️**: Secure email/password + OAuth with Better Auth
- **AI-Ready ⚡️**: Vercel AI SDK with persisted Zustand store
- **Typesafe Frontend & Backend ⚡️**: End-to-end TypeScript with oRPC and Drizzle ORM
- **Turbocharged Stack ⚡️**: Next.js, shadcn/ui, oRPC and SWR
- **Database Magic ⚡️**: Neon PostgreSQL + Drizzle ORM
- **Email & Payments ⚡️**: React Email + Resend and Polar.sh placeholders

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/alexandretrotel/zap-ts-docs.git
```

2. Install dependencies:

```bash
pnpm install
```

3. Run development server:

```bash
pnpm docs:dev
```

4. Build for production:

```bash
pnpm docs:build
```

5. Preview the built site:

```bash
pnpm docs:preview
```

## Project Structure

- `index.md`: Home page configuration
- `docs/`: Documentation content
  - `[page].md`: Any page of the documentation
- `.vitepress/config.mts`: VitePress configuration
- `package.json`: Project dependencies and scripts

## Development

The documentation uses VitePress and includes:

- Syntax highlighting with Shiki
- Custom containers (info, tip, warning, danger, details)
- Runtime API examples
- TypeScript configuration
- Custom theme configuration

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Submit a pull request
4. Use the "Edit this page on GitHub" link on any page to suggest changes

## License

Released under the MIT License.
