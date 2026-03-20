# Zap Studio

[![CI](https://github.com/zap-studio/monorepo/actions/workflows/ci.yml/badge.svg)](https://github.com/zap-studio/monorepo/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/zap-studio/monorepo/graph/badge.svg?branch=main)](https://codecov.io/gh/zap-studio/monorepo)
[![License](https://img.shields.io/github/license/zap-studio/monorepo)](https://github.com/zap-studio/monorepo/blob/main/LICENSE)

Type-safe, framework-agnostic TypeScript packages for building modern apps.

Documentation: [zapstudio.dev](https://www.zapstudio.dev)

## Packages

| Package                  | Description                                                     | Badges                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ------------------------ | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@zap-studio/fetch`      | Type-safe fetch wrapper with runtime schema validation          | [![npm](https://img.shields.io/npm/v/%40zap-studio%2Ffetch?label=npm)](https://www.npmjs.com/package/@zap-studio/fetch) [![jsr](https://img.shields.io/jsr/v/%40zap-studio%2Ffetch?label=jsr)](https://jsr.io/@zap-studio/fetch) [![downloads](https://img.shields.io/npm/dm/%40zap-studio%2Ffetch?label=downloads)](https://www.npmjs.com/package/@zap-studio/fetch) [![bundle size](https://img.shields.io/bundlephobia/minzip/%40zap-studio%2Ffetch?label=size)](https://bundlephobia.com/package/@zap-studio/fetch)                                         |
| `@zap-studio/permit`     | Declarative authorization policies with Standard Schema support | [![npm](https://img.shields.io/npm/v/%40zap-studio%2Fpermit?label=npm)](https://www.npmjs.com/package/@zap-studio/permit) [![jsr](https://img.shields.io/jsr/v/%40zap-studio%2Fpermit?label=jsr)](https://jsr.io/@zap-studio/permit) [![downloads](https://img.shields.io/npm/dm/%40zap-studio%2Fpermit?label=downloads)](https://www.npmjs.com/package/@zap-studio/permit) [![bundle size](https://img.shields.io/bundlephobia/minzip/%40zap-studio%2Fpermit?label=size)](https://bundlephobia.com/package/@zap-studio/permit)                                 |
| `@zap-studio/validation` | Standard Schema utilities and `ValidationError` helpers         | [![npm](https://img.shields.io/npm/v/%40zap-studio%2Fvalidation?label=npm)](https://www.npmjs.com/package/@zap-studio/validation) [![jsr](https://img.shields.io/jsr/v/%40zap-studio%2Fvalidation?label=jsr)](https://jsr.io/@zap-studio/validation) [![downloads](https://img.shields.io/npm/dm/%40zap-studio%2Fvalidation?label=downloads)](https://www.npmjs.com/package/@zap-studio/validation) [![bundle size](https://img.shields.io/bundlephobia/minzip/%40zap-studio%2Fvalidation?label=size)](https://bundlephobia.com/package/@zap-studio/validation) |
| `@zap-studio/webhooks`   | Type-safe webhook router with verification and lifecycle hooks  | [![npm](https://img.shields.io/npm/v/%40zap-studio%2Fwebhooks?label=npm)](https://www.npmjs.com/package/@zap-studio/webhooks) [![jsr](https://img.shields.io/jsr/v/%40zap-studio%2Fwebhooks?label=jsr)](https://jsr.io/@zap-studio/webhooks) [![downloads](https://img.shields.io/npm/dm/%40zap-studio%2Fwebhooks?label=downloads)](https://www.npmjs.com/package/@zap-studio/webhooks) [![bundle size](https://img.shields.io/bundlephobia/minzip/%40zap-studio%2Fwebhooks?label=size)](https://bundlephobia.com/package/@zap-studio/webhooks)                 |

## Agent Skills

We publish skills with AI-agent workflows in mind.

- Use the Vercel Skills CLI for manual installation.
- We also ship `SKILL.md` files inside npm packages via `@tanstack/intent`, so skill guidance stays versioned with each release.

Official documentation: [Vercel Skills](https://skills.sh/docs) and [TanStack Intent](https://tanstack.com/intent).

Manual install with Vercel Skills:

```bash
npx skills add zap-studio/monorepo
```

Install bundled skills from your installed dependencies with TanStack Intent:

```bash
npx @tanstack/intent install
```
